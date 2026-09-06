#!/usr/bin/env python3
"""ATLAS Strategy Factory Ω — empirical null-arm execution.

Purpose
-------
Calibrate whether a bounded technical-rule search can manufacture apparently
attractive strategies from a relationship that has been deliberately broken.
This is a falsification harness, not a trading model.

Design
------
* Instrument: QQQ daily adjusted prices.
* Frozen grammar: trend / crossover / momentum / breakout rules.
* Train: 2006-2018; validation: 2019-2022; sealed OOS: 2023-2026-08-31.
* Search objective: train net Sharpe after explicit turnover cost.
* Null: circularly shift realized returns relative to the frozen strategy signals.
  This preserves the return distribution/autocorrelation structure while breaking
  the contemporaneous relation between each signal and its realized return.
* The exact same winner-selection rule is applied to each null replication.

Outputs are written to research/executions/strategy_factory_null_arm/.
"""
from __future__ import annotations

import json
import math
import os
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Dict, List, Tuple

import numpy as np
import pandas as pd
import yfinance as yf

START = "2005-01-01"
END = "2026-09-01"  # yfinance end is exclusive
TRAIN_END = pd.Timestamp("2018-12-31")
VALID_END = pd.Timestamp("2022-12-31")
OOS_END = pd.Timestamp("2026-08-31")
ONE_WAY_COST_BPS = 2.0
NULL_REPLICATIONS = int(os.getenv("ATLAS_NULL_REPLICATIONS", "500"))
SEED = 20260906
OUTDIR = Path("research/executions/strategy_factory_null_arm")


@dataclass(frozen=True)
class Candidate:
    candidate_id: str
    family: str
    params: Dict[str, int]


@dataclass
class Metrics:
    sharpe: float
    cagr: float
    max_drawdown: float
    total_return: float
    benchmark_total_return: float
    excess_total_return: float
    turnover_events: int


def annualized_sharpe(r: pd.Series) -> float:
    r = r.dropna()
    if len(r) < 30:
        return float("nan")
    sd = float(r.std(ddof=1))
    if not math.isfinite(sd) or sd <= 0:
        return float("nan")
    return float(np.sqrt(252.0) * r.mean() / sd)


def max_drawdown(r: pd.Series) -> float:
    equity = (1.0 + r.fillna(0.0)).cumprod()
    dd = equity / equity.cummax() - 1.0
    return float(dd.min()) if len(dd) else float("nan")


def cagr(r: pd.Series) -> float:
    r = r.dropna()
    if len(r) < 2:
        return float("nan")
    total = float((1.0 + r).prod())
    years = len(r) / 252.0
    if total <= 0 or years <= 0:
        return -1.0
    return total ** (1.0 / years) - 1.0


def calc_metrics(strategy_r: pd.Series, benchmark_r: pd.Series, turnover_events: int) -> Metrics:
    strategy_r = strategy_r.dropna()
    benchmark_r = benchmark_r.reindex(strategy_r.index).fillna(0.0)
    total = float((1.0 + strategy_r).prod() - 1.0)
    bench_total = float((1.0 + benchmark_r).prod() - 1.0)
    return Metrics(
        sharpe=annualized_sharpe(strategy_r),
        cagr=cagr(strategy_r),
        max_drawdown=max_drawdown(strategy_r),
        total_return=total,
        benchmark_total_return=bench_total,
        excess_total_return=total - bench_total,
        turnover_events=int(turnover_events),
    )


def download_prices() -> pd.Series:
    raw = yf.download("QQQ", start=START, end=END, auto_adjust=True, progress=False, threads=False)
    if raw.empty:
        raise RuntimeError("QQQ download returned no rows")
    if isinstance(raw.columns, pd.MultiIndex):
        close = raw["Close"]["QQQ"]
    else:
        close = raw["Close"]
    close = close.dropna().astype(float)
    close.name = "QQQ"
    if close.index.tz is not None:
        close.index = close.index.tz_localize(None)
    return close


