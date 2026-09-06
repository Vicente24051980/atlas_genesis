#!/usr/bin/env python3
"""ATLAS ELITE CAPITAL SIGNAL Ω — post-filing backtest with full-quarter controls.

Falsification target
--------------------
Test whether a pre-defined public 13F signal from Progeny 3 (NEW position or
>=50% QoQ increase in shares) has post-publication alpha versus every other
contemporaneous disclosed holding. Controls are never hand-picked ex post.

Public timing
-------------
The signal becomes tradeable only on the first trading session strictly AFTER
the 13F filing date. Quarter-end prices are never treated as public information.

Source discipline
-----------------
13f.info is used only as a SEC-derived ticker/holding presentation layer because
SEC 13F information tables contain CUSIPs but no exchange tickers. Filing
metadata are cached to avoid repeatedly crawling filing pages. Every unavailable
quarter is logged. Event changes are computed ONLY for adjacent successfully
parsed quarters; a missing quarter is never bridged as if it were QoQ.

Outputs: research/executions/elite_capital_post_filing/
"""
from __future__ import annotations

import io
import json
import math
import os
import re
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Tuple
from urllib.parse import urljoin

import numpy as np
import pandas as pd
import requests
import yfinance as yf
from bs4 import BeautifulSoup

MANAGER_URL = "https://13f.info/manager/0001536006-progeny-3-inc"
OUTDIR = Path("research/executions/elite_capital_post_filing")
FILING_CACHE = OUTDIR / "filings.csv"
USER_AGENT = "ATLAS-Research/1.0 github.com/Vicente24051980/atlas_genesis"
HORIZONS = [20, 60, 120, 252]
PRIMARY_HORIZONS = [120, 252]
SIGNAL_INCREASE_THRESHOLD = 0.50
MIN_SIGNAL_CASES = 30
MIN_PRICE_COVERAGE = 0.80
PERMUTATIONS = int(os.getenv("ATLAS_ELITE_PERMUTATIONS", "5000"))
SEED = 20260906
REQUEST_DELAY = float(os.getenv("ATLAS_13F_REQUEST_DELAY", "0.45"))

SESSION = requests.Session()
SESSION.headers.update({"User-Agent": USER_AGENT, "Accept": "text/html,application/xhtml+xml"})


@dataclass
class Filing:
    url: str
    filing_id: str
    report_date: pd.Timestamp
    filing_date: pd.Timestamp
    quarter_label: str


def get(url: str, attempts: int = 4) -> str:
    last: Optional[Exception] = None
    for attempt in range(attempts):
        try:
            r = SESSION.get(url, timeout=15)
            if r.status_code in {429, 500, 502, 503, 504}:
                raise requests.HTTPError(f"transient HTTP {r.status_code}", response=r)
            r.raise_for_status()
            time.sleep(REQUEST_DELAY)
            return r.text
        except Exception as exc:
            last = exc
            if attempt + 1 < attempts:
                time.sleep(1.25 * (2 ** attempt))
    raise RuntimeError(f"GET failed after {attempts} attempts: {url}: {last}")


def parse_date(text: str) -> pd.Timestamp:
    return pd.Timestamp(pd.to_datetime(text.strip(), errors="raise")).normalize()


def filings_from_cache() -> List[Filing]:
    if not FILING_CACHE.exists():
        return []
    df = pd.read_csv(FILING_CACHE)
    required = {"quarter", "report_date", "filing_date", "filing_id", "url"}
    if not required.issubset(df.columns) or df.empty:
        return []
    out = [
        Filing(
            url=str(r.url), filing_id=str(r.filing_id),
            report_date=parse_date(str(r.report_date)),
            filing_date=parse_date(str(r.filing_date)),
            quarter_label=str(r.quarter),
        )
        for r in df.itertuples(index=False)
    ]
    print(f"loaded {len(out)} filing metadata rows from cache")
    return sorted(out, key=lambda x: x.report_date)


