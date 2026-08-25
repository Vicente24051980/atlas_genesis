from runtime.agentic_omega.ai_demand_engines import (
    AgenticEconomicsInput,
    AgenticEngineeringCompressionInput,
    CircularFinancingInput,
    ComputeElasticityInput,
    ElasticityRegime,
    MachineOriginatedDemandInput,
    SignalState,
    evaluate_agentic_economics,
    evaluate_agentic_engineering_compression,
    evaluate_circular_financing,
    evaluate_compute_elasticity,
    evaluate_machine_originated_demand,
    quantum_readiness_watch,
)


def test_jevons_acceleration_is_evidence_not_action():
    result = evaluate_compute_elasticity(ComputeElasticityInput(-0.70, 4.0, 0.50, new_workload_evidence=True))
    assert result.regime is ElasticityRegime.JEVONS_ACCELERATION
    assert result.signal is SignalState.GREEN_STRONG
    assert result.portfolio_action_allowed is False
    assert round(result.demand_multiplier, 2) == 1.50


def test_efficiency_can_be_destructive():
    result = evaluate_compute_elasticity(ComputeElasticityInput(-0.50, 0.20, -0.20))
    assert result.regime is ElasticityRegime.DESTRUCTIVE_EFFICIENCY
    assert result.signal is SignalState.RED


def test_capability_does_not_equal_economic_proof():
    result = evaluate_agentic_economics(AgenticEconomicsInput(True, False, False, False, False, False, False))
    assert result.economic_proof_stage == "CAPABILITY"
    assert result.portfolio_action_allowed is False


def test_roic_stage_can_reach_execution_evidence_but_not_bypass_other_gates():
    result = evaluate_agentic_economics(AgenticEconomicsInput(True, True, True, True, True, True, True))
    assert result.economic_proof_stage == "ROIC"
    assert result.portfolio_action_allowed is True
    assert "valuation" in result.reason.lower()


def test_engineering_compression_deployment_is_not_economic_proof():
    result = evaluate_agentic_engineering_compression(
        AgenticEngineeringCompressionInput(
            task_difficulty=0.90,
            autonomous_completion_probability=0.85,
            human_hours_displaced=40.0,
            deployment_frequency=1.0,
            artifact_functional=True,
            independently_verifiable=True,
            production_deployed=True,
        )
    )
    assert result.signal is SignalState.GREEN_STRONG
    assert result.evidence_stage == "DEPLOYMENT"
    assert result.economic_proof is False
    assert result.portfolio_action_allowed is False
    assert round(result.compression_value, 1) == 30.6


def test_generated_code_without_functional_artifact_stops_at_capability():
    result = evaluate_agentic_engineering_compression(
        AgenticEngineeringCompressionInput(0.8, 0.8, 10.0, 1.0, False, False, False)
    )
    assert result.evidence_stage == "CAPABILITY"
    assert result.signal is SignalState.AMBER


def test_engineering_compression_roic_still_does_not_bypass_portfolio_gates():
    result = evaluate_agentic_engineering_compression(
        AgenticEngineeringCompressionInput(0.9, 0.9, 100.0, 12.0, True, True, True, True, True, True, True)
    )
    assert result.evidence_stage == "ROIC"
    assert result.economic_proof is True
    assert result.portfolio_action_allowed is False
    assert "valuation" in result.reason.lower()


def test_circular_financing_flags_vendor_financing_risk():
    result = evaluate_circular_financing(CircularFinancingInput(100.0, 80.0, 60.0, 20.0, 0.30))
    assert result.signal is SignalState.RED
    assert result.capital_recirculation_ratio == 0.60
    assert result.portfolio_action_allowed is False


def test_agentic_token_multiplier_above_four_is_strong_green():
    result = evaluate_machine_originated_demand(MachineOriginatedDemandInput(100.0, 500.0, 25.0))
    assert result.agent_to_human_multiplier == 5.0
    assert result.signal is SignalState.GREEN_STRONG


def test_quantum_is_watch_only():
    result = quantum_readiness_watch()
    assert result.signal is SignalState.WATCH_ONLY
    assert result.portfolio_action_allowed is False
