from runtime.agentic_omega.challenger_universe import (
    ChallengerPromotionInput,
    challenger_by_ticker,
    evaluate_challenger_promotion,
)


def test_mdb_and_smtc_are_canonical_challengers():
    assert challenger_by_ticker("MDB") is not None
    assert challenger_by_ticker("SMTC") is not None
    assert challenger_by_ticker("QCOM") is not None
    assert challenger_by_ticker("CHKP") is not None


def test_trading212_unavailable_fails_closed():
    spec = challenger_by_ticker("MDB")
    result = evaluate_challenger_promotion(
        ChallengerPromotionInput(spec, False, True, True, True, True, 80.0, 5.0)
    )
    assert result.eligible_for_active_competition is False
    assert "TRADING212_UNAVAILABLE" in result.reasons


def test_replacement_requires_50_omega_points_or_3pp_cagr():
    spec = challenger_by_ticker("SMTC")
    failed = evaluate_challenger_promotion(
        ChallengerPromotionInput(spec, True, True, True, True, True, 49.9, 2.99)
    )
    passed_score = evaluate_challenger_promotion(
        ChallengerPromotionInput(spec, True, True, True, True, True, 50.0, 2.0)
    )
    passed_cagr = evaluate_challenger_promotion(
        ChallengerPromotionInput(spec, True, True, True, True, True, 20.0, 3.0)
    )
    assert failed.clears_replacement_hurdle is False
    assert passed_score.clears_replacement_hurdle is True
    assert passed_cagr.clears_replacement_hurdle is True


def test_quantum_pure_play_requires_owner_economics_dilution_and_valuation():
    spec = challenger_by_ticker("IONQ")
    blocked = evaluate_challenger_promotion(
        ChallengerPromotionInput(spec, True, True, False, False, True, 100.0, 10.0)
    )
    assert blocked.clears_replacement_hurdle is False
    assert "QUANTUM_OWNER_ECONOMICS_MISSING" in blocked.reasons
    assert "QUANTUM_DILUTION_NOT_CONTROLLED" in blocked.reasons


def test_quantum_pure_play_still_needs_replacement_hurdle_after_economics():
    spec = challenger_by_ticker("QBTS")
    result = evaluate_challenger_promotion(
        ChallengerPromotionInput(spec, True, True, True, True, True, 10.0, 1.0)
    )
    assert result.eligible_for_active_competition is True
    assert result.clears_replacement_hurdle is False
    assert "REPLACEMENT_HURDLE_NOT_CLEARED" in result.reasons
