from __future__ import annotations

from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse

from api.agent_infrastructure import router as agent_infrastructure_router
from api.agentic_evidence_bridge import router as agentic_evidence_bridge_router
from api.agentic_governance import router as agentic_governance_router
from api.agentic_omega import router as agentic_omega_router
from api.agentic_omega_v2 import router as agentic_omega_v2_router
from api.atlas_core import router as atlas_router
from api.bottom_score import router as bottom_score_router
from api.document_ingestion import router as document_ingestion_router
from api.evidence import router as evidence_router
from api.execution_safety_gate import classify_execution_error
from api.execution_safety_gate import router as execution_safety_router
from api.firecrawl_ingestion import router as firecrawl_ingestion_router
from api.kronos_market_forecast import router as kronos_market_forecast_router
from api.main import app
from api.market import router as market_router
from api.realizable_alpha import router as realizable_alpha_router
from api.screener import router as screener_router

app.include_router(execution_safety_router)
app.include_router(market_router)
app.include_router(screener_router)
app.include_router(atlas_router)
app.include_router(bottom_score_router)
app.include_router(realizable_alpha_router)
app.include_router(evidence_router)
app.include_router(firecrawl_ingestion_router)
app.include_router(kronos_market_forecast_router)
app.include_router(agentic_omega_router)
app.include_router(agentic_omega_v2_router)
app.include_router(agentic_evidence_bridge_router)
app.include_router(agentic_governance_router)
app.include_router(agent_infrastructure_router)
app.include_router(document_ingestion_router)


@app.exception_handler(HTTPException)
async def atlas_http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    payload: dict[str, object] = {"detail": exc.detail}
    if request.url.path.startswith("/v1/mobile/broker/"):
        ticker = None
        order_id = None
        if isinstance(exc.detail, dict):
            upstream = exc.detail.get("upstream", exc.detail)
            raw_ticker = exc.detail.get("ticker")
            raw_order_id = exc.detail.get("orderId")
            ticker = str(raw_ticker) if raw_ticker is not None else None
            order_id = raw_order_id if isinstance(raw_order_id, (str, int)) else None
        else:
            upstream = exc.detail
        payload["executionSafety"] = classify_execution_error(
            http_status=exc.status_code,
            upstream=upstream,
            ticker=ticker,
            order_id=order_id,
        )
    return JSONResponse(
        status_code=exc.status_code,
        content=payload,
        headers=dict(exc.headers) if exc.headers else None,
    )
