"""ATLAS Ω — AIME-derived signal engines.

These engines treat AIME/third-party signals as *evidence layers*, never as thesis
or expected-return creators.

Canonical laws:
TECHNICAL CONFIRMATION CAN IMPROVE TIMING, BUT CANNOT CREATE EXPECTED RETURN.
UNUSUAL OPTIONS != INFORMED CAPITAL.
BREAKOUT != BUY.
ONE-DAY BREADTH != PERSISTENT ROTATION.
CURATED THEME != FORWARD ALPHA.
EXTERNAL AI PICK != VERIFIED EVIDENCE.
"""
from dataclasses import dataclass
from enum import Enum


def _clip(x: float) -> float:
    return max(0.0, min(100.0, float(x)))


class SignalState(str, Enum):
    REJECT = "REJECT"
    WATCH = "WATCH"
    CONFIRMING = "CONFIRMING"
    CONFIRMED = "CONFIRMED"


@dataclass(frozen=True)
class OptionsFlowInput:
    block_size: float
    open_interest_change: float
    skew_shift: float
    repeat_flow: float
    underlying_relative_strength: float
    post_flow_persistence: float
    hedge_penalty: float = 0.0
    event_hedge_penalty: float = 0.0
    days_to_event: float | None = None
    evidence_freshness_hours: float = 0.0


@dataclass(frozen=True)
class OptionsFlowResult:
    score: float
    state: SignalState
    event_contaminated: bool
    executable_confirmation: bool


def evaluate_options_flow(x: OptionsFlowInput) -> OptionsFlowResult:
    raw = (
        .25*x.block_size + .20*x.open_interest_change + .20*x.skew_shift
        + .15*x.repeat_flow + .10*x.underlying_relative_strength
        + .10*x.post_flow_persistence
    )
    score = _clip(raw - x.hedge_penalty - x.event_hedge_penalty)
    event_contaminated = x.days_to_event is not None and x.days_to_event <= 3
    stale = x.evidence_freshness_hours > 24
    if stale or score < 45:
        state = SignalState.REJECT
    elif score < 65:
        state = SignalState.WATCH
    elif score < 80 or event_contaminated:
        state = SignalState.CONFIRMING
    else:
        state = SignalState.CONFIRMED
    executable = state == SignalState.CONFIRMED and not event_contaminated and not stale
    return OptionsFlowResult(score, state, event_contaminated, executable)


@dataclass(frozen=True)
class TechnicalConfirmationInput:
    relative_strength: float
    breadth: float
    volume: float
    persistence: float
    breakout_quality: float
    expected_return_score: float
    valuation_support: float
    evidence_freshness_hours: float = 0.0


@dataclass(frozen=True)
class TechnicalConfirmationResult:
    score: float
    state: SignalState
    timing_support: bool
    buy_authorized: bool


def evaluate_technical_confirmation(x: TechnicalConfirmationInput) -> TechnicalConfirmationResult:
    score = _clip(
        .30*x.relative_strength + .25*x.breadth + .20*x.volume
        + .15*x.persistence + .10*x.breakout_quality
    )
    stale = x.evidence_freshness_hours > 24
    if stale or score < 45:
        state = SignalState.REJECT
    elif score < 65:
        state = SignalState.WATCH
    elif score < 80:
        state = SignalState.CONFIRMING
    else:
        state = SignalState.CONFIRMED
    timing_support = state in (SignalState.CONFIRMING, SignalState.CONFIRMED)
    # Technicals can never manufacture expected return. Both ER and valuation must pass.
    buy_authorized = (
        state == SignalState.CONFIRMED
        and x.expected_return_score >= 70
        and x.valuation_support >= 60
        and not stale
    )
    return TechnicalConfirmationResult(score, state, timing_support, buy_authorized)


@dataclass(frozen=True)
class IntradayBreadthPulseInput:
    advancer_share: float
    above_vwap_share: float
    sector_relative_strength: float
    up_volume_share: float
    persistence_minutes: float
    cross_subindustry_confirmation: float


