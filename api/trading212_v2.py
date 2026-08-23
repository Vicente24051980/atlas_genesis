from __future__ import annotations

import asyncio
import base64
import hashlib
import hmac
import os
import time
from typing import Any, Literal
from urllib.parse import urlsplit

import httpx
from fastapi import APIRouter, Header, HTTPException, Query
from pydantic import BaseModel, Field

router = APIRouter(prefix="/v1/mobile/broker", tags=["mobile-broker-trading212"])

TRADING212_ENV = os.getenv("TRADING212_ENV", "demo").strip().lower()
TRADING212_API_KEY = os.getenv("TRADING212_API_KEY", "").strip()
TRADING212_API_SECRET = os.getenv("TRADING212_API_SECRET", "").strip()
ATLAS_BROKER_CONTROL_TOKEN = os.getenv("ATLAS_BROKER_CONTROL_TOKEN", "").strip()
TRADING212_LIVE_TRADING_ENABLED = os.getenv("TRADING212_LIVE_TRADING_ENABLED", "false").strip().lower() == "true"

TRADING212_BASE_URLS = {
    "demo": "https://demo.trading212.com/api/v0",
    "live": "https://live.trading212.com/api/v0",
}
TRADING212_BASE_URL = TRADING212_BASE_URLS["live" if TRADING212_ENV == "live" else "demo"]

_INSTRUMENT_CACHE: tuple[float, list[dict[str, Any]]] = (0.0, [])
_INSTRUMENT_CACHE_TTL_SECONDS = 900
_ORDER_REQUEST_IDS: dict[str, float] = {}
_ORDER_REQUEST_ID_TTL_SECONDS = 300
_RATE_LIMIT_READY_AT: dict[str, float] = {}
_RATE_LIMIT_MAX_AUTO_WAIT_SECONDS = 3.0

TimeValidity = Literal["DAY", "GOOD_TILL_CANCEL"]
OrderConfirmation = Literal["EXECUTE_DEMO", "EXECUTE_LIVE"]
OrderType = Literal["market", "limit", "stop", "stop_limit"]


class MarketOrderRequest(BaseModel):
    ticker: str = Field(min_length=1, max_length=64)
    quantity: float
    extendedHours: bool = False
    confirmation: OrderConfirmation
    clientRequestId: str = Field(min_length=8, max_length=128)


class LimitOrderRequest(BaseModel):
    ticker: str = Field(min_length=1, max_length=64)
    quantity: float
    limitPrice: float = Field(gt=0)
    timeValidity: TimeValidity = "DAY"
    confirmation: OrderConfirmation
    clientRequestId: str = Field(min_length=8, max_length=128)


class StopOrderRequest(BaseModel):
    ticker: str = Field(min_length=1, max_length=64)
    quantity: float
    stopPrice: float = Field(gt=0)
    timeValidity: TimeValidity = "DAY"
    confirmation: OrderConfirmation
    clientRequestId: str = Field(min_length=8, max_length=128)


class StopLimitOrderRequest(BaseModel):
    ticker: str = Field(min_length=1, max_length=64)
    quantity: float
    stopPrice: float = Field(gt=0)
    limitPrice: float = Field(gt=0)
    timeValidity: TimeValidity = "DAY"
    confirmation: OrderConfirmation
    clientRequestId: str = Field(min_length=8, max_length=128)


class OrderPreviewRequest(BaseModel):
    orderType: OrderType = "market"
    ticker: str = Field(min_length=1, max_length=64)
    quantity: float
    extendedHours: bool = False
    limitPrice: float | None = Field(default=None, gt=0)
    stopPrice: float | None = Field(default=None, gt=0)
    timeValidity: TimeValidity = "DAY"


class ReconcileRequest(BaseModel):
    expectedTickers: list[str] = Field(default_factory=list, max_length=250)


def _credentials_configured() -> bool:
    return bool(TRADING212_API_KEY and TRADING212_API_SECRET)


def _broker_ready() -> bool:
    return bool(_credentials_configured() and ATLAS_BROKER_CONTROL_TOKEN)


