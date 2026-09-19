from __future__ import annotations

from dataclasses import asdict, dataclass
from enum import Enum

from .orchestrator import AppendOnlyEventLedger


class CorrectionStage(str, Enum):
    DETECTED = "DETECTED"
    CONTAINED = "CONTAINED"
    CORRECTED = "CORRECTED"
    VALIDATED = "VALIDATED"
    LEARNING_RECORDED = "LEARNING_RECORDED"


_STAGE_ORDER = (
    CorrectionStage.DETECTED,
    CorrectionStage.CONTAINED,
    CorrectionStage.CORRECTED,
    CorrectionStage.VALIDATED,
    CorrectionStage.LEARNING_RECORDED,
)


@dataclass(frozen=True)
class CorrectionReceipt:
    task_id: str
    error_id: str
    stage: CorrectionStage
    detail: str
    evidence_refs: tuple[str, ...]
    rollback_ref: str | None = None
    rollback_not_applicable_reason: str | None = None

    def __post_init__(self) -> None:
        if not self.task_id.strip() or not self.error_id.strip():
            raise ValueError("task_id and error_id are required")
        if not self.detail.strip():
            raise ValueError("correctability events require detail")
        evidence = tuple(ref.strip() for ref in self.evidence_refs if ref.strip())
        if not evidence:
            raise ValueError("correctability events require evidence_refs")
        if self.stage is CorrectionStage.CORRECTED:
            if not (self.rollback_ref and self.rollback_ref.strip()) and not (
                self.rollback_not_applicable_reason and self.rollback_not_applicable_reason.strip()
            ):
                raise ValueError("CORRECTED requires rollback_ref or an explicit rollback-not-applicable reason")


@dataclass(frozen=True)
class CorrectabilityStatus:
    error_id: str
    last_stage: CorrectionStage | None
    complete: bool
    missing_stages: tuple[CorrectionStage, ...]


class CorrectabilityTracker:
    """Append-only error lifecycle enforcing detect -> contain -> correct -> validate -> learn.

    The tracker intentionally refuses skipped or reordered stages. A green test after a
    patch is therefore not enough to erase the original failure: detection and containment
    remain preserved in the audit ledger, and learning is a separate terminal receipt.
    """

    EVENT_TYPE = "CORRECTABILITY_EVENT"

    def __init__(self, ledger: AppendOnlyEventLedger) -> None:
        self.ledger = ledger

    def _events_for(self, error_id: str) -> tuple[dict, ...]:
        return tuple(
            event
            for event in self.ledger.events
            if event.get("event_type") == self.EVENT_TYPE
            and event.get("payload", {}).get("error_id") == error_id
        )

    def status(self, error_id: str) -> CorrectabilityStatus:
        events = self._events_for(error_id)
        if not events:
            return CorrectabilityStatus(error_id, None, False, _STAGE_ORDER)
        stages = tuple(CorrectionStage(event["payload"]["stage"]) for event in events)
        last = stages[-1]
        missing = tuple(stage for stage in _STAGE_ORDER if stage not in stages)
        return CorrectabilityStatus(
            error_id=error_id,
            last_stage=last,
            complete=last is CorrectionStage.LEARNING_RECORDED and not missing,
            missing_stages=missing,
        )

    def record(self, receipt: CorrectionReceipt) -> dict:
        events = self._events_for(receipt.error_id)
        expected_index = len(events)
        if expected_index >= len(_STAGE_ORDER):
            raise RuntimeError("correctability lifecycle is already complete")
        expected_stage = _STAGE_ORDER[expected_index]
        if receipt.stage is not expected_stage:
            raise RuntimeError(
                f"invalid correctability transition: expected {expected_stage.value}, got {receipt.stage.value}"
            )

        payload = asdict(receipt)
        payload["stage"] = receipt.stage.value
        payload["evidence_refs"] = list(receipt.evidence_refs)
        return self.ledger.append(self.EVENT_TYPE, payload)
