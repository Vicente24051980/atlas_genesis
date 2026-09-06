#!/usr/bin/env python3
"""ACCELERATION × RELATIVE RANK MIGRATION Ω — Stage-A falsifier.

Frozen design: see CURRENT_CANON/experiments/
ACCELERATION_RELATIVE_RANK_MIGRATION_PREREGISTRATION_2026-09-06.md

This runner tests whether 12M market-cap rank migration adds forward-return
information after matching on same-quarter size and 12M momentum. It uses
historical S&P 500 membership, not today's constituents backfilled.

Research only. No BUY/sizing/execution authority.
"""
from __future__ import annotations

import json
import math
import os
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Dict, Iterable, Optional, Tuple

import numpy as np
import pandas as pd
import requests
import yfinance as yf

OUT = Path("artifacts/arrm_omega_v1")
OUT.mkdir(parents=True, exist_ok=True)

MEMBERSHIP_URL = "https://raw.githubusercontent.com/hanshof/sp500_constituents/main/sp_500_historical_components.csv"
START_Q = pd.Timestamp("2017-03-31")  # feature lookback support
FIRST_TEST_Q = pd.Timestamp("2018-03-31")
LAST_SIGNAL_Q = pd.Timestamp("2025-12-31")
ASOF = pd.Timestamp("2026-09-06")
PRICE_START = "2016-12-01"
PRICE_END = "2026-09-07"
SEED = 20260906
NULL_REPS = int(os.getenv("ARRM_NULL_REPS", "1000"))
MIN_MCAP_COVERAGE = 0.70
MIN_OUTCOME_COVERAGE = 0.80
MIN_OOS_QUARTERS = 6
TOP_Q = 0.80

# True ticker renames only; mergers/reincorporations are intentionally not aliased.
ALIASES = {
    "FB": "META",
    "ANTM": "ELV",
    "ABC": "COR",
    "RE": "EG",
    "PKI": "RVTY",
}


def qend_range(start: pd.Timestamp, end: pd.Timestamp) -> pd.DatetimeIndex:
    return pd.date_range(start=start, end=end, freq="QE")


def yf_symbol(t: str) -> str:
    t = str(t).strip().upper()
    t = ALIASES.get(t, t)
    return t.replace(".", "-")


def load_membership() -> pd.DataFrame:
    df = pd.read_csv(MEMBERSHIP_URL)
    if not {"date", "tickers"}.issubset(df.columns):
        raise RuntimeError(f"Unexpected membership schema: {list(df.columns)}")
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df = df.dropna(subset=["date", "tickers"]).sort_values("date").drop_duplicates("date", keep="last")
    return df


def membership_at(df: pd.DataFrame, d: pd.Timestamp) -> list[str]:
    eligible = df[df["date"] <= d]
    if eligible.empty:
        return []
    raw = str(eligible.iloc[-1]["tickers"])
    return sorted({yf_symbol(x) for x in raw.split(",") if str(x).strip()})


def download_prices(symbols: Iterable[str]) -> pd.DataFrame:
    syms = sorted(set(symbols) | {"SPY"})
    parts = []
    for i in range(0, len(syms), 60):
        chunk = syms[i:i + 60]
        try:
            raw = yf.download(
                chunk,
                start=PRICE_START,
                end=PRICE_END,
                auto_adjust=False,
                actions=False,
                progress=False,
                threads=True,
                group_by="column",
            )
        except Exception as exc:
            print(f"WARN price chunk {i}: {exc}")
            continue
        if raw.empty:
            continue
        if isinstance(raw.columns, pd.MultiIndex):
            field = "Adj Close" if "Adj Close" in raw.columns.get_level_values(0) else "Close"
            px = raw[field]
            if isinstance(px, pd.Series):
                px = px.to_frame(chunk[0])
        else:
            field = "Adj Close" if "Adj Close" in raw.columns else "Close"
            px = raw[[field]].rename(columns={field: chunk[0]})
        parts.append(px)
    if not parts:
        raise RuntimeError("No price data downloaded")
    out = pd.concat(parts, axis=1)
    out = out.loc[:, ~out.columns.duplicated()].sort_index()
    if out.index.tz is not None:
        out.index = out.index.tz_localize(None)
    return out


