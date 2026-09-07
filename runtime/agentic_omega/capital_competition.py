"""ATLAS Ω — cross-sector Competition for Capital ranking.

Clean-selection default: incumbent state is ignored. Any legacy replacement
hysteresis belongs downstream to execution and cannot alter Point-Zero ranking.
"""
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
    # Compatibility field only. Clean ranking MUST ignore it.
    incumbent: bool = False


def rank_candidate(x: Candidate) -> dict:
    green = portfolio_green(x.fundamental_quality, x.expected_return,
                            x.market_validation, x.regime_compatibility)
    adjusted = green * min(x.normalized_economics, x.evidence_completeness)/100.0
    state = portfolio_state(adjusted, x.market_validation)
    if x.evidence_completeness < 60:
        state = "INSUFFICIENT_EVIDENCE"
    return {
        "ticker": x.ticker,
        "portfolio_green": green,
        "adjusted_score": adjusted,
        "state": state,
        "point_zero_clean": True,
        "incumbent_state_consumed": False,
    }


def competition_for_capital(candidates, replacement_hurdle_points: float | None = None):
    """Return clean cross-sector ranking without incumbent/replacement authority.

    ``replacement_hurdle_points`` is accepted only for backward call compatibility
    and is deliberately ignored. A caller that needs transition hysteresis must use
    a downstream execution diagnostic after the clean desired portfolio is frozen.
    """
    ranked = sorted((rank_candidate(c) for c in candidates),
                    key=lambda r: r["adjusted_score"], reverse=True)
    for r in ranked:
        r["clears_replacement_hurdle"] = False
        r["replacement_hurdle_authority"] = "NONE_IN_POINT_ZERO_CLEAN_SELECTION"
    return ranked


def legacy_execution_replacement_diagnostic(
    candidates,
    replacement_hurdle_points: float = 5.0,
):
    """Downstream compatibility diagnostic; never a clean-selection function."""
    ranked = sorted((rank_candidate(c) for c in candidates),
                    key=lambda r: r["adjusted_score"], reverse=True)
    incumbents = {c.ticker for c in candidates if c.incumbent}
    incumbent_scores = [r["adjusted_score"] for r in ranked if r["ticker"] in incumbents]
    weakest = min(incumbent_scores) if incumbent_scores else None
    for r in ranked:
        r["execution_only_clears_legacy_hurdle"] = (
            weakest is not None and r["ticker"] not in incumbents
            and r["adjusted_score"] >= weakest + replacement_hurdle_points
        )
        r["authority"] = "EXECUTION_DIAGNOSTIC_ONLY"
    return ranked
