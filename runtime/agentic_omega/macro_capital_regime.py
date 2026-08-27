from __future__ import annotations

from dataclasses import dataclass

from .ai_demand_engines import SignalState


def _unit(name: str, value: float) -> None:
    if not 0.0 <= value <= 1.0:
        raise ValueError(f"{name} must be between 0 and 1")


@dataclass(frozen=True)
class SupplyChainRentMigrationInput:
    end_demand_strength: float
    customer_margin_compression: float
    bottleneck_scarcity: float
    supplier_asp_power: float
    supplier_margin_capture: float
    supplier_fcf_revision: float
    capacity_response_risk: float
    substitution_risk: float
    valuation_saturation: float


@dataclass(frozen=True)
class SupplyChainRentMigrationResult:
    migration_score: float
    durability_score: float
    signal: SignalState
    supplier_rent_migration_confirmed: bool
    portfolio_action_allowed: bool
    reason: str


def evaluate_supply_chain_rent_migration(data: SupplyChainRentMigrationInput) -> SupplyChainRentMigrationResult:
    """Detect when a physical bottleneck shifts incremental economics toward suppliers.

    Customer margin compression is not automatically bullish for suppliers. Confirmation
    requires scarcity plus supplier ASP/margin/FCF capture. Capacity response, substitution
    and valuation saturation reduce durability/expected-return quality.
    """
    for name, value in data.__dict__.items():
        _unit(name, value)

    capture = (
        0.15 * data.end_demand_strength
        + 0.15 * data.customer_margin_compression
        + 0.15 * data.bottleneck_scarcity
        + 0.15 * data.supplier_asp_power
        + 0.18 * data.supplier_margin_capture
        + 0.22 * data.supplier_fcf_revision
    )
    durability = 1.0 - (
        0.40 * data.capacity_response_risk
        + 0.30 * data.substitution_risk
        + 0.30 * data.valuation_saturation
    )
    score = max(0.0, min(1.0, capture * (0.55 + 0.45 * durability)))
    confirmed = (
        data.bottleneck_scarcity >= 0.65
        and data.supplier_margin_capture >= 0.60
        and data.supplier_fcf_revision >= 0.60
        and score >= 0.62
    )

    if confirmed and score >= 0.78:
        signal = SignalState.GREEN_STRONG
    elif score >= 0.60:
        signal = SignalState.GREEN
    elif score >= 0.40:
        signal = SignalState.AMBER
    else:
        signal = SignalState.RED

    return SupplyChainRentMigrationResult(
        score,
        durability,
        signal,
        confirmed,
        False,
        "customer margin pressure can signal rent migration only when supplier ASP, margin and FCF capture confirm; scarcity alone is not owner economics",
    )


@dataclass(frozen=True)
class FinancialRepressionInput:
    nominal_gdp_growth: float
    debt_growth: float
    inflation_rate: float
    cash_yield: float
    treasury_30y_yield: float
    treasury_supply_pressure: float
    ai_corporate_debt_pressure: float
    term_premium_pressure: float


@dataclass(frozen=True)
class FinancialRepressionResult:
    debt_dilution_spread: float
    real_cash_return: float
    duration_pressure_score: float
    signal: SignalState
    repression_regime_active: bool
    portfolio_action_allowed: bool
    reason: str


def evaluate_financial_repression(data: FinancialRepressionInput) -> FinancialRepressionResult:
    """Model debt dilution and capital-market pressure without assuming sovereign collapse.

    Rates are decimal annual rates (0.05 == 5%). Pressure inputs are normalized [0,1].
    The engine distinguishes unremunerated cash drag from cash earning a positive real yield.
    """
    for name in ("treasury_supply_pressure", "ai_corporate_debt_pressure", "term_premium_pressure"):
        _unit(name, getattr(data, name))
    if min(data.nominal_gdp_growth, data.debt_growth, data.inflation_rate, data.cash_yield, data.treasury_30y_yield) < 0:
        raise ValueError("growth, inflation and yield inputs cannot be negative")

    dilution_spread = data.nominal_gdp_growth - data.debt_growth
    real_cash = data.cash_yield - data.inflation_rate
    yield_stress = max(0.0, min(1.0, (data.treasury_30y_yield - 0.035) / 0.025))
    duration_pressure = max(
        0.0,
        min(
            1.0,
            0.35 * yield_stress
            + 0.25 * data.treasury_supply_pressure
            + 0.20 * data.ai_corporate_debt_pressure
            + 0.20 * data.term_premium_pressure,
        ),
    )
    repression = data.inflation_rate > data.cash_yield and dilution_spread >= -0.02

    if duration_pressure >= 0.75:
        signal = SignalState.RED
    elif duration_pressure >= 0.55:
        signal = SignalState.AMBER
    elif duration_pressure >= 0.35:
        signal = SignalState.GREEN
    else:
        signal = SignalState.GREEN_STRONG

    return FinancialRepressionResult(
        dilution_spread,
        real_cash,
        duration_pressure,
        signal,
        repression,
        False,
        "sovereign debt need not default to damage real savers; inflation, nominal growth, fiscal supply and term premium alter the equity hurdle rate",
    )


