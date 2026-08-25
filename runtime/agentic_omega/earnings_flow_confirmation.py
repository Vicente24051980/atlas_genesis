"""ATLAS Ω — Earnings Flow Confirmation / Portfolio Green.

Canonical laws:
PRICE UP != INSTITUTIONAL FLOW
BUSINESS QUALITY != PORTFOLIO GREEN
ECONOMIC PROOF != MARKET VALIDATION
CURRENT CYCLICAL FCF != NORMALIZED OWNER ECONOMICS
"""
from dataclasses import dataclass


def _clip(x: float) -> float:
    return max(0.0, min(100.0, float(x)))


@dataclass(frozen=True)
class EFCInput:
    earnings_surprise: float
    guidance_revision: float
    margin_delta: float
    fcf_per_share_delta: float
    relative_strength: float
    volume_confirmation: float
    persistence: float
    estimate_revisions: float
    valuation_penalty: float = 0.0
    gap_penalty: float = 0.0
    dilution_penalty: float = 0.0
    cycle_penalty: float = 0.0
    event_risk_penalty: float = 0.0


def earnings_flow_confirmation(x: EFCInput) -> float:
    raw = (
        .18*x.earnings_surprise + .18*x.guidance_revision + .14*x.margin_delta
        + .16*x.fcf_per_share_delta + .10*x.relative_strength
        + .08*x.volume_confirmation + .08*x.persistence + .08*x.estimate_revisions
    )
    penalties = (x.valuation_penalty + x.gap_penalty + x.dilution_penalty
                 + x.cycle_penalty + x.event_risk_penalty)
    return _clip(raw - penalties)


@dataclass(frozen=True)
class FlowCausalityInput:
    market: float
    sector: float
    factor: float
    country: float
    company_event: float
    observed_return: float


def residual_return(x: FlowCausalityInput) -> float:
    """Residual is diagnostic only; it is never institutional-flow proof alone."""
    return x.observed_return - (x.market + x.sector + x.factor + x.country + x.company_event)


def accumulation_state(efc: float, breadth: float, rs: float, persistence: float) -> str:
    # Fail closed: a one-day gap or company-only move cannot confirm accumulation.
    if efc >= 75 and min(breadth, rs, persistence) >= 60:
        return "ACCUMULATION_CONFIRMED"
    if efc >= 60 and min(rs, persistence) >= 50:
        return "ACCUMULATION_WATCH"
    return "UNCONFIRMED"


def portfolio_green(fundamental_quality: float, expected_return: float,
                    market_validation: float, regime_compatibility: float) -> float:
    """Multiplicative geometric score: one weak gate cannot be hidden by three strong ones."""
    vals = [_clip(v)/100.0 for v in (
        fundamental_quality, expected_return, market_validation, regime_compatibility
    )]
    score = 100.0
    for v in vals:
        score *= v ** 0.25
    return _clip(score)


def portfolio_state(score: float, market_validation: float) -> str:
    if market_validation < 35:
        return "FUNDAMENTAL_GREEN_MARKET_RED"
    if score >= 80 and market_validation >= 60:
        return "PORTFOLIO_GREEN"
    if score >= 65:
        return "WATCH"
    return "NO_GREEN"
