from __future__ import annotations

import asyncio

from api.providers.finnhub_resilient import FinnhubResilientClient, policy_for
from api.providers.trading212_readonly import _symbol_from_broker_ticker, portfolio_status, router


def test_finnhub_global_rate_guard_never_reaches_30_calls_per_second() -> None:
    client = FinnhubResilientClient(max_calls_per_second=999)
    assert client.max_calls_per_second == 29


def test_finnhub_policy_separates_fast_and_slow_data() -> None:
    assert policy_for('/quote').ttl_seconds < policy_for('/stock/metric').ttl_seconds
    assert policy_for('/company-news').ttl_seconds < policy_for('/stock/profile2').ttl_seconds
    assert policy_for('/stock/metric').stale_seconds > policy_for('/stock/metric').ttl_seconds


def test_trading212_symbol_keeps_original_mapping_simple_and_explicit() -> None:
    assert _symbol_from_broker_ticker('AAPL_US_EQ') == 'AAPL'
    assert _symbol_from_broker_ticker('MSFT_US_EQ') == 'MSFT'
    assert _symbol_from_broker_ticker('V') == 'V'


def test_readonly_portfolio_router_has_no_write_methods() -> None:
    methods: set[str] = set()
    for route in router.routes:
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
