from __future__ import annotations

from dataclasses import dataclass

from .ai_demand_engines import SignalState


def _unit(name: str, value: float) -> None:
    if not 0.0 <= value <= 1.0:
        raise ValueError(f"{name} must be between 0 and 1")


@dataclass(frozen=True)
class PreMortemInversionInput:
    thesis_strength: float
    destroyer_coverage: float
    destroyer_probability: float
    downside_damage: float
    falsifier_detectability: float
    exit_rule_clarity: float
    sizing_tolerance: float


@dataclass(frozen=True)
class PreMortemInversionResult:
    ruin_risk: float
    process_quality: float
    signal: SignalState
    gate_passed: bool
    portfolio_action_allowed: bool
    reason: str


def evaluate_pre_mortem_inversion(data: PreMortemInversionInput) -> PreMortemInversionResult:
    for name, value in data.__dict__.items():
        _unit(name, value)
    ruin = data.destroyer_probability * data.downside_damage * (1.0 - data.sizing_tolerance)
    process = (
        0.25 * data.destroyer_coverage
        + 0.25 * data.falsifier_detectability
        + 0.25 * data.exit_rule_clarity
        + 0.25 * data.sizing_tolerance
    )
    passed = process >= 0.70 and ruin <= 0.20
    if passed and data.thesis_strength >= 0.70:
        signal = SignalState.GREEN_STRONG
    elif process >= 0.55 and ruin <= 0.35:
        signal = SignalState.GREEN
    elif ruin >= 0.55 or process < 0.35:
        signal = SignalState.RED
    else:
        signal = SignalState.AMBER
    return PreMortemInversionResult(
        ruin,
        process,
        signal,
        passed,
        False,
        "inversion requires explicit destroyers, falsifiers, sizing tolerance and exit rules; conviction cannot substitute for a survivable process",
    )


@dataclass(frozen=True)
class ResearchIntensityInput:
    capital_at_risk: float
    uncertainty: float
    downside_severity: float
    research_depth: float


@dataclass(frozen=True)
class ResearchIntensityResult:
    required_intensity: float
    coverage_ratio: float
    signal: SignalState
    gate_passed: bool
    portfolio_action_allowed: bool
    reason: str


def evaluate_research_intensity(data: ResearchIntensityInput) -> ResearchIntensityResult:
    if data.capital_at_risk < 0:
        raise ValueError("capital_at_risk cannot be negative")
    for name in ("uncertainty", "downside_severity", "research_depth"):
        _unit(name, getattr(data, name))
    capital_scale = min(data.capital_at_risk / 10000.0, 1.0)
    required = capital_scale * data.uncertainty * data.downside_severity
    coverage = 1.0 if required == 0 else min(data.research_depth / required, 2.0)
    passed = coverage >= 1.0
    if coverage >= 1.25:
        signal = SignalState.GREEN_STRONG
    elif passed:
        signal = SignalState.GREEN
    elif coverage >= 0.60:
        signal = SignalState.AMBER
    else:
        signal = SignalState.RED
    return ResearchIntensityResult(
        required,
        coverage,
        signal,
        passed,
        False,
        "research intensity must scale with capital at risk, uncertainty and downside; small-ticket diligence cannot justify large-position conviction",
    )


DISCIPLINE_CANONICAL_LAWS = (
    "OUTCOME != DECISION QUALITY",
    "PRICE DRAWDOWN != THESIS FAILURE",
    "CONVICTION != EXCUSE TO IGNORE A FALSIFIER",
    "RESEARCH INTENSITY PROPORTIONAL TO CAPITAL AT RISK X UNCERTAINTY X DOWNSIDE",
    "POSITION SIZE MUST SURVIVE THE PLAUSIBLE PATH, NOT ONLY THE TERMINAL THESIS",
)
