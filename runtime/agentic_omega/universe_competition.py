"""ATLAS Ω — Full-universe Competition for Capital.

Designed for heterogeneous equity universes. Missing evidence fails closed.
No score is allowed to manufacture live market data or forward valuation.
Canonical replacement hurdle: >=50 ATLAS Ω points on the 0–1000 scale OR
~3 percentage points of normalized Expected CAGR versus the incumbent.
"""
from dataclasses import dataclass
from typing import Iterable, Optional
from .capital_competition import Candidate, rank_candidate

ATLAS_SCORE_SCALE = 1000.0
PORTFOLIO_GREEN_SCORE_SCALE = 100.0
DEFAULT_ATLAS_REPLACEMENT_HURDLE_POINTS = 50.0
DEFAULT_EXPECTED_CAGR_HURDLE_PP = 3.0


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
    executable = True
    if x.structural_falsifier:
        executable = False; reasons.append("STRUCTURAL_FALSIFIER")
    if x.event_gate:
        executable = False; reasons.append("EVENT_GATE")
    if x.normalized_expected_cagr is None:
        executable = False; reasons.append("MISSING_NORMALIZED_EXPECTED_CAGR")
    if x.valuation_confidence < 60:
        executable = False; reasons.append("LOW_VALUATION_CONFIDENCE")
    if x.market_data_age_hours is None or x.market_data_age_hours > 24:
        executable = False; reasons.append("STALE_OR_MISSING_MARKET_DATA")
    if x.trading212_available is not True:
        executable = False; reasons.append("TRADING212_UNVERIFIED_OR_UNAVAILABLE")
    base.update({
        "sector": x.sector,
        "normalized_expected_cagr": x.normalized_expected_cagr,
        "trading212_available": x.trading212_available,
        "executable": executable,
        "gate_reasons": tuple(reasons),
    })
    return base


def _atlas_points_to_adjusted_score(points: float) -> float:
    if points < 0:
        raise ValueError("score hurdle cannot be negative")
    return points * PORTFOLIO_GREEN_SCORE_SCALE / ATLAS_SCORE_SCALE


def full_universe_competition(
    candidates: Iterable[UniverseCandidate],
    er_hurdle_pp: float = DEFAULT_EXPECTED_CAGR_HURDLE_PP,
    atlas_score_hurdle_points: float = DEFAULT_ATLAS_REPLACEMENT_HURDLE_POINTS,
):
    """Rank, then permit replacement only after evidence/execution gates.

    Replacement requires either >=50 ATLAS Ω points (0–1000 scale; equivalent to
    5 points on the internal 0–100 adjusted Portfolio Green scale) OR >=3pp of
    normalized Expected CAGR. Neither route bypasses evidence, event, freshness,
    valuation or Trading 212 gates.
    """
    if er_hurdle_pp < 0:
        raise ValueError("Expected CAGR hurdle cannot be negative")
    score_hurdle = _atlas_points_to_adjusted_score(atlas_score_hurdle_points)

    cs = list(candidates)
    rows = [audit_candidate(c) for c in cs]
    incumbents = {c.ticker for c in cs if c.incumbent}
    inc_rows = [r for r in rows if r["ticker"] in incumbents and r["executable"]]
    weakest = min(inc_rows, key=lambda r: r["adjusted_score"], default=None)
    for r in rows:
        r["replacement_of"] = None
        r["clears_replacement_hurdle"] = False
        r["atlas_score_edge_points"] = None
        r["expected_cagr_edge_pp"] = None
        if not weakest or not r["executable"] or r["ticker"] in incumbents:
            continue
        score_edge = r["adjusted_score"] - weakest["adjusted_score"]
        atlas_edge = score_edge * ATLAS_SCORE_SCALE / PORTFOLIO_GREEN_SCORE_SCALE
        er_edge = r["normalized_expected_cagr"] - weakest["normalized_expected_cagr"]
        r["atlas_score_edge_points"] = atlas_edge
        r["expected_cagr_edge_pp"] = er_edge
        if score_edge >= score_hurdle or er_edge >= er_hurdle_pp:
            r["clears_replacement_hurdle"] = True
            r["replacement_of"] = weakest["ticker"]
    return sorted(rows, key=lambda r: r["adjusted_score"], reverse=True)


def green_time_in_portfolio(rows):
    """Only evidence-complete, executable Portfolio Greens qualify."""
    return [r for r in rows if r["executable"] and r["state"] == "PORTFOLIO_GREEN"]
