from __future__ import annotations

import asyncio
import os
import time
from datetime import datetime, timezone
from typing import Any, Literal

import httpx
from fastapi import APIRouter, HTTPException, Query

from api.market import get_market_quote
from api.tracked_universe import PORTFOLIO, PORTFOLIO_PENDING, SNAPSHOT_ID, SNAPSHOT_STATUS, WATCHLIST

router = APIRouter(prefix="/v1/atlas", tags=["atlas"])

FINNHUB_BASE_URL = "https://finnhub.io/api/v1"
FINNHUB_TOKEN = os.getenv("FINNHUB_TOKEN", "").strip()
CACHE_TTL_SECONDS = 900
_CACHE: dict[str, tuple[float, dict[str, Any]]] = {}
_SEMAPHORE = asyncio.Semaphore(5)

Context = Literal["candidate", "portfolio", "watchlist"]


def _normalize_symbol(value: str) -> str:
    normalized = value.strip().upper()
    if not normalized or len(normalized) > 20 or any(ch not in "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-" for ch in normalized):
        raise HTTPException(status_code=400, detail="valid symbol is required")
    return normalized


def _number(value: Any) -> float | None:
    if isinstance(value, bool):
        return None
    if isinstance(value, (int, float)):
        number = float(value)
        return number if number == number and abs(number) != float("inf") else None
    if isinstance(value, str):
        try:
            number = float(value.replace(",", "").replace("%", "").strip())
            return number if number == number and abs(number) != float("inf") else None
        except ValueError:
            return None
    return None


def _clean_metrics(raw: Any) -> dict[str, Any]:
    if not isinstance(raw, dict):
        return {}
    metric = raw.get("metric") if isinstance(raw.get("metric"), dict) else raw
    return {str(key): value for key, value in metric.items() if isinstance(value, (int, float, str)) or value is None}


def _key(value: str) -> str:
    return "".join(ch.lower() for ch in value if ch.isalnum())


def _metric(metrics: dict[str, Any], aliases: tuple[str, ...]) -> tuple[float | None, str | None]:
    normalized = {_key(key): (key, value) for key, value in metrics.items()}
    for alias in aliases:
        found = normalized.get(_key(alias))
        if found:
            number = _number(found[1])
            if number is not None:
                return number, found[0]
    for alias in aliases:
        needle = _key(alias)
        if len(needle) < 5:
            continue
        for key_norm, (original, value) in normalized.items():
            if needle in key_norm:
                number = _number(value)
                if number is not None:
                    return number, original
    return None, None


def _linear(value: float, low: float, high: float) -> float:
    if high <= low:
        return 0.0
    return max(0.0, min(100.0, (value - low) / (high - low) * 100.0))


def _inverse_band(value: float, best: float, neutral: float, worst: float) -> float:
    if value <= best:
        return 100.0
    if value >= worst:
        return 10.0
    if value <= neutral:
        return 100.0 - (value - best) / max(neutral - best, 1e-9) * 35.0
    return 65.0 - (value - neutral) / max(worst - neutral, 1e-9) * 55.0


def _average(values: list[float]) -> float | None:
    return sum(values) / len(values) if values else None


def _round(value: float | None) -> float | None:
    return None if value is None else round(value, 1)


async def _finnhub(path: str, params: dict[str, Any]) -> Any:
    if not FINNHUB_TOKEN:
        raise HTTPException(status_code=503, detail="FINNHUB_TOKEN is not configured")
    timeout = httpx.Timeout(18.0, connect=8.0)
    headers = {"X-Finnhub-Token": FINNHUB_TOKEN}
    async with _SEMAPHORE:
        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.get(f"{FINNHUB_BASE_URL}{path}", params=params, headers=headers)
        except httpx.RequestError as exc:
            raise HTTPException(status_code=502, detail=f"Finnhub connection failed: {exc.__class__.__name__}") from exc
    if response.status_code == 429:
        raise HTTPException(status_code=429, detail="Finnhub rate limit reached")
    if response.status_code >= 400:
        raise HTTPException(status_code=502, detail=f"Finnhub HTTP {response.status_code}")
    try:
        return response.json()
    except ValueError as exc:
        raise HTTPException(status_code=502, detail="Finnhub returned non-JSON data") from exc


