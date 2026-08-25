from __future__ import annotations

from dataclasses import dataclass

from .ai_demand_engines import SignalState


def _unit(name: str, value: float) -> None:
    if not 0.0 <= value <= 1.0:
        raise ValueError(f"{name} must be between 0 and 1")


@dataclass(frozen=True)
class MemoryScarcityTransmissionInput:
    scarcity_severity: float
    asp_change: float
    bits_shipped_change: float
    mix_improvement: float
    gross_margin_capture: float
    fcf_per_share_capture: float
    capacity_response_risk: float
    demand_destruction_risk: float
    china_supply_risk: float


@dataclass(frozen=True)
class MemoryScarcityTransmissionResult:
    earnings_conversion_score: float
    durability_score: float
    signal: SignalState
    owner_economics_proven: bool
    portfolio_action_allowed: bool
    reason: str


def evaluate_memory_scarcity_transmission(data: MemoryScarcityTransmissionInput) -> MemoryScarcityTransmissionResult:
    """Translate physical memory scarcity into owner economics.

    All inputs are normalized to [0,1]. Scarcity itself cannot authorize a portfolio
    action. The engine rewards ASP/volume/mix/margin/FCF conversion and explicitly
    discounts capacity response, demand destruction and Chinese supply expansion.
    """
    for name, value in data.__dict__.items():
        _unit(name, value)
    conversion = (
        0.16 * data.scarcity_severity
        + 0.15 * data.asp_change
        + 0.12 * data.bits_shipped_change
        + 0.10 * data.mix_improvement
        + 0.20 * data.gross_margin_capture
        + 0.27 * data.fcf_per_share_capture
    )
    durability = 1.0 - (
        0.40 * data.capacity_response_risk
        + 0.30 * data.demand_destruction_risk
        + 0.30 * data.china_supply_risk
    )
    score = max(0.0, min(1.0, conversion * (0.55 + 0.45 * durability)))
    proven = (
        data.gross_margin_capture >= 0.65
        and data.fcf_per_share_capture >= 0.65
        and score >= 0.65
    )
    if score >= 0.80 and proven:
        signal = SignalState.GREEN_STRONG
    elif score >= 0.60:
        signal = SignalState.GREEN
    elif score >= 0.40:
        signal = SignalState.AMBER
    else:
        signal = SignalState.RED
    return MemoryScarcityTransmissionResult(
        score,
        durability,
        signal,
        proven,
        False,
        "scarcity must convert through ASP x bits shipped x mix x gross margin into FCF/share; scarcity alone is not owner economics",
    )


@dataclass(frozen=True)
class ScarcityPaidInput:
    economic_proof: float
    trailing_equity_repricing: float
    valuation_expansion: float
    consensus_expectation_saturation: float
    forward_fcf_revision_headroom: float
    normalized_cycle_upside: float


@dataclass(frozen=True)
class ScarcityPaidResult:
    paid_score: float
    mispricing_gap: float
    signal: SignalState
    underpaid_scarcity: bool
    portfolio_action_allowed: bool
    reason: str


def evaluate_scarcity_paid(data: ScarcityPaidInput) -> ScarcityPaidResult:
    """Measure whether scarcity economics are already embedded in the equity price."""
    for name, value in data.__dict__.items():
        _unit(name, value)
    paid = (
        0.40 * data.trailing_equity_repricing
        + 0.25 * data.valuation_expansion
        + 0.35 * data.consensus_expectation_saturation
    )
    residual = 0.60 * data.forward_fcf_revision_headroom + 0.40 * data.normalized_cycle_upside
    gap = data.economic_proof + residual - paid
    underpaid = data.economic_proof >= 0.70 and paid <= 0.65 and gap >= 0.45
    if underpaid:
        signal = SignalState.GREEN_STRONG
    elif gap >= 0.30:
        signal = SignalState.GREEN
    elif gap >= 0.05:
        signal = SignalState.AMBER
    else:
        signal = SignalState.RED
    return ScarcityPaidResult(
        paid,
        gap,
        signal,
        underpaid,
        False,
        "good scarcity news is not a positive surprise when earnings and valuation already discount it; economic proof must be compared with price paid",
    )


@dataclass(frozen=True)
class AgenticProductionProofInput:
    capability_proven: bool
    task_completion_proven: bool
    containment_proven: bool
    deployed: bool
    production_outcome_observed: bool
    paid_usage_proven: bool
    productivity_or_revenue_proven: bool
    fcf_proven: bool
    roic_proven: bool


@dataclass(frozen=True)
class AgenticProductionProofResult:
    evidence_stage: str
    signal: SignalState
    containment_gate_passed: bool
    production_value_proven: bool
    portfolio_action_allowed: bool
    reason: str


def evaluate_agentic_production_proof(data: AgenticProductionProofInput) -> AgenticProductionProofResult:
    if not data.capability_proven:
        return AgenticProductionProofResult("NONE", SignalState.AMBER, False, False, False, "capability is unproven")
    if not data.task_completion_proven:
        return AgenticProductionProofResult("CAPABILITY", SignalState.AMBER, False, False, False, "capability is not task completion")
    if not data.containment_proven:
        return AgenticProductionProofResult("CONTAINMENT_BLOCKED", SignalState.RED, False, False, False, "autonomous task completion without containment proof cannot pass the deployment gate")
    if not data.deployed:
        return AgenticProductionProofResult("CONTAINMENT", SignalState.GREEN, True, False, False, "containment is proven but production deployment is not")
    if not data.production_outcome_observed:
        return AgenticProductionProofResult("DEPLOYMENT", SignalState.GREEN, True, False, False, "deployment is not production value without measured real-world outcomes")
    if not data.paid_usage_proven:
        return AgenticProductionProofResult("PRODUCTION_OUTCOME", SignalState.GREEN_STRONG, True, True, False, "production outcome is verified but paid adoption is unproven")
    if not data.productivity_or_revenue_proven:
        return AgenticProductionProofResult("PAID_USAGE", SignalState.GREEN_STRONG, True, True, False, "paid usage exists but economic output is incomplete")
    if not data.fcf_proven:
        return AgenticProductionProofResult("PRODUCTIVITY_OR_REVENUE", SignalState.GREEN_STRONG, True, True, False, "economic output exists but FCF transmission is incomplete")
    if not data.roic_proven:
        return AgenticProductionProofResult("FCF", SignalState.GREEN_STRONG, True, True, False, "FCF is visible but ROIC proof is incomplete")
    return AgenticProductionProofResult("ROIC", SignalState.GREEN_STRONG, True, True, True, "closed-loop agentic value reached ROIC proof; valuation and falsifier gates still apply")


