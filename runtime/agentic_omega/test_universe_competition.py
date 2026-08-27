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


def test_t212_unverified_fails_closed():
    row = audit_candidate(c("MDB", trading212_available=None))
    assert row["executable"] is False
    assert "TRADING212_UNVERIFIED_OR_UNAVAILABLE" in row["gate_reasons"]


def test_50_atlas_points_is_five_internal_score_points():
    incumbent = c(
        "INC",
        incumbent=True,
        fundamental_quality=80.0,
        expected_return=80.0,
        market_validation=80.0,
        regime_compatibility=80.0,
        normalized_expected_cagr=10.0,
    )
    challenger = c(
        "CHL",
        fundamental_quality=85.0,
        expected_return=85.0,
        market_validation=85.0,
        regime_compatibility=85.0,
        normalized_expected_cagr=10.5,
    )
    rows = full_universe_competition([incumbent, challenger])
    row = next(r for r in rows if r["ticker"] == "CHL")
    assert row["atlas_score_edge_points"] is not None
    assert row["clears_replacement_hurdle"] is True


def test_three_pp_cagr_can_clear_even_without_score_edge():
    incumbent = c("INC", incumbent=True, normalized_expected_cagr=9.0)
    challenger = c("CHL", normalized_expected_cagr=12.0)
    rows = full_universe_competition([incumbent, challenger])
    row = next(r for r in rows if r["ticker"] == "CHL")
    assert row["expected_cagr_edge_pp"] == 3.0
    assert row["clears_replacement_hurdle"] is True


def test_missing_t212_blocks_replacement_even_with_large_edges():
    incumbent = c("INC", incumbent=True, normalized_expected_cagr=5.0)
    challenger = c(
        "CHL",
        normalized_expected_cagr=20.0,
        trading212_available=False,
        fundamental_quality=100.0,
        expected_return=100.0,
        market_validation=100.0,
        regime_compatibility=100.0,
    )
    rows = full_universe_competition([incumbent, challenger])
    row = next(r for r in rows if r["ticker"] == "CHL")
    assert row["executable"] is False
    assert row["clears_replacement_hurdle"] is False
