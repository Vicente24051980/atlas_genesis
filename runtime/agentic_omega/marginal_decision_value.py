"""ATLAS Ω — Celia-derived Simplicity / Marginal Decision Value firewall.

This module does NOT copy a Celia Rubio portfolio or create a Celia trading signal.
It operationalizes the useful falsifier extracted from her public method:
additional ATLAS complexity must justify itself against a simpler counterfactual.

Authority: RESEARCH / GOVERNANCE ONLY. No BUY/SELL, sizing or broker authority.
"""
from dataclasses import dataclass
from enum import Enum
from typing import Optional


class MDVState(str, Enum):
    POSITIVE = "POSITIVE_MARGINAL_DECISION_VALUE"
    NO_DEMONSTRATED = "NO_DEMONSTRATED_INCREMENTAL_VALUE"
    NEGATIVE = "NEGATIVE_MARGINAL_DECISION_VALUE"
    NOT_TESTABLE = "NOT_TESTABLE_WITH_CURRENT_DATA"


@dataclass(frozen=True)
class CounterfactualOutcome:
    net_return: float
    max_drawdown: float
    turnover: float
    implementation_cost: float
    opportunity_cost: float = 0.0


@dataclass(frozen=True)
class MDVInput:
    module_name: str
    with_module: CounterfactualOutcome
    without_module: CounterfactualOutcome
    same_information_set: bool
    point_in_time: bool
    same_execution_convention: bool
    oos_or_prospective: bool
    minimum_observation_met: bool
    risk_penalty_per_drawdown_point: float = 0.0
    turnover_penalty: float = 0.0


@dataclass(frozen=True)
class MDVResult:
    module_name: str
    state: MDVState
    incremental_net_return: Optional[float]
    risk_adjusted_increment: Optional[float]
    authority: str = "GOVERNANCE_ONLY"
    reason: str = ""


def evaluate_mdv(x: MDVInput, materiality: float = 0.0) -> MDVResult:
    valid = (
        x.same_information_set
        and x.point_in_time
        and x.same_execution_convention
        and x.oos_or_prospective
        and x.minimum_observation_met
    )
    if not valid:
        return MDVResult(x.module_name, MDVState.NOT_TESTABLE, None, None,
                         reason="Counterfactual is not comparable/OOS/PIT or sample is insufficient")

    raw = x.with_module.net_return - x.without_module.net_return
    dd_delta = abs(x.with_module.max_drawdown) - abs(x.without_module.max_drawdown)
    turnover_delta = x.with_module.turnover - x.without_module.turnover
    adjusted = (
        raw
        - x.risk_penalty_per_drawdown_point * max(0.0, dd_delta)
        - x.turnover_penalty * max(0.0, turnover_delta)
        - (x.with_module.implementation_cost - x.without_module.implementation_cost)
        - (x.with_module.opportunity_cost - x.without_module.opportunity_cost)
    )

    if adjusted > materiality:
        state = MDVState.POSITIVE
    elif adjusted < -materiality:
        state = MDVState.NEGATIVE
    else:
        state = MDVState.NO_DEMONSTRATED
    return MDVResult(x.module_name, state, raw, adjusted)


@dataclass(frozen=True)
class SimplicityGateInput:
    atlas_net_return: float
    passive_net_return: float
    atlas_max_drawdown: float
    passive_max_drawdown: float
    atlas_turnover: float
    passive_turnover: float
    atlas_cost: float
    passive_cost: float
    prospective_sample_sufficient: bool


def complexity_justified(x: SimplicityGateInput) -> Optional[bool]:
    """Conservative falsifier, not a portfolio score.

    None means the prospective sample is insufficient. True requires ATLAS to beat
    the passive comparator net of explicit costs without worsening both drawdown and
    turnover. False means complexity is not justified by the observed evidence.
    """
    if not x.prospective_sample_sufficient:
        return None
    atlas = x.atlas_net_return - x.atlas_cost
    passive = x.passive_net_return - x.passive_cost
    return bool(
        atlas > passive
        and not (
            abs(x.atlas_max_drawdown) > abs(x.passive_max_drawdown)
            and x.atlas_turnover > x.passive_turnover
        )
    )