@dataclass(frozen=True)
class LeverageFlowDistortionInput:
    forced_selling_evidence: float
    margin_call_intensity: float
    block_trade_intensity: float
    systematic_deleveraging: float
    fundamental_impairment: float
    rebound_after_forced_supply: float
    persistence_after_72h: float
    relative_strength_after_72h: float


@dataclass(frozen=True)
class LeverageFlowDistortionResult:
    distortion_score: float
    clean_fundamental_signal_score: float
    signal: SignalState
    flow_confirmation_allowed: bool
    reason: str


def evaluate_leverage_flow_distortion(data: LeverageFlowDistortionInput) -> LeverageFlowDistortionResult:
    for name, value in data.__dict__.items():
        _unit(name, value)
    distortion = (
        0.30 * data.forced_selling_evidence
        + 0.25 * data.margin_call_intensity
        + 0.20 * data.block_trade_intensity
        + 0.25 * data.systematic_deleveraging
    ) * (1.0 - 0.50 * data.fundamental_impairment)
    clean = (
        0.35 * (1.0 - distortion)
        + 0.20 * (1.0 - data.fundamental_impairment)
        + 0.20 * data.rebound_after_forced_supply
        + 0.15 * data.persistence_after_72h
        + 0.10 * data.relative_strength_after_72h
    )
    allowed = clean >= 0.70 and data.persistence_after_72h >= 0.60 and data.relative_strength_after_72h >= 0.55
    if allowed:
        signal = SignalState.GREEN_STRONG
    elif clean >= 0.55:
        signal = SignalState.GREEN
    elif distortion >= 0.60:
        signal = SignalState.AMBER
    else:
        signal = SignalState.RED
    return LeverageFlowDistortionResult(
        distortion,
        clean,
        signal,
        allowed,
        "forced selling is not fundamental deterioration and a post-liquidation rebound is not new fundamental demand; persistence and relative strength must survive the unwind",
    )


@dataclass(frozen=True)
class LongTermLeverageGateInput:
    gross_exposure: float
    net_asset_value: float
    maintenance_requirement: float
    stress_drawdown: float
    overnight_gap_risk: float
    strategic_horizon: bool = True


@dataclass(frozen=True)
class LongTermLeverageGateResult:
    leverage_multiple: float
    stressed_equity_ratio: float
    liquidation_headroom: float
    signal: SignalState
    gate_passed: bool
    portfolio_action_allowed: bool
    reason: str


def evaluate_long_term_leverage_gate(data: LongTermLeverageGateInput) -> LongTermLeverageGateResult:
    if data.gross_exposure < 0 or data.net_asset_value <= 0:
        raise ValueError("gross_exposure must be non-negative and net_asset_value must be positive")
    for name in ("maintenance_requirement", "stress_drawdown", "overnight_gap_risk"):
        _unit(name, getattr(data, name))
    leverage = data.gross_exposure / data.net_asset_value
    debt = max(data.gross_exposure - data.net_asset_value, 0.0)
    stressed_assets = data.gross_exposure * (1.0 - data.stress_drawdown) * (1.0 - data.overnight_gap_risk)
    stressed_equity = stressed_assets - debt
    equity_ratio = stressed_equity / stressed_assets if stressed_assets > 0 else -1.0
    headroom = equity_ratio - data.maintenance_requirement
    passed = (not data.strategic_horizon or leverage <= 1.0 + 1e-9) and headroom >= 0.10
    if passed:
        signal = SignalState.GREEN_STRONG
    elif headroom >= 0.0:
        signal = SignalState.AMBER
    else:
        signal = SignalState.RED
    return LongTermLeverageGateResult(
        leverage,
        equity_ratio,
        headroom,
        signal,
        passed,
        passed,
        "long-term conviction requires survivability; strategic leverage is blocked because path risk and lender timing can convert temporary drawdowns into permanent capital loss",
    )


THREAD_SIGNAL_CANONICAL_LAWS = (
    "SCARCITY != OWNER ECONOMICS",
    "SCARCITY -> ASP X BITS SHIPPED X MIX -> GROSS MARGIN -> FCF/SHARE",
    "GOOD NEWS != POSITIVE SURPRISE",
    "ECONOMIC PROOF UP != EXPECTED RETURN UP",
    "CAPABILITY UP != DEPLOYABILITY UP",
    "TASK COMPLETION != PRODUCTION VALUE",
    "FORCED SELLING != FUNDAMENTAL DETERIORATION",
    "POST-LIQUIDATION REBOUND != NEW FUNDAMENTAL DEMAND",
    "THESIS QUALITY != PORTFOLIO SURVIVABILITY",
    "EXPECTED RETURN WITHOUT SURVIVAL CONSTRAINTS IS NOT INVESTABLE EXPECTED RETURN",
)
