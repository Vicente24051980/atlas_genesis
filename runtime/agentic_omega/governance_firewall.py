from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Iterable


class Capability(str, Enum):
    READ = "READ"
    WRITE = "WRITE"
    EXECUTE = "EXECUTE"
    PERSIST = "PERSIST"
    SCHEDULE = "SCHEDULE"
    SPAWN = "SPAWN"
    MESSAGE = "MESSAGE"
    EXTERNALIZE = "EXTERNALIZE"
    DELETE = "DELETE"
    INTER_AGENT_COMMUNICATION = "INTER_AGENT_COMMUNICATION"


class ConsequenceClass(str, Enum):
    C0_LOW = "C0_LOW"
    C1_MATERIAL = "C1_MATERIAL"
    C2_HIGH_CONSEQUENCE = "C2_HIGH_CONSEQUENCE"
    C3_SAFETY_CRITICAL_IRREVERSIBLE = "C3_SAFETY_CRITICAL_IRREVERSIBLE"


class AuthorityMode(str, Enum):
    EXECUTE = "EXECUTE"
    PROPOSE_VERIFY = "PROPOSE_VERIFY"
    INVESTIGATE_ESCALATE = "INVESTIGATE_ESCALATE"
    STOP = "STOP"


class ReassessmentAction(str, Enum):
    CONTINUE = "CONTINUE"
    COMPLETE = "COMPLETE"
    ESCALATE = "ESCALATE"
    ABORT = "ABORT"


class TerminationStatus(str, Enum):
    NOT_TERMINATED = "NOT_TERMINATED"
    VERIFIED_TERMINATED = "VERIFIED_TERMINATED"
    STATE_RECONCILED = "STATE_RECONCILED"


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _as_aware(value: datetime) -> datetime:
    if value.tzinfo is None:
        raise ValueError("timestamps must be timezone-aware")
    return value.astimezone(timezone.utc)


def _unit(name: str, value: float) -> None:
    if not 0.0 <= value <= 1.0:
        raise ValueError(f"{name} must be between 0 and 1")


@dataclass(frozen=True)
class CapabilityLease:
    """Task-scoped, expiring execution authority.

    A lease is deliberately narrower than a connector/tool capability. Technical
    availability never creates authority. WRITE does not imply PERSIST, MESSAGE
    does not imply INTER_AGENT_COMMUNICATION, and EXECUTE does not imply SPAWN,
    SCHEDULE or DELETE.
    """

    lease_id: str
    task_id: str
    subject: str
    scoped_resource: str
    capabilities: frozenset[Capability]
    issued_at: datetime
    expires_at: datetime
    owner_authorized: bool

    def __post_init__(self) -> None:
        if not self.lease_id.strip() or not self.task_id.strip() or not self.subject.strip():
            raise ValueError("lease_id, task_id and subject are required")
        if not self.scoped_resource.strip():
            raise ValueError("scoped_resource is required")
        if not self.capabilities:
            raise ValueError("a capability lease must contain at least one capability")
        issued = _as_aware(self.issued_at)
        expires = _as_aware(self.expires_at)
        if expires <= issued:
            raise ValueError("expires_at must be after issued_at")

    def _resource_matches(self, resource: str) -> bool:
        scope = self.scoped_resource.rstrip("/")
        candidate = resource.rstrip("/")
        if scope == "*":
            return True
        return candidate == scope or candidate.startswith(scope + "/")

    def permits(
        self,
        capability: Capability,
        *,
        task_id: str,
        resource: str,
        at: datetime | None = None,
    ) -> bool:
        now = _as_aware(at or _utc_now())
        return (
            self.owner_authorized
            and task_id == self.task_id
            and self._resource_matches(resource)
            and capability in self.capabilities
            and _as_aware(self.issued_at) <= now < _as_aware(self.expires_at)
        )


# Policy defaults, not empirically calibrated probabilities. They are intentionally
# named and centralized so calibration can replace them without hidden prompt drift.
C0_MAX_UNCERTAINTY_TO_EXECUTE = 0.50
C1_MAX_UNCERTAINTY_TO_EXECUTE = 0.25
C1_MIN_REVERSIBILITY_TO_EXECUTE = 0.50
C2_MAX_UNCERTAINTY_TO_EXECUTE = 0.15
C2_MIN_REVERSIBILITY_TO_EXECUTE = 0.75


@dataclass(frozen=True)
class AuthorityContext:
    consequence: ConsequenceClass
    uncertainty: float
    reversibility: float
    evidence_complete: bool
    lease_permits_action: bool
    owner_authorized: bool
    manual_execution_required: bool = False

    def __post_init__(self) -> None:
        _unit("uncertainty", self.uncertainty)
        _unit("reversibility", self.reversibility)


