"""ATLAS Ω portfolio finalizer.

Clean Point-Zero finalization never compares a challenger with an incumbent.
Classification is based on current evidence only. Legacy replacement hysteresis
is retained solely as an explicitly downstream execution diagnostic.
"""
from dataclasses import dataclass
from enum import Enum
from typing import Iterable, Optional

ATLAS_SCORE_SCALE = 1000.0
FINALIZER_SCORE_SCALE = 100.0
LEGACY_EXECUTION_ATLAS_HURDLE_POINTS = 50.0
LEGACY_EXECUTION_EXPECTED_CAGR_HURDLE_PP = 3.0


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
        return FinalDecision(candidate.ticker, GreenTier.REJECT, False, "fundamental falsifier")
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
    """Compatibility API that deliberately has zero clean-selection authority."""
    return False, "POINT_ZERO_CLEAN_SELECTION_FORBIDS_INCUMBENT_REPLACEMENT_HURDLE"


def legacy_execution_replacement_diagnostic(
    incumbent: FinalCandidate,
    challenger: FinalCandidate,
) -> tuple[bool, str]:
    """Downstream transition diagnostic after clean desired portfolio is frozen."""
    c = classify(challenger)
    if incumbent.falsifier:
        return c.executable, "incumbent falsified; execution diagnostic only"
    if not c.executable:
        return False, f"challenger execution blocked: {c.reason}"
    if challenger.normalized_expected_cagr is None or incumbent.normalized_expected_cagr is None:
        return False, "missing normalized Expected CAGR"

    cagr_edge = challenger.normalized_expected_cagr - incumbent.normalized_expected_cagr
    internal_score_edge = challenger.omega_score - incumbent.omega_score
    atlas_score_edge_points = internal_score_edge * ATLAS_SCORE_SCALE / FINALIZER_SCORE_SCALE
    ok = (
        cagr_edge >= LEGACY_EXECUTION_EXPECTED_CAGR_HURDLE_PP
        or atlas_score_edge_points >= LEGACY_EXECUTION_ATLAS_HURDLE_POINTS
    )
    return ok, (
        "EXECUTION_DIAGNOSTIC_ONLY: "
        f"CAGR edge {cagr_edge:.2f}pp, ATLAS edge {atlas_score_edge_points:.1f} points"
    )


def finalize(candidates: Iterable[FinalCandidate]) -> list[FinalDecision]:
    return [classify(c) for c in candidates]


CANONICAL_FINALIZER_LAWS = (
    "CURRENT FCF != NORMALIZED FCF",
    "BUSINESS QUALITY != EXPECTED RETURN",
    "PRICE MOMENTUM != CAPITAL CAUSALITY",
    "POSITIONING T-1 != CURRENT FLOW",
    "GREEN FUNDAMENTALS != EXECUTABLE BUY",
    "INCUMBENCY HAS ZERO CLEAN-SELECTION AUTHORITY",
    "LEGACY REPLACEMENT HURDLES ARE EXECUTION DIAGNOSTICS ONLY",
    "MISSING EVIDENCE => NO EXECUTION",
)
