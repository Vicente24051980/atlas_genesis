from __future__ import annotations

from api.app import app as production_app
from api.mobile_audit_omega import ENGINE_ORDER, _build_engine_ledger, _committee_decision


def _company() -> dict:
    return {
        "provider": "TEST_PROVIDER",
        "summary": {
            "ticker": "ETN",
            "name": "Eaton",
            "sector": "Industrials",
            "industry": "Electrical Equipment",
            "price": 415.29,
            "marketCap": 160_000_000_000,
            "pe": 30.0,
            "revenue": 28_000_000_000,
            "freeCashFlow": 4_000_000_000,
        },
        "sourceStatus": {"quote": "OK", "company": "OK", "keyMetrics": "OK"},
    }


def test_production_app_mounts_full_audit_route_once():
    paths = [route.path for route in production_app.routes]
    assert paths.count("/v1/mobile/audit/{ticker}") == 1


def test_green_is_first_and_every_registered_engine_is_visible():
    engines, _ = _build_engine_ledger("ETN", _company())
    assert engines[0]["engineId"] == "GREEN_CONTINUITY_OMEGA"
    assert [row["engineId"] for row in engines] == [engine_id for engine_id, _ in ENGINE_ORDER]
    assert len({row["engineId"] for row in engines}) == len(ENGINE_ORDER)


def test_green_is_quarantined_without_provider_quorum_not_fabricated():
    engines, _ = _build_engine_ledger("ETN", _company())
    green = engines[0]
    assert green["state"] == "QUARANTINE"
    assert green["score"] is None
    assert ">=3" in green["detail"]


def test_structural_capex_mapping_is_partial_not_fake_pass():
    engines, contradictions = _build_engine_ledger("ETN", _company())
    capex = next(row for row in engines if row["engineId"] == "GLOBAL_CAPEX_CHAIN_OMEGA")
    assert capex["state"] == "PARTIAL"
    assert capex["score"] is None
    assert contradictions


def test_falsifiers_are_explicit_and_never_assumed_clear():
    engines, _ = _build_engine_ledger("ETN", _company())
    falsifiers = next(row for row in engines if row["engineId"] == "FALSIFIERS_OMEGA")
    assert falsifiers["state"] == "INSUFFICIENT_DATA"
    assert "zero falsifiers" in falsifiers["detail"]


def test_committee_blocks_buy_when_critical_engines_are_unresolved():
    engines, _ = _build_engine_ledger("ETN", _company())
    decision = _committee_decision(engines)
    assert decision["recommendation"] == "PENDING"
    assert decision["action"] == "NO BUY · DATA GATE"
    assert decision["executionState"] == "BLOCKED"


def test_falsifier_fail_has_absolute_veto():
    engines, _ = _build_engine_ledger("ETN", _company())
    for row in engines:
        if row["engineId"] == "FALSIFIERS_OMEGA":
            row["state"] = "FAIL"
    decision = _committee_decision(engines)
    assert decision["recommendation"] == "REJECT"
    assert "FALSIFIER VETO" in decision["action"]