def _auth_header() -> str:
    raw = f"{TRADING212_API_KEY}:{TRADING212_API_SECRET}".encode("utf-8")
    return f"Basic {base64.b64encode(raw).decode('ascii')}"


def _require_control_token(token: str | None) -> None:
    if not _broker_ready():
        raise HTTPException(status_code=503, detail="Trading 212 broker is not fully configured on the server")
    if not token or not hmac.compare_digest(token, ATLAS_BROKER_CONTROL_TOKEN):
        raise HTTPException(status_code=401, detail="Invalid ATLAS broker control token")


def _require_order_permission(confirmation: OrderConfirmation, order_type: OrderType = "market") -> None:
    expected: OrderConfirmation = "EXECUTE_LIVE" if TRADING212_ENV == "live" else "EXECUTE_DEMO"
    if confirmation != expected:
        raise HTTPException(status_code=400, detail=f"confirmation must be {expected} for this environment")
    if TRADING212_ENV == "live" and not TRADING212_LIVE_TRADING_ENABLED:
        raise HTTPException(
            status_code=403,
            detail="Live Trading 212 execution is locked server-side. Paper validation must be completed before enabling live trading.",
        )
    if TRADING212_ENV == "live" and order_type != "market":
        raise HTTPException(
            status_code=403,
            detail="ATLAS blocks non-market live orders until the current Trading 212 live OpenAPI contract is explicitly re-certified.",
        )


def _register_order_request_id(client_request_id: str) -> None:
    now = time.monotonic()
    expired = [key for key, stamp in _ORDER_REQUEST_IDS.items() if now - stamp > _ORDER_REQUEST_ID_TTL_SECONDS]
    for key in expired:
        _ORDER_REQUEST_IDS.pop(key, None)
    digest = hashlib.sha256(client_request_id.encode("utf-8")).hexdigest()
    if digest in _ORDER_REQUEST_IDS:
        raise HTTPException(
            status_code=409,
            detail="Duplicate clientRequestId blocked. Trading 212 order endpoints are not idempotent.",
        )
    _ORDER_REQUEST_IDS[digest] = now


def _normalize_upstream_path(path: str) -> str:
    value = path.strip()
    if value.startswith("/api/v0/"):
        value = value[len("/api/v0") :]
    if not value.startswith("/equity/"):
        raise HTTPException(status_code=400, detail="Unsupported Trading 212 upstream path")
    return value


def _next_page_request(next_page_path: str) -> str:
    value = next_page_path.strip()
    parsed = urlsplit(value)
    if parsed.scheme or parsed.netloc or parsed.fragment:
        raise HTTPException(status_code=400, detail="nextPagePath must be a relative Trading 212 API path")
    if not parsed.path.startswith("/api/v0/equity/history/"):
        raise HTTPException(status_code=400, detail="nextPagePath is outside the Trading 212 history API")
    return _normalize_upstream_path(value)


def _rate_limit_headers(headers: httpx.Headers) -> dict[str, str | None]:
    return {
        "limit": headers.get("x-ratelimit-limit"),
        "period": headers.get("x-ratelimit-period"),
        "remaining": headers.get("x-ratelimit-remaining"),
        "reset": headers.get("x-ratelimit-reset"),
        "used": headers.get("x-ratelimit-used"),
    }


def _parse_reset_epoch(value: str | None) -> float | None:
    if not value:
        return None
    try:
        stamp = float(value)
    except (TypeError, ValueError):
        return None
    if stamp > 10_000_000_000:
        stamp /= 1000.0
    return stamp


def _update_rate_limit_state(key: str, rate: dict[str, str | None]) -> None:
    if rate.get("remaining") != "0":
        return
    reset = _parse_reset_epoch(rate.get("reset"))
    if reset:
        _RATE_LIMIT_READY_AT[key] = reset


async def _respect_rate_limit(key: str) -> None:
    ready_at = _RATE_LIMIT_READY_AT.get(key)
    if not ready_at:
        return
    wait_seconds = ready_at - time.time()
    if wait_seconds <= 0:
        _RATE_LIMIT_READY_AT.pop(key, None)
        return
    if wait_seconds <= _RATE_LIMIT_MAX_AUTO_WAIT_SECONDS:
        await asyncio.sleep(wait_seconds)
        _RATE_LIMIT_READY_AT.pop(key, None)
        return
    raise HTTPException(
        status_code=429,
        detail={
            "message": "Trading 212 account rate limit is cooling down",
            "retryAfterSeconds": round(wait_seconds, 3),
        },
    )


