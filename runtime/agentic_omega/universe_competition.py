"""ATLAS Ω — Full-universe Competition for Capital.

Point-Zero clean selection ignores incumbency, broker ownership and legacy
replacement hurdles. Missing evidence fails closed. Execution availability is
reported separately and cannot change clean ranking.
"""
from dataclasses import dataclass
from typing import Iterable, Optional
from .capital_competition import Candidate, rank_candidate


@dataclass(frozen=True)
class UniverseCandidate(Candidate):
    sector: str = "UNKNOWN"
    normalized_expected_cagr: Optional[float] = None
    valuation_confidence: float = 0.0
    market_data_age_hours: Optional[float] = None
    trading212_available: Optional[bool] = None
    event_gate: bool = False
    structural_falsifier: bool = False


def audit_candidate(x: UniverseCandidate) -> dict:
    base = rank_candidate(x)
    reasons = []
    selection_eligible = True
    if x.structural_falsifier:
        selection_eligible = False; reasons.append("STRUCTURAL_FALSIFIER")
    if x.normalized_expected_cagr is None:
        selection_eligible = False; reasons.append("MISSING_NORMALIZED_EXPECTED_CAGR")
    if x.valuation_confidence < 60:
        selection_eligible = False; reasons.append("LOW_VALUATION_CONFIDENCE")
    if x.market_data_age_hours is None or x.market_data_age_hours > 24:
        selection_eligible = False; reasons.append("STALE_OR_MISSING_MARKET_DATA")

    # Execution-state facts are not clean membership gates.
    execution_reasons = []
    if x.event_gate:
        execution_reasons.append("EVENT_GATE")
    if x.trading212_available is not True:
        execution_reasons.append("TRADING212_UNVERIFIED_OR_UNAVAILABLE")

    base.update({
        "sector": x.sector,
        "normalized_expected_cagr": x.normalized_expected_cagr,
        "selection_eligible": selection_eligible,
        "selection_gate_reasons": tuple(reasons),
        "execution_eligible": selection_eligible and not execution_reasons,
        "execution_gate_reasons": tuple(execution_reasons),
        "trading212_available": x.trading212_available,
        "incumbent_state_consumed": False,
        "replacement_of": None,
        "clears_replacement_hurdle": False,
        "replacement_hurdle_authority": "NONE_IN_POINT_ZERO_CLEAN_SELECTION",
    })
    return base


def full_universe_competition(
    candidates: Iterable[UniverseCandidate],
    er_hurdle_pp: float | None = None,
    atlas_score_hurdle_points: float | None = None,
):
    """Rank clean candidates across the full universe.

    Legacy hurdle arguments are accepted for call compatibility but ignored.
    The function has no incumbent/replacement authority. Real transition
    hysteresis belongs after the clean desired portfolio has been frozen.
    """
    rows = [audit_candidate(c) for c in candidates]
    return sorted(rows, key=lambda r: r["adjusted_score"], reverse=True)


def green_time_in_portfolio(rows):
    """Compatibility helper; time held never changes clean ranking."""
    return [r for r in rows if r.get("execution_eligible") and r["state"] == "PORTFOLIO_GREEN"]
