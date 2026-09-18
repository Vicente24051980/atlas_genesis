"""ATLAS Ω — evidence-only evaluators for 17–18 SEP 2026 thread.

No function in this module may promote canon, alter portfolio state, or execute trades.
Outputs are observations/proposals that require human review.
"""
from __future__ import annotations
from dataclasses import dataclass
from enum import Enum
from typing import Iterable, Optional


class EpistemicClass(str, Enum):
    FACT = "FACT"
    HYPOTHESIS = "HYPOTHESIS"
    INTERPRETATION = "INTERPRETATION"
    NOISE = "NOISE"


class ReviewStatus(str, Enum):
    OBSERVATION = "OBSERVATION"
    PROPOSAL = "PROPOSAL"
    HUMAN_REVIEW_REQUIRED = "HUMAN_REVIEW_REQUIRED"


@dataclass(frozen=True)
class Evidence:
    claim: str
    epistemic_class: EpistemicClass
    source: str
    as_of: str
    corroborated: bool = False


@dataclass(frozen=True)
class GateResult:
    name: str
    status: ReviewStatus
    evidence_count: int
    falsifiers: tuple[str, ...]
    note: str


def _facts(evidence: Iterable[Evidence]) -> list[Evidence]:
    return [e for e in evidence if e.epistemic_class is EpistemicClass.FACT]


def ai_value_capture_gate(
    evidence: Iterable[Evidence],
    *,
    revenue_capture_known: bool,
    inference_cost_known: bool,
    fcf_known: bool,
) -> GateResult:
    """Value created != revenue captured != FCF captured."""
    facts = _facts(evidence)
    missing = []
    if not revenue_capture_known:
        missing.append("revenue capture not demonstrated")
    if not inference_cost_known:
        missing.append("inference economics not demonstrated")
    if not fcf_known:
        missing.append("FCF conversion not demonstrated")
    return GateResult(
        "AI_VALUE_CAPTURE",
        ReviewStatus.HUMAN_REVIEW_REQUIRED if not missing and facts else ReviewStatus.OBSERVATION,
        len(facts),
        tuple(missing),
        "Economic value -> addressable spend -> share -> revenue -> gross margin -> operating margin -> FCF -> sustainable multiple.",
    )


def agent_economics_gate(
    evidence: Iterable[Evidence],
    *,
    repeat_usage: bool,
    paid_demand: bool,
    unit_economics: bool,
    transaction_evidence: bool,
) -> GateResult:
    """Agent capability != agent economics."""
    facts = _facts(evidence)
    falsifiers = tuple(
        label for ok, label in (
            (repeat_usage, "repeat usage/retention absent"),
            (paid_demand, "willingness to pay absent"),
            (unit_economics, "unit economics absent"),
            (transaction_evidence, "real transaction evidence absent"),
        ) if not ok
    )
    return GateResult(
        "AGENT_ECONOMICS",
        ReviewStatus.HUMAN_REVIEW_REQUIRED if facts and not falsifiers else ReviewStatus.OBSERVATION,
        len(facts),
        falsifiers,
        "Capability -> execution -> frequency -> retention -> transactions -> willingness to pay -> unit economics -> monetization -> FCF.",
    )


def agentic_commerce_gate(
    evidence: Iterable[Evidence],
    *,
    conversion_data: bool,
    advertiser_economics: bool,
    platform_revenue: bool,
) -> GateResult:
    facts = _facts(evidence)
    falsifiers = tuple(
        label for ok, label in (
            (conversion_data, "conversion/transaction data absent"),
            (advertiser_economics, "advertiser CAC/ROI absent"),
            (platform_revenue, "platform revenue/margin absent"),
        ) if not ok
    )
    return GateResult(
        "AGENTIC_COMMERCE",
        ReviewStatus.HUMAN_REVIEW_REQUIRED if facts and not falsifiers else ReviewStatus.OBSERVATION,
        len(facts),
        falsifiers,
        "Search/social/recommendation ads -> conversational ad -> sponsored agent -> transaction.",
    )


HEALTH_STAGES = (
    "DISCOVERY", "PRECLINICAL", "PHASE_I", "PHASE_II", "PHASE_III",
    "REGULATORY_APPROVAL", "REIMBURSEMENT", "ADDRESSABLE_PATIENTS",
    "ADOPTION", "REVENUE", "OPERATING_LEVERAGE", "FCF",
)


def health_innovation_gate(
    evidence: Iterable[Evidence],
    *,
    reached_stage: str,
    commercial_evidence: bool = False,
) -> GateResult:
    """Clinical evidence != commercial evidence."""
    if reached_stage not in HEALTH_STAGES:
        raise ValueError(f"unknown health stage: {reached_stage}")
    facts = _facts(evidence)
    commercial_stages = {"REIMBURSEMENT", "ADDRESSABLE_PATIENTS", "ADOPTION", "REVENUE", "OPERATING_LEVERAGE", "FCF"}
    falsifiers: list[str] = []
    if reached_stage not in commercial_stages:
        falsifiers.append("commercial conversion not reached")
    if not commercial_evidence:
        falsifiers.append("commercial evidence absent")
    return GateResult(
        "HEALTH_INNOVATION_CONVERSION",
        ReviewStatus.HUMAN_REVIEW_REQUIRED if facts and not falsifiers else ReviewStatus.OBSERVATION,
        len(facts),
        tuple(falsifiers),
        "Clinical evidence must not be promoted into commercial evidence.",
    )


AI_CHAIN_LAYERS = ("COMPUTE", "INTERCONNECT", "NETWORKING", "MEMORY", "SOFTWARE")


def ai_chain_layer(layer: str) -> str:
    if layer not in AI_CHAIN_LAYERS:
        raise ValueError(f"unknown AI chain layer: {layer}")
    return layer


def memory_supply_gate(
    evidence: Iterable[Evidence],
    *,
    pricing_power: bool,
    contracted_supply: bool,
    demand_corroboration: bool,
) -> GateResult:
    facts = _facts(evidence)
    falsifiers = tuple(
        label for ok, label in (
            (pricing_power, "pricing power not demonstrated"),
            (contracted_supply, "supply tightness not contractually corroborated"),
            (demand_corroboration, "demand not independently corroborated"),
        ) if not ok
    )
    return GateResult(
        "MEMORY_SUPPLY",
        ReviewStatus.HUMAN_REVIEW_REQUIRED if facts and not falsifiers else ReviewStatus.OBSERVATION,
        len(facts),
        falsifiers,
        "Price action alone cannot establish memory supply tightness or a supercycle.",
    )


def valuation_scenario(valuation: float, revenue_multiple: float, annual_arpu: float) -> dict[str, float]:
    """Mechanical scenario only; never a fair-value conclusion."""
    if min(valuation, revenue_multiple, annual_arpu) <= 0:
        raise ValueError("inputs must be positive")
    revenue_required = valuation / revenue_multiple
    return {
        "revenue_required": revenue_required,
        "subscriber_equivalents": revenue_required / annual_arpu,
    }
