from runtime.agentic_omega.macro_capital_regime import (
    FinancialRepressionInput,
    ROICWACCGateInput,
    SecondarySignalIntegrityInput,
    SupplyChainRentMigrationInput,
    evaluate_financial_repression,
    evaluate_roic_wacc_gate,
    evaluate_secondary_signal_integrity,
    evaluate_supply_chain_rent_migration,
)


def test_supply_chain_rent_migration_requires_supplier_economics():
    weak_capture = evaluate_supply_chain_rent_migration(
        SupplyChainRentMigrationInput(
            end_demand_strength=0.95,
            customer_margin_compression=0.90,
            bottleneck_scarcity=0.95,
            supplier_asp_power=0.80,
            supplier_margin_capture=0.30,
            supplier_fcf_revision=0.25,
            capacity_response_risk=0.20,
            substitution_risk=0.15,
            valuation_saturation=0.20,
        )
    )
    assert not weak_capture.supplier_rent_migration_confirmed
    assert not weak_capture.portfolio_action_allowed

    strong_capture = evaluate_supply_chain_rent_migration(
        SupplyChainRentMigrationInput(
            end_demand_strength=0.95,
            customer_margin_compression=0.80,
            bottleneck_scarcity=0.95,
            supplier_asp_power=0.90,
            supplier_margin_capture=0.90,
            supplier_fcf_revision=0.90,
            capacity_response_risk=0.10,
            substitution_risk=0.10,
            valuation_saturation=0.20,
        )
    )
    assert strong_capture.supplier_rent_migration_confirmed
    assert strong_capture.migration_score > weak_capture.migration_score


def test_financial_repression_distinguishes_real_cash_return():
    unremunerated = evaluate_financial_repression(
        FinancialRepressionInput(
            nominal_gdp_growth=0.055,
            debt_growth=0.050,
            inflation_rate=0.033,
            cash_yield=0.005,
            treasury_30y_yield=0.053,
            treasury_supply_pressure=0.80,
            ai_corporate_debt_pressure=0.80,
            term_premium_pressure=0.75,
        )
    )
    assert unremunerated.real_cash_return < 0
    assert unremunerated.repression_regime_active
    assert unremunerated.duration_pressure_score > 0.70

    remunerated = evaluate_financial_repression(
        FinancialRepressionInput(
            nominal_gdp_growth=0.045,
            debt_growth=0.045,
            inflation_rate=0.025,
            cash_yield=0.040,
            treasury_30y_yield=0.045,
            treasury_supply_pressure=0.35,
            ai_corporate_debt_pressure=0.25,
            term_premium_pressure=0.30,
        )
    )
    assert remunerated.real_cash_return > 0
    assert not remunerated.repression_regime_active


def test_roic_wacc_gate_blocks_growth_without_incremental_spread():
    blocked = evaluate_roic_wacc_gate(
        ROICWACCGateInput(
            roic=0.18,
            wacc=0.11,
            incremental_roic=0.10,
            fcf_current=True,
            pricing_power=0.80,
            balance_sheet_strength=0.80,
            capex_payback_visibility=0.80,
            leverage_risk=0.20,
            long_duration_valuation=0.30,
        )
    )
    assert not blocked.gate_passed
    assert blocked.incremental_spread < 0

    passed = evaluate_roic_wacc_gate(
        ROICWACCGateInput(
            roic=0.30,
            wacc=0.09,
            incremental_roic=0.24,
            fcf_current=True,
            pricing_power=0.90,
            balance_sheet_strength=0.90,
            capex_payback_visibility=0.90,
            leverage_risk=0.10,
            long_duration_valuation=0.15,
        )
    )
    assert passed.gate_passed
    assert passed.portfolio_action_allowed
    assert passed.incremental_spread >= 0.04


def test_secondary_signals_never_create_economic_proof():
    result = evaluate_secondary_signal_integrity(
        SecondarySignalIntegrityInput(
            economic_proof=0.20,
            estimate_revision_breadth=0.95,
            analyst_target_revision=1.00,
            insider_or_political_trade_signal=1.00,
            headline_narrative_intensity=1.00,
            regular_session_confirmation=0.90,
        )
    )
    assert not result.economic_proof_created
    assert not result.portfolio_action_allowed
