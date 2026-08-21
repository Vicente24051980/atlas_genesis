from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Literal

from fastapi import APIRouter, HTTPException

from api.global_capex_chain_mobile import CAPEX_MAP
from api.mobile_v2 import _fdn_company_bundle, _finnhub_company_bundle, _symbol, FDN_API_KEY

router = APIRouter(prefix="/v1/mobile/audit", tags=["mobile-atlas-audit"])

EngineState = Literal[
    "PASS",
    "STRONG",
    "MIXED",
    "WATCH",
    "FAIL",
    "NO_SIGNAL",
    "NOT_APPLICABLE",
    "INSUFFICIENT_DATA",
    "QUARANTINE",
    "PARTIAL",
]
Recommendation = Literal["BUY", "HOLD", "WATCH", "REJECT", "NO_OPPORTUNITY", "PENDING"]

ENGINE_ORDER: list[tuple[str, str]] = [
    ("GREEN_CONTINUITY_OMEGA", "GREEN Continuity Ω"),
    ("GREEN_PULSE_OMEGA", "GREEN Pulse / Breadth / Relative Green Ω"),
    ("ECONOMIC_PROOF_OMEGA", "Economic Proof Ω"),
    ("VALUATION_IMPLIED_RETURN_OMEGA", "Valuation / Implied Return Ω"),
    ("GLOBAL_CAPEX_CHAIN_OMEGA", "Global CAPEX Chain Ω"),
    ("CAPEX_PRODUCTIVITY_OMEGA", "CAPEX Productivity Ω"),
    ("MOAT_PERSISTENCE_OMEGA", "Moat / Persistence Ω"),
    ("INSTITUTIONAL_ROTATION_OMEGA", "Institutional Capital Rotation Ω"),
    ("MACRO_REGIME_OMEGA", "Macro / Regime Ω"),
    ("DEFENSIVE_OMEGA", "Defensive Ω"),
    ("AI_CAPEX_PAYBACK_OMEGA", "AI CAPEX Payback Ω"),
    ("CREDIT_TRANSMISSION_OMEGA", "Credit Transmission / AI Financial Fragility Ω"),
    ("SUCCESSOR_DETECTION_OMEGA", "Successor Detection Ω"),
    ("CLINICAL_EVIDENCE_SHOCK_OMEGA", "Clinical Evidence Shock Ω"),
    ("AI_TOLLBOOTH_OMEGA", "AI Tollbooth Ω"),
    ("DEVELOPER_ACTIVITY_LEADING_INDICATOR_OMEGA", "Developer Activity Leading Indicator Ω"),
    ("HUMAN_CAPITAL_ALIGNMENT_OMEGA", "Human Capital Alignment Ω"),
    ("CUSTOMER_ACCEPTANCE_GATE_OMEGA", "Customer Acceptance Gate Ω"),
    ("FALSIFIERS_OMEGA", "Falsifiers Ω"),
    ("EVIDENCE_DIRECTOR_OMEGA", "Evidence Director Ω"),
]

CRITICAL_ENGINE_IDS = {
    "GREEN_CONTINUITY_OMEGA",
    "ECONOMIC_PROOF_OMEGA",
    "VALUATION_IMPLIED_RETURN_OMEGA",
    "FALSIFIERS_OMEGA",
    "EVIDENCE_DIRECTOR_OMEGA",
}


def _number(value: Any) -> float | None:
    if isinstance(value, bool):
        return None
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        try:
            return float(value.replace(",", ""))
        except ValueError:
            return None
    return None


def _engine(
    engine_id: str,
    label: str,
    state: EngineState,
    detail: str,
    *,
    score: float | None = None,
    evidence: list[str] | None = None,
    provenance: list[str] | None = None,
) -> dict[str, Any]:
    return {
        "engineId": engine_id,
        "label": label,
        "state": state,
        "score": score,
        "detail": detail,
        "evidence": evidence or [],
        "provenance": provenance or [],
    }


def _is_healthcare(summary: dict[str, Any]) -> bool:
    text = f"{summary.get('sector') or ''} {summary.get('industry') or ''}".lower()
    return any(token in text for token in ("health", "biotech", "pharma", "medical", "drug"))


def _is_software(summary: dict[str, Any]) -> bool:
    text = f"{summary.get('sector') or ''} {summary.get('industry') or ''}".lower()
    return any(token in text for token in ("software", "internet", "cloud", "database", "cyber"))


