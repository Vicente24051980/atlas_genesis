from __future__ import annotations

from dataclasses import dataclass
from enum import Enum

from .ai_demand_engines import SignalState


def _unit(name: str, value: float) -> None:
    if not 0.0 <= value <= 1.0:
        raise ValueError(f"{name} must be between 0 and 1")


def _non_negative(name: str, value: float) -> None:
    if value < 0:
        raise ValueError(f"{name} cannot be negative")


class AgenticLayer(str, Enum):
    COMPUTE = "COMPUTE"
    NETWORKING = "NETWORKING"
    DATA_STATE = "DATA_STATE"
    OBSERVABILITY = "OBSERVABILITY"
    IDENTITY_SECURITY = "IDENTITY_SECURITY"
    APPLICATION = "APPLICATION"


@dataclass(frozen=True)
class AgenticWorkloadMultiplierInput:
    human_requests: float
    agent_runs_per_request: float
    subagents_per_run: float
    tool_calls_per_agent: float
    data_operations_per_tool_call: float
    observability_events_per_tool_call: float
    security_events_per_tool_call: float
    network_transactions_per_tool_call: float
    compute_units_per_tool_call: float
    task_success_rate: float
    human_intervention_rate: float


@dataclass(frozen=True)
class AgenticWorkloadMultiplierResult:
    agents_per_human_request: float
    tool_calls_per_human_request: float
    effective_machine_actions_per_human_request: float
    data_ops_per_human_request: float
    observability_events_per_human_request: float
    security_events_per_human_request: float
    network_transactions_per_human_request: float
    compute_units_per_human_request: float
    signal: SignalState
    portfolio_action_allowed: bool
    reason: str


def evaluate_agentic_workload_multiplier(data: AgenticWorkloadMultiplierInput) -> AgenticWorkloadMultiplierResult:
    """Translate one human request into effective machine-originated workload.

    The multiplier is deliberately workload-centric. It does not assume that machine actions
    are paid, profitable, or durable. Failed tasks and human intervention reduce the effective
    autonomous workload rather than being counted as clean agentic productivity.
    """
    for name in (
        "human_requests", "agent_runs_per_request", "subagents_per_run", "tool_calls_per_agent",
        "data_operations_per_tool_call", "observability_events_per_tool_call",
        "security_events_per_tool_call", "network_transactions_per_tool_call",
        "compute_units_per_tool_call",
    ):
        _non_negative(name, getattr(data, name))
    _unit("task_success_rate", data.task_success_rate)
    _unit("human_intervention_rate", data.human_intervention_rate)

    agents = data.agent_runs_per_request * (1.0 + data.subagents_per_run)
    tool_calls = agents * data.tool_calls_per_agent
    autonomy_quality = data.task_success_rate * (1.0 - data.human_intervention_rate)
    effective_actions = tool_calls * autonomy_quality

    data_ops = effective_actions * data.data_operations_per_tool_call
    observability = effective_actions * data.observability_events_per_tool_call
    security = effective_actions * data.security_events_per_tool_call
    networking = effective_actions * data.network_transactions_per_tool_call
    compute = effective_actions * data.compute_units_per_tool_call

    if effective_actions >= 20:
        signal = SignalState.GREEN_STRONG
    elif effective_actions >= 5:
        signal = SignalState.GREEN
    elif effective_actions >= 1:
        signal = SignalState.AMBER
    else:
        signal = SignalState.RED

    return AgenticWorkloadMultiplierResult(
        agents,
        tool_calls,
        effective_actions,
        data_ops,
        observability,
        security,
        networking,
        compute,
        signal,
        False,
        "machine-workload multiplication is a demand leading indicator; it is not paid usage, revenue, FCF, or ROIC proof",
    )


@dataclass(frozen=True)
class AgenticSecurityDemandInput:
    autonomous_action_share: float
    privileged_action_share: float
    sensitive_data_share: float
    external_tool_share: float
    identity_control_coverage: float
    least_privilege_coverage: float
    audit_log_coverage: float
    runtime_security_coverage: float
    incident_rate: float


@dataclass(frozen=True)
class AgenticSecurityDemandResult:
    gross_attack_surface: float
    control_coverage: float
    residual_risk: float
    security_demand_score: float
    deployment_gate_passed: bool
    signal: SignalState
    portfolio_action_allowed: bool
    reason: str


