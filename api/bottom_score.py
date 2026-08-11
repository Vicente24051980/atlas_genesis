from __future__ import annotations

from typing import Any, Literal

from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter(prefix="/v1/atlas/bottom-score", tags=["bottom-score"])

WEIGHTS: dict[str, float] = {
    "breadth": 0.25,
    "capitulation": 0.20,
    "divergences": 0.20,
    "price_structure": 0.15,
    "volatility_sentiment": 0.10,
    "leadership_rotation": 0.10,
}

MIN_COVERAGE_FOR_SIGNAL = 0.75


class BottomComponents(BaseModel):
    """Normalized 0-100 sub-scores. Missing values are treated as unavailable, not bearish."""

    breadth: float | None = Field(default=None, ge=0, le=100)
    capitulation: float | None = Field(default=None, ge=0, le=100)
    divergences: float | None = Field(default=None, ge=0, le=100)
    price_structure: float | None = Field(default=None, ge=0, le=100)
    volatility_sentiment: float | None = Field(default=None, ge=0, le=100)
    leadership_rotation: float | None = Field(default=None, ge=0, le=100)


class BottomScoreRequest(BaseModel):
    label: str = Field(default="MARKET", min_length=1, max_length=80)
    drawdown_pct: float = Field(
        description="Drawdown from the relevant peak as a negative percentage, e.g. -18.4."
    )
    components: BottomComponents
    evidence: dict[str, Any] = Field(default_factory=dict)


class BottomScoreResult(BaseModel):
    engine: str
    label: str
    drawdownPct: float
    drawdownGate: str
    score: float
    availableScore: float | None
    coveragePct: float
    state: str
    action: str
    components: dict[str, float | None]
    weights: dict[str, float]
    evidence: dict[str, Any]
    guardrail: str


def _drawdown_gate(drawdown_pct: float) -> str:
    magnitude = max(0.0, -float(drawdown_pct))
    if magnitude < 5.0:
        return "DORMANT_NO_BOTTOM_EVENT"
    if magnitude < 10.0:
        return "WATCH"
    if magnitude < 20.0:
        return "CORRECTION_MODE"
    return "BEAR_FULL_BOTTOM_DETECTION"


def _score_state(score: float) -> tuple[str, str]:
    if score < 40.0:
        return "BEAR_TREND_ACTIVE", "NO_BOTTOM_SIGNAL"
    if score < 60.0:
        return "WATCH", "MONITOR"
    if score < 75.0:
        return "TACTICAL_BOTTOM", "PARTIAL_ENTRY_ELIGIBLE_AFTER_ATLAS_CROSS"
    return "CONFIRMED_BOTTOM", "CONFIRMED_BOTTOM_CANDIDATE_AFTER_ATLAS_CROSS"


def calculate_bottom_score(payload: BottomScoreRequest) -> BottomScoreResult:
    component_map = payload.components.model_dump()
    weighted_points = 0.0
    available_weight = 0.0

    for key, weight in WEIGHTS.items():
        value = component_map.get(key)
        if value is None:
            continue
        weighted_points += float(value) * weight
        available_weight += weight

    score = round(weighted_points, 1)
    coverage_pct = round(available_weight * 100.0, 1)
    available_score = (
        round(weighted_points / available_weight, 1) if available_weight > 0 else None
    )
    gate = _drawdown_gate(payload.drawdown_pct)

    if gate == "DORMANT_NO_BOTTOM_EVENT":
        state, action = "DORMANT", "NONE"
    elif available_weight < MIN_COVERAGE_FOR_SIGNAL:
        state, action = "INSUFFICIENT_COVERAGE", "COLLECT_MISSING_DATA"
    elif gate == "WATCH":
        state, action = "WATCH", "MONITOR"
    else:
        state, action = _score_state(score)

    return BottomScoreResult(
        engine="MARKET_BOTTOM_DETECTION_OMEGA_v1",
        label=payload.label,
        drawdownPct=round(float(payload.drawdown_pct), 2),
        drawdownGate=gate,
        score=score,
        availableScore=available_score,
        coveragePct=coverage_pct,
        state=state,
        action=action,
        components=component_map,
        weights=WEIGHTS,
        evidence=payload.evidence,
        guardrail=(
            "BottomScore is a confirmation engine, not a standalone BUY signal. "
            "RSI/oversold readings never trigger a purchase by themselves. "
            "TACTICAL/CONFIRMED states still require QUALITY Ω, thesis integrity, "
            "and ENTRY TIMING Ω. Missing data is never silently imputed."
        ),
    )


