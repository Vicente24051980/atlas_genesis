from __future__ import annotations

from dataclasses import dataclass

from .ai_demand_engines import SignalState


def _unit(name: str, value: float) -> None:
    if not 0.0 <= value <= 1.0:
        raise ValueError(f"{name} must be between 0 and 1")


@dataclass(frozen=True)
class PolicyInterventionPersistenceInput:
    initial_move: float
    move_1h: float
    move_1d: float
    move_3d: float
    move_5d: float
    confounder_control: float


@dataclass(frozen=True)
class PolicyInterventionPersistenceResult:
    persistence_ratio: float
    signal: SignalState
    regime_change_proven: bool
    portfolio_action_allowed: bool
    reason: str


def evaluate_policy_intervention_persistence(data: PolicyInterventionPersistenceInput) -> PolicyInterventionPersistenceResult:
    _unit("confounder_control", data.confounder_control)
    if data.initial_move == 0:
        ratio = 0.0
    else:
        ratio = data.move_5d / data.initial_move
    same_direction = data.initial_move * data.move_5d > 0
    persistence = abs(ratio) if same_direction else 0.0
    regime = persistence >= 0.70 and data.confounder_control >= 0.70
    if regime:
        signal = SignalState.GREEN_STRONG
        reason = "policy response persisted through five days with strong confounder control"
    elif persistence >= 0.35:
        signal = SignalState.GREEN
        reason = "policy response partially persisted but does not prove a regime change"
    elif persistence > 0:
        signal = SignalState.AMBER
        reason = "policy response faded materially after the initial move"
    else:
        signal = SignalState.RED
        reason = "initial policy response was erased or reversed"
    return PolicyInterventionPersistenceResult(persistence, signal, regime, False, reason)


@dataclass(frozen=True)
class ForcedSellerDislocationInput:
    forced_selling_evidence: float
    leverage_unwind: float
    discount_to_unaffected_value: float
    market_liquidity: float
    fundamental_impairment: float
    balance_sheet_resilience: float
    recovery_probability: float


@dataclass(frozen=True)
class ForcedSellerDislocationResult:
    dislocation_score: float
    signal: SignalState
    clean_dislocation: bool
    portfolio_action_allowed: bool
    reason: str


def evaluate_forced_seller_dislocation(data: ForcedSellerDislocationInput) -> ForcedSellerDislocationResult:
    for name, value in data.__dict__.items():
        _unit(name, value)
    score = (
        0.20 * data.forced_selling_evidence
        + 0.15 * data.leverage_unwind
        + 0.20 * data.discount_to_unaffected_value
        + 0.10 * data.market_liquidity
        + 0.15 * data.balance_sheet_resilience
        + 0.20 * data.recovery_probability
    ) * (1.0 - data.fundamental_impairment)
    clean = score >= 0.65 and data.fundamental_impairment <= 0.25
    if clean:
        signal = SignalState.GREEN_STRONG
    elif score >= 0.45:
        signal = SignalState.GREEN
    elif score >= 0.25:
        signal = SignalState.AMBER
    else:
        signal = SignalState.RED
    return ForcedSellerDislocationResult(
        score,
        signal,
        clean,
        False,
        "forced selling can create dislocation alpha only when fundamental impairment is limited; price collapse is not automatically value",
    )


@dataclass(frozen=True)
class SupplierCompetitorRiskInput:
    vertical_integration_depth: float
    customer_overlap: float
    ecosystem_dependency: float
    incremental_value_capture: float
    switching_cost: float
    customer_alienation_risk: float


@dataclass(frozen=True)
class SupplierCompetitorRiskResult:
    capture_score: float
    ecosystem_risk: float
    net_integration_score: float
    signal: SignalState
    portfolio_action_allowed: bool
    reason: str


def evaluate_supplier_competitor_risk(data: SupplierCompetitorRiskInput) -> SupplierCompetitorRiskResult:
    for name, value in data.__dict__.items():
        _unit(name, value)
    capture = data.vertical_integration_depth * data.incremental_value_capture * (0.5 + 0.5 * data.switching_cost)
    risk = data.customer_overlap * data.ecosystem_dependency * data.customer_alienation_risk
    net = capture - risk
    if net >= 0.35:
        signal = SignalState.GREEN_STRONG
    elif net >= 0.10:
        signal = SignalState.GREEN
    elif net > -0.15:
        signal = SignalState.AMBER
    else:
        signal = SignalState.RED
    return SupplierCompetitorRiskResult(
        capture,
        risk,
        net,
        signal,
        False,
        "vertical integration adds value only when incremental capture exceeds ecosystem conflict; supplier-to-competitor expansion is not automatically accretive",
    )


