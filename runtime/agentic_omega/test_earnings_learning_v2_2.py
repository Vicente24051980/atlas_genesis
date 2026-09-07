from runtime.agentic_omega.earnings_learning_v2_2 import (
    EarningsLearningInput, FundamentalSurprise, LearningState,
    PostEventPriceTruth, PreEventExpectationBurden, SecondOrderReadThrough,
    combine_independent_layers, evaluate_earnings_learning,
)


def base(**price_overrides):
    p = dict(ah=2.0, d1_open=2.0, d1_close=3.0, d3=4.0, d5=5.0, d20=6.0,
             benchmark_d1_close=1.0, benchmark_d3=1.0, benchmark_d5=1.0,
             benchmark_d20=1.0)
    p.update(price_overrides)
    return EarningsLearningInput(
        expectations=PreEventExpectationBurden(20, 20, 20, 20, 20, 20, 20),
        fundamentals=FundamentalSurprise(40, 40, 40, 40, eps=100, eps_quality_ok=False),
        price=PostEventPriceTruth(**p),
        read_through=SecondOrderReadThrough(10, 10, 10),
        calibration_sample_n=20,
    )


def test_confirmation_and_eps_quality_gate():
    r = evaluate_earnings_learning(base())
    assert r.state == LearningState.CONFIRMED
    assert r.fundamental_surprise == 40.0  # bad-basis EPS cannot inflate the layer
    assert r.price_truth == 3.5  # each horizon benchmark-adjusted exactly once


def test_saturation():
    x = base(d1_close=-2, d3=-2, d5=-2, d20=-2, ah=-1, d1_open=-1)
    x = EarningsLearningInput(
        expectations=PreEventExpectationBurden(80,80,80,80,80,80,80),
        fundamentals=x.fundamentals, price=x.price,
        read_through=x.read_through, calibration_sample_n=20)
    assert evaluate_earnings_learning(x).state == LearningState.SATURATED


def test_pre_event_style_selloff_then_post_event_rebound_path():
    r = evaluate_earnings_learning(base(ah=None, d1_open=-4, d1_close=2))
    assert r.state == LearningState.REBOUND


def test_after_hours_reversal():
    r = evaluate_earnings_learning(base(ah=5, d1_close=-1))
    assert r.state == LearningState.REVERSAL


def test_missing_calibration_fails_closed():
    x = base()
    x = EarningsLearningInput(x.expectations, x.fundamentals, x.price,
                              x.read_through, calibration_sample_n=3)
    r = evaluate_earnings_learning(x)
    assert r.state == LearningState.INCOMPLETE
    assert "calibration_sample" in r.missing_fields


def test_stale_or_contradictory_tape_fails_closed():
    assert evaluate_earnings_learning(base(tape_stale=True)).state == LearningState.CONTRADICTORY
    assert evaluate_earnings_learning(base(tape_contradictory=True)).state == LearningState.CONTRADICTORY


def test_duplicate_evidence_has_no_official_aggregate_score():
    r = evaluate_earnings_learning(base())
    layers = combine_independent_layers(r)
    assert len(layers) == 4
    assert r.scoring_authority == "DIAGNOSTIC_ONLY"
    assert not hasattr(r, "aggregate_score")