def build_grammar(close: pd.Series) -> Tuple[List[Candidate], pd.DataFrame]:
    candidates: List[Candidate] = []
    signals: Dict[str, pd.Series] = {}

    for lookback in [20, 50, 100, 150, 200]:
        cid = f"TREND_SMA_{lookback}"
        ma = close.rolling(lookback).mean()
        sig = (close > ma).astype(float).shift(1).fillna(0.0)
        candidates.append(Candidate(cid, "trend", {"lookback": lookback}))
        signals[cid] = sig

    for fast in [5, 10, 20, 40, 60]:
        for slow in [50, 100, 150, 200]:
            if fast >= slow:
                continue
            cid = f"CROSS_{fast}_{slow}"
            f = close.rolling(fast).mean()
            s = close.rolling(slow).mean()
            sig = (f > s).astype(float).shift(1).fillna(0.0)
            candidates.append(Candidate(cid, "crossover", {"fast": fast, "slow": slow}))
            signals[cid] = sig

    for lookback in [20, 60, 120, 252]:
        cid = f"MOM_{lookback}"
        mom = close.pct_change(lookback)
        sig = (mom > 0.0).astype(float).shift(1).fillna(0.0)
        candidates.append(Candidate(cid, "momentum", {"lookback": lookback}))
        signals[cid] = sig

    for lookback in [20, 55, 100, 200]:
        cid = f"BREAKOUT_{lookback}"
        prior_high = close.shift(1).rolling(lookback).max()
        # State remains long while price is above the midpoint of its rolling range;
        # entry still requires an ex-ante breakout, avoiding a one-day pulse rule.
        prior_low = close.shift(1).rolling(lookback).min()
        entry = close.shift(1) >= prior_high
        state = close.shift(1) > (prior_high + prior_low) / 2.0
        sig = (entry | state).astype(float).fillna(0.0)
        candidates.append(Candidate(cid, "breakout", {"lookback": lookback}))
        signals[cid] = sig

    signal_df = pd.DataFrame(signals, index=close.index).fillna(0.0)
    return candidates, signal_df


def net_returns(signal: pd.Series, asset_returns: pd.Series) -> Tuple[pd.Series, int]:
    signal = signal.reindex(asset_returns.index).fillna(0.0).clip(0.0, 1.0)
    turnover = signal.diff().abs().fillna(signal.abs())
    costs = turnover * (ONE_WAY_COST_BPS / 10000.0)
    r = signal * asset_returns - costs
    return r, int((turnover > 0).sum())


def split_masks(index: pd.DatetimeIndex) -> Dict[str, pd.Series]:
    return {
        "train": pd.Series(index <= TRAIN_END, index=index),
        "validation": pd.Series((index > TRAIN_END) & (index <= VALID_END), index=index),
        "oos": pd.Series((index > VALID_END) & (index <= OOS_END), index=index),
    }


def evaluate_candidate(signal: pd.Series, asset_returns: pd.Series, masks: Dict[str, pd.Series]) -> Dict[str, Metrics]:
    nr, _ = net_returns(signal, asset_returns)
    benchmark = asset_returns
    out: Dict[str, Metrics] = {}
    for name, mask in masks.items():
        rr = nr[mask]
        br = benchmark[mask]
        sig_slice = signal.reindex(rr.index).fillna(0.0)
        turns = int((sig_slice.diff().abs().fillna(sig_slice.abs()) > 0).sum())
        out[name] = calc_metrics(rr, br, turns)
    return out


def choose_winner(signals: pd.DataFrame, asset_returns: pd.Series, masks: Dict[str, pd.Series]) -> Tuple[str, Dict[str, Metrics]]:
    scored = []
    all_metrics: Dict[str, Dict[str, Metrics]] = {}
    for cid in signals.columns:
        metrics = evaluate_candidate(signals[cid], asset_returns, masks)
        all_metrics[cid] = metrics
        train = metrics["train"]
        # A strategy cannot win solely because it barely traded.
        if train.turnover_events < 10 or not math.isfinite(train.sharpe):
            score = -1e9
        else:
            score = train.sharpe
        scored.append((score, cid))
    scored.sort(reverse=True)
    winner = scored[0][1]
    return winner, all_metrics[winner]


def circular_shift_returns(r: pd.Series, offset: int) -> pd.Series:
    values = r.to_numpy(copy=True)
    shifted = np.roll(values, offset)
    return pd.Series(shifted, index=r.index, name=r.name)


