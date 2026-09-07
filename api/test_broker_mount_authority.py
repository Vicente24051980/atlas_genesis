from __future__ import annotations

from api.main import app


def _route_modules(path: str, method: str) -> list[str]:
    modules: list[str] = []
    for route in app.routes:
        methods = getattr(route, "methods", set()) or set()
        if getattr(route, "path", None) == path and method in methods:
            endpoint = getattr(route, "endpoint", None)
            modules.append(getattr(endpoint, "__module__", ""))
    return modules


def test_mobile_broker_material_routes_are_only_controlled_wrapper() -> None:
    market_modules = _route_modules("/v1/mobile/broker/orders/market", "POST")
    cancel_modules = _route_modules("/v1/mobile/broker/orders/{order_id}", "DELETE")

    assert market_modules, "controlled mobile market-order route is missing"
    assert cancel_modules, "controlled mobile cancel route is missing"
    assert set(market_modules) == {"api.trading212_controlled"}
    assert set(cancel_modules) == {"api.trading212_controlled"}
    assert "api.trading212_v2" not in market_modules
    assert "api.trading212_v2" not in cancel_modules


def test_legacy_non_mobile_surface_remains_fail_closed_by_main() -> None:
    market_modules = _route_modules("/v1/broker/orders/market", "POST")
    cancel_modules = _route_modules("/v1/broker/orders/{order_id}", "DELETE")

    assert market_modules == ["api.main"]
    assert cancel_modules == ["api.main"]
