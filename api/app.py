from __future__ import annotations

from api.main import app
from api.market import router as market_router

# Deployment entrypoint. Existing API and Broker Ω remain unchanged; the market
# scanner is mounted as an additive router so it cannot bypass broker guardrails.
app.include_router(market_router)