def main() -> None:
    OUTDIR.mkdir(parents=True, exist_ok=True)
    close = download_prices()
    asset_returns = close.pct_change().fillna(0.0)
    candidates, signals = build_grammar(close)
    masks = split_masks(close.index)

    real_winner, real_metrics = choose_winner(signals, asset_returns, masks)

    rng = np.random.default_rng(SEED)
    n = len(asset_returns)
    valid_offsets = np.arange(252, max(253, n - 252))
    if len(valid_offsets) < NULL_REPLICATIONS:
        offsets = rng.choice(valid_offsets, size=NULL_REPLICATIONS, replace=True)
    else:
        offsets = rng.choice(valid_offsets, size=NULL_REPLICATIONS, replace=False)

    null_rows = []
    for i, offset in enumerate(offsets, start=1):
        null_r = circular_shift_returns(asset_returns, int(offset))
        winner, m = choose_winner(signals, null_r, masks)
        val = m["validation"]
        oos = m["oos"]
        passes_validation = (
            math.isfinite(val.sharpe)
            and val.sharpe > 0.0
            and val.excess_total_return > 0.0
            and val.max_drawdown >= -0.50
        )
        sealed_pass = passes_validation and math.isfinite(oos.sharpe) and oos.sharpe > 0.0 and oos.excess_total_return > 0.0
        null_rows.append({
            "replication": i,
            "offset": int(offset),
            "winner": winner,
            "validation_sharpe": val.sharpe,
            "validation_excess_total_return": val.excess_total_return,
            "oos_sharpe": oos.sharpe,
            "oos_excess_total_return": oos.excess_total_return,
            "passes_validation": bool(passes_validation),
            "sealed_oos_pass": bool(sealed_pass),
        })

    null_df = pd.DataFrame(null_rows)
    real_val = real_metrics["validation"]
    real_oos = real_metrics["oos"]

    val_empirical_p = float((1 + (null_df["validation_sharpe"] >= real_val.sharpe).sum()) / (len(null_df) + 1))
    oos_empirical_p = float((1 + (null_df["oos_sharpe"] >= real_oos.sharpe).sum()) / (len(null_df) + 1))
    null_validation_pass_rate = float(null_df["passes_validation"].mean())
    null_sealed_pass_rate = float(null_df["sealed_oos_pass"].mean())

    if null_sealed_pass_rate > 0.05:
        calibration = "FAIL_FACTORY_CALIBRATION"
    else:
        calibration = "NULL_FALSE_POSITIVE_RATE_ACCEPTABLE"

    if (
        math.isfinite(real_oos.sharpe)
        and real_oos.excess_total_return > 0
        and val_empirical_p <= 0.05
        and oos_empirical_p <= 0.05
    ):
        edge_state = "EDGE_SURVIVES_THIS_NULL_ARM"
    else:
        edge_state = "NO_EDGE_DETECTED_VS_NULL"

    summary = {
        "run_id": "ATLAS_STRATEGY_FACTORY_NULL_ARM_2026-09-06",
        "instrument": "QQQ",
        "data_start": str(close.index.min().date()),
        "data_end": str(close.index.max().date()),
        "train_end": str(TRAIN_END.date()),
        "validation_end": str(VALID_END.date()),
        "sealed_oos_end": str(OOS_END.date()),
        "candidate_count": len(candidates),
        "null_replications": len(null_df),
        "one_way_cost_bps": ONE_WAY_COST_BPS,
        "winner": real_winner,
        "real_metrics": {k: asdict(v) for k, v in real_metrics.items()},
        "null_validation_pass_rate": null_validation_pass_rate,
        "null_sealed_oos_pass_rate": null_sealed_pass_rate,
        "validation_sharpe_empirical_p": val_empirical_p,
        "oos_sharpe_empirical_p": oos_empirical_p,
        "calibration_state": calibration,
        "edge_state": edge_state,
        "limitations": [
            "This is a finite frozen grammar, not the future 100k-candidate production search.",
            "Circular-shift null breaks signal/return alignment while preserving the observed return path shape.",
            "QQQ-only evidence cannot validate cross-asset or single-stock strategy families.",
            "Passing this harness would justify further shadow research only, never broker execution.",
        ],
    }

    null_df.to_csv(OUTDIR / "null_replications.csv", index=False)
    (OUTDIR / "summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")

    md = [
        "# ATLAS Strategy Factory Ω — Null Arm Execution",
        "",
        f"**Run:** `{summary['run_id']}`  ",
        f"**Candidate grammar:** {len(candidates)} frozen rules  ",
        f"**Null replications:** {len(null_df)}  ",
        f"**Costs:** {ONE_WAY_COST_BPS:.1f} bps one-way per exposure change  ",
        "",
        "## Real-data winner",
        "",
        f"- Winner: `{real_winner}`",
        f"- Train Sharpe: {real_metrics['train'].sharpe:.3f}",
        f"- Validation Sharpe: {real_val.sharpe:.3f}",
        f"- Validation excess total return vs QQQ: {real_val.excess_total_return:.2%}",
        f"- Sealed OOS Sharpe: {real_oos.sharpe:.3f}",
        f"- Sealed OOS excess total return vs QQQ: {real_oos.excess_total_return:.2%}",
        "",
        "## Null calibration",
        "",
        f"- Null winners passing validation gates: {null_validation_pass_rate:.2%}",
        f"- Null winners also passing sealed OOS gates: {null_sealed_pass_rate:.2%}",
        f"- Empirical p (validation Sharpe): {val_empirical_p:.4f}",
        f"- Empirical p (sealed OOS Sharpe): {oos_empirical_p:.4f}",
        f"- Factory calibration: **{calibration}**",
        f"- Edge state: **{edge_state}**",
        "",
        "## Interpretation rule",
        "",
        "The null arm is a control on the *search process*. If randomized signal/return alignment survives the same gates too often, the factory is not calibrated even if the real-data equity curve looks attractive. `NO_EDGE_DETECTED_VS_NULL` is a valid result and blocks promotion.",
        "",
        "## Limitations",
        "",
    ] + [f"- {x}" for x in summary["limitations"]]
    (OUTDIR / "REPORT.md").write_text("\n".join(md) + "\n", encoding="utf-8")
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
