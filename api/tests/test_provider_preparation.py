from __future__ import annotations

import asyncio

from api.mobile_sync import resolved_portfolio, router as mobile_router
from api.providers.finnhub_resilient import FinnhubResilientClient, finnhub_get, finnhub_optional, policy_for
from api.providers.trading212_readonly import _symbol_from_broker_ticker, portfolio_status, router


def test_finnhub_global_rate_guard_never_reaches_30_calls_per_second() -> None:
    client = FinnhubResilientClient(max_calls_per_second=999)
    assert client.max_calls_per_second == 29


def test_finnhub_policy_separates_fast_and_slow_data() -> None:
    assert policy_for('/quote').ttl_seconds < policy_for('/stock/metric').ttl_seconds
    assert policy_for('/company-news').ttl_seconds < policy_for('/stock/profile2').ttl_seconds
    assert policy_for('/stock/metric').stale_seconds > policy_for('/stock/metric').ttl_seconds


def test_trading212_symbol_mapping_is_safe_and_explicit() -> None:
    assert _symbol_from_broker_ticker('AAPL_US_EQ') == 'AAPL'
    assert _symbol_from_broker_ticker('MSFT_US_EQ') == 'MSFT'
    assert _symbol_from_broker_ticker('V') == 'V'
    assert _symbol_from_broker_ticker('SU_FR_EQ') == ''
    assert _symbol_from_broker_ticker('BAE_UK_EQ') == ''


def test_readonly_portfolio_router_has_no_write_methods() -> None:
    methods: set[str] = set()
    for route in router.routes:
        methods.update(getattr(route, 'methods', set()) or set())
    assert methods <= {'GET', 'HEAD'}


def test_mobile_sync_router_has_no_write_methods() -> None:
    methods: set[str] = set()
    for route in mobile_router.routes:
        methods.update(getattr(route, 'methods', set()) or set())
    assert methods <= {'GET', 'HEAD'}


def test_portfolio_status_declares_read_only(monkeypatch) -> None:
    monkeypatch.setenv('TRADING212_ENV', 'live')
    monkeypatch.delenv('TRADING212_API_KEY', raising=False)
    monkeypatch.delenv('TRADING212_API_SECRET', raising=False)
    payload = asyncio.run(portfolio_status())
    assert payload['provider'] == 'Trading212'
    assert payload['environment'] == 'live'
    assert payload['configured'] is False
    assert payload['readOnly'] is True


def test_mobile_portfolio_keeps_bootstrap_until_t212_is_configured(monkeypatch) -> None:
    monkeypatch.delenv('TRADING212_API_KEY', raising=False)
    monkeypatch.delenv('TRADING212_API_SECRET', raising=False)
    portfolio, meta = asyncio.run(resolved_portfolio())
    assert portfolio
    assert meta['provider'] == 'ATLAS_BOOTSTRAP'
    assert meta['configured'] is False
    assert meta['readOnly'] is True


def test_app_entrypoint_installs_resilient_finnhub_bridge() -> None:
    import api.app  # noqa: F401
    import api.atlas_core as atlas_core
    import api.main as base_api

    assert base_api._finnhub_get is finnhub_get
    assert base_api._optional is finnhub_optional
    assert atlas_core._finnhub is finnhub_get
    assert atlas_core._optional is finnhub_optional


def test_app_entrypoint_exposes_readonly_portfolio_routes() -> None:
    from api.app import app

    paths = {route.path for route in app.routes}
    assert '/v1/portfolio/status' in paths
    assert '/v1/portfolio/live' in paths
    assert '/v1/portfolio/account' in paths
    assert '/v1/portfolio/instruments' in paths
    assert '/v1/mobile/universe' in paths
    assert '/v1/mobile/monitor/{kind}' in paths
    assert '/v1/mobile/analyze-symbols' in paths
