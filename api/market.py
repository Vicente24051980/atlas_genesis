from __future__ import annotations

import asyncio
import csv
import io
import time
from datetime import date, timedelta
from typing import Any, Literal

import httpx
from fastapi import APIRouter, HTTPException, Query

router = APIRouter(prefix="/v1/market", tags=["market"])

STOOQ_QUOTE_URL = "https://stooq.com/q/l/"
STOOQ_HISTORY_URL = "https://stooq.com/q/d/l/"
CACHE_TTL_SECONDS = 180

# This catalogue is discovery UI infrastructure, not an ATLAS investment ranking.
# It intentionally mixes sectors and themes; scores/BUY decisions live elsewhere.
CATALOGUE: list[dict[str, str]] = [
    {"symbol": "AAPL", "name": "Apple", "sector": "Technology"},
    {"symbol": "MSFT", "name": "Microsoft", "sector": "Technology"},
    {"symbol": "NVDA", "name": "NVIDIA", "sector": "Semiconductors"},
    {"symbol": "AMZN", "name": "Amazon", "sector": "Consumer / Cloud"},
    {"symbol": "GOOGL", "name": "Alphabet", "sector": "Internet / Cloud"},
    {"symbol": "META", "name": "Meta Platforms", "sector": "Internet"},
    {"symbol": "AVGO", "name": "Broadcom", "sector": "Semiconductors"},
    {"symbol": "TSLA", "name": "Tesla", "sector": "Automotive"},
    {"symbol": "AMD", "name": "Advanced Micro Devices", "sector": "Semiconductors"},
    {"symbol": "QCOM", "name": "Qualcomm", "sector": "Semiconductors"},
    {"symbol": "MU", "name": "Micron Technology", "sector": "Semiconductors"},
    {"symbol": "PANW", "name": "Palo Alto Networks", "sector": "Cybersecurity"},
    {"symbol": "CRWD", "name": "CrowdStrike", "sector": "Cybersecurity"},
    {"symbol": "NET", "name": "Cloudflare", "sector": "Cloud / Security"},
    {"symbol": "OKTA", "name": "Okta", "sector": "Identity"},
    {"symbol": "ZS", "name": "Zscaler", "sector": "Cybersecurity"},
    {"symbol": "ANET", "name": "Arista Networks", "sector": "Networking"},
    {"symbol": "VRT", "name": "Vertiv", "sector": "Data Centers"},
    {"symbol": "ETN", "name": "Eaton", "sector": "Electrical"},
    {"symbol": "APH", "name": "Amphenol", "sector": "Electronics"},
    {"symbol": "GE", "name": "GE Aerospace", "sector": "Aerospace"},
    {"symbol": "CAT", "name": "Caterpillar", "sector": "Industrials"},
    {"symbol": "LIN", "name": "Linde", "sector": "Industrial Gases"},
    {"symbol": "JPM", "name": "JPMorgan Chase", "sector": "Financials"},
    {"symbol": "V", "name": "Visa", "sector": "Payments"},
    {"symbol": "MA", "name": "Mastercard", "sector": "Payments"},
    {"symbol": "LLY", "name": "Eli Lilly", "sector": "Healthcare"},
    {"symbol": "ABBV", "name": "AbbVie", "sector": "Healthcare"},
    {"symbol": "TMO", "name": "Thermo Fisher Scientific", "sector": "Healthcare"},
    {"symbol": "DHR", "name": "Danaher", "sector": "Healthcare"},
    {"symbol": "IDXX", "name": "IDEXX Laboratories", "sector": "Healthcare"},
    {"symbol": "XOM", "name": "Exxon Mobil", "sector": "Energy"},
    {"symbol": "CVX", "name": "Chevron", "sector": "Energy"},
    {"symbol": "COP", "name": "ConocoPhillips", "sector": "Energy"},
    {"symbol": "BA", "name": "Boeing", "sector": "Aerospace"},
    {"symbol": "LMT", "name": "Lockheed Martin", "sector": "Defense"},
    {"symbol": "COST", "name": "Costco", "sector": "Consumer"},
    {"symbol": "WMT", "name": "Walmart", "sector": "Consumer"},
    {"symbol": "NFLX", "name": "Netflix", "sector": "Media"},
    {"symbol": "UBER", "name": "Uber", "sector": "Mobility"},
]