def _build_engine_ledger(symbol: str, company: dict[str, Any]) -> tuple[list[dict[str, Any]], list[str]]:
    summary = company.get("summary") if isinstance(company.get("summary"), dict) else {}
    provider = str(company.get("provider") or "UNKNOWN")
    price = _number(summary.get("price"))
    market_cap = _number(summary.get("marketCap"))
    pe = _number(summary.get("pe"))
    revenue = _number(summary.get("revenue"))
    fcf = _number(summary.get("freeCashFlow"))
    mapped_capex = CAPEX_MAP.get(symbol)
    healthcare = _is_healthcare(summary)
    software = _is_software(summary)

    engines: dict[str, dict[str, Any]] = {}

    engines["GREEN_CONTINUITY_OMEGA"] = _engine(
        "GREEN_CONTINUITY_OMEGA",
        "GREEN Continuity Ω",
        "QUARANTINE",
        "Provider quorum is mandatory. The mobile backend has not yet collected 1W/1M/3M/1Y/TOTAL raw regular-session closes from >=3 synchronized providers, so no GREEN score is fabricated.",
        provenance=["GREEN_PROVIDER_QUORUM_OMEGA_V1_0"],
    )
    engines["GREEN_PULSE_OMEGA"] = _engine(
        "GREEN_PULSE_OMEGA",
        "GREEN Pulse / Breadth / Relative Green Ω",
        "INSUFFICIENT_DATA",
        "Daily pulse, breadth and relative-green evidence are not yet certified in this audit packet.",
    )

    economic_evidence: list[str] = []
    if revenue is not None:
        economic_evidence.append("revenue field present from configured quantitative provider")
    if fcf is not None:
        economic_evidence.append("free-cash-flow field present from configured quantitative provider")
    economic_state: EngineState = "PARTIAL" if economic_evidence else "INSUFFICIENT_DATA"
    engines["ECONOMIC_PROOF_OMEGA"] = _engine(
        "ECONOMIC_PROOF_OMEGA",
        "Economic Proof Ω",
        economic_state,
        "Quantitative company fields are available, but a full demand -> capture -> conversion -> FCF/ROIC chain requires primary/traceable evidence before PASS.",
        evidence=economic_evidence,
        provenance=[provider],
    )

    valuation_evidence: list[str] = []
    if price is not None:
        valuation_evidence.append("price available")
    if market_cap is not None:
        valuation_evidence.append("market-cap available")
    if pe is not None:
        valuation_evidence.append("P/E available")
    engines["VALUATION_IMPLIED_RETURN_OMEGA"] = _engine(
        "VALUATION_IMPLIED_RETURN_OMEGA",
        "Valuation / Implied Return Ω",
        "PARTIAL" if valuation_evidence else "INSUFFICIENT_DATA",
        "Observed valuation fields do not by themselves establish normalized earnings, reverse expectations or Expected Return Ω.",
        evidence=valuation_evidence,
        provenance=[provider],
    )

    if mapped_capex:
        engines["GLOBAL_CAPEX_CHAIN_OMEGA"] = _engine(
            "GLOBAL_CAPEX_CHAIN_OMEGA",
            "Global CAPEX Chain Ω",
            "PARTIAL",
            f"Structural taxonomy mapped: EDD-{mapped_capex['edd']} · {mapped_capex['role']}. E2+ economic evidence and scores remain required.",
            evidence=[f"rivers: {', '.join(mapped_capex['rivers'])}"],
            provenance=["GLOBAL_CAPEX_CHAIN_OMEGA_V1 structural map"],
        )
    else:
        engines["GLOBAL_CAPEX_CHAIN_OMEGA"] = _engine(
            "GLOBAL_CAPEX_CHAIN_OMEGA",
            "Global CAPEX Chain Ω",
            "INSUFFICIENT_DATA",
            "Ticker has no certified structural CAPEX mapping; research is required rather than inventing a role.",
        )

    engines["CAPEX_PRODUCTIVITY_OMEGA"] = _engine(
        "CAPEX_PRODUCTIVITY_OMEGA",
        "CAPEX Productivity Ω",
        "INSUFFICIENT_DATA",
        "Incremental CAPEX -> incremental profit/FCF/ROIC evidence is not present in the current packet.",
    )
    engines["MOAT_PERSISTENCE_OMEGA"] = _engine(
        "MOAT_PERSISTENCE_OMEGA",
        "Moat / Persistence Ω",
        "INSUFFICIENT_DATA",
        "No durable-control-point evidence packet has been evaluated in this mobile run.",
    )
    engines["INSTITUTIONAL_ROTATION_OMEGA"] = _engine(
        "INSTITUTIONAL_ROTATION_OMEGA",
        "Institutional Capital Rotation Ω",
        "NO_SIGNAL",
        "No verified ticker-specific institutional-flow packet is attached; price or volume alone cannot substitute for flow.",
    )
    engines["MACRO_REGIME_OMEGA"] = _engine(
        "MACRO_REGIME_OMEGA",
        "Macro / Regime Ω",
        "INSUFFICIENT_DATA",
        "Current macro compatibility is not bundled into this ticker request yet.",
    )
    engines["DEFENSIVE_OMEGA"] = _engine(
        "DEFENSIVE_OMEGA",
        "Defensive Ω",
        "INSUFFICIENT_DATA",
        "Defensive Ω is transversal and must run on every ticker; the current packet lacks the full resilience inputs.",
    )
    engines["AI_CAPEX_PAYBACK_OMEGA"] = _engine(
        "AI_CAPEX_PAYBACK_OMEGA",
        "AI CAPEX Payback Ω",
        "INSUFFICIENT_DATA" if software else "NOT_APPLICABLE",
        "AI payback requires explicit AI CAPEX and incremental economic capture evidence." if software else "No evidence in this packet establishes this ticker as an AI CAPEX allocator requiring the specialist payback path.",
    )
    engines["CREDIT_TRANSMISSION_OMEGA"] = _engine(
        "CREDIT_TRANSMISSION_OMEGA",
        "Credit Transmission / AI Financial Fragility Ω",
        "INSUFFICIENT_DATA",
        "Debt, refinancing, duration and transmission inputs are not complete in this packet.",
    )
    engines["SUCCESSOR_DETECTION_OMEGA"] = _engine(
        "SUCCESSOR_DETECTION_OMEGA",
        "Successor Detection Ω",
        "NO_SIGNAL",
        "No verified successor/substitution event is attached to this run.",
    )
    engines["CLINICAL_EVIDENCE_SHOCK_OMEGA"] = _engine(
        "CLINICAL_EVIDENCE_SHOCK_OMEGA",
        "Clinical Evidence Shock Ω",
        "INSUFFICIENT_DATA" if healthcare else "NOT_APPLICABLE",
        "Healthcare ticker: trial/regulatory evidence must be ingested before scoring." if healthcare else "No healthcare/clinical applicability established from company classification.",
    )
    engines["AI_TOLLBOOTH_OMEGA"] = _engine(
        "AI_TOLLBOOTH_OMEGA",
        "AI Tollbooth Ω",
        "INSUFFICIENT_DATA" if software else "NOT_APPLICABLE",
        "Recurring AI-usage monetization evidence is not complete." if software else "No AI tollbooth applicability established from the current packet.",
    )
    engines["DEVELOPER_ACTIVITY_LEADING_INDICATOR_OMEGA"] = _engine(
        "DEVELOPER_ACTIVITY_LEADING_INDICATOR_OMEGA",
        "Developer Activity Leading Indicator Ω",
        "INSUFFICIENT_DATA" if software else "NOT_APPLICABLE",
        "Package/API/project activity is a leading indicator only and is not present in this packet." if software else "Developer-activity specialist path is not applicable from current company classification.",
    )
    engines["HUMAN_CAPITAL_ALIGNMENT_OMEGA"] = _engine(
        "HUMAN_CAPITAL_ALIGNMENT_OMEGA",
        "Human Capital Alignment Ω",
        "INSUFFICIENT_DATA",
        "Hiring, specialist labor and productivity evidence has not been evaluated in this run.",
    )
    engines["CUSTOMER_ACCEPTANCE_GATE_OMEGA"] = _engine(
        "CUSTOMER_ACCEPTANCE_GATE_OMEGA",
        "Customer Acceptance Gate Ω",
        "NO_SIGNAL",
        "No deployment/acceptance/revenue-recognition chain requiring this gate is attached to the packet.",
    )
    engines["FALSIFIERS_OMEGA"] = _engine(
        "FALSIFIERS_OMEGA",
        "Falsifiers Ω",
        "INSUFFICIENT_DATA",
        "Absence of a detected falsifier is not proof of zero falsifiers. Independent adversarial evidence is required before PASS.",
    )

    source_status = company.get("sourceStatus") if isinstance(company.get("sourceStatus"), dict) else {}
    unavailable = [name for name, state in source_status.items() if not str(state).startswith("OK")]
    evidence_state: EngineState = "PARTIAL" if company else "INSUFFICIENT_DATA"
    evidence_detail = "Quantitative provider packet loaded with provenance; primary-source completion is still required for thesis-changing claims."
    if unavailable:
        evidence_detail += f" Unavailable provider sections: {', '.join(unavailable)}."
    engines["EVIDENCE_DIRECTOR_OMEGA"] = _engine(
        "EVIDENCE_DIRECTOR_OMEGA",
        "Evidence Director Ω",
        evidence_state,
        evidence_detail,
        provenance=[provider],
    )

    ledger = [engines[engine_id] for engine_id, _ in ENGINE_ORDER]
    contradictions: list[str] = []
    if mapped_capex and economic_state != "PASS":
        contradictions.append("Structural CAPEX position is mapped while Economic Proof remains incomplete; taxonomy must not be promoted into a BUY thesis.")
    if valuation_evidence and economic_state != "PASS":
        contradictions.append("Valuation fields are visible before normalized Economic Proof is complete; cheap/expensive labels remain premature.")
    return ledger, contradictions