@dataclass(frozen=True)
class IntradayBreadthPulseResult:
    score: float
    state: SignalState
    persistent_rotation: bool


def evaluate_intraday_breadth_pulse(x: IntradayBreadthPulseInput) -> IntradayBreadthPulseResult:
    score = _clip(
        .20*x.advancer_share + .15*x.above_vwap_share + .20*x.sector_relative_strength
        + .20*x.up_volume_share + .15*min(100.0, x.persistence_minutes/120.0*100.0)
        + .10*x.cross_subindustry_confirmation
    )
    enough_time = x.persistence_minutes >= 90
    enough_cross_section = x.cross_subindustry_confirmation >= 60 and x.advancer_share >= 55
    if score < 50:
        state = SignalState.REJECT
    elif score < 65:
        state = SignalState.WATCH
    elif score < 80 or not (enough_time and enough_cross_section):
        state = SignalState.CONFIRMING
    else:
        state = SignalState.CONFIRMED
    return IntradayBreadthPulseResult(score, state, state == SignalState.CONFIRMED)


@dataclass(frozen=True)
class ExternalSignalInput:
    source_quality: float
    data_transparency: float
    reproducibility: float
    timestamp_quality: float
    conflict_disclosure: float
    independent_confirmation: float
    raw_signal_strength: float


@dataclass(frozen=True)
class ExternalSignalResult:
    evidence_quality: float
    adjusted_signal: float
    state: SignalState


def evaluate_external_signal(x: ExternalSignalInput) -> ExternalSignalResult:
    evidence = _clip(
        .25*x.source_quality + .20*x.data_transparency + .20*x.reproducibility
        + .15*x.timestamp_quality + .10*x.conflict_disclosure
        + .10*x.independent_confirmation
    )
    adjusted = _clip(x.raw_signal_strength * evidence / 100.0)
    if evidence < 45 or adjusted < 40:
        state = SignalState.REJECT
    elif adjusted < 60:
        state = SignalState.WATCH
    elif adjusted < 75:
        state = SignalState.CONFIRMING
    else:
        state = SignalState.CONFIRMED
    return ExternalSignalResult(evidence, adjusted, state)


@dataclass(frozen=True)
class ThemeCrowdingInput:
    repeated_curated_mentions: float
    analyst_consensus: float
    options_speculation: float
    valuation_expansion: float
    ownership_concentration: float
    price_acceleration: float
    fundamental_revision_strength: float


@dataclass(frozen=True)
class ThemeCrowdingResult:
    crowding_score: float
    fundamental_offset: float
    net_crowding_risk: float
    state: SignalState


def evaluate_theme_crowding(x: ThemeCrowdingInput) -> ThemeCrowdingResult:
    crowding = _clip(
        .20*x.repeated_curated_mentions + .15*x.analyst_consensus
        + .15*x.options_speculation + .20*x.valuation_expansion
        + .15*x.ownership_concentration + .15*x.price_acceleration
    )
    # Strong revisions can justify part of a crowded trade, but cannot erase crowding.
    offset = min(30.0, _clip(x.fundamental_revision_strength) * .30)
    net = _clip(crowding - offset)
    if net < 40:
        state = SignalState.REJECT
    elif net < 60:
        state = SignalState.WATCH
    elif net < 75:
        state = SignalState.CONFIRMING
    else:
        state = SignalState.CONFIRMED
    return ThemeCrowdingResult(crowding, offset, net, state)


AIME_CANONICAL_LAWS = (
    "TECHNICAL CONFIRMATION CAN IMPROVE TIMING, BUT CANNOT CREATE EXPECTED RETURN",
    "UNUSUAL OPTIONS != INFORMED CAPITAL",
    "BREAKOUT != BUY",
    "ONE-DAY BREADTH != PERSISTENT ROTATION",
    "CURATED THEME != FORWARD ALPHA",
    "EXTERNAL AI PICK != VERIFIED EVIDENCE",
)
