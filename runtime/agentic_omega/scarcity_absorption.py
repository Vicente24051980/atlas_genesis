"""Scarcity Migration Ω and Organizational Absorption Ω.

Canonical laws:
- AI CAPABILITY GROWTH != ENTERPRISE DEPLOYMENT GROWTH
- INTELLIGENCE ABUNDANCE != ECONOMIC VALUE ABUNDANCE
- PHYSICAL BOTTLENECK != EQUITY OPPORTUNITY
- SCARCITY must transmit through pricing power -> incremental ROIC -> FCF/share.
"""
from dataclasses import dataclass


def _clamp(x: float) -> float:
    return max(0.0, min(100.0, float(x)))


@dataclass(frozen=True)
class OrganizationalAbsorptionInput:
    data_readiness: float
    workflow_redesign: float
    employee_adoption: float
    integration_speed: float
    governance_readiness: float
    paid_utilization: float


def organizational_absorption_omega(x: OrganizationalAbsorptionInput) -> dict:
    score = _clamp(
        .18*x.data_readiness + .18*x.workflow_redesign + .16*x.employee_adoption
        + .16*x.integration_speed + .14*x.governance_readiness + .18*x.paid_utilization
    )
    state = "DEPLOYMENT_READY" if score >= 75 else "ABSORPTION_BUILDING" if score >= 55 else "CAPABILITY_SURPLUS"
    return {"score": round(score, 1), "state": state, "economic_proof_gate": score >= 65}


@dataclass(frozen=True)
class ScarcityMigrationInput:
    abundance_shock: float
    complement_scarcity: float
    pricing_power: float
    capacity_constraint: float
    incremental_roic: float
    fcf_per_share_capture: float
    equity_validation: float


def scarcity_migration_omega(x: ScarcityMigrationInput) -> dict:
    # Bottleneck narratives cannot pass without owner-economics capture.
    economic_capture = min(x.pricing_power, x.incremental_roic, x.fcf_per_share_capture)
    score = _clamp(
        .10*x.abundance_shock + .18*x.complement_scarcity + .12*x.capacity_constraint
        + .16*x.pricing_power + .18*x.incremental_roic + .18*x.fcf_per_share_capture
        + .08*x.equity_validation
    )
    if economic_capture < 50:
        state = "BOTTLENECK_ONLY"
    elif score >= 80 and x.equity_validation >= 60:
        state = "SCARCITY_CAPTURE_CONFIRMED"
    elif score >= 65:
        state = "SCARCITY_CAPTURE_WATCH"
    else:
        state = "UNPROVEN"
    return {
        "score": round(score, 1),
        "state": state,
        "economic_capture_floor": round(float(economic_capture), 1),
        "competition_for_capital_eligible": state == "SCARCITY_CAPTURE_CONFIRMED",
    }
