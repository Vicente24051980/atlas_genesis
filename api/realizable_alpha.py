from __future__ import annotations

from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter(prefix="/v1/atlas/realizable-alpha", tags=["realizable-alpha"])


class BiasHaircuts(BaseModel):
    """Annualized percentage-point haircuts. Positive values reduce reported return."""

    survivorship: float = Field(default=0.0, ge=0, le=100)
    selection: float = Field(default=0.0, ge=0, le=100)
    lookahead: float = Field(default=0.0, ge=0, le=100)
    publication: float = Field(default=0.0, ge=0, le=100)
    model_overfit: float = Field(default=0.0, ge=0, le=100)
    other: float = Field(default=0.0, ge=0, le=100)


class FrictionCosts(BaseModel):
    """Annualized percentage-point implementation costs."""

    management_fee: float = Field(default=0.0, ge=0, le=100)
    transaction_costs: float = Field(default=0.0, ge=0, le=100)
    storage_insurance: float = Field(default=0.0, ge=0, le=100)
    slippage: float = Field(default=0.0, ge=0, le=100)
    illiquidity: float = Field(default=0.0, ge=0, le=100)
    taxes_other: float = Field(default=0.0, ge=0, le=100)


class RealizableAlphaRequest(BaseModel):
    label: str = Field(default="Strategy", min_length=1, max_length=120)
    reported_return_pct: float = Field(description="Annualized reported/claimed return in percent.")
    benchmark_return_pct: float = Field(description="Annualized benchmark return on the same nominal/real basis.")
    bias_haircuts: BiasHaircuts = Field(default_factory=BiasHaircuts)
    friction_costs: FrictionCosts = Field(default_factory=FrictionCosts)
    evidence_quality: float = Field(default=50.0, ge=0, le=100)
    out_of_sample_validated: bool = False
    live_validation_years: float = Field(default=0.0, ge=0, le=100)
    evidence: dict[str, Any] = Field(default_factory=dict)


class RealizableAlphaResult(BaseModel):
    engine: str
    label: str
    reportedReturnPct: float
    benchmarkReturnPct: float
    reportedAlphaPct: float
    totalBiasHaircutPct: float
    biasAdjustedReturnPct: float
    totalFrictionCostPct: float
    netRealizableReturnPct: float
    realizableAlphaPct: float
    alphaCaptureRatioPct: float | None
    evidenceQuality: float
    validationState: str
    state: str
    action: str
    biasHaircuts: dict[str, float]
    frictionCosts: dict[str, float]
    evidence: dict[str, Any]
    guardrail: str


def _validation_state(payload: RealizableAlphaRequest) -> str:
    if payload.evidence_quality < 60:
        return "LOW_EVIDENCE"
    if not payload.out_of_sample_validated:
        return "NO_OUT_OF_SAMPLE_VALIDATION"
    if payload.live_validation_years < 1.0:
        return "EARLY_VALIDATION"
    if payload.live_validation_years < 3.0:
        return "PARTIALLY_VALIDATED"
    return "VALIDATED"


def _state(reported_alpha: float, realizable_alpha: float, validation: str) -> tuple[str, str]:
    if reported_alpha > 0 and realizable_alpha <= 0:
        return "ALPHA_TRAP", "REJECT_OR_REDESIGN"
    if validation in {"LOW_EVIDENCE", "NO_OUT_OF_SAMPLE_VALIDATION"}:
        return "UNPROVEN", "PAPER_TRACK_AND_VALIDATE"
    if realizable_alpha <= 0:
        return "NO_REALIZABLE_ALPHA", "REJECT_OR_REDESIGN"
    if realizable_alpha < 2:
        return "MARGINAL_ALPHA", "WATCH_COSTS_AND_CAPACITY"
    if realizable_alpha < 5:
        return "POSITIVE_ALPHA", "ELIGIBLE_FOR_FURTHER_ATLAS_DILIGENCE"
    return "STRONG_ALPHA", "ELIGIBLE_FOR_FURTHER_ATLAS_DILIGENCE"


