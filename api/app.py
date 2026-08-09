from __future__ import annotations

from api.atlas_core import router as atlas_router
from api.main import app
from api.market import router as market_router

# Deployment entrypoint. Routers are additive: Broker Ω guardrails in api.main
# remain authoritative while market/ATLAS intelligence stay read-only.
app.include_router(market_router)
app.include_router(atlas_router)
