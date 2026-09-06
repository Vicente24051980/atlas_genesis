#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import math
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Dict, List, Sequence, Tuple

import numpy as np
import pandas as pd

from legacy_fixed_portfolio_guard import require_explicit_legacy_opt_in

# LEGACY_FIXED_PORTFOLIO_DIAGNOSTIC.
# Preserved only to reproduce the historical 2026-09-05 N31 experiment.
# ZERO current selection / sizing / trade authority.
TARGET_31 = [
    "AVGO","REGN","ROP","INTU","V","ICE","IBKR","META","HWM","VRTX","SPGI","MELI","CW","PH","NVDA","MCK","BRK-B","RGA","DELL","GLW","CAH","VEEV","EHC","ASML","WAB","MLI","APG","AIZ","DE","CEG","VMI"
]
CHALLENGERS = ["CB","MEDP","CBOE","RSG","LMB","WMS","SEIC","RGLD","PUK","EME","STRL"]
BENCHMARK = "SPY"
TRADING_DAYS = 252

@dataclass
class PortfolioMetrics:
    n: int
    tickers: List[str]
    cagr: float
    annualized_vol: float
    max_drawdown: float
    downside_deviation: float
    cvar_95_daily: float
    beta_vs_spy: float
    empirical_risk_proxy: float
    empirical_utility_proxy: float


def max_drawdown(index: pd.Series) -> float:
    peak = index.cummax()
    dd = index / peak - 1.0
    return float(dd.min())


def cvar_95(returns: pd.Series) -> float:
    q = returns.quantile(0.05)
    tail = returns[returns <= q]
    return float(tail.mean()) if len(tail) else 0.0


def portfolio_returns(returns: pd.DataFrame, tickers: Sequence[str]) -> pd.Series:
    return returns[list(tickers)].mean(axis=1)


def calc_metrics(returns: pd.DataFrame, tickers: Sequence[str], spy_returns: pd.Series) -> PortfolioMetrics:
    r = portfolio_returns(returns, tickers).dropna()
    if len(r) < 252:
        raise ValueError(f"insufficient aligned observations for {tickers}: {len(r)}")
    wealth = (1 + r).cumprod()
    years = len(r) / TRADING_DAYS
    cagr = float(wealth.iloc[-1] ** (1 / years) - 1)
    vol = float(r.std(ddof=1) * math.sqrt(TRADING_DAYS))
    downside = float(r[r < 0].std(ddof=1) * math.sqrt(TRADING_DAYS))
    mdd = max_drawdown(wealth)
    cv = cvar_95(r)
    aligned = pd.concat([r.rename("p"), spy_returns.rename("s")], axis=1).dropna()
    beta = float(aligned.cov().loc["p","s"] / aligned["s"].var())
    risk_proxy = 0.65 * abs(mdd) + 0.20 * abs(cv) * math.sqrt(TRADING_DAYS) + 0.15 * vol
    utility = cagr - risk_proxy
    return PortfolioMetrics(len(tickers), list(tickers), cagr, vol, mdd, downside, cv, beta, risk_proxy, utility)


def risk_contribution(returns: pd.DataFrame, tickers: Sequence[str]) -> Dict[str, float]:
    cov = returns[list(tickers)].cov().values * TRADING_DAYS
    n = len(tickers)
    w = np.ones(n) / n
    sigma = math.sqrt(float(w @ cov @ w))
    marginal = cov @ w / sigma
    component = w * marginal
    pct = component / component.sum()
    return {t: float(x) for t, x in zip(tickers, pct)}


def local_search_best_set(returns: pd.DataFrame, candidates: Sequence[str], n: int, spy_returns: pd.Series, seed_order: Sequence[str], max_passes: int = 8) -> PortfolioMetrics:
    if n > len(candidates): raise ValueError("n exceeds candidate universe")
    current = [t for t in seed_order if t in candidates][:n]
    if len(current) < n: current += [t for t in candidates if t not in current][: n - len(current)]
    best = calc_metrics(returns, current, spy_returns)
    for _ in range(max_passes):
        improved = False
        outside = [t for t in candidates if t not in current]
        for old in list(current):
            for new in outside:
                trial = [new if t == old else t for t in current]
                m = calc_metrics(returns, trial, spy_returns)
                if m.empirical_utility_proxy > best.empirical_utility_proxy + 1e-9:
                    current = trial; best = m; improved = True; break
            if improved: break
        if not improved: break
    return best


def empirical_knee(frontier: Sequence[PortfolioMetrics], threshold: float = 0.0025) -> Tuple[int, str]:
    ordered = sorted(frontier, key=lambda x: x.n)
    for a, b in zip(ordered, ordered[1:]):
        delta = b.empirical_utility_proxy - a.empirical_utility_proxy
        if delta < threshold: return a.n, f"delta_U_proxy_{a.n}_to_{b.n}={delta:.6f}<threshold={threshold:.6f}"
    return ordered[-1].n, "no_trivial_increment_before_max_n"


