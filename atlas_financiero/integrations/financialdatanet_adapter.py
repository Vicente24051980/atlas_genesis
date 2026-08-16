"""ATLAS Ω adapter for FinancialData.Net.

The adapter isolates provider-specific semantics from ATLAS engines. It never
exposes raw fdnpy responses directly to scoring or decision layers.
"""
from __future__ import annotations

from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from hashlib import sha256
from typing import Any, Callable, Dict, Iterable, List, Mapping, Optional


@dataclass(frozen=True)
class EvidenceRecord:
    provider: str
    endpoint: str
    identifier: str
    observed_at: str
    source_timestamp: Optional[str]
    payload: Dict[str, Any]
    provenance_hash: str
    confidence: str = "SECONDARY_PROVIDER"

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class FinancialDataNetAdapter:
    """Provider adapter with normalization and provenance tracking.

    `client` can be a real `fdnpy.FinancialDataClient` or a test double.
    """

    PROVIDER = "FinancialData.Net"

    def __init__(self, client: Any, clock: Optional[Callable[[], datetime]] = None) -> None:
        self.client = client
        self.clock = clock or (lambda: datetime.now(timezone.utc))

    @staticmethod
    def _clean_value(value: Any) -> Any:
        if isinstance(value, str):
            stripped = value.strip()
            if stripped == "":
                return None
            return stripped
        return value

    @classmethod
    def _normalize_mapping(cls, row: Mapping[str, Any]) -> Dict[str, Any]:
        normalized: Dict[str, Any] = {}
        for key, value in row.items():
            clean_key = str(key).strip().lower().replace(" ", "_")
            if isinstance(value, Mapping):
                normalized[clean_key] = cls._normalize_mapping(value)
            elif isinstance(value, list):
                normalized[clean_key] = [
                    cls._normalize_mapping(v) if isinstance(v, Mapping) else cls._clean_value(v)
                    for v in value
                ]
            else:
                normalized[clean_key] = cls._clean_value(value)
        return normalized

    @staticmethod
    def _source_timestamp(payload: Mapping[str, Any]) -> Optional[str]:
        for key in (
            "date",
            "datetime",
            "timestamp",
            "filing_date",
            "accepted_date",
            "period_end_date",
        ):
            value = payload.get(key)
            if value:
                return str(value)
        return None

    @staticmethod
    def _hash(endpoint: str, identifier: str, payload: Mapping[str, Any]) -> str:
        canonical = repr((endpoint, identifier, sorted(payload.items(), key=lambda kv: kv[0])))
        return sha256(canonical.encode("utf-8")).hexdigest()

    def _records(self, endpoint: str, identifier: str, rows: Iterable[Mapping[str, Any]]) -> List[EvidenceRecord]:
        observed = self.clock().astimezone(timezone.utc).isoformat()
        records: List[EvidenceRecord] = []
        for row in rows:
            payload = self._normalize_mapping(row)
            records.append(
                EvidenceRecord(
                    provider=self.PROVIDER,
                    endpoint=endpoint,
                    identifier=identifier,
                    observed_at=observed,
                    source_timestamp=self._source_timestamp(payload),
                    payload=payload,
                    provenance_hash=self._hash(endpoint, identifier, payload),
                )
            )
        return records

    def company_information(self, identifier: str, international: bool = False) -> List[EvidenceRecord]:
        method = self.client.get_international_company_information if international else self.client.get_company_information
        return self._records("international-company-information" if international else "company-information", identifier, method(identifier))

    def key_metrics(self, identifier: str, international: bool = False) -> List[EvidenceRecord]:
        method = self.client.get_international_key_metrics if international else self.client.get_key_metrics
        return self._records("international-key-metrics" if international else "key-metrics", identifier, method(identifier))

    def income_statements(self, identifier: str, period: Optional[str] = None, international: bool = False) -> List[EvidenceRecord]:
        method = self.client.get_international_income_statements if international else self.client.get_income_statements
        return self._records("international-income-statements" if international else "income-statements", identifier, method(identifier, period))

    def balance_sheet_statements(self, identifier: str, period: Optional[str] = None, international: bool = False) -> List[EvidenceRecord]:
        method = self.client.get_international_balance_sheet_statements if international else self.client.get_balance_sheet_statements
        return self._records("international-balance-sheet-statements" if international else "balance-sheet-statements", identifier, method(identifier, period))

    def cash_flow_statements(self, identifier: str, period: Optional[str] = None, international: bool = False) -> List[EvidenceRecord]:
        method = self.client.get_international_cash_flow_statements if international else self.client.get_cash_flow_statements
        return self._records("international-cash-flow-statements" if international else "cash-flow-statements", identifier, method(identifier, period))

    def valuation_ratios(self, identifier: str, period: Optional[str] = None) -> List[EvidenceRecord]:
        return self._records("valuation-ratios", identifier, self.client.get_valuation_ratios(identifier, period))

    def profitability_ratios(self, identifier: str, period: Optional[str] = None) -> List[EvidenceRecord]:
        return self._records("profitability-ratios", identifier, self.client.get_profitability_ratios(identifier, period))

    def market_cap(self, identifier: str) -> List[EvidenceRecord]:
        records = self._records("market-cap", identifier, self.client.get_market_cap(identifier))
        # Constitutional guardrail: market-cap changes are never relabeled as capital flows.
        for record in records:
            if "capital_flow" in record.payload:
                raise ValueError("Provider payload attempted to map market-cap data to capital_flow")
        return records

    def institutional_holdings(self, identifier: str) -> List[EvidenceRecord]:
        method = getattr(self.client, "get_institutional_holdings", None)
        if method is None:
            raise NotImplementedError("Installed fdnpy client does not expose institutional holdings")
        return self._records("institutional-holdings", identifier, method(identifier))

    def stock_prices(self, identifier: str, international: bool = False) -> List[EvidenceRecord]:
        method = self.client.get_international_stock_prices if international else self.client.get_stock_prices
        return self._records("international-stock-prices" if international else "stock-prices", identifier, method(identifier))