def discover_filings() -> List[Filing]:
    cached = filings_from_cache()
    if cached:
        return cached

    html = get(MANAGER_URL)
    soup = BeautifulSoup(html, "html.parser")
    seen_urls = set()
    candidates: List[str] = []
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if href.startswith("/13f/") and "progeny-3-inc" in href:
            url = urljoin(MANAGER_URL, href)
            if url not in seen_urls:
                seen_urls.add(url)
                candidates.append(url)

    filings: List[Filing] = []
    for url in candidates:
        try:
            page = get(url, attempts=2)
            text = BeautifulSoup(page, "html.parser").get_text("\n", strip=True)
            report_m = re.search(r"Holdings as of\s*([0-9]{1,2}/[0-9]{1,2}/[0-9]{4})", text, re.I)
            filing_m = re.search(r"Date filed\s*([0-9]{1,2}/[0-9]{1,2}/[0-9]{4})", text, re.I)
            if not report_m or not filing_m:
                continue
            report_date = parse_date(report_m.group(1))
            filing_date = parse_date(filing_m.group(1))
            filing_id_m = re.search(r"/13f/([0-9]+)-", url)
            filing_id = filing_id_m.group(1) if filing_id_m else url.rsplit("/", 1)[-1]
            q = ((report_date.month - 1) // 3) + 1
            filings.append(Filing(url, filing_id, report_date, filing_date, f"{report_date.year}Q{q}"))
        except Exception as exc:
            print(f"WARN discover {url}: {exc}")

    if not filings:
        raise RuntimeError("No Progeny 3 filings discovered")
    by_report: Dict[pd.Timestamp, Filing] = {}
    for f in filings:
        prev = by_report.get(f.report_date)
        if prev is None or f.filing_date >= prev.filing_date:
            by_report[f.report_date] = f
    return sorted(by_report.values(), key=lambda x: x.report_date)


def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy(); df.columns = [str(c).strip() for c in df.columns]; return df


def parse_holdings(filing: Filing) -> pd.DataFrame:
    html = get(filing.url)
    tables = pd.read_html(io.StringIO(html))
    target = None
    for t in tables:
        t = normalize_columns(t); cols = {c.lower() for c in t.columns}
        if any(c in cols for c in ["sym", "symbol", "ticker"]) and any("share" in c for c in cols):
            target = t; break
    if target is None: raise RuntimeError("No holdings table parsed")

    rename = {}
    for c in target.columns:
        cl = c.lower()
        if cl in {"sym", "symbol", "ticker"}: rename[c] = "ticker"
        elif cl.startswith("issuer"): rename[c] = "issuer"
        elif "share" in cl and "principal" not in cl: rename[c] = "shares"
        elif "option" in cl: rename[c] = "option_type"
        elif cl == "%": rename[c] = "weight_pct"
        elif "value" in cl: rename[c] = "value_k"
    target = target.rename(columns=rename)
    if "ticker" not in target or "shares" not in target:
        raise RuntimeError(f"Required ticker/shares fields absent: {list(target.columns)}")
    target["ticker"] = target["ticker"].astype(str).str.strip()
    target = target[~target["ticker"].isin(["", "nan", "None", "N/A", "n/a"])]
    if "option_type" in target:
        opt = target["option_type"].astype(str).str.strip().str.upper(); target = target[opt.isin(["", "NAN", "NONE"])]
    target["shares"] = target["shares"].astype(str).str.replace(",", "", regex=False).str.replace(r"[^0-9.\-]", "", regex=True)
    target["shares"] = pd.to_numeric(target["shares"], errors="coerce")
    target = target[target["shares"].notna() & (target["shares"] >= 0)]
    agg: Dict[str, str] = {"shares": "sum"}
    if "issuer" in target: agg["issuer"] = "first"
    if "value_k" in target:
        target["value_k"] = pd.to_numeric(target["value_k"].astype(str).str.replace(r"[^0-9.\-]", "", regex=True), errors="coerce"); agg["value_k"] = "sum"
    out = target.groupby("ticker", as_index=False).agg(agg)
    out["report_date"], out["filing_date"], out["quarter"], out["filing_id"] = filing.report_date, filing.filing_date, filing.quarter_label, filing.filing_id
    return out


def to_yf_symbol(ticker: str) -> str:
    t = ticker.strip().upper(); explicit = {"BRKB": "BRK-B", "BRKA": "BRK-A", "BFB": "BF-B", "BFA": "BF-A"}
    if t in explicit: return explicit[t]
    if ".TO" in t or ".V" in t: return t
    return t.replace(".", "-")


def adjacent_quarters(a: pd.Timestamp, b: pd.Timestamp) -> bool:
    expected = a + pd.offsets.QuarterEnd(); return abs((b - expected).days) <= 3


def build_event_ledger(filings: List[Filing]) -> pd.DataFrame:
    snapshots: List[pd.DataFrame] = []; errors = []
    for n, f in enumerate(filings, start=1):
        try:
            h = parse_holdings(f); snapshots.append(h); print(f"parsed {n}/{len(filings)} {f.quarter_label}: {len(h)} holdings")
        except Exception as exc:
            errors.append({"quarter": f.quarter_label, "report_date": f.report_date, "url": f.url, "error": str(exc)}); print(f"WARN holdings {f.quarter_label}: {exc}")
    OUTDIR.mkdir(parents=True, exist_ok=True)
    if errors: pd.DataFrame(errors).to_csv(OUTDIR / "filing_parse_errors.csv", index=False)
    if len(snapshots) < 2: raise RuntimeError(f"Need at least 2 parsed filings, got {len(snapshots)}")
    snap_by_date = {pd.Timestamp(df["report_date"].iloc[0]): df for df in snapshots}; dates = sorted(snap_by_date)
    rows = []; skipped_gaps = []
    for i in range(1, len(dates)):
        prior_date, cur_date = dates[i - 1], dates[i]
        if not adjacent_quarters(prior_date, cur_date):
            skipped_gaps.append({"prior_report_date": prior_date, "current_report_date": cur_date, "reason": "missing_intermediate_quarter"}); continue
        prev, cur = snap_by_date[prior_date].set_index("ticker"), snap_by_date[cur_date].set_index("ticker")
        for ticker, row in cur.iterrows():
            shares = float(row["shares"])
            if ticker not in prev.index: action, change_pct, positive_signal = "NEW", float("inf"), True
            else:
                prev_shares = float(prev.loc[ticker, "shares"]); change_pct = (shares / prev_shares - 1.0) if prev_shares > 0 else (float("inf") if shares > 0 else 0.0)
                if change_pct >= SIGNAL_INCREASE_THRESHOLD: action, positive_signal = "ACCELERATION_50", True
                elif change_pct <= -0.50: action, positive_signal = "REDUCED_50", False
                elif change_pct > 0.0: action, positive_signal = "ADDED_LT50", False
                elif change_pct < 0.0: action, positive_signal = "REDUCED_LT50", False
                else: action, positive_signal = "HELD", False
            rows.append({"quarter": row["quarter"], "report_date": pd.Timestamp(row["report_date"]), "filing_date": pd.Timestamp(row["filing_date"]), "filing_id": row["filing_id"], "ticker_13f": ticker, "ticker_yf": to_yf_symbol(ticker), "issuer": row.get("issuer", None), "shares": shares, "shares_change_pct": None if not math.isfinite(change_pct) else change_pct, "action": action, "positive_signal": bool(positive_signal), "control": not positive_signal})
    if skipped_gaps: pd.DataFrame(skipped_gaps).to_csv(OUTDIR / "skipped_quarter_gaps.csv", index=False)
    if not rows: raise RuntimeError("No adjacent-quarter event rows could be constructed")
    return pd.DataFrame(rows)


def download_prices(symbols: Iterable[str], start: pd.Timestamp, end: pd.Timestamp) -> Dict[str, pd.Series]:
    symbols = sorted(set(s for s in symbols if s)); out: Dict[str, pd.Series] = {}
    for i in range(0, len(symbols), 30):
        chunk = symbols[i:i + 30]
        raw = yf.download(chunk, start=(start - pd.Timedelta(days=10)).strftime("%Y-%m-%d"), end=(end + pd.Timedelta(days=10)).strftime("%Y-%m-%d"), auto_adjust=True, progress=False, group_by="column", threads=True)
        if raw.empty: continue
        if isinstance(raw.columns, pd.MultiIndex):
            if "Close" not in raw.columns.get_level_values(0): continue
            close = raw["Close"]
            if isinstance(close, pd.Series): close = close.to_frame(name=chunk[0])
            for s in close.columns:
                ser = close[s].dropna().astype(float)
                if ser.index.tz is not None: ser.index = ser.index.tz_localize(None)
                if not ser.empty: out[str(s)] = ser
        else:
            s = chunk[0]
            if "Close" in raw:
                ser = raw["Close"].dropna().astype(float)
                if ser.index.tz is not None: ser.index = ser.index.tz_localize(None)
                out[s] = ser
    return out


def forward_return(series: Optional[pd.Series], filing_date: pd.Timestamp, trading_days: int) -> Optional[float]:
    if series is None or series.empty: return None
    idx = series.index; pos = int(idx.searchsorted(filing_date, side="right")); end_pos = pos + trading_days
    if pos >= len(idx) or end_pos >= len(idx): return None
    p0, p1 = float(series.iloc[pos]), float(series.iloc[end_pos])
    if not (math.isfinite(p0) and math.isfinite(p1) and p0 > 0): return None
    return p1 / p0 - 1.0


def attach_returns(ledger: pd.DataFrame) -> pd.DataFrame:
    price_map = download_prices(set(ledger["ticker_yf"].tolist()) | {"SPY"}, ledger["filing_date"].min(), pd.Timestamp("2026-09-06"))
    if "SPY" not in price_map: raise RuntimeError("SPY benchmark price download failed")
    rows = []
    for _, row in ledger.iterrows():
        rec = row.to_dict(); series = price_map.get(rec["ticker_yf"])
        for h in HORIZONS:
            r, b = forward_return(series, rec["filing_date"], h), forward_return(price_map["SPY"], rec["filing_date"], h)
            rec[f"r_{h}"], rec[f"spy_{h}"], rec[f"excess_{h}"] = r, b, ((r - b) if r is not None and b is not None else None)
        rec["price_available"] = series is not None; rows.append(rec)
    return pd.DataFrame(rows)


def permutation_pvalue(df: pd.DataFrame, horizon: int, observed: float, permutations: int, rng: np.random.Generator) -> float:
    col = f"excess_{horizon}"; d = df[["quarter", "positive_signal", col]].dropna().copy()
    if d.empty: return float("nan")
    values, labels, quarters = d[col].to_numpy(float), d["positive_signal"].to_numpy(bool), d["quarter"].to_numpy(str); unique_q = np.unique(quarters); ge = done = 0
    for _ in range(permutations):
        shuffled = labels.copy()
        for q in unique_q:
            idx = np.flatnonzero(quarters == q); shuffled[idx] = rng.permutation(shuffled[idx])
        if shuffled.sum() == 0 or (~shuffled).sum() == 0: continue
        diff = values[shuffled].mean() - values[~shuffled].mean(); ge += int(diff >= observed); done += 1
    return float((ge + 1) / (done + 1)) if done else float("nan")


def summarize(backtest: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, object]]:
    rng = np.random.default_rng(SEED); rows = []
    for h in HORIZONS:
        col = f"excess_{h}"; d = backtest[backtest[col].notna()].copy(); sig, ctl = d[d["positive_signal"]][col].astype(float), d[~d["positive_signal"]][col].astype(float)
        if len(sig) and len(ctl): diff = float(sig.mean() - ctl.mean()); p = permutation_pvalue(d, h, diff, PERMUTATIONS, rng)
        else: diff = p = float("nan")
        rows.append({"horizon_trading_days": h, "signal_n": int(len(sig)), "control_n": int(len(ctl)), "signal_mean_excess": float(sig.mean()) if len(sig) else None, "signal_median_excess": float(sig.median()) if len(sig) else None, "control_mean_excess": float(ctl.mean()) if len(ctl) else None, "control_median_excess": float(ctl.median()) if len(ctl) else None, "difference_mean_excess": diff if math.isfinite(diff) else None, "within_quarter_permutation_p": p if math.isfinite(p) else None})
    summary_df = pd.DataFrame(rows); event_count = len(backtest); signal_total = int(backtest["positive_signal"].sum()); coverage = float(backtest["price_available"].mean()) if event_count else 0.0
    primary = summary_df[summary_df["horizon_trading_days"].isin(PRIMARY_HORIZONS)]; valid_primary = primary[(primary["signal_n"] >= MIN_SIGNAL_CASES) & primary["difference_mean_excess"].notna() & primary["within_quarter_permutation_p"].notna()]
    significant_positive = valid_primary[(valid_primary["difference_mean_excess"] > 0) & (valid_primary["signal_mean_excess"] > 0) & (valid_primary["signal_median_excess"] > 0) & (valid_primary["within_quarter_permutation_p"] <= 0.05)]
    if signal_total < MIN_SIGNAL_CASES or coverage < MIN_PRICE_COVERAGE: state = "A1_SAMPLE_INCOMPLETE"
    elif len(significant_positive) == len(PRIMARY_HORIZONS): state = "A4_PERSISTENT_POST_PUBLICATION_ALPHA"
    elif len(significant_positive) >= 1: state = "A3_WEAK_OR_REGIME_DEPENDENT_ALPHA"
    else: state = "A2_NO_POST_PUBLICATION_ALPHA"
    meta = {"run_id": "ATLAS_ELITE_CAPITAL_POST_FILING_2026-09-06", "allocator": "Progeny 3, Inc.", "positive_signal_rule": "NEW OR QoQ shares increase >=50%", "control_rule": "ALL OTHER CURRENT POSITIONS IN THE SAME DISCLOSED QUARTER", "signal_timestamp_rule": "first trading session strictly after 13F filing date", "horizons_trading_days": HORIZONS, "permutations": PERMUTATIONS, "event_rows": event_count, "signal_rows_total": signal_total, "price_coverage": coverage, "parsed_quarters": int(backtest["quarter"].nunique()), "allocator_skill_state": state, "hard_limits": ["13F is a partial U.S. long-book disclosure, not total AUM or current flow.", "Missing/delisted price histories are missing, never silently zero-filled.", "13f.info availability can reduce quarter coverage; no missing-quarter bridge is allowed.", "SPY is the first-pass benchmark; sector/factor-matched replication remains required before any durable skill claim.", "Any positive result remains research evidence only and cannot create BUY authority."]}
    return summary_df, meta