async def _request(
    method: str,
    path: str,
    *,
    json: dict[str, Any] | None = None,
    params: dict[str, Any] | None = None,
) -> tuple[Any, dict[str, str | None]]:
    if not _credentials_configured():
        raise HTTPException(status_code=503, detail="Trading 212 API key pair is not configured on the server")

    normalized_path = _normalize_upstream_path(path)
    route_key = f"{method.upper()}:{urlsplit(normalized_path).path}"
    await _respect_rate_limit(route_key)
    headers = {
        "Authorization": _auth_header(),
        "Accept": "application/json",
        "Content-Type": "application/json",
        "User-Agent": "ATLAS-Omega-Mobile/1.0",
    }
    timeout = httpx.Timeout(20.0, connect=8.0)
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.request(
                method,
                f"{TRADING212_BASE_URL}{normalized_path}",
                headers=headers,
                json=json,
                params=params,
            )
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=f"Trading 212 connection failed: {exc.__class__.__name__}") from exc

    rate = _rate_limit_headers(response.headers)
    _update_rate_limit_state(route_key, rate)
    if response.status_code == 429:
        reset = _parse_reset_epoch(rate.get("reset"))
        retry_after = max(0.0, reset - time.time()) if reset else None
        raise HTTPException(
            status_code=429,
            detail={
                "message": "Trading 212 rate limit reached",
                "retryAfterSeconds": round(retry_after, 3) if retry_after is not None else None,
                "rateLimit": rate,
            },
        )
    if response.status_code >= 400:
        try:
            upstream = response.json()
        except ValueError:
            upstream = response.text[:400]
        raise HTTPException(
            status_code=response.status_code,
            detail={"provider": "Trading212", "upstream": upstream, "rateLimit": rate},
        )
    if response.status_code == 204 or not response.content:
        return {"ok": True}, rate
    try:
        return response.json(), rate
    except ValueError as exc:
        raise HTTPException(status_code=502, detail="Trading 212 returned non-JSON data") from exc


async def _get_instruments_cached() -> tuple[list[dict[str, Any]], dict[str, str | None]]:
    global _INSTRUMENT_CACHE
    cached_at, cached = _INSTRUMENT_CACHE
    if cached and time.time() - cached_at < _INSTRUMENT_CACHE_TTL_SECONDS:
        return cached, {"limit": None, "period": None, "remaining": None, "reset": None, "used": None}
    payload, rate = await _request("GET", "/equity/metadata/instruments")
    instruments = payload if isinstance(payload, list) else []
    instruments = [item for item in instruments if isinstance(item, dict)]
    _INSTRUMENT_CACHE = (time.time(), instruments)
    return instruments, rate


def _envelope(data: Any, rate: dict[str, str | None]) -> dict[str, Any]:
    return {
        "provider": "Trading212",
        "environment": TRADING212_ENV,
        "mode": "LIVE" if TRADING212_ENV == "live" else "PAPER",
        "data": data,
        "rateLimit": rate,
    }


def _canonical_symbol(instrument: dict[str, Any]) -> str:
    ticker = str(instrument.get("ticker") or "").strip().upper()
    if not ticker:
        return ""
    return ticker.split("_", 1)[0]


def _position_account_value(position: dict[str, Any]) -> float | None:
    wallet = position.get("walletImpact")
    if isinstance(wallet, dict):
        for key in ("currentValue", "value", "marketValue"):
            value = wallet.get(key)
            if isinstance(value, (int, float)):
                return float(value)
        total_cost = wallet.get("totalCost")
        upl = wallet.get("unrealizedProfitLoss")
        if isinstance(total_cost, (int, float)) and isinstance(upl, (int, float)):
            return float(total_cost) + float(upl)
    return None