BENCHMARKS: list[dict[str, str]] = [
    {"symbol": "SPY", "name": "S&P 500", "sector": "US Market"},
    {"symbol": "QQQ", "name": "Nasdaq 100", "sector": "US Tech"},
    {"symbol": "DIA", "name": "Dow Jones", "sector": "US Blue Chips"},
    {"symbol": "GLD", "name": "Oro", "sector": "Gold proxy"},
    {"symbol": "USO", "name": "Petróleo", "sector": "Oil proxy"},
]

_CACHE: dict[str, tuple[float, dict[str, Any]]] = {}
_SEMAPHORE = asyncio.Semaphore(8)


def _normalize_symbol(value: str) -> str:
    normalized = value.strip().upper()
    if not normalized or len(normalized) > 20 or not all(ch.isalnum() or ch in ".-" for ch in normalized):
        raise HTTPException(status_code=400, detail="valid symbol is required")
    return normalized


def _stooq_symbol(symbol: str) -> str:
    return symbol.lower().replace(".", "-") + ".us"


def _catalogue_meta(symbol: str) -> dict[str, str]:
    for item in BENCHMARKS + CATALOGUE:
        if item["symbol"] == symbol:
            return item
    return {"symbol": symbol, "name": symbol, "sector": "Market"}


def _to_float(value: Any) -> float | None:
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    return number if number == number else None


async def _get_text(url: str, params: dict[str, Any]) -> str:
    timeout = httpx.Timeout(12.0, connect=6.0)
    headers = {"User-Agent": "ATLAS-Omega-Mobile/1.0", "Accept": "text/csv,*/*"}
    async with _SEMAPHORE:
        try:
            async with httpx.AsyncClient(timeout=timeout, follow_redirects=True) as client:
                response = await client.get(url, params=params, headers=headers)
        except httpx.RequestError as exc:
            raise HTTPException(status_code=502, detail=f"market provider connection failed: {exc.__class__.__name__}") from exc
    if response.status_code >= 400:
        raise HTTPException(status_code=502, detail=f"market provider HTTP {response.status_code}")
    return response.text


def _parse_csv(text: str) -> list[dict[str, str]]:
    if not text.strip():
        return []
    return [dict(row) for row in csv.DictReader(io.StringIO(text))]


async def _quote_uncached(symbol: str) -> dict[str, Any]:
    normalized = _normalize_symbol(symbol)
    stooq = _stooq_symbol(normalized)
    today = date.today()
    start = today - timedelta(days=14)

    quote_text, history_text = await asyncio.gather(
        _get_text(STOOQ_QUOTE_URL, {"s": stooq, "f": "sd2t2ohlcv", "h": "", "e": "csv"}),
        _get_text(STOOQ_HISTORY_URL, {"s": stooq, "d1": start.strftime("%Y%m%d"), "d2": today.strftime("%Y%m%d"), "i": "d"}),
    )

    quote_rows = _parse_csv(quote_text)
    history_rows = _parse_csv(history_text)
    quote_row = quote_rows[-1] if quote_rows else None
    if not quote_row or str(quote_row.get("Close", "")).upper() in {"N/D", "N/A", ""}:
        raise HTTPException(status_code=404, detail=f"No market quote returned for {normalized}")

    close = _to_float(quote_row.get("Close"))
    open_price = _to_float(quote_row.get("Open"))
    high = _to_float(quote_row.get("High"))
    low = _to_float(quote_row.get("Low"))
    volume = _to_float(quote_row.get("Volume"))
    quote_date = str(quote_row.get("Date") or "")

    usable_history = [row for row in history_rows if _to_float(row.get("Close")) is not None]
    previous_close: float | None = None
    if usable_history:
        latest_history = usable_history[-1]
        if str(latest_history.get("Date") or "") == quote_date and len(usable_history) >= 2:
            previous_close = _to_float(usable_history[-2].get("Close"))
        else:
            previous_close = _to_float(latest_history.get("Close"))

    change = None if close is None or previous_close is None else close - previous_close
    change_pct = None if change is None or previous_close in (None, 0) else change / previous_close * 100
    meta = _catalogue_meta(normalized)

    return {
        "symbol": normalized,
        "name": meta["name"],
        "sector": meta["sector"],
        "price": close,
        "change": change,
        "changePct": change_pct,
        "open": open_price,
        "high": high,
        "low": low,
        "previousClose": previous_close,
        "volume": volume,
        "asOfDate": quote_date or None,
        "asOfTime": quote_row.get("Time") or None,
        "source": "Stooq",
        "delayed": True,
    }