@dataclass(frozen=True)
class AuthorityDecision:
    mode: AuthorityMode
    reason: str
    threshold_policy_calibrated: bool = False


def decide_authority(context: AuthorityContext) -> AuthorityDecision:
    """Map uncertainty, consequence, reversibility and authority into behavior.

    C3 never executes autonomously through this gate. C2 can only reach EXECUTE
    after explicit owner authorization, complete evidence, an active capability
    lease, low uncertainty and high reversibility. A caller may additionally mark
    an action as manually executable only (e.g. a constitutionally protected
    capital-deployment path).
    """

    if context.consequence is ConsequenceClass.C3_SAFETY_CRITICAL_IRREVERSIBLE:
        return AuthorityDecision(AuthorityMode.STOP, "C3 actions require a separate explicit human-controlled path")

    if context.manual_execution_required:
        return AuthorityDecision(AuthorityMode.STOP, "policy marks this action as manual-execution-only")

    if not context.evidence_complete:
        if context.consequence is ConsequenceClass.C2_HIGH_CONSEQUENCE:
            return AuthorityDecision(AuthorityMode.STOP, "C2 action blocked: evidence packet incomplete")
        return AuthorityDecision(AuthorityMode.INVESTIGATE_ESCALATE, "evidence incomplete; investigate before action")

    if not context.lease_permits_action:
        if context.consequence is ConsequenceClass.C2_HIGH_CONSEQUENCE:
            return AuthorityDecision(AuthorityMode.STOP, "C2 action blocked: no active scoped capability lease")
        return AuthorityDecision(AuthorityMode.PROPOSE_VERIFY, "technical capability is not authorized by an active lease")

    if context.consequence is ConsequenceClass.C2_HIGH_CONSEQUENCE:
        if not context.owner_authorized:
            return AuthorityDecision(AuthorityMode.STOP, "C2 action requires explicit owner authorization")
        if context.uncertainty > C2_MAX_UNCERTAINTY_TO_EXECUTE:
            return AuthorityDecision(AuthorityMode.STOP, "C2 uncertainty exceeds the provisional execution ceiling")
        if context.reversibility < C2_MIN_REVERSIBILITY_TO_EXECUTE:
            return AuthorityDecision(AuthorityMode.PROPOSE_VERIFY, "C2 action is insufficiently reversible for autonomous execution")
        return AuthorityDecision(AuthorityMode.EXECUTE, "C2 action explicitly authorized and inside provisional safety bounds")

    if context.consequence is ConsequenceClass.C1_MATERIAL:
        if context.uncertainty <= C1_MAX_UNCERTAINTY_TO_EXECUTE and context.reversibility >= C1_MIN_REVERSIBILITY_TO_EXECUTE:
            return AuthorityDecision(AuthorityMode.EXECUTE, "C1 action is authorized, low-uncertainty and sufficiently reversible")
        if context.uncertainty <= 0.60:
            return AuthorityDecision(AuthorityMode.PROPOSE_VERIFY, "C1 action needs verification before execution")
        return AuthorityDecision(AuthorityMode.INVESTIGATE_ESCALATE, "C1 uncertainty is too high for action")

    if context.uncertainty <= C0_MAX_UNCERTAINTY_TO_EXECUTE:
        return AuthorityDecision(AuthorityMode.EXECUTE, "C0 action is authorized within provisional low-consequence bounds")
    if context.uncertainty <= 0.75:
        return AuthorityDecision(AuthorityMode.PROPOSE_VERIFY, "C0 uncertainty requires verification")
    return AuthorityDecision(AuthorityMode.INVESTIGATE_ESCALATE, "C0 uncertainty remains unresolved")


@dataclass(frozen=True)
class TaskContract:
    objective: str
    assumptions: tuple[str, ...]
    limits: tuple[str, ...]
    success_criteria: tuple[str, ...]
    checkpoints: tuple[str, ...]
    abort_criteria: tuple[str, ...]

    def validate(self, consequence: ConsequenceClass) -> None:
        if not self.objective.strip():
            raise ValueError("task objective is required")
        if consequence is ConsequenceClass.C0_LOW:
            return
        required = {
            "assumptions": self.assumptions,
            "limits": self.limits,
            "success_criteria": self.success_criteria,
            "checkpoints": self.checkpoints,
            "abort_criteria": self.abort_criteria,
        }
        missing = [name for name, values in required.items() if not tuple(item for item in values if item.strip())]
        if missing:
            raise ValueError("material task contract incomplete: " + ", ".join(missing))


@dataclass(frozen=True)
class ReassessmentObservation:
    success_reached: bool = False
    abort_criterion_hit: bool = False
    assumption_invalidated: bool = False
    material_contradiction: bool = False
    tool_failure: bool = False
    consequence_escalated: bool = False


