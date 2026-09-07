from __future__ import annotations

import asyncio
from typing import Any, Literal

from fastapi import APIRouter, HTTPException, Query

from api.atlas_core import analyze_symbol as _legacy_quant_analyze_symbol
from api.atlas_top80 import ATLAS_TOP_80
from api.tracked_universe import PORTFOLIO, PORTFOLIO_PENDING, SNAPSHOT_ID, SNAPSHOT_STATUS, WATCHLIST

router = APIRouter(prefix="/v1/atlas", tags=["atlas"])

Context = Literal["candidate", "portfolio", "watchlist"]

ARCHITECTURE_VERSION = "ATLAS-E1-E6-PUBLIC-BOUNDARY-2026-09-07-v2"
DECISION_PIPELINE = "R0_RESEARCH -> E1_EVIDENCE -> E2_ASSESSMENT -> E3_GATE -> E4_DECISION -> EXECUTION"
PLANE_SEPARATION = "RESEARCH -> SIGNAL -> SCORE -> GATE -> PORTFOLIO_SELECTION -> EXECUTION"
CONTROL_MODEL = "E5_CONTROL_TRANSVERSAL_PERMISSIONS_GOVERNANCE_REVOCATION"
ASSURANCE_MODEL = "E6_ASSURANCE_INDEPENDENT_EVALUATION_NOT_DECISION_STAGE"

_LEGACY_ACTION_TO_ASSESSMENT = {
    "BUY": "FAVORABLE_QUANT_ASSESSMENT",
    "ADD": "FAVORABLE_HELD_QUANT_ASSESSMENT",
    "HOLD": "STABLE_QUANT_ASSESSMENT",
    "NO_BUY": "ADVERSE_QUANT_ASSESSMENT",
    "WAIT": "INSUFFICIENT_OR_NEUTRAL_QUANT_ASSESSMENT",
    "REVIEW": "REVIEW_REQUIRED_QUANT_ASSESSMENT",
}


def _sanitize_quant_result(result: dict[str, Any]) -> dict[str, Any]:
    """Convert the legacy mobile quantitative sensor into an E2-only output.

    The legacy implementation is preserved for provenance and metric extraction,
    but its BUY/ADD/HOLD/NO_BUY/WAIT/REVIEW labels have zero public authority.
    This boundary intentionally suppresses them before a response can leave the
    API. E3/E4 remain downstream, E5 governs authorization, and E6 evaluates
    independently rather than acting as a decision stage.
    """
    clean = dict(result)
    analysis_raw = clean.get("analysis")
    if not isinstance(analysis_raw, dict):
        clean["architectureBoundary"] = ARCHITECTURE_VERSION
        clean["decisionAuthority"] = "NONE"
        return clean

    analysis = dict(analysis_raw)
    legacy_action = str(analysis.pop("action", ""))
    analysis.pop("actionLabel", None)
    analysis.pop("reasons", None)
    analysis.pop("guardrail", None)

    flags = analysis.get("flags") if isinstance(analysis.get("flags"), dict) else {}
    severe = flags.get("severe") if isinstance(flags.get("severe"), list) else []
    watch = flags.get("watch") if isinstance(flags.get("watch"), list) else []
    score = analysis.get("atlasScore")
    score_coverage = analysis.get("scoreCoverage")
    metric_coverage = analysis.get("metricCoverage")

    notes: list[str] = [
        "E2 Assessment only: this quantitative sensor cannot issue BUY, SELL, ADD, HOLD or portfolio membership.",
        "Moat/management remain quantitative proxies until admitted E1 evidence exists.",
    ]
    if severe:
        notes.append("Adverse quantitative flags: " + ", ".join(str(x) for x in severe[:3]) + ".")
    if watch:
        notes.append("Watch flags: " + ", ".join(str(x) for x in watch[:3]) + ".")
    if score is None:
        notes.append("No comparable quantitative score is available from this sensor.")

    analysis["assessmentState"] = _LEGACY_ACTION_TO_ASSESSMENT.get(
        legacy_action, "UNCLASSIFIED_QUANT_ASSESSMENT"
    )
    analysis["assessmentAuthority"] = "E2_SUBORDINATE_SENSOR_ONLY"
    analysis["legacyActionSuppressed"] = bool(legacy_action)
    analysis["gateStatus"] = "NOT_EVALUATED_BY_E3"
    analysis["portfolioSelectionStatus"] = "NOT_EVALUATED"
    analysis["controlStatus"] = "NOT_AUTHORIZED_BY_E5"
    analysis["assuranceStatus"] = "NOT_EVALUATED_BY_E6"
    analysis["executionStatus"] = "NOT_AUTHORIZED"
    analysis["humanApprovalStatus"] = "NOT_REQUESTED"
    analysis["assessmentNotes"] = notes
    analysis["coverage"] = {
        "scorePct": score_coverage,
        "metricPct": metric_coverage,
    }
    analysis["algorithmVersion"] = ARCHITECTURE_VERSION

    clean["analysis"] = analysis
    clean["architectureBoundary"] = ARCHITECTURE_VERSION
    clean["decisionAuthority"] = "NONE"
    clean["portfolioSelectionAuthority"] = False
    clean["executionAuthority"] = False
    return clean


