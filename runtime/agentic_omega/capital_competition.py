"""ATLAS Ω — cross-sector Competition for Capital ranking."""
from dataclasses import dataclass
from .earnings_flow_confirmation import portfolio_green, portfolio_state


@dataclass(frozen=True)
class Candidate:
    ticker: str
    fundamental_quality: float
    expected_return: float
    market_validation: float
    regime_compatibility: float
    normalized_economics: float = 100.0
    evidence_completeness: float = 100.0
    incumbent: bool = False


def rank_candidate(x: Candidate) -> dict:
    green = portfolio_green(x.fundamental_quality, x.expected_return,
                            x.market_validation, x.regime_compatibility)
    # Normalization and evidence are gates, not bonuses.
    adjusted = green * min(x.normalized_economics, x.evidence_completeness)/100.0
    state = portfolio_state(adjusted, x.market_validation)
    if x.evidence_completeness < 60:
        state = "INSUFFICIENT_EVIDENCE"
    return {"ticker": x.ticker, "portfolio_green": green,
            "adjusted_score": adjusted, "state": state}


def competition_for_capital(candidates, replacement_hurdle_points: float = 5.0):
    ranked = sorted((rank_candidate(c) for c in candidates),
                    key=lambda r: r["adjusted_score"], reverse=True)
    incumbents = {c.ticker for c in candidates if c.incumbent}
    incumbent_scores = [r["adjusted_score"] for r in ranked if r["ticker"] in incumbents]
    weakest = min(incumbent_scores) if incumbent_scores else None
    for r in ranked:
        r["clears_replacement_hurdle"] = (
            weakest is not None and r["ticker"] not in incumbents
            and r["adjusted_score"] >= weakest + replacement_hurdle_points
        )
    return ranked
