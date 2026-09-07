from __future__ import annotations

import hashlib
import uuid
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from enum import Enum, IntEnum
from typing import Protocol, Sequence


class AutonomyLevel(IntEnum):
    L0_READ_ONLY = 0
    L1_PROPOSE = 1
    L2_SAFE_WRITE = 2
    L3_CONTROLLED_EXECUTION = 3
    L4_HUMAN_APPROVAL_REQUIRED = 4


class ActionOperation(str, Enum):
    READ = "READ"
    PROPOSE = "PROPOSE"
    WRITE = "WRITE"
    EXECUTE = "EXECUTE"
    COMMUNICATE = "COMMUNICATE"
    SCHEDULE = "SCHEDULE"
    DELEGATE = "DELEGATE"
    DELETE = "DELETE"
    MODIFY_CANON = "MODIFY_CANON"


class ActionDomain(str, Enum):
    INTERNAL = "INTERNAL"
    EXTERNAL = "EXTERNAL"
    FINANCIAL = "FINANCIAL"
    LEGAL = "LEGAL"
    MEDICAL = "MEDICAL"
    CREDENTIAL = "CREDENTIAL"
    PRODUCTION = "PRODUCTION"


class WorldStateClass(str, Enum):
    STABLE = "STABLE"
    TIME_SENSITIVE = "TIME_SENSITIVE"
    VOLATILE = "VOLATILE"
    UNKNOWN = "UNKNOWN"


class VerificationSource(str, Enum):
    TOOL_READBACK = "TOOL_READBACK"
    API_READBACK = "API_READBACK"
    FILE_HASH = "FILE_HASH"
    SYSTEM_OBSERVATION = "SYSTEM_OBSERVATION"
    HUMAN_CONFIRMATION = "HUMAN_CONFIRMATION"
    MODEL_SELF_REPORT = "MODEL_SELF_REPORT"


class ActionState(str, Enum):
    PROPOSED = "PROPOSED"
    AUTHORIZED = "AUTHORIZED"
    BLOCKED = "BLOCKED"
    EXECUTED_UNVERIFIED = "EXECUTED_UNVERIFIED"
    VERIFIED_COMPLETE = "VERIFIED_COMPLETE"
    UNKNOWN_POSTSTATE = "UNKNOWN_POSTSTATE"
    ROLLBACK_REQUIRED = "ROLLBACK_REQUIRED"


class EventLedger(Protocol):
    def append(self, event_type: str, payload: dict) -> dict: ...


@dataclass(frozen=True)
class ActionRequest:
    objective: str
    operation: ActionOperation
    domain: ActionDomain
    tool: str
    target: str
    idempotency_key: str
    requested_level: AutonomyLevel = AutonomyLevel.L0_READ_ONLY
    reversible: bool = False
    compensation_action: str = ""
    expected_postconditions: tuple[str, ...] = ()
    pre_state_class: WorldStateClass = WorldStateClass.UNKNOWN
    pre_state_verified: bool = False
    human_approval_id: str = ""
    decision_receipt_id: str = ""
    action_id: str = field(default_factory=lambda: uuid.uuid4().hex)

    def __post_init__(self) -> None:
        for name, value in {
            "objective": self.objective,
            "tool": self.tool,
            "target": self.target,
            "idempotency_key": self.idempotency_key,
        }.items():
            if not value.strip():
                raise ValueError(f"{name} must be non-empty")


@dataclass(frozen=True)
class PostconditionEvidence:
    postcondition: str
    source_kind: VerificationSource
    source: str
    observed_at: str
    matches_expected: bool
    evidence_id: str = field(default_factory=lambda: uuid.uuid4().hex)

    def __post_init__(self) -> None:
        if not self.postcondition.strip():
            raise ValueError("postcondition must be non-empty")
        if not self.source.strip():
            raise ValueError("source must be non-empty")
        if not self.observed_at.strip():
            raise ValueError("observed_at must be non-empty")


