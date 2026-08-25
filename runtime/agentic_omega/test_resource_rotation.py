from runtime.agentic_omega.resource_rotation import (
    BranchMarketInput,
    GoldMinerInput,
    ResourceBranch,
    RotationState,
    aggregate_layer1_resources,
    evaluate_gold_miner,
    evaluate_resource_branch,
)


def test_gold_can_win_while_copper_deteriorates_without_promoting_all_c1():
    gold = evaluate_resource_branch(
        BranchMarketInput(ResourceBranch.GOLD, 2.0, 6.0, 15.0, 4.0, 75.0, 4, True)
    )
    copper = evaluate_resource_branch(
        BranchMarketInput(ResourceBranch.COPPER, -1.5, -2.0, 3.0, -2.5, 30.0, 0, True)
    )
    diversified = evaluate_resource_branch(
        BranchMarketInput(ResourceBranch.DIVERSIFIED, -0.5, -1.0, 1.0, -1.0, 40.0, 1, None)
    )
    layer = aggregate_layer1_resources([gold, copper, diversified])
    assert gold.state is RotationState.WINNING
    assert copper.state in (RotationState.DETERIORATING, RotationState.LOSING)
    assert layer.state is not RotationState.WINNING
    assert layer.divergent is True


def test_commodity_confirmation_does_not_promote_weak_equities():
    result = evaluate_resource_branch(
        BranchMarketInput(ResourceBranch.COPPER, -1.0, -3.0, 2.0, -2.0, 25.0, 0, True)
    )
    assert result.commodity_confirmation is True
    assert result.state is not RotationState.WINNING
    assert result.continuity_positive is False


def test_green_pulse_does_not_equal_continuity():
    result = evaluate_resource_branch(
        BranchMarketInput(ResourceBranch.GOLD, 3.0, -1.0, 4.0, -0.5, 70.0, 1, True)
    )
    assert result.pulse_positive is True
    assert result.continuity_positive is False
    assert result.state is not RotationState.WINNING


def test_gold_miner_uses_attributable_not_100pct_production():
    result = evaluate_gold_miner(
        GoldMinerInput(
            ticker="TEST",
            gold_price_per_oz=4500,
            aisc_per_oz=2200,
            production_100pct_oz=1_000_000,
            attributable_ownership_pct=65,
            normalized_fcf_yield_pct=8,
            current_fcf_yield_pct=3,
            net_debt_to_ebitda=0.5,
            jurisdiction_score=70,
            execution_score=80,
            reserve_quality_score=90,
            exploration_score=90,
            ramp_up_score=75,
            dilution_overhang_pct=4,
            gross_buyback_yield_pct=2,
            return_1d_pct=1,
            return_5d_pct=5,
            return_1m_pct=15,
            rs_5d_vs_gold_miners_pct=1,
        )
    )
    assert result.attributable_production_oz == 650_000
    assert result.spot_margin_per_oz == 2300


def test_buyback_does_not_hide_convertible_dilution():
    result = evaluate_gold_miner(
        GoldMinerInput(
            ticker="TEST",
            gold_price_per_oz=4500,
            aisc_per_oz=2200,
            production_100pct_oz=900_000,
            attributable_ownership_pct=80,
            normalized_fcf_yield_pct=8,
            current_fcf_yield_pct=2,
            net_debt_to_ebitda=0.3,
            jurisdiction_score=65,
            execution_score=75,
            reserve_quality_score=88,
            exploration_score=92,
            ramp_up_score=60,
            dilution_overhang_pct=10,
            gross_buyback_yield_pct=3,
            return_1d_pct=4,
            return_5d_pct=10,
            return_1m_pct=45,
            rs_5d_vs_gold_miners_pct=3,
        )
    )
    assert result.net_shareholder_yield_proxy_pct == -7
    assert "BUYBACK_DOES_NOT_OFFSET_DILUTION" in result.warnings
    assert "CURRENT_FCF_BELOW_NORMALIZED_FCF" in result.warnings
    assert "RAMP_UP_EXECUTION_NOT_DERISKED" in result.warnings
    assert "ENTRY_EXTENDED_AFTER_STRONG_1M_MOVE" in result.warnings
    assert result.portfolio_action_allowed is False


def test_strong_market_validation_can_coexist_with_weaker_entry_timing():
    result = evaluate_gold_miner(
        GoldMinerInput(
            ticker="TEST",
            gold_price_per_oz=4600,
            aisc_per_oz=2400,
            production_100pct_oz=850_000,
            attributable_ownership_pct=75,
            normalized_fcf_yield_pct=9,
            current_fcf_yield_pct=3,
            net_debt_to_ebitda=0.2,
            jurisdiction_score=72,
            execution_score=80,
            reserve_quality_score=90,
            exploration_score=92,
            ramp_up_score=72,
            dilution_overhang_pct=6,
            gross_buyback_yield_pct=3,
            return_1d_pct=4.2,
            return_5d_pct=9.1,
            return_1m_pct=44.7,
            rs_5d_vs_gold_miners_pct=2,
        )
    )
    assert result.market_validation_score > result.entry_timing_score
    assert result.portfolio_action_allowed is False
