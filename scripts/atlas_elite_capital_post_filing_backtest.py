#!/usr/bin/env python3
"""ATLAS ELITE CAPITAL SIGNAL Ω — Progeny 3 post-filing falsification.

Question
--------
Does a pre-declared public 13F signal — a NEW position or a >=50% QoQ increase
in shares — outperform the allocator's complete contemporaneous disclosed
control arm AFTER the filing becomes public?

Design constraints
------------------
* Source of holdings: official SEC EDGAR 13F information-table XML.
* Identity key for changes: CUSIP, not ticker, so symbol changes do not create
  false NEW positions.
* Signal time: first trading session strictly after filing date.
* Controls: every other current long-share position in the same quarter.
* No hand-picked negative controls and no bridging across a missing quarter.
* Ticker mapping is used only for public price history; unresolved mappings and
  missing/delisted histories remain missing and reduce coverage.
* A low-coverage result is A1_SAMPLE_INCOMPLETE, never silently promoted.

Outputs: research/executions/elite_capital_post_filing/
"""
from __future__ import annotations

import json
import math
import os
import re
import time
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Tuple

import numpy as np
import pandas as pd
import requests
import yfinance as yf
from bs4 import BeautifulSoup

OUTDIR = Path("research/executions/elite_capital_post_filing")
FILING_CACHE = OUTDIR / "filings.csv"
CUSIP_CACHE = OUTDIR / "cusip_symbol_map.csv"
CIK = "1536006"
SEC_BASE = "https://www.sec.gov/Archives/edgar/data"
UA = "ATLAS-Genesis research github.com/Vicente24051980/atlas_genesis"
HORIZONS = [20, 60, 120, 252]
PRIMARY_HORIZONS = [120, 252]
SIGNAL_INCREASE_THRESHOLD = 0.50
MIN_SIGNAL_CASES = 30
MIN_PRICE_COVERAGE = 0.80
PERMUTATIONS = int(os.getenv("ATLAS_ELITE_PERMUTATIONS", "5000"))
SEED = 20260906

SEC = requests.Session(); SEC.headers.update({"User-Agent": UA, "Accept-Encoding": "gzip, deflate"})
WEB = requests.Session(); WEB.headers.update({"User-Agent": "Mozilla/5.0 (compatible; ATLAS-Genesis research)"})


@dataclass(frozen=True)
class Filing:
    quarter: str
    report_date: pd.Timestamp
    filing_date: pd.Timestamp
    accession: str


def request_text(session: requests.Session, url: str, delay: float = 0.12, attempts: int = 3) -> str:
    last: Optional[Exception] = None
    for i in range(attempts):
        try:
            r = session.get(url, timeout=20)
            if r.status_code in {429, 500, 502, 503, 504}:
                raise requests.HTTPError(f"transient HTTP {r.status_code}", response=r)
            r.raise_for_status(); time.sleep(delay); return r.text
        except Exception as exc:
            last = exc
            if i + 1 < attempts: time.sleep(1.0 * (2 ** i))
    raise RuntimeError(f"GET failed: {url}: {last}")


def load_filings() -> List[Filing]:
    if not FILING_CACHE.exists():
        raise RuntimeError("filings.csv cache absent; prior discovery step is required")
    df = pd.read_csv(FILING_CACHE, dtype=str)
    required = {"quarter", "report_date", "filing_date", "filing_id"}
    if df.empty or not required.issubset(df.columns):
        raise RuntimeError("filings.csv is empty or malformed")
    out = []
    for r in df.itertuples(index=False):
        accession = re.sub(r"\D", "", str(r.filing_id)).zfill(18)
        out.append(Filing(str(r.quarter), pd.Timestamp(r.report_date), pd.Timestamp(r.filing_date), accession))
    return sorted(out, key=lambda f: f.report_date)


def local(tag: str) -> str:
    return tag.rsplit("}", 1)[-1].lower()


def child_text(node: ET.Element, wanted: str) -> Optional[str]:
    wanted = wanted.lower()
    for x in node.iter():
        if local(x.tag) == wanted and x.text is not None:
            return x.text.strip()
    return None


