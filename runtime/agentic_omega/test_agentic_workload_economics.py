from runtime.agentic_omega.agentic_workload_economics import (
    AgenticEfficiencyDemandInput,
    AgenticLayer,
    AgenticLayerEconomicsInput,
    AgenticSecurityDemandInput,
    AgenticWorkloadMultiplierInput,
    evaluate_agentic_efficiency_demand,
    evaluate_agentic_layer_economics,
    evaluate_agentic_security_demand,
    evaluate_agentic_workload_multiplier,
)
from runtime.agentic_omega.ai_demand_engines import SignalState


def test_one_human_request_can_create_many_machine_workloads_without_trade_signal():
    result = evaluate_agentic_workload_multiplier(
        AgenticWorkloadMultiplierInput(
            human_requests=100,
            agent_runs_per_request=2,
            subagents_per_run=3,
            tool_calls_per_agent=5,
            data_operations_per_tool_call=4,
            observability_events_per_tool_call=6,
            security_events_per_tool_call=2,
            network_transactions_per_tool_call=8,
            compute_units_per_tool_call=10,
            task_success_rate=0.9,
            human_intervention_rate=0.1,
        )
    )
    assert result.effective_machine_actions_per_human_request > 20
    assert result.data_ops_per_human_request > result.effective_machine_actions_per_human_request
    assert result.signal is SignalState.GREEN_STRONG
    assert result.portfolio_action_allowed is False


def test_security_demand_can_be_high_while_deployment_gate_fails():
    result = evaluate_agentic_security_demand(
        AgenticSecurityDemandInput(0.95, 0.9, 0.9, 0.8, 0.2, 0.2, 0.2, 0.2, 0.1)
    )
    assert result.security_demand_score > 0.5
    assert result.deployment_gate_passed is False
    assert result.signal in {SignalState.AMBER, SignalState.RED}


def test_strong_controls_can_make_agentic_security_deployment_viable():
    result = evaluate_agentic_security_demand(
        AgenticSecurityDemandInput(0.8, 0.5, 0.6, 0.5, 0.95, 0.95, 0.95, 0.95, 0.01)
    )
    assert result.deployment_gate_passed is True
    assert result.signal in {SignalState.GREEN, SignalState.GREEN_STRONG}


def test_workload_without_paid_usage_stops_at_workload_stage():
    result = evaluate_agentic_layer_economics(
        AgenticLayerEconomicsInput(
            AgenticLayer.DATA_STATE, 0.5, 0.0, 0.2, 1.0, 0.2, 0.2, 1.0, 0.10, 0.01, 0.9, 0.9
        )
    )
    assert result.evidence_stage == "WORKLOAD"
    assert result.owner_economics_gate_passed is False
    assert result.competition_for_capital_eligible is False


def test_owner_economics_can_make_layer_eligible_for_competition_not_trade():
    result = evaluate_agentic_layer_economics(
        AgenticLayerEconomicsInput(
            AgenticLayer.OBSERVABILITY, 0.5, 0.35, 0.30, 2.0, 0.30, 0.25, 3.0, 0.08, 0.01, 0.85, 0.95
        )
    )
    assert result.evidence_stage == "OWNER_ECONOMICS"
    assert result.owner_economics_gate_passed is True
    assert result.competition_for_capital_eligible is True
    assert result.portfolio_action_allowed is False


def test_sbc_and_dilution_can_block_owner_economics_gate():
    result = evaluate_agentic_layer_economics(
        AgenticLayerEconomicsInput(
            AgenticLayer.DATA_STATE, 0.5, 0.4, 0.3, 2.0, 0.3, 0.25, 2.0, 0.35, 0.08, 0.9, 0.95
        )
    )
    assert result.evidence_stage == "OWNER_ECONOMICS"
    assert result.owner_economics_gate_passed is False
    assert result.competition_for_capital_eligible is False


def test_cheaper_tasks_with_more_total_workloads_is_agentic_jevons_expansion():
    result = evaluate_agentic_efficiency_demand(
        AgenticEfficiencyDemandInput(-0.50, 1.0, 0.20, 0.80)
    )
    assert result.regime == "AGENTIC_JEVONS_EXPANSION"
    assert result.signal is SignalState.GREEN_STRONG
    assert result.portfolio_action_allowed is False
