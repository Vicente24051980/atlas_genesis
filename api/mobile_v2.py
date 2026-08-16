from __future__ import annotations

import asyncio
import os
import re
from datetime import datetime, timezone
from typing import Any

import httpx
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/v1/mobile", tags=["mobile-v2"])

FDN_BASE_URL = "https://financialdata.net/api/v1"
FDN_API_KEY = os.getenv("FINANCIALDATANET_API_KEY", "").strip()

PORTFOLIO_36 = [
    "GOOGL", "MSFT", "AMZN", "TSM", "ASML", "FTNT", "PWR", "SU.PA", "GE",
    "MP", "CB", "ALNY", "ARGX", "EXENS.PA", "HWM", "AEM", "KKR", "IOT",
    "LNG", "AXON", "ADYEN", "NU", "HALO", "VST", "GEV", "RDDT", "TJX",
    "CRDO", "WISE", "RBRK", "NXT", "WST", "FTAI", "PLMR", "SE", "NVDA",
]


def _symbol(value: str) -> str:
    symbol = value.strip().upper()
    if not symbol or len(symbol) > 24 or not re.fullmatch(r"[A-Z0-9.\-]+", symbol):
        raise HTTPException(status_code=400, detail="valid ticker is required")
    return symbol


def _records(payload: Any) -> list[dict[str, Any]]:
    if isinstance(payload, list):
        return [item for item in payload if isinstance(item, dict)]
    if isinstance(payload, dict):
        for key in ("data", "results", "items"):
            nested = payload.get(key)
            if isinstance(nested, list):
                return [item for item in nested if isinstance(item, dict)]
        return [payload]
    return []


def _first(payload: Any) -> dict[str, Any]:
    rows = _records(payload)
    return rows[0] if rows else {}


def _key(value: str) -> str:
    return re.sub(r"[^a-z0-9]", "", value.lower())


def _pick(record: dict[str, Any], *names: str) -> Any:
    normalized = {_key(str(k)): v for k, v in record.items()}
    for name in names:
        candidate = normalized.get(_key(name))
        if candidate not in (None, ""):
            return candidate
    return None


def _trim_rows(payload: Any, limit: int = 8) -> list[dict[str, Any]]:
    return _records(payload)[:limit]


async def _fdn_get(endpoint: str, params: dict[str, Any]) -> Any:
    if not FDN_API_KEY:
        raise HTTPException(status_code=503, detail="FinancialData.Net is not configured on the server")
    timeout = httpx.Timeout(20.0, connect=8.0)
    query = dict(params)
    query["key"] = FDN_API_KEY
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.get(f"{FDN_BASE_URL}/{endpoint}", params=query)
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=f"FinancialData.Net connection failed: {exc.__class__.__name__}") from exc
    if response.status_code == 429:
        raise HTTPException(status_code=429, detail="FinancialData.Net rate limit reached")
    if response.status_code >= 400:
        raise HTTPException(status_code=502, detail=f"FinancialData.Net upstream error: HTTP {response.status_code}")
    try:
        return response.json()
    except ValueError as exc:
        raise HTTPException(status_code=502, detail="FinancialData.Net returned non-JSON data") from exc


async def _fdn_optional(endpoint: str, params: dict[str, Any]) -> tuple[Any, str]:
    try:
        return await _fdn_get(endpoint, params), "OK"
    except HTTPException as exc:
        return None, f"UNAVAILABLE:{exc.status_code}"


def _summary_from_sections(symbol: str, sections: dict[str, Any]) -> dict[str, Any]:
    company = _first(sections.get("company"))
    quote = _first(sections.get("quote"))
    metrics = _first(sections.get("keyMetrics"))
    valuation = _first(sections.get("valuation"))
    market_cap = _first(sections.get("marketCap"))
    income = _first(sections.get("incomeStatement"))
    cash_flow = _first(sections.get("cashFlow"))

    return {
        "ticker": symbol,
        "name": _pick(company, "registrant_name", "registrantName", "name", "companyName", "company_name") or symbol,
        "currency": _pick(income, "currency_code", "currencyCode") or _pick(company, "currency", "reportingCurrency", "currencyCode"),
        "industry": _pick(company, "industry", "sic_description", "industryName"),
        "sector": _pick(company, "sector", "sectorName"),
        "price": _pick(quote, "price", "lastPrice", "last_price", "close", "adjClose", "adj_close", "c"),
        "marketCap": _pick(market_cap, "market_cap", "marketCap", "marketCapitalization") or _pick(company, "market_cap", "marketCap") or _pick(metrics, "market_cap", "marketCap"),
        "pe": _pick(metrics, "price_to_earnings_ratio", "peRatio", "pe") or _pick(valuation, "price_to_earnings_ratio", "price_earnings_ratio", "peRatio", "priceEarningsRatio"),
        "revenue": _pick(income, "revenue", "total_revenue", "totalRevenue") or _pick(metrics, "revenue", "revenueTTM", "totalRevenue"),
        "freeCashFlow": _pick(metrics, "free_cash_flow", "freeCashFlow", "fcf") or _pick(cash_flow, "free_cash_flow", "freeCashFlow", "fcf"),
    }


