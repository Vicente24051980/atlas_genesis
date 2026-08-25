from .market_fragility import (
    ExpectationsGapInput, ExpectationsGapState, MarketFragilityInput,
    FragilityState, evaluate_market_fragility,
    evaluate_negative_expectations_gap, layer_jump_state,
)


def test_fragility_raises_confirmation_hurdle():
    r = evaluate_market_fragility(MarketFragilityInput(85, 80, 70, 70, 55, 80))
    assert r.state in {FragilityState.ELEVATED, FragilityState.HIGH}
    assert r.hurdle_multiplier > 1.0


def test_one_day_pulse_never_confirms_layer_jump():
    assert layer_jump_state(
        pulse_breadth=85, relative_strength=80, global_continuity=40,
        persistence=20, event_validation=0
    ) == "LAYER_JUMP_WATCH"


def test_confirmed_jump_requires_continuity_persistence_and_event():
    assert layer_jump_state(
        pulse_breadth=80, relative_strength=78, global_continuity=80,
        persistence=82, event_validation=85
    ) == "LAYER_JUMP_CONFIRMED"


def test_good_fundamentals_bad_market_response_flags_gap():
    r = evaluate_negative_expectations_gap(ExpectationsGapInput(
        fundamental_confirmation=90, chain_breadth=30, relative_strength=25,
        persistence=35, post_event_window_complete=True
    ))
    assert r.state == ExpectationsGapState.NEGATIVE_EXPECTATIONS_GAP


def test_gap_fails_closed_before_window_complete():
    r = evaluate_negative_expectations_gap(ExpectationsGapInput(
        fundamental_confirmation=90, chain_breadth=30, relative_strength=25,
        persistence=35, post_event_window_complete=False
    ))
    assert r.state == ExpectationsGapState.WATCH