@dataclass(frozen=True)
class ROICWACCGateInput:
    roic: float
    wacc: float
    incremental_roic: float
    fcf_current: bool
    pricing_power: float
    balance_sheet_strength: float
    capex_payback_visibility: float
    leverage_risk: float
    long_duration_valuation: float


@dataclass(frozen=True)
class ROICWACCGateResult:
    roic_wacc_spread: float
    incremental_spread: float
    quality_score: float
    signal: SignalState
    gate_passed: bool
    portfolio_action_allowed: bool
    reason: str


def evaluate_roic_wacc_gate(data: ROICWACCGateInput) -> ROICWACCGateResult:
    """Require owner returns to clear the cost of capital with a margin of safety."""
    if min(data.roic, data.wacc, data.incremental_roic) < 0:
        raise ValueError("ROIC and WACC inputs cannot be negative")
    for name in ("pricing_power", "balance_sheet_strength", "capex_payback_visibility", "leverage_risk", "long_duration_valuation"):
        _unit(name, getattr(data, name))

    spread = data.roic - data.wacc
    incremental_spread = data.incremental_roic - data.wacc
    spread_score = max(0.0, min(1.0, incremental_spread / 0.15))
    quality = (
        0.32 * spread_score
        + 0.18 * data.pricing_power
        + 0.18 * data.balance_sheet_strength
        + 0.17 * data.capex_payback_visibility
        + 0.15 * (1.0 - data.leverage_risk)
    ) * (1.0 - 0.35 * data.long_duration_valuation)

    passed = (
        data.fcf_current
        and incremental_spread >= 0.04
        and data.balance_sheet_strength >= 0.55
        and data.capex_payback_visibility >= 0.50
        and quality >= 0.60
    )

    if passed and quality >= 0.78:
        signal = SignalState.GREEN_STRONG
    elif passed:
        signal = SignalState.GREEN
    elif incremental_spread <= 0:
        signal = SignalState.RED
    else:
        signal = SignalState.AMBER

    return ROICWACCGateResult(
        spread,
        incremental_spread,
        quality,
        signal,
        passed,
        passed,
        "growth is investable only when current and incremental owner returns clear WACC after leverage, duration and capex-payback penalties",
    )


@dataclass(frozen=True)
class SecondarySignalIntegrityInput:
    economic_proof: float
    estimate_revision_breadth: float
    analyst_target_revision: float
    insider_or_political_trade_signal: float
    headline_narrative_intensity: float
    regular_session_confirmation: float


@dataclass(frozen=True)
class SecondarySignalIntegrityResult:
    confirmation_score: float
    signal: SignalState
    economic_proof_created: bool
    portfolio_action_allowed: bool
    reason: str


def evaluate_secondary_signal_integrity(data: SecondarySignalIntegrityInput) -> SecondarySignalIntegrityResult:
    """Treat analyst targets, disclosed trades and headlines as secondary confirmation only."""
    for name, value in data.__dict__.items():
        _unit(name, value)

    score = (
        0.45 * data.economic_proof
        + 0.20 * data.estimate_revision_breadth
        + 0.10 * data.analyst_target_revision
        + 0.05 * data.insider_or_political_trade_signal
        + 0.05 * data.headline_narrative_intensity
        + 0.15 * data.regular_session_confirmation
    )
    if data.economic_proof < 0.50:
        signal = SignalState.AMBER if score >= 0.40 else SignalState.RED
    elif score >= 0.75:
        signal = SignalState.GREEN_STRONG
    else:
        signal = SignalState.GREEN

    return SecondarySignalIntegrityResult(
        score,
        signal,
        False,
        False,
        "sell-side targets, political/insider disclosures and headlines can confirm attention but cannot manufacture Economic Proof or authorize a trade",
    )


MACRO_CAPITAL_CANONICAL_LAWS = (
    "SOVEREIGN DEBT STRESS != IMMINENT DEFAULT",
    "NOMINAL DEBT GROWTH != REAL DEBT BURDEN GROWTH",
    "UNREMUNERATED CASH LONG TERM = REAL RETURN DRAG WHEN INFLATION > CASH YIELD",
    "CASH != AUTOMATICALLY BAD",
    "TREASURY SUPPLY + AI CORPORATE DEBT SUPPLY -> HIGHER CAPITAL COMPETITION",
    "ROIC MUST CLEAR WACC WITH A MARGIN OF SAFETY",
    "INCREMENTAL ROIC < MARGINAL COST OF CAPITAL = AI CAPEX FALSIFIER",
    "CUSTOMER MARGIN COMPRESSION != SUPPLIER WIN WITHOUT MARGIN/FCF CAPTURE",
    "SCARCITY RENT CAN MIGRATE ACROSS THE SUPPLY CHAIN",
    "ANALYST TARGETS != ECONOMIC PROOF",
    "POLITICAL OR INSIDER TRADE DISCLOSURE != FUNDAMENTAL BUY SIGNAL",
    "HEADLINE MOMENTUM != OWNER ECONOMICS",
)
