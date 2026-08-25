from __future__ import annotations

from dataclasses import dataclass

from .ai_demand_engines import SignalState


def _unit(name: str, value: float) -> None:
    if not 0.0 <= value <= 1.0:
        raise ValueError(f"{name} must be between 0 and 1")


@dataclass(frozen=True)
class FrontierModelCommoditizationInput:
    capability_gap: float
    price_advantage: float
    switching_ease: float
    open_weight_pressure: float
    developer_adoption_pressure: float
    incumbent_distribution_moat: float


@dataclass(frozen=True)
class FrontierModelCommoditizationResult:
    commoditization_score: float
    signal: SignalState
    pricing_power_at_risk: bool
    portfolio_action_allowed: bool
    reason: str


def evaluate_frontier_model_commoditization(data: FrontierModelCommoditizationInput) -> FrontierModelCommoditizationResult:
    for name, value in data.__dict__.items():
        _unit(name, value)
    score = (
        0.25 * (1.0 - data.capability_gap)
        + 0.20 * data.price_advantage
        + 0.15 * data.switching_ease
        + 0.15 * data.open_weight_pressure
        + 0.15 * data.developer_adoption_pressure
        + 0.10 * (1.0 - data.incumbent_distribution_moat)
    )
    if score >= 0.75:
        signal = SignalState.GREEN_STRONG
    elif score >= 0.55:
        signal = SignalState.GREEN
    elif score >= 0.35:
        signal = SignalState.AMBER
    else:
        signal = SignalState.RED
    risk = score >= 0.55
    return FrontierModelCommoditizationResult(
        score,
        signal,
        risk,
        False,
        "capability convergence can weaken model-layer pricing power; benchmark parity is not owner economics",
    )


@dataclass(frozen=True)
class PersistentAgentSurfaceInput:
    context_coverage: float
    persistence: float
    tool_access: float
    action_authority: float
    autonomous_hours_per_day: float
    useful_actions_per_day: float
    intervention_rate: float


@dataclass(frozen=True)
class PersistentAgentSurfaceResult:
    surface_score: float
    machine_workload_index: float
    signal: SignalState
    portfolio_action_allowed: bool
    reason: str


def evaluate_persistent_agent_surface(data: PersistentAgentSurfaceInput) -> PersistentAgentSurfaceResult:
    for name in ("context_coverage", "persistence", "tool_access", "action_authority", "intervention_rate"):
        _unit(name, getattr(data, name))
    if data.autonomous_hours_per_day < 0 or data.autonomous_hours_per_day > 24:
        raise ValueError("autonomous_hours_per_day must be between 0 and 24")
    if data.useful_actions_per_day < 0:
        raise ValueError("useful_actions_per_day cannot be negative")
    surface = (
        data.context_coverage
        * data.persistence
        * data.tool_access
        * data.action_authority
        * (1.0 - data.intervention_rate)
    )
    workload = data.autonomous_hours_per_day * data.useful_actions_per_day * surface
    if surface >= 0.50 and data.autonomous_hours_per_day >= 4:
        signal = SignalState.GREEN_STRONG
    elif surface >= 0.25:
        signal = SignalState.GREEN
    elif surface >= 0.10:
        signal = SignalState.AMBER
    else:
        signal = SignalState.RED
    return PersistentAgentSurfaceResult(surface, workload, signal, False, "persistent agent activity is a compute-demand leading indicator, not FCF proof")


@dataclass(frozen=True)
class PhysicalAIDeploymentInput:
    deployed_units: int
    real_world_task_success: float
    edge_case_capture: float
    data_reuse_for_training: float
    intervention_rate: float
    unit_economics_proven: bool


@dataclass(frozen=True)
class PhysicalAIDeploymentResult:
    flywheel_score: float
    signal: SignalState
    learning_flywheel_proven: bool
    portfolio_action_allowed: bool
    reason: str


