"""ATLAS Ω — Market Fragility / Expectations Gap.

Canonical laws:
COMPLACENCY != IMMEDIATE SELL SIGNAL
LEVERAGE != FUNDAMENTAL DETERIORATION
DURATION RELIEF != AI CAPITAL ROTATION
FUNDAMENTALS UP + EQUITY RESPONSE DOWN = EXPECTATIONS WARNING
ECONOMIC PROOF != MARKET VALIDATION
"""
from dataclasses import dataclass
from enum import Enum


def _clip(x: float) -> float:
    return max(0.0, min(100.0, float(x)))


class FragilityState(str, Enum):
    LOW = "LOW"
    ELEVATED = "ELEVATED"
    HIGH = "HIGH"


class ExpectationsGapState(str, Enum):
    NONE = "NONE"
    WATCH = "WATCH"
    NEGATIVE_EXPECTATIONS_GAP = "NEGATIVE_EXPECTATIONS_GAP"


@dataclass(frozen=True)
class MarketFragilityInput:
    complacency: float
    leverage: float
    breadth_warning: float
    credit_divergence: float
    duration_pressure: float
    event_concentration: float = 0.0


@dataclass(frozen=True)
class MarketFragilityResult:
    score: float
    state: FragilityState
    hurdle_multiplier: float


def evaluate_market_fragility(x: MarketFragilityInput) -> MarketFragilityResult:
    score = _clip(
        .22*x.complacency + .20*x.leverage + .18*x.breadth_warning
        + .18*x.credit_divergence + .14*x.duration_pressure
        + .08*x.event_concentration
    )
    if score >= 75:
        state, hurdle = FragilityState.HIGH, 1.25
    elif score >= 55:
        state, hurdle = FragilityState.ELEVATED, 1.12
    else:
        state, hurdle = FragilityState.LOW, 1.0
    return MarketFragilityResult(score, state, hurdle)


@dataclass(frozen=True)
class ReturnDecompositionInput:
    observed_return: float
    ai_factor: float
    duration_factor: float
    market_beta: float
    company_specific: float


def unexplained_return(x: ReturnDecompositionInput) -> float:
    """Diagnostic residual only; never proof of AI flow by itself."""
    return x.observed_return - (
        x.ai_factor + x.duration_factor + x.market_beta + x.company_specific
    )


@dataclass(frozen=True)
class ExpectationsGapInput:
    fundamental_confirmation: float
    chain_breadth: float
    relative_strength: float
    persistence: float
    post_event_window_complete: bool


@dataclass(frozen=True)
class ExpectationsGapResult:
    state: ExpectationsGapState
    warning_score: float


def evaluate_negative_expectations_gap(x: ExpectationsGapInput) -> ExpectationsGapResult:
    fundamentals = _clip(x.fundamental_confirmation)
    market_validation = _clip((x.chain_breadth + x.relative_strength + x.persistence) / 3.0)
    warning = _clip(fundamentals - market_validation)
    if x.post_event_window_complete and fundamentals >= 70 and market_validation < 45:
        state = ExpectationsGapState.NEGATIVE_EXPECTATIONS_GAP
    elif fundamentals >= 60 and market_validation < 60:
        state = ExpectationsGapState.WATCH
    else:
        state = ExpectationsGapState.NONE
    return ExpectationsGapResult(state, warning)


def layer_jump_state(*, pulse_breadth: float, relative_strength: float,
                     global_continuity: float, persistence: float,
                     event_validation: float, fragility_hurdle: float = 1.0) -> str:
    """Fail closed: one-session pulse can activate WATCH, never CONFIRMED."""
    confirm = 60.0 * max(1.0, fragility_hurdle)
    if min(global_continuity, persistence, event_validation) >= confirm and min(pulse_breadth, relative_strength) >= 60:
        return "LAYER_JUMP_CONFIRMED"
    if min(pulse_breadth, relative_strength) >= 55:
        return "LAYER_JUMP_WATCH"
    return "NO_LAYER_JUMP"
