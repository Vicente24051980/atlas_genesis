from __future__ import annotations

from dataclasses import dataclass
from enum import Enum

from .ai_demand_engines import SignalState


class InfrastructureControlMode(str, Enum):
    CLOUD_RENTAL = "CLOUD_RENTAL"
    FULL_FACILITY_LEASE = "FULL_FACILITY_LEASE"
    SELF_CONTROLLED = "SELF_CONTROLLED"


@dataclass(frozen=True)
class InfrastructureControlInput:
    mode: InfrastructureControlMode
    contracted_capacity_gw: float
    operating_capacity_gw: float
    utilization: float
    organic_revenue_coverage: float
    debt_service_coverage: float
    vendor_guarantee: float = 0.0
    total_project_commitment: float = 0.0
    supplier_exclusivity: bool = False
    executive_turnover_warning: bool = False


@dataclass(frozen=True)
class InfrastructureControlResult:
    signal: SignalState
    deployment_ratio: float
    vendor_support_ratio: float
    demand_quality: SignalState
    credit_fragility: SignalState
    execution_warning: bool
    portfolio_action_allowed: bool
    reason: str


def evaluate_infrastructure_control(data: InfrastructureControlInput) -> InfrastructureControlResult:
    if min(data.contracted_capacity_gw, data.operating_capacity_gw, data.vendor_guarantee, data.total_project_commitment) < 0:
        raise ValueError("capacity and monetary inputs cannot be negative")
    if not 0.0 <= data.utilization <= 1.0:
        raise ValueError("utilization must be between 0 and 1")
    if data.organic_revenue_coverage < 0 or data.debt_service_coverage < 0:
        raise ValueError("coverage ratios cannot be negative")

    deployment = data.operating_capacity_gw / data.contracted_capacity_gw if data.contracted_capacity_gw else 0.0
    vendor_support = data.vendor_guarantee / data.total_project_commitment if data.total_project_commitment else 0.0

    if data.organic_revenue_coverage >= 1.0 and data.utilization >= 0.70:
        demand_quality = SignalState.GREEN_STRONG
    elif data.organic_revenue_coverage >= 0.60 and data.utilization >= 0.50:
        demand_quality = SignalState.GREEN
    else:
        demand_quality = SignalState.AMBER

    if vendor_support >= 0.50 or data.debt_service_coverage < 1.0:
        credit_fragility = SignalState.RED
    elif vendor_support >= 0.20 or data.debt_service_coverage < 1.5:
        credit_fragility = SignalState.AMBER
    else:
        credit_fragility = SignalState.GREEN

    if deployment >= 0.50 and demand_quality in {SignalState.GREEN, SignalState.GREEN_STRONG} and credit_fragility != SignalState.RED:
        signal = SignalState.GREEN_STRONG if data.supplier_exclusivity else SignalState.GREEN
        reason = "physical deployment and demand quality are evidenced; financing risk remains separately gated"
    elif data.contracted_capacity_gw > 0:
        signal = SignalState.AMBER
        reason = "announced or contracted capacity is not yet sufficient economic proof"
    else:
        signal = SignalState.AMBER
        reason = "no contracted infrastructure capacity is evidenced"

    return InfrastructureControlResult(
        signal=signal,
        deployment_ratio=deployment,
        vendor_support_ratio=vendor_support,
        demand_quality=demand_quality,
        credit_fragility=credit_fragility,
        execution_warning=data.executive_turnover_warning,
        portfolio_action_allowed=False,
        reason=reason,
    )


CANONICAL_LAWS = (
    "EXECUTIVE DEPARTURE != CAPEX CANCELLATION",
    "ANNOUNCED GW != OPERATING GW != CONTRACTED REVENUE",
    "FINANCING CAPACITY != ORGANIC END DEMAND",
    "VENDOR GUARANTEE != CUSTOMER ECONOMIC PROOF",
    "GPU COLLATERAL != PERMANENT COLLATERAL VALUE",
    "COMPUTE ASSET VALUE != DEBT SERVICE CAPACITY",
    "SELF CONTROLLED INFRASTRUCTURE != OWNER ECONOMICS",
)
