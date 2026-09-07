from __future__ import annotations

import asyncio
import base64
import hmac
import os
import time
from datetime import date, timedelta
from typing import Any, Literal

import httpx
from fastapi import FastAPI, Header, HTTPException, Query
from pydantic import BaseModel, Field

from api.execution_safety_gate import LiquidityQuoteEvidence, require_liquidity_execution

FINNHUB_BASE_URL = "https://finnhub.io/api/v1"
FINNHUB_TOKEN = os.getenv("FINNHUB_TOKEN", "").strip()

TRADING212_ENV = os.getenv("TRADING212_ENV", "demo").strip().lower()
TRADING212_API_KEY = os.getenv("TRADING212_API_KEY", "").strip()
TRADING212_API_SECRET = os.getenv("TRADING212_API_SECRET", "").strip()
TRADING212_LIVE_TRADING_ENABLED = os.getenv("TRADING212_LIVE_TRADING_ENABLED", "false").strip().lower() == "true"
ATLAS_BROKER_CONTROL_TOKEN = os.getenv("ATLAS_BROKER_CONTROL_TOKEN", "").strip()
TRADING212_BASE_URL = "https://live.trading212.com/api/v0" if TRADING212_ENV == "live" else "https://demo.trading212.com/api/v0"

# E5 CONTROL Ω: live material actions fail closed until a per-order human
# approval bridge exists. An API control token or EXECUTE_LIVE string is not
# proof that Vicente approved one specific material action.
HUMAN_APPROVAL_BRIDGE_STATUS = "NOT_IMPLEMENTED_LIVE_EXECUTION_FAIL_CLOSED"

_INSTRUMENT_CACHE: tuple[float, list[dict[str, Any]]] = (0.0, [])
_INSTRUMENT_CACHE_TTL_SECONDS = 900

app = FastAPI(
    title="ATLAS Ω API",
    version="0.4.0",
    description="Ticker-first intelligence bridge plus E1-E6 controlled broker adapter for ATLAS Ω Mobile.",
)


class MarketOrderRequest(BaseModel):
    ticker: str = Field(min_length=1, max_length=64)
    quantity: float
    extended_hours: bool = False
    confirmation: Literal["EXECUTE_DEMO", "EXECUTE_LIVE"]
    liquidity: LiquidityQuoteEvidence


def _require_token() -> str:
    if not FINNHUB_TOKEN:
        raise HTTPException(status_code=503, detail="FINNHUB_TOKEN is not configured")
    return FINNHUB_TOKEN


def _symbol(value: str) -> str:
    normalized = value.strip().upper()
    if not normalized or len(normalized) > 20:
        raise HTTPException(status_code=400, detail="valid symbol is required")
    return normalized


def _broker_configured() -> bool:
    return bool(TRADING212_API_KEY and TRADING212_API_SECRET and ATLAS_BROKER_CONTROL_TOKEN)


def _require_broker_control(x_atlas_broker_token: str | None) -> None:
    if not _broker_configured():
        raise HTTPException(status_code=503, detail="Trading 212 broker is not fully configured")
    if not x_atlas_broker_token or not hmac.compare_digest(x_atlas_broker_token, ATLAS_BROKER_CONTROL_TOKEN):
        raise HTTPException(status_code=401, detail="Invalid ATLAS broker control token")


def _block_live_material_action() -> None:
    if TRADING212_ENV == "live":
        raise HTTPException(
            status_code=403,
            detail={
                "code": "HUMAN_APPROVAL_REQUIRED",
                "message": "Live material broker actions are fail-closed until ATLAS has a per-order human approval bridge.",
                "architecture": "E3_GATE -> E4_DECISION -> E5_HUMAN_APPROVAL -> EXECUTION",
                "approvalBridge": HUMAN_APPROVAL_BRIDGE_STATUS,
            },
        )


def _trading212_auth_header() -> str:
    raw = f"{TRADING212_API_KEY}:{TRADING212_API_SECRET}".encode("utf-8")
    return f"Basic {base64.b64encode(raw).decode('ascii')}"


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


async def _trading212_request(
    method: str,
    path: str,
    *,
    json: dict[str, Any] | None = None,
    params: dict[str, Any] | None = None,
) -> Any:
    if not TRADING212_API_KEY or not TRADING212_API_SECRET:
        raise HTTPException(status_code=503, detail="Trading 212 credentials are not configured")
    headers = {
        "Authorization": _trading212_auth_header(),
        "Accept": "application/json",
        "Content-Type": "application/json",
    }
    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(20.0, connect=10.0)) as client:
            response = await client.request(
                method,
                f"{TRADING212_BASE_URL}{path}",
                headers=headers,
                json=json,
                params=params,
            )
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=f"Trading 212 connection failed: {exc.__class__.__name__}") from exc
    if response.status_code == 429:
        raise HTTPException(status_code=429, detail="Trading 212 rate limit reached")
    if response.status_code >= 400:
        try:
            upstream = response.json()
        except ValueError:
            upstream = response.text[:300]
        raise HTTPException(status_code=response.status_code, detail={"provider": "Trading212", "upstream": upstream})
    if response.status_code == 204 or not response.content:
        return {"ok": True}
    try:
        return response.json()
    except ValueError as exc:
        raise HTTPException(status_code=502, detail="Trading 212 returned a non-JSON response") from exc


