from __future__ import annotations

from dataclasses import dataclass
from enum import Enum


class SignalState(str, Enum):
    RED = "RED"
    AMBER = "AMBER"
    GREEN = "GREEN"
    GREEN_STRONG = "GREEN_STRONG"
    WATCH_ONLY = "WATCH_ONLY"


class ElasticityRegime(str, Enum):
    DESTRUCTIVE_EFFICIENCY = "DESTRUCTIVE_EFFICIENCY"
    JEVONS_EQUILIBRIUM = "JEVONS_EQUILIBRIUM"
    JEVONS_ACCELERATION = "JEVONS_ACCELERATION"
    INSUFFICIENT_EVIDENCE = "INSUFFICIENT_EVIDENCE"


@dataclass(frozen=True)
class ComputeElasticityInput:
    cost_per_inference_change: float
    inference_volume_change: float
    total_compute_change: float
    new_workload_evidence: bool = False


@dataclass(frozen=True)
class ComputeElasticityResult:
    regime: ElasticityRegime
    signal: SignalState
    demand_multiplier: float
    portfolio_action_allowed: bool
    reason: str


def evaluate_compute_elasticity(data: ComputeElasticityInput) -> ComputeElasticityResult:
    """Classify whether efficiency destroys, offsets, or expands aggregate compute demand.

    Changes are decimals: -0.70 means a 70% decline, +4.0 means a 5x final level.
    The function is intentionally conservative: price/cost efficiency alone cannot emit a
    portfolio action. It only upgrades the AI-demand evidence packet.
    """
    if data.cost_per_inference_change <= -1.0:
        raise ValueError("cost_per_inference_change must be greater than -1")
    if data.inference_volume_change <= -1.0:
        raise ValueError("inference_volume_change must be greater than -1")
    if data.total_compute_change <= -1.0:
        raise ValueError("total_compute_change must be greater than -1")

    demand_multiplier = (1.0 + data.cost_per_inference_change) * (1.0 + data.inference_volume_change)

    if data.total_compute_change < -0.05:
        return ComputeElasticityResult(ElasticityRegime.DESTRUCTIVE_EFFICIENCY, SignalState.RED, demand_multiplier, False, "efficiency is coinciding with falling aggregate compute demand")
    if abs(data.total_compute_change) <= 0.05:
        return ComputeElasticityResult(ElasticityRegime.JEVONS_EQUILIBRIUM, SignalState.AMBER, demand_multiplier, False, "efficiency gains are approximately offset by usage growth")
    if data.total_compute_change > 0.05:
        strong = data.new_workload_evidence and data.total_compute_change >= 0.20
        return ComputeElasticityResult(ElasticityRegime.JEVONS_ACCELERATION, SignalState.GREEN_STRONG if strong else SignalState.GREEN, demand_multiplier, False, "aggregate compute demand is expanding despite efficiency gains")
    return ComputeElasticityResult(ElasticityRegime.INSUFFICIENT_EVIDENCE, SignalState.AMBER, demand_multiplier, False, "insufficient evidence to classify compute elasticity")


@dataclass(frozen=True)
class AgenticEconomicsInput:
    capability_proven: bool
    task_completion_proven: bool
    deployed: bool
    paid_usage_proven: bool
    productivity_or_revenue_proven: bool
    fcf_proven: bool
    roic_proven: bool


@dataclass(frozen=True)
class AgenticEconomicsResult:
    signal: SignalState
    economic_proof_stage: str
    portfolio_action_allowed: bool
    reason: str


