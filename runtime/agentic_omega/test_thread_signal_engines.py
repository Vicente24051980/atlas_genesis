from .thread_signal_engines import (
    AgenticProductionProofInput,
    LeverageFlowDistortionInput,
    LongTermLeverageGateInput,
    MemoryScarcityTransmissionInput,
    ScarcityPaidInput,
    evaluate_agentic_production_proof,
    evaluate_leverage_flow_distortion,
    evaluate_long_term_leverage_gate,
    evaluate_memory_scarcity_transmission,
    evaluate_scarcity_paid,
)


def test_memory_scarcity_requires_owner_economics_conversion():
    result = evaluate_memory_scarcity_transmission(
        MemoryScarcityTransmissionInput(
            scarcity_severity=0.95,
            asp_change=0.95,
            bits_shipped_change=0.70,
            mix_improvement=0.85,
            gross_margin_capture=0.90,
            fcf_per_share_capture=0.90,
            capacity_response_risk=0.35,
            demand_destruction_risk=0.25,
            china_supply_risk=0.30,
        )
    )
    assert result.owner_economics_proven
    assert not result.portfolio_action_allowed


def test_scarcity_can_be_economically_strong_but_already_paid():
    result = evaluate_scarcity_paid(
        ScarcityPaidInput(
            economic_proof=0.98,
            trailing_equity_repricing=0.98,
            valuation_expansion=0.90,
            consensus_expectation_saturation=0.95,
            forward_fcf_revision_headroom=0.20,
            normalized_cycle_upside=0.15,
        )
    )
    assert result.paid_score > 0.90
    assert not result.underpaid_scarcity


def test_agentic_containment_blocks_deployment_proof():
    result = evaluate_agentic_production_proof(
        AgenticProductionProofInput(
            capability_proven=True,
            task_completion_proven=True,
            containment_proven=False,
            deployed=True,
            production_outcome_observed=True,
            paid_usage_proven=True,
            productivity_or_revenue_proven=True,
            fcf_proven=True,
            roic_proven=True,
        )
    )
    assert result.evidence_stage == "CONTAINMENT_BLOCKED"
    assert not result.portfolio_action_allowed


def test_agentic_closed_loop_can_reach_roic():
    result = evaluate_agentic_production_proof(
        AgenticProductionProofInput(
            capability_proven=True,
            task_completion_proven=True,
            containment_proven=True,
            deployed=True,
            production_outcome_observed=True,
            paid_usage_proven=True,
            productivity_or_revenue_proven=True,
            fcf_proven=True,
            roic_proven=True,
        )
    )
    assert result.evidence_stage == "ROIC"
    assert result.portfolio_action_allowed


def test_forced_liquidation_needs_persistence_and_relative_strength():
    result = evaluate_leverage_flow_distortion(
        LeverageFlowDistortionInput(
            forced_selling_evidence=0.90,
            margin_call_intensity=0.85,
            block_trade_intensity=0.80,
            systematic_deleveraging=0.80,
            fundamental_impairment=0.10,
            rebound_after_forced_supply=0.85,
            persistence_after_72h=0.30,
            relative_strength_after_72h=0.30,
        )
    )
    assert result.distortion_score > 0.70
    assert not result.flow_confirmation_allowed


def test_long_term_leverage_gate_blocks_structural_leverage():
    result = evaluate_long_term_leverage_gate(
        LongTermLeverageGateInput(
            gross_exposure=200.0,
            net_asset_value=100.0,
            maintenance_requirement=0.35,
            stress_drawdown=0.25,
            overnight_gap_risk=0.05,
            strategic_horizon=True,
        )
    )
    assert result.leverage_multiple == 2.0
    assert not result.gate_passed


def test_unlevered_strategic_position_survives_gate():
    result = evaluate_long_term_leverage_gate(
        LongTermLeverageGateInput(
            gross_exposure=100.0,
            net_asset_value=100.0,
            maintenance_requirement=0.0,
            stress_drawdown=0.40,
            overnight_gap_risk=0.10,
            strategic_horizon=True,
        )
    )
    assert result.gate_passed