def _clean_metric(raw: Any) -> dict[str, float | int | str | None]:
    if not isinstance(raw, dict):
        return {}
    metric = raw.get("metric") if isinstance(raw.get("metric"), dict) else raw
    return {str(k): v for k, v in metric.items() if isinstance(v, (int, float, str)) or v is None}


async def _get_instruments_cached() -> list[dict[str, Any]]:
    global _INSTRUMENT_CACHE
    cached_at, items = _INSTRUMENT_CACHE
    if items and time.time() - cached_at < _INSTRUMENT_CACHE_TTL_SECONDS:
        return items
    payload = await _trading212_request("GET", "/equity/metadata/instruments")
    instruments = payload if isinstance(payload, list) else []
    instruments = [x for x in instruments if isinstance(x, dict)]
    _INSTRUMENT_CACHE = (time.time(), instruments)
    return instruments


@app.get("/")
async def root() -> dict[str, Any]:
    return {
        "service": "ATLAS Ω API",
        "status": "online",
        "version": "0.4.0",
        "finnhub_configured": bool(FINNHUB_TOKEN),
        "broker": {
            "provider": "Trading212",
            "environment": TRADING212_ENV,
            "configured": _broker_configured(),
            "humanApprovalBridge": HUMAN_APPROVAL_BRIDGE_STATUS,
        },
    }


@app.get("/health")
async def health() -> dict[str, Any]:
    return {
        "ok": True,
        "service": "atlas-omega-api",
        "version": "0.4.0",
        "finnhub_configured": bool(FINNHUB_TOKEN),
        "broker_configured": _broker_configured(),
        "broker_environment": TRADING212_ENV,
        "broker_live_provider_flag": TRADING212_LIVE_TRADING_ENABLED,
        "broker_live_material_execution_authorized": False,
        "human_approval_bridge": HUMAN_APPROVAL_BRIDGE_STATUS,
    }


@app.get("/v1/quote/{symbol}")
async def quote(symbol: str) -> dict[str, Any]:
    normalized = _symbol(symbol)
    return {"symbol": normalized, "source": "Finnhub", "data": await _finnhub_get("/quote", {"symbol": normalized})}


@app.get("/v1/profile/{symbol}")
async def profile(symbol: str) -> dict[str, Any]:
    normalized = _symbol(symbol)
    return {"symbol": normalized, "source": "Finnhub", "data": await _finnhub_get("/stock/profile2", {"symbol": normalized})}


@app.get("/v1/company/{symbol}")
async def company(symbol: str) -> dict[str, Any]:
    normalized = _symbol(symbol)
    today = date.today()
    start = today - timedelta(days=45)
    results = await asyncio.gather(
        _optional("/quote", {"symbol": normalized}),
        _optional("/stock/profile2", {"symbol": normalized}),
        _optional("/stock/metric", {"symbol": normalized, "metric": "all"}),
        _optional("/company-news", {"symbol": normalized, "from": start.isoformat(), "to": today.isoformat()}),
        _optional("/stock/recommendation", {"symbol": normalized}),
    )
    (qd, qs), (pd, ps), (md, ms), (nd, ns), (rd, rs) = results
    qp = qd if isinstance(qd, dict) else {}
    pp = pd if isinstance(pd, dict) else {}
    metrics = _clean_metric(md)
    news = nd if isinstance(nd, list) else []
    recs = rd if isinstance(rd, list) else []
    if not qp and not pp and not metrics:
        raise HTTPException(status_code=404, detail=f"No data returned for {normalized}")
    return {
        "symbol": normalized,
        "source": "Finnhub",
        "generatedAt": today.isoformat(),
        "quote": qp,
        "profile": pp,
        "metrics": metrics,
        "news": news[:20],
        "recommendations": recs[:12],
        "sourceStatus": {"quote": qs, "profile": ps, "metrics": ms, "news": ns, "recommendations": rs},
        "guardrail": "ATLAS displays only values returned by the configured provider. Missing values remain unavailable; no synthetic fundamentals are invented.",
    }


@app.get("/v1/discovery")
async def discovery(
    q: str = Query(..., min_length=1, max_length=120),
    exchange: str | None = Query(default=None, max_length=20),
) -> dict[str, Any]:
    params = {"q": q.strip()}
    if exchange:
        params["exchange"] = exchange.strip().upper()
    return {"query": q.strip(), "exchange": exchange, "source": "Finnhub", "data": await _finnhub_get("/search", params)}


@app.get("/v1/broker/status")
async def broker_status() -> dict[str, Any]:
    return {
        "provider": "Trading212",
        "environment": TRADING212_ENV,
        "configured": _broker_configured(),
        "providerLiveFlag": TRADING212_LIVE_TRADING_ENABLED,
        "liveExecutionLocked": True if TRADING212_ENV == "live" else True,
        "humanApprovalBridge": HUMAN_APPROVAL_BRIDGE_STATUS,
        "mode": "LIVE_READ_ONLY" if TRADING212_ENV == "live" else "PAPER",
        "guardrail": "Live material orders/cancellations are blocked until a per-order human approval bridge exists. Demo execution remains available for validation.",
    }