def find_info_xml(f: Filing) -> str:
    folder = f"{SEC_BASE}/{CIK}/{f.accession}"
    idx = json.loads(request_text(SEC, f"{folder}/index.json"))
    items = idx.get("directory", {}).get("item", [])
    xml = [x for x in items if str(x.get("name", "")).lower().endswith(".xml")]
    preferred = [x for x in xml if any(k in str(x.get("name", "")).lower() for k in ("information", "infotable", "13finfo"))]
    pool = preferred or [x for x in xml if "primary" not in str(x.get("name", "")).lower()]
    if not pool:
        raise RuntimeError("no information-table XML found in SEC filing folder")
    # Information tables are normally much larger than the cover XML.
    chosen = max(pool, key=lambda x: int(x.get("size", 0) or 0))
    return f"{folder}/{chosen['name']}"


def parse_sec_holdings(f: Filing) -> pd.DataFrame:
    xml_url = find_info_xml(f)
    root = ET.fromstring(request_text(SEC, xml_url))
    rows = []
    for node in root.iter():
        if local(node.tag) != "infotable":
            continue
        issuer = child_text(node, "nameofissuer") or ""
        cusip = (child_text(node, "cusip") or "").upper().replace(" ", "")
        shares_raw = child_text(node, "sshprnamt")
        shares_type = (child_text(node, "sshprnamttype") or "SH").upper()
        put_call = (child_text(node, "putcall") or "").upper()
        if not cusip or not shares_raw or put_call in {"PUT", "CALL"} or shares_type != "SH":
            continue
        try: shares = float(str(shares_raw).replace(",", ""))
        except ValueError: continue
        if shares < 0: continue
        rows.append({"cusip": cusip, "issuer": issuer, "shares": shares})
    if not rows:
        raise RuntimeError("SEC information table yielded zero long-share rows")
    df = pd.DataFrame(rows).groupby("cusip", as_index=False).agg({"issuer": "first", "shares": "sum"})
    df["quarter"], df["report_date"], df["filing_date"], df["accession"] = f.quarter, f.report_date, f.filing_date, f.accession
    return df


def adjacent_quarters(a: pd.Timestamp, b: pd.Timestamp) -> bool:
    expected = a + pd.offsets.QuarterEnd(); return abs((b - expected).days) <= 3


def build_snapshots(filings: List[Filing]) -> Tuple[List[pd.DataFrame], pd.DataFrame]:
    snapshots, errors = [], []
    for i, f in enumerate(filings, start=1):
        try:
            h = parse_sec_holdings(f); snapshots.append(h); print(f"SEC {i}/{len(filings)} {f.quarter}: {len(h)} long-share CUSIPs")
        except Exception as exc:
            errors.append({"quarter": f.quarter, "report_date": str(f.report_date.date()), "accession": f.accession, "error": str(exc)}); print(f"WARN SEC {f.quarter}: {exc}")
    err = pd.DataFrame(errors)
    if not err.empty: err.to_csv(OUTDIR / "filing_parse_errors.csv", index=False)
    return snapshots, err


def build_event_ledger(snapshots: List[pd.DataFrame]) -> pd.DataFrame:
    by_date = {pd.Timestamp(x["report_date"].iloc[0]): x for x in snapshots if not x.empty}; dates = sorted(by_date); rows, gaps = [], []
    for i in range(1, len(dates)):
        pdate, cdate = dates[i-1], dates[i]
        if not adjacent_quarters(pdate, cdate):
            gaps.append({"prior": str(pdate.date()), "current": str(cdate.date())}); continue
        prev, cur = by_date[pdate].set_index("cusip"), by_date[cdate].set_index("cusip")
        for cusip, r in cur.iterrows():
            shares = float(r.shares)
            if cusip not in prev.index:
                change, action, signal = None, "NEW", True
            else:
                ps = float(prev.loc[cusip, "shares"]); change = (shares / ps - 1.0) if ps > 0 else None
                if change is not None and change >= SIGNAL_INCREASE_THRESHOLD: action, signal = "ACCELERATION_50", True
                elif change is not None and change <= -0.50: action, signal = "REDUCED_50", False
                elif change is not None and change > 0: action, signal = "ADDED_LT50", False
                elif change is not None and change < 0: action, signal = "REDUCED_LT50", False
                else: action, signal = "HELD", False
            rows.append({"quarter": r.quarter, "report_date": r.report_date, "filing_date": r.filing_date, "accession": r.accession, "cusip": cusip, "issuer": r.issuer, "shares": shares, "shares_change_pct": change, "action": action, "positive_signal": signal, "control": not signal})
    if gaps: pd.DataFrame(gaps).to_csv(OUTDIR / "skipped_quarter_gaps.csv", index=False)
    if not rows: raise RuntimeError("no adjacent-quarter events constructed")
    return pd.DataFrame(rows)


