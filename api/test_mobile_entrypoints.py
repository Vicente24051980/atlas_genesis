from __future__ import annotations

from api.main import app as main_app


REQUIRED_MAIN_MOBILE_ROUTES = {
    "/v1/mobile/health",
    "/v1/mobile/indices",
    "/v1/mobile/company/{ticker}",
    "/v1/mobile/portfolio",
    "/v1/mobile/audit/{ticker}",
    "/v1/mobile/broker/status",
    "/v1/mobile/broker/account",
    "/v1/mobile/broker/positions",
    "/v1/mobile/broker/orders",
    "/v1/mobile/broker/metadata/instruments/search",
    "/v1/mobile/capex-chain/{ticker}",
}


def test_main_entrypoint_contains_mobile_routes():
    paths = {route.path for route in main_app.routes}
    assert REQUIRED_MAIN_MOBILE_ROUTES <= paths


def test_mobile_routes_are_not_duplicated_on_main_entrypoint():
    paths = [route.path for route in main_app.routes]
    for route in REQUIRED_MAIN_MOBILE_ROUTES:
        assert paths.count(route) == 1
