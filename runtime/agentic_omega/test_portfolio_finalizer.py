from .portfolio_finalizer import FinalCandidate, GreenTier, classify, replacement_allowed


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


def test_replacement_hurdle_three_pp():
    incumbent = c("KO", normalized_expected_cagr=9.0, omega_score=90)
    challenger = c("XPO", normalized_expected_cagr=12.2, omega_score=89)
    ok, _ = replacement_allowed(incumbent, challenger)
    assert ok


def test_replacement_fails_without_edge():
    incumbent = c("KO", normalized_expected_cagr=10.0, omega_score=90)
    challenger = c("XPO", normalized_expected_cagr=11.0, omega_score=92)
    ok, _ = replacement_allowed(incumbent, challenger)
    assert not ok
