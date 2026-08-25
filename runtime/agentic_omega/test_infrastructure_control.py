from runtime.agentic_omega.infrastructure_control import (
    InfrastructureControlInput,
    InfrastructureControlMode,
    evaluate_infrastructure_control,
)
from runtime.agentic_omega.ai_demand_engines import SignalState


def test_announced_capacity_does_not_become_economic_proof():
    result = evaluate_infrastructure_control(InfrastructureControlInput(
        mode=InfrastructureControlMode.FULL_FACILITY_LEASE,
        contracted_capacity_gw=10.0,
        operating_capacity_gw=0.0,
        utilization=0.0,
        organic_revenue_coverage=0.1,
        debt_service_coverage=1.2,
        vendor_guarantee=105.0,
        total_project_commitment=250.0,
        executive_turnover_warning=True,
    ))
    assert result.signal == SignalState.AMBER
    assert result.credit_fragility in {SignalState.AMBER, SignalState.RED}
    assert result.execution_warning is True
    assert result.portfolio_action_allowed is False


def test_operating_utilized_capacity_can_pass_physical_gate_without_buy_action():
    result = evaluate_infrastructure_control(InfrastructureControlInput(
        mode=InfrastructureControlMode.SELF_CONTROLLED,
        contracted_capacity_gw=8.0,
        operating_capacity_gw=6.0,
        utilization=0.82,
        organic_revenue_coverage=1.15,
        debt_service_coverage=2.1,
        vendor_guarantee=20.0,
        total_project_commitment=200.0,
        supplier_exclusivity=True,
    ))
    assert result.signal == SignalState.GREEN_STRONG
    assert result.demand_quality == SignalState.GREEN_STRONG
    assert result.credit_fragility == SignalState.GREEN
    assert result.portfolio_action_allowed is False
