from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from enum import Enum
from typing import Iterable


class FlowType(str, Enum):
    PRODUCTIVE_CAPITAL_FORMATION = "PRODUCTIVE_CAPITAL_FORMATION"
    ASSET_ALLOCATION = "ASSET_ALLOCATION"
    CONSUMPTION = "CONSUMPTION"
    FISCAL_PROCUREMENT = "FISCAL_PROCUREMENT"
    CAPITAL_RETURN = "CAPITAL_RETURN"


class FlowStage(str, Enum):
    ANNOUNCED = "ANNOUNCED"
    COMMITTED = "COMMITTED"
    FINANCED = "FINANCED"
    DEPLOYED = "DEPLOYED"
    ORDERED = "ORDERED"
    MONETIZED = "MONETIZED"
    POLICY_INTENT = "POLICY_INTENT"
    BUDGET_REQUEST = "BUDGET_REQUEST"
    APPROPRIATION = "APPROPRIATION"
    CONTRACT = "CONTRACT"
    REVENUE = "REVENUE"
    AUTHORIZED = "AUTHORIZED"
    EXECUTED = "EXECUTED"


class PITStatus(str, Enum):
    CONFIRMED = "PIT_CONFIRMED"
    UNCERTAIN = "PIT_UNCERTAIN"
    NOT_PIT = "NOT_PIT"


class SignalLifecycle(str, Enum):
    DISCOVERY = "DISCOVERY"
    SHADOW = "SHADOW"
    PRODUCTION = "PRODUCTION"


class ObjectiveType(str, Enum):
    SECURITY = "SECURITY"
    GROWTH = "GROWTH"
    LEGACY = "LEGACY"


class FitState(str, Enum):
    PASS = "PASS"
    WATCH = "WATCH"
    REJECT = "REJECT"


def _unit(name: str, value: float) -> None:
    if not 0.0 <= value <= 1.0:
        raise ValueError(f"{name} must be between 0 and 1")


_PRODUCTIVE_CHAIN_STAGES = frozenset(
    {
        FlowStage.FINANCED,
        FlowStage.DEPLOYED,
        FlowStage.ORDERED,
        FlowStage.MONETIZED,
    }
)
_FISCAL_ECONOMIC_STAGES = frozenset({FlowStage.APPROPRIATION, FlowStage.CONTRACT, FlowStage.REVENUE})
_FISCAL_REVENUE_STAGES = frozenset({FlowStage.REVENUE})
_CAPITAL_RETURN_EXECUTION_STAGES = frozenset({FlowStage.EXECUTED})


@dataclass(frozen=True)
class CapitalFlowObservation:
    flow_type: FlowType
    stage: FlowStage
    source: str
    publication_date: date
    information_date: date
    pit_status: PITStatus
    confidence: float
    amount: float | None = None
    currency: str | None = None

    def __post_init__(self) -> None:
        if not self.source.strip():
            raise ValueError("source is required")
        if self.publication_date < self.information_date:
            raise ValueError("publication_date cannot precede information_date")
        _unit("confidence", self.confidence)
        if self.amount is not None and self.amount < 0:
            raise ValueError("amount cannot be negative")

    @property
    def productive_capex_chain_eligible(self) -> bool:
        return self.flow_type is FlowType.PRODUCTIVE_CAPITAL_FORMATION and self.stage in _PRODUCTIVE_CHAIN_STAGES

    @property
    def fiscal_economic_commitment(self) -> bool:
        return self.flow_type is FlowType.FISCAL_PROCUREMENT and self.stage in _FISCAL_ECONOMIC_STAGES

    @property
    def realized_revenue_evidence(self) -> bool:
        if self.flow_type is FlowType.FISCAL_PROCUREMENT:
            return self.stage in _FISCAL_REVENUE_STAGES
        if self.flow_type is FlowType.PRODUCTIVE_CAPITAL_FORMATION:
            return self.stage is FlowStage.MONETIZED
        return False


