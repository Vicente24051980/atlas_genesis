from datetime import datetime, timezone

from financialdatanet_adapter import FinancialDataNetAdapter


class FakeClient:
    def get_company_information(self, identifier):
        return [{"Ticker": identifier, "Name": " Example Corp ", "Empty": ""}]

    def get_market_cap(self, identifier):
        return [{"date": "2026-08-14", "market_cap": 1000, "change_in_market_cap": 25}]

    def get_stock_prices(self, identifier):
        return [{"date": "2026-08-14", "close": 100.0}]


def fixed_clock():
    return datetime(2026, 8, 16, 16, 3, tzinfo=timezone.utc)


def test_normalizes_and_tracks_provenance():
    adapter = FinancialDataNetAdapter(FakeClient(), clock=fixed_clock)
    record = adapter.company_information("TEST")[0]
    assert record.provider == "FinancialData.Net"
    assert record.identifier == "TEST"
    assert record.payload["ticker"] == "TEST"
    assert record.payload["name"] == "Example Corp"
    assert record.payload["empty"] is None
    assert record.observed_at == "2026-08-16T16:03:00+00:00"
    assert len(record.provenance_hash) == 64


def test_market_cap_change_is_not_capital_flow():
    adapter = FinancialDataNetAdapter(FakeClient(), clock=fixed_clock)
    record = adapter.market_cap("TEST")[0]
    assert record.payload["change_in_market_cap"] == 25
    assert "capital_flow" not in record.payload


def test_stock_prices_preserve_source_date():
    adapter = FinancialDataNetAdapter(FakeClient(), clock=fixed_clock)
    record = adapter.stock_prices("TEST")[0]
    assert record.source_timestamp == "2026-08-14"
