from __future__ import annotations

import api.atlas_core as atlas_core_module
import api.main as base_api_module
from api.atlas_core import router as atlas_router
from api.evidence import router as evidence_router
from api.main import app
from api.market import router as market_router
from api.mobile_sync import router as mobile_sync_router
from api.providers.finnhub_resilient import finnhub_get, finnhub_optional
from api.providers.trading212_readonly import router as trading212_readonly_router

# Preparation branch provider bridge.
# Existing route implementations remain intact, but every Finnhub call made by
# api.main/api.atlas_core is redirected through one resilient server-side
# adapter. This avoids editing the proven route/engine logic before the paid
# provider credentials are installed and keeps rollback trivial.
base_api_module._finnhub_get = finnhub_get
base_api_module._optional = finnhub_optional
atlas_core_module._finnhub = finnhub_get
atlas_core_module._optional = finnhub_optional

# Deployment entrypoint. Routers are additive: Broker Ω guardrails in api.main
# remain authoritative while market/ATLAS/evidence intelligence stay read-only.
# The portfolio router is intentionally read-only and contains no order method.
app.include_router(market_router)
app.include_router(atlas_router)
app.include_router(evidence_router)
app.include_router(trading212_readonly_router)
app.include_router(mobile_sync_router)