async def _optional(path: str, params: dict[str, Any]) -> tuple[Any, str]:
    try:
        return await _finnhub(path, params), "OK"
    except HTTPException as exc:
        return None, f"UNAVAILABLE:{exc.status_code}"


async def _fundamental_bundle(symbol: str) -> dict[str, Any]:
    normalized = _normalize_symbol(symbol)
    cached = _CACHE.get(normalized)
    now = time.time()
    if cached and now - cached[0] < CACHE_TTL_SECONDS:
        return cached[1]

    metric_result, profile_result, recommendation_result = await asyncio.gather(
        _optional("/stock/metric", {"symbol": normalized, "metric": "all"}),
        _optional("/stock/profile2", {"symbol": normalized}),
        _optional("/stock/recommendation", {"symbol": normalized}),
    )
    metric_raw, metric_status = metric_result
    profile_raw, profile_status = profile_result
    recommendations_raw, recommendation_status = recommendation_result
    result = {
        "metrics": _clean_metrics(metric_raw),
        "profile": profile_raw if isinstance(profile_raw, dict) else {},
        "recommendations": recommendations_raw if isinstance(recommendations_raw, list) else [],
        "sourceStatus": {
            "metrics": metric_status,
            "profile": profile_status,
            "recommendations": recommendation_status,
        },
    }
    _CACHE[normalized] = (now, result)
    return result