def _reconcile_positions(
    positions_data: Any,
    account_data: Any,
    expected_tickers: list[str],
) -> dict[str, Any]:
    rows = positions_data if isinstance(positions_data, list) else []
    account = account_data if isinstance(account_data, dict) else {}
    account_currency = account.get("currency")
    holdings: list[dict[str, Any]] = []
    observed_symbols: set[str] = set()
    known_account_values: list[float] = []

    for row in rows:
        if not isinstance(row, dict):
            continue
        instrument = row.get("instrument") if isinstance(row.get("instrument"), dict) else {}
        t212_ticker = str(instrument.get("ticker") or row.get("ticker") or "").strip()
        symbol = _canonical_symbol(instrument) or (t212_ticker.split("_", 1)[0].upper() if t212_ticker else "")
        if symbol:
            observed_symbols.add(symbol)
        account_value = _position_account_value(row)
        if account_value is not None:
            known_account_values.append(account_value)
        quantity = row.get("quantity")
        current_price = row.get("currentPrice")
        instrument_value = None
        if isinstance(quantity, (int, float)) and isinstance(current_price, (int, float)):
            instrument_value = float(quantity) * float(current_price)
        wallet = row.get("walletImpact") if isinstance(row.get("walletImpact"), dict) else {}
        holdings.append(
            {
                "symbol": symbol,
                "trading212Ticker": t212_ticker,
                "name": instrument.get("name") or instrument.get("shortName"),
                "isin": instrument.get("isin"),
                "instrumentCurrency": instrument.get("currencyCode"),
                "accountCurrency": account_currency,
                "quantity": quantity,
                "quantityAvailableForTrading": row.get("quantityAvailableForTrading"),
                "quantityInPies": row.get("quantityInPies"),
                "averagePricePaid": row.get("averagePricePaid"),
                "currentPrice": current_price,
                "instrumentMarketValue": instrument_value,
                "accountMarketValue": account_value,
                "unrealizedProfitLoss": wallet.get("unrealizedProfitLoss"),
                "weight": None,
            }
        )

    total_known_value = sum(known_account_values)
    if total_known_value:
        for holding in holdings:
            value = holding.get("accountMarketValue")
            if isinstance(value, (int, float)):
                holding["weight"] = float(value) / total_known_value

    expected = [ticker.strip().upper() for ticker in expected_tickers if ticker and ticker.strip()]
    expected_set = set(expected)
    missing = [ticker for ticker in expected if ticker not in observed_symbols]
    unexpected = sorted(symbol for symbol in observed_symbols if expected and symbol not in expected_set)
    holdings.sort(key=lambda item: (item.get("weight") is None, -(item.get("weight") or 0), item.get("symbol") or ""))

    investments = account.get("investments") if isinstance(account.get("investments"), dict) else {}
    return {
        "accountCurrency": account_currency,
        "accountTotalValue": account.get("totalValue"),
        "investmentsCurrentValue": investments.get("currentValue"),
        "holdings": holdings,
        "holdingCount": len(holdings),
        "expectedTickers": expected,
        "missingExpected": missing,
        "unexpectedHeld": unexpected,
        "weightBasis": "walletImpact-account-currency" if total_known_value else "unavailable",
        "weightsComplete": bool(holdings) and all(item.get("weight") is not None for item in holdings),
    }