def load_symbol_cache() -> Dict[str, Optional[str]]:
    if not CUSIP_CACHE.exists(): return {}
    df = pd.read_csv(CUSIP_CACHE, dtype=str).fillna(""); return {r.cusip: (r.symbol or None) for r in df.itertuples(index=False)}


def parse_filingexplorer_symbol(cusip: str) -> Optional[str]:
    url = f"https://www.filingexplorer.com/cusips/{cusip}"
    try:
        html = request_text(WEB, url, delay=0.08, attempts=2); soup = BeautifulSoup(html, "html.parser"); text = soup.get_text(" ", strip=True)
        patterns = [r"\bSymbol\s+([A-Z][A-Z0-9.\-]{0,9})\b", rf"^([A-Z][A-Z0-9.\-]{{0,9}})\s*[·|—-].*CUSIP\s+{re.escape(cusip)}"]
        for pat in patterns:
            m = re.search(pat, text, re.I)
            if m:
                sym = m.group(1).upper()
                if sym not in {"CUSIP", "SYMBOL", "COMMON", "STOCK"}: return sym
        title = soup.title.get_text(" ", strip=True) if soup.title else ""
        m = re.search(r"^([A-Z][A-Z0-9.\-]{0,9})\b", title)
        if m: return m.group(1).upper()
    except Exception:
        pass
    return None


def yfinance_cusip_fallback(cusip: str) -> Optional[str]:
    try:
        quotes = yf.Search(cusip, max_results=5).quotes
        for q in quotes:
            sym = q.get("symbol"); qt = str(q.get("quoteType", "")).upper()
            if sym and qt in {"EQUITY", "ETF"}: return str(sym).upper()
    except Exception:
        pass
    return None


def resolve_symbols(ledger: pd.DataFrame) -> pd.DataFrame:
    cache = load_symbol_cache(); unique = ledger[["cusip", "issuer"]].drop_duplicates("cusip")
    records = []
    for i, r in enumerate(unique.itertuples(index=False), start=1):
        if r.cusip in cache:
            sym = cache[r.cusip]
        else:
            sym = parse_filingexplorer_symbol(r.cusip) or yfinance_cusip_fallback(r.cusip); cache[r.cusip] = sym
        records.append({"cusip": r.cusip, "issuer": r.issuer, "symbol": sym or ""})
        if i % 25 == 0: print(f"mapped {i}/{len(unique)} CUSIPs")
    pd.DataFrame(records).to_csv(CUSIP_CACHE, index=False)
    out = ledger.merge(pd.DataFrame(records)[["cusip", "symbol"]], on="cusip", how="left"); out["symbol"] = out["symbol"].replace("", np.nan)
    return out


def download_prices(symbols: Iterable[str], start: pd.Timestamp, end: pd.Timestamp) -> Dict[str, pd.Series]:
    symbols = sorted({str(x) for x in symbols if pd.notna(x) and str(x)}); out: Dict[str, pd.Series] = {}
    for i in range(0, len(symbols), 25):
        chunk = symbols[i:i+25]
        try:
            raw = yf.download(chunk, start=(start-pd.Timedelta(days=10)).strftime("%Y-%m-%d"), end=(end+pd.Timedelta(days=10)).strftime("%Y-%m-%d"), auto_adjust=True, progress=False, group_by="column", threads=True)
        except Exception as exc:
            print(f"WARN price chunk: {exc}"); continue
        if raw.empty: continue
        if isinstance(raw.columns, pd.MultiIndex):
            if "Close" not in raw.columns.get_level_values(0): continue
            close = raw["Close"]
            if isinstance(close, pd.Series): close = close.to_frame(name=chunk[0])
            for s in close.columns:
                ser = close[s].dropna().astype(float)
                if ser.index.tz is not None: ser.index = ser.index.tz_localize(None)
                if not ser.empty: out[str(s)] = ser
        elif len(chunk) == 1 and "Close" in raw:
            ser = raw["Close"].dropna().astype(float)
            if ser.index.tz is not None: ser.index = ser.index.tz_localize(None)
            out[chunk[0]] = ser
    return out


