#!/usr/bin/env python3
from __future__ import annotations

import argparse
import asyncio
import json
import time
from pathlib import Path
from typing import Any

import httpx
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


async def _yahoo_history(symbol: str, history_days: int) -> list[dict[str, Any]]:
    """Validation-only fallback when the primary ATLAS/Stooq endpoint is unavailable.

    The selected provider is always recorded in the output. This fallback does not
    change the canonical ATLAS market provider or any investment decision authority.
    """
    period2 = int(time.time()) + 86_400
    period1 = period2 - max(100, history_days) * 86_400
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}"
    params = {
        "period1": period1,
        "period2": period2,
        "interval": "1d",
        "events": "history",
        "includeAdjustedClose": "true",
    }
    headers = {"User-Agent": "Mozilla/5.0 ATLAS-Omega-Kronos-Validation/1.0"}
    async with httpx.AsyncClient(timeout=20.0, follow_redirects=True) as client:
        response = await client.get(url, params=params, headers=headers)
    response.raise_for_status()
    payload = response.json()
    result = ((payload.get("chart") or {}).get("result") or [None])[0]
    if not result:
        raise ValueError("Yahoo validation fallback returned no chart result")
    timestamps = result.get("timestamp") or []
    quote = (((result.get("indicators") or {}).get("quote") or [{}])[0])
    opens = quote.get("open") or []
    highs = quote.get("high") or []
    lows = quote.get("low") or []
    closes = quote.get("close") or []
    volumes = quote.get("volume") or []
    rows: list[dict[str, Any]] = []
    for i, ts in enumerate(timestamps):
        values = [opens[i], highs[i], lows[i], closes[i]] if i < min(len(opens), len(highs), len(lows), len(closes)) else [None] * 4
        if any(value is None for value in values):
            continue
        rows.append(
            {
                "date": pd.Timestamp(ts, unit="s", tz="UTC").date().isoformat(),
                "open": float(opens[i]),
                "high": float(highs[i]),
                "low": float(lows[i]),
                "close": float(closes[i]),
                "volume": float(volumes[i]) if i < len(volumes) and volumes[i] is not None else None,
            }
        )
    if not rows:
        raise ValueError("Yahoo validation fallback returned no usable OHLC rows")
    return rows


async def _load_history(symbol: str, history_days: int) -> tuple[list[dict[str, Any]], str, str | None]:
    try:
        rows = await get_market_history(symbol, days=history_days)
        return rows, "ATLAS_MARKET_STOOQ", None
    except Exception as primary_exc:
        rows = await _yahoo_history(symbol, history_days)
        return rows, "YAHOO_CHART_VALIDATION_FALLBACK", f"{primary_exc.__class__.__name__}: {primary_exc}"


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
            rows, provider, primary_failure = await _load_history(market_symbol, history_days)
            frame = history_to_frame(rows)
            if len(frame) < max(100, lookback + max(horizons) + 1):
                raise ValueError(f"insufficient history: {len(frame)} rows")

            symbol_payload: dict[str, Any] = {
                "ticker": key,
                "marketSymbol": market_symbol,
                "rows": len(frame),
                "dataSource": provider,
                "primarySourceFailure": primary_failure,
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
        "engine": "KRONOS_MARKET_FORECAST_OMEGA_v0_4",
        "status": "EXPERIMENTAL_NON_CANONICAL",
        "primaryDataSource": "ATLAS_MARKET_STOOQ",
        "fallbackPolicy": "YAHOO_CHART_VALIDATION_ONLY_IF_PRIMARY_UNAVAILABLE",
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
        "sources": {key: value.get("dataSource") for key, value in payload["results"].items()},
    }, indent=2))


if __name__ == "__main__":
    main()