def get_shares_one(sym: str) -> Tuple[str, Optional[pd.Series], str]:
    try:
        s = yf.Ticker(sym).get_shares_full(start="2016-01-01", end=PRICE_END)
        if s is None or len(s) == 0:
            return sym, None, "NO_SHARES"
        if isinstance(s, pd.DataFrame):
            s = s.iloc[:, 0]
        s = pd.Series(s).dropna().astype(float)
        if isinstance(s.index, pd.DatetimeIndex) and s.index.tz is not None:
            s.index = s.index.tz_localize(None)
        s = s[~s.index.duplicated(keep="last")].sort_index()
        return sym, s, "OK"
    except Exception as exc:
        return sym, None, f"ERR:{type(exc).__name__}"


def download_shares(symbols: Iterable[str]) -> Tuple[Dict[str, pd.Series], pd.DataFrame]:
    syms = sorted(set(symbols))
    out: Dict[str, pd.Series] = {}
    diag = []
    workers = int(os.getenv("ARRM_SHARE_WORKERS", "8"))
    with ThreadPoolExecutor(max_workers=workers) as ex:
        futs = {ex.submit(get_shares_one, s): s for s in syms}
        for n, fut in enumerate(as_completed(futs), start=1):
            sym, ser, status = fut.result()
            if ser is not None:
                out[sym] = ser
            diag.append({"symbol": sym, "status": status, "points": 0 if ser is None else len(ser)})
            if n % 50 == 0:
                print(f"shares {n}/{len(syms)}")
    return out, pd.DataFrame(diag)


def value_at_or_before(series: Optional[pd.Series], d: pd.Timestamp, max_age_days: Optional[int] = None) -> Optional[float]:
    if series is None or len(series) == 0:
        return None
    s = series.loc[:d].dropna()
    if s.empty:
        return None
    if max_age_days is not None and (d - pd.Timestamp(s.index[-1])).days > max_age_days:
        return None
    v = float(s.iloc[-1])
    return v if math.isfinite(v) and v > 0 else None


def price_at_or_before(prices: pd.DataFrame, sym: str, d: pd.Timestamp, max_age_days: int = 10) -> Optional[float]:
    if sym not in prices.columns:
        return None
    return value_at_or_before(prices[sym], d, max_age_days=max_age_days)


def forward_price(prices: pd.DataFrame, sym: str, start: pd.Timestamp, target: pd.Timestamp) -> Tuple[Optional[float], str]:
    """Use target-date price; if delisted before target, use last observed price after start.

    The latter approximates liquidation at the final quoted price and then cash.
    """
    if sym not in prices.columns:
        return None, "NO_SERIES"
    s = prices[sym].dropna()
    if s.empty:
        return None, "NO_SERIES"
    before_target = s[(s.index > start) & (s.index <= target)]
    if before_target.empty:
        return None, "NO_FORWARD_PRICE"
    last_date = pd.Timestamp(before_target.index[-1])
    val = float(before_target.iloc[-1])
    if not math.isfinite(val) or val <= 0:
        return None, "BAD_FORWARD_PRICE"
    status = "TARGET_OR_NEAR" if (target - last_date).days <= 10 else "DELIST_EXIT_PROXY"
    return val, status


def quintile(s: pd.Series) -> pd.Series:
    # rank-first avoids qcut duplicate-edge failures.
    r = s.rank(method="first", pct=True)
    return np.ceil(r * 5).clip(1, 5).astype("Int64")


