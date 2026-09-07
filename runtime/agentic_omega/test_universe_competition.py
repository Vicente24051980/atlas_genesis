from runtime.agentic_omega.universe_competition import (
    UniverseCandidate,
    audit_candidate,
    full_universe_competition,
)


def c(ticker: str, incumbent: bool = False, **kw) -> UniverseCandidate:
    base = dict(
        fundamental_quality=90.0,
        expected_return=90.0,
        market_validation=80.0,
        regime_compatibility=80.0,
        normalized_economics=100.0,
        evidence_completeness=100.0,
        sector="TECH",
        normalized_expected_cagr=12.0,
        valuation_confidence=90.0,
        market_data_age_hours=2.0,
        trading212_available=True,
        incumbent=incumbent,
    )
    base.update(kw)
    return UniverseCandidate(ticker=ticker, **base)


def test_broker_availability_is_execution_only_not_clean_membership_gate():
    row = audit_candidate(c("MDB", trading212_available=None))
    assert row["selection_eligible"] is True
    assert row["execution_eligible"] is False
    assert "TRADING212_UNVERIFIED_OR_UNAVAILABLE" in row["execution_gate_reasons"]


def test_incumbent_flag_cannot_change_clean_ranking_or_create_hurdle():
    incumbent = c("INC", incumbent=True, fundamental_quality=80.0, normalized_expected_cagr=10.0)
    challenger = c("CHL", fundamental_quality=85.0, normalized_expected_cagr=10.5)
    rows = full_universe_competition([incumbent, challenger])
    row = next(r for r in rows if r["ticker"] == "CHL")
    assert row["incumbent_state_consumed"] is False
    assert row["replacement_of"] is None
    assert row["clears_replacement_hurdle"] is False
    assert row["replacement_hurdle_authority"] == "NONE_IN_POINT_ZERO_CLEAN_SELECTION"


def test_legacy_hurdle_arguments_are_ignored_in_clean_mode():
    incumbent = c("INC", incumbent=True, normalized_expected_cagr=9.0)
    challenger = c("CHL", normalized_expected_cagr=20.0)
    normal = full_universe_competition([incumbent, challenger])
    absurd = full_universe_competition([incumbent, challenger], er_hurdle_pp=999, atlas_score_hurdle_points=999999)
    assert [(r["ticker"], r["adjusted_score"]) for r in normal] == [
        (r["ticker"], r["adjusted_score"]) for r in absurd
    ]
    assert all(r["clears_replacement_hurdle"] is False for r in normal)


def test_missing_expected_return_evidence_fails_clean_selection_closed():
    row = audit_candidate(c("CHL", normalized_expected_cagr=None))
    assert row["selection_eligible"] is False
    assert "MISSING_NORMALIZED_EXPECTED_CAGR" in row["selection_gate_reasons"]
