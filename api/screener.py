from __future__ import annotations

import asyncio
import os
import time
from typing import Any, Literal

import httpx
from fastapi import APIRouter, HTTPException, Query

from api.market import CATALOGUE, get_market_history

router = APIRouter(prefix="/v1/screener", tags=["screener"])

FINNHUB_BASE_URL = "https://finnhub.io/api/v1"
FINNHUB_TOKEN = os.getenv("FINNHUB_TOKEN", "").strip()
METRIC_CACHE_TTL_SECONDS = 900
_METRIC_CACHE: dict[str, tuple[float, dict[str, Any]]] = {}
_METRIC_SEMAPHORE = asyncio.Semaphore(5)

SortKey = Literal["symbol", "day", "ret1y", "ret2y", "marketCap", "roic", "beta", "pe"]
SortDirection = Literal["asc", "desc"]


def _number(value: Any) -> float | None:
    if isinstance(value, bool):
        return None
    if isinstance(value, (int, float)):
        number = float(value)
        return number if number == number else None
    if isinstance(value, str):
        try:
            number = float(value.replace(",", ""))
        except ValueError:
            return None
        return number if number == number else None
    return None


def _first_number(source: dict[str, Any], *keys: str) -> float | None:
    normalized = {str(key).lower().replace("_", ""): value for key, value in source.items()}
    for key in keys:
        value = normalized.get(key.lower().replace("_", ""))
        number = _number(value)
        if number is not None:
            return number
    return None


def _ret(closes: list[float], sessions: int) -> float | None:
    if len(closes) <= sessions:
        return None
    start = closes[-1 - sessions]
    end = closes[-1]
    if start == 0:
        return None
    return (end / start - 1.0) * 100.0


def _sma(closes: list[float], sessions: int) -> float | None:
    if len(closes) < sessions:
        return None
    window = closes[-sessions:]
    return sum(window) / len(window)


def _normalize_symbols(value: str | None) -> list[str]:
    if not value:
        return [str(item["symbol"]).upper() for item in CATALOGUE]
    result: list[str] = []
    for raw in value.split(","):
        symbol = raw.strip().upper()
        if not symbol or len(symbol) > 20 or not all(ch.isalnum() or ch in ".-" for ch in symbol):
            continue
        if symbol not in result:
            result.append(symbol)
    if not result:
        raise HTTPException(status_code=400, detail="No valid symbols were supplied")
    return result[:60]


async def _finnhub_metrics(symbol: str) -> dict[str, Any]:
    if not FINNHUB_TOKEN:
        return {}
    cached = _METRIC_CACHE.get(symbol)
    now = time.time()
    if cached and now - cached[0] < METRIC_CACHE_TTL_SECONDS:
        return cached[1]
    params = {"symbol": symbol, "metric": "all"}
    headers = {"X-Finnhub-Token": FINNHUB_TOKEN}
    timeout = httpx.Timeout(14.0, connect=7.0)
    async with _METRIC_SEMAPHORE:
        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.get(f"{FINNHUB_BASE_URL}/stock/metric", params=params, headers=headers)
        except httpx.RequestError:
            return {}
    if response.status_code == 429 or response.status_code >= 400:
        return {}
    try:
        payload = response.json()
    except ValueError:
        return {}
    metric = payload.get("metric") if isinstance(payload, dict) else None
    result = metric if isinstance(metric, dict) else {}
    _METRIC_CACHE[symbol] = (now, result)
    return result


