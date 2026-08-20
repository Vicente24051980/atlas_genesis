from __future__ import annotations

import pytest

from api import mobile_v2


def test_portfolio_snapshot_is_36_and_unique():
    assert len(mobile_v2.PORTFOLIO_36) == 36
    assert len(set(mobile_v2.PORTFOLIO_36)) == 36
    assert "GOOGL" in mobile_v2.PORTFOLIO_36
    assert "NVDA" in mobile_v2.PORTFOLIO_36


def test_global_index_universe_is_curated_and_unique():
    symbols = [symbol for symbol, _, _ in mobile_v2.GLOBAL_INDEX_UNIVERSE]
    assert "^GSPC" in symbols
    assert "^NDX" in symbols
    assert "^IBEX" in symbols
    assert "^N225" in symbols
    assert len(symbols) == len(set(symbols))
    assert len(symbols) >= 15


def test_summary_normalizer_handles_official_financialdatanet_keys():
    sections = {
        "company": [{"registrant_name": "MICROSOFT CORP", "industry": "Information technology", "market_cap": 2800000000000}],
        "quote": [{"price": 502.42}],
        "keyMetrics": [{"price_to_earnings_ratio": 38.51, "free_cash_flow": 56311000000.0}],
        "incomeStatement": [{"currency_code": "USD", "revenue": 245122000000.0}],
        "valuation": [],
        "marketCap": [{"market_cap": 2800000000000, "change_in_market_cap": 55}],
        "cashFlow": [{"cash_from_operating_activities": 118548000000.0}],
    }
    summary = mobile_v2._summary_from_sections("MSFT", sections)
    assert summary["name"] == "MICROSOFT CORP"
    assert summary["currency"] == "USD"
    assert summary["price"] == 502.42
    assert summary["marketCap"] == 2800000000000
    assert summary["pe"] == 38.51
    assert summary["revenue"] == 245122000000.0
    assert summary["freeCashFlow"] == 56311000000.0
    assert "capitalFlow" not in summary


@pytest.mark.asyncio
async def test_fdn_bundle_uses_documented_year_period(monkeypatch):
    monkeypatch.setattr(mobile_v2, "FDN_API_KEY", "configured")
    calls: list[tuple[str, dict[str, object]]] = []

    async def fake_optional(endpoint: str, params: dict[str, object]):
        calls.append((endpoint, dict(params)))
        if endpoint == "company-information":
            return [{"registrant_name": "MICROSOFT CORP"}], "OK"
        if endpoint == "stock-quotes":
            return [{"price": 500}], "OK"
        if endpoint == "key-metrics":
            return [{"price_to_earnings_ratio": 30, "free_cash_flow": 100}], "OK"
        if endpoint == "income-statements":
            return [{"currency_code": "USD", "revenue": 1000}], "OK"
        return [], "OK"

    monkeypatch.setattr(mobile_v2, "_fdn_optional", fake_optional)
    result = await mobile_v2._fdn_company_bundle("MSFT")
    assert result["provider"] == "FinancialData.Net"
    period_calls = [(endpoint, params) for endpoint, params in calls if "period" in params]
    assert period_calls
    assert all(params["period"] == "year" for _, params in period_calls)
    assert ("stock-quotes", {"identifiers": "MSFT"}) in calls


@pytest.mark.asyncio
async def test_mobile_indices_normalizes_provider_rows_and_preserves_missing(monkeypatch):
    monkeypatch.setattr(mobile_v2, "FDN_API_KEY", "configured")

    async def fake_get(endpoint: str, params: dict[str, object]):
        assert endpoint == "index-quotes"
        assert "^GSPC" in str(params["identifiers"])
        return [
            {
                "trading_symbol": "^GSPC",
                "index_name": "S&P 500",
                "time": "2026-08-20 10:00:00",
                "price": 7000.25,
                "change": 25.5,
                "percentage_change": 0.37,
            },
            {
                "trading_symbol": "^NDX",
                "index_name": "Nasdaq 100",
                "time": "2026-08-20 10:00:00",
                "price": 26000.0,
                "change": -50.0,
                "percentage_change": -0.19,
            },
        ]

    monkeypatch.setattr(mobile_v2, "_fdn_get", fake_get)
    payload = await mobile_v2.mobile_indices()
    assert payload["provider"] == "FinancialData.Net"
    assert payload["refreshHintSeconds"] == 15
    spx = next(item for item in payload["items"] if item["symbol"] == "^GSPC")
    ndx = next(item for item in payload["items"] if item["symbol"] == "^NDX")
    ibex = next(item for item in payload["items"] if item["symbol"] == "^IBEX")
    assert spx["status"] == "OK" and spx["price"] == 7000.25
    assert ndx["percentageChange"] == -0.19
    assert ibex["status"] == "MISSING" and ibex["price"] is None


@pytest.mark.asyncio
async def test_health_never_exposes_key(monkeypatch):
    monkeypatch.setattr(mobile_v2, "FDN_API_KEY", "secret-value")
    payload = await mobile_v2.mobile_health()
    assert payload["financialdatanet_configured"] is True
    assert payload["apiKeyExposed"] is False
    assert "secret-value" not in str(payload)


@pytest.mark.asyncio
async def test_mobile_company_prefers_fdn(monkeypatch):
    monkeypatch.setattr(mobile_v2, "FDN_API_KEY", "configured")

    async def fake_bundle(symbol: str):
        return {"symbol": symbol, "provider": "FinancialData.Net", "summary": {"ticker": symbol}}

    monkeypatch.setattr(mobile_v2, "_fdn_company_bundle", fake_bundle)
    result = await mobile_v2.mobile_company("msft")
    assert result["symbol"] == "MSFT"
    assert result["provider"] == "FinancialData.Net"