EXAMPLES: dict[str, BottomScoreRequest] = {
    "near_ath_dormant": BottomScoreRequest(
        label="Near-ATH market / no bottom event",
        drawdown_pct=-2.1,
        components=BottomComponents(
            breadth=58,
            capitulation=10,
            divergences=35,
            price_structure=72,
            volatility_sentiment=45,
            leadership_rotation=62,
        ),
        evidence={"type": "synthetic", "purpose": "DRAWDOWN GATE example"},
    ),
    "false_bottom": BottomScoreRequest(
        label="False bottom / capitulation without confirmation",
        drawdown_pct=-14.0,
        components=BottomComponents(
            breadth=25,
            capitulation=70,
            divergences=45,
            price_structure=20,
            volatility_sentiment=70,
            leadership_rotation=20,
        ),
        evidence={
            "type": "synthetic",
            "pattern": "selling climax, weak breadth, no structural break",
        },
    ),
    "tactical_bottom": BottomScoreRequest(
        label="Tactical bottom candidate",
        drawdown_pct=-17.5,
        components=BottomComponents(
            breadth=65,
            capitulation=80,
            divergences=75,
            price_structure=58,
            volatility_sentiment=72,
            leadership_rotation=60,
        ),
        evidence={
            "type": "synthetic",
            "pattern": "capitulation + divergences + improving breadth",
        },
    ),
    "confirmed_bottom": BottomScoreRequest(
        label="Confirmed multi-layer bottom",
        drawdown_pct=-23.0,
        components=BottomComponents(
            breadth=82,
            capitulation=88,
            divergences=84,
            price_structure=80,
            volatility_sentiment=76,
            leadership_rotation=78,
        ),
        evidence={
            "type": "synthetic",
            "pattern": "breadth thrust + higher low + reaction-high breakout",
        },
    ),
    "industrial_recovery": BottomScoreRequest(
        label="Industrial quality recovery candidate",
        drawdown_pct=-31.0,
        components=BottomComponents(
            breadth=70,
            capitulation=75,
            divergences=82,
            price_structure=77,
            volatility_sentiment=65,
            leadership_rotation=84,
        ),
        evidence={
            "type": "synthetic",
            "extra_gate": (
                "ROIC stable + FCF positive + net debt/EBITDA <3x + backlog intact + "
                "EPS revisions stabilizing + RS vs XLI improving"
            ),
        },
    ),
}


@router.post("", response_model=BottomScoreResult)
async def bottom_score(payload: BottomScoreRequest) -> BottomScoreResult:
    return calculate_bottom_score(payload)


@router.get("/examples")
async def bottom_score_examples() -> dict[str, Any]:
    return {
        "engine": "MARKET_BOTTOM_DETECTION_OMEGA_v1",
        "examplesAreSynthetic": True,
        "items": {
            key: calculate_bottom_score(payload).model_dump()
            for key, payload in EXAMPLES.items()
        },
    }


@router.get("/methodology")
async def bottom_score_methodology() -> dict[str, Any]:
    return {
        "engine": "MARKET_BOTTOM_DETECTION_OMEGA_v1",
        "sequence": [
            "capitulation",
            "oversold_exhaustion",
            "divergence",
            "breadth_improvement",
            "structural_breakout",
        ],
        "weights": WEIGHTS,
        "drawdownGate": {
            "<5%": "DORMANT_NO_BOTTOM_EVENT",
            "5-10%": "WATCH",
            "10-20%": "CORRECTION_MODE",
            ">=20%": "BEAR_FULL_BOTTOM_DETECTION",
        },
        "scoreBands": {
            "0-39": "BEAR_TREND_ACTIVE",
            "40-59": "WATCH",
            "60-74": "TACTICAL_BOTTOM",
            "75-100": "CONFIRMED_BOTTOM",
        },
        "minimumCoverageForSignalPct": MIN_COVERAGE_FOR_SIGNAL * 100.0,
        "rule": (
            "No standalone oscillator can create a BUY. A bottom signal only becomes "
            "actionable after thesis/QUALITY Ω and ENTRY TIMING Ω validation."
        ),
    }