def evaluate_physical_ai_deployment(data: PhysicalAIDeploymentInput) -> PhysicalAIDeploymentResult:
    if data.deployed_units < 0:
        raise ValueError("deployed_units cannot be negative")
    for name in ("real_world_task_success", "edge_case_capture", "data_reuse_for_training", "intervention_rate"):
        _unit(name, getattr(data, name))
    scale = min(data.deployed_units / 1000.0, 1.0)
    score = scale * data.real_world_task_success * data.edge_case_capture * data.data_reuse_for_training * (1.0 - data.intervention_rate)
    flywheel = score >= 0.30 and data.data_reuse_for_training >= 0.50
    if flywheel and data.unit_economics_proven:
        signal = SignalState.GREEN_STRONG
    elif flywheel:
        signal = SignalState.GREEN
    elif data.deployed_units > 0:
        signal = SignalState.AMBER
    else:
        signal = SignalState.RED
    return PhysicalAIDeploymentResult(score, signal, flywheel, False, "real deployments and generated data do not prove learning advantage or owner economics without measured reuse and unit economics")


@dataclass(frozen=True)
class TeleoperationAutonomyInput:
    task_success: float
    human_intervention_share: float
    remote_operator_minutes_per_task: float
    autonomous_minutes_per_task: float
    intervention_declining: bool


@dataclass(frozen=True)
class TeleoperationAutonomyResult:
    autonomy_share: float
    signal: SignalState
    autonomy_proven: bool
    portfolio_action_allowed: bool
    reason: str


def evaluate_teleoperation_to_autonomy(data: TeleoperationAutonomyInput) -> TeleoperationAutonomyResult:
    _unit("task_success", data.task_success)
    _unit("human_intervention_share", data.human_intervention_share)
    if data.remote_operator_minutes_per_task < 0 or data.autonomous_minutes_per_task < 0:
        raise ValueError("task minutes cannot be negative")
    total = data.remote_operator_minutes_per_task + data.autonomous_minutes_per_task
    autonomy_share = data.autonomous_minutes_per_task / total if total else 0.0
    proven = data.task_success >= 0.90 and autonomy_share >= 0.80 and data.human_intervention_share <= 0.20 and data.intervention_declining
    if proven:
        signal = SignalState.GREEN_STRONG
    elif data.task_success >= 0.80 and autonomy_share >= 0.50:
        signal = SignalState.GREEN
    elif data.task_success > 0:
        signal = SignalState.AMBER
    else:
        signal = SignalState.RED
    return TeleoperationAutonomyResult(autonomy_share, signal, proven, False, "teleoperation is not autonomy; autonomy requires high task success with low and declining human intervention")


@dataclass(frozen=True)
class AgenticPermissionRiskInput:
    context_sensitivity: float
    action_authority: float
    surveillance_scope: float
    data_retention_risk: float
    regulatory_exposure: float
    security_controls: float
    user_control: float


@dataclass(frozen=True)
class AgenticPermissionRiskResult:
    gross_risk: float
    mitigated_risk: float
    signal: SignalState
    deployment_gate_passed: bool
    portfolio_action_allowed: bool
    reason: str


def evaluate_agentic_permission_risk(data: AgenticPermissionRiskInput) -> AgenticPermissionRiskResult:
    for name, value in data.__dict__.items():
        _unit(name, value)
    gross = (
        0.20 * data.context_sensitivity
        + 0.20 * data.action_authority
        + 0.20 * data.surveillance_scope
        + 0.15 * data.data_retention_risk
        + 0.25 * data.regulatory_exposure
    )
    mitigation = 0.50 * data.security_controls + 0.50 * data.user_control
    mitigated = max(0.0, gross * (1.0 - 0.70 * mitigation))
    passed = mitigated < 0.35
    if mitigated >= 0.65:
        signal = SignalState.RED
    elif mitigated >= 0.35:
        signal = SignalState.AMBER
    else:
        signal = SignalState.GREEN
    return AgenticPermissionRiskResult(gross, mitigated, signal, passed, False, "more context and authority increase utility and risk simultaneously; privacy, security, compliance and trust costs must be netted from gross agentic value")


STRUCTURAL_CANONICAL_LAWS = (
    "CAPABILITY LEAD != DURABLE ECONOMIC MOAT",
    "BENCHMARK LEAD != PRICING POWER",
    "PERSISTENT AGENT ACTIVITY != FCF PROOF",
    "TELEOPERATION != AUTONOMY",
    "DATA GENERATED != LEARNING ADVANTAGE",
    "MORE CONTEXT != UNCONDITIONALLY MORE ECONOMIC VALUE",
    "ENGINEERING STUNT != COMPETITIVE ADVANTAGE != ROIC",
)
