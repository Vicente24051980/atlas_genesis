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
HISTORY_CACHE_TTL_SECONDS = 900

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

SECTOR_PROXIES: list[dict[str, str]] = [
    {"symbol": "XLK", "name": "Technology", "sector": "Technology"},
    {"symbol": "XLV", "name": "Healthcare", "sector": "Healthcare"},
    {"symbol": "XLI", "name": "Industrials", "sector": "Industrials"},
    {"symbol": "XLF", "name": "Financials", "sector": "Financials"},
    {"symbol": "XLE", "name": "Energy", "sector": "Energy"},
    {"symbol": "XLY", "name": "Consumer Discretionary", "sector": "Consumer"},
    {"symbol": "XLP", "name": "Consumer Staples", "sector": "Consumer Staples"},
    {"symbol": "XLU", "name": "Utilities", "sector": "Utilities"},
    {"symbol": "XLB", "name": "Materials", "sector": "Materials"},
    {"symbol": "XLRE", "name": "Real Estate", "sector": "Real Estate"},
    {"symbol": "XLC", "name": "Communication", "sector": "Communication"},
    {"symbol": "IWM", "name": "Small Caps", "sector": "Small Caps"},
]

MACRO_PROXIES: list[dict[str, str]] = [
    {"symbol": "GLD", "name": "Gold", "sector": "Gold"},
    {"symbol": "USO", "name": "Oil", "sector": "Oil"},
    {"symbol": "UUP", "name": "US Dollar", "sector": "Dollar"},
    {"symbol": "TLT", "name": "Long Treasuries", "sector": "Duration"},
    {"symbol": "HYG", "name": "High Yield Credit", "sector": "Credit"},
]

_CACHE: dict[str, tuple[float, dict[str, Any]]] = {}
_HISTORY_CACHE: dict[str, tuple[float, list[dict[str, Any]]]] = {}
_SEMAPHORE = asyncio.Semaphore(8)


def _normalize_symbol(value: str) -> str:
    normalized = value.strip().upper()
    if not normalized or len(normalized) > 20 or not all(ch.isalnum() or ch in ".-" for ch in normalized):
        raise HTTPException(status_code=400, detail="valid symbol is required")
    return normalized


def _stooq_symbol(symbol: str) -> str:
    lower = symbol.lower()
    if lower.endswith(".l"):
        return lower[:-2] + ".uk"
    if lower.endswith(".pa"):
        return lower[:-3] + ".fr"
    if lower.endswith(".de"):
        return lower
    return lower.replace(".", "-") + ".us"


def _catalogue_meta(symbol: str) -> dict[str, str]:
    for item in BENCHMARKS + SECTOR_PROXIES + MACRO_PROXIES + CATALOGUE:
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


async def get_market_history(symbol: str, days: int = 380) -> list[dict[str, Any]]:
    normalized = _normalize_symbol(symbol)
    days = max(10, min(days, 1900))
    cache_key = f"{normalized}:{days}"
    cached = _HISTORY_CACHE.get(cache_key)
    now = time.time()
    if cached and now - cached[0] < HISTORY_CACHE_TTL_SECONDS:
        return cached[1]
    today = date.today()
    start = today - timedelta(days=days)
    text = await _get_text(
        STOOQ_HISTORY_URL,
        {"s": _stooq_symbol(normalized), "d1": start.strftime("%Y%m%d"), "d2": today.strftime("%Y%m%d"), "i": "d"},
    )
    rows = []
    for raw in _parse_csv(text):
        close = _to_float(raw.get("Close"))
        if close is None:
            continue
        rows.append({
            "date": raw.get("Date"),
            "open": _to_float(raw.get("Open")),
            "high": _to_float(raw.get("High")),
            "low": _to_float(raw.get("Low")),
            "close": close,
            "volume": _to_float(raw.get("Volume")),
        })
    if not rows:
        raise HTTPException(status_code=404, detail=f"No market history returned for {normalized}")
    _HISTORY_CACHE[cache_key] = (now, rows)
    return rows