def forward_return(series: Optional[pd.Series], filing_date: pd.Timestamp, days: int) -> Optional[float]:
    if series is None or series.empty: return None
    pos = int(series.index.searchsorted(filing_date, side="right")); end = pos + days
    if pos >= len(series) or end >= len(series): return None
    p0, p1 = float(series.iloc[pos]), float(series.iloc[end])
    return p1/p0-1.0 if math.isfinite(p0) and math.isfinite(p1) and p0 > 0 else None


def attach_returns(ledger: pd.DataFrame) -> pd.DataFrame:
    prices = download_prices(set(ledger.symbol.dropna()) | {"SPY"}, ledger.filing_date.min(), pd.Timestamp("2026-09-06"))
    if "SPY" not in prices: raise RuntimeError("SPY price history unavailable")
    rows = []
    for r in ledger.itertuples(index=False):
        rec = r._asdict(); series = prices.get(str(r.symbol)) if pd.notna(r.symbol) else None
        for h in HORIZONS:
            rr, bb = forward_return(series, r.filing_date, h), forward_return(prices["SPY"], r.filing_date, h)
            rec[f"r_{h}"], rec[f"spy_{h}"], rec[f"excess_{h}"] = rr, bb, (rr-bb if rr is not None and bb is not None else None)
        rec["price_available"] = series is not None; rows.append(rec)
    return pd.DataFrame(rows)


def permutation_p(df: pd.DataFrame, h: int, observed: float, rng: np.random.Generator) -> float:
    col = f"excess_{h}"; d = df[["quarter", "positive_signal", col]].dropna(); values = d[col].to_numpy(float); labels = d.positive_signal.to_numpy(bool); qs = d.quarter.to_numpy(str)
    ge = done = 0
    for _ in range(PERMUTATIONS):
        shuffled = labels.copy()
        for q in np.unique(qs):
            idx = np.flatnonzero(qs == q); shuffled[idx] = rng.permutation(shuffled[idx])
        if shuffled.sum() == 0 or (~shuffled).sum() == 0: continue
        ge += int(values[shuffled].mean() - values[~shuffled].mean() >= observed); done += 1
    return (ge+1)/(done+1) if done else float("nan")