def _build_preview(order: OrderPreviewRequest, instrument: dict[str, Any]) -> dict[str, Any]:
    if order.quantity == 0:
        raise HTTPException(status_code=400, detail="quantity must be non-zero")
    if order.orderType in ("limit", "stop_limit") and order.limitPrice is None:
        raise HTTPException(status_code=400, detail="limitPrice is required for limit and stop_limit previews")
    if order.orderType in ("stop", "stop_limit") and order.stopPrice is None:
        raise HTTPException(status_code=400, detail="stopPrice is required for stop and stop_limit previews")
    if TRADING212_ENV == "live" and order.orderType != "market":
        live_compatibility = "BLOCKED_PENDING_LIVE_OPENAPI_RECERTIFICATION"
    else:
        live_compatibility = "ALLOWED_BY_ATLAS_GATE"
    payload: dict[str, Any] = {
        "ticker": str(instrument.get("ticker") or order.ticker).strip(),
        "quantity": order.quantity,
    }
    if order.orderType == "market":
        payload["extendedHours"] = order.extendedHours
    if order.limitPrice is not None and order.orderType in ("limit", "stop_limit"):
        payload["limitPrice"] = order.limitPrice
    if order.stopPrice is not None and order.orderType in ("stop", "stop_limit"):
        payload["stopPrice"] = order.stopPrice
    if order.orderType != "market":
        payload["timeValidity"] = order.timeValidity
    return {
        "previewOnly": True,
        "willExecute": False,
        "environment": TRADING212_ENV,
        "orderType": order.orderType,
        "side": "SELL" if order.quantity < 0 else "BUY",
        "instrument": {
            "ticker": instrument.get("ticker"),
            "name": instrument.get("name") or instrument.get("shortName"),
            "isin": instrument.get("isin"),
            "currencyCode": instrument.get("currencyCode"),
            "type": instrument.get("type"),
        },
        "upstreamPayload": payload,
        "liveCompatibility": live_compatibility,
        "nextStep": "EXECUTE_DEMO" if TRADING212_ENV == "demo" else "EXECUTE_LIVE",
    }


@router.get("/status")
async def status() -> dict[str, Any]:
    return {
        "provider": "Trading212",
        "apiVersion": "v0-beta",
        "environment": TRADING212_ENV,
        "mode": "LIVE" if TRADING212_ENV == "live" else "PAPER",
        "credentialsConfigured": _credentials_configured(),
        "controlTokenConfigured": bool(ATLAS_BROKER_CONTROL_TOKEN),
        "readReady": _broker_ready(),
        "liveTradingEnabled": TRADING212_LIVE_TRADING_ENABLED,
        "liveExecutionLocked": not (TRADING212_ENV == "live" and TRADING212_LIVE_TRADING_ENABLED),
        "secretsExposed": False,
        "guardrails": [
            "Trading 212 credentials remain server-side and are never embedded in the APK.",
            "Demo is the default environment.",
            "Portfolio reconciliation is read-only and cannot execute orders.",
            "Preview never sends an order to Trading 212.",
            "Live orders require server-side live enablement plus EXECUTE_LIVE on every request.",
            "Every order requires a unique clientRequestId because Trading 212 beta order endpoints are not idempotent.",
            "Positive quantity buys; negative quantity sells.",
        ],
    }


@router.get("/account")
async def account(x_atlas_broker_token: str | None = Header(default=None)) -> dict[str, Any]:
    _require_control_token(x_atlas_broker_token)
    data, rate = await _request("GET", "/equity/account/summary")
    return _envelope(data, rate)


@router.get("/positions")
async def positions(
    ticker: str | None = Query(default=None, max_length=64),
    x_atlas_broker_token: str | None = Header(default=None),
) -> dict[str, Any]:
    _require_control_token(x_atlas_broker_token)
    params = {"ticker": ticker.strip()} if ticker and ticker.strip() else None
    data, rate = await _request("GET", "/equity/positions", params=params)
    return _envelope(data, rate)


@router.post("/portfolio/reconcile")
async def reconcile_portfolio(
    request: ReconcileRequest,
    x_atlas_broker_token: str | None = Header(default=None),
) -> dict[str, Any]:
    _require_control_token(x_atlas_broker_token)
    positions_data, positions_rate = await _request("GET", "/equity/positions")
    account_data, account_rate = await _request("GET", "/equity/account/summary")
    data = _reconcile_positions(positions_data, account_data, request.expectedTickers)
    result = _envelope(data, positions_rate)
    result["rateLimits"] = {"positions": positions_rate, "account": account_rate}
    result["readOnly"] = True
    return result


@router.get("/orders")
async def orders(x_atlas_broker_token: str | None = Header(default=None)) -> dict[str, Any]:
    _require_control_token(x_atlas_broker_token)
    data, rate = await _request("GET", "/equity/orders")
    return _envelope(data, rate)