def _engine_scores(symbol: str, metrics: dict[str, Any], quote: dict[str, Any] | None, context: Context) -> dict[str, Any]:
    used: dict[str, dict[str, Any]] = {}

    def get(name: str, aliases: tuple[str, ...]) -> float | None:
        value, source_key = _metric(metrics, aliases)
        if value is not None:
            used[name] = {"value": value, "sourceKey": source_key}
        return value

    roi = get("roi", ("roiTTM", "roiAnnual", "returnOnInvestmentTTM", "roicTTM", "roicAnnual"))
    roe = get("roe", ("roeTTM", "roeAnnual", "returnOnEquityTTM"))
    roa = get("roa", ("roaTTM", "roaAnnual", "returnOnAssetsTTM"))
    gross_margin = get("grossMargin", ("grossMarginTTM", "grossMarginAnnual"))
    net_margin = get("netMargin", ("netProfitMarginTTM", "netMarginTTM", "netProfitMarginAnnual"))
    operating_margin = get("operatingMargin", ("operatingMarginTTM", "operatingMarginAnnual"))
    asset_turnover = get("assetTurnover", ("assetTurnoverTTM", "assetTurnoverAnnual"))

    revenue_growth = get("revenueGrowth", ("revenueGrowthTTMYoy", "revenueGrowthTTM", "revenueGrowth5Y", "revenueGrowth3Y"))
    eps_growth = get("epsGrowth", ("epsGrowthTTMYoy", "epsGrowthTTM", "epsGrowth5Y", "epsGrowth3Y"))
    fcf_growth = get("fcfGrowth", ("freeCashFlowGrowth5Y", "freeCashFlowGrowthTTMYoy", "cashFlowPerShareGrowth5Y"))

    pe = get("pe", ("peTTM", "peAnnual", "priceEarningsTTM"))
    forward_pe = get("forwardPE", ("forwardPE", "peExclExtraTTM"))
    pb = get("pb", ("pbAnnual", "pbQuarterly", "priceBookValueTTM"))
    ps = get("ps", ("psTTM", "psAnnual", "priceSalesTTM"))
    dividend_yield = get("dividendYield", ("dividendYieldIndicatedAnnual", "dividendYieldTTM"))

    beta = get("beta", ("beta",))
    debt_equity = get("debtEquity", ("totalDebtToTotalEquityQuarterly", "totalDebtToEquityQuarterly", "totalDebtToTotalEquityAnnual"))
    current_ratio = get("currentRatio", ("currentRatioQuarterly", "currentRatioAnnual"))
    quick_ratio = get("quickRatio", ("quickRatioQuarterly", "quickRatioAnnual"))
    interest_coverage = get("interestCoverage", ("interestCoverageTTM", "interestCoverageAnnual"))

    fcf_per_share = get("fcfPerShare", ("freeCashFlowPerShareTTM", "cashFlowPerShareTTM"))
    capex_per_share = get("capexPerShare", ("capitalSpendingPerShareTTM", "capexPerShareTTM"))

    quality_parts: list[float] = []
    if roi is not None:
        quality_parts.append(_linear(roi, 0.0, 25.0))
    if roe is not None:
        quality_parts.append(_linear(roe, 0.0, 30.0))
    if roa is not None:
        quality_parts.append(_linear(roa, 0.0, 15.0))
    if net_margin is not None:
        quality_parts.append(_linear(net_margin, 0.0, 25.0))
    if operating_margin is not None:
        quality_parts.append(_linear(operating_margin, 0.0, 25.0))
    if asset_turnover is not None:
        quality_parts.append(_linear(asset_turnover, 0.1, 1.5))
    quality = _average(quality_parts)

    growth_parts: list[float] = []
    for value in (revenue_growth, eps_growth, fcf_growth):
        if value is not None:
            growth_parts.append(_linear(value, -5.0, 25.0))
    growth = _average(growth_parts)

    valuation_parts: list[float] = []
    if pe is not None and pe > 0:
        valuation_parts.append(_inverse_band(pe, 15.0, 28.0, 60.0))
    if forward_pe is not None and forward_pe > 0:
        valuation_parts.append(_inverse_band(forward_pe, 15.0, 28.0, 60.0))
    if pb is not None and pb > 0:
        valuation_parts.append(_inverse_band(pb, 2.0, 6.0, 16.0))
    if ps is not None and ps > 0:
        valuation_parts.append(_inverse_band(ps, 2.0, 6.0, 16.0))
    valuation = _average(valuation_parts)

    financial_parts: list[float] = []
    if current_ratio is not None:
        financial_parts.append(_linear(current_ratio, 0.7, 2.0))
    if quick_ratio is not None:
        financial_parts.append(_linear(quick_ratio, 0.5, 1.5))
    if debt_equity is not None:
        financial_parts.append(100.0 - min(100.0, max(0.0, debt_equity / 250.0 * 100.0)))
    if interest_coverage is not None:
        financial_parts.append(_linear(interest_coverage, 1.0, 12.0))
    financial = _average(financial_parts)

    risk_parts: list[float] = []
    if beta is not None:
        risk_parts.append(max(0.0, min(100.0, 18.0 + max(beta - 0.75, 0.0) * 48.0)))
    if debt_equity is not None:
        risk_parts.append(max(0.0, min(100.0, debt_equity / 250.0 * 100.0)))
    if current_ratio is not None:
        risk_parts.append(max(0.0, min(100.0, 72.0 - current_ratio * 28.0)))
    risk = _average(risk_parts)

    # Moat and management are explicitly quantitative proxies here. They never
    # replace primary qualitative evidence in the canonical evidence layer.
    moat_proxy_parts: list[float] = []
    if gross_margin is not None:
        moat_proxy_parts.append(_linear(gross_margin, 20.0, 70.0))
    if roi is not None:
        moat_proxy_parts.append(_linear(roi, 5.0, 30.0))
    if revenue_growth is not None:
        moat_proxy_parts.append(_linear(revenue_growth, 0.0, 18.0))
    moat_proxy = _average(moat_proxy_parts)

    management_proxy_parts: list[float] = []
    if roe is not None:
        management_proxy_parts.append(_linear(roe, 5.0, 30.0))
    if eps_growth is not None:
        management_proxy_parts.append(_linear(eps_growth, -5.0, 20.0))
    if financial is not None:
        management_proxy_parts.append(financial)
    management_proxy = _average(management_proxy_parts)

    canonical_components = {
        "businessQuality": quality,
        "growth": growth,
        "moatProxy": moat_proxy,
        "financialQuality": financial,
        "managementProxy": management_proxy,
        "valuation": valuation,
    }
    canonical_weights = {
        "businessQuality": 0.25,
        "growth": 0.20,
        "moatProxy": 0.15,
        "financialQuality": 0.15,
        "managementProxy": 0.10,
        "valuation": 0.15,
    }
    weighted = 0.0
    available_weight = 0.0
    for key, value in canonical_components.items():
        if value is not None:
            weighted += value * canonical_weights[key]
            available_weight += canonical_weights[key]
    atlas_score = weighted / available_weight if available_weight else None
    score_coverage = min(100.0, available_weight * 100.0)
    metric_coverage = min(100.0, len(used) / 23.0 * 100.0)

    severe_flags: list[str] = []
    watch_flags: list[str] = []
    if debt_equity is not None and debt_equity > 250:
        severe_flags.append("DEBT_LOAD_HIGH")
    if current_ratio is not None and current_ratio < 0.8:
        severe_flags.append("LIQUIDITY_STRESS")
    if revenue_growth is not None and revenue_growth < -5:
        severe_flags.append("REVENUE_CONTRACTION")
    if eps_growth is not None and eps_growth < -10:
        severe_flags.append("EPS_CONTRACTION")
    if risk is not None and risk > 70:
        severe_flags.append("RISK_RED")
    if valuation is not None and valuation < 25:
        watch_flags.append("VALUATION_STRETCHED")
    if growth is not None and growth < 40:
        watch_flags.append("GROWTH_WEAK")
    if quality is not None and quality < 60:
        watch_flags.append("QUALITY_BELOW_ATLAS")

    price_ok = _number((quote or {}).get("price")) is not None
    reasons: list[str] = []
    action: str

    if context == "portfolio":
        if len(severe_flags) >= 2:
            action = "REVIEW"
            reasons.append("Dos o más señales cuantitativas adversas: exige revisión de tesis y evidencia primaria antes de reducir o salir.")
        elif atlas_score is not None and atlas_score >= 74 and valuation is not None and valuation >= 45 and risk is not None and risk <= 55:
            action = "ADD"
            reasons.append("Calidad/crecimiento/valoración cuantitativa compatibles con refuerzo; confirmar sizing y evidencia canónica.")
        elif atlas_score is not None and atlas_score >= 58:
            action = "HOLD"
            reasons.append("La capa cuantitativa no activa deterioro suficiente para cambiar la tesis de cartera.")
        else:
            action = "WAIT"
            reasons.append("Evidencia cuantitativa insuficiente o débil: mantener espera/revisión, no vender por precio.")
    else:
        if score_coverage < 55 or metric_coverage < 35 or not price_ok:
            action = "WAIT"
            reasons.append("Cobertura insuficiente para una entrada auditable.")
        elif severe_flags or (quality is not None and quality < 45) or (growth is not None and growth < 20):
            action = "NO_BUY"
            reasons.append("No supera el filtro cuantitativo de entrada.")
        elif atlas_score is not None and atlas_score >= 72 and quality is not None and quality >= 65 and growth is not None and growth >= 45 and valuation is not None and valuation >= 35 and (risk is None or risk <= 60):
            action = "BUY"
            reasons.append("Supera el Decision Gate Ω cuantitativo con la cobertura disponible.")
        else:
            action = "WAIT"
            reasons.append("Calidad potencial, pero el conjunto precio/crecimiento/riesgo aún no justifica BUY.")

    if watch_flags:
        reasons.append("Vigilancia: " + ", ".join(watch_flags[:3]) + ".")
    if severe_flags:
        reasons.append("Alertas: " + ", ".join(severe_flags[:3]) + ".")
    reasons.append("Moat y Management son proxies cuantitativos; no sustituyen evidencia primaria.")

    capex_status = "INSUFFICIENT_DATA"
    capex_score: float | None = None
    capex_reason = "Finnhub no aporta de forma estable los inputs primarios completos del CAPEX Productivity Ω canónico."
    if fcf_per_share is not None and capex_per_share is not None and capex_per_share != 0 and roi is not None:
        conversion = fcf_per_share / abs(capex_per_share)
        capex_score = max(0.0, min(100.0, _linear(roi, 0.0, 25.0) * 0.55 + _linear(conversion, 0.0, 3.0) * 0.45))
        capex_status = "PARTIAL_SENSOR"
        capex_reason = "Sensor parcial con ROIC/ROI y FCF/CAPEX por acción; no equivale al motor canónico de 7 dimensiones."

    return {
        "symbol": symbol,
        "context": context,
        "action": action,
        "actionLabel": {
            "BUY": "COMPRAR",
            "NO_BUY": "NO COMPRAR",
            "WAIT": "ESPERAR",
            "ADD": "AÑADIR",
            "HOLD": "MANTENER",
            "REVIEW": "REVISAR",
        }[action],
        "atlasScore": _round(atlas_score),
        "scoreCoverage": round(score_coverage, 1),
        "metricCoverage": round(metric_coverage, 1),
        "scores": {
            "businessQuality": _round(quality),
            "growth": _round(growth),
            "moatProxy": _round(moat_proxy),
            "financialQuality": _round(financial),
            "managementProxy": _round(management_proxy),
            "valuation": _round(valuation),
            "risk": _round(risk),
            "capexProductivity": _round(capex_score),
        },
        "engineStates": {
            "businessQuality": "SCORED" if quality is not None else "INSUFFICIENT_DATA",
            "growth": "SCORED" if growth is not None else "INSUFFICIENT_DATA",
            "moat": "QUANT_PROXY" if moat_proxy is not None else "PENDING_PRIMARY_EVIDENCE",
            "financialQuality": "SCORED" if financial is not None else "INSUFFICIENT_DATA",
            "management": "QUANT_PROXY" if management_proxy is not None else "PENDING_PRIMARY_EVIDENCE",
            "valuation": "SCORED" if valuation is not None else "INSUFFICIENT_DATA",
            "risk": "SCORED" if risk is not None else "INSUFFICIENT_DATA",
            "capexProductivity": capex_status,
        },
        "capexReason": capex_reason,
        "reasons": reasons[:5],
        "flags": {"severe": severe_flags, "watch": watch_flags},
        "inputs": used,
        "rawMetrics": metrics,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "algorithmVersion": "ATLAS-OMEGA-MOBILE-DECISION-v1.0.0",
        "guardrail": "Quantitative decision support. Portfolio EXIT is never emitted without confirmed thesis falsifier evidence. Price alone never falsifies a thesis.",
    }


