"""ATLAS Ω — Full-universe Competition for Capital.

Designed for heterogeneous equity universes. Missing evidence fails closed.
No score is allowed to manufacture live market data or forward valuation.
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
    base.update({"sector": x.sector, "normalized_expected_cagr": x.normalized_expected_cagr,
                 "executable": executable, "gate_reasons": tuple(reasons)})
    return base


def full_universe_competition(candidates: Iterable[UniverseCandidate],
                              er_hurdle_pp: float = 3.0,
                              score_hurdle: float = 5.0):
    """Rank, then permit replacement only with score AND ER evidence.

    Canon: generally require >=3pp normalized Expected CAGR OR >=5 score points,
    but never bypass evidence/event/staleness gates.
    """
    cs = list(candidates)
    rows = [audit_candidate(c) for c in cs]
    incumbents = {c.ticker for c in cs if c.incumbent}
    inc_rows = [r for r in rows if r["ticker"] in incumbents and r["executable"]]
    weakest = min(inc_rows, key=lambda r: r["adjusted_score"], default=None)
    for r in rows:
        r["replacement_of"] = None
        r["clears_replacement_hurdle"] = False
        if not weakest or not r["executable"] or r["ticker"] in incumbents:
            continue
        score_edge = r["adjusted_score"] - weakest["adjusted_score"]
        er_edge = r["normalized_expected_cagr"] - weakest["normalized_expected_cagr"]
        if score_edge >= score_hurdle or er_edge >= er_hurdle_pp:
            r["clears_replacement_hurdle"] = True
            r["replacement_of"] = weakest["ticker"]
    return sorted(rows, key=lambda r: r["adjusted_score"], reverse=True)


def green_time_in_portfolio(rows):
    """Only evidence-complete, executable Portfolio Greens qualify."""
    return [r for r in rows if r["executable"] and r["state"] == "PORTFOLIO_GREEN"]
