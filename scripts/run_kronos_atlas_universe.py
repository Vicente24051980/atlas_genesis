#!/usr/bin/env python3
from __future__ import annotations

import argparse
import asyncio
import json
from pathlib import Path
from typing import Any

import pandas as pd

from api.kronos_validation import evaluate_observations
from api.market import get_market_history
from api.tracked_universe import PORTFOLIO, WATCHLIST
from scripts.run_kronos_walk_forward import run_symbol

DEFAULT_SYMBOLS = ("MSFT", "NVDA", "GOOG", "TSM", "AVGO", "ASML", "ANET", "ETN")


def _market_symbol(item: dict[str, Any]) -> str:
    return str(item.get("symbol") or item["ticker"]).strip().upper()


def _tracked_map() -> dict[str, dict[str, Any]]:
    return {item["ticker"].upper(): item for item in PORTFOLIO + WATCHLIST}


def history_to_frame(rows: list[dict[str, Any]]) -> pd.DataFrame:
    frame = pd.DataFrame(rows).rename(columns={"date": "timestamp"})
    required = ["timestamp", "open", "high", "low", "close"]
    missing = [column for column in required if column not in frame.columns]
    if missing:
        raise ValueError(f"market history missing columns: {missing}")
    frame = frame.dropna(subset=required).copy()
    frame["timestamp"] = pd.to_datetime(frame["timestamp"], utc=True, errors="raise")
    frame = frame.sort_values("timestamp").drop_duplicates("timestamp", keep="last").reset_index(drop=True)
    return frame


async def run_universe(
    symbols: list[str],
    *,
    horizons: tuple[int, ...],
    lookback: int,
    step_multiplier: int,
    sample_count: int,
    history_days: int,
) -> dict[str, Any]:
    tracked = _tracked_map()
    results: dict[str, Any] = {}
    failures: dict[str, str] = {}

    for ticker in symbols:
        key = ticker.strip().upper()
        item = tracked.get(key, {"ticker": key})
        market_symbol = _market_symbol(item)
        try:
            rows = await get_market_history(market_symbol, days=history_days)
            frame = history_to_frame(rows)
            if len(frame) < max(100, lookback + max(horizons) + 1):
                raise ValueError(f"insufficient history: {len(frame)} rows")

            symbol_payload: dict[str, Any] = {
                "ticker": key,
                "marketSymbol": market_symbol,
                "rows": len(frame),
                "horizons": {},
            }
            for horizon in horizons:
                observations = run_symbol(
                    frame,
                    symbol=key,
                    horizon=horizon,
                    lookback=lookback,
                    step=max(1, horizon * step_multiplier),
                    sample_count=sample_count,
                )
                metrics = evaluate_observations(observations)[horizon]
                symbol_payload["horizons"][str(horizon)] = {
                    "metrics": metrics.__dict__,
                    "observations": [observation.__dict__ for observation in observations],
                }
            results[key] = symbol_payload
        except Exception as exc:
            failures[key] = f"{exc.__class__.__name__}: {exc}"

    return {
        "engine": "KRONOS_MARKET_FORECAST_OMEGA_v0_3",
        "status": "EXPERIMENTAL_NON_CANONICAL",
        "dataSource": "ATLAS_MARKET_STOOQ",
        "symbolsRequested": symbols,
        "results": results,
        "failures": failures,
        "authority": "VALIDATION_ONLY_NO_BUY_SELL_AUTHORITY",
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Run Kronos walk-forward on the ATLAS tracked universe")
    parser.add_argument("--symbols", nargs="*", default=list(DEFAULT_SYMBOLS))
    parser.add_argument("--horizons", nargs="*", type=int, choices=(5, 20, 60), default=[5, 20, 60])
    parser.add_argument("--lookback", type=int, default=256)
    parser.add_argument("--step-multiplier", type=int, default=1)
    parser.add_argument("--sample-count", type=int, default=20)
    parser.add_argument("--history-days", type=int, default=1500)
    parser.add_argument("--output", type=Path, default=Path("artifacts/kronos_atlas_walk_forward.json"))
    args = parser.parse_args()

    payload = asyncio.run(
        run_universe(
            [value.upper() for value in args.symbols],
            horizons=tuple(args.horizons),
            lookback=args.lookback,
            step_multiplier=args.step_multiplier,
            sample_count=args.sample_count,
            history_days=args.history_days,
        )
    )
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "output": str(args.output),
        "completed": sorted(payload["results"].keys()),
        "failed": payload["failures"],
    }, indent=2))


if __name__ == "__main__":
    main()
