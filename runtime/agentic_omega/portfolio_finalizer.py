"""ATLAS Ω portfolio finalizer.

Converts audited universe candidates into durable GREEN tiers and executable
replacement decisions. Fail-closed by design: stale/incomplete/event-gated
candidates cannot displace an incumbent.

Canonical replacement hurdle: >=50 ATLAS Ω points on the 0–1000 scale OR
>=3 percentage points of normalized Expected CAGR. FinalCandidate.omega_score is
stored on the internal 0–100 scale, so 50 ATLAS points == 5 internal score points.
"""
from dataclasses import dataclass
from enum import Enum
from typing import Iterable, Optional

ATLAS_SCORE_SCALE = 1000.0
FINALIZER_SCORE_SCALE = 100.0
DEFAULT_ATLAS_REPLACEMENT_HURDLE_POINTS = 50.0
DEFAULT_EXPECTED_CAGR_HURDLE_PP = 3.0


class GreenTier(str, Enum):
    CORE = "CORE_GREEN"
    CYCLICAL = "CYCLICAL_GREEN"
    EVENT = "EVENT_GREEN"
    SPECULATIVE = "SPECULATIVE_GREEN"
    WATCH = "WATCH"
    REJECT = "REJECT"


@dataclass(frozen=True)
class FinalCandidate:
    ticker: str
    normalized_expected_cagr: Optional[float]
    omega_score: float
    economic_proof: float
    evidence_completeness: float
    market_validation: float
    valuation_confidence: float
    data_age_hours: float
    cyclical: bool = False
    event_gate: bool = False
    speculative: bool = False
    falsifier: bool = False


@dataclass(frozen=True)
class FinalDecision:
    ticker: str
    tier: GreenTier
    executable: bool
    reason: str


def classify(candidate: FinalCandidate) -> FinalDecision:
    if candidate.falsifier:
        return FinalDecision(candidate.ticker, GreenTier.REJECT, True, "fundamental falsifier")
    if candidate.data_age_hours > 24:
        return FinalDecision(candidate.ticker, GreenTier.WATCH, False, "stale market data")
    if candidate.normalized_expected_cagr is None or candidate.valuation_confidence < 60:
        return FinalDecision(candidate.ticker, GreenTier.WATCH, False, "valuation/ER incomplete")
    if candidate.evidence_completeness < 70 or candidate.economic_proof < 60:
        return FinalDecision(candidate.ticker, GreenTier.WATCH, False, "evidence/economic proof incomplete")
    if candidate.event_gate:
        return FinalDecision(candidate.ticker, GreenTier.EVENT, False, "material event gate")
    if candidate.speculative:
        return FinalDecision(candidate.ticker, GreenTier.SPECULATIVE, candidate.omega_score >= 80, "high optionality/high uncertainty")
    if candidate.cyclical:
        ok = candidate.omega_score >= 80 and candidate.market_validation >= 60
        return FinalDecision(candidate.ticker, GreenTier.CYCLICAL if ok else GreenTier.WATCH, ok, "normalized cyclical economics")
    ok = candidate.omega_score >= 82 and candidate.market_validation >= 60
    return FinalDecision(candidate.ticker, GreenTier.CORE if ok else GreenTier.WATCH, ok, "durable normalized economics")


def replacement_allowed(incumbent: FinalCandidate, challenger: FinalCandidate) -> tuple[bool, str]:
    c = classify(challenger)
    if incumbent.falsifier:
        return c.executable, "incumbent falsified"
    if not c.executable:
        return False, f"challenger blocked: {c.reason}"
    if challenger.normalized_expected_cagr is None or incumbent.normalized_expected_cagr is None:
        return False, "missing normalized Expected CAGR"

    cagr_edge = challenger.normalized_expected_cagr - incumbent.normalized_expected_cagr
    internal_score_edge = challenger.omega_score - incumbent.omega_score
    atlas_score_edge_points = internal_score_edge * ATLAS_SCORE_SCALE / FINALIZER_SCORE_SCALE

    if cagr_edge >= DEFAULT_EXPECTED_CAGR_HURDLE_PP or atlas_score_edge_points >= DEFAULT_ATLAS_REPLACEMENT_HURDLE_POINTS:
        return True, (
            f"replacement hurdle passed: CAGR edge {cagr_edge:.2f}pp, "
            f"ATLAS edge {atlas_score_edge_points:.1f} points"
        )
    return False, (
        f"replacement hurdle failed: CAGR edge {cagr_edge:.2f}pp, "
        f"ATLAS edge {atlas_score_edge_points:.1f} points"
    )


def finalize(candidates: Iterable[FinalCandidate]) -> list[FinalDecision]:
    return [classify(c) for c in candidates]


CANONICAL_FINALIZER_LAWS = (
    "CURRENT FCF != NORMALIZED FCF",
    "BUSINESS QUALITY != EXPECTED RETURN",
    "PRICE MOMENTUM != CAPITAL CAUSALITY",
    "POSITIONING T-1 != CURRENT FLOW",
    "GREEN FUNDAMENTALS != EXECUTABLE BUY",
    "CHALLENGER QUALITY != REPLACEMENT",
    "REPLACEMENT REQUIRES >=50 ATLAS OMEGA POINTS OR ~3PP EXPECTED CAGR EDGE",
    "MISSING EVIDENCE => NO EXECUTION",
)
