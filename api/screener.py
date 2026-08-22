from __future__ import annotations

import asyncio
import math
import os
from typing import Any, Literal

import httpx
from fastapi import APIRouter, Query

router = APIRouter(prefix="/v1/screener", tags=["screener"])

FINNHUB_TOKEN = os.getenv("FINNHUB_TOKEN", "").strip()

SortKey = Literal[
    "symbol",
    "price",
    "day",
    "ret1y",
    "ret2y",
    "marketCap",
    "pe",
    "beta",
    "roic",
]
SortDirection = Literal["asc", "desc"]

DEFAULT_SYMBOLS = [
    "AAPL",
    "ABBV",
    "ABT",
    "AMGN",
    "AMZN",
    "AVGO",
    "CAT",
    "CB",
    "CME",
    "COP",
    "COR",
    "DE",
    "DHR",
    "EOG",
    "GOOG",
    "JPM",
    "KO",
    "LLY",
    "MA",
    "MEDP",
    "MSFT",
    "NVDA",
    "PBR",
    "PEP",
    "PGR",
    "SPGI",
    "V",
    "WMT",
    "XOM",
]


def _finite(value: Any) -> float | None:
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    return number if math.isfinite(number) else None


def _percent_change(latest: float, prior: float) -> float | None:
    if prior == 0:
        return None
    return (latest / prior - 1.0) * 100.0


async def _stooq_history(client: httpx.AsyncClient, symbol: str) -> list[tuple[str, float]]:
    url = "https://stooq.com/q/d/l/"
    params = {"s": f"{symbol.lower()}.us", "i": "d"}
    response = await client.get(url, params=params, timeout=20)
    response.raise_for_status()
    rows: list[tuple[str, float]] = []
    for line in response.text.strip().splitlines()[1:]:
        parts = line.split(",")
        if len(parts) < 5:
            continue
        close = _finite(parts[4])
        if close is not None:
            rows.append((parts[0], close))
    return rows


async def _finnhub_metric(client: httpx.AsyncClient, symbol: str) -> dict[str, Any]:
    if not FINNHUB_TOKEN:
        return {}
    response = await client.get(
        "https://finnhub.io/api/v1/stock/metric",
        params={"symbol": symbol, "metric": "all", "token": FINNHUB_TOKEN},
        timeout=20,
    )
    response.raise_for_status()
    payload = response.json()
    metric = payload.get("metric")
    return metric if isinstance(metric, dict) else {}


def _metric_number(metric: dict[str, Any], *keys: str) -> float | None:
    for key in keys:
        value = _finite(metric.get(key))
        if value is not None:
            return value
    return None


async def _screen_row(client: httpx.AsyncClient, symbol: str) -> dict[str, Any]:
    history_task = asyncio.create_task(_stooq_history(client, symbol))
    metric_task = asyncio.create_task(_finnhub_metric(client, symbol))
    history, metric = await asyncio.gather(history_task, metric_task)

    current = history[-1][1] if history else None
    previous = history[-2][1] if len(history) > 1 else None
    one_year = history[-253][1] if len(history) > 252 else None
    two_year = history[-505][1] if len(history) > 504 else None
    sma200 = sum(close for _, close in history[-200:]) / 200 if len(history) >= 200 else None

    day = _percent_change(current, previous) if current is not None and previous is not None else None
    ret1y = _percent_change(current, one_year) if current is not None and one_year is not None else None
    ret2y = _percent_change(current, two_year) if current is not None and two_year is not None else None

    market_cap_m = _metric_number(metric, "marketCapitalization")
    market_cap_b = market_cap_m / 1000.0 if market_cap_m is not None else None
    pe = _metric_number(metric, "peTTM", "peBasicExclExtraTTM")
    beta = _metric_number(metric, "beta")
    roic = _metric_number(metric, "roicTTM")

    fundamental_values = [market_cap_b, pe, beta, roic]
    technical_values = [current, day, sma200, ret1y, ret2y]
    fundamental_coverage = sum(value is not None for value in fundamental_values) / len(fundamental_values)
    technical_coverage = sum(value is not None for value in technical_values) / len(technical_values)

    return {
        "symbol": symbol,
        "price": current,
        "day": day,
        "sma200": sma200,
        "above200dma": None if sma200 is None or current is None else current > sma200,
        "ret1y": ret1y,
        "ret2y": ret2y,
        "marketCap": market_cap_b,
        "pe": pe,
        "beta": beta,
        "roic": roic,
        "fundamentalCoverage": round(fundamental_coverage, 4),
        "technicalCoverage": round(technical_coverage, 4),
        "source": {
            "technical": "Stooq daily history",
            "fundamental": "Finnhub stock/metric" if FINNHUB_TOKEN else "DATA GATE",
        },
    }


