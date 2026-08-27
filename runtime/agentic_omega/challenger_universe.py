from __future__ import annotations

from dataclasses import dataclass
from enum import Enum


class ChallengerLayer(str, Enum):
    AGENTIC_SOFTWARE = "AGENTIC_SOFTWARE"
    DATA_STATE = "DATA_STATE"
    OBSERVABILITY = "OBSERVABILITY"
    IDENTITY_SECURITY = "IDENTITY_SECURITY"
    FRONTIER_CYBER = "FRONTIER_CYBER"
    EDGE_AI = "EDGE_AI"
    AI_NETWORKING_OPTICAL = "AI_NETWORKING_OPTICAL"
    AI_INFRASTRUCTURE = "AI_INFRASTRUCTURE"
    POST_QUANTUM = "POST_QUANTUM"


@dataclass(frozen=True)
class ChallengerSpec:
    ticker: str
    layer: ChallengerLayer
    watch_status: str
    pure_play_quantum: bool = False
    trading212_required: bool = True


CANONICAL_CHALLENGERS = (
    ChallengerSpec("PEGA", ChallengerLayer.AGENTIC_SOFTWARE, "WATCH"),
    ChallengerSpec("JBL", ChallengerLayer.AI_INFRASTRUCTURE, "DEEP_AUDIT"),
    ChallengerSpec("CLS", ChallengerLayer.AI_INFRASTRUCTURE, "WATCH"),
    ChallengerSpec("PATH", ChallengerLayer.AGENTIC_SOFTWARE, "WATCH"),
    ChallengerSpec("OKTA", ChallengerLayer.IDENTITY_SECURITY, "DEEP_AUDIT"),
    ChallengerSpec("S", ChallengerLayer.FRONTIER_CYBER, "WATCH"),
    ChallengerSpec("RBRK", ChallengerLayer.FRONTIER_CYBER, "DEEP_AUDIT"),
    ChallengerSpec("FN", ChallengerLayer.AI_NETWORKING_OPTICAL, "WATCH"),
    ChallengerSpec("TWLO", ChallengerLayer.AGENTIC_SOFTWARE, "DEEP_AUDIT"),
    ChallengerSpec("CRDO", ChallengerLayer.AI_NETWORKING_OPTICAL, "ACTIVE_COMPETITION"),
    ChallengerSpec("ALAB", ChallengerLayer.AI_INFRASTRUCTURE, "WATCH"),
    ChallengerSpec("COHR", ChallengerLayer.AI_NETWORKING_OPTICAL, "ACTIVE_COMPETITION"),
    ChallengerSpec("DDOG", ChallengerLayer.OBSERVABILITY, "DEEP_AUDIT"),
    ChallengerSpec("NET", ChallengerLayer.AI_INFRASTRUCTURE, "WATCH"),
    ChallengerSpec("LITE", ChallengerLayer.AI_NETWORKING_OPTICAL, "ACTIVE_COMPETITION"),
    ChallengerSpec("CIEN", ChallengerLayer.AI_NETWORKING_OPTICAL, "WATCH"),
    ChallengerSpec("QCOM", ChallengerLayer.EDGE_AI, "DEEP_AUDIT"),
    ChallengerSpec("CHKP", ChallengerLayer.FRONTIER_CYBER, "DEEP_AUDIT"),
    ChallengerSpec("MDB", ChallengerLayer.DATA_STATE, "DEEP_AUDIT"),
    ChallengerSpec("SMTC", ChallengerLayer.AI_NETWORKING_OPTICAL, "ACTIVE_COMPETITION"),
    ChallengerSpec("MRVL", ChallengerLayer.AI_NETWORKING_OPTICAL, "ACTIVE_COMPETITION"),
    ChallengerSpec("IONQ", ChallengerLayer.POST_QUANTUM, "WATCH_ONLY_OWNER_ECONOMICS_REQUIRED", True),
    ChallengerSpec("RGTI", ChallengerLayer.POST_QUANTUM, "WATCH_ONLY_OWNER_ECONOMICS_REQUIRED", True),
    ChallengerSpec("QBTS", ChallengerLayer.POST_QUANTUM, "WATCH_ONLY_OWNER_ECONOMICS_REQUIRED", True),
)


@dataclass(frozen=True)
class ChallengerPromotionInput:
    spec: ChallengerSpec
    trading212_available: bool
    economic_proof: bool
    owner_economics_proven: bool
    dilution_controlled: bool
    valuation_supportable: bool
    atlas_score_edge_points: float
    expected_cagr_edge_pp: float


@dataclass(frozen=True)
class ChallengerPromotionResult:
    ticker: str
    eligible_for_active_competition: bool
    clears_replacement_hurdle: bool
    portfolio_action_allowed: bool
    reasons: tuple[str, ...]


def evaluate_challenger_promotion(data: ChallengerPromotionInput) -> ChallengerPromotionResult:
    reasons: list[str] = []

    if data.spec.trading212_required and not data.trading212_available:
        reasons.append("TRADING212_UNAVAILABLE")
    if not data.economic_proof:
        reasons.append("ECONOMIC_PROOF_MISSING")
    if not data.valuation_supportable:
        reasons.append("VALUATION_UNSUPPORTABLE")

    if data.spec.pure_play_quantum:
        if not data.owner_economics_proven:
            reasons.append("QUANTUM_OWNER_ECONOMICS_MISSING")
        if not data.dilution_controlled:
            reasons.append("QUANTUM_DILUTION_NOT_CONTROLLED")
    elif not data.owner_economics_proven:
        reasons.append("OWNER_ECONOMICS_MISSING")

    eligible = not reasons
    hurdle = data.atlas_score_edge_points >= 50.0 or data.expected_cagr_edge_pp >= 3.0
    if eligible and not hurdle:
        reasons.append("REPLACEMENT_HURDLE_NOT_CLEARED")

    clears = eligible and hurdle
    return ChallengerPromotionResult(
        data.spec.ticker,
        eligible,
        clears,
        False,
        tuple(reasons),
    )


def challenger_by_ticker(ticker: str) -> ChallengerSpec | None:
    key = ticker.upper()
    return next((x for x in CANONICAL_CHALLENGERS if x.ticker == key), None)


CHALLENGER_CANONICAL_LAWS = (
    "DISCOVERY != PROMOTION",
    "TRADING212 UNAVAILABLE => NO EXECUTION",
    "BUSINESS QUALITY != REPLACEMENT",
    "REPLACEMENT REQUIRES >=50 ATLAS OMEGA POINTS OR ~3PP EXPECTED CAGR EDGE",
    "PQC URGENCY != QUANTUM PURE-PLAY OWNER ECONOMICS",
    "PURE-PLAY QUANTUM REQUIRES OWNER ECONOMICS + DILUTION CONTROL + SUPPORTABLE VALUATION",
)
