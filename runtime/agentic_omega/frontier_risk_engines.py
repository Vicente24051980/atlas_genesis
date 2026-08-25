from __future__ import annotations

from dataclasses import dataclass
from enum import Enum


class GateState(str, Enum):
    RED = "RED"
    AMBER = "AMBER"
    GREEN = "GREEN"
    GREEN_STRONG = "GREEN_STRONG"
    WATCH_ONLY = "WATCH_ONLY"


@dataclass(frozen=True)
class FrontierCyberInput:
    frontier_capability_proven: bool
    paid_security_adoption_proven: bool
    recurring_revenue_growth: float
    fcf_margin: float
    roic_proven: bool


@dataclass(frozen=True)
class FrontierCyberResult:
    signal: GateState
    economic_proof: bool
    portfolio_action_allowed: bool
    reason: str


def evaluate_frontier_cyber(data: FrontierCyberInput) -> FrontierCyberResult:
    """Translate frontier cyber capability into owner economics; fail closed."""
    if not data.frontier_capability_proven:
        return FrontierCyberResult(GateState.AMBER, False, False, "frontier capability is not yet proven")
    if not data.paid_security_adoption_proven:
        return FrontierCyberResult(GateState.AMBER, False, False, "FRONTIER CAPABILITY != CYBER MONETIZATION")
    if data.recurring_revenue_growth <= 0 or data.fcf_margin <= 0:
        return FrontierCyberResult(GateState.GREEN, False, False, "paid adoption exists but owner economics remain incomplete")
    if not data.roic_proven:
        return FrontierCyberResult(GateState.GREEN_STRONG, True, False, "revenue and FCF proof exist; ROIC and valuation gates remain")
    return FrontierCyberResult(GateState.GREEN_STRONG, True, True, "cyber monetization and ROIC proof passed; normal valuation/falsifier gates still apply")


@dataclass(frozen=True)
class EdgeCloudInput:
    local_cost_per_task_change: float
    local_latency_change: float
    edge_paid_adoption_proven: bool
    edge_revenue_growth: float
    cloud_compute_growth: float


@dataclass(frozen=True)
class EdgeCloudResult:
    regime: str
    signal: GateState
    portfolio_action_allowed: bool
    reason: str


def evaluate_edge_cloud(data: EdgeCloudInput) -> EdgeCloudResult:
    """Classify edge/cloud interaction without assuming efficiency destroys compute."""
    if data.edge_revenue_growth > 0 and data.cloud_compute_growth > 0:
        return EdgeCloudResult("HYBRID_EXPANSION", GateState.GREEN_STRONG if data.edge_paid_adoption_proven else GateState.GREEN, False, "edge and cloud are expanding together")
    if data.edge_revenue_growth > 0 and data.cloud_compute_growth <= 0:
        return EdgeCloudResult("EDGE_SUBSTITUTION_CANDIDATE", GateState.AMBER, False, "edge is growing while cloud stalls; substitution requires persistence and attribution")
    if data.cloud_compute_growth > 0:
        return EdgeCloudResult("CLOUD_LED", GateState.GREEN, False, "cloud compute is expanding without proven edge monetization")
    return EdgeCloudResult("INSUFFICIENT_EVIDENCE", GateState.AMBER, False, "efficiency per task alone cannot determine total compute demand")


@dataclass(frozen=True)
class PostQuantumInput:
    standards_finalized: bool
    migration_started: bool
    crypto_agility_proven: bool
    pqc_revenue_proven: bool
    pqc_fcf_proven: bool


@dataclass(frozen=True)
class PostQuantumResult:
    signal: GateState
    portfolio_action_allowed: bool
    reason: str


def evaluate_post_quantum(data: PostQuantumInput) -> PostQuantumResult:
    """PQC readiness is watch-only until revenue and FCF are attributable."""
    if not data.standards_finalized:
        return PostQuantumResult(GateState.WATCH_ONLY, False, "standards uncertainty keeps PQC watch-only")
    if not data.migration_started or not data.crypto_agility_proven:
        return PostQuantumResult(GateState.WATCH_ONLY, False, "standards exist but migration/crypto-agility proof is incomplete")
    if not data.pqc_revenue_proven or not data.pqc_fcf_proven:
        return PostQuantumResult(GateState.GREEN, False, "PQC readiness is commercially relevant but owner economics are unproven")
    return PostQuantumResult(GateState.GREEN_STRONG, True, "PQC revenue and FCF proof passed; valuation and dilution gates still apply")


CANONICAL_LAWS = (
    "FRONTIER CAPABILITY != CYBER MONETIZATION",
    "EFFICIENCY_PER_TASK != LOWER_TOTAL_COMPUTE",
    "Q-DAY IS A PROBABILITY DISTRIBUTION != A DATE",
    "PQC URGENCY != QUANTUM-HARDWARE OWNER ECONOMICS",
)
