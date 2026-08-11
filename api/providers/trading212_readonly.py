from __future__ import annotations

import asyncio
import base64
import os
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any

import httpx
from fastapi import APIRouter, HTTPException, Query

router = APIRouter(prefix="/v1/portfolio", tags=["portfolio"])


@dataclass(slots=True)
class _CacheEntry:
    stored_at: float
    value: Any


_CACHE: dict[str, _CacheEntry] = {}
_LOCKS: dict[str, asyncio.Lock] = {}
_LAST_RATE_HEADERS: dict[str, str] = {}


def _env() -> str:
    value = os.getenv("TRADING212_ENV", "demo").strip().lower()
    return "live" if value == "live" else "demo"


def _base_url() -> str:
    return "https://live.trading212.com/api/v0" if _env() == "live" else "https://demo.trading212.com/api/v0"


def _credentials() -> tuple[str, str]:
    key = os.getenv("TRADING212_API_KEY", "").strip()
    secret = os.getenv("TRADING212_API_SECRET", "").strip()
    if not key or not secret:
        raise HTTPException(status_code=503, detail="Trading 212 read-only credentials are not configured")
    return key, secret


def configured() -> bool:
    return bool(os.getenv("TRADING212_API_KEY", "").strip() and os.getenv("TRADING212_API_SECRET", "").strip())


def _auth_header() -> str:
    key, secret = _credentials()
    raw = f"{key}:{secret}".encode("utf-8")
    return "Basic " + base64.b64encode(raw).decode("ascii")


def _symbol_from_broker_ticker(ticker: str) -> str:
    """Best-effort ATLAS symbol from a T212 ticker.

    T212's full instrument object remains attached to every position. This
    helper only supplies a convenient analysis candidate; international symbol
    resolution can later use the cached instrument metadata/ISIN map.
    """
    value = ticker.strip().upper()
    if not value:
        return value
    if "_" in value:
        return value.split("_", 1)[0]
    return value


def _cache_ttl(path: str) -> float:
    if path == "/equity/positions":
        return 3.0
    if path == "/equity/account/summary":
        return 6.0
    if path == "/equity/metadata/instruments":
        return 600.0
    return 5.0


def _stale_ttl(path: str) -> float:
    if path == "/equity/metadata/instruments":
        return 3_600.0
    return 60.0


def _cache_key(path: str, params: dict[str, Any] | None) -> str:
    if not params:
        return path
    suffix = "&".join(f"{key}={params[key]}" for key in sorted(params))
    return f"{path}?{suffix}"


def _capture_rate_headers(headers: httpx.Headers) -> None:
    for key in ("x-ratelimit-limit", "x-ratelimit-period", "x-ratelimit-remaining", "x-ratelimit-reset"):
        value = headers.get(key)
        if value is not None:
            _LAST_RATE_HEADERS[key] = value


async def _request(path: str, *, params: dict[str, Any] | None = None) -> tuple[Any, str]:
    key = _cache_key(path, params)
    now = time.monotonic()
    cached = _CACHE.get(key)
    if cached and now - cached.stored_at <= _cache_ttl(path):
        return cached.value, "CACHE:FRESH"

    lock = _LOCKS.setdefault(key, asyncio.Lock())
    async with lock:
        now = time.monotonic()
        cached = _CACHE.get(key)
        if cached and now - cached.stored_at <= _cache_ttl(path):
            return cached.value, "CACHE:FRESH"

        headers = {
            "Authorization": _auth_header(),
            "Accept": "application/json",
        }
        timeout = httpx.Timeout(20.0, connect=10.0)
        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.get(f"{_base_url()}{path}", headers=headers, params=params)
        except httpx.RequestError as exc:
            if cached and now - cached.stored_at <= _stale_ttl(path):
                return cached.value, f"CACHE:STALE:{exc.__class__.__name__}"
            raise HTTPException(status_code=502, detail=f"Trading 212 connection failed: {exc.__class__.__name__}") from exc

        _capture_rate_headers(response.headers)
        if response.status_code == 429:
            if cached and now - cached.stored_at <= _stale_ttl(path):
                return cached.value, "CACHE:STALE:429"
            reset = response.headers.get("x-ratelimit-reset")
            detail = "Trading 212 rate limit reached"
            if reset:
                detail += f"; reset={reset}"
            raise HTTPException(status_code=429, detail=detail)
        if response.status_code >= 400:
            try:
                upstream = response.json()
            except ValueError:
                upstream = response.text[:300]
            raise HTTPException(status_code=response.status_code, detail={"provider": "Trading212", "upstream": upstream})

        try:
            payload = response.json()
        except ValueError as exc:
            raise HTTPException(status_code=502, detail="Trading 212 returned non-JSON data") from exc

        _CACHE[key] = _CacheEntry(time.monotonic(), payload)
        return payload, "LIVE"


