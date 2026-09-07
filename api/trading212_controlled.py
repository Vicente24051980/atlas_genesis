from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Header, HTTPException, Query

from api import trading212_v2 as legacy

router = APIRouter(prefix="/v1/mobile/broker", tags=["mobile-broker-trading212-controlled"])

HUMAN_APPROVAL_BRIDGE_STATUS = "NOT_IMPLEMENTED_LIVE_EXECUTION_FAIL_CLOSED"


def _block_live_material_action() -> None:
    if legacy.TRADING212_ENV == "live":
        raise HTTPException(
            status_code=403,
            detail={
                "code": "HUMAN_APPROVAL_REQUIRED",
                "message": "Live material broker actions are fail-closed until ATLAS has a per-order human approval bridge.",
                "architecture": "E3_GATE -> E4_DECISION -> E5_HUMAN_APPROVAL -> EXECUTION",
                "approvalBridge": HUMAN_APPROVAL_BRIDGE_STATUS,
            },
        )


@router.get("/status")
async def status() -> dict[str, Any]:
    result = await legacy.status()
    result["humanApprovalBridge"] = HUMAN_APPROVAL_BRIDGE_STATUS
    result["liveExecutionLocked"] = True if legacy.TRADING212_ENV == "live" else result.get("liveExecutionLocked", True)
    result.setdefault("guardrails", []).append(
        "LIVE material actions are blocked even if server live mode is enabled until a per-order human approval bridge exists."
    )
    return result


@router.get("/account")
async def account(x_atlas_broker_token: str | None = Header(default=None)) -> dict[str, Any]:
    return await legacy.account(x_atlas_broker_token)


@router.get("/positions")
async def positions(
    ticker: str | None = Query(default=None, max_length=64),
    x_atlas_broker_token: str | None = Header(default=None),
) -> dict[str, Any]:
    return await legacy.positions(ticker, x_atlas_broker_token)


@router.post("/portfolio/reconcile")
async def reconcile_portfolio(
    request: legacy.ReconcileRequest,
    x_atlas_broker_token: str | None = Header(default=None),
) -> dict[str, Any]:
    return await legacy.reconcile_portfolio(request, x_atlas_broker_token)


@router.get("/orders")
async def orders(x_atlas_broker_token: str | None = Header(default=None)) -> dict[str, Any]:
    return await legacy.orders(x_atlas_broker_token)


@router.get("/orders/{order_id}")
async def order(order_id: int, x_atlas_broker_token: str | None = Header(default=None)) -> dict[str, Any]:
    return await legacy.order(order_id, x_atlas_broker_token)


@router.delete("/orders/{order_id}")
async def cancel_order(order_id: int, x_atlas_broker_token: str | None = Header(default=None)) -> dict[str, Any]:
    _block_live_material_action()
    return await legacy.cancel_order(order_id, x_atlas_broker_token)


@router.get("/metadata/exchanges")
async def exchanges(x_atlas_broker_token: str | None = Header(default=None)) -> dict[str, Any]:
    return await legacy.exchanges(x_atlas_broker_token)


@router.get("/metadata/instruments")
async def instruments(x_atlas_broker_token: str | None = Header(default=None)) -> dict[str, Any]:
    return await legacy.instruments(x_atlas_broker_token)


@router.get("/metadata/instruments/search")
async def instrument_search(
    q: str = Query(..., min_length=1, max_length=80),
    x_atlas_broker_token: str | None = Header(default=None),
) -> dict[str, Any]:
    return await legacy.instrument_search(q, x_atlas_broker_token)


@router.post("/orders/preview")
async def preview_order(
    order: legacy.OrderPreviewRequest,
    x_atlas_broker_token: str | None = Header(default=None),
) -> dict[str, Any]:
    result = await legacy.preview_order(order, x_atlas_broker_token)
    result["materialExecutionAuthorized"] = False
    result["humanApprovalBridge"] = HUMAN_APPROVAL_BRIDGE_STATUS
    return result


@router.get("/history/orders")
async def history_orders(
    limit: int = Query(default=20, ge=1, le=50),
    cursor: int | None = Query(default=None),
    ticker: str | None = Query(default=None, max_length=64),
    x_atlas_broker_token: str | None = Header(default=None),
) -> dict[str, Any]:
    return await legacy.history_orders(limit, cursor, ticker, x_atlas_broker_token)


@router.get("/history/dividends")
async def history_dividends(
    limit: int = Query(default=20, ge=1, le=50),
    cursor: int | None = Query(default=None),
    ticker: str | None = Query(default=None, max_length=64),
    x_atlas_broker_token: str | None = Header(default=None),
) -> dict[str, Any]:
    return await legacy.history_dividends(limit, cursor, ticker, x_atlas_broker_token)


@router.get("/history/transactions")
async def history_transactions(
    limit: int = Query(default=20, ge=1, le=50),
    cursor: str | None = Query(default=None, max_length=200),
    time_from: str | None = Query(default=None, alias="time", max_length=64),
    x_atlas_broker_token: str | None = Header(default=None),
) -> dict[str, Any]:
    return await legacy.history_transactions(limit, cursor, time_from, x_atlas_broker_token)


@router.get("/history/next")
async def history_next(
    nextPagePath: str = Query(..., min_length=1, max_length=500),
    x_atlas_broker_token: str | None = Header(default=None),
) -> dict[str, Any]:
    return await legacy.history_next(nextPagePath, x_atlas_broker_token)


@router.post("/orders/market")
async def market_order(
    order: legacy.MarketOrderRequest,
    x_atlas_broker_token: str | None = Header(default=None),
) -> dict[str, Any]:
    _block_live_material_action()
    return await legacy.market_order(order, x_atlas_broker_token)


@router.post("/orders/limit")
async def limit_order(
    order: legacy.LimitOrderRequest,
    x_atlas_broker_token: str | None = Header(default=None),
) -> dict[str, Any]:
    _block_live_material_action()
    return await legacy.limit_order(order, x_atlas_broker_token)


@router.post("/orders/stop")
async def stop_order(
    order: legacy.StopOrderRequest,
    x_atlas_broker_token: str | None = Header(default=None),
) -> dict[str, Any]:
    _block_live_material_action()
    return await legacy.stop_order(order, x_atlas_broker_token)


@router.post("/orders/stop_limit")
async def stop_limit_order(
    order: legacy.StopLimitOrderRequest,
    x_atlas_broker_token: str | None = Header(default=None),
) -> dict[str, Any]:
    _block_live_material_action()
    return await legacy.stop_limit_order(order, x_atlas_broker_token)
