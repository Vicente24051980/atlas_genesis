from __future__ import annotations

import asyncio
import os
from datetime import date, timedelta
from typing import Any

import httpx
from fastapi import FastAPI, HTTPException, Query

FINNHUB_BASE_URL = "https://finnhub.io/api/v1"
FINNHUB_TOKEN = os.getenv("FINNHUB_TOKEN", "").strip()

app = FastAPI(
    title="ATLAS Ω API",
    version="0.2.0",
    description="Online ticker-first market and company intelligence bridge for ATLAS Ω Mobile.",
)


def _require_token() -> str:
    if not FINNHUB_TOKEN:
        raise HTTPException(status_code=503, detail="FINNHUB_TOKEN is not configured")
    return FINNHUB_TOKEN


def _symbol(value: str) -> str:
    normalized = value.strip().upper()
    if not normalized or len(normalized) > 20:
        raise HTTPException(status_code=400, detail="valid symbol is required")
    return normalized


async def _finnhub_get(path: str, params: dict[str, Any]) -> Any:
    token = _require_token()
    headers = {"X-Finnhub-Token": token}
    timeout = httpx.Timeout(20.0, connect=10.0)
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


async def _optional(path: str, params: dict[str, Any]) -> tuple[Any, str]:
    try:
        return await _finnhub_get(path, params), "OK"
    except HTTPException as exc:
        return None, f"UNAVAILABLE:{exc.status_code}"


def _clean_metric(raw: Any) -> dict[str, float | int | str | None]:
    if not isinstance(raw, dict):
        return {}
    metric = raw.get("metric") if isinstance(raw.get("metric"), dict) else raw
    result: dict[str, float | int | str | None] = {}
    for key, value in metric.items():
        if isinstance(value, (int, float, str)) or value is None:
            result[str(key)] = value
    return result


@app.get("/")
async def root() -> dict[str, Any]:
    return {"service": "ATLAS Ω API", "status": "online", "version": "0.2.0", "finnhub_configured": bool(FINNHUB_TOKEN)}


@app.get("/health")
async def health() -> dict[str, Any]:
    return {"ok": True, "service": "atlas-omega-api", "version": "0.2.0", "finnhub_configured": bool(FINNHUB_TOKEN)}


@app.get("/v1/quote/{symbol}")
async def quote(symbol: str) -> dict[str, Any]:
    normalized = _symbol(symbol)
    data = await _finnhub_get("/quote", {"symbol": normalized})
    return {"symbol": normalized, "source": "Finnhub", "data": data}


@app.get("/v1/profile/{symbol}")
async def profile(symbol: str) -> dict[str, Any]:
    normalized = _symbol(symbol)
    data = await _finnhub_get("/stock/profile2", {"symbol": normalized})
    return {"symbol": normalized, "source": "Finnhub", "data": data}


@app.get("/v1/company/{symbol}")
async def company(symbol: str) -> dict[str, Any]:
    normalized = _symbol(symbol)
    today = date.today()
    start = today - timedelta(days=45)
    (quote_data, quote_status), (profile_data, profile_status), (metric_data, metric_status), (news_data, news_status), (recommendation_data, recommendation_status) = await asyncio.gather(
        _optional("/quote", {"symbol": normalized}),
        _optional("/stock/profile2", {"symbol": normalized}),
        _optional("/stock/metric", {"symbol": normalized, "metric": "all"}),
        _optional("/company-news", {"symbol": normalized, "from": start.isoformat(), "to": today.isoformat()}),
        _optional("/stock/recommendation", {"symbol": normalized}),
    )
    quote_payload = quote_data if isinstance(quote_data, dict) else {}
    profile_payload = profile_data if isinstance(profile_data, dict) else {}
    metrics = _clean_metric(metric_data)
    news = news_data if isinstance(news_data, list) else []
    recommendations = recommendation_data if isinstance(recommendation_data, list) else []
    if not quote_payload and not profile_payload and not metrics:
        raise HTTPException(status_code=404, detail=f"No data returned for {normalized}")
    return {
        "symbol": normalized,
        "source": "Finnhub",
        "generatedAt": today.isoformat(),
        "quote": quote_payload,
        "profile": profile_payload,
        "metrics": metrics,
        "news": news[:20],
        "recommendations": recommendations[:12],
        "sourceStatus": {
            "quote": quote_status,
            "profile": profile_status,
            "metrics": metric_status,
            "news": news_status,
            "recommendations": recommendation_status,
        },
        "guardrail": "ATLAS displays only values returned by the configured provider. Missing values remain unavailable; no synthetic fundamentals are invented.",
    }


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