def evaluate_agentic_economics(data: AgenticEconomicsInput) -> AgenticEconomicsResult:
    stages = (("CAPABILITY", data.capability_proven), ("TASK_COMPLETION", data.task_completion_proven), ("DEPLOYMENT", data.deployed), ("PAID_USAGE", data.paid_usage_proven), ("PRODUCTIVITY_OR_REVENUE", data.productivity_or_revenue_proven), ("FCF", data.fcf_proven), ("ROIC", data.roic_proven))
    reached = "NONE"
    for stage, passed in stages:
        if not passed:
            break
        reached = stage
    if reached in {"NONE", "CAPABILITY"}:
        return AgenticEconomicsResult(SignalState.AMBER, reached, False, "capability is not economic proof")
    if reached in {"TASK_COMPLETION", "DEPLOYMENT", "PAID_USAGE"}:
        return AgenticEconomicsResult(SignalState.GREEN, reached, False, "commercial evidence exists but owner economics remain unproven")
    if reached in {"PRODUCTIVITY_OR_REVENUE", "FCF"}:
        return AgenticEconomicsResult(SignalState.GREEN_STRONG, reached, False, "economic monetization is visible but ROIC proof is incomplete")
    return AgenticEconomicsResult(SignalState.GREEN_STRONG, reached, True, "agentic economics reached ROIC proof; normal valuation and falsifier gates still apply")


@dataclass(frozen=True)
class AgenticEngineeringCompressionInput:
    task_difficulty: float
    autonomous_completion_probability: float
    human_hours_displaced: float
    deployment_frequency: float
    artifact_functional: bool
    independently_verifiable: bool
    production_deployed: bool
    paid_usage_proven: bool = False
    productivity_or_revenue_proven: bool = False
    fcf_proven: bool = False
    roic_proven: bool = False


@dataclass(frozen=True)
class AgenticEngineeringCompressionResult:
    compression_value: float
    signal: SignalState
    evidence_stage: str
    economic_proof: bool
    portfolio_action_allowed: bool
    reason: str


def evaluate_agentic_engineering_compression(data: AgenticEngineeringCompressionInput) -> AgenticEngineeringCompressionResult:
    """Score end-to-end engineering compression without confusing it with owner economics.

    Difficulty and autonomous completion probability are normalized to [0, 1].
    Human-hours displaced and deployment frequency are non-negative. The raw compression
    value is deliberately dimensional: difficulty * P(completion) * hours * deployments.
    Portfolio actions remain blocked here; owner-economics execution belongs to the normal
    Agentic Economic Value + valuation/falsifier gates.
    """
    if not 0.0 <= data.task_difficulty <= 1.0:
        raise ValueError("task_difficulty must be between 0 and 1")
    if not 0.0 <= data.autonomous_completion_probability <= 1.0:
        raise ValueError("autonomous_completion_probability must be between 0 and 1")
    if data.human_hours_displaced < 0 or data.deployment_frequency < 0:
        raise ValueError("hours displaced and deployment frequency cannot be negative")

    value = data.task_difficulty * data.autonomous_completion_probability * data.human_hours_displaced * data.deployment_frequency

    if not data.artifact_functional:
        return AgenticEngineeringCompressionResult(value, SignalState.AMBER, "CAPABILITY", False, False, "generated code without a functional artifact is not task completion")
    if not data.independently_verifiable:
        return AgenticEngineeringCompressionResult(value, SignalState.GREEN, "TASK_COMPLETION_UNVERIFIED", False, False, "functional claim exists but independent verification is missing")
    if not data.production_deployed:
        return AgenticEngineeringCompressionResult(value, SignalState.GREEN, "TASK_COMPLETION", False, False, "verified task completion is strong capability evidence but deployment is unproven")

    economic_proof = data.paid_usage_proven and data.productivity_or_revenue_proven and data.fcf_proven and data.roic_proven
    if economic_proof:
        return AgenticEngineeringCompressionResult(value, SignalState.GREEN_STRONG, "ROIC", True, False, "engineering compression and owner economics are both evidenced; normal valuation, competition-for-capital, and falsifier gates still apply")
    if data.productivity_or_revenue_proven:
        return AgenticEngineeringCompressionResult(value, SignalState.GREEN_STRONG, "PRODUCTIVITY_OR_REVENUE", False, False, "production deployment has measurable economic output, but complete owner-economics proof is absent")
    if data.paid_usage_proven:
        return AgenticEngineeringCompressionResult(value, SignalState.GREEN_STRONG, "PAID_USAGE", False, False, "production deployment and paid usage are proven, but productivity/revenue-to-FCF-to-ROIC transmission is incomplete")
    return AgenticEngineeringCompressionResult(value, SignalState.GREEN_STRONG, "DEPLOYMENT", False, False, "verified production deployment proves end-to-end task completion, not monetization or owner economics")


