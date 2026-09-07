from runtime.agentic_omega.point_zero_rebuild import run_point_zero_rebuild
from runtime.agentic_omega.security_snapshot import (
    OMEGA_DATA_CONTRACT_VERSION,
    PointInTimeValue,
    SecurityIdentity,
    SecuritySnapshot,
)


def v(value, published="2026-09-06T12:00:00+00:00", confidence=0.95):
    return PointInTimeValue(value=value, publication_timestamp=published, source="TEST", confidence=confidence)


def snapshot(ticker="AAA", *, future=False, omit=None):
    pub = "2026-09-08T12:00:00+00:00" if future else "2026-09-06T12:00:00+00:00"
    fundamentals = {
        "fundamental_quality_score": v(90, pub),
        "normalized_economics_score": v(95, pub),
        "evidence_completeness_score": v(92, pub),
    }
    estimates = {
        "expected_return_score": v(88, pub),
        "regime_compatibility_score": v(80, pub),
        "normalized_expected_cagr_pct": v(14, pub),
    }
    valuation = {"valuation_confidence_pct": v(90, pub)}
    volatility = {
        "market_validation_score": v(82, pub),
        "market_data_age_hours": v(2, pub),
    }
    blocks = {
        "fundamentals": fundamentals,
        "estimates": estimates,
        "valuation": valuation,
        "volatility": volatility,
    }
    if omit:
        block, key = omit
        blocks[block].pop(key, None)

    return SecuritySnapshot(
        schema_version=OMEGA_DATA_CONTRACT_VERSION,
        identity=SecurityIdentity(issuer_id=f"ISSUER:{ticker}", security_id=f"SECURITY:{ticker}", ticker_at_time=ticker),
        timestamp="2026-09-06T12:05:00+00:00",
        reporting_currency="USD",
        security_currency="USD",
        portfolio_base_currency="EUR",
        source="TEST",
        valuation=valuation,
        fundamentals=fundamentals,
        estimates=estimates,
        volatility=volatility,
        confidence=0.95,
    )


def test_valid_snapshot_enters_clean_ranking():
    result = run_point_zero_rebuild([snapshot()], as_of_timestamp="2026-09-07T08:00:00+00:00")
    assert result.status == "SELECTED"
    assert result.accepted_snapshot_count == 1
    assert result.ranked_rows[0]["ticker"] == "AAA"


def test_future_publication_is_rejected_and_never_ranked():
    result = run_point_zero_rebuild([snapshot(future=True)], as_of_timestamp="2026-09-07T08:00:00+00:00")
    assert result.status == "EVIDENCE_PENDING"
    assert result.accepted_snapshot_count == 0
    assert result.pit_safe is False
    assert "FUTURE_PUBLICATION_PRESENT" in result.rejected[0]["reasons"]


def test_missing_required_binding_fails_closed():
    result = run_point_zero_rebuild(
        [snapshot(omit=("estimates", "normalized_expected_cagr_pct"))],
        as_of_timestamp="2026-09-07T08:00:00+00:00",
    )
    assert result.status == "EVIDENCE_PENDING"
    assert "MISSING_BINDING:estimates.normalized_expected_cagr_pct" in result.rejected[0]["reasons"]


def test_raw_provider_dict_cannot_bypass_snapshot_contract():
    result = run_point_zero_rebuild(
        [{"ticker": "AAA", "expected_return": 999}],
        as_of_timestamp="2026-09-07T08:00:00+00:00",
    )
    assert result.status == "EVIDENCE_PENDING"
    assert result.accepted_snapshot_count == 0
    assert result.rejected[0]["reasons"] == ("RAW_PROVIDER_OBJECT_FORBIDDEN",)


def test_ranking_cannot_consume_current_holding_state():
    a = snapshot("AAA")
    b = snapshot("BBB")
    result = run_point_zero_rebuild([a, b], as_of_timestamp="2026-09-07T08:00:00+00:00")
    assert all(row["incumbent_state_consumed"] is False for row in result.ranked_rows)
