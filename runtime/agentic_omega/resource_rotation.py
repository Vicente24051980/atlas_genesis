"""ATLAS Ω — Resource Rotation / Gold Miner Economics.

Canonical separations:
MINING != SINGLE FACTOR
GOLD BULLION != GOLD MINERS
GOLD EQUITIES != COPPER EQUITIES
COMMODITY STRENGTH != EQUITY MONETIZATION
GREEN PULSE != GREEN CONTINUITY
100%-BASIS PRODUCTION != ATTRIBUTABLE ECONOMICS
EXPLORATION RESULT != RESERVE
CURRENT FCF != NORMALIZED FCF
BUYBACK != NET SHARE COUNT REDUCTION
BUSINESS QUALITY != EXPECTED RETURN != ENTRY TIMING

This module is intentionally data-source agnostic. Live prices, returns, breadth and
fundamental observations must be supplied by an evidence adapter with explicit
market/session metadata. Missing evidence must stay missing upstream; do not infer it.
"""

from dataclasses import dataclass
from enum import Enum
from statistics import median
from typing import Iterable, Optional


def _clip(x: float) -> float:
    return max(0.0, min(100.0, float(x)))


class RotationState(str, Enum):
    WINNING = "GANANDO"
    IMPROVING = "MEJORANDO"
    NEUTRAL = "NEUTRA"
    DETERIORATING = "DETERIORANDO"
    LOSING = "PERDIENDO"


class ResourceBranch(str, Enum):
    GOLD = "GOLD"
    COPPER = "COPPER"
    DIVERSIFIED = "DIVERSIFIED"
    URANIUM = "URANIUM"
    RARE_EARTHS = "RARE_EARTHS"


@dataclass(frozen=True)
class BranchMarketInput:
    branch: ResourceBranch
    median_return_1d: float
    median_return_5d: float
    median_return_1m: float
    median_rs_5d_vs_benchmark: float
    positive_breadth_pct: float
    persistence_days: int
    commodity_confirmation: Optional[bool] = None


@dataclass(frozen=True)
class BranchMarketResult:
    branch: ResourceBranch
    score: float
    state: RotationState
    pulse_positive: bool
    continuity_positive: bool
    breadth_confirmed: bool
    commodity_confirmation: Optional[bool]


def evaluate_resource_branch(x: BranchMarketInput) -> BranchMarketResult:
    """Classify a resource branch from equity evidence, not narrative.

    1D is pulse; 5D/1M + RS + breadth + persistence form continuity.
    Commodity confirmation can strengthen evidence but cannot make equities WINNING.
    """
    breadth = _clip(x.positive_breadth_pct)
    persistence = _clip(x.persistence_days / 5.0 * 100.0)
    r1d = _clip(50 + 10 * x.median_return_1d)
    r5d = _clip(50 + 5 * x.median_return_5d)
    r1m = _clip(50 + 2 * x.median_return_1m)
    rs = _clip(50 + 8 * x.median_rs_5d_vs_benchmark)

    score = 0.10 * r1d + 0.24 * r5d + 0.18 * r1m + 0.22 * rs + 0.18 * breadth + 0.08 * persistence
    breadth_confirmed = breadth >= 60.0
    pulse_positive = x.median_return_1d > 0 and breadth >= 50.0
    continuity_positive = (
        x.median_return_5d > 0
        and x.median_rs_5d_vs_benchmark > 0
        and breadth_confirmed
        and x.persistence_days >= 2
    )

    if score >= 70 and continuity_positive:
        state = RotationState.WINNING
    elif score >= 58 and (continuity_positive or (pulse_positive and x.median_return_5d >= 0)):
        state = RotationState.IMPROVING
    elif score >= 45:
        state = RotationState.NEUTRAL
    elif score >= 32:
        state = RotationState.DETERIORATING
    else:
        state = RotationState.LOSING

    # Commodity strength alone is never allowed to promote equity state.
    return BranchMarketResult(
        branch=x.branch,
        score=_clip(score),
        state=state,
        pulse_positive=pulse_positive,
        continuity_positive=continuity_positive,
        breadth_confirmed=breadth_confirmed,
        commodity_confirmation=x.commodity_confirmation,
    )


@dataclass(frozen=True)
class Layer1ResourceResult:
    state: RotationState
    score: float
    winning_branches: tuple[str, ...]
    losing_branches: tuple[str, ...]
    divergent: bool
    broad_confirmation: bool


def aggregate_layer1_resources(results: Iterable[BranchMarketResult]) -> Layer1ResourceResult:
    """Aggregate C1 without allowing one hot branch to label all mining as WINNING."""
    rows = tuple(results)
    if not rows:
        raise ValueError("at least one resource branch is required")
    winning = tuple(r.branch.value for r in rows if r.state is RotationState.WINNING)
    losing = tuple(r.branch.value for r in rows if r.state in (RotationState.DETERIORATING, RotationState.LOSING))
    score = median(r.score for r in rows)
    win_ratio = len(winning) / len(rows)
    broad_confirmation = win_ratio >= 0.60 and sum(r.breadth_confirmed for r in rows) / len(rows) >= 0.60
    divergent = bool(winning and losing)

    if broad_confirmation and score >= 65:
        state = RotationState.WINNING
    elif score >= 58 and not losing:
        state = RotationState.IMPROVING
    elif score >= 45:
        state = RotationState.NEUTRAL
    elif score >= 32:
        state = RotationState.DETERIORATING
    else:
        state = RotationState.LOSING

    return Layer1ResourceResult(
        state=state,
        score=_clip(score),
        winning_branches=winning,
        losing_branches=losing,
        divergent=divergent,
        broad_confirmation=broad_confirmation,
    )