async def analyze_symbol(symbol: str, context: Context = "candidate") -> dict[str, Any]:
    normalized = _normalize_symbol(symbol)
    market_result, fundamentals = await asyncio.gather(
        get_market_quote(normalized),
        _fundamental_bundle(normalized),
    )
    analysis = _engine_scores(normalized, fundamentals["metrics"], market_result, context)
    return {
        "symbol": normalized,
        "quote": market_result,
        "profile": fundamentals["profile"],
        "recommendations": fundamentals["recommendations"][:8],
        "sourceStatus": fundamentals["sourceStatus"],
        "analysis": analysis,
    }


@router.get("/universe")
async def universe() -> dict[str, Any]:
    return {
        "snapshotId": SNAPSHOT_ID,
        "status": SNAPSHOT_STATUS,
        "portfolio": PORTFOLIO,
        "portfolioPending": PORTFOLIO_PENDING,
        "watchlist": WATCHLIST,
        "counts": {
            "portfolio": len(PORTFOLIO),
            "pending": len(PORTFOLIO_PENDING),
            "watchlist": len(WATCHLIST),
        },
        "guardrail": "This is a remotely updateable bootstrap snapshot. Trading 212 is the source of truth for quantities/cost basis when connected.",
    }


@router.get("/analyze/{symbol}")
async def analyze(symbol: str, context: Context = Query(default="candidate")) -> dict[str, Any]:
    return await analyze_symbol(symbol, context)


