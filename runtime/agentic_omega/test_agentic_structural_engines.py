from runtime.agentic_omega.agentic_structural_engines import (
    AgenticPermissionRiskInput,
    FrontierModelCommoditizationInput,
    PersistentAgentSurfaceInput,
    PhysicalAIDeploymentInput,
    TeleoperationAutonomyInput,
    evaluate_agentic_permission_risk,
    evaluate_frontier_model_commoditization,
    evaluate_persistent_agent_surface,
    evaluate_physical_ai_deployment,
    evaluate_teleoperation_to_autonomy,
)
from runtime.agentic_omega.ai_demand_engines import SignalState


def test_model_convergence_can_flag_pricing_power_risk_without_portfolio_action():
    result = evaluate_frontier_model_commoditization(
        FrontierModelCommoditizationInput(0.05, 0.80, 0.80, 0.70, 0.75, 0.40)
    )
    assert result.pricing_power_at_risk is True
    assert result.signal in {SignalState.GREEN, SignalState.GREEN_STRONG}
    assert result.portfolio_action_allowed is False


def test_persistent_agent_surface_is_compute_signal_not_fcf_proof():
    result = evaluate_persistent_agent_surface(
        PersistentAgentSurfaceInput(0.9, 0.9, 0.9, 0.8, 8.0, 20.0, 0.10)
    )
    assert result.signal is SignalState.GREEN_STRONG
    assert result.machine_workload_index > 0
    assert result.portfolio_action_allowed is False


def test_physical_ai_data_without_reuse_is_not_learning_flywheel():
    result = evaluate_physical_ai_deployment(
        PhysicalAIDeploymentInput(1000, 0.90, 0.90, 0.10, 0.20, False)
    )
    assert result.learning_flywheel_proven is False
    assert result.portfolio_action_allowed is False


def test_teleoperation_is_not_autonomy_when_operator_share_is_high():
    result = evaluate_teleoperation_to_autonomy(
        TeleoperationAutonomyInput(0.95, 0.70, 7.0, 3.0, False)
    )
    assert result.autonomy_proven is False
    assert result.autonomy_share == 0.30
    assert result.portfolio_action_allowed is False


def test_low_intervention_high_success_can_prove_operational_autonomy_only():
    result = evaluate_teleoperation_to_autonomy(
        TeleoperationAutonomyInput(0.96, 0.10, 1.0, 9.0, True)
    )
    assert result.autonomy_proven is True
    assert result.signal is SignalState.GREEN_STRONG
    assert result.portfolio_action_allowed is False


def test_surveillance_scope_can_fail_permission_gate():
    result = evaluate_agentic_permission_risk(
        AgenticPermissionRiskInput(0.95, 0.90, 1.0, 0.90, 0.95, 0.20, 0.20)
    )
    assert result.signal in {SignalState.AMBER, SignalState.RED}
    assert result.deployment_gate_passed is False
    assert result.portfolio_action_allowed is False


def test_strong_controls_can_reduce_permission_risk():
    result = evaluate_agentic_permission_risk(
        AgenticPermissionRiskInput(0.50, 0.40, 0.30, 0.30, 0.30, 0.95, 0.95)
    )
    assert result.signal is SignalState.GREEN
    assert result.deployment_gate_passed is True
