from datetime import datetime, timezone

from atlas_financiero.integrations.financialdatanet_adapter import FinancialDataNetAdapter
from atlas_financiero.integrations.live_certification import certify_identifier


class CompleteClient:
    def _row(self, identifier):
        return [{"date": "2026-08-14", "identifier": identifier, "value": 1}]

    def get_company_information(self, identifier): return self._row(identifier)
    def get_key_metrics(self, identifier): return self._row(identifier)
    def get_income_statements(self, identifier, period=None): return self._row(identifier)
    def get_balance_sheet_statements(self, identifier, period=None): return self._row(identifier)
    def get_cash_flow_statements(self, identifier, period=None): return self._row(identifier)
    def get_stock_prices(self, identifier): return self._row(identifier)


def test_complete_identifier_reaches_reconciliation_gate():
    adapter = FinancialDataNetAdapter(CompleteClient(), clock=lambda: datetime(2026, 8, 16, tzinfo=timezone.utc))
    result = certify_identifier(adapter, "MSFT")
    assert result.status == "READY_FOR_LEVEL1_RECONCILIATION"
    assert all(count == 1 for count in result.checks.values())