@dataclass(frozen=True)
class CircularFinancingInput:
    investor_capital: float
    recipient_compute_spend: float
    spend_returning_to_investor: float
    external_revenue: float
    external_customer_share: float


@dataclass(frozen=True)
class CircularFinancingResult:
    signal: SignalState
    capital_recirculation_ratio: float
    organic_demand_ratio: float
    portfolio_action_allowed: bool
    reason: str


def evaluate_circular_financing(data: CircularFinancingInput) -> CircularFinancingResult:
    if data.investor_capital < 0 or data.recipient_compute_spend < 0 or data.spend_returning_to_investor < 0 or data.external_revenue < 0:
        raise ValueError("monetary inputs cannot be negative")
    if not 0.0 <= data.external_customer_share <= 1.0:
        raise ValueError("external_customer_share must be between 0 and 1")
    recirculation = data.spend_returning_to_investor / data.investor_capital if data.investor_capital else 0.0
    organic = data.external_revenue / data.recipient_compute_spend if data.recipient_compute_spend else 0.0
    if recirculation >= 0.50 and data.external_customer_share < 0.50:
        signal, reason = SignalState.RED, "high capital recirculation with weak external demand; vendor-financing risk is material"
    elif recirculation >= 0.25 or data.external_customer_share < 0.65:
        signal, reason = SignalState.AMBER, "circular-financing risk requires monitoring before demand is classified as organic"
    else:
        signal, reason = SignalState.GREEN, "external demand dominates and capital recirculation is limited"
    return CircularFinancingResult(signal, recirculation, organic, False, reason)


@dataclass(frozen=True)
class MachineOriginatedDemandInput:
    human_units: float
    agent_units: float
    machine_units: float


@dataclass(frozen=True)
class MachineOriginatedDemandResult:
    agent_to_human_multiplier: float
    machine_share: float
    signal: SignalState


def evaluate_machine_originated_demand(data: MachineOriginatedDemandInput) -> MachineOriginatedDemandResult:
    if min(data.human_units, data.agent_units, data.machine_units) < 0:
        raise ValueError("demand units cannot be negative")
    total = data.human_units + data.agent_units + data.machine_units
    multiplier = data.agent_units / data.human_units if data.human_units else float("inf") if data.agent_units else 0.0
    machine_share = data.machine_units / total if total else 0.0
    if multiplier > 4.0:
        signal = SignalState.GREEN_STRONG
    elif multiplier >= 2.0:
        signal = SignalState.GREEN
    elif multiplier >= 1.0:
        signal = SignalState.AMBER
    else:
        signal = SignalState.RED
    return MachineOriginatedDemandResult(multiplier, machine_share, signal)


@dataclass(frozen=True)
class QuantumReadinessResult:
    signal: SignalState = SignalState.WATCH_ONLY
    portfolio_action_allowed: bool = False
    reason: str = "quantum readiness is a leading indicator only; BUY/Expected Return upgrades are prohibited without economic proof"


def quantum_readiness_watch() -> QuantumReadinessResult:
    return QuantumReadinessResult()


CANONICAL_LAWS = (
    "COMPUTE EFFICIENCY UP != COMPUTE DEMAND DOWN",
    "CAPABILITY != DEPLOYMENT != PRODUCTIVITY != MONETIZATION != OWNER ECONOMICS",
    "CODE GENERATED != TASK COMPLETED != PRODUCTION DEPLOYED != ECONOMIC VALUE",
    "ENGINEERING COMPRESSION != OWNER ECONOMICS",
    "FINANCED DEMAND != ORGANIC DEMAND",
    "TOKEN GROWTH != FCF GROWTH",
    "QUANTUM READINESS != ECONOMIC PROOF",
)