async def _assess_symbol(symbol: str, context: Context) -> dict[str, Any]:
    return _sanitize_quant_result(await _legacy_quant_analyze_symbol(symbol, context))


def _research_priority(result: dict[str, Any]) -> str:
    analysis = result.get("analysis") if isinstance(result.get("analysis"), dict) else {}
    state = str(analysis.get("assessmentState", ""))
    if state.startswith("FAVORABLE_"):
        return "HIGH"
    if state.startswith("STABLE_") or state.startswith("REVIEW_REQUIRED"):
        return "MEDIUM"
    if state.startswith("ADVERSE_"):
        return "LOW"
    return "DATA_PENDING"


@router.get("/universe")
async def universe() -> dict[str, Any]:
    return {
        "snapshotId": SNAPSHOT_ID,
        "status": SNAPSHOT_STATUS,
        "portfolio": PORTFOLIO,
        "portfolioPending": PORTFOLIO_PENDING,
        "watchlist": WATCHLIST,
        "atlasTop80": ATLAS_TOP_80,
        "counts": {
            "portfolio": len(PORTFOLIO),
            "pending": len(PORTFOLIO_PENDING),
            "watchlist": len(WATCHLIST),
            "atlasTop80": len(ATLAS_TOP_80),
        },
        "authority": {
            "portfolio": "OPERATIONAL_MONITORING_STATE_ONLY",
            "watchlist": "RESEARCH_QUEUE_ONLY",
            "atlasTop80": "HISTORICAL_RESEARCH_SET_ONLY",
            "pointZeroSelectionUniverse": "ATLAS_CORE_650_RAW_490_UNIQUE_487_ENTITY_2026-09-06",
        },
        "guardrail": "Broker state is VOLATILE and must be reconciled before material action. None of these monitoring lists is a Point-Zero prior.",
    }


@router.get("/analyze/{symbol}")
async def analyze(symbol: str, context: Context = Query(default="candidate")) -> dict[str, Any]:
    return await _assess_symbol(symbol, context)


@router.get("/monitor/{kind}")
async def monitor(
    kind: Literal["portfolio", "watchlist"] = "portfolio",
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=8, ge=1, le=12),
) -> dict[str, Any]:
    source = PORTFOLIO if kind == "portfolio" else WATCHLIST
    page = source[offset : offset + limit]
    context: Context = "portfolio" if kind == "portfolio" else "watchlist"

    async def one(item: dict[str, str]) -> dict[str, Any]:
        symbol = item.get("symbol") or item["ticker"]
        try:
            result = await _assess_symbol(symbol, context)
            return {"item": item, "ok": True, **result}
        except HTTPException as exc:
            return {
                "item": item,
                "ok": False,
                "assessmentState": "DATA_FAIL",
                "decisionAuthority": "NONE",
                "error": str(exc.detail),
                "statusCode": exc.status_code,
            }
        except Exception as exc:
            return {
                "item": item,
                "ok": False,
                "assessmentState": "DATA_FAIL",
                "decisionAuthority": "NONE",
                "error": exc.__class__.__name__,
            }

    rows = await asyncio.gather(*(one(item) for item in page))
    return {
        "kind": kind,
        "snapshotId": SNAPSHOT_ID,
        "offset": offset,
        "limit": limit,
        "total": len(source),
        "nextOffset": offset + len(page) if offset + len(page) < len(source) else None,
        "items": rows,
        "guardrail": "Monitoring produces E2 assessments only. E3 gates and E4 decisions remain separate; E5 controls authorization; E6 evaluates independently.",
    }


