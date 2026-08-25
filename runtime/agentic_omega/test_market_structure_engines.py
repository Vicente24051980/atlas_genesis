from runtime.agentic_omega.ai_demand_engines import SignalState
from runtime.agentic_omega.market_structure_engines import (
    AIInfrastructureCreditFragilityInput,
    CrossBorderSupplyChainInput,
    ForcedSellerDislocationInput,
    PolicyInterventionPersistenceInput,
    SupplierCompetitorRiskInput,
    evaluate_ai_infrastructure_credit_fragility,
    evaluate_cross_border_supply_chain,
    evaluate_forced_seller_dislocation,
    evaluate_policy_intervention_persistence,
    evaluate_supplier_competitor_risk,
)


def test_policy_move_erased_is_not_regime_change():
    result = evaluate_policy_intervention_persistence(
        PolicyInterventionPersistenceInput(-0.25, -0.20, -0.10, -0.03, 0.02, 0.85)
    )
    assert result.regime_change_proven is False
    assert result.signal is SignalState.RED
    assert result.portfolio_action_allowed is False


def test_persistent_policy_move_still_does_not_authorize_portfolio_action():
    result = evaluate_policy_intervention_persistence(
        PolicyInterventionPersistenceInput(-0.25, -0.24, -0.23, -0.21, -0.20, 0.90)
    )
    assert result.regime_change_proven is True
    assert result.signal is SignalState.GREEN_STRONG
    assert result.portfolio_action_allowed is False


def test_forced_selling_with_low_impairment_can_be_clean_dislocation():
    result = evaluate_forced_seller_dislocation(
        ForcedSellerDislocationInput(0.95, 0.90, 0.80, 0.80, 0.10, 0.90, 0.90)
    )
    assert result.clean_dislocation is True
    assert result.signal is SignalState.GREEN_STRONG
    assert result.portfolio_action_allowed is False


def test_broken_fundamentals_block_dislocation_signal():
    result = evaluate_forced_seller_dislocation(
        ForcedSellerDislocationInput(0.95, 0.95, 0.90, 0.80, 0.85, 0.25, 0.20)
    )
    assert result.clean_dislocation is False
    assert result.signal in {SignalState.RED, SignalState.AMBER}


def test_vertical_integration_can_create_ecosystem_conflict():
    result = evaluate_supplier_competitor_risk(
        SupplierCompetitorRiskInput(0.90, 0.90, 0.90, 0.50, 0.60, 0.90)
    )
    assert result.ecosystem_risk > result.capture_score
    assert result.signal in {SignalState.AMBER, SignalState.RED}
    assert result.portfolio_action_allowed is False


def test_vertical_integration_can_be_net_positive_without_bypassing_gates():
    result = evaluate_supplier_competitor_risk(
        SupplierCompetitorRiskInput(0.90, 0.20, 0.40, 0.90, 0.90, 0.20)
    )
    assert result.net_integration_score > 0
    assert result.signal in {SignalState.GREEN, SignalState.GREEN_STRONG}
    assert result.portfolio_action_allowed is False


def test_ai_credit_fragility_flags_low_coverage_and_obsolescence():
    result = evaluate_ai_infrastructure_credit_fragility(
        AIInfrastructureCreditFragilityInput(0.85, 0.60, 0.35, 0.8, 0.85, 0.90, 0.70)
    )
    assert result.signal in {SignalState.AMBER, SignalState.RED}
    assert result.debt_service_resilient is False
    assert result.portfolio_action_allowed is False


def test_ai_credit_can_be_resilient_with_external_revenue_and_coverage():
    result = evaluate_ai_infrastructure_credit_fragility(
        AIInfrastructureCreditFragilityInput(0.35, 0.90, 0.85, 3.0, 0.15, 0.20, 0.10)
    )
    assert result.debt_service_resilient is True
    assert result.signal in {SignalState.GREEN, SignalState.GREEN_STRONG}


def test_tariff_headline_is_company_specific_transmission_not_auto_sell():
    result = evaluate_cross_border_supply_chain(
        CrossBorderSupplyChainInput(0.50, 0.80, 0.15, 0.10, 0.80, 0.10)
    )
    assert result.earnings_risk_score > 0.15
    assert result.signal in {SignalState.AMBER, SignalState.RED}
    assert result.portfolio_action_allowed is False


def test_tariff_risk_can_be_mitigated_by_pass_through_and_substitution():
    result = evaluate_cross_border_supply_chain(
        CrossBorderSupplyChainInput(0.50, 0.30, 0.90, 0.90, 0.20, 0.80)
    )
    assert result.earnings_risk_score < 0.05
    assert result.signal is SignalState.GREEN_STRONG