@dataclass(frozen=True)
class TransmissionCase:
    observation: CapitalFlowObservation
    transmission_mechanism: str
    investable_security: str | None
    bottleneck_strength: float
    economic_capture: float
    duration: float
    expectation_gap_score: float
    competitive_leakage: float
    execution_risk: float
    signal_horizon_days: int
    decision_horizon_days: int
    falsifiers: tuple[str, ...]

    def __post_init__(self) -> None:
        for name in (
            "bottleneck_strength",
            "economic_capture",
            "duration",
            "expectation_gap_score",
            "competitive_leakage",
            "execution_risk",
        ):
            _unit(name, getattr(self, name))
        if self.signal_horizon_days <= 0 or self.decision_horizon_days <= 0:
            raise ValueError("signal and decision horizons must be positive")


@dataclass(frozen=True)
class FlowEvaluation:
    lifecycle: SignalLifecycle
    direct_atlas_score_delta: float
    portfolio_action_allowed: bool
    capex_chain_allowed: bool
    reasons: tuple[str, ...]


# Research-promotion defaults. These are governance heuristics, not validated alpha
# thresholds. Promotion only means the typed evidence may enter the normal ATLAS
# research stack; it never creates a trade or structural score by itself.
_MIN_PROMOTION_CONFIDENCE = 0.75
_MIN_CAPTURE = 0.60
_MIN_BOTTLENECK = 0.50
_MIN_DURATION = 0.50
_MIN_EXPECTATION_GAP = 0.55
_MAX_LEAKAGE = 0.40
_MAX_EXECUTION_RISK = 0.40


def evaluate_flow_case(case: TransmissionCase) -> FlowEvaluation:
    reasons: list[str] = []
    observation = case.observation
    capex_allowed = observation.productive_capex_chain_eligible

    if observation.flow_type is FlowType.ASSET_ALLOCATION:
        reasons.append("asset-allocation demand may affect asset price/liquidity but is not productive CAPEX or supplier revenue proof")
        capex_allowed = False
    elif observation.flow_type is FlowType.FISCAL_PROCUREMENT:
        capex_allowed = False
        if observation.stage in {FlowStage.POLICY_INTENT, FlowStage.BUDGET_REQUEST}:
            reasons.append("policy intent/budget request is not appropriation, contract or revenue")
        elif observation.stage is FlowStage.APPROPRIATION:
            reasons.append("appropriation is funded authority, not yet vendor contract or revenue")
        elif observation.stage is FlowStage.CONTRACT:
            reasons.append("contract is stronger evidence but remains distinct from realized revenue")
    elif observation.flow_type is FlowType.CAPITAL_RETURN:
        capex_allowed = False
        if observation.stage is not FlowStage.EXECUTED:
            reasons.append("capital-return authorization/announcement is not executed capital return")
    elif observation.flow_type is FlowType.CONSUMPTION:
        capex_allowed = False
        reasons.append("consumption flow transmits through customer revenue, not the productive-CAPEX supplier chain")
    elif not capex_allowed:
        reasons.append("productive-capital observation is too early for the financed/deployed/ordered/monetized chain")

    if observation.pit_status is PITStatus.NOT_PIT:
        reasons.append("non-PIT evidence cannot be promoted")
        return FlowEvaluation(SignalLifecycle.DISCOVERY, 0.0, False, capex_allowed, tuple(reasons))
    if observation.pit_status is PITStatus.UNCERTAIN:
        reasons.append("PIT uncertainty caps the signal at SHADOW")

    if not case.transmission_mechanism.strip():
        reasons.append("no explicit transmission mechanism")
    if not case.investable_security:
        reasons.append("no investable security identified")
    if not case.falsifiers:
        reasons.append("no preregistered falsifier")

    horizon_ratio = case.decision_horizon_days / case.signal_horizon_days
    if horizon_ratio >= 20 and not case.transmission_mechanism.strip():
        reasons.append("short-horizon signal cannot control a long-horizon decision without a transmission bridge")

    quantitative_packet = (
        observation.confidence >= _MIN_PROMOTION_CONFIDENCE
        and case.bottleneck_strength >= _MIN_BOTTLENECK
        and case.economic_capture >= _MIN_CAPTURE
        and case.duration >= _MIN_DURATION
        and case.expectation_gap_score >= _MIN_EXPECTATION_GAP
        and case.competitive_leakage <= _MAX_LEAKAGE
        and case.execution_risk <= _MAX_EXECUTION_RISK
    )

    evidence_packet_complete = bool(
        observation.pit_status is PITStatus.CONFIRMED
        and case.transmission_mechanism.strip()
        and case.investable_security
        and case.falsifiers
        and quantitative_packet
    )

    if evidence_packet_complete:
        lifecycle = SignalLifecycle.PRODUCTION
        reasons.append("typed evidence packet clears provisional research-promotion gates")
    else:
        lifecycle = SignalLifecycle.SHADOW if observation.pit_status is not PITStatus.NOT_PIT else SignalLifecycle.DISCOVERY
        if not quantitative_packet:
            reasons.append("capture/bottleneck/duration/expectation-gap or risk evidence is insufficient for promotion")

    return FlowEvaluation(
        lifecycle=lifecycle,
        direct_atlas_score_delta=0.0,
        portfolio_action_allowed=False,
        capex_chain_allowed=capex_allowed,
        reasons=tuple(reasons),
    )


