"""ATLAS Ω — Earnings Learning Ω v2.2.

One diagnostic surface for event learning. It deliberately does not emit a BUY/SELL,
portfolio weight, or broker instruction.

Epistemic layers are disjoint:
- PRE_EVENT_EXPECTATION_BURDEN: what the market required before the release.
- FUNDAMENTAL_SURPRISE: what the business actually reported vs that bar.
- POST_EVENT_PRICE_TRUTH: what price did after the release, benchmark-relative.
- SECOND_ORDER_READ_THROUGH: later peer/estimate/chain transmission.

Legacy Earnings Flow Confirmation and Expectations Gap remain callable for backward
compatibility, but duplicated event evidence must not be added to this result again.
"""
from dataclasses import dataclass
from enum import Enum
from typing import Optional


class LearningState(str, Enum):
    INCOMPLETE = "INCOMPLETE"
    CONTRADICTORY = "CONTRADICTORY"
    CONFIRMED = "CONFIRMED"
    SATURATED = "SATURATED"
    REBOUND = "REBOUND"
    REVERSAL = "REVERSAL"
    MIXED = "MIXED"


@dataclass(frozen=True)
class PreEventExpectationBurden:
    pre_run: float
    valuation_premium: float
    revision_momentum: float
    narrative_heat: float
    deceleration_risk: float
    peer_bar: float
    implied_move: Optional[float] = None


@dataclass(frozen=True)
class FundamentalSurprise:
    revenue: float
    guidance: float
    margin: float
    fcf_per_share: float
    eps: Optional[float] = None
    eps_quality_ok: bool = False


@dataclass(frozen=True)
class PostEventPriceTruth:
    # Returns are percentages from the last verified pre-release trade.
    ah: Optional[float]
    d1_open: Optional[float]
    d1_close: Optional[float]
    d3: Optional[float]
    d5: Optional[float]
    d20: Optional[float]
    benchmark_d1_close: Optional[float] = None
    benchmark_d3: Optional[float] = None
    benchmark_d5: Optional[float] = None
    benchmark_d20: Optional[float] = None
    pre_release_anchor_verified: bool = True
    tape_stale: bool = False
    tape_contradictory: bool = False


@dataclass(frozen=True)
class SecondOrderReadThrough:
    estimate_revision: Optional[float] = None
    peer_transmission: Optional[float] = None
    chain_breadth: Optional[float] = None


@dataclass(frozen=True)
class EarningsLearningInput:
    expectations: PreEventExpectationBurden
    fundamentals: FundamentalSurprise
    price: PostEventPriceTruth
    read_through: SecondOrderReadThrough = SecondOrderReadThrough()
    calibration_sample_n: int = 0
    minimum_calibration_n: int = 8


@dataclass(frozen=True)
class EarningsLearningResult:
    state: LearningState
    expectation_burden: float
    fundamental_surprise: float
    price_truth: Optional[float]
    read_through: Optional[float]
    missing_fields: tuple[str, ...]
    diagnostic_only: bool = True
    scoring_authority: str = "DIAGNOSTIC_ONLY"


def _mean(values):
    xs = [float(v) for v in values if v is not None]
    return None if not xs else sum(xs) / len(xs)


def _expectation_burden(x: PreEventExpectationBurden) -> float:
    values = [x.pre_run, x.valuation_premium, x.revision_momentum,
              x.narrative_heat, x.deceleration_risk, x.peer_bar]
    if x.implied_move is not None:
        values.append(x.implied_move)
    return float(_mean(values))


def _fundamental_surprise(x: FundamentalSurprise) -> float:
    # EPS is deliberately low-weight and is ignored when its basis/quality is not sound.
    core = [x.revenue, x.guidance, x.margin, x.fcf_per_share]
    core_mean = float(_mean(core))
    if x.eps is None or not x.eps_quality_ok:
        return core_mean
    return 0.9 * core_mean + 0.1 * float(x.eps)


def _price_truth(x: PostEventPriceTruth) -> Optional[float]:
    # Each horizon is benchmark-adjusted once. AH/open are retained for path/reversal
    # classification, not added again to the multi-day return score.
    adjusted = []
    for observed, benchmark in (
        (x.d1_close, x.benchmark_d1_close),
        (x.d3, x.benchmark_d3),
        (x.d5, x.benchmark_d5),
        (x.d20, x.benchmark_d20),
    ):
        if observed is not None:
            adjusted.append(float(observed) - float(benchmark or 0.0))
    return _mean(adjusted)


def _read_through(x: SecondOrderReadThrough) -> Optional[float]:
    return _mean([x.estimate_revision, x.peer_transmission, x.chain_breadth])


def _missing(x: EarningsLearningInput) -> tuple[str, ...]:
    missing = []
    if x.price.d1_close is None:
        missing.append("price.d1_close")
    if not x.price.pre_release_anchor_verified:
        missing.append("price.pre_release_anchor_verified")
    if x.calibration_sample_n < x.minimum_calibration_n:
        missing.append("calibration_sample")
    return tuple(missing)


def evaluate_earnings_learning(x: EarningsLearningInput) -> EarningsLearningResult:
    burden = _expectation_burden(x.expectations)
    fundamental = _fundamental_surprise(x.fundamentals)
    price = _price_truth(x.price)
    read = _read_through(x.read_through)
    missing = _missing(x)

    if x.price.tape_stale or x.price.tape_contradictory:
        return EarningsLearningResult(LearningState.CONTRADICTORY, burden, fundamental,
                                      None, read, missing)
    if missing:
        return EarningsLearningResult(LearningState.INCOMPLETE, burden, fundamental,
                                      price, read, missing)

    # Path classifications are deterministic diagnostics, not a tradable score.
    if x.price.ah is not None and x.price.d1_close is not None and x.price.ah * x.price.d1_close < 0:
        state = LearningState.REVERSAL
    elif x.price.d1_open is not None and x.price.d1_close is not None and x.price.d1_open < 0 < x.price.d1_close:
        state = LearningState.REBOUND
    elif fundamental > 0 and price is not None and price > 0 and burden < fundamental:
        state = LearningState.CONFIRMED
    elif fundamental > 0 and price is not None and price <= 0 and burden >= fundamental:
        state = LearningState.SATURATED
    else:
        state = LearningState.MIXED

    return EarningsLearningResult(state, burden, fundamental, price, read, missing)


def combine_independent_layers(result: EarningsLearningResult) -> tuple[Optional[float], ...]:
    """Expose independent components; intentionally no aggregate score.

    This is the anti-double-counting contract: callers receive each epistemic layer once
    and cannot obtain an official sum by passing the same observation through legacy EFC
    or Expectations Gap as a second 'signal'.
    """
    return (result.expectation_burden, result.fundamental_surprise,
            result.price_truth, result.read_through)
