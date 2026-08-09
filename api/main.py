from __future__ import annotations

import os
from typing import Any

import httpx
from fastapi import FastAPI, HTTPException, Query

FINNHUB_BASE_URL = "https://finnhub.io/api/v1"
FINNHUB_TOKEN = os.getenv("FINNHUB_TOKEN", "").strip()

app = FastAPI(
    title="ATLAS Ω API",
    version="0.1.0",
    description="Minimal online market-data bridge for ATLAS Ω Mobile.",
)


def _require_token() -> str:
    if not FINNHUB_TOKEN:
        raise HTTPException(status_code=503, detail="FINNHUB_TOKEN is not configured")
    return FINNHUB_TOKEN


async def _finnhub_get(path: str, params: dict[str, Any]) -> Any:
    token = _require_token()
    headers = {"X-Finnhub-Token": token}
    timeout = httpx.Timeout(15.0, connect=10.0)

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.get(f"{FINNHUB_BASE_URL}{path}", params=params, headers=headers)
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=f"Finnhub connection failed: {exc.__class__.__name__}") from exc

    if response.status_code == 429:
        raise HTTPException(status_code=429, detail="Finnhub rate limit reached")
    if response.status_code >= 400:
        raise HTTPException(status_code=502, detail=f"Finnhub upstream error: HTTP {response.status_code}")

    try:
        return response.json()
    except ValueError as exc:
        raise HTTPException(status_code=502, detail="Finnhub returned a non-JSON response") from exc


@app.get("/")
async def root() -> dict[str, Any]:
    return {
        "service": "ATLAS Ω API",
        "status": "online",
        "finnhub_configured": bool(FINNHUB_TOKEN),
    }


@app.get("/health")
async def health() -> dict[str, Any]:
    return {
        "ok": True,
        "service": "atlas-omega-api",
        "finnhub_configured": bool(FINNHUB_TOKEN),
    }


@app.get("/v1/quote/{symbol}")
async def quote(symbol: str) -> dict[str, Any]:
    normalized = symbol.strip().upper()
    if not normalized:
        raise HTTPException(status_code=400, detail="symbol is required")
    data = await _finnhub_get("/quote", {"symbol": normalized})
    return {"symbol": normalized, "source": "Finnhub", "data": data}


@app.get("/v1/profile/{symbol}")
async def profile(symbol: str) -> dict[str, Any]:
    normalized = symbol.strip().upper()
    if not normalized:
        raise HTTPException(status_code=400, detail="symbol is required")
    data = await _finnhub_get("/stock/profile2", {"symbol": normalized})
    return {"symbol": normalized, "source": "Finnhub", "data": data}


@app.get("/v1/discovery")
async def discovery(
    q: str = Query(..., min_length=1, max_length=120),
    exchange: str | None = Query(default=None, max_length=20),
) -> dict[str, Any]:
    params: dict[str, Any] = {"q": q.strip()}
    if exchange:
        params["exchange"] = exchange.strip().upper()
    data = await _finnhub_get("/search", params)
    return {"query": q.strip(), "exchange": exchange, "source": "Finnhub", "data": data}
