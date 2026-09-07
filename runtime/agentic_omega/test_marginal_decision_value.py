from runtime.agentic_omega.marginal_decision_value import (
    CounterfactualOutcome, MDVInput, MDVState, SimplicityGateInput,
    complexity_justified, evaluate_mdv,
)


def outcome(ret, dd=-10, turnover=0.1, cost=0, opportunity=0):
    return CounterfactualOutcome(ret, dd, turnover, cost, opportunity)


def test_positive_mdv_requires_comparable_oos_counterfactual():
    r = evaluate_mdv(MDVInput(
        "ENTRY_TIMING", outcome(12), outcome(10), True, True, True, True, True))
    assert r.state == MDVState.POSITIVE
    assert r.authority == "GOVERNANCE_ONLY"


def test_invalid_counterfactual_fails_closed():
    r = evaluate_mdv(MDVInput(
        "SCORE_X", outcome(20), outcome(10), False, True, True, True, True))
    assert r.state == MDVState.NOT_TESTABLE
    assert r.incremental_net_return is None


def test_complexity_cost_and_risk_can_kill_apparent_alpha():
    r = evaluate_mdv(MDVInput(
        "CHURN_ENGINE",
        outcome(12, dd=-18, turnover=1.0, cost=1.0),
        outcome(11, dd=-10, turnover=0.1, cost=0.1),
        True, True, True, True, True,
        risk_penalty_per_drawdown_point=0.1,
        turnover_penalty=0.5,
    ))
    assert r.state == MDVState.NEGATIVE


def test_simplicity_gate_waits_for_sufficient_forward_sample():
    x = SimplicityGateInput(12, 10, -8, -9, .2, .05, .2, .1, False)
    assert complexity_justified(x) is None


def test_atlas_complexity_not_justified_by_raw_return_alone():
    x = SimplicityGateInput(12, 11.8, -20, -8, 1.2, .05, .4, .05, True)
    assert complexity_justified(x) is False


def test_atlas_can_pass_when_net_advantage_survives_implementation():
    x = SimplicityGateInput(15, 10, -8, -10, .15, .05, .2, .1, True)
    assert complexity_justified(x) is True
