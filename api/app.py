from __future__ import annotations

from api.atlas_core import router as atlas_router
from api.bottom_score import router as bottom_score_router
from api.evidence import router as evidence_router
from api.global_capex_chain_mobile import router as global_capex_chain_mobile_router
from api.kronos_market_forecast import router as kronos_market_forecast_router
from api.main import app
from api.market import router as market_router
from api.mobile_v2 import router as mobile_v2_router
from api.realizable_alpha import router as realizable_alpha_router
from api.trading212_v2 import router as trading212_v2_router

# Deployment entrypoint. Legacy routers remain available for compatibility while
# the rebuilt phone app uses isolated /v1/mobile contracts.
app.include_router(mobile_v2_router)
app.include_router(trading212_v2_router)
app.include_router(global_capex_chain_mobile_router)
app.include_router(market_router)
app.include_router(atlas_router)
app.include_router(bottom_score_router)
app.include_router(realizable_alpha_router)
app.include_router(evidence_router)
app.include_router(kronos_market_forecast_router)
