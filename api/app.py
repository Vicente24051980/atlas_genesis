from __future__ import annotations

from api.atlas_core import router as atlas_router
from api.bottom_score import router as bottom_score_router
from api.evidence import router as evidence_router
from api.kronos_market_forecast import router as kronos_market_forecast_router
from api.main import app
from api.market import router as market_router
from api.realizable_alpha import router as realizable_alpha_router

# api.main now mounts the isolated mobile-v2, Trading 212 and Global CAPEX Chain
# contracts directly so Render works whether its dashboard starts api.main:app
# or api.app:app. This deployment entrypoint adds the wider ATLAS routers only.
app.include_router(market_router)
app.include_router(atlas_router)
app.include_router(bottom_score_router)
app.include_router(realizable_alpha_router)
app.include_router(evidence_router)
app.include_router(kronos_market_forecast_router)