def evaluate_agentic_security_demand(data: AgenticSecurityDemandInput) -> AgenticSecurityDemandResult:
    """Separate security demand creation from security-control adequacy.

    More autonomous, privileged and data-rich agents can increase the addressable security
    workload while simultaneously making unsafe deployments economically destructive.
    """
    for name, value in data.__dict__.items():
        _unit(name, value)

    gross = (
        0.30 * data.autonomous_action_share
        + 0.25 * data.privileged_action_share
        + 0.25 * data.sensitive_data_share
        + 0.20 * data.external_tool_share
    )
    controls = (
        0.30 * data.identity_control_coverage
        + 0.25 * data.least_privilege_coverage
        + 0.20 * data.audit_log_coverage
        + 0.25 * data.runtime_security_coverage
    )
    residual = min(1.0, max(0.0, gross * (1.0 - 0.75 * controls) + 0.50 * data.incident_rate))
    demand = min(1.0, gross * (0.65 + 0.35 * (1.0 - controls)))
    deployment_gate = residual < 0.35

    if residual >= 0.65:
        signal = SignalState.RED
    elif residual >= 0.35:
        signal = SignalState.AMBER
    elif demand >= 0.45:
        signal = SignalState.GREEN_STRONG
    else:
        signal = SignalState.GREEN

    return AgenticSecurityDemandResult(
        gross,
        controls,
        residual,
        demand,
        deployment_gate,
        signal,
        False,
        "AGENTIC ATTACK SURFACE UP can expand cyber demand, but unsafe deployment is not investable monetization proof",
    )


@dataclass(frozen=True)
class AgenticLayerEconomicsInput:
    layer: AgenticLayer
    machine_workload_growth: float
    paid_usage_growth: float
    recurring_revenue_growth: float
    gross_margin_change_pp: float
    fcf_growth: float
    fcf_per_share_growth: float
    roic_change_pp: float
    sbc_as_revenue: float
    dilution_rate: float
    attribution_confidence: float
    source_quality: float


@dataclass(frozen=True)
class AgenticLayerEconomicsResult:
    layer: AgenticLayer
    evidence_stage: str
    economic_capture_score: float
    owner_economics_gate_passed: bool
    competition_for_capital_eligible: bool
    signal: SignalState
    portfolio_action_allowed: bool
    reason: str


def evaluate_agentic_layer_economics(data: AgenticLayerEconomicsInput) -> AgenticLayerEconomicsResult:
    """Audit whether agentic workload is becoming owner economics in a specific layer.

    Growth rates are decimals. Margin/ROIC changes are percentage points. SBC and dilution are
    decimal shares. Attribution/source quality are normalized [0,1]. This engine can make a
    name eligible for Competition for Capital but cannot authorize a trade; valuation, live
    market data, Trading 212 availability and replacement hurdles remain separate gates.
    """
    for name in ("machine_workload_growth", "paid_usage_growth", "recurring_revenue_growth", "fcf_growth", "fcf_per_share_growth"):
        if getattr(data, name) <= -1.0:
            raise ValueError(f"{name} must be greater than -1")
    for name in ("sbc_as_revenue", "dilution_rate", "attribution_confidence", "source_quality"):
        _unit(name, getattr(data, name))

    if data.machine_workload_growth <= 0:
        stage = "NO_WORKLOAD_PROOF"
    elif data.paid_usage_growth <= 0:
        stage = "WORKLOAD"
    elif data.recurring_revenue_growth <= 0:
        stage = "PAID_USAGE"
    elif data.fcf_growth <= 0 or data.fcf_per_share_growth <= 0:
        stage = "REVENUE"
    elif data.roic_change_pp < 0:
        stage = "FCF"
    else:
        stage = "OWNER_ECONOMICS"

    growth_capture = min(1.0, max(0.0, 0.30 * data.paid_usage_growth + 0.35 * data.recurring_revenue_growth + 0.35 * data.fcf_per_share_growth))
    margin_capture = min(1.0, max(0.0, 0.50 + data.gross_margin_change_pp / 20.0 + data.roic_change_pp / 30.0))
    dilution_penalty = min(0.75, 1.75 * data.sbc_as_revenue + 2.0 * data.dilution_rate)
    evidence = data.attribution_confidence * data.source_quality
    score = max(0.0, min(1.0, (0.55 * growth_capture + 0.25 * margin_capture + 0.20 * evidence) * (1.0 - dilution_penalty)))

    owner_gate = (
        stage == "OWNER_ECONOMICS"
        and data.attribution_confidence >= 0.60
        and data.source_quality >= 0.75
        and data.fcf_per_share_growth > 0
        and data.sbc_as_revenue <= 0.25
        and data.dilution_rate <= 0.05
    )
    competition_eligible = owner_gate and score >= 0.45

    if owner_gate and score >= 0.65:
        signal = SignalState.GREEN_STRONG
    elif competition_eligible:
        signal = SignalState.GREEN
    elif stage in {"PAID_USAGE", "REVENUE", "FCF"}:
        signal = SignalState.GREEN
    elif stage == "WORKLOAD":
        signal = SignalState.AMBER
    else:
        signal = SignalState.RED

    return AgenticLayerEconomicsResult(
        data.layer,
        stage,
        score,
        owner_gate,
        competition_eligible,
        signal,
        False,
        "agentic workload must convert through paid usage, recurring revenue, FCF/share and ROIC; valuation and execution gates remain independent",
    )


