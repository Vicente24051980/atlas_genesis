from __future__ import annotations

from api.main import app as main_app


def test_main_entrypoint_contains_mobile_and_agentic_routes():
    paths = {route.path for route in main_app.routes}
    required = {
        "/v1/mobile/health",
        "/v1/mobile/portfolio",
        "/v1/mobile/broker/status",
        "/v1/mobile/capex-chain/{ticker}",
        "/v1/agentic-omega/health",
        "/v1/agentic-omega/v2/capabilities",
        "/v1/agentic-omega/v2/evidence-capabilities",
        "/v1/agentic-omega/v2/governance/capabilities",
    }
    assert required <= paths


def test_mobile_and_agentic_routes_are_not_duplicated_on_main_entrypoint():
    paths = [route.path for route in main_app.routes]
    for path in (
        "/v1/mobile/health",
        "/v1/mobile/broker/status",
        "/v1/mobile/capex-chain/{ticker}",
        "/v1/agentic-omega/health",
        "/v1/agentic-omega/v2/capabilities",
        "/v1/agentic-omega/v2/evidence-capabilities",
        "/v1/agentic-omega/v2/governance/capabilities",
    ):
        assert paths.count(path) == 1