def main() -> None:
    OUTDIR.mkdir(parents=True, exist_ok=True); filings = discover_filings()
    pd.DataFrame([{"quarter": f.quarter_label, "report_date": f.report_date.date().isoformat(), "filing_date": f.filing_date.date().isoformat(), "filing_id": f.filing_id, "url": f.url} for f in filings]).to_csv(FILING_CACHE, index=False)
    ledger = build_event_ledger(filings); ledger.to_csv(OUTDIR / "event_ledger_pre_prices.csv", index=False); backtest = attach_returns(ledger); backtest.to_csv(OUTDIR / "event_ledger_with_returns.csv", index=False)
    summary_df, meta = summarize(backtest); summary_df.to_csv(OUTDIR / "horizon_summary.csv", index=False); (OUTDIR / "summary.json").write_text(json.dumps(meta, indent=2), encoding="utf-8")
    md = ["# ATLAS ELITE CAPITAL SIGNAL Ω — Post-Filing Backtest", "", f"**Allocator:** {meta['allocator']}  ", f"**Signal rule:** {meta['positive_signal_rule']}  ", f"**Control:** {meta['control_rule']}  ", f"**Timestamp:** {meta['signal_timestamp_rule']}  ", "", "## Coverage", "", f"- Parsed event quarters: {meta['parsed_quarters']}", f"- Event rows: {meta['event_rows']}", f"- Positive-signal rows: {meta['signal_rows_total']}", f"- Price coverage: {meta['price_coverage']:.1%}", "", "## Results", "", "| Horizon | Signal n | Control n | Signal mean excess | Signal median excess | Control mean excess | Difference | Permutation p |", "|---:|---:|---:|---:|---:|---:|---:|---:|"]
    for _, r in summary_df.iterrows():
        fmt = lambda x: "—" if pd.isna(x) else f"{float(x):.2%}"; p = "—" if pd.isna(r["within_quarter_permutation_p"]) else f"{float(r['within_quarter_permutation_p']):.4f}"
        md.append(f"| {int(r['horizon_trading_days'])}D | {int(r['signal_n'])} | {int(r['control_n'])} | {fmt(r['signal_mean_excess'])} | {fmt(r['signal_median_excess'])} | {fmt(r['control_mean_excess'])} | {fmt(r['difference_mean_excess'])} | {p} |")
    md += ["", f"## Verdict: **{meta['allocator_skill_state']}**", "", "The comparison uses the complete contemporaneous disclosed-quarter control arm. A positive result must occur after public filing; quarter-end performance is not public replicability.", "", "## Hard limits", ""] + [f"- {x}" for x in meta["hard_limits"]]
    (OUTDIR / "REPORT.md").write_text("\n".join(md) + "\n", encoding="utf-8"); print(json.dumps(meta, indent=2)); print(summary_df.to_string(index=False))


if __name__ == "__main__": main()
