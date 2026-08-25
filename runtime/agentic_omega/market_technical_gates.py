"""ATLAS Ω market technical confirmation gates.

Technical/chart signals are confirmation/falsifier inputs only. They must never be
promoted to Fundamental/Economic Proof without primary economic evidence.
"""
from __future__ import annotations

from dataclasses import dataclass
from enum import Enum


class TechnicalGateState(str, Enum):
    RED = "RED"
    AMBER = "AMBER"
    GREEN = "GREEN"
    GREEN_STRONG = "GREEN_STRONG"
    WATCH_ONLY = "WATCH_ONLY"


class DurationStressRegime(str, Enum):
    RELIEF = "RELIEF"
    PRESSURE = "PRESSURE"
    STRESS = "STRESS"
    BREAKOUT_STRESS = "BREAKOUT_STRESS"


@dataclass(frozen=True)
class SOXTransmissionInput:
    nvda_fundamental_pass: bool
    sox_relative_strength_improving: bool
    equipment_c10_confirmed: bool
    memory_c12_confirmed: bool
    accelerators_c13_confirmed: bool
    networking_c14_confirmed: bool
    servers_c15_confirmed: bool
    persistence_hours: float


@dataclass(frozen=True)
class SOXTransmissionResult:
    state: TechnicalGateState
    confirmed_layers: int
    layer_jump_confirmed: bool
    portfolio_action_allowed: bool
    reason: str


def evaluate_sox_transmission(data: SOXTransmissionInput) -> SOXTransmissionResult:
    """Confirm an AI layer jump only when fundamentals transmit into broad equity action."""
    if data.persistence_hours < 0:
        raise ValueError("persistence_hours cannot be negative")

    layer_flags = (
        data.equipment_c10_confirmed,
        data.memory_c12_confirmed,
        data.accelerators_c13_confirmed,
        data.networking_c14_confirmed,
        data.servers_c15_confirmed,
    )
    confirmed = sum(layer_flags)

    if not data.nvda_fundamental_pass:
        return SOXTransmissionResult(TechnicalGateState.RED, confirmed, False, False, "NVDA fundamental gate failed; price action cannot manufacture Economic Proof")
    if not data.sox_relative_strength_improving:
        return SOXTransmissionResult(TechnicalGateState.AMBER, confirmed, False, False, "NVDA fundamentals passed but SOX relative strength has not confirmed transmission")
    if data.persistence_hours < 24:
        return SOXTransmissionResult(TechnicalGateState.AMBER, confirmed, False, False, "initial semiconductor reaction lacks the minimum 24h persistence window")
    if confirmed < 4:
        return SOXTransmissionResult(TechnicalGateState.GREEN, confirmed, False, False, "partial C10-C15 breadth exists but fewer than four monitored layers confirm")

    persistent = data.persistence_hours >= 72
    return SOXTransmissionResult(
        TechnicalGateState.GREEN_STRONG if persistent else TechnicalGateState.GREEN,
        confirmed,
        True,
        False,
        "broad C10-C15 transmission confirmed; normal valuation, capital-competition and macro gates still apply",
    )


@dataclass(frozen=True)
class DurationStressInput:
    treasury_30y_yield_pct: float
    monthly_breakout_confirmed: bool = False
    real_growth_supportive: bool = False
    earnings_revisions_supportive: bool = False
    term_premium_rising: bool = False
    inflation_risk_rising: bool = False
    fiscal_supply_pressure: bool = False


@dataclass(frozen=True)
class DurationStressResult:
    regime: DurationStressRegime
    state: TechnicalGateState
    valuation_headwind: bool
    macro_cause_penalty: int
    portfolio_action_allowed: bool
    reason: str


def evaluate_duration_stress(data: DurationStressInput) -> DurationStressResult:
    """Classify tactical 30Y yield stress while conditioning on the cause of the move.

    Thresholds are tactical chart-derived levels, not permanent structural laws.
    """
    y = data.treasury_30y_yield_pct
    if y < 0:
        raise ValueError("treasury_30y_yield_pct cannot be negative")

    if y < 5.10:
        regime = DurationStressRegime.RELIEF
    elif y < 5.25:
        regime = DurationStressRegime.PRESSURE
    elif y <= 5.38:
        regime = DurationStressRegime.STRESS
    else:
        regime = DurationStressRegime.BREAKOUT_STRESS if data.monthly_breakout_confirmed else DurationStressRegime.STRESS

    adverse_causes = sum((data.term_premium_rising, data.inflation_risk_rising, data.fiscal_supply_pressure))
    growth_offset = data.real_growth_supportive and data.earnings_revisions_supportive

    if regime == DurationStressRegime.RELIEF:
        state, headwind = TechnicalGateState.GREEN, False
        reason = "30Y yield is below the tactical pressure zone"
    elif regime == DurationStressRegime.PRESSURE:
        state, headwind = TechnicalGateState.AMBER, True
        reason = "30Y yield is in the tactical valuation-pressure zone"
    elif regime == DurationStressRegime.STRESS:
        state, headwind = TechnicalGateState.AMBER if growth_offset and adverse_causes == 0 else TechnicalGateState.RED, True
        reason = "30Y yield is in the tactical stress zone; cause decomposition determines severity"
    else:
        state, headwind = TechnicalGateState.RED, True
        reason = "30Y yield has a confirmed monthly breakout above the tactical stress band"

    return DurationStressResult(regime, state, headwind, adverse_causes, False, reason)


@dataclass(frozen=True)
class CryptoConvergenceInput:
    btc_above_gap_resistance: bool
    eth_above_gap_resistance: bool
    closing_confirmation: bool


@dataclass(frozen=True)
class CryptoConvergenceResult:
    state: TechnicalGateState
    convergence_confirmed: bool
    portfolio_action_allowed: bool
    reason: str


def evaluate_crypto_convergence(data: CryptoConvergenceInput) -> CryptoConvergenceResult:
    """Wave Ω only: BTC/ETH technical convergence cannot create Fundamental Proof."""
    converged = data.btc_above_gap_resistance and data.eth_above_gap_resistance and data.closing_confirmation
    if converged:
        return CryptoConvergenceResult(TechnicalGateState.GREEN, True, False, "BTC and ETH jointly confirmed the technical resistance break; Wave evidence only")
    if data.btc_above_gap_resistance != data.eth_above_gap_resistance:
        return CryptoConvergenceResult(TechnicalGateState.AMBER, False, False, "BTC/ETH divergence blocks technical convergence")
    return CryptoConvergenceResult(TechnicalGateState.WATCH_ONLY, False, False, "technical resistance remains unconfirmed")


TECHNICAL_GATE_CANONICAL_LAWS = (
    "TECHNICAL POSSIBILITY != PROBABILITY-WEIGHTED EXPECTED OUTCOME",
    "YIELD BREAKOUT != EQUITY CRASH AUTOMATICALLY",
    "AI ECONOMIC PROOF != AI EQUITY MONETIZATION",
    "NVDA BEAT != AI LAYER JUMP",
    "PRICE ACTION != FUNDAMENTAL PROOF",
    "MONTHLY CANDLE REFERENCE != LOWEST DAILY PRICE DURING MONTH",
)