@dataclass(frozen=True)
class ActionReceipt:
    action_id: str
    state: ActionState
    required_level: AutonomyLevel
    reason: str
    idempotency_fingerprint: str
    evidence_ids: tuple[str, ...] = ()
    emitted_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


_OPERATION_FLOOR = {
    ActionOperation.READ: AutonomyLevel.L0_READ_ONLY,
    ActionOperation.PROPOSE: AutonomyLevel.L1_PROPOSE,
    ActionOperation.WRITE: AutonomyLevel.L2_SAFE_WRITE,
    ActionOperation.EXECUTE: AutonomyLevel.L3_CONTROLLED_EXECUTION,
    ActionOperation.SCHEDULE: AutonomyLevel.L3_CONTROLLED_EXECUTION,
    ActionOperation.DELEGATE: AutonomyLevel.L3_CONTROLLED_EXECUTION,
    ActionOperation.COMMUNICATE: AutonomyLevel.L4_HUMAN_APPROVAL_REQUIRED,
    ActionOperation.DELETE: AutonomyLevel.L4_HUMAN_APPROVAL_REQUIRED,
    ActionOperation.MODIFY_CANON: AutonomyLevel.L4_HUMAN_APPROVAL_REQUIRED,
}

_HUMAN_APPROVAL_DOMAINS = {
    ActionDomain.EXTERNAL,
    ActionDomain.FINANCIAL,
    ActionDomain.LEGAL,
    ActionDomain.MEDICAL,
    ActionDomain.CREDENTIAL,
    ActionDomain.PRODUCTION,
}

_INDEPENDENT_VERIFICATION_SOURCES = {
    VerificationSource.TOOL_READBACK,
    VerificationSource.API_READBACK,
    VerificationSource.FILE_HASH,
    VerificationSource.SYSTEM_OBSERVATION,
    VerificationSource.HUMAN_CONFIRMATION,
}


def autonomy_required(request: ActionRequest) -> AutonomyLevel:
    required = _OPERATION_FLOOR[request.operation]
    if request.domain in _HUMAN_APPROVAL_DOMAINS:
        required = max(required, AutonomyLevel.L4_HUMAN_APPROVAL_REQUIRED)
    if request.operation is ActionOperation.WRITE and not request.reversible:
        required = max(required, AutonomyLevel.L3_CONTROLLED_EXECUTION)
    return AutonomyLevel(max(int(required), int(request.requested_level)))


