#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path

import pandas as pd

from api.kronos_adapter import KronosAdapterError, KronosSmallAdapter
from api.kronos_validation import (
    ForecastObservation,
    evaluate_observations,
    expanding_walk_forward_indices,
    momentum_baseline_pct,
    realized_return_pct,
)

REQUIRED_COLUMNS = {"timestamp", "open", "high", "low", "close"}


def load_market_csv(path: Path) -> pd.DataFrame:
    frame = pd.read_csv(path)
    missing = REQUIRED_COLUMNS.difference(frame.columns)
    if missing:
        raise ValueError(f"missing required columns: {sorted(missing)}")
    frame = frame.copy()
    frame["timestamp"] = pd.to_datetime(frame["timestamp"], utc=True, errors="raise")
    frame = frame.sort_values("timestamp").drop_duplicates("timestamp", keep="last").reset_index(drop=True)
    if len(frame) < 100:
        raise ValueError("walk-forward validation requires at least 100 rows")
    return frame


def run_symbol(
    frame: pd.DataFrame,
    *,
    symbol: str,
    horizon: int,
    lookback: int,
    step: int,
    sample_count: int,
) -> list[ForecastObservation]:
    adapter = KronosSmallAdapter()
    runtime = adapter.status()
    if not runtime.enabled or not runtime.source_available or not runtime.dependencies_available:
        raise KronosAdapterError(runtime.detail)

    closes = [float(value) for value in frame["close"].tolist()]
    observations: list[ForecastObservation] = []
    for start, origin, target in expanding_walk_forward_indices(
        len(frame), lookback=lookback, horizon=horizon, step=step
    ):
        history = frame.iloc[start : origin + 1]
        future = frame.iloc[origin + 1 : target + 1]
        bars = []
        for row in history.to_dict(orient="records"):
            item = {
                "timestamp": pd.Timestamp(row["timestamp"]).isoformat(),
                "open": float(row["open"]),
                "high": float(row["high"]),
                "low": float(row["low"]),
                "close": float(row["close"]),
            }
            if "volume" in row and pd.notna(row["volume"]):
                item["volume"] = float(row["volume"])
            if "amount" in row and pd.notna(row["amount"]):
                item["amount"] = float(row["amount"])
            bars.append(item)

        forecast = adapter.predict(
            bars=bars,
            future_timestamps=[pd.Timestamp(v).isoformat() for v in future["timestamp"].tolist()],
            horizon_days=horizon,
            sample_count=sample_count,
            temperature=1.0,
            top_p=0.9,
        )
        predicted = float(forecast["predictedReturnPct"])
        actual = realized_return_pct(closes[origin], closes[target])
        momentum = momentum_baseline_pct(closes, origin, horizon)
        observations.append(
            ForecastObservation(
                symbol=symbol.upper(),
                as_of=pd.Timestamp(frame.iloc[origin]["timestamp"]).isoformat(),
                horizon_days=horizon,
                predicted_return_pct=predicted,
                actual_return_pct=actual,
                momentum_return_pct=momentum,
            )
        )
    return observations


def main() -> None:
    parser = argparse.ArgumentParser(description="Leakage-safe ATLAS Ω Kronos walk-forward validation")
    parser.add_argument("csv", type=Path)
    parser.add_argument("--symbol", required=True)
    parser.add_argument("--horizon", type=int, choices=(5, 20, 60), default=20)
    parser.add_argument("--lookback", type=int, default=256)
    parser.add_argument("--step", type=int, default=None)
    parser.add_argument("--sample-count", type=int, default=20)
    parser.add_argument("--output", type=Path, default=None)
    args = parser.parse_args()

    step = args.step or args.horizon
    frame = load_market_csv(args.csv)
    observations = run_symbol(
        frame,
        symbol=args.symbol,
        horizon=args.horizon,
        lookback=args.lookback,
        step=step,
        sample_count=args.sample_count,
    )
    metrics = evaluate_observations(observations)[args.horizon]
    payload = {
        "engine": "KRONOS_MARKET_FORECAST_OMEGA_v0_2",
        "status": "EXPERIMENTAL_NON_CANONICAL",
        "symbol": args.symbol.upper(),
        "metrics": metrics.__dict__,
        "observations": [obs.__dict__ for obs in observations],
        "authority": "VALIDATION_ONLY_NO_BUY_SELL_AUTHORITY",
    }
    text = json.dumps(payload, indent=2)
    if args.output:
        args.output.write_text(text + "\n", encoding="utf-8")
    else:
        print(text)


if __name__ == "__main__":
    main()
