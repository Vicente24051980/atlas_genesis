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

TARGET_31 = [
    "AVGO","REGN","ROP","INTU","V","ICE","IBKR","META","HWM","VRTX","SPGI","MELI","CW","PH","NVDA","MCK","BRK-B","RGA","DELL","GLW","CAH","VEEV","EHC","ASML","WAB","MLI","APG","AIZ","DE","CEG","VMI"
]
CHALLENGERS = ["STRL","RGLD","CBOE","EME","CB","MEDP","CME","RSG","LMB","SEIC","PUK","WMS"]
BENCHMARK = "SPY"
TRADING_DAYS = 252
MATERIALITY = 0.0025

@dataclass
class Metrics:
    tickers: List[str]
    cagr: float
    annualized_vol: float
    max_drawdown: float
    downside_deviation: float
    cvar_95_daily: float
    beta_vs_spy: float
    empirical_risk_proxy: float
    empirical_utility_proxy: float

@dataclass
class SwapResult:
    incumbent_out: str
    challenger_in: str
    delta_u_proxy: float
    cagr: float
    annualized_vol: float
    max_drawdown: float
    downside_deviation: float
    beta_vs_spy: float


def max_drawdown(index: pd.Series) -> float:
    peak = index.cummax()
    return float((index / peak - 1.0).min())


def cvar_95(r: pd.Series) -> float:
    q = r.quantile(0.05)
    tail = r[r <= q]
    return float(tail.mean()) if len(tail) else 0.0


def calc_metrics(returns: pd.DataFrame, tickers: Sequence[str], spy: pd.Series) -> Metrics:
    r = returns[list(tickers)].mean(axis=1).dropna()
    if len(r) < 252:
        raise ValueError(f"insufficient aligned observations: {len(r)}")
    wealth = (1 + r).cumprod()
    years = len(r) / TRADING_DAYS
    cagr = float(wealth.iloc[-1] ** (1 / years) - 1)
    vol = float(r.std(ddof=1) * math.sqrt(TRADING_DAYS))
    downside = float(r[r < 0].std(ddof=1) * math.sqrt(TRADING_DAYS))
    mdd = max_drawdown(wealth)
    cv = cvar_95(r)
    aligned = pd.concat([r.rename("p"), spy.rename("s")], axis=1).dropna()
    beta = float(aligned.cov().loc["p", "s"] / aligned["s"].var())
    risk = 0.65 * abs(mdd) + 0.20 * abs(cv) * math.sqrt(TRADING_DAYS) + 0.15 * vol
    utility = cagr - risk
    return Metrics(list(tickers), cagr, vol, mdd, downside, cv, beta, risk, utility)


def download_prices(tickers: Sequence[str], start: str, end: str) -> pd.DataFrame:
    import yfinance as yf
    raw = yf.download(list(tickers), start=start, end=end, auto_adjust=True, progress=False, group_by="column", threads=True)
    if raw.empty:
        raise RuntimeError("price provider returned no data")
    close = raw["Close"].copy() if isinstance(raw.columns, pd.MultiIndex) else raw[["Close"]].rename(columns={"Close": tickers[0]})
    missing = [t for t in tickers if t not in close.columns or close[t].dropna().shape[0] < 500]
    if missing:
        raise RuntimeError(f"insufficient price history for: {missing}")
    return close[list(tickers)].sort_index()


def all_swaps(returns: pd.DataFrame, spy: pd.Series, base: Metrics) -> List[SwapResult]:
    out: List[SwapResult] = []
    for incumbent in TARGET_31:
        for challenger in CHALLENGERS:
            trial = [challenger if t == incumbent else t for t in TARGET_31]
            m = calc_metrics(returns, trial, spy)
            out.append(SwapResult(
                incumbent_out=incumbent,
                challenger_in=challenger,
                delta_u_proxy=m.empirical_utility_proxy-base.empirical_utility_proxy,
                cagr=m.cagr,
                annualized_vol=m.annualized_vol,
                max_drawdown=m.max_drawdown,
                downside_deviation=m.downside_deviation,
                beta_vs_spy=m.beta_vs_spy,
            ))
    return sorted(out, key=lambda x: x.delta_u_proxy, reverse=True)


def additions(returns: pd.DataFrame, spy: pd.Series, base: Metrics) -> List[Tuple[str, Metrics, float]]:
    rows=[]
    for c in CHALLENGERS:
        m=calc_metrics(returns, TARGET_31+[c], spy)
        rows.append((c,m,m.empirical_utility_proxy-base.empirical_utility_proxy))
    return sorted(rows,key=lambda x:x[2],reverse=True)


def main() -> None:
    ap=argparse.ArgumentParser(); ap.add_argument("--start",default="2023-09-05"); ap.add_argument("--end",default="2026-09-05"); ap.add_argument("--outdir",default="artifacts/replacement-value-audit"); args=ap.parse_args()
    universe=list(dict.fromkeys(TARGET_31+CHALLENGERS+[BENCHMARK]))
    prices=download_prices(universe,args.start,args.end)
    rets=prices.pct_change(fill_method=None).dropna(); spy=rets[BENCHMARK]; stocks=rets.drop(columns=[BENCHMARK])
    base=calc_metrics(stocks,TARGET_31,spy)
    swaps=all_swaps(stocks,spy,base)
    adds=additions(stocks,spy,base)
    outdir=Path(args.outdir); outdir.mkdir(parents=True,exist_ok=True)
    payload={
      "status":"DIAGNOSTIC_ONLY_FORWARD_STRUCTURAL_REVIEW_REQUIRED",
      "materiality_threshold":MATERIALITY,
      "historical_return_is_expected_return":False,
      "base":asdict(base),
      "top_swaps":[asdict(x) for x in swaps[:50]],
      "material_swaps":[asdict(x) for x in swaps if x.delta_u_proxy>=MATERIALITY],
      "additions":[{"challenger":c,"metrics":asdict(m),"delta_u_proxy":d} for c,m,d in adds],
    }
    (outdir/"replacement_value_audit.json").write_text(json.dumps(payload,indent=2),encoding="utf-8")
    lines=["# ATLAS Ω Replacement Value Audit — exhaustive P31-i+X","","> DIAGNOSTIC_ONLY. Historical return is not Expected Return Ω. Any canonical replacement requires structural review.","",f"Base: CAGR {base.cagr:.2%} | Vol {base.annualized_vol:.2%} | MaxDD {base.max_drawdown:.2%} | U_proxy {base.empirical_utility_proxy:.4f}","",f"Materiality threshold: {MATERIALITY:.4f}","","## Top 25 swaps","| Rank | OUT | IN | ΔU proxy | CAGR | Vol | MaxDD |","|---:|---|---|---:|---:|---:|---:|"]
    for i,x in enumerate(swaps[:25],1):
        lines.append(f"| {i} | {x.incumbent_out} | {x.challenger_in} | {x.delta_u_proxy:+.4f} | {x.cagr:.2%} | {x.annualized_vol:.2%} | {x.max_drawdown:.2%} |")
    lines += ["","## N31→N32 additions","| Rank | Challenger | ΔU proxy | CAGR | Vol | MaxDD |","|---:|---|---:|---:|---:|---:|"]
    for i,(c,m,d) in enumerate(adds,1):
        lines.append(f"| {i} | {c} | {d:+.4f} | {m.cagr:.2%} | {m.annualized_vol:.2%} | {m.max_drawdown:.2%} |")
    (outdir/"replacement_value_audit.md").write_text("\n".join(lines),encoding="utf-8")
    print((outdir/"replacement_value_audit.md").read_text(encoding="utf-8"))

if __name__ == "__main__": main()
