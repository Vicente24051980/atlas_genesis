from __future__ import annotations

from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse

from api.agentic_omega import router as agentic_omega_router
from api.atlas_core import router as atlas_router
from api.bottom_score import router as bottom_score_router
from api.evidence import router as evidence_router
from api.execution_safety_gate import classify_execution_error
from api.execution_safety_gate import router as execution_safety_router
from api.kronos_market_forecast import router as kronos_market_forecast_router
from api.main import app
from api.market import router as market_router
from api.realizable_alpha import router as realizable_alpha_router

# api.main mounts the isolated mobile-v2, Trading 212 and Global CAPEX Chain
# contracts directly. The Render Blueprint starts api.app:app, so this entrypoint
# also mounts the operational Execution Safety Gate and the wider ATLAS routers.
app.include_router(execution_safety_router)
app.include_router(market_router)
app.include_router(atlas_router)
app.include_router(bottom_score_router)
app.include_router(realizable_alpha_router)
app.include_router(evidence_router)
app.include_router(kronos_market_forecast_router)
app.include_router(agentic_omega_router)


@app.exception_handler(HTTPException)
async def atlas_http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Preserve normal FastAPI errors while classifying Trading 212 execution failures.

    Broker/order failures are operational states, not investment signals. A detected
    trading halt is therefore returned as NO_EXECUTE + KEEP_PENDING + RECHECK.
    """
    payload: dict[str, object] = {"detail": exc.detail}

    if request.url.path.startswith("/v1/mobile/broker/"):
        ticker: str | None = None
        order_id: str | int | None = None

        if isinstance(exc.detail, dict):
            upstream = exc.detail.get("upstream", exc.detail)
            raw_ticker = exc.detail.get("ticker")
            raw_order_id = exc.detail.get("orderId")
            ticker = str(raw_ticker) if raw_ticker is not None else None
            order_id = raw_order_id if isinstance(raw_order_id, (str, int)) else None
        else:
            upstream = exc.detail

        safety = classify_execution_error(
            http_status=exc.status_code,
            upstream=upstream,
            ticker=ticker,
            order_id=order_id,
        )
        payload["executionSafety"] = safety

    headers = dict(exc.headers) if exc.headers else None
    return JSONResponse(status_code=exc.status_code, content=payload, headers=headers)