@dataclass(frozen=True)
class AIInfrastructureCreditFragilityInput:
    debt_to_asset_value: float
    utilization: float
    external_customer_revenue_share: float
    interest_coverage: float
    refinancing_risk: float
    collateral_obsolescence_risk: float
    capital_recirculation: float


@dataclass(frozen=True)
class AIInfrastructureCreditFragilityResult:
    fragility_score: float
    signal: SignalState
    debt_service_resilient: bool
    portfolio_action_allowed: bool
    reason: str


def evaluate_ai_infrastructure_credit_fragility(data: AIInfrastructureCreditFragilityInput) -> AIInfrastructureCreditFragilityResult:
    for name in ("debt_to_asset_value", "utilization", "external_customer_revenue_share", "refinancing_risk", "collateral_obsolescence_risk", "capital_recirculation"):
        _unit(name, getattr(data, name))
    if data.interest_coverage < 0:
        raise ValueError("interest_coverage cannot be negative")
    coverage_risk = 1.0 if data.interest_coverage < 1.0 else max(0.0, min(1.0, (2.5 - data.interest_coverage) / 1.5))
    fragility = (
        0.18 * data.debt_to_asset_value
        + 0.14 * (1.0 - data.utilization)
        + 0.14 * (1.0 - data.external_customer_revenue_share)
        + 0.18 * coverage_risk
        + 0.14 * data.refinancing_risk
        + 0.12 * data.collateral_obsolescence_risk
        + 0.10 * data.capital_recirculation
    )
    resilient = fragility < 0.35 and data.interest_coverage >= 2.0 and data.external_customer_revenue_share >= 0.65
    if fragility >= 0.65:
        signal = SignalState.RED
    elif fragility >= 0.45:
        signal = SignalState.AMBER
    elif fragility >= 0.25:
        signal = SignalState.GREEN
    else:
        signal = SignalState.GREEN_STRONG
    return AIInfrastructureCreditFragilityResult(
        fragility,
        signal,
        resilient,
        False,
        "compute asset value is not debt-service capacity; utilization, external revenue, refinancing and collateral obsolescence must be proven",
    )


@dataclass(frozen=True)
class CrossBorderSupplyChainInput:
    tariff_rate_change: float
    exposed_input_share: float
    pass_through_capacity: float
    substitution_capacity: float
    demand_elasticity: float
    margin_buffer: float


@dataclass(frozen=True)
class CrossBorderSupplyChainResult:
    earnings_risk_score: float
    signal: SignalState
    portfolio_action_allowed: bool
    reason: str


def evaluate_cross_border_supply_chain(data: CrossBorderSupplyChainInput) -> CrossBorderSupplyChainResult:
    for name in ("tariff_rate_change", "exposed_input_share", "pass_through_capacity", "substitution_capacity", "demand_elasticity", "margin_buffer"):
        _unit(name, getattr(data, name))
    raw = data.tariff_rate_change * data.exposed_input_share
    mitigation = 0.35 * data.pass_through_capacity + 0.35 * data.substitution_capacity + 0.30 * data.margin_buffer
    risk = raw * (1.0 - mitigation) * (0.5 + 0.5 * data.demand_elasticity)
    if risk >= 0.30:
        signal = SignalState.RED
    elif risk >= 0.15:
        signal = SignalState.AMBER
    elif risk >= 0.05:
        signal = SignalState.GREEN
    else:
        signal = SignalState.GREEN_STRONG
    return CrossBorderSupplyChainResult(
        risk,
        signal,
        False,
        "tariffs must transmit through input cost, pricing, volume, margin, capex and FCF before becoming a company-level investment conclusion",
    )


MARKET_STRUCTURE_CANONICAL_LAWS = (
    "INITIAL POLICY RESPONSE != REGIME CHANGE",
    "INTERVENTION FAILURE != PROOF OF A SINGLE CAUSE",
    "PRICE COLLAPSE != FUNDAMENTAL COLLAPSE",
    "CHEAP BECAUSE OF FORCED SELLING != CHEAP BECAUSE THE BUSINESS IS BROKEN",
    "VERTICAL INTEGRATION UP != ECOSYSTEM VALUE UP AUTOMATICALLY",
    "COMPUTE ASSET VALUE != DEBT SERVICE CAPACITY",
    "GPU COLLATERAL != PERMANENT COLLATERAL VALUE",
    "PRICE DRAWDOWN != THESIS FAILURE",
    "CONVICTION != EXCUSE TO IGNORE A FALSIFIER",
    "OUTCOME != DECISION QUALITY",
)