@dataclass(frozen=True)
class ObjectiveRequirements:
    objective: ObjectiveType
    horizon_days: int
    minimum_liquidity: float
    maximum_exit_spread_bps: float
    minimum_recognition: float
    minimum_counterparty_depth: float
    minimum_reversibility: float

    def __post_init__(self) -> None:
        if self.horizon_days <= 0:
            raise ValueError("horizon_days must be positive")
        if self.maximum_exit_spread_bps < 0:
            raise ValueError("maximum_exit_spread_bps cannot be negative")
        for name in ("minimum_liquidity", "minimum_recognition", "minimum_counterparty_depth", "minimum_reversibility"):
            _unit(name, getattr(self, name))


@dataclass(frozen=True)
class InstrumentProfile:
    name: str
    liquidity: float
    typical_exit_spread_bps: float
    recognition: float
    counterparty_depth: float
    reversibility: float

    def __post_init__(self) -> None:
        if not self.name.strip():
            raise ValueError("instrument name is required")
        if self.typical_exit_spread_bps < 0:
            raise ValueError("typical_exit_spread_bps cannot be negative")
        for name in ("liquidity", "recognition", "counterparty_depth", "reversibility"):
            _unit(name, getattr(self, name))


@dataclass(frozen=True)
class ObjectiveInstrumentFit:
    state: FitState
    failures: tuple[str, ...]
    reason: str


def objective_instrument_fit(requirements: ObjectiveRequirements, instrument: InstrumentProfile) -> ObjectiveInstrumentFit:
    failures: list[str] = []
    if instrument.liquidity < requirements.minimum_liquidity:
        failures.append("liquidity")
    if instrument.typical_exit_spread_bps > requirements.maximum_exit_spread_bps:
        failures.append("exit_spread")
    if instrument.recognition < requirements.minimum_recognition:
        failures.append("recognition")
    if instrument.counterparty_depth < requirements.minimum_counterparty_depth:
        failures.append("counterparty_depth")
    if instrument.reversibility < requirements.minimum_reversibility:
        failures.append("reversibility")

    if not failures:
        return ObjectiveInstrumentFit(FitState.PASS, (), "instrument satisfies the declared objective constraints")
    if requirements.objective is ObjectiveType.SECURITY or len(failures) >= 2:
        return ObjectiveInstrumentFit(FitState.REJECT, tuple(failures), "instrument is mismatched to the declared objective")
    return ObjectiveInstrumentFit(FitState.WATCH, tuple(failures), "instrument requires an explicit trade-off review")


@dataclass(frozen=True)
class SignalDependency:
    signal: str
    causal_drivers: frozenset[str]

    def __post_init__(self) -> None:
        if not self.signal.strip() or not self.causal_drivers:
            raise ValueError("signal and causal_drivers are required")


@dataclass(frozen=True)
class DependencyResult:
    overlap: float
    possible_double_counting: bool
    shared_drivers: tuple[str, ...]


def signal_dependency_overlap(left: SignalDependency, right: SignalDependency, *, threshold: float = 0.50) -> DependencyResult:
    _unit("threshold", threshold)
    union = left.causal_drivers | right.causal_drivers
    shared = left.causal_drivers & right.causal_drivers
    overlap = len(shared) / len(union) if union else 0.0
    return DependencyResult(overlap, overlap >= threshold, tuple(sorted(shared)))


def drivers(values: Iterable[str]) -> frozenset[str]:
    cleaned = frozenset(item.strip() for item in values if item.strip())
    if not cleaned:
        raise ValueError("at least one causal driver is required")
    return cleaned
