from __future__ import annotations

from dataclasses import dataclass
from enum import Enum

from .ai_demand_engines import SignalState


class EvidenceStatus(str, Enum):
    PASS = "PASS"
    PARTIAL = "PARTIAL"
    FAIL = "FAIL"


@dataclass(frozen=True)
class BitcoinTreasuryInput:
    btc_holdings_change: float
    diluted_share_change: float
    btc_per_share_change: float
    debt: float = 0.0
    preferred_notional: float = 0.0
    preferred_cash_cost: float = 0.0
    common_equity_value: float = 0.0
    bitcoin_nav: float = 0.0
    annual_common_cash_generation: float = 0.0


@dataclass(frozen=True)
class BitcoinTreasuryResult:
    signal: SignalState
    btc_per_share_accretive: bool
    economic_leverage_ratio: float
    mnav: float | None
    preferred_cash_burden: float
    portfolio_action_allowed: bool
    reason: str


def evaluate_bitcoin_treasury(data: BitcoinTreasuryInput) -> BitcoinTreasuryResult:
    if min(data.debt, data.preferred_notional, data.preferred_cash_cost, data.common_equity_value, data.bitcoin_nav, data.annual_common_cash_generation) < 0:
        raise ValueError("capital structure inputs cannot be negative")

    leverage = data.debt + data.preferred_notional
    leverage_ratio = leverage / data.common_equity_value if data.common_equity_value else (float("inf") if leverage else 0.0)
    accretive = data.btc_per_share_change > 0
    mnav = data.common_equity_value / data.bitcoin_nav if data.bitcoin_nav else None
    preferred_burden = data.preferred_cash_cost / data.annual_common_cash_generation if data.annual_common_cash_generation else (float("inf") if data.preferred_cash_cost else 0.0)

    if data.btc_holdings_change > 0 and data.btc_per_share_change <= 0:
        return BitcoinTreasuryResult(SignalState.RED, False, leverage_ratio, mnav, preferred_burden, False, "BTC holdings increased without BTC-per-share accretion; dilution or capital structure consumed the gain")
    if data.debt == 0 and data.preferred_notional > 0:
        return BitcoinTreasuryResult(SignalState.AMBER if accretive else SignalState.RED, accretive, leverage_ratio, mnav, preferred_burden, False, "zero debt does not mean zero economic leverage; preferred claims and cash cost must be charged to common")
    if preferred_burden >= 0.50:
        return BitcoinTreasuryResult(SignalState.RED, accretive, leverage_ratio, mnav, preferred_burden, False, "preferred cash obligations consume a material share of common cash generation")
    if mnav is not None and mnav >= 2.0:
        return BitcoinTreasuryResult(SignalState.AMBER, accretive, leverage_ratio, mnav, preferred_burden, False, "BTC-per-share may be accretive, but a large mNAV premium creates valuation-compression risk")
    if accretive and leverage_ratio < 0.25:
        return BitcoinTreasuryResult(SignalState.GREEN, True, leverage_ratio, mnav, preferred_burden, False, "BTC-per-share is accretive with limited senior capital; valuation and downside gates still apply")
    return BitcoinTreasuryResult(SignalState.AMBER, accretive, leverage_ratio, mnav, preferred_burden, False, "treasury economics are incomplete; common-shareholder return cannot be inferred from BTC holdings or BTC yield")


@dataclass(frozen=True)
class FlowSeriesMetadata:
    provider: str
    universe: str
    geography: str
    vehicle: str
    window: str
    timestamp: str


def flow_series_comparable(a: FlowSeriesMetadata, b: FlowSeriesMetadata) -> bool:
    """Flow numbers are directly comparable only when methodology dimensions align."""
    return a.provider == b.provider and a.universe == b.universe and a.geography == b.geography and a.vehicle == b.vehicle and a.window == b.window


@dataclass(frozen=True)
class ClaimIntegrityResult:
    status: EvidenceStatus
    portfolio_action_allowed: bool
    reason: str


def evidence_claim_gate(*, claimed_fact: bool, primary_source_supports_claim: bool) -> ClaimIntegrityResult:
    if claimed_fact and not primary_source_supports_claim:
        return ClaimIntegrityResult(EvidenceStatus.FAIL, False, "claimed fact is contradicted or unsupported by the primary source; downstream inference is blocked")
    if not claimed_fact:
        return ClaimIntegrityResult(EvidenceStatus.PARTIAL, False, "no affirmative factual claim to promote")
    return ClaimIntegrityResult(EvidenceStatus.PASS, True, "primary source supports the factual claim")


@dataclass(frozen=True)
class ReportedGrowthInput:
    reported_growth: float
    acquisition_contribution_known: bool
    organic_growth: float | None = None


def normalized_growth(data: ReportedGrowthInput) -> float | None:
    """Never silently treat reported growth as organic growth after material M&A."""
    if data.acquisition_contribution_known:
        return data.organic_growth
    return None


CANONICAL_INTEGRITY_LAWS = (
    "BTC HOLDINGS UP != BTC PER SHARE UP",
    "BTC YIELD != COMMON SHAREHOLDER RETURN",
    "ZERO DEBT != ZERO ECONOMIC LEVERAGE",
    "BTC PER SHARE ACCRETION != ATTRACTIVE COMMON EQUITY VALUATION",
    "PREFERRED CAPITAL != FREE CAPITAL",
    "EDGE COMPUTE GROWTH != CLOUD COMPUTE CONTRACTION",
    "FLOW SERIES REQUIRE PROVIDER + UNIVERSE + GEOGRAPHY + VEHICLE + WINDOW + TIMESTAMP",
    "REPORTED GROWTH != ORGANIC GROWTH WHEN M&A IS MATERIAL",
    "MODEL REGIME CLASSIFICATION != OBSERVED FACT",
)