@app.get("/v1/broker/account")
async def broker_account(x_atlas_broker_token: str | None = Header(default=None)) -> dict[str, Any]:
    _require_broker_control(x_atlas_broker_token)
    return {"provider": "Trading212", "environment": TRADING212_ENV, "data": await _trading212_request("GET", "/equity/account/summary")}


@app.get("/v1/broker/positions")
async def broker_positions(x_atlas_broker_token: str | None = Header(default=None)) -> dict[str, Any]:
    _require_broker_control(x_atlas_broker_token)
    return {"provider": "Trading212", "environment": TRADING212_ENV, "data": await _trading212_request("GET", "/equity/positions")}


@app.get("/v1/broker/orders")
async def broker_orders(x_atlas_broker_token: str | None = Header(default=None)) -> dict[str, Any]:
    _require_broker_control(x_atlas_broker_token)
    return {"provider": "Trading212", "environment": TRADING212_ENV, "data": await _trading212_request("GET", "/equity/orders")}


@app.get("/v1/broker/instruments/search")
async def broker_instruments_search(
    q: str = Query(..., min_length=1, max_length=80),
    x_atlas_broker_token: str | None = Header(default=None),
) -> dict[str, Any]:
    _require_broker_control(x_atlas_broker_token)
    needle = q.strip().upper()
    instruments = await _get_instruments_cached()
    matches = []
    for item in instruments:
        if needle in " ".join(str(item.get(k, "")) for k in ("ticker", "name", "shortName", "isin", "currencyCode")).upper():
            matches.append(item)
        if len(matches) >= 25:
            break
    return {"query": q.strip(), "count": len(matches), "items": matches}


@app.post("/v1/broker/orders/market")
async def broker_market_order(
    order: MarketOrderRequest,
    x_atlas_broker_token: str | None = Header(default=None),
) -> dict[str, Any]:
    _require_broker_control(x_atlas_broker_token)
    _block_live_material_action()
    ticker = order.ticker.strip()
    if not ticker or order.quantity == 0:
        raise HTTPException(status_code=400, detail="ticker and non-zero quantity are required")
    if order.confirmation != "EXECUTE_DEMO":
        raise HTTPException(status_code=400, detail="confirmation must be EXECUTE_DEMO while live human-approval bridge is unavailable")
    liquidity_gate = require_liquidity_execution(
        order_ticker=ticker,
        quantity=order.quantity,
        order_type="MARKET",
        evidence=order.liquidity,
    )
    data = await _trading212_request(
        "POST",
        "/equity/orders/market",
        json={"ticker": ticker, "quantity": order.quantity, "extendedHours": order.extended_hours},
    )
    return {
        "provider": "Trading212",
        "environment": TRADING212_ENV,
        "mode": "PAPER",
        "order": data,
        "audit": {
            "requestedTicker": ticker,
            "requestedQuantity": order.quantity,
            "extendedHours": order.extended_hours,
            "liquiditySpreadGate": liquidity_gate,
            "humanApprovalBridge": HUMAN_APPROVAL_BRIDGE_STATUS,
        },
    }


@app.delete("/v1/broker/orders/{order_id}")
async def broker_cancel_order(
    order_id: int,
    x_atlas_broker_token: str | None = Header(default=None),
) -> dict[str, Any]:
    _require_broker_control(x_atlas_broker_token)
    _block_live_material_action()
    return {
        "provider": "Trading212",
        "environment": TRADING212_ENV,
        "orderId": order_id,
        "result": await _trading212_request("DELETE", f"/equity/orders/{order_id}"),
    }


# Production compatibility surface: Render can retain api.main:app in its dashboard
# even when the Blueprint specifies api.app:app. Mount every contract required by
# the live certification on this legacy entrypoint as well.
from api.global_capex_chain_mobile import router as _global_capex_chain_mobile_router  # noqa: E402
from api.mobile_v2 import router as _mobile_v2_router  # noqa: E402
from api.mobile_audit_omega import router as _mobile_audit_omega_router  # noqa: E402
from api.mobile_catalysts import router as _mobile_catalysts_router  # noqa: E402
from api.trading212_controlled import router as _trading212_v2_router  # noqa: E402
from api.agentic_omega import router as _agentic_omega_router  # noqa: E402
from api.agentic_omega_v2 import router as _agentic_omega_v2_router  # noqa: E402
from api.agentic_evidence_bridge import router as _agentic_evidence_bridge_router  # noqa: E402
from api.agentic_governance import router as _agentic_governance_router  # noqa: E402

app.include_router(_mobile_v2_router)
app.include_router(_mobile_audit_omega_router)
app.include_router(_mobile_catalysts_router)
app.include_router(_trading212_v2_router)
app.include_router(_global_capex_chain_mobile_router)
app.include_router(_agentic_omega_router)
app.include_router(_agentic_omega_v2_router)
app.include_router(_agentic_evidence_bridge_router)
app.include_router(_agentic_governance_router)