def summarize(bt: pd.DataFrame, parse_errors: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, object]]:
    rng = np.random.default_rng(SEED); rows = []
    for h in HORIZONS:
        d = bt[bt[f"excess_{h}"].notna()]; sig = d[d.positive_signal][f"excess_{h}"].astype(float); ctl = d[~d.positive_signal][f"excess_{h}"].astype(float)
        diff = float(sig.mean()-ctl.mean()) if len(sig) and len(ctl) else float("nan"); p = permutation_p(d, h, diff, rng) if math.isfinite(diff) else float("nan")
        rows.append({"horizon_trading_days": h, "signal_n": len(sig), "control_n": len(ctl), "signal_mean_excess": sig.mean() if len(sig) else None, "signal_median_excess": sig.median() if len(sig) else None, "control_mean_excess": ctl.mean() if len(ctl) else None, "control_median_excess": ctl.median() if len(ctl) else None, "difference_mean_excess": diff if math.isfinite(diff) else None, "within_quarter_permutation_p": p if math.isfinite(p) else None})
    s = pd.DataFrame(rows); coverage = float(bt.price_available.mean()); signal_total = int(bt.positive_signal.sum())
    primary = s[s.horizon_trading_days.isin(PRIMARY_HORIZONS)]; valid = primary[(primary.signal_n >= MIN_SIGNAL_CASES) & primary.difference_mean_excess.notna() & primary.within_quarter_permutation_p.notna()]
    good = valid[(valid.difference_mean_excess > 0) & (valid.signal_mean_excess > 0) & (valid.signal_median_excess > 0) & (valid.within_quarter_permutation_p <= .05)]
    if signal_total < MIN_SIGNAL_CASES or coverage < MIN_PRICE_COVERAGE or len(parse_errors) > 0: state = "A1_SAMPLE_INCOMPLETE"
    elif len(good) == len(PRIMARY_HORIZONS): state = "A4_PERSISTENT_POST_PUBLICATION_ALPHA"
    elif len(good) >= 1: state = "A3_WEAK_OR_REGIME_DEPENDENT_ALPHA"
    else: state = "A2_NO_POST_PUBLICATION_ALPHA"
    meta = {"run_id":"ATLAS_ELITE_CAPITAL_POST_FILING_2026-09-06","allocator":"Progeny 3, Inc.","source":"SEC EDGAR official 13F XML; public identifier mapping only for prices","positive_signal_rule":"NEW CUSIP OR QoQ shares increase >=50%","control_rule":"ALL OTHER CURRENT long-share positions in same disclosed quarter","signal_timestamp_rule":"first trading session strictly after 13F filing date","event_rows":len(bt),"signal_rows_total":signal_total,"price_coverage":coverage,"filing_parse_errors":len(parse_errors),"quarters":int(bt.quarter.nunique()),"allocator_skill_state":state,"hard_limits":["13F is a partial U.S. long-book disclosure.","Free public price histories can omit delisted securities; missing data reduce coverage and can only weaken validation.","CUSIP-to-symbol mapping is not used to infer signals; signals are computed on SEC CUSIPs.","SPY excess return is the first-pass market adjustment; the within-quarter signal-vs-control permutation is the primary allocator-skill control.","No result authorizes a BUY or direct ATLAS score change."]}
    return s, meta


def write_report(summary: pd.DataFrame, meta: Dict[str, object]) -> None:
    fmt=lambda x:"—" if pd.isna(x) else f"{float(x):.2%}"; lines=["# ATLAS ELITE CAPITAL SIGNAL Ω — Post-Filing Backtest","",f"**Verdict: {meta['allocator_skill_state']}**","",f"- Quarters in event ledger: {meta['quarters']}",f"- Event rows: {meta['event_rows']}",f"- Positive-signal rows: {meta['signal_rows_total']}",f"- Price coverage: {meta['price_coverage']:.1%}",f"- SEC filing parse errors: {meta['filing_parse_errors']}","","| Horizon | Signal n | Control n | Signal mean excess | Signal median excess | Control mean excess | Difference | Permutation p |","|---:|---:|---:|---:|---:|---:|---:|---:|"]
    for r in summary.itertuples(index=False):
        p="—" if pd.isna(r.within_quarter_permutation_p) else f"{float(r.within_quarter_permutation_p):.4f}"; lines.append(f"| {r.horizon_trading_days}D | {r.signal_n} | {r.control_n} | {fmt(r.signal_mean_excess)} | {fmt(r.signal_median_excess)} | {fmt(r.control_mean_excess)} | {fmt(r.difference_mean_excess)} | {p} |")
    lines += ["","## Interpretation","","The signal is tested only after public filing and against the complete contemporaneous disclosed control arm. Missing/delisted price histories are not imputed as successes or failures.","","## Hard limits",""]+[f"- {x}" for x in meta["hard_limits"]]
    (OUTDIR/"REPORT.md").write_text("\n".join(lines)+"\n",encoding="utf-8")


def main() -> None:
    OUTDIR.mkdir(parents=True,exist_ok=True); filings=load_filings(); snapshots,errors=build_snapshots(filings); ledger=build_event_ledger(snapshots); ledger.to_csv(OUTDIR/"event_ledger_sec.csv",index=False); ledger=resolve_symbols(ledger); bt=attach_returns(ledger); bt.to_csv(OUTDIR/"event_ledger_with_returns.csv",index=False); summary,meta=summarize(bt,errors); summary.to_csv(OUTDIR/"horizon_summary.csv",index=False); (OUTDIR/"summary.json").write_text(json.dumps(meta,indent=2),encoding="utf-8"); write_report(summary,meta); print(json.dumps(meta,indent=2)); print(summary.to_string(index=False))


if __name__ == "__main__": main()