async def get_market_quote(symbol: str) -> dict[str, Any]:
    normalized = _normalize_symbol(symbol)
    cached = _CACHE.get(normalized)
    now = time.time()
    if cached and now - cached[0] < CACHE_TTL_SECONDS:
        return cached[1]
    result = await _quote_uncached(normalized)
    _CACHE[normalized] = (now, result)
    return result


async def _safe_quote(symbol: str) -> dict[str, Any] | None:
    try:
        return await get_market_quote(symbol)
    except HTTPException:
        return None


async def _quotes_for(items: list[dict[str, str]]) -> list[dict[str, Any]]:
    results = await asyncio.gather(*(_safe_quote(item["symbol"]) for item in items))
    return [result for result in results if result is not None]


@router.get("/quote/{symbol}")
async def market_quote(symbol: str) -> dict[str, Any]:
    return await get_market_quote(symbol)


@router.get("/snapshot")
async def market_snapshot() -> dict[str, Any]:
    items = await _quotes_for(BENCHMARKS)
    return {
        "source": "Stooq",
        "delayed": True,
        "generatedAt": date.today().isoformat(),
        "items": items,
        "guardrail": "Market cards are delayed/reference data. They are not execution prices and do not create BUY/SELL signals.",
    }


@router.get("/scanner")
async def market_scanner(
    direction: Literal["all", "up", "down"] = Query(default="all"),
    limit: int = Query(default=20, ge=1, le=40),
) -> dict[str, Any]:
    quotes = await _quotes_for(CATALOGUE)
    if direction == "up":
        quotes = [item for item in quotes if (item.get("changePct") or 0) > 0]
    elif direction == "down":
        quotes = [item for item in quotes if (item.get("changePct") or 0) < 0]

    quotes.sort(key=lambda item: abs(float(item.get("changePct") or 0)), reverse=True)
    return {
        "source": "Stooq",
        "delayed": True,
        "generatedAt": date.today().isoformat(),
        "direction": direction,
        "count": min(len(quotes), limit),
        "items": quotes[:limit],
        "guardrail": "Scanner ranks daily movement only. ATLAS full analysis is a separate step and this endpoint never emits BUY/SELL.",
    }


@router.get("/search")
async def market_search(q: str = Query(..., min_length=1, max_length=60), limit: int = Query(default=12, ge=1, le=25)) -> dict[str, Any]:
    needle = q.strip().upper()
    matches: list[dict[str, str]] = []
    for item in CATALOGUE + BENCHMARKS:
        haystack = f"{item['symbol']} {item['name']} {item['sector']}".upper()
        if needle in haystack:
            matches.append(item)
        if len(matches) >= limit:
            break
    if not matches and all(ch.isalnum() or ch in ".-" for ch in needle):
        matches.append({"symbol": needle, "name": needle, "sector": "Direct ticker lookup"})
    return {"query": q.strip(), "count": len(matches), "items": matches}