def reassess(observation: ReassessmentObservation) -> ReassessmentAction:
    if observation.abort_criterion_hit:
        return ReassessmentAction.ABORT
    if observation.material_contradiction or observation.assumption_invalidated or observation.consequence_escalated:
        return ReassessmentAction.ESCALATE
    if observation.tool_failure:
        return ReassessmentAction.ESCALATE
    if observation.success_reached:
        return ReassessmentAction.COMPLETE
    return ReassessmentAction.CONTINUE


@dataclass(frozen=True)
class ExternalStateWrite:
    task_id: str
    resource: str
    persistent: bool
    discoverable: bool
    attributable: bool
    auditable: bool
    revocable_or_immutable_audit: bool


@dataclass(frozen=True)
class ExternalStateDecision:
    allowed: bool
    reason: str


def validate_external_state(write: ExternalStateWrite, lease: CapabilityLease, *, at: datetime | None = None) -> ExternalStateDecision:
    if not lease.permits(Capability.WRITE, task_id=write.task_id, resource=write.resource, at=at):
        return ExternalStateDecision(False, "external WRITE is not authorized for this task/resource")
    if write.persistent and not lease.permits(Capability.PERSIST, task_id=write.task_id, resource=write.resource, at=at):
        return ExternalStateDecision(False, "WRITE does not imply PERSIST; persistent external state is unauthorized")
    if write.persistent and not all((write.discoverable, write.attributable, write.auditable, write.revocable_or_immutable_audit)):
        return ExternalStateDecision(False, "persistent state would create shadow memory or unauditable residue")
    return ExternalStateDecision(True, "external state write is explicitly scoped and auditable")


@dataclass(frozen=True)
class InterAgentExchange:
    task_id: str
    resource: str
    requested_capabilities: frozenset[Capability] = field(default_factory=frozenset)


@dataclass(frozen=True)
class InterAgentDecision:
    allowed: bool
    reason: str


def validate_inter_agent_exchange(
    exchange: InterAgentExchange,
    sender_lease: CapabilityLease,
    receiver_lease: CapabilityLease,
    *,
    at: datetime | None = None,
) -> InterAgentDecision:
    for lease, role in ((sender_lease, "sender"), (receiver_lease, "receiver")):
        if not lease.permits(
            Capability.INTER_AGENT_COMMUNICATION,
            task_id=exchange.task_id,
            resource=exchange.resource,
            at=at,
        ):
            return InterAgentDecision(False, f"{role} lacks INTER_AGENT_COMMUNICATION authority")
    for capability in exchange.requested_capabilities:
        sender_ok = sender_lease.permits(capability, task_id=exchange.task_id, resource=exchange.resource, at=at)
        receiver_ok = receiver_lease.permits(capability, task_id=exchange.task_id, resource=exchange.resource, at=at)
        if not (sender_ok and receiver_ok):
            return InterAgentDecision(False, f"privilege laundering blocked for {capability.value}")
    return InterAgentDecision(True, "communication and delegated capabilities are within both leases")


@dataclass(frozen=True)
class ShutdownSnapshot:
    process_count: int = 0
    worker_count: int = 0
    subagent_count: int = 0
    scheduled_job_count: int = 0
    temp_credential_count: int = 0
    external_state_pending_count: int = 0
    pending_message_count: int = 0
    retry_queue_count: int = 0
    background_task_count: int = 0

    def __post_init__(self) -> None:
        for name, value in self.__dict__.items():
            if value < 0:
                raise ValueError(f"{name} cannot be negative")

    @property
    def residue(self) -> dict[str, int]:
        return {name: value for name, value in self.__dict__.items() if value != 0}


def verify_termination(snapshot: ShutdownSnapshot) -> TerminationStatus:
    return TerminationStatus.VERIFIED_TERMINATED if not snapshot.residue else TerminationStatus.NOT_TERMINATED


@dataclass(frozen=True)
class ReconciliationSnapshot:
    unreconciled_writes: int = 0
    temporary_files: int = 0
    incomplete_commits: int = 0
    orphaned_external_records: int = 0

    def __post_init__(self) -> None:
        for name, value in self.__dict__.items():
            if value < 0:
                raise ValueError(f"{name} cannot be negative")

    @property
    def residue(self) -> dict[str, int]:
        return {name: value for name, value in self.__dict__.items() if value != 0}


def reconcile_shutdown(termination: TerminationStatus, snapshot: ReconciliationSnapshot) -> TerminationStatus:
    if termination is not TerminationStatus.VERIFIED_TERMINATED:
        return TerminationStatus.NOT_TERMINATED
    if snapshot.residue:
        return TerminationStatus.VERIFIED_TERMINATED
    return TerminationStatus.STATE_RECONCILED


def capabilities(values: Iterable[Capability]) -> frozenset[Capability]:
    return frozenset(values)
