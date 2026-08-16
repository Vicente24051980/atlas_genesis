from __future__ import annotations

from api.main import app as main_app


def test_main_entrypoint_contains_mobile_routes():
    paths = {route.path for route in main_app.routes}
    assert "/v1/mobile/health" in paths
    assert "/v1/mobile/portfolio" in paths
    assert "/v1/mobile/broker/status" in paths
    assert "/v1/mobile/capex-chain/{ticker}" in paths


def test_mobile_routes_are_not_duplicated_on_main_entrypoint():
    paths = [route.path for route in main_app.routes]
    assert paths.count("/v1/mobile/health") == 1
    assert paths.count("/v1/mobile/broker/status") == 1
    assert paths.count("/v1/mobile/capex-chain/{ticker}") == 1