def build_panel(membership: pd.DataFrame, prices: pd.DataFrame, shares: Dict[str, pd.Series]) -> pd.DataFrame:
    rows = []
    for q in qend_range(START_Q, LAST_SIGNAL_Q):
        members = membership_at(membership, q)
        for sym in members:
            px = price_at_or_before(prices, sym, q)
            sh = value_at_or_before(shares.get(sym), q, max_age_days=550)
            mcap = px * sh if px is not None and sh is not None else None
            rows.append({"quarter": q, "symbol": sym, "price": px, "shares": sh, "mcap": mcap})
    panel = pd.DataFrame(rows)
    panel["mcap_available"] = panel["mcap"].notna()
    panel["size_pct"] = panel.groupby("quarter")["mcap"].rank(pct=True, method="average")
    panel = panel.sort_values(["symbol", "quarter"])

    # Lags are exact quarter offsets, not row shifts through membership gaps.
    lookup = panel.set_index(["symbol", "quarter"])
    def lag_col(row, col, qlag):
        key = (row.symbol, row.quarter - pd.offsets.QuarterEnd(qlag))
        try:
            v = lookup.loc[key, col]
            if isinstance(v, pd.Series):
                v = v.iloc[-1]
            return float(v) if pd.notna(v) else np.nan
        except KeyError:
            return np.nan

    for qlag in (2, 4):
        panel[f"price_lag{qlag}"] = [lag_col(r, "price", qlag) for r in panel.itertuples(index=False)]
    panel["size_pct_lag4"] = [lag_col(r, "size_pct", 4) for r in panel.itertuples(index=False)]

    panel["rank_migration_12m"] = panel["size_pct"] - panel["size_pct_lag4"]
    panel["mom_12m"] = panel["price"] / panel["price_lag4"] - 1.0
    panel["mom_6m"] = panel["price"] / panel["price_lag2"] - 1.0
    panel["prior_mom_6m"] = panel["price_lag2"] / panel["price_lag4"] - 1.0
    panel["price_accel_6m"] = panel["mom_6m"] - panel["prior_mom_6m"]

    # Cross-sectional bins use only values available at t.
    panel["size_q"] = panel.groupby("quarter")["mcap"].transform(quintile)
    panel["mom_q"] = panel.groupby("quarter")["mom_12m"].transform(quintile)
    panel["rank_pct"] = panel.groupby("quarter")["rank_migration_12m"].rank(pct=True, method="average")
    panel["treatment_h1"] = panel["rank_pct"] >= TOP_Q
    panel["treatment_h2"] = panel["treatment_h1"] & (panel["price_accel_6m"] > 0)
    panel["momentum_top"] = panel.groupby("quarter")["mom_12m"].rank(pct=True, method="average") >= TOP_Q
    return panel


def attach_outcomes(panel: pd.DataFrame, prices: pd.DataFrame) -> pd.DataFrame:
    spy = prices["SPY"].dropna()
    out = []
    for r in panel.itertuples(index=False):
        rec = r._asdict()
        for qsteps, label in [(2, "6m"), (4, "12m")]:
            target = r.quarter + pd.offsets.QuarterEnd(qsteps)
            if target > ASOF:
                rec[f"r_{label}"] = rec[f"spy_{label}"] = rec[f"excess_{label}"] = np.nan
                rec[f"outcome_status_{label}"] = "NOT_MATURE"
                continue
            if r.price is None or pd.isna(r.price) or float(r.price) <= 0:
                rec[f"r_{label}"] = rec[f"spy_{label}"] = rec[f"excess_{label}"] = np.nan
                rec[f"outcome_status_{label}"] = "NO_ENTRY_PRICE"
                continue
            p1, status = forward_price(prices, r.symbol, r.quarter, target)
            spy0 = value_at_or_before(spy, r.quarter, 10)
            spy1 = value_at_or_before(spy, target, 10)
            if p1 is None or spy0 is None or spy1 is None:
                rec[f"r_{label}"] = rec[f"spy_{label}"] = rec[f"excess_{label}"] = np.nan
                rec[f"outcome_status_{label}"] = status
            else:
                rr = p1 / float(r.price) - 1.0
                br = spy1 / spy0 - 1.0
                rec[f"r_{label}"] = rr
                rec[f"spy_{label}"] = br
                rec[f"excess_{label}"] = rr - br
                rec[f"outcome_status_{label}"] = status
        out.append(rec)
    return pd.DataFrame(out)


