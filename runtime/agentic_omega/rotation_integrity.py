"""ATLAS Ω — Rotation Integrity & receiver confirmation.

Separates price action, breadth, relative strength, persistence and economic proof.
Prevents sector-level labels from being inferred from a heterogeneous subsector.
"""
from dataclasses import dataclass
from enum import Enum
from typing import Iterable

class RotationState(str, Enum):
    CONFIRMED_RECEIVER = "CONFIRMED_RECEIVER"
    IMPROVING = "IMPROVING"
    DIVERGENT = "DIVERGENT"
    DETERIORATING = "DETERIORATING"
    LOSING = "LOSING"
    INSUFFICIENT_EVIDENCE = "INSUFFICIENT_EVIDENCE"

@dataclass(frozen=True)
class RotationInput:
    relative_return: float | None
    breadth: float | None
    persistence_sessions: int
    economic_proof: float | None = None
    valuation_support: float | None = None
    data_age_hours: float = 999.0
    homogeneous_window: bool = False

@dataclass(frozen=True)
class RotationResult:
    state: RotationState
    score: float | None
    executable: bool
    reasons: tuple[str, ...]


def rotation_integrity(x: RotationInput) -> RotationResult:
    reasons=[]
    if x.data_age_hours > 24:
        return RotationResult(RotationState.INSUFFICIENT_EVIDENCE, None, False, ("STALE_MARKET_DATA",))
    if not x.homogeneous_window or x.relative_return is None or x.breadth is None:
        return RotationResult(RotationState.INSUFFICIENT_EVIDENCE, None, False, ("NON_HOMOGENEOUS_OR_MISSING_WINDOW",))
    breadth=max(0.0,min(1.0,x.breadth))
    persistence=max(0.0,min(1.0,x.persistence_sessions/5.0))
    rs=max(-1.0,min(1.0,x.relative_return/0.05))
    econ=0.5 if x.economic_proof is None else max(0.0,min(1.0,x.economic_proof))
    val=0.5 if x.valuation_support is None else max(0.0,min(1.0,x.valuation_support))
    score=100*(0.30*((rs+1)/2)+0.25*breadth+0.20*persistence+0.15*econ+0.10*val)
    if rs > .15 and breadth >= .60 and x.persistence_sessions >= 3:
        state=RotationState.CONFIRMED_RECEIVER
    elif rs > 0 and breadth >= .50:
        state=RotationState.IMPROVING
    elif rs < -.15 and breadth < .40:
        state=RotationState.LOSING
    elif rs < 0:
        state=RotationState.DETERIORATING
    else:
        state=RotationState.DIVERGENT
    executable=state is RotationState.CONFIRMED_RECEIVER and econ >= .60
    if state is RotationState.CONFIRMED_RECEIVER and econ < .60:
        reasons.append("PRICE_FLOW_WITHOUT_ECONOMIC_PROOF")
    return RotationResult(state, round(score,2), executable, tuple(reasons))

# Canonical law: SECTOR RETURN != SUBSECTOR FLOW != CAPITAL CAUSALITY.
# A receiver requires RS + breadth + persistence; Economic Proof is separately required for execution.
