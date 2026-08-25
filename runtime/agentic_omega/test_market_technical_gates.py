from runtime.agentic_omega.market_technical_gates import (
    CryptoConvergenceInput,
    DurationStressInput,
    DurationStressRegime,
    SOXTransmissionInput,
    TechnicalGateState,
    evaluate_crypto_convergence,
    evaluate_duration_stress,
    evaluate_sox_transmission,
)


def test_nvda_beat_without_sox_confirmation_does_not_confirm_jump():
    r = evaluate_sox_transmission(SOXTransmissionInput(True, False, True, True, True, True, True, 48))
    assert r.state == TechnicalGateState.AMBER
    assert not r.layer_jump_confirmed
    assert not r.portfolio_action_allowed


def test_broad_persistent_sox_transmission_confirms_layer_jump():
    r = evaluate_sox_transmission(SOXTransmissionInput(True, True, True, True, True, True, True, 72))
    assert r.state == TechnicalGateState.GREEN_STRONG
    assert r.confirmed_layers == 5
    assert r.layer_jump_confirmed
    assert not r.portfolio_action_allowed


def test_duration_pressure_zone():
    r = evaluate_duration_stress(DurationStressInput(5.20))
    assert r.regime == DurationStressRegime.PRESSURE
    assert r.state == TechnicalGateState.AMBER
    assert r.valuation_headwind


def test_growth_can_soften_but_not_erase_stress():
    r = evaluate_duration_stress(DurationStressInput(5.30, real_growth_supportive=True, earnings_revisions_supportive=True))
    assert r.regime == DurationStressRegime.STRESS
    assert r.state == TechnicalGateState.AMBER
    assert r.valuation_headwind


def test_confirmed_30y_breakout_is_red():
    r = evaluate_duration_stress(DurationStressInput(5.40, monthly_breakout_confirmed=True, fiscal_supply_pressure=True))
    assert r.regime == DurationStressRegime.BREAKOUT_STRESS
    assert r.state == TechnicalGateState.RED


def test_crypto_divergence_is_wave_only_and_blocks_convergence():
    r = evaluate_crypto_convergence(CryptoConvergenceInput(True, False, True))
    assert r.state == TechnicalGateState.AMBER
    assert not r.convergence_confirmed
    assert not r.portfolio_action_allowed