def _committee_decision(engines: list[dict[str, Any]]) -> dict[str, Any]:
    by_id = {row["engineId"]: row for row in engines}
    falsifier = by_id.get("FALSIFIERS_OMEGA", {})
    if falsifier.get("state") == "FAIL":
        return {
            "recommendation": "REJECT",
            "action": "NO BUY · FALSIFIER VETO",
            "executionState": "BLOCKED",
            "confidence": "HIGH",
            "reason": "Falsifiers Ω exercised its independent veto.",
        }

    unresolved = [
        engine_id
        for engine_id in CRITICAL_ENGINE_IDS
        if by_id.get(engine_id, {}).get("state") in {"INSUFFICIENT_DATA", "QUARANTINE", "PARTIAL", "NO_SIGNAL"}
    ]
    if unresolved:
        return {
            "recommendation": "PENDING",
            "action": "NO BUY · DATA GATE",
            "executionState": "BLOCKED",
            "confidence": "LOW",
            "reason": f"Investment Committee Ω cannot issue BUY/HOLD/WATCH/REJECT until critical engines are resolved: {', '.join(unresolved)}.",
        }

    return {
        "recommendation": "PENDING",
        "action": "NO BUY · COMMITTEE GATE",
        "executionState": "BLOCKED",
        "confidence": "LOW",
        "reason": "No fabricated recommendation is allowed. Full committee integration must explicitly resolve the evidence packet.",
    }


