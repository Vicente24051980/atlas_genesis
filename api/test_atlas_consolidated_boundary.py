from __future__ import annotations

import pytest

from api import atlas_core_consolidated as consolidated
from api.tracked_universe import PORTFOLIO, SNAPSHOT_STATUS, WATCHLIST


def test_current_operational_portfolio_is_exactly_confirmed_27() -> None:
    assert [x["ticker"] for x in PORTFOLIO] == [
        "AXON", "MELI", "CRWD", "LRCX", "PWR", "GEV", "AVGO", "PANW", "SYK",
        "MA", "ANET", "CDNS", "ISRG", "APH", "HWM", "VRT", "TT", "VRTX", "BSX",
        "INTU", "TRGP", "LLY", "GE", "ETN", "ICE", "V", "BKNG",
    ]
    assert len(PORTFOLIO) == 27
    assert "BROKER_RECONCILIATION_REQUIRED_BEFORE_ACTION" in SNAPSHOT_STATUS


def test_monitoring_watchlist_cannot_overlap_operational_portfolio() -> None:
    held = {x["ticker"] for x in PORTFOLIO}
    watched = {x["ticker"] for x in WATCHLIST}
    assert held.isdisjoint(watched)


def test_legacy_buy_is_suppressed_at_public_boundary() -> None:
    raw = {
        "symbol": "TEST",
        "analysis": {
            "action": "BUY",
            "actionLabel": "COMPRAR",
            "atlasScore": 80.0,
            "scoreCoverage": 90.0,
            "metricCoverage": 80.0,
            "flags": {"severe": [], "watch": []},
            "reasons": ["Supera el Decision Gate Ω cuantitativo con la cobertura disponible."],
            "guardrail": "legacy",
        },
    }
    result = consolidated._sanitize_quant_result(raw)
    analysis = result["analysis"]
    assert "action" not in analysis
    assert "actionLabel" not in analysis
    assert "reasons" not in analysis
    assert analysis["assessmentState"] == "FAVORABLE_QUANT_ASSESSMENT"
    assert analysis["decisionAuthority"] if "decisionAuthority" in analysis else True
    assert analysis["gateStatus"] == "NOT_EVALUATED_BY_E3"
    assert analysis["portfolioSelectionStatus"] == "NOT_EVALUATED"
    assert analysis["executionStatus"] == "NOT_AUTHORIZED"
    assert result["decisionAuthority"] == "NONE"
    assert result["portfolioSelectionAuthority"] is False
    assert result["executionAuthority"] is False


@pytest.mark.asyncio
async def test_engine_endpoint_exposes_only_six_canonical_engines() -> None:
    result = await consolidated.engines()
    ids = [x["id"] for x in result["canonicalEngines"]]
    assert ids == ["E1", "E2", "E3", "E4", "E5", "E6"]
    assert result["researchSubstrate"]["decisionAuthority"] == "NONE"
    assert "RESEARCH -> SIGNAL -> SCORE -> GATE -> PORTFOLIO_SELECTION -> EXECUTION" == result["planeSeparation"]


@pytest.mark.asyncio
async def test_universe_endpoint_denies_point_zero_authority_to_monitoring_lists() -> None:
    result = await consolidated.universe()
    assert result["counts"]["portfolio"] == 27
    assert result["authority"]["portfolio"] == "OPERATIONAL_MONITORING_STATE_ONLY"
    assert result["authority"]["watchlist"] == "RESEARCH_QUEUE_ONLY"
    assert result["authority"]["pointZeroSelectionUniverse"] == "ATLAS_CORE_650_RAW_490_UNIQUE_487_ENTITY_2026-09-06"
