from __future__ import annotations

from dataclasses import dataclass

from .ai_demand_engines import SignalState


def _unit(name: str, value: float) -> None:
    if not 0.0 <= value <= 1.0:
        raise ValueError(f"{name} must be between 0 and 1")


@dataclass(frozen=True)
class PostNVDATransmissionInput:
    physical_demand_proof: float
    supply_constraint_visibility: float
    memory_hbm_breadth: float
    equipment_breadth: float
    foundry_packaging_breadth: float
    networking_breadth: float
    server_power_breadth: float
    transregional_confirmation: float
    regular_session_persistence: float
    relative_strength: float
    volume_confirmation: float
    margin_capture: float
    fcf_revision: float
    scarcity_already_priced: float
    circular_financing_risk: float


@dataclass(frozen=True)
class PostNVDATransmissionResult:
    physical_score: float
    equity_transmission_score: float
    persistence_score: float
    owner_economics_score: float
    signal: SignalState
    jump_confirmed: bool
    persistent_jump_confirmed: bool
    portfolio_action_allowed: bool
    reason: str


def evaluate_post_nvda_transmission(data: PostNVDATransmissionInput) -> PostNVDATransmissionResult:
    """Audit propagation from accelerator demand into the physical AI supply chain.

    A post-earnings sympathy move cannot by itself authorize portfolio action. Breadth must
    cross several economic layers and regions, then survive the regular session. Owner
    economics additionally require margin/FCF capture after scarcity already priced and
    circular-financing risk are deducted.
    """
    for name, value in data.__dict__.items():
        _unit(name, value)

    physical = 0.60 * data.physical_demand_proof + 0.40 * data.supply_constraint_visibility
    layer_breadth = (
        0.24 * data.memory_hbm_breadth
        + 0.14 * data.equipment_breadth
        + 0.14 * data.foundry_packaging_breadth
        + 0.24 * data.networking_breadth
        + 0.24 * data.server_power_breadth
    )
    transmission = 0.55 * layer_breadth + 0.45 * data.transregional_confirmation
    persistence = (
        0.45 * data.regular_session_persistence
        + 0.30 * data.relative_strength
        + 0.25 * data.volume_confirmation
    )
    owner = max(
        0.0,
        min(
            1.0,
            (0.45 * data.margin_capture + 0.55 * data.fcf_revision)
            * (1.0 - 0.55 * data.scarcity_already_priced)
            * (1.0 - 0.45 * data.circular_financing_risk),
        ),
    )

    jump = physical >= 0.75 and transmission >= 0.68 and data.transregional_confirmation >= 0.65
    persistent = jump and persistence >= 0.65
    action = persistent and owner >= 0.60

    if action:
        signal = SignalState.GREEN_STRONG
        reason = "transregional breadth survived the regular session and converted into margin/FCF evidence after valuation and financing-risk discounts"
    elif persistent:
        signal = SignalState.GREEN_STRONG
        reason = "persistent supply-chain jump is confirmed, but owner-economics/price-paid proof is insufficient for portfolio authorization"
    elif jump:
        signal = SignalState.GREEN
        reason = "breadth jump is confirmed across layers and regions; persistence through regular trading remains unproven"
    elif physical >= 0.65:
        signal = SignalState.AMBER
        reason = "physical AI demand is credible but equity transmission is incomplete or too narrow"
    else:
        signal = SignalState.RED
        reason = "neither physical-demand proof nor broad equity transmission clears the gate"

    return PostNVDATransmissionResult(physical, transmission, persistence, owner, signal, jump, persistent, action, reason)


POST_NVDA_CANONICAL_LAWS = (
    "SYMPATHY MOVE != ECONOMIC CONFIRMATION",
    "PRICE STRENGTH != PHYSICAL DEMAND STRENGTH",
    "INVENTORY RELOCATION != END-DEMAND CONSUMPTION",
    "DEMAND GROWTH != MARGIN CAPTURE",
    "BREADTH JUMP != PERSISTENT JUMP",
    "TRANSREGIONAL CONFIRMATION != OWNER ECONOMICS",
    "SCARCITY BENEFIT TO SUPPLIER != BENEFIT TO ENTIRE SUPPLY CHAIN",
    "PHYSICAL DEMAND -> BREADTH -> PERSISTENCE -> MARGIN/FCF -> PRICE PAID",
)
