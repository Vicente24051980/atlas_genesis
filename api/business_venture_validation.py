from __future__ import annotations

import math
from enum import Enum
from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel, Field, model_validator

router = APIRouter(prefix="/v1/business-venture-validation", tags=["business-venture-validation"])


class VentureStage(str, Enum):
    DISCOVERED = "DISCOVERED"
    TEST = "TEST"
    VALIDATED = "VALIDATED"
    GO = "GO"
    KILL = "KILL"


class SourceRole(str, Enum):
    DISCOVERY_ONLY = "DISCOVERY_ONLY"
    PRIMARY_EVIDENCE = "PRIMARY_EVIDENCE"


class VentureSource(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    role: SourceRole = SourceRole.DISCOVERY_ONLY
    url: str | None = None


class ValidationThresholds(BaseModel):
    min_qualified_leads: int = Field(default=20, ge=1)
    min_qualified_deposits: int = Field(default=5, ge=1)
    min_lead_to_deposit_pct: float = Field(default=5.0, ge=0, le=100)
    min_paid_orders: int = Field(default=5, ge=1)
    min_channel_partners_contacted: int = Field(default=20, ge=1)
    min_channel_partners_active: int = Field(default=3, ge=1)
    min_realized_price: float = Field(default=700.0, gt=0)
    min_contribution_margin_pct: float = Field(default=45.0, ge=-1000, le=100)
    min_repeatable_cycles_for_go: int = Field(default=2, ge=1)


class VentureValidationInput(BaseModel):
    venture_name: str = Field(min_length=1, max_length=200)
    source: VentureSource
    test_plan_registered: bool = False

    survey_interest_pct: float | None = Field(default=None, ge=0, le=100)
    qualified_leads: int = Field(default=0, ge=0)
    qualified_deposits: int = Field(default=0, ge=0)
    paid_orders: int = Field(default=0, ge=0)

    target_price_points: list[float] = Field(default_factory=list)
    modeled_price_per_booking: float | None = Field(default=None, gt=0)
    realized_price_per_booking: float | None = Field(default=None, gt=0)

    channel_partners_contacted: int = Field(default=0, ge=0)
    channel_partners_active: int = Field(default=0, ge=0)

    fulfillment_variable_cost_per_booking: float | None = Field(default=None, ge=0)
    cac_per_booking: float | None = Field(default=None, ge=0)
    fixed_launch_or_batch_cost: float | None = Field(default=None, ge=0)
    bookings_per_launch_or_batch: int | None = Field(default=None, ge=1)

    repeatable_paid_cycles: int = Field(default=0, ge=0)
    legal_compliance_verified: bool = False
    custody_traceability_verified: bool = False
    operator_quote_verified: bool = False

    terminal_failure_reason: str | None = Field(default=None, max_length=2000)
    notes: dict[str, Any] = Field(default_factory=dict)

    @model_validator(mode="after")
    def validate_counts(self):
        if self.qualified_deposits > self.qualified_leads:
            raise ValueError("qualified_deposits cannot exceed qualified_leads")
        if self.paid_orders > self.qualified_deposits:
            raise ValueError("paid_orders cannot exceed qualified_deposits")
        if self.channel_partners_active > self.channel_partners_contacted:
            raise ValueError("channel_partners_active cannot exceed channel_partners_contacted")
        return self


class DerivedMetrics(BaseModel):
    lead_to_deposit_pct: float | None = None
    channel_activation_pct: float | None = None
    economic_price_basis: str | None = None
    contribution_margin_pct: float | None = None
    break_even_bookings_per_launch_or_batch: int | None = None


class GateResult(BaseModel):
    pass_gate: bool
    reason: str


class VentureAssessment(BaseModel):
    venture_name: str
    stage: VentureStage
    score_weight: float = 0.0
    portfolio_authority: bool = False
    canon_write_authority: bool = False
    source_decision_authority: bool = False
    law: str = (
        "SURVEY_INTEREST != WILLINGNESS_TO_PAY != DEPOSIT != PURCHASE != "
        "REPEATABLE_DEMAND != PROFITABLE_UNIT_ECONOMICS"
    )
    derived: DerivedMetrics
    gates: dict[str, GateResult]
    blockers: list[str]
    next_actions: list[str]


def _pct(numerator: int, denominator: int) -> float | None:
    if denominator <= 0:
        return None
    return round(numerator / denominator * 100.0, 4)


def _economics(req: VentureValidationInput) -> DerivedMetrics:
    lead_to_deposit_pct = _pct(req.qualified_deposits, req.qualified_leads)
    channel_activation_pct = _pct(req.channel_partners_active, req.channel_partners_contacted)

    price = req.realized_price_per_booking or req.modeled_price_per_booking
    price_basis = None
    if req.realized_price_per_booking is not None:
        price_basis = "REALIZED"
    elif req.modeled_price_per_booking is not None:
        price_basis = "MODELED"

    contribution_margin_pct = None
    break_even = None
    if (
        price is not None
        and req.fulfillment_variable_cost_per_booking is not None
        and req.cac_per_booking is not None
        and req.fixed_launch_or_batch_cost is not None
        and req.bookings_per_launch_or_batch is not None
    ):
        variable_per_booking = req.fulfillment_variable_cost_per_booking + req.cac_per_booking
        revenue = price * req.bookings_per_launch_or_batch
        total_cost = variable_per_booking * req.bookings_per_launch_or_batch + req.fixed_launch_or_batch_cost
        if revenue > 0:
            contribution_margin_pct = round((revenue - total_cost) / revenue * 100.0, 4)
        unit_contribution_before_fixed = price - variable_per_booking
        if unit_contribution_before_fixed > 0:
            break_even = math.ceil(req.fixed_launch_or_batch_cost / unit_contribution_before_fixed)

    return DerivedMetrics(
        lead_to_deposit_pct=lead_to_deposit_pct,
        channel_activation_pct=channel_activation_pct,
        economic_price_basis=price_basis,
        contribution_margin_pct=contribution_margin_pct,
        break_even_bookings_per_launch_or_batch=break_even,
    )


def evaluate_venture(
    req: VentureValidationInput,
    thresholds: ValidationThresholds | None = None,
) -> VentureAssessment:
    t = thresholds or ValidationThresholds()
    d = _economics(req)

    survey_gate = GateResult(
        pass_gate=False,
        reason="Survey interest is discovery evidence only and never proves willingness to pay.",
    )

    deposit_gate = GateResult(
        pass_gate=(
            req.qualified_leads >= t.min_qualified_leads
            and req.qualified_deposits >= t.min_qualified_deposits
            and d.lead_to_deposit_pct is not None
            and d.lead_to_deposit_pct >= t.min_lead_to_deposit_pct
        ),
        reason=(
            f"Need >= {t.min_qualified_leads} qualified leads, >= {t.min_qualified_deposits} deposits "
            f"and >= {t.min_lead_to_deposit_pct:.1f}% lead-to-deposit conversion."
        ),
    )

    purchase_gate = GateResult(
        pass_gate=req.paid_orders >= t.min_paid_orders,
        reason=f"Need >= {t.min_paid_orders} paid orders; deposits are not purchases.",
    )

    channel_gate = GateResult(
        pass_gate=(
            req.channel_partners_contacted >= t.min_channel_partners_contacted
            and req.channel_partners_active >= t.min_channel_partners_active
        ),
        reason=(
            f"Need >= {t.min_channel_partners_active} active channel partners from at least "
            f"{t.min_channel_partners_contacted} contacted."
        ),
    )

    realized_price_gate = GateResult(
        pass_gate=(
            req.realized_price_per_booking is not None
            and req.realized_price_per_booking >= t.min_realized_price
        ),
        reason=f"Need realized price >= {t.min_realized_price:.2f}; modeled pricing is not willingness to pay.",
    )

    unit_economics_gate = GateResult(
        pass_gate=(
            d.economic_price_basis == "REALIZED"
            and d.contribution_margin_pct is not None
            and d.contribution_margin_pct >= t.min_contribution_margin_pct
        ),
        reason=(
            f"Need realized contribution margin >= {t.min_contribution_margin_pct:.1f}% after fulfillment, "
            "CAC and fixed launch/batch cost."
        ),
    )

    repeatability_gate = GateResult(
        pass_gate=req.repeatable_paid_cycles >= t.min_repeatable_cycles_for_go,
        reason=f"Need >= {t.min_repeatable_cycles_for_go} repeatable paid cycles before GO.",
    )

    operations_gate = GateResult(
        pass_gate=(
            req.legal_compliance_verified
            and req.custody_traceability_verified
            and req.operator_quote_verified
        ),
        reason="Need verified legal/compliance, custody/traceability and operator economics before GO.",
    )

    gates = {
        "survey_is_nonbinding": survey_gate,
        "deposit_wtp": deposit_gate,
        "paid_purchase": purchase_gate,
        "channel": channel_gate,
        "realized_price": realized_price_gate,
        "unit_economics": unit_economics_gate,
        "repeatability": repeatability_gate,
        "operations": operations_gate,
    }

    core_validation_pass = all(
        gates[name].pass_gate
        for name in (
            "deposit_wtp",
            "paid_purchase",
            "channel",
            "realized_price",
            "unit_economics",
        )
    )

    if req.terminal_failure_reason:
        stage = VentureStage.KILL
    elif core_validation_pass and repeatability_gate.pass_gate and operations_gate.pass_gate:
        stage = VentureStage.GO
    elif core_validation_pass:
        stage = VentureStage.VALIDATED
    elif req.test_plan_registered:
        stage = VentureStage.TEST
    else:
        stage = VentureStage.DISCOVERED

    blockers: list[str] = []
    if req.terminal_failure_reason:
        blockers.append(f"TERMINAL_FAILURE: {req.terminal_failure_reason}")
    else:
        for name, gate in gates.items():
            if name == "survey_is_nonbinding":
                continue
            if not gate.pass_gate:
                blockers.append(f"{name.upper()}: {gate.reason}")

    next_actions: list[str] = []
    if stage == VentureStage.DISCOVERED:
        next_actions.append("Register a falsifiable live test plan before treating the idea as investable.")
    if stage == VentureStage.TEST:
        if not deposit_gate.pass_gate:
            next_actions.append("Run paid-WTP testing using qualified leads and refundable deposits.")
        if not purchase_gate.pass_gate:
            next_actions.append("Convert deposits into paid orders; do not count survey responses as demand.")
        if not channel_gate.pass_gate:
            next_actions.append("Run a channel pilot with real partners and measure active adoption, not stated interest.")
        if not realized_price_gate.pass_gate:
            next_actions.append("Test price points and record realized paid price, not modeled willingness to pay.")
        if not unit_economics_gate.pass_gate:
            next_actions.append("Recompute unit economics from realized price, true CAC and fully loaded variable/batch costs.")
    if stage == VentureStage.VALIDATED:
        if not repeatability_gate.pass_gate:
            next_actions.append("Repeat the paid cohort across at least two cycles before GO.")
        if not operations_gate.pass_gate:
            next_actions.append("Close legal, custody/traceability and operator-economics gates before GO.")
    if stage == VentureStage.GO:
        next_actions.append("GO is venture-validation authority only; it grants no portfolio, canon or CAPEX execution authority.")
    if stage == VentureStage.KILL:
        next_actions.append("Preserve the falsation evidence and stop CAPEX until a new hypothesis is explicitly preregistered.")

    return VentureAssessment(
        venture_name=req.venture_name,
        stage=stage,
        derived=d,
        gates=gates,
        blockers=blockers,
        next_actions=next_actions,
    )


@router.get("/policy")
async def policy() -> dict[str, Any]:
    return {
        "status": "SHADOW",
        "scoreWeight": 0,
        "portfolioAuthority": False,
        "canonWriteAuthority": False,
        "sourceDecisionAuthority": False,
        "stages": [stage.value for stage in VentureStage],
        "law": (
            "SURVEY_INTEREST != WILLINGNESS_TO_PAY != DEPOSIT != PURCHASE != "
            "REPEATABLE_DEMAND != PROFITABLE_UNIT_ECONOMICS"
        ),
        "thresholds": ValidationThresholds().model_dump(),
    }


@router.post("/evaluate", response_model=VentureAssessment)
async def evaluate(req: VentureValidationInput) -> VentureAssessment:
    return evaluate_venture(req)