@router.get("/top80")
async def top80(
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=8, ge=1, le=12),
) -> dict[str, Any]:
    page = ATLAS_TOP_80[offset : offset + limit]

    async def one(item: dict[str, str]) -> dict[str, Any]:
        symbol = item.get("symbol") or item["ticker"]
        try:
            result = await _assess_symbol(symbol, "candidate")
            return {
                "item": item,
                "ok": True,
                "researchPriority": _research_priority(result),
                "portfolioDecision": "NOT_AUTHORIZED",
                **result,
            }
        except HTTPException as exc:
            return {
                "item": item,
                "ok": False,
                "researchPriority": "DATA_PENDING",
                "assessmentState": "DATA_FAIL",
                "portfolioDecision": "NOT_AUTHORIZED",
                "error": str(exc.detail),
                "statusCode": exc.status_code,
            }
        except Exception as exc:
            return {
                "item": item,
                "ok": False,
                "researchPriority": "DATA_PENDING",
                "assessmentState": "DATA_FAIL",
                "portfolioDecision": "NOT_AUTHORIZED",
                "error": exc.__class__.__name__,
            }

    rows = await asyncio.gather(*(one(item) for item in page))
    return {
        "kind": "atlasTop80HistoricalResearchSet",
        "snapshotId": "ATLAS-TOP-80-FINNHUB-2026-08-10-v1-HISTORICAL",
        "offset": offset,
        "limit": limit,
        "total": len(ATLAS_TOP_80),
        "nextOffset": offset + len(page) if offset + len(page) < len(ATLAS_TOP_80) else None,
        "items": rows,
        "guardrail": "This endpoint prioritizes research only. It cannot emit a BUY/SELL binary decision or alter Point-Zero membership.",
    }


@router.get("/engines")
async def engines() -> dict[str, Any]:
    return {
        "architectureVersion": ARCHITECTURE_VERSION,
        "canonicalEngines": [
            {"id": "E1", "name": "EVIDENCE Ω", "state": "CANONICAL", "authority": "EVIDENCE_PIT_PROVENANCE_IDENTITY"},
            {"id": "E2", "name": "ASSESSMENT Ω", "state": "CANONICAL", "authority": "ASSESS_VALID_EVIDENCE"},
            {"id": "E3", "name": "GATE Ω", "state": "CANONICAL", "authority": "BOOLEAN_OR_CONDITIONAL_VETO"},
            {"id": "E4", "name": "DECISION Ω", "state": "CANONICAL", "authority": "ACTION_AND_CAPITAL_PROPOSAL"},
            {"id": "E5", "name": "CONTROL Ω", "state": "CANONICAL", "authority": "PERMISSIONS_GOVERNANCE_REVOCATION"},
            {"id": "E6", "name": "ASSURANCE Ω", "state": "CANONICAL", "authority": "INDEPENDENT_EVALUATION"},
        ],
        "researchSubstrate": {"id": "R0", "name": "RESEARCH Ω", "decisionAuthority": "NONE"},
        "researchPrograms": [
            "P-I_DONDE_VA_EL_CAPITAL",
            "P-II_QUIEN_CAPTURA_EL_VALOR",
            "P-III_COMO_SE_TRANSMITE_EL_REGIMEN",
        ],
        "subordinateSensors": [
            "Business Quality",
            "Growth",
            "Valuation",
            "Risk",
            "CAPEX Productivity",
            "Money Rotation",
            "Historical Dislocation",
            "Agentic Security Discovery",
        ],
        "decisionPipeline": DECISION_PIPELINE,
        "planeSeparation": PLANE_SEPARATION,
        "controlModel": CONTROL_MODEL,
        "assuranceModel": ASSURANCE_MODEL,
        "guardrail": "Plane separation is a type-system rule, not a one-to-one engine mapping. E5 is transversal control; E6 is independent assurance and has no decision/execution authority.",
    }


@router.get("/agentic-security")
async def agentic_security() -> dict[str, Any]:
    return {
        "researchProgram": "P-II_QUIEN_CAPTURA_EL_VALOR",
        "module": "Agentic Security Discovery",
        "status": "RESEARCH_QUEUE",
        "decisionAuthority": "NONE",
        "items": [
            {"ticker": "PANW", "role": "Agentic security / runtime / platform", "state": "REQUIRES_PRIMARY_EVIDENCE"},
            {"ticker": "NET", "role": "Zero Trust / edge / AI gateway", "state": "REQUIRES_PRIMARY_EVIDENCE"},
            {"ticker": "CRWD", "role": "Endpoint / identity / behavior", "state": "REQUIRES_PRIMARY_EVIDENCE"},
            {"ticker": "OKTA", "role": "Identity / non-human identity", "state": "REQUIRES_PRIMARY_EVIDENCE"},
            {"ticker": "ZS", "role": "Zero Trust / egress / data controls", "state": "REQUIRES_PRIMARY_EVIDENCE"},
        ],
        "guardrail": "Seed membership only prioritizes research. Any selection claim must pass E1, E2, E3 and portfolio-level Competition for Capital under Point Zero.",
    }