def _position_row(raw: dict[str, Any]) -> dict[str, Any]:
    instrument = raw.get("instrument") if isinstance(raw.get("instrument"), dict) else {}
    broker_ticker = str(instrument.get("ticker") or raw.get("ticker") or "").strip()
    return {
        "brokerTicker": broker_ticker,
        "analysisSymbol": _symbol_from_broker_ticker(broker_ticker),
        "name": instrument.get("name") or instrument.get("shortName") or broker_ticker,
        "isin": instrument.get("isin"),
        "currency": instrument.get("currencyCode"),
        "quantity": raw.get("quantity"),
        "quantityAvailableForTrading": raw.get("quantityAvailableForTrading"),
        "quantityInPies": raw.get("quantityInPies"),
        "averagePricePaid": raw.get("averagePricePaid"),
        "currentPrice": raw.get("currentPrice"),
        "walletImpact": raw.get("walletImpact"),
        "createdAt": raw.get("createdAt"),
        "instrument": instrument,
    }


@router.get("/status")
async def portfolio_status() -> dict[str, Any]:
    return {
        "provider": "Trading212",
        "environment": _env(),
        "configured": configured(),
        "readOnly": True,
        "rateLimit": dict(_LAST_RATE_HEADERS),
        "guardrail": "This ATLAS portfolio connector exposes no order-placement method. Use a Trading 212 API key with read-only account/portfolio permissions.",
    }


@router.get("/live")
async def live_portfolio() -> dict[str, Any]:
    payload, source_status = await _request("/equity/positions")
    rows = payload if isinstance(payload, list) else []
    positions = [_position_row(item) for item in rows if isinstance(item, dict)]
    return {
        "provider": "Trading212",
        "environment": _env(),
        "readOnly": True,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "sourceStatus": source_status,
        "count": len(positions),
        "positions": positions,
        "rateLimit": dict(_LAST_RATE_HEADERS),
        "guardrail": "Portfolio state is read from Trading 212. ATLAS analysis is separate; broker data never fabricates an investment decision.",
    }


@router.get("/account")
async def live_account() -> dict[str, Any]:
    payload, source_status = await _request("/equity/account/summary")
    return {
        "provider": "Trading212",
        "environment": _env(),
        "readOnly": True,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "sourceStatus": source_status,
        "account": payload,
        "rateLimit": dict(_LAST_RATE_HEADERS),
    }


@router.get("/instruments")
async def instrument_lookup(q: str = Query(..., min_length=1, max_length=80)) -> dict[str, Any]:
    payload, source_status = await _request("/equity/metadata/instruments")
    items = payload if isinstance(payload, list) else []
    needle = q.strip().upper()
    matches: list[dict[str, Any]] = []
    for item in items:
        if not isinstance(item, dict):
            continue
        haystack = " ".join(str(item.get(key, "")) for key in ("ticker", "name", "shortName", "isin", "currencyCode")).upper()
        if needle in haystack:
            matches.append(item)
        if len(matches) >= 25:
            break
    return {
        "provider": "Trading212",
        "environment": _env(),
        "readOnly": True,
        "query": q.strip(),
        "sourceStatus": source_status,
        "count": len(matches),
        "items": matches,
        "rateLimit": dict(_LAST_RATE_HEADERS),
    }
