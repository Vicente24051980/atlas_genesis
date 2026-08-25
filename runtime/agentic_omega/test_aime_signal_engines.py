from runtime.agentic_omega.aime_signal_engines import (
    ExternalSignalInput,
    IntradayBreadthPulseInput,
    OptionsFlowInput,
    SignalState,
    TechnicalConfirmationInput,
    ThemeCrowdingInput,
    evaluate_external_signal,
    evaluate_intraday_breadth_pulse,
    evaluate_options_flow,
    evaluate_technical_confirmation,
    evaluate_theme_crowding,
)


def test_options_flow_event_hedge_blocks_execution():
    r = evaluate_options_flow(OptionsFlowInput(
        95, 90, 90, 90, 85, 85,
        hedge_penalty=0, event_hedge_penalty=0, days_to_event=1,
    ))
    assert r.score >= 80
    assert r.event_contaminated
    assert not r.executable_confirmation


def test_technical_confirmation_cannot_create_expected_return():
    r = evaluate_technical_confirmation(TechnicalConfirmationInput(
        95, 90, 90, 90, 90,
        expected_return_score=45, valuation_support=80,
    ))
    assert r.state == SignalState.CONFIRMED
    assert r.timing_support
    assert not r.buy_authorized


def test_breakout_with_bad_valuation_does_not_authorize_buy():
    r = evaluate_technical_confirmation(TechnicalConfirmationInput(
        90, 90, 90, 90, 90,
        expected_return_score=85, valuation_support=40,
    ))
    assert not r.buy_authorized


def test_one_day_breadth_is_not_persistent_rotation():
    r = evaluate_intraday_breadth_pulse(IntradayBreadthPulseInput(
        80, 80, 85, 85, 30, 80,
    ))
    assert not r.persistent_rotation


def test_external_signal_is_discounted_by_evidence_quality():
    r = evaluate_external_signal(ExternalSignalInput(
        source_quality=30,
        data_transparency=20,
        reproducibility=20,
        timestamp_quality=90,
        conflict_disclosure=20,
        independent_confirmation=10,
        raw_signal_strength=95,
    ))
    assert r.adjusted_signal < 50
    assert r.state == SignalState.REJECT


def test_theme_crowding_survives_fundamental_offset():
    r = evaluate_theme_crowding(ThemeCrowdingInput(
        repeated_curated_mentions=95,
        analyst_consensus=90,
        options_speculation=90,
        valuation_expansion=95,
        ownership_concentration=85,
        price_acceleration=90,
        fundamental_revision_strength=100,
    ))
    assert r.fundamental_offset == 30
    assert r.net_crowding_risk >= 50