@dataclass(frozen=True)
class GoldMinerInput:
    ticker: str
    gold_price_per_oz: float
    aisc_per_oz: float
    production_100pct_oz: float
    attributable_ownership_pct: float
    normalized_fcf_yield_pct: float
    current_fcf_yield_pct: float
    net_debt_to_ebitda: float
    jurisdiction_score: float
    execution_score: float
    reserve_quality_score: float
    exploration_score: float
    ramp_up_score: float
    dilution_overhang_pct: float
    gross_buyback_yield_pct: float
    return_1d_pct: float
    return_5d_pct: float
    return_1m_pct: float
    rs_5d_vs_gold_miners_pct: float


@dataclass(frozen=True)
class GoldMinerResult:
    ticker: str
    attributable_production_oz: float
    spot_margin_per_oz: float
    spot_margin_pct: float
    fundamental_score: float
    expected_return_score: float
    market_validation_score: float
    entry_timing_score: float
    net_shareholder_yield_proxy_pct: float
    fcf_normalization_gap_pct: float
    challenger: bool
    portfolio_action_allowed: bool
    warnings: tuple[str, ...]


def evaluate_gold_miner(x: GoldMinerInput) -> GoldMinerResult:
    """Normalize a gold producer while preserving owner-economics and entry gates."""
    if x.gold_price_per_oz <= 0 or x.aisc_per_oz <= 0 or x.production_100pct_oz <= 0:
        raise ValueError("positive gold price, AISC and production are required")
    if not 0 < x.attributable_ownership_pct <= 100:
        raise ValueError("attributable ownership must be in (0, 100]")

    attributable = x.production_100pct_oz * x.attributable_ownership_pct / 100.0
    spot_margin = x.gold_price_per_oz - x.aisc_per_oz
    spot_margin_pct = spot_margin / x.gold_price_per_oz * 100.0
    margin_score = _clip(50 + spot_margin_pct * 0.65)
    balance_score = _clip(100 - max(0.0, x.net_debt_to_ebitda) * 20)
    dilution_score = _clip(100 - max(0.0, x.dilution_overhang_pct) * 3)
    owner_econ = _clip(50 + 5 * x.normalized_fcf_yield_pct)

    fundamental = (
        0.16 * margin_score
        + 0.13 * balance_score
        + 0.12 * _clip(x.jurisdiction_score)
        + 0.12 * _clip(x.execution_score)
        + 0.13 * _clip(x.reserve_quality_score)
        + 0.10 * _clip(x.exploration_score)
        + 0.09 * _clip(x.ramp_up_score)
        + 0.10 * owner_econ
        + 0.05 * dilution_score
    )

    market_validation = _clip(
        50
        + 2.0 * x.return_1d_pct
        + 1.7 * x.return_5d_pct
        + 0.55 * x.return_1m_pct
        + 2.5 * x.rs_5d_vs_gold_miners_pct
    )

    # Chasing a very extended 1M move is penalized even when market validation is strong.
    extension_penalty = max(0.0, x.return_1m_pct - 20.0) * 1.1 + max(0.0, x.return_5d_pct - 8.0) * 1.3
    entry_timing = _clip(85 - extension_penalty + min(10.0, max(-10.0, x.rs_5d_vs_gold_miners_pct * 2)))

    fcf_gap = x.normalized_fcf_yield_pct - x.current_fcf_yield_pct
    net_shareholder_yield_proxy = x.gross_buyback_yield_pct - max(0.0, x.dilution_overhang_pct)

    expected_return = _clip(
        0.48 * fundamental
        + 0.20 * owner_econ
        + 0.17 * market_validation
        + 0.15 * entry_timing
    )

    warnings = []
    if x.dilution_overhang_pct > x.gross_buyback_yield_pct:
        warnings.append("BUYBACK_DOES_NOT_OFFSET_DILUTION")
    if fcf_gap >= 3.0:
        warnings.append("CURRENT_FCF_BELOW_NORMALIZED_FCF")
    if x.ramp_up_score < 70:
        warnings.append("RAMP_UP_EXECUTION_NOT_DERISKED")
    if x.jurisdiction_score < 70:
        warnings.append("JURISDICTION_DISCOUNT_REQUIRED")
    if x.return_1m_pct > 30:
        warnings.append("ENTRY_EXTENDED_AFTER_STRONG_1M_MOVE")

    challenger = fundamental >= 80 and expected_return >= 78
    # The engine can identify a challenger, but cannot bypass valuation/replacement gates.
    portfolio_action_allowed = False

    return GoldMinerResult(
        ticker=x.ticker,
        attributable_production_oz=attributable,
        spot_margin_per_oz=spot_margin,
        spot_margin_pct=spot_margin_pct,
        fundamental_score=_clip(fundamental),
        expected_return_score=expected_return,
        market_validation_score=market_validation,
        entry_timing_score=entry_timing,
        net_shareholder_yield_proxy_pct=net_shareholder_yield_proxy,
        fcf_normalization_gap_pct=fcf_gap,
        challenger=challenger,
        portfolio_action_allowed=portfolio_action_allowed,
        warnings=tuple(warnings),
    )


RESOURCE_CANONICAL_LAWS = (
    "MINING != SINGLE FACTOR",
    "GOLD BULLION != GOLD MINERS",
    "GOLD EQUITIES != COPPER EQUITIES",
    "COMMODITY STRENGTH != EQUITY MONETIZATION",
    "GREEN PULSE != GREEN CONTINUITY",
    "100%-BASIS PRODUCTION != ATTRIBUTABLE ECONOMICS",
    "EXPLORATION RESULT != RESERVE",
    "CURRENT FCF != NORMALIZED FCF",
    "BUYBACK != NET SHARE COUNT REDUCTION",
    "BUSINESS QUALITY != EXPECTED RETURN != ENTRY TIMING",
)
