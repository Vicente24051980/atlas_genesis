from runtime.agentic_omega.earnings_flow_confirmation import (
    EFCInput, FlowCausalityInput, accumulation_state,
    earnings_flow_confirmation, portfolio_green, portfolio_state, residual_return,
)


def test_efc_penalizes_peak_cycle_and_dilution():
    base = EFCInput(90,90,90,90,80,80,80,80)
    cyc = EFCInput(90,90,90,90,80,80,80,80, cycle_penalty=20, dilution_penalty=10)
    assert earnings_flow_confirmation(cyc) < earnings_flow_confirmation(base)


def test_one_day_strength_is_not_accumulation():
    assert accumulation_state(90, 30, 90, 20) == "UNCONFIRMED"


def test_causality_residual_does_not_claim_flow():
    x = FlowCausalityInput(1,2,1,0,3,10)
    assert residual_return(x) == 3


def test_market_red_blocks_green_even_with_great_business():
    score = portfolio_green(98, 90, 20, 85)
    assert portfolio_state(score, 20) == "FUNDAMENTAL_GREEN_MARKET_RED"


def test_balanced_candidate_can_be_green():
    score = portfolio_green(90, 85, 75, 80)
    assert score >= 80
    assert portfolio_state(score, 75) == "PORTFOLIO_GREEN"