def _fingerprint(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


class AgenticExecutionController:
    """E5/E6 action state machine.

    This controller never decides *what* ATLAS should do. It only decides
    whether an already-produced action request may cross the execution
    boundary and whether the external post-state has been independently
    verified.
    """

    def __init__(self, ledger: EventLedger | None = None) -> None:
        self.ledger = ledger
        self._requests: dict[str, ActionRequest] = {}
        self._receipts: dict[str, ActionReceipt] = {}
        self._idempotency: dict[str, str] = {}
        self._execution_started: set[str] = set()

    def _emit(self, event_type: str, request: ActionRequest, receipt: ActionReceipt) -> ActionReceipt:
        self._receipts[request.action_id] = receipt
        if self.ledger is not None:
            self.ledger.append(
                event_type,
                {
                    "action_id": request.action_id,
                    "operation": request.operation.value,
                    "domain": request.domain.value,
                    "tool": request.tool,
                    "target": request.target,
                    "decision_receipt_id": request.decision_receipt_id,
                    "receipt": {
                        **asdict(receipt),
                        "state": receipt.state.value,
                        "required_level": int(receipt.required_level),
                    },
                },
            )
        return receipt

    def authorize(self, request: ActionRequest) -> ActionReceipt:
        required = autonomy_required(request)
        fp = _fingerprint(request.idempotency_key)

        existing_action = self._idempotency.get(fp)
        if existing_action is not None:
            receipt = ActionReceipt(
                action_id=request.action_id,
                state=ActionState.BLOCKED,
                required_level=required,
                reason=f"DUPLICATE_ACTION: idempotency key already bound to {existing_action}",
                idempotency_fingerprint=fp,
            )
            return self._emit("ACTION_BLOCKED", request, receipt)

        reason = self._authorization_block_reason(request, required)
        if reason:
            receipt = ActionReceipt(
                action_id=request.action_id,
                state=ActionState.BLOCKED,
                required_level=required,
                reason=reason,
                idempotency_fingerprint=fp,
            )
            return self._emit("ACTION_BLOCKED", request, receipt)

        self._idempotency[fp] = request.action_id
        self._requests[request.action_id] = request
        receipt = ActionReceipt(
            action_id=request.action_id,
            state=ActionState.AUTHORIZED,
            required_level=required,
            reason="E5 authorization conditions satisfied; execution is not yet evidence of completion",
            idempotency_fingerprint=fp,
        )
        return self._emit("ACTION_AUTHORIZED", request, receipt)

    def _authorization_block_reason(
        self,
        request: ActionRequest,
        required: AutonomyLevel,
    ) -> str:
        if request.operation is ActionOperation.MODIFY_CANON:
            return "MODIFY_CANON requires a separate human governance action; agentic execution cannot self-authorize"

        if required >= AutonomyLevel.L2_SAFE_WRITE and not request.expected_postconditions:
            return "WRITE_OR_EXECUTE_REQUIRES_EXPLICIT_POSTCONDITIONS"

        if required is AutonomyLevel.L2_SAFE_WRITE:
            if not request.reversible or not request.compensation_action.strip():
                return "L2_SAFE_WRITE_REQUIRES_REVERSIBILITY_AND_COMPENSATION"

        if required >= AutonomyLevel.L3_CONTROLLED_EXECUTION:
            if request.pre_state_class is WorldStateClass.UNKNOWN:
                return "ACTION_BLOCKED_STALE_ASSUMPTION: pre-state UNKNOWN"
            if not request.pre_state_verified:
                return "ACTION_BLOCKED_STALE_ASSUMPTION: material pre-state not verified"

        if required is AutonomyLevel.L4_HUMAN_APPROVAL_REQUIRED and not request.human_approval_id.strip():
            return "HUMAN_APPROVAL_REQUIRED"

        return ""

    def mark_executed(
        self,
        action_id: str,
        *,
        execution_reference: str,
        agent_claim: str = "",
    ) -> ActionReceipt:
        request = self._require_authorized(action_id)
        previous = self._receipts[action_id]
        if action_id in self._execution_started or previous.state is not ActionState.AUTHORIZED:
            raise RuntimeError("duplicate or invalid execution transition")
        if not execution_reference.strip():
            raise ValueError("execution_reference must be non-empty")

        self._execution_started.add(action_id)
        receipt = ActionReceipt(
            action_id=action_id,
            state=ActionState.EXECUTED_UNVERIFIED,
            required_level=previous.required_level,
            reason=(
                "tool/action execution was reported but postconditions are not yet independently verified"
                + (f"; agent_claim={agent_claim.strip()}" if agent_claim.strip() else "")
            ),
            idempotency_fingerprint=previous.idempotency_fingerprint,
        )
        return self._emit("ACTION_EXECUTED_UNVERIFIED", request, receipt)

    def verify(
        self,
        action_id: str,
        evidence: Sequence[PostconditionEvidence],
    ) -> ActionReceipt:
        request = self._require_authorized(action_id)
        previous = self._receipts[action_id]
        if previous.state not in {
            ActionState.EXECUTED_UNVERIFIED,
            ActionState.UNKNOWN_POSTSTATE,
        }:
            raise RuntimeError("verification requires an executed, unverified action")

        expected = tuple(request.expected_postconditions)
        by_postcondition: dict[str, list[PostconditionEvidence]] = {item: [] for item in expected}
        for item in evidence:
            if item.postcondition in by_postcondition:
                by_postcondition[item.postcondition].append(item)

        evidence_ids = tuple(item.evidence_id for item in evidence)
        if any(item.source_kind is VerificationSource.MODEL_SELF_REPORT for item in evidence):
            receipt = ActionReceipt(
                action_id=action_id,
                state=ActionState.EXECUTED_UNVERIFIED,
                required_level=previous.required_level,
                reason="MODEL_SELF_REPORT_IS_NOT_POSTSTATE_EVIDENCE",
                idempotency_fingerprint=previous.idempotency_fingerprint,
                evidence_ids=evidence_ids,
            )
            return self._emit("ACTION_VERIFICATION_INSUFFICIENT", request, receipt)

        missing = [name for name, items in by_postcondition.items() if not items]
        if missing:
            receipt = ActionReceipt(
                action_id=action_id,
                state=ActionState.EXECUTED_UNVERIFIED,
                required_level=previous.required_level,
                reason="MISSING_POSTCONDITION_EVIDENCE: " + ", ".join(missing),
                idempotency_fingerprint=previous.idempotency_fingerprint,
                evidence_ids=evidence_ids,
            )
            return self._emit("ACTION_VERIFICATION_INSUFFICIENT", request, receipt)

        conflict = any(
            len({item.matches_expected for item in items}) > 1
            for items in by_postcondition.values()
        )
        if conflict:
            receipt = ActionReceipt(
                action_id=action_id,
                state=ActionState.UNKNOWN_POSTSTATE,
                required_level=previous.required_level,
                reason="CONFLICTING_POSTCONDITION_EVIDENCE",
                idempotency_fingerprint=previous.idempotency_fingerprint,
                evidence_ids=evidence_ids,
            )
            return self._emit("ACTION_POSTSTATE_UNKNOWN", request, receipt)

        failed = [
            name
            for name, items in by_postcondition.items()
            if any(not item.matches_expected for item in items)
        ]
        if failed:
            state = ActionState.ROLLBACK_REQUIRED if request.reversible else ActionState.UNKNOWN_POSTSTATE
            receipt = ActionReceipt(
                action_id=action_id,
                state=state,
                required_level=previous.required_level,
                reason="POSTCONDITION_FAILED: " + ", ".join(failed),
                idempotency_fingerprint=previous.idempotency_fingerprint,
                evidence_ids=evidence_ids,
            )
            event = "ACTION_ROLLBACK_REQUIRED" if state is ActionState.ROLLBACK_REQUIRED else "ACTION_POSTSTATE_UNKNOWN"
            return self._emit(event, request, receipt)

        if any(item.source_kind not in _INDEPENDENT_VERIFICATION_SOURCES for item in evidence):
            receipt = ActionReceipt(
                action_id=action_id,
                state=ActionState.EXECUTED_UNVERIFIED,
                required_level=previous.required_level,
                reason="INDEPENDENT_VERIFICATION_SOURCE_REQUIRED",
                idempotency_fingerprint=previous.idempotency_fingerprint,
                evidence_ids=evidence_ids,
            )
            return self._emit("ACTION_VERIFICATION_INSUFFICIENT", request, receipt)

        receipt = ActionReceipt(
            action_id=action_id,
            state=ActionState.VERIFIED_COMPLETE,
            required_level=previous.required_level,
            reason="all declared postconditions independently verified",
            idempotency_fingerprint=previous.idempotency_fingerprint,
            evidence_ids=evidence_ids,
        )
        return self._emit("ACTION_VERIFIED_COMPLETE", request, receipt)

    def receipt(self, action_id: str) -> ActionReceipt:
        try:
            return self._receipts[action_id]
        except KeyError as exc:
            raise KeyError(f"unknown action_id: {action_id}") from exc

    def _require_authorized(self, action_id: str) -> ActionRequest:
        try:
            return self._requests[action_id]
        except KeyError as exc:
            raise RuntimeError("action is not authorized") from exc