def matched_quarter_spreads(df: pd.DataFrame, treatment_col: str, outcome_col: str, match_momentum: bool = True) -> pd.DataFrame:
    d = df.dropna(subset=[outcome_col, "size_q", "mom_q", treatment_col]).copy()
    rows = []
    for q, qd in d.groupby("quarter"):
        diffs = []
        treated = qd[qd[treatment_col].astype(bool)]
        for tr in treated.itertuples(index=False):
            ctl = qd[~qd[treatment_col].astype(bool) & (qd["size_q"] == tr.size_q)]
            if match_momentum:
                ctl = ctl[ctl["mom_q"] == tr.mom_q]
            if ctl.empty:
                continue
            diffs.append(float(getattr(tr, outcome_col)) - float(ctl[outcome_col].mean()))
        if diffs:
            rows.append({"quarter": q, "spread": float(np.mean(diffs)), "matched_treatments": len(diffs), "treated_total": len(treated)})
    return pd.DataFrame(rows)


def split_name(q: pd.Timestamp) -> str:
    if q <= pd.Timestamp("2021-12-31"):
        return "train"
    if q <= pd.Timestamp("2023-12-31"):
        return "validation"
    return "oos"


def summarize_spreads(sp: pd.DataFrame) -> dict:
    if sp.empty:
        return {"n_quarters": 0, "mean": None, "median": None, "positive_share": None}
    return {
        "n_quarters": int(len(sp)),
        "mean": float(sp["spread"].mean()),
        "median": float(sp["spread"].median()),
        "positive_share": float((sp["spread"] > 0).mean()),
    }


def permuted_null(panel_oos: pd.DataFrame, outcome_col: str, reps: int, rng: np.random.Generator) -> np.ndarray:
    vals = []
    base = panel_oos.copy()
    for _ in range(reps):
        d = base.copy()
        perm_rank = np.full(len(d), np.nan)
        for _, idx in d.groupby("quarter").groups.items():
            idx = np.array(list(idx), dtype=int)
            arr = d.loc[idx, "rank_migration_12m"].to_numpy(copy=True)
            mask = np.isfinite(arr)
            shuffled = arr.copy()
            shuffled[mask] = rng.permutation(arr[mask])
            perm_rank[idx] = shuffled
        d["_perm_rank"] = perm_rank
        d["_perm_pct"] = d.groupby("quarter")["_perm_rank"].rank(pct=True, method="average")
        d["_perm_treat"] = d["_perm_pct"] >= TOP_Q
        sp = matched_quarter_spreads(d, "_perm_treat", outcome_col, match_momentum=True)
        vals.append(float(sp["spread"].mean()) if not sp.empty else np.nan)
    return np.array(vals, dtype=float)


def random_count_null(panel_oos: pd.DataFrame, outcome_col: str, reps: int, rng: np.random.Generator) -> np.ndarray:
    vals = []
    base = panel_oos.copy()
    treat_counts = base.groupby("quarter")["treatment_h1"].sum().astype(int).to_dict()
    for _ in range(reps):
        d = base.copy(); d["_random_treat"] = False
        for q, idx in d.groupby("quarter").groups.items():
            idx = np.array(list(idx), dtype=int)
            eligible = idx[np.isfinite(d.loc[idx, "rank_migration_12m"].to_numpy())]
            k = min(treat_counts.get(q, 0), len(eligible))
            if k > 0:
                chosen = rng.choice(eligible, size=k, replace=False)
                d.loc[chosen, "_random_treat"] = True
        sp = matched_quarter_spreads(d, "_random_treat", outcome_col, match_momentum=True)
        vals.append(float(sp["spread"].mean()) if not sp.empty else np.nan)
    return np.array(vals, dtype=float)