@dataclass(frozen=True)
class AgenticEfficiencyDemandInput:
    cost_per_task_change: float
    tasks_per_human_request_change: float
    total_human_requests_change: float
    total_machine_workloads_change: float


@dataclass(frozen=True)
class AgenticEfficiencyDemandResult:
    implied_task_demand_change: float
    workload_elasticity_ratio: float
    regime: str
    signal: SignalState
    portfolio_action_allowed: bool
    reason: str


def evaluate_agentic_efficiency_demand(data: AgenticEfficiencyDemandInput) -> AgenticEfficiencyDemandResult:
    """Test whether cheaper task completion destroys or expands aggregate agentic workload."""
    for name in ("cost_per_task_change", "tasks_per_human_request_change", "total_human_requests_change", "total_machine_workloads_change"):
        if getattr(data, name) <= -1.0:
            raise ValueError(f"{name} must be greater than -1")

    implied = (1.0 + data.tasks_per_human_request_change) * (1.0 + data.total_human_requests_change) - 1.0
    denominator = abs(data.cost_per_task_change) if data.cost_per_task_change != 0 else 1e-9
    elasticity = data.total_machine_workloads_change / denominator

    if data.total_machine_workloads_change > 0.10 and data.cost_per_task_change < 0:
        regime = "AGENTIC_JEVONS_EXPANSION"
        signal = SignalState.GREEN_STRONG
    elif data.total_machine_workloads_change >= -0.05:
        regime = "AGENTIC_JEVONS_EQUILIBRIUM"
        signal = SignalState.AMBER
    else:
        regime = "AGENTIC_EFFICIENCY_DESTRUCTION"
        signal = SignalState.RED

    return AgenticEfficiencyDemandResult(
        implied,
        elasticity,
        regime,
        signal,
        False,
        "EFFICIENCY_PER_TASK != LOWER_TOTAL_WORKLOAD; measure aggregate machine workloads and owner economics separately",
    )


AGENTIC_WORKLOAD_CANONICAL_LAWS = (
    "ONE HUMAN REQUEST != ONE INFERENCE",
    "AGENT RUNS != PAID USAGE",
    "MACHINE ACTIONS != REVENUE",
    "WORKLOAD GROWTH != FCF GROWTH",
    "AGENTIC ATTACK SURFACE UP != CYBER MONETIZATION",
    "IDENTITY AND LEAST PRIVILEGE ARE PRODUCTION INFRASTRUCTURE FOR AUTONOMOUS AGENTS",
    "EFFICIENCY_PER_TASK != LOWER_TOTAL_WORKLOAD",
    "DATA OPS + OBSERVABILITY EVENTS + SECURITY EVENTS ARE DISTINCT MONETIZATION PATHWAYS",
    "OWNER ECONOMICS REQUIRES FCF/SHARE AND ROIC, NOT REPORTED FCF ALONE",
)
