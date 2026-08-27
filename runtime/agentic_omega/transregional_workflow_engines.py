from __future__ import annotations

from dataclasses import dataclass
from enum import Enum

from .ai_demand_engines import SignalState


class RotationStage(str, Enum):
    NONE = "NONE"
    JUMP = "JUMP"
    TRANSREGIONAL_BREADTH = "TRANSREGIONAL_BREADTH"
    PERSISTENT_ROTATION = "PERSISTENT_ROTATION"


@dataclass(frozen=True)
class LayerObservation:
    layer: str
    region: str
    return_pct: float
    economically_linked: bool = True


@dataclass(frozen=True)
class TransregionalRotationInput:
    observations: tuple[LayerObservation, ...]
    minimum_regions: int = 3
    minimum_winning_layers: int = 3
    persistence_confirmed: bool = False


@dataclass(frozen=True)
class TransregionalRotationResult:
    stage: RotationStage
    signal: SignalState
    positive_regions: int
    winning_layers: tuple[str, ...]
    portfolio_action_allowed: bool
    reason: str


def evaluate_transregional_rotation(data: TransregionalRotationInput) -> TransregionalRotationResult:
    if data.minimum_regions < 1 or data.minimum_winning_layers < 1:
        raise ValueError("minimum gates must be positive")
    linked = tuple(o for o in data.observations if o.economically_linked)
    positive = tuple(o for o in linked if o.return_pct > 0)
    regions = {o.region for o in positive}
    layer_regions: dict[str, set[str]] = {}
    for o in positive:
        layer_regions.setdefault(o.layer, set()).add(o.region)
    winning = tuple(sorted(layer for layer, rs in layer_regions.items() if len(rs) >= 2))

    if not positive:
        return TransregionalRotationResult(RotationStage.NONE, SignalState.AMBER, 0, (), False, "no economically linked positive breadth")
    if len(regions) < data.minimum_regions or len(winning) < data.minimum_winning_layers:
        return TransregionalRotationResult(RotationStage.JUMP, SignalState.GREEN, len(regions), winning, False, "jump breadth exists but transregional gate is incomplete")
    if not data.persistence_confirmed:
        return TransregionalRotationResult(RotationStage.TRANSREGIONAL_BREADTH, SignalState.GREEN_STRONG, len(regions), winning, False, "independent regional breadth confirms the jump; persistence remains unproven")
    return TransregionalRotationResult(RotationStage.PERSISTENT_ROTATION, SignalState.GREEN_STRONG, len(regions), winning, False, "rotation persisted across regions; normal valuation, economic-proof and portfolio gates still apply")


@dataclass(frozen=True)
class WorkflowDepthInput:
    autonomous_steps: int
    total_steps: int
    deployed: bool
    paid_usage_proven: bool = False
    productivity_or_revenue_proven: bool = False
    fcf_proven: bool = False
    roic_proven: bool = False


@dataclass(frozen=True)
class WorkflowDepthResult:
    autonomy_ratio: float
    workflow_depth: int
    signal: SignalState
    economic_proof: bool
    portfolio_action_allowed: bool
    reason: str


def evaluate_workflow_depth(data: WorkflowDepthInput) -> WorkflowDepthResult:
    if data.total_steps <= 0:
        raise ValueError("total_steps must be positive")
    if data.autonomous_steps < 0 or data.autonomous_steps > data.total_steps:
        raise ValueError("autonomous_steps must be between zero and total_steps")
    ratio = data.autonomous_steps / data.total_steps
    economic_proof = data.paid_usage_proven and data.productivity_or_revenue_proven and data.fcf_proven and data.roic_proven
    if not data.deployed:
        signal, reason = SignalState.AMBER, "workflow capability without deployment is not adoption"
    elif ratio < 0.5:
        signal, reason = SignalState.GREEN, "partial workflow automation is deployed"
    else:
        signal, reason = SignalState.GREEN_STRONG, "deep autonomous workflow execution is deployed"
    if economic_proof:
        reason += "; owner economics are evidenced but valuation and falsifier gates remain mandatory"
    return WorkflowDepthResult(ratio, data.autonomous_steps, signal, economic_proof, False, reason)


CANONICAL_LAWS = (
    "SINGLE TICKER MOVE != LAYER BREADTH",
    "SINGLE REGION BREADTH != TRANSREGIONAL CONFIRMATION",
    "TRANSREGIONAL JUMP != PERSISTENT ROTATION",
    "INDEX BETA != ECONOMICALLY LINKED TRANSMISSION",
    "WORKFLOW DEPTH != PAID USAGE != FCF != ROIC",
    "TAM != REVENUE != FCF != ROIC",
)