@router.get("/monitor/{kind}")
async def monitor(
    kind: Literal["portfolio", "watchlist"] = "portfolio",
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=8, ge=1, le=12),
) -> dict[str, Any]:
    source = PORTFOLIO if kind == "portfolio" else WATCHLIST
    page = source[offset: offset + limit]
    context: Context = "portfolio" if kind == "portfolio" else "watchlist"

    async def one(item: dict[str, str]) -> dict[str, Any]:
        symbol = item.get("symbol") or item["ticker"]
        try:
            result = await analyze_symbol(symbol, context)
            return {"item": item, "ok": True, **result}
        except HTTPException as exc:
            return {"item": item, "ok": False, "error": str(exc.detail), "statusCode": exc.status_code}
        except Exception as exc:  # defensive boundary for one ticker; page still returns.
            return {"item": item, "ok": False, "error": exc.__class__.__name__}

    rows = await asyncio.gather(*(one(item) for item in page))
    return {
        "kind": kind,
        "snapshotId": SNAPSHOT_ID,
        "offset": offset,
        "limit": limit,
        "total": len(source),
        "nextOffset": offset + len(page) if offset + len(page) < len(source) else None,
        "items": rows,
        "guardrail": "Batch monitor is paginated to protect provider limits. Missing ticker data does not fail the entire page.",
    }