def _passes(
    row: dict[str, Any],
    min_market_cap: float | None,
    max_pe: float | None,
    max_beta: float | None,
    min_roic: float | None,
    positive_day: bool,
    above_200dma: bool,
    positive_1y: bool,
    positive_2y: bool,
) -> bool:
    # Evaluate only active filters. This is intentionally fail-closed for missing
    # values under an active filter and permissive when the filter is inactive.
    if min_market_cap is not None:
        value = row.get("marketCap")
        if value is None or value < min_market_cap:
            return False
    if max_pe is not None:
        value = row.get("pe")
        if value is None or value > max_pe:
            return False
    if max_beta is not None:
        value = row.get("beta")
        if value is None or value > max_beta:
            return False
    if min_roic is not None:
        value = row.get("roic")
        if value is None or value < min_roic:
            return False
    if positive_day:
        value = row.get("day")
        if value is None or value <= 0:
            return False
    if above_200dma and row.get("above200dma") is not True:
        return False
    if positive_1y:
        value = row.get("ret1y")
        if value is None or value <= 0:
            return False
    if positive_2y:
        value = row.get("ret2y")
        if value is None or value <= 0:
            return False
    return True


def _sort_value(row: dict[str, Any], key: SortKey) -> Any:
    if key == "symbol":
        return str(row.get("symbol", ""))
    return row.get(key)


@router.get("")
async def screen(
    symbols: str | None = Query(default=None, max_length=800),
    min_market_cap: float | None = Query(default=None, ge=0, description="USD billions"),
    max_pe: float | None = Query(default=None, ge=0),
    max_beta: float | None = Query(default=None, ge=-10, le=20),
    min_roic: float | None = Query(default=None, ge=-1000, le=1000, description="Percent; exact ROIC only"),
    positive_day: bool = Query(default=False),
    above_200dma: bool = Query(default=False),
    positive_1y: bool = Query(default=False),
    positive_2y: bool = Query(default=False),
    sort: SortKey = Query(default="ret1y"),
    direction: SortDirection = Query(default="desc"),
    limit: int = Query(default=50, ge=1, le=60),
) -> dict[str, Any]:
    universe = [token.strip().upper() for token in symbols.split(",")] if symbols else DEFAULT_SYMBOLS
    universe = [symbol for symbol in universe if symbol][:60]

    async with httpx.AsyncClient(headers={"User-Agent": "ATLAS-Omega/1.0"}) as client:
        raw_rows = await asyncio.gather(
            *(_screen_row(client, symbol) for symbol in universe),
            return_exceptions=True,
        )

    rows: list[dict[str, Any]] = []
    errors: list[dict[str, str]] = []
    for symbol, raw in zip(universe, raw_rows, strict=True):
        if isinstance(raw, Exception):
            errors.append({"symbol": symbol, "error": type(raw).__name__})
            continue
        if _passes(
            raw,
            min_market_cap,
            max_pe,
            max_beta,
            min_roic,
            positive_day,
            above_200dma,
            positive_1y,
            positive_2y,
        ):
            rows.append(raw)

    reverse = direction == "desc"
    rows.sort(
        key=lambda row: (
            _sort_value(row, sort) is not None,
            _sort_value(row, sort),
        ),
        reverse=reverse,
    )

    return {
        "ok": True,
        "rows": rows[:limit],
        "count": min(len(rows), limit),
        "universeCount": len(universe),
        "errors": errors,
        "filters": {
            "minMarketCap": min_market_cap,
            "maxPe": max_pe,
            "maxBeta": max_beta,
            "minRoic": min_roic,
            "positiveDay": positive_day,
            "above200dma": above_200dma,
            "positive1y": positive_1y,
            "positive2y": positive_2y,
        },
        "sort": {"key": sort, "direction": direction},
    }