async def _company_bundle(symbol: str) -> dict[str, Any]:
    if FDN_API_KEY:
        try:
            return await _fdn_company_bundle(symbol)
        except HTTPException as exc:
            if exc.status_code not in {429, 502, 503}:
                raise
            fallback = await _finnhub_company_bundle(symbol)
            fallback["fallbackReason"] = f"FinancialData.Net unavailable: HTTP {exc.status_code}"
            return fallback
    return await _finnhub_company_bundle(symbol)


@router.get("/{ticker}")
async def mobile_full_audit(ticker: str) -> dict[str, Any]:
    symbol = _symbol(ticker)
    company = await _company_bundle(symbol)
    engines, contradictions = _build_engine_ledger(symbol, company)
    decision = _committee_decision(engines)
    return {
        "ticker": symbol,
        "asOf": datetime.now(timezone.utc).isoformat(),
        "protocol": "ATLAS_OMEGA_MOBILE_FULL_AUDIT_V2",
        "engineOrderRule": "GREEN_FIRST_THEN_FULL_TRANSVERSAL_SWEEP",
        "company": company,
        "engines": engines,
        "contradictions": contradictions,
        "decision": decision,
        "guardrails": [
            "Every registered engine remains visible even when its state is NO_SIGNAL, NOT_APPLICABLE, INSUFFICIENT_DATA or QUARANTINE.",
            "GREEN is first but is not an automatic rejection gate; 3/5, 4/5 and 5/5 may all remain opportunity-eligible when the rest of the audit is strong.",
            "Only Investment Committee Ω issues the final recommendation. Falsifiers Ω retains independent veto authority.",
            "The UI must display unresolved evidence as gates rather than fabricate professional-looking scores.",
        ],
    }
