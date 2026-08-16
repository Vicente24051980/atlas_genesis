"""Live certification harness for FinancialData.Net.

This module does not alter any ATLAS thesis or score. It produces a structured
certification report that must be reconciled against Level-1 sources manually or
by a separate primary-source pipeline before provider promotion.
"""
from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Dict, List

from .financialdatanet_adapter import FinancialDataNetAdapter


@dataclass
class CertificationResult:
    identifier: str
    international: bool
    checks: Dict[str, int]
    status: str

    def to_dict(self):
        return asdict(self)


def certify_identifier(
    adapter: FinancialDataNetAdapter,
    identifier: str,
    *,
    international: bool = False,
) -> CertificationResult:
    datasets = {
        "company_information": adapter.company_information(identifier, international=international),
        "key_metrics": adapter.key_metrics(identifier, international=international),
        "income_statements": adapter.income_statements(identifier, international=international),
        "balance_sheet_statements": adapter.balance_sheet_statements(identifier, international=international),
        "cash_flow_statements": adapter.cash_flow_statements(identifier, international=international),
        "stock_prices": adapter.stock_prices(identifier, international=international),
    }
    checks = {name: len(records) for name, records in datasets.items()}
    status = "READY_FOR_LEVEL1_RECONCILIATION" if all(v > 0 for v in checks.values()) else "INCOMPLETE_PROVIDER_COVERAGE"
    return CertificationResult(identifier, international, checks, status)


def certify_basket(adapter: FinancialDataNetAdapter, basket: List[tuple[str, bool]]) -> List[CertificationResult]:
    return [certify_identifier(adapter, symbol, international=international) for symbol, international in basket]
