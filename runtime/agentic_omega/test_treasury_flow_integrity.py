from runtime.agentic_omega.treasury_flow_integrity import (
    BitcoinTreasuryInput,
    EvidenceStatus,
    FlowSeriesMetadata,
    ReportedGrowthInput,
    evidence_claim_gate,
    evaluate_bitcoin_treasury,
    flow_series_comparable,
    normalized_growth,
)
from runtime.agentic_omega.ai_demand_engines import SignalState


def test_btc_holdings_growth_does_not_override_per_share_dilution():
    result = evaluate_bitcoin_treasury(BitcoinTreasuryInput(0.50, 0.80, -0.10))
    assert result.signal is SignalState.RED
    assert result.btc_per_share_accretive is False
    assert result.portfolio_action_allowed is False


def test_zero_debt_with_preferred_is_not_zero_economic_leverage():
    result = evaluate_bitcoin_treasury(BitcoinTreasuryInput(0.40, 0.10, 0.20, debt=0, preferred_notional=200, preferred_cash_cost=26, common_equity_value=800))
    assert result.signal is SignalState.AMBER
    assert result.economic_leverage_ratio == 0.25
    assert result.portfolio_action_allowed is False


def test_large_mnav_premium_blocks_green_common_equity_signal():
    result = evaluate_bitcoin_treasury(BitcoinTreasuryInput(0.40, 0.05, 0.20, common_equity_value=2000, bitcoin_nav=800))
    assert result.mnav == 2.5
    assert result.signal is SignalState.AMBER
    assert result.portfolio_action_allowed is False


def test_preferred_cash_burden_can_turn_treasury_red():
    result = evaluate_bitcoin_treasury(BitcoinTreasuryInput(0.40, 0.05, 0.20, preferred_cash_cost=60, annual_common_cash_generation=100, common_equity_value=1000))
    assert result.preferred_cash_burden == 0.6
    assert result.signal is SignalState.RED


def test_flow_series_are_not_comparable_across_universes():
    a = FlowSeriesMetadata("LSEG", "global sector funds", "global", "funds", "weekly", "2026-08-19")
    b = FlowSeriesMetadata("LSEG", "US sector funds", "US", "funds", "weekly", "2026-08-19")
    assert flow_series_comparable(a, b) is False


def test_primary_source_contradiction_fails_closed():
    result = evidence_claim_gate(claimed_fact=True, primary_source_supports_claim=False)
    assert result.status is EvidenceStatus.FAIL
    assert result.portfolio_action_allowed is False


def test_reported_growth_is_not_silently_organic_after_ma():
    assert normalized_growth(ReportedGrowthInput(0.31, True, None)) is None
    assert normalized_growth(ReportedGrowthInput(0.31, True, 0.18)) == 0.18