async def _build_row(symbol: str) -> dict[str, Any] | None:
    history_task = asyncio.create_task(get_market_history(symbol, days=900))
    metrics_task = asyncio.create_task(_finnhub_metrics(symbol))
    try:
        history = await history_task
    except HTTPException:
        history = []
    metrics = await metrics_task
    closes = [_number(row.get("close")) for row in history]
    closes = [value for value in closes if value is not None]
    if not closes:
        return None

    current = closes[-1]
    previous = closes[-2] if len(closes) >= 2 else None
    day = None if previous in (None, 0) else (current / previous - 1.0) * 100.0
    sma200 = _sma(closes, 200)
    ret1y = _ret(closes, 252)
    ret2y = _ret(closes, 504)

    market_cap_m = _first_number(metrics, "marketCapitalization", "marketCap", "marketCapitalizationTTM")
    market_cap_b = None if market_cap_m is None else market_cap_m / 1000.0
    pe = _first_number(metrics, "peTTM", "peNormalizedAnnual", "peBasicExclExtraTTM", "peExclExtraTTM")
    beta = _first_number(metrics, "beta")
    roic = _first_number(metrics, "roicTTM", "roic")
    if roic is not None and abs(roic) <= 1.5:
        roic *= 100.0

    meta = next((item for item in CATALOGUE if str(item.get("symbol", "")).upper() == symbol), None) or {}
    fundamental_values = [market_cap_b, pe, beta, roic]
    fundamental_coverage = sum(value is not None for value in fundamental_values) / len(fundamental_values)
    technical_values = [current, day, sma200, ret1y, ret2y]
    technical_coverage = sum(value is not None for value in technical_values) / len(technical_values)

    return {
        "symbol": symbol,
        "name": meta.get("name", symbol),
        "sector": meta.get("sector", "Market"),
        "price": current,
        "day": day,
        "sma200": sma200,
        "above200dma": None if sma200 is None else current > sma200,
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
    gates = [
        (min_market_cap is None, row.get("marketCap") is not None and row["marketCap"] >= min_market_cap),
        (max_pe is None, row.get("pe") is not None and row["pe"] <= max_pe),
        (max_beta is None, row.get("beta") is not None and row["beta"] <= max_beta),
        (min_roic is None, row.get("roic") is not None and row["roic"] >= min_roic),
        (not positive_day, row.get("day") is not None and row["day"] > 0),
        (not above_200dma, row.get("above200dma") is True),
        (not positive_1y, row.get("ret1y") is not None and row["ret1y"] > 0),
        (not positive_2y, row.get("ret2y") is not None and row["ret2y"] > 0),
    ]
    return all(optional or passed for optional, passed in gates)


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
    universe = _normalize_symbols(symbols)
    results = await asyncio.gather(*(_build_row(symbol) for symbol in universe))
    rows = [row for row in results if row is not None]
    passed = [
        row for row in rows
        if _passes(row, min_market_cap, max_pe, max_beta, min_roic, positive_day, above_200dma, positive_1y, positive_2y)
    ]

    reverse = direction == "desc"
    if sort == "symbol":
        passed.sort(key=lambda row: _sort_value(row, sort), reverse=reverse)
    else:
        passed.sort(
            key=lambda row: (
                _sort_value(row, sort) is not None,
                _sort_value(row, sort) if _sort_value(row, sort) is not None else float("-inf"),
            ),
            reverse=reverse,
        )

    fundamental_gate_count = sum(1 for row in rows if row.get("fundamentalCoverage", 0) < 1)
    return {
        "engine": "ATLAS Screener Ω",
        "version": "1.1.0",
        "universe": "CUSTOM" if symbols else "ATLAS_CORE_US",
        "scanned": len(universe),
        "returned": min(len(passed), limit),
        "fundamentalDataGates": fundamental_gate_count,
        "units": {"marketCap": "USD billions", "roic": "percent", "returns": "percent"},
        "filters": {
            "minMarketCap": min_market_cap,
            "maxPE": max_pe,
            "maxBeta": max_beta,
            "minROIC": min_roic,
            "positiveDay": positive_day,
            "above200dma": above_200dma,
            "positive1Y": positive_1y,
            "positive2Y": positive_2y,
        },
        "sort": {"key": sort, "direction": direction},
        "items": passed[:limit],
        "guardrail": (
            "Screener results are discovery candidates only. Missing data never passes an active filter. "
            "ROIC is never silently substituted with ROI. Market cap is normalized to USD billions. "
            "A screener result cannot emit BUY/SELL; every candidate must continue through Evidence Director, GREEN first, "
            "all applicable ATLAS engines, Falsifiers Ω and Investment Committee Ω."
        ),
    }