def calculate_realizable_alpha(payload: RealizableAlphaRequest) -> RealizableAlphaResult:
    bias_map = payload.bias_haircuts.model_dump()
    friction_map = payload.friction_costs.model_dump()

    total_bias = round(sum(float(v) for v in bias_map.values()), 4)
    total_friction = round(sum(float(v) for v in friction_map.values()), 4)

    reported_return = float(payload.reported_return_pct)
    benchmark_return = float(payload.benchmark_return_pct)
    reported_alpha = reported_return - benchmark_return
    bias_adjusted_return = reported_return - total_bias
    net_realizable_return = bias_adjusted_return - total_friction
    realizable_alpha = net_realizable_return - benchmark_return

    capture_ratio: float | None = None
    if reported_alpha > 0:
        capture_ratio = round((realizable_alpha / reported_alpha) * 100.0, 1)

    validation = _validation_state(payload)
    state, action = _state(reported_alpha, realizable_alpha, validation)

    return RealizableAlphaResult(
        engine="REALIZABLE_ALPHA_OMEGA_v1",
        label=payload.label,
        reportedReturnPct=round(reported_return, 4),
        benchmarkReturnPct=round(benchmark_return, 4),
        reportedAlphaPct=round(reported_alpha, 4),
        totalBiasHaircutPct=total_bias,
        biasAdjustedReturnPct=round(bias_adjusted_return, 4),
        totalFrictionCostPct=total_friction,
        netRealizableReturnPct=round(net_realizable_return, 4),
        realizableAlphaPct=round(realizable_alpha, 4),
        alphaCaptureRatioPct=capture_ratio,
        evidenceQuality=round(float(payload.evidence_quality), 1),
        validationState=validation,
        state=state,
        action=action,
        biasHaircuts=bias_map,
        frictionCosts=friction_map,
        evidence=payload.evidence,
        guardrail=(
            "REALIZABLE ALPHA Ω is an evidence/cost filter, not a standalone BUY/SELL engine. "
            "It does not modify ATLAS Quality Ω or GREEN CONTINUITY Ω. Claimed historical alpha "
            "must survive bias adjustment, implementation costs, benchmark comparison, and "
            "out-of-sample/live validation before it can influence an investment decision."
        ),
    )


EXAMPLES: dict[str, RealizableAlphaRequest] = {
    "alpha_trap": RealizableAlphaRequest(
        label="Illustrative collectible strategy",
        reported_return_pct=11.0,
        benchmark_return_pct=5.54,
        bias_haircuts=BiasHaircuts(survivorship=8.0, selection=1.8),
        friction_costs=FrictionCosts(management_fee=1.5, storage_insurance=0.6, transaction_costs=0.5),
        evidence_quality=72,
        out_of_sample_validated=True,
        live_validation_years=1.5,
        evidence={"type": "illustrative", "rule": "Never mix nominal and real return bases."},
    ),
    "unproven_backtest": RealizableAlphaRequest(
        label="High backtest / no live validation",
        reported_return_pct=18.0,
        benchmark_return_pct=9.0,
        bias_haircuts=BiasHaircuts(model_overfit=2.0, lookahead=1.0),
        friction_costs=FrictionCosts(transaction_costs=1.0, slippage=0.5),
        evidence_quality=55,
        out_of_sample_validated=False,
        live_validation_years=0,
    ),
    "validated_positive": RealizableAlphaRequest(
        label="Validated systematic strategy",
        reported_return_pct=14.0,
        benchmark_return_pct=8.0,
        bias_haircuts=BiasHaircuts(selection=0.5, model_overfit=0.5),
        friction_costs=FrictionCosts(transaction_costs=0.6, slippage=0.4),
        evidence_quality=90,
        out_of_sample_validated=True,
        live_validation_years=4.0,
    ),
}


@router.post("", response_model=RealizableAlphaResult)
async def realizable_alpha(payload: RealizableAlphaRequest) -> RealizableAlphaResult:
    return calculate_realizable_alpha(payload)


@router.get("/examples")
async def realizable_alpha_examples() -> dict[str, Any]:
    return {
        "engine": "REALIZABLE_ALPHA_OMEGA_v1",
        "examplesAreIllustrative": True,
        "items": {key: calculate_realizable_alpha(value).model_dump() for key, value in EXAMPLES.items()},
    }


@router.get("/methodology")
async def realizable_alpha_methodology() -> dict[str, Any]:
    return {
        "engine": "REALIZABLE_ALPHA_OMEGA_v1",
        "pipeline": [
            "reported_return",
            "benchmark_consistency_check",
            "bias_adjustment",
            "implementation_cost_adjustment",
            "realizable_alpha",
            "out_of_sample_and_live_validation",
        ],
        "states": ["ALPHA_TRAP", "UNPROVEN", "NO_REALIZABLE_ALPHA", "MARGINAL_ALPHA", "POSITIVE_ALPHA", "STRONG_ALPHA"],
        "mandatoryRule": "Reported return and benchmark must use the same nominal/real and time basis.",
        "integration": "QUALITY Ω -> IMPLIED RETURN Ω -> GREEN CONTINUITY Ω -> ENTRY TIMING Ω; REALIZABLE ALPHA Ω validates external strategies/backtests and claimed anomalies without overwriting those engines.",
    }