async def _fdn_company_bundle(symbol: str) -> dict[str, Any]:
    international = "." in symbol
    endpoints: list[tuple[str, str, dict[str, Any]]] = [
        ("company", "international-company-information" if international else "company-information", {"identifier": symbol}),
        ("quote", "international-stock-prices" if international else "stock-quotes", {"identifier": symbol} if international else {"identifiers": symbol}),
        ("keyMetrics", "international-key-metrics" if international else "key-metrics", {"identifier": symbol}),
        ("incomeStatement", "international-income-statements" if international else "income-statements", {"identifier": symbol, "period": "year"}),
        ("cashFlow", "international-cash-flow-statements" if international else "cash-flow-statements", {"identifier": symbol, "period": "year"}),
    ]
    if not international:
        endpoints.extend([
            ("valuation", "valuation-ratios", {"identifier": symbol, "period": "year"}),
            ("profitability", "profitability-ratios", {"identifier": symbol, "period": "year"}),
            ("marketCap", "market-cap", {"identifier": symbol}),
        ])

    results = await asyncio.gather(*[_fdn_optional(endpoint, params) for _, endpoint, params in endpoints])
    sections: dict[str, Any] = {}
    status: dict[str, str] = {}
    for (name, _, _), (payload, state) in zip(endpoints, results):
        sections[name] = _trim_rows(payload)
        status[name] = state

    if not any(sections.values()):
        raise HTTPException(status_code=502, detail=f"FinancialData.Net returned no usable data for {symbol}")

    return {
        "symbol": symbol,
        "provider": "FinancialData.Net",
        "providerMode": "international" if international else "us",
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "summary": _summary_from_sections(symbol, sections),
        "sections": sections,
        "sourceStatus": status,
        "guardrails": [
            "FinancialData.Net is a secondary quantitative provider; primary filings remain authoritative for thesis-changing claims.",
            "MARKET_CAP_CHANGE is never classified as CAPITAL_FLOW.",
            "Missing provider values remain null/unavailable and are not synthesized.",
        ],
    }


async def _finnhub_company_bundle(symbol: str) -> dict[str, Any]:
    from api import main as legacy

    if not legacy.FINNHUB_TOKEN:
        raise HTTPException(status_code=503, detail="No configured fallback market-data provider")
    (quote, quote_state), (profile, profile_state), (metrics, metric_state) = await asyncio.gather(
        legacy._optional("/quote", {"symbol": symbol}),
        legacy._optional("/stock/profile2", {"symbol": symbol}),
        legacy._optional("/stock/metric", {"symbol": symbol, "metric": "all"}),
    )
    q = quote if isinstance(quote, dict) else {}
    p = profile if isinstance(profile, dict) else {}
    metric_record = metrics.get("metric", {}) if isinstance(metrics, dict) and isinstance(metrics.get("metric"), dict) else (metrics if isinstance(metrics, dict) else {})
    return {
        "symbol": symbol,
        "provider": "Finnhub",
        "providerMode": "fallback",
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "summary": {
            "ticker": symbol,
            "name": p.get("name") or symbol,
            "currency": p.get("currency"),
            "industry": p.get("finnhubIndustry"),
            "sector": p.get("finnhubIndustry"),
            "price": q.get("c"),
            "marketCap": p.get("marketCapitalization") or metric_record.get("marketCapitalization"),
            "pe": metric_record.get("peBasicExclExtraTTM") or metric_record.get("peTTM"),
            "revenue": metric_record.get("revenuePerShareTTM"),
            "freeCashFlow": metric_record.get("freeCashFlowPerShareTTM"),
        },
        "sections": {"quote": [q] if q else [], "company": [p] if p else [], "keyMetrics": [metric_record] if metric_record else []},
        "sourceStatus": {"quote": quote_state, "company": profile_state, "keyMetrics": metric_state},
        "guardrails": ["Fallback provider active. Missing values are not fabricated."],
    }


@router.get("/health")
async def mobile_health() -> dict[str, Any]:
    from api import main as legacy

    return {
        "ok": True,
        "service": "atlas-mobile-v2",
        "version": "1.0.1",
        "financialdatanet_configured": bool(FDN_API_KEY),
        "finnhub_configured": bool(legacy.FINNHUB_TOKEN),
        "preferred_provider": "FinancialData.Net" if FDN_API_KEY else ("Finnhub" if legacy.FINNHUB_TOKEN else "none"),
        "apiKeyExposed": False,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/company/{ticker}")
async def mobile_company(ticker: str) -> dict[str, Any]:
    symbol = _symbol(ticker)
    if FDN_API_KEY:
        try:
            return await _fdn_company_bundle(symbol)
        except HTTPException as exc:
            if exc.status_code not in {429, 502, 503}:
                raise
            fallback = await _finnhub_company_bundle(symbol)
            fallback["fallbackReason"] = f"FinancialData.Net unavailable: HTTP {exc.status_code}"
            return fallback
    return await _finnhub_company_bundle(symbol)


@router.get("/portfolio")
async def mobile_portfolio() -> dict[str, Any]:
    return {
        "snapshotId": "ATLAS-PORTFOLIO-36-2026-08-15",
        "count": len(PORTFOLIO_36),
        "items": [{"ticker": ticker} for ticker in PORTFOLIO_36],
        "guardrail": "Portfolio snapshot is read-only in the app. Structural changes require explicit ATLAS portfolio governance.",
    }