@router.get("/orders/{order_id}")
async def order(order_id: int, x_atlas_broker_token: str | None = Header(default=None)) -> dict[str, Any]:
    _require_control_token(x_atlas_broker_token)
    data, rate = await _request("GET", f"/equity/orders/{order_id}")
    return _envelope(data, rate)


@router.delete("/orders/{order_id}")
async def cancel_order(order_id: int, x_atlas_broker_token: str | None = Header(default=None)) -> dict[str, Any]:
    _require_control_token(x_atlas_broker_token)
    data, rate = await _request("DELETE", f"/equity/orders/{order_id}")
    return _envelope(data, rate)


@router.get("/metadata/exchanges")
async def exchanges(x_atlas_broker_token: str | None = Header(default=None)) -> dict[str, Any]:
    _require_control_token(x_atlas_broker_token)
    data, rate = await _request("GET", "/equity/metadata/exchanges")
    return _envelope(data, rate)


@router.get("/metadata/instruments")
async def instruments(x_atlas_broker_token: str | None = Header(default=None)) -> dict[str, Any]:
    _require_control_token(x_atlas_broker_token)
    data, rate = await _get_instruments_cached()
    return _envelope(data, rate)


@router.get("/metadata/instruments/search")
async def instrument_search(
    q: str = Query(..., min_length=1, max_length=80),
    x_atlas_broker_token: str | None = Header(default=None),
) -> dict[str, Any]:
    _require_control_token(x_atlas_broker_token)
    needle = q.strip().upper()
    instruments, rate = await _get_instruments_cached()
    matches: list[dict[str, Any]] = []
    for item in instruments:
        haystack = " ".join(str(item.get(key, "")) for key in ("ticker", "name", "shortName", "isin", "currencyCode")).upper()
        if needle in haystack:
            matches.append(item)
        if len(matches) >= 50:
            break
    payload = {"query": q.strip(), "count": len(matches), "items": matches}
    return _envelope(payload, rate)


@router.post("/orders/preview")
async def preview_order(
    order: OrderPreviewRequest,
    x_atlas_broker_token: str | None = Header(default=None),
) -> dict[str, Any]:
    _require_control_token(x_atlas_broker_token)
    instruments_data, rate = await _get_instruments_cached()
    requested = order.ticker.strip().upper()
    exact = [item for item in instruments_data if str(item.get("ticker") or "").upper() == requested]
    if not exact:
        candidates = [item for item in instruments_data if _canonical_symbol(item) == requested]
        if len(candidates) == 1:
            exact = candidates
        elif len(candidates) > 1:
            raise HTTPException(
                status_code=409,
                detail={
                    "message": "Ticker is ambiguous in Trading 212 metadata; use the exact Trading 212 ticker",
                    "candidates": [item.get("ticker") for item in candidates[:20]],
                },
            )
    if not exact:
        raise HTTPException(status_code=404, detail="Ticker not found in Trading 212 instrument metadata")
    return _envelope(_build_preview(order, exact[0]), rate)


@router.get("/history/orders")
async def history_orders(
    limit: int = Query(default=20, ge=1, le=50),
    cursor: int | None = Query(default=None),
    ticker: str | None = Query(default=None, max_length=64),
    x_atlas_broker_token: str | None = Header(default=None),
) -> dict[str, Any]:
    _require_control_token(x_atlas_broker_token)
    params: dict[str, Any] = {"limit": limit}
    if cursor is not None:
        params["cursor"] = cursor
    if ticker and ticker.strip():
        params["ticker"] = ticker.strip()
    data, rate = await _request("GET", "/equity/history/orders", params=params)
    return _envelope(data, rate)


@router.get("/history/dividends")
async def history_dividends(
    limit: int = Query(default=20, ge=1, le=50),
    cursor: int | None = Query(default=None),
    ticker: str | None = Query(default=None, max_length=64),
    x_atlas_broker_token: str | None = Header(default=None),
) -> dict[str, Any]:
    _require_control_token(x_atlas_broker_token)
    params: dict[str, Any] = {"limit": limit}
    if cursor is not None:
        params["cursor"] = cursor
    if ticker and ticker.strip():
        params["ticker"] = ticker.strip()
    data, rate = await _request("GET", "/equity/history/dividends", params=params)
    return _envelope(data, rate)


