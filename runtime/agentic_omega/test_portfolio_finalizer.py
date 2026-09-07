from .portfolio_finalizer import (
    FinalCandidate,
    GreenTier,
    classify,
    legacy_execution_replacement_diagnostic,
    replacement_allowed,
)


def c(ticker="X", **kw):
    base = dict(normalized_expected_cagr=12.0, omega_score=88, economic_proof=85,
                evidence_completeness=90, market_validation=75,
                valuation_confidence=85, data_age_hours=2)
    base.update(kw)
    return FinalCandidate(ticker=ticker, **base)


def test_core_green():
    r = classify(c("KO"))
    assert r.tier == GreenTier.CORE and r.executable


def test_stale_fails_closed():
    r = classify(c(data_age_hours=25))
    assert r.tier == GreenTier.WATCH and not r.executable


def test_event_gate_blocks_execution():
    r = classify(c(event_gate=True))
    assert r.tier == GreenTier.EVENT and not r.executable


def test_cyclical_requires_normalization_and_market_validation():
    r = classify(c("VLO", cyclical=True, market_validation=70))
    assert r.tier == GreenTier.CYCLICAL and r.executable


def test_clean_replacement_api_is_fail_closed_regardless_of_edge():
    incumbent = c("KO", normalized_expected_cagr=9.0, omega_score=70)
    challenger = c("XPO", normalized_expected_cagr=20.0, omega_score=99)
    ok, reason = replacement_allowed(incumbent, challenger)
    assert not ok
    assert "POINT_ZERO_CLEAN_SELECTION" in reason


def test_legacy_hurdle_survives_only_as_execution_diagnostic():
    incumbent = c("KO", normalized_expected_cagr=9.0, omega_score=90)
    challenger = c("XPO", normalized_expected_cagr=12.2, omega_score=89)
    ok, reason = legacy_execution_replacement_diagnostic(incumbent, challenger)
    assert ok
    assert reason.startswith("EXECUTION_DIAGNOSTIC_ONLY")
