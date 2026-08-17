from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass
from typing import Any

from .orchestrator import (
    AgenticRun,
    AppendOnlyEventLedger,
    EpistemicLabel,
    EvidenceAssertion,
    GateState,
    RunStatus,
    Specialist,
    SpecialistResult,
)


def _canonical_json(value: Any) -> str:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False, default=str)


@dataclass(frozen=True)
class RecoveredRunView:
    run_id: str
    objective: str
    context_hash: str
    result_count: int
    terminal_status: str | None
    recoverable: bool

    def to_dict(self) -> dict[str, Any]:
        return {
            "runId": self.run_id,
            "objective": self.objective,
            "contextHash": self.context_hash,
            "resultCount": self.result_count,
            "terminalStatus": self.terminal_status,
            "recoverable": self.recoverable,
        }


class RunRecovery:
    def __init__(self, ledger: AppendOnlyEventLedger) -> None:
        self.ledger = ledger

    def snapshot_context(self, run: AgenticRun) -> None:
        self.ledger.append(
            "RUN_CONTEXT_SNAPSHOT",
            {"run_id": run.run_id, "objective": run.objective, "context": run.context, "context_hash": run.context_hash},
        )

    def _events(self, run_id: str) -> list[dict[str, Any]]:
        return [event for event in self.ledger.events if event.get("payload", {}).get("run_id") == run_id]

    def view(self, run_id: str) -> RecoveredRunView:
        events = self._events(run_id)
        start = next((event["payload"] for event in events if event.get("event_type") == "RUN_STARTED"), None)
        if not start:
            raise KeyError(f"run not found: {run_id}")
        receipt = next((event["payload"] for event in reversed(events) if event.get("event_type") == "OUTCOME_RECEIPT"), None)
        snapshot = next((event["payload"] for event in reversed(events) if event.get("event_type") == "RUN_CONTEXT_SNAPSHOT"), None)
        count = sum(1 for event in events if event.get("event_type") == "SPECIALIST_RESULT")
        return RecoveredRunView(
            run_id=run_id,
            objective=str(start.get("objective") or ""),
            context_hash=str(start.get("context_hash") or ""),
            result_count=count,
            terminal_status=str(receipt.get("status")) if receipt else None,
            recoverable=receipt is None and snapshot is not None,
        )

    @staticmethod
    def _result(payload: dict[str, Any]) -> SpecialistResult:
        assertions = tuple(
            EvidenceAssertion(
                claim=item["claim"],
                label=EpistemicLabel(item["label"]),
                source=item.get("source", ""),
                observed_at=item.get("observed_at", ""),
                confidence=item.get("confidence"),
                freshness=item.get("freshness", ""),
                evidence_id=item.get("evidence_id") or "recovered",
            )
            for item in payload.get("assertions", [])
        )
        return SpecialistResult(
            specialist=Specialist(payload["specialist"]),
            gate_state=GateState(payload["gate_state"]),
            conclusion=payload["conclusion"],
            assertions=assertions,
            confidence=payload.get("confidence"),
            confirmed_falsifier=bool(payload.get("confirmed_falsifier")),
            metadata=payload.get("metadata") or {},
        )

    def recover_open_run(self, run_id: str) -> AgenticRun:
        events = self._events(run_id)
        start = next((event["payload"] for event in events if event.get("event_type") == "RUN_STARTED"), None)
        if not start:
            raise KeyError(f"run not found: {run_id}")
        if any(event.get("event_type") == "OUTCOME_RECEIPT" for event in events):
            raise ValueError("cannot recover a finalized run as OPEN")
        snapshot = next((event["payload"] for event in reversed(events) if event.get("event_type") == "RUN_CONTEXT_SNAPSHOT"), None)
        if not snapshot:
            raise ValueError("run predates context snapshots and cannot be resumed safely")
        context = snapshot.get("context") or {}
        expected_hash = str(start.get("context_hash") or snapshot.get("context_hash") or "")
        actual_hash = hashlib.sha256(_canonical_json(context).encode("utf-8")).hexdigest()
        if expected_hash and expected_hash != actual_hash:
            raise ValueError("run context hash mismatch during recovery")
        run = AgenticRun(
            objective=str(start.get("objective") or snapshot.get("objective") or "recovered run"),
            context=context,
            run_id=run_id,
            status=RunStatus.OPEN,
        )
        for event in events:
            if event.get("event_type") != "SPECIALIST_RESULT":
                continue
            result = self._result(event["payload"]["result"])
            run.results[result.specialist] = result
        return run
