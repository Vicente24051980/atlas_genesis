from __future__ import annotations

import pytest

from api import mobile_v2


def test_portfolio_snapshot_is_36_and_unique():
    assert len(mobile_v2.PORTFOLIO_36) == 36
    assert len(set(mobile_v2.PORTFOLIO_36)) == 36
    assert "GOOGL" in mobile_v2.PORTFOLIO_36
    assert "NVDA" in mobile_v2.PORTFOLIO_36


def test_summary_normalizer_handles_common_provider_keys():
    sections = {
        "company": [{"Company Name": "Example Corp", "Currency": "USD"}],
        "quote": [{"last_price": 101.5}],
        "keyMetrics": [{"Revenue TTM": 1234}],
        "valuation": [{"PE Ratio": 20.1}],
        "marketCap": [{"market_cap": 9999, "change_in_market_cap": 55}],
        "cashFlow": [{"free_cash_flow": 88}],
    }
    summary = mobile_v2._summary_from_sections("TEST", sections)
    assert summary["name"] == "Example Corp"
    assert summary["price"] == 101.5
    assert summary["marketCap"] == 9999
    assert summary["pe"] == 20.1
    assert summary["freeCashFlow"] == 88
    assert "capitalFlow" not in summary


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