def download_prices(tickers: Sequence[str], start: str, end: str) -> pd.DataFrame:
    import yfinance as yf
    raw = yf.download(list(tickers), start=start, end=end, auto_adjust=True, progress=False, group_by="column", threads=True)
    if raw.empty: raise RuntimeError("price provider returned no data")
    if isinstance(raw.columns, pd.MultiIndex): close = raw["Close"].copy()
    else: close = raw[["Close"]].rename(columns={"Close": tickers[0]})
    close = close.sort_index()
    missing = [t for t in tickers if t not in close.columns or close[t].dropna().shape[0] < 500]
    if missing: raise RuntimeError(f"insufficient price history for: {missing}")
    return close[list(tickers)]


def write_report(outdir: Path, prices: pd.DataFrame, frontier: List[PortfolioMetrics], target_metrics: PortfolioMetrics, target_risk: Dict[str,float], knee: Tuple[int,str]) -> None:
    outdir.mkdir(parents=True, exist_ok=True)
    corr = prices.pct_change(fill_method=None).dropna().corr(); corr.to_csv(outdir / "correlation_matrix.csv")
    best31 = next(x for x in frontier if x.n == 31)
    payload = {"status":"LEGACY_FIXED_PORTFOLIO_DIAGNOSTIC_ONLY","methodology":{"selection_weights":"EQUAL_1_OVER_N_TEST_ONLY","historical_return_is_expected_return":False,"global_optimality_proven":False,"search_mode":"DETERMINISTIC_ONE_SWAP_LOCAL_SEARCH","empirical_risk_proxy":"0.65*abs(MaxDD)+0.20*abs(DailyCVaR95)*sqrt(252)+0.15*AnnualizedVol","expected_return_state":"EXPECTED_RETURN_EVIDENCE_PENDING","current_portfolio_authority":"NONE"},"sample":{"start":str(prices.index.min().date()),"end":str(prices.index.max().date()),"observations":int(prices.shape[0])},"target_31":asdict(target_metrics),"target_31_risk_contribution":target_risk,"best_empirical_31":asdict(best31),"empirical_frontier":[asdict(x) for x in frontier],"empirical_knee":{"n":knee[0],"reason":knee[1]}}
    (outdir / "quant_audit.json").write_text(json.dumps(payload, indent=2), encoding="utf-8")
    lines=["# ATLAS Ω Quantitative Portfolio Audit — LEGACY N31","","> LEGACY_FIXED_PORTFOLIO_DIAGNOSTIC_ONLY. Historical return is a diagnostic proxy, NOT Expected Return Ω. This script has ZERO current portfolio authority.","",f"Sample: {payload['sample']['start']} to {payload['sample']['end']} ({payload['sample']['observations']} daily observations)","","## Historical target N=31 (equal-weight test exposure)",f"- Historical CAGR: {target_metrics.cagr:.2%}",f"- Annualized volatility: {target_metrics.annualized_vol:.2%}",f"- Max drawdown: {target_metrics.max_drawdown:.2%}",f"- Downside deviation: {target_metrics.downside_deviation:.2%}",f"- Beta vs SPY: {target_metrics.beta_vs_spy:.3f}",f"- Empirical utility proxy: {target_metrics.empirical_utility_proxy:.4f}","","## Historical best empirical N=31 challenger set",f"- Tickers: {', '.join(best31.tickers)}",f"- Historical CAGR: {best31.cagr:.2%}",f"- Volatility: {best31.annualized_vol:.2%}",f"- MaxDD: {best31.max_drawdown:.2%}",f"- U_proxy: {best31.empirical_utility_proxy:.4f}","","## N=20..35 empirical frontier","| N | CAGR | Vol | MaxDD | Beta | U_proxy |","|---:|---:|---:|---:|---:|---:|"]
    for m in sorted(frontier,key=lambda x:x.n): lines.append(f"| {m.n} | {m.cagr:.2%} | {m.annualized_vol:.2%} | {m.max_drawdown:.2%} | {m.beta_vs_spy:.3f} | {m.empirical_utility_proxy:.4f} |")
    lines += ["",f"Empirical knee diagnostic: **N={knee[0]}** ({knee[1]}).","","Expected Return Ω: **EVIDENCE_PENDING**.","Current ATLAS portfolio authority: **NONE**."]
    (outdir / "quant_audit.md").write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    require_explicit_legacy_opt_in("scripts/atlas_quant_portfolio_audit.py")
    ap=argparse.ArgumentParser(); ap.add_argument("--start",default="2023-09-05"); ap.add_argument("--end",default="2026-09-05"); ap.add_argument("--outdir",default="artifacts/quant-portfolio-audit"); args=ap.parse_args()
    universe=list(dict.fromkeys(TARGET_31+CHALLENGERS+[BENCHMARK])); prices=download_prices(universe,args.start,args.end); returns=prices.pct_change(fill_method=None).dropna(); spy=returns[BENCHMARK]; stock_returns=returns.drop(columns=[BENCHMARK]); target=calc_metrics(stock_returns,TARGET_31,spy); target_rc=risk_contribution(stock_returns,TARGET_31); candidates=TARGET_31+CHALLENGERS; frontier=[local_search_best_set(stock_returns,candidates,n,spy,TARGET_31+CHALLENGERS) for n in range(20,36)]; knee=empirical_knee(frontier); write_report(Path(args.outdir),prices.drop(columns=[BENCHMARK]),frontier,target,target_rc,knee); print((Path(args.outdir)/"quant_audit.md").read_text(encoding="utf-8"))

if __name__ == "__main__": main()