@router.get("/engines")
async def engines() -> dict[str, Any]:
    return {
        "items": [
            {"id": "core", "name": "ATLAS Core Ω", "state": "ACTIVE", "description": "Quality + Growth + Financial + Valuation + Risk; Moat/Management remain proxy until primary evidence."},
            {"id": "quality", "name": "Business Quality Ω", "state": "ACTIVE", "description": "ROIC/ROI, ROE/ROA, margins and efficiency."},
            {"id": "growth", "name": "Growth Ω", "state": "ACTIVE", "description": "Revenue, EPS and FCF growth."},
            {"id": "capex", "name": "CAPEX Productivity Ω", "state": "PARTIAL_SENSOR", "description": "Canonical engine requires the full seven-dimension primary input set; mobile never fabricates missing inputs."},
            {"id": "valuation", "name": "Valuation Ω", "state": "ACTIVE", "description": "P/E, forward P/E, P/B and P/S sensor layer."},
            {"id": "risk", "name": "Risk Ω", "state": "ACTIVE", "description": "Beta, leverage and liquidity sensor layer."},
            {"id": "rotation", "name": "Money Rotation Ω", "state": "ACTIVE_MARKET_SENSOR", "description": "Sector/macro proxy rotation; never mutates thesis directly."},
            {"id": "dislocation", "name": "Historical Dislocation Ω", "state": "ACTIVE_MARKET_SENSOR", "description": "Contrarian/dislocation queue; routes candidates to full scorer."},
            {"id": "agentic-security", "name": "Agentic Security Discovery Ω", "state": "RESEARCH_QUEUE", "description": "PANW/NET/CRWD/OKTA/ZS capability-discovery branch; requires primary evidence for DISCOVER."},
            {"id": "evidence", "name": "Evidence Ingestion Ω", "state": "ACTIVE", "description": "Classifies evidence before any canonical conviction change."},
        ],
        "algorithm": "GLOBAL DISCOVERY → MARKET FILTERS → BUSINESS QUALITY → GROWTH → CAPEX PRODUCTIVITY → VALUATION → RISK → CATALYSTS → FINAL SCORE Ω",
    }


@router.get("/agentic-security")
async def agentic_security() -> dict[str, Any]:
    return {
        "engine": "Agentic Security Discovery Ω v1.0",
        "status": "RESEARCH_QUEUE",
        "items": [
            {"ticker": "PANW", "role": "Agentic security / runtime / platform", "state": "REQUIRES_PRIMARY_EVIDENCE"},
            {"ticker": "NET", "role": "Zero Trust / edge / AI gateway", "state": "REQUIRES_PRIMARY_EVIDENCE"},
            {"ticker": "CRWD", "role": "Endpoint / identity / behavior", "state": "REQUIRES_PRIMARY_EVIDENCE"},
            {"ticker": "OKTA", "role": "Identity / non-human identity", "state": "REQUIRES_PRIMARY_EVIDENCE"},
            {"ticker": "ZS", "role": "Zero Trust / egress / data controls", "state": "REQUIRES_PRIMARY_EVIDENCE"},
        ],
        "guardrail": "Seed membership never means BUY. DISCOVER requires primary evidence and then routes to ATLAS full scorer.",
    }