def empirical_p(null: np.ndarray, observed: float) -> Optional[float]:
    n = null[np.isfinite(null)]
    if len(n) == 0 or not math.isfinite(observed):
        return None
    return float((1 + np.sum(n >= observed)) / (len(n) + 1))


def main() -> None:
    t0 = time.time()
    membership = load_membership()
    qdates = qend_range(START_Q, LAST_SIGNAL_Q)
    membership_map = {q: membership_at(membership, q) for q in qdates}
    symbols = sorted(set(x for v in membership_map.values() for x in v))
    print(f"historical symbols in window: {len(symbols)}")

    prices = download_prices(symbols)
    shares, share_diag = download_shares(symbols)
    share_diag.to_csv(OUT / "share_coverage.csv", index=False)

    panel = build_panel(membership, prices, shares)
    panel = panel[panel["quarter"] >= FIRST_TEST_Q].copy()
    panel = attach_outcomes(panel, prices)
    panel["split"] = panel["quarter"].map(split_name)
    panel.to_csv(OUT / "panel.csv", index=False)

    # Coverage metrics.
    mature6 = panel[panel["quarter"] + pd.offsets.QuarterEnd(2) <= ASOF]
    mcap_cov = float(panel["mcap_available"].mean()) if len(panel) else 0.0
    outcome_cov6 = float(mature6["excess_6m"].notna().mean()) if len(mature6) else 0.0
    quarter_cov = panel.groupby("quarter").agg(mcap_coverage=("mcap_available", "mean"), n=("symbol", "size"), n_mcap=("mcap_available", "sum"))
    quarter_cov.to_csv(OUT / "quarter_coverage.csv")

    result = {
        "experiment_id": "ARRM_OMEGA_V1_2026-09-06",
        "historical_symbol_count": len(symbols),
        "panel_rows": int(len(panel)),
        "market_cap_proxy_coverage": mcap_cov,
        "mature_6m_outcome_coverage": outcome_cov6,
        "null_reps": NULL_REPS,
        "primary": {},
        "secondary": {},
        "momentum_benchmark": {},
    }

    rng = np.random.default_rng(SEED)
    spread_files = []
    for horizon in ["6m", "12m"]:
        outcome = f"excess_{horizon}"
        h1 = matched_quarter_spreads(panel, "treatment_h1", outcome, match_momentum=True)
        h2 = matched_quarter_spreads(panel, "treatment_h2", outcome, match_momentum=True)
        mom = matched_quarter_spreads(panel, "momentum_top", outcome, match_momentum=False)
        for name, df in [(f"h1_{horizon}", h1), (f"h2_{horizon}", h2), (f"momentum_{horizon}", mom)]:
            df["split"] = df["quarter"].map(split_name) if not df.empty else []
            df.to_csv(OUT / f"quarter_spreads_{name}.csv", index=False)

        result["primary"][horizon] = {s: summarize_spreads(h1[h1["quarter"].map(split_name) == s]) for s in ["train", "validation", "oos"]}
        result["secondary"][horizon] = {s: summarize_spreads(h2[h2["quarter"].map(split_name) == s]) for s in ["train", "validation", "oos"]}
        result["momentum_benchmark"][horizon] = {s: summarize_spreads(mom[mom["quarter"].map(split_name) == s]) for s in ["train", "validation", "oos"]}

    # Frozen primary null calibration: OOS 6M only.
    oos = panel[(panel["split"] == "oos") & panel["excess_6m"].notna()].copy().reset_index(drop=True)
    real_oos_sp = matched_quarter_spreads(oos, "treatment_h1", "excess_6m", match_momentum=True)
    observed = float(real_oos_sp["spread"].mean()) if not real_oos_sp.empty else float("nan")
    perm = permuted_null(oos, "excess_6m", NULL_REPS, rng)
    rand = random_count_null(oos, "excess_6m", NULL_REPS, rng)
    pd.DataFrame({"permuted_rank_mean_spread": perm, "random_count_mean_spread": rand}).to_csv(OUT / "null_distribution_oos_6m.csv", index=False)
    p_perm = empirical_p(perm, observed)
    p_rand = empirical_p(rand, observed)

    oos_stats = summarize_spreads(real_oos_sp)
    result["primary_oos_6m_null"] = {
        **oos_stats,
        "observed_mean_spread": None if not math.isfinite(observed) else observed,
        "permuted_rank_empirical_p_one_sided": p_perm,
        "random_count_empirical_p_one_sided": p_rand,
        "permuted_null_mean": float(np.nanmean(perm)) if np.isfinite(perm).any() else None,
        "random_null_mean": float(np.nanmean(rand)) if np.isfinite(rand).any() else None,
    }

    if mcap_cov < MIN_MCAP_COVERAGE or outcome_cov6 < MIN_OUTCOME_COVERAGE or oos_stats["n_quarters"] < MIN_OOS_QUARTERS:
        verdict = "SAMPLE_INCOMPLETE"
    else:
        passes = (
            oos_stats["mean"] is not None and oos_stats["mean"] > 0
            and oos_stats["median"] is not None and oos_stats["median"] > 0
            and oos_stats["positive_share"] is not None and oos_stats["positive_share"] >= 0.55
            and p_perm is not None and p_perm <= 0.05
        )
        verdict = "SURVIVES_STAGE_A" if passes else "FAIL_INCREMENTAL_RANK_EDGE"
    result["verdict"] = verdict
    result["stage_b_authority"] = "ALLOWED_TO_PREREGISTER" if verdict == "SURVIVES_STAGE_A" else "BLOCKED"
    result["runtime_seconds"] = time.time() - t0

    (OUT / "summary.json").write_text(json.dumps(result, indent=2), encoding="utf-8")

    ptxt = "—" if p_perm is None else f"{p_perm:.4f}"
    rmean = "—" if oos_stats["mean"] is None else f"{oos_stats['mean']:.2%}"
    rmed = "—" if oos_stats["median"] is None else f"{oos_stats['median']:.2%}"
    pshare = "—" if oos_stats["positive_share"] is None else f"{oos_stats['positive_share']:.1%}"
    report = f"""# ACCELERATION × RELATIVE RANK MIGRATION Ω — V1 Result

**Verdict:** **{verdict}**  
**Experiment:** `ARRM_OMEGA_V1_2026-09-06`  
**Authority:** RESEARCH ONLY

## Coverage

- Historical symbols encountered: **{len(symbols)}**
- Panel rows: **{len(panel)}**
- Market-cap proxy coverage: **{mcap_cov:.1%}**
- Mature 6M outcome coverage: **{outcome_cov6:.1%}**

## Frozen primary OOS test — 6M

- Eligible matched OOS quarters: **{oos_stats['n_quarters']}**
- Mean treatment-control excess spread: **{rmean}**
- Median treatment-control excess spread: **{rmed}**
- Positive-quarter share: **{pshare}**
- Empirical p vs within-quarter permuted rank: **{ptxt}**
- Null replications: **{NULL_REPS}**

## Interpretation

The primary question is whether top-quintile 12M market-cap rank migration adds information after matching on the same quarter, size quintile and 12M-momentum quintile. The OOS gate is controlling; train, validation, H2 and the momentum-only benchmark cannot rescue a failed primary gate.

`SURVIVES_STAGE_A` does not validate an investable strategy; it only permits a separately preregistered point-in-time fundamental-acceleration Stage B. `FAIL_INCREMENTAL_RANK_EDGE` kills Market-Cap Velocity Ω as demonstrated alpha in V1. `SAMPLE_INCOMPLETE` means the free-data proxy did not support a valid verdict.

## Data limitations

Historical S&P 500 membership is point-in-time at the index-membership level. Market cap is a free-data proxy from Yahoo adjusted price and historical shares, not CRSP/Compustat. Delisted outcomes use the last observed adjusted price before the horizon as an exit proxy. Any positive result requires institutional-data replication before promotion.
"""
    (OUT / "REPORT.md").write_text(report, encoding="utf-8")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