async def _quote_uncached(symbol: str) -> dict[str, Any]:
    normalized = _normalize_symbol(symbol)
    today = date.today()
    start = today - timedelta(days=14)
    quote_text, history_text = await asyncio.gather(
        _get_text(STOOQ_QUOTE_URL, {"s": _stooq_symbol(normalized), "f": "sd2t2ohlcv", "h": "", "e": "csv"}),
        _get_text(STOOQ_HISTORY_URL, {"s": _stooq_symbol(normalized), "d1": start.strftime("%Y%m%d"), "d2": today.strftime("%Y%m%d"), "i": "d"}),
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


def _return(rows: list[dict[str, Any]], sessions: int) -> float | None:
    if len(rows) <= sessions:
        return None
    end = _to_float(rows[-1].get("close"))
    start = _to_float(rows[-1 - sessions].get("close"))
    if end is None or start in (None, 0):
        return None
    return (end / start - 1.0) * 100.0


def _drawdown(rows: list[dict[str, Any]], sessions: int = 252) -> float | None:
    subset = rows[-sessions:] if len(rows) > sessions else rows
    closes = [_to_float(row.get("close")) for row in subset]
    closes = [value for value in closes if value is not None]
    if not closes:
        return None
    peak = max(closes)
    last = closes[-1]
    return None if peak == 0 else (last / peak - 1.0) * 100.0


def _rotation_phase(ret20: float | None, ret60: float | None) -> str:
    if ret20 is None or ret60 is None:
        return "R0_INSUFFICIENT"
    if ret60 < -12 and ret20 < -5:
        return "R2_CAPITULATION"
    if ret60 < -8 and -5 <= ret20 <= 3:
        return "R3_BASE"
    if ret60 < 0 and ret20 > 3:
        return "R4_EARLY_INFLOW"
    if ret60 >= 0 and ret20 > 0:
        return "R5_TREND"
    if ret60 > 12 and ret20 < 0:
        return "R6_LATE_ROTATION"
    return "R1_ABANDONED_OR_TRANSITION"


async def _rotation_item(item: dict[str, str]) -> dict[str, Any] | None:
    try:
        rows = await get_market_history(item["symbol"], 420)
    except HTTPException:
        return None
    ret5 = _return(rows, 5)
    ret20 = _return(rows, 20)
    ret60 = _return(rows, 60)
    ret252 = _return(rows, 252)
    dd = _drawdown(rows, 252)
    phase = _rotation_phase(ret20, ret60)
    score = 50.0
    if ret20 is not None:
        score += max(-20.0, min(20.0, ret20 * 1.6))
    if ret60 is not None:
        score += max(-15.0, min(15.0, ret60 * 0.7))
    if phase == "R4_EARLY_INFLOW":
        score += 15.0
    if phase == "R3_BASE":
        score += 8.0
    return {
        **item,
        "ret5": ret5,
        "ret20": ret20,
        "ret60": ret60,
        "ret252": ret252,
        "drawdown252": dd,
        "phase": phase,
        "rotationScore": max(0.0, min(100.0, round(score, 1))),
        "asOfDate": rows[-1].get("date"),
    }


@router.get("/quote/{symbol}")
async def market_quote(symbol: str) -> dict[str, Any]:
    return await get_market_quote(symbol)


@router.get("/history/{symbol}")
async def market_history(symbol: str, days: int = Query(default=380, ge=10, le=1900)) -> dict[str, Any]:
    rows = await get_market_history(symbol, days)
    return {
        "symbol": _normalize_symbol(symbol),
        "source": "Stooq",
        "delayed": True,
        "rows": rows,
        "returns": {"5d": _return(rows, 5), "20d": _return(rows, 20), "60d": _return(rows, 60), "252d": _return(rows, 252)},
        "drawdown252": _drawdown(rows, 252),
    }


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


@router.get("/overview")
async def market_overview() -> dict[str, Any]:
    benchmark_items, sector_items, macro_items = await asyncio.gather(
        _quotes_for(BENCHMARKS),
        _quotes_for(SECTOR_PROXIES),
        _quotes_for(MACRO_PROXIES),
    )
    return {
        "source": "Stooq",
        "delayed": True,
        "generatedAt": date.today().isoformat(),
        "benchmarks": benchmark_items,
        "sectors": sector_items,
        "macro": macro_items,
        "guardrail": "Sector and macro instruments are liquid proxies used as market-regime sensors, not thesis evidence.",
    }


@router.get("/rotation")
async def market_rotation() -> dict[str, Any]:
    raw = await asyncio.gather(*(_rotation_item(item) for item in SECTOR_PROXIES + MACRO_PROXIES))
    items = [item for item in raw if item is not None]
    items.sort(key=lambda item: float(item.get("rotationScore") or 0), reverse=True)
    return {
        "engine": "MONEY_ROTATION_OMEGA_MARKET_SENSOR_v1",
        "source": "Stooq",
        "delayed": True,
        "items": items,
        "leaders": items[:6],
        "earlyInflows": [item for item in items if item.get("phase") in {"R3_BASE", "R4_EARLY_INFLOW"}],
        "guardrail": "R1-R6 phase is a deterministic price/flow proxy only. It must not alter canonical thesis without business evidence.",
    }


@router.get("/dislocation")
async def market_dislocation(limit: int = Query(default=15, ge=5, le=30)) -> dict[str, Any]:
    raw = await asyncio.gather(*(_rotation_item(item) for item in CATALOGUE))
    items = [item for item in raw if item is not None]
    candidates = [
        item for item in items
        if item.get("ret252") is not None
        and float(item["ret252"]) < 0
        and item.get("ret20") is not None
        and float(item["ret20"]) > 0
    ]
    candidates.sort(key=lambda item: (float(item.get("ret20") or 0), -abs(float(item.get("ret252") or 0))), reverse=True)
    return {
        "engine": "HISTORICAL_DISLOCATION_OMEGA_MARKET_SENSOR_v1",
        "source": "Stooq",
        "delayed": True,
        "items": candidates[:limit],
        "guardrail": "A price dislocation is a research queue signal, never proof that the business is intact or a BUY instruction.",
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
    for item in CATALOGUE + BENCHMARKS + SECTOR_PROXIES + MACRO_PROXIES:
        haystack = f"{item['symbol']} {item['name']} {item['sector']}".upper()
        if needle in haystack:
            matches.append(item)
        if len(matches) >= limit:
            break
    if not matches and all(ch.isalnum() or ch in ".-" for ch in needle):
        matches.append({"symbol": needle, "name": needle, "sector": "Direct ticker lookup"})
    return {"query": q.strip(), "count": len(matches), "items": matches}