@router.get("/history/transactions")
async def history_transactions(
    limit: int = Query(default=20, ge=1, le=50),
    cursor: str | None = Query(default=None, max_length=200),
    time_from: str | None = Query(default=None, alias="time", max_length=64),
    x_atlas_broker_token: str | None = Header(default=None),
) -> dict[str, Any]:
    _require_control_token(x_atlas_broker_token)
    params: dict[str, Any] = {"limit": limit}
    if cursor:
        params["cursor"] = cursor
    if time_from:
        params["time"] = time_from
    data, rate = await _request("GET", "/equity/history/transactions", params=params)
    return _envelope(data, rate)


@router.get("/history/next")
async def history_next(
    nextPagePath: str = Query(..., min_length=1, max_length=500),
    x_atlas_broker_token: str | None = Header(default=None),
) -> dict[str, Any]:
    _require_control_token(x_atlas_broker_token)
    path = _next_page_request(nextPagePath)
    data, rate = await _request("GET", path)
    return _envelope(data, rate)


async def _place_order(
    endpoint: str,
    body: dict[str, Any],
    confirmation: OrderConfirmation,
    client_request_id: str,
    control_token: str | None,
) -> dict[str, Any]:
    _require_control_token(control_token)
    order_type = endpoint.rsplit("/", 1)[-1]
    if order_type not in {"market", "limit", "stop", "stop_limit"}:
        raise HTTPException(status_code=400, detail="Unsupported order type")
    _require_order_permission(confirmation, order_type)  # type: ignore[arg-type]
    if not body.get("ticker") or body.get("quantity") == 0:
        raise HTTPException(status_code=400, detail="ticker and non-zero quantity are required")
    _register_order_request_id(client_request_id)
    data, rate = await _request("POST", endpoint, json=body)
    result = _envelope(data, rate)
    result["audit"] = {
        "clientRequestIdHash": hashlib.sha256(client_request_id.encode("utf-8")).hexdigest()[:16],
        "orderType": order_type.upper(),
        "ticker": body.get("ticker"),
        "quantity": body.get("quantity"),
    }
    return result


@router.post("/orders/market")
async def market_order(
    order: MarketOrderRequest,
    x_atlas_broker_token: str | None = Header(default=None),
) -> dict[str, Any]:
    return await _place_order(
        "/equity/orders/market",
        {"ticker": order.ticker.strip(), "quantity": order.quantity, "extendedHours": order.extendedHours},
        order.confirmation,
        order.clientRequestId,
        x_atlas_broker_token,
    )


@router.post("/orders/limit")
async def limit_order(
    order: LimitOrderRequest,
    x_atlas_broker_token: str | None = Header(default=None),
) -> dict[str, Any]:
    return await _place_order(
        "/equity/orders/limit",
        {
            "ticker": order.ticker.strip(),
            "quantity": order.quantity,
            "limitPrice": order.limitPrice,
            "timeValidity": order.timeValidity,
        },
        order.confirmation,
        order.clientRequestId,
        x_atlas_broker_token,
    )


@router.post("/orders/stop")
async def stop_order(
    order: StopOrderRequest,
    x_atlas_broker_token: str | None = Header(default=None),
) -> dict[str, Any]:
    return await _place_order(
        "/equity/orders/stop",
        {
            "ticker": order.ticker.strip(),
            "quantity": order.quantity,
            "stopPrice": order.stopPrice,
            "timeValidity": order.timeValidity,
        },
        order.confirmation,
        order.clientRequestId,
        x_atlas_broker_token,
    )


@router.post("/orders/stop_limit")
async def stop_limit_order(
    order: StopLimitOrderRequest,
    x_atlas_broker_token: str | None = Header(default=None),
) -> dict[str, Any]:
    return await _place_order(
        "/equity/orders/stop_limit",
        {
            "ticker": order.ticker.strip(),
            "quantity": order.quantity,
            "stopPrice": order.stopPrice,
            "limitPrice": order.limitPrice,
            "timeValidity": order.timeValidity,
        },
        order.confirmation,
        order.clientRequestId,
        x_atlas_broker_token,
    )
