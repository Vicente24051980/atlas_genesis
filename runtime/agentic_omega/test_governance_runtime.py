from __future__ import annotations

from datetime import datetime, timedelta, timezone

from runtime.agentic_omega.governance_firewall import (
    AuthorityMode,
    Capability,
    CapabilityLease,
    ConsequenceClass,
    ReassessmentAction,
    ReassessmentObservation,
    ShutdownSnapshot,
    TaskContract,
    TerminationStatus,
    capabilities,
)
from runtime.agentic_omega.governance_runtime import GovernanceFirewall
from runtime.agentic_omega.orchestrator import AppendOnlyEventLedger


NOW = datetime(2026, 9, 6, 21, 0, tzinfo=timezone.utc)


def _lease() -> CapabilityLease:
    return CapabilityLease(
        lease_id="lease-audit-1",
        task_id="task-audit-1",
        subject="agent:audit",
        scoped_resource="github://atlas",
        capabilities=capabilities((Capability.READ, Capability.WRITE, Capability.PERSIST, Capability.EXECUTE)),
        issued_at=NOW - timedelta(minutes=1),
        expires_at=NOW + timedelta(hours=1),
        owner_authorized=True,
    )


def test_runtime_computes_lease_permission_and_audits_decision() -> None:
    ledger = AppendOnlyEventLedger()
    firewall = GovernanceFirewall(ledger)
    current = _lease()
    firewall.register_lease(current)

    allowed = firewall.authorize_action(
        action_id="a-1",
        lease=current,
        capability=Capability.WRITE,
        task_id="task-audit-1",
        resource="github://atlas/reports/x.md",
        consequence=ConsequenceClass.C1_MATERIAL,
        uncertainty=0.10,
        reversibility=0.90,
        evidence_complete=True,
        owner_authorized=True,
        at=NOW,
    )
    blocked = firewall.authorize_action(
        action_id="a-2",
        lease=current,
        capability=Capability.DELETE,
        task_id="task-audit-1",
        resource="github://atlas/reports/x.md",
        consequence=ConsequenceClass.C1_MATERIAL,
        uncertainty=0.10,
        reversibility=0.90,
        evidence_complete=True,
        owner_authorized=True,
        at=NOW,
    )

    assert allowed.mode is AuthorityMode.EXECUTE
    assert blocked.mode is AuthorityMode.PROPOSE_VERIFY
    event_types = [event["event_type"] for event in ledger.events]
    assert event_types == ["CAPABILITY_LEASE_REGISTERED", "AUTHORITY_DECISION", "AUTHORITY_DECISION"]
    assert ledger.events[-1]["payload"]["lease_permits_action"] is False


def test_runtime_task_contract_and_checkpoint_are_ledgered() -> None:
    ledger = AppendOnlyEventLedger()
    firewall = GovernanceFirewall(ledger)
    contract = TaskContract(
        objective="patch a material runtime guardrail",
        assumptions=("main SHA is known",),
        limits=("no destructive changes",),
        success_criteria=("focused CI passes",),
        checkpoints=("after implementation", "after CI"),
        abort_criteria=("contradiction with constitutional authority",),
    )
    firewall.register_task_contract(
        task_id="task-audit-1",
        consequence=ConsequenceClass.C1_MATERIAL,
        contract=contract,
    )
    action = firewall.checkpoint(
        task_id="task-audit-1",
        checkpoint_id="after-implementation",
        observation=ReassessmentObservation(material_contradiction=True),
        detail="new evidence conflicts with an authority assumption",
    )
    assert action is ReassessmentAction.ESCALATE
    assert [event["event_type"] for event in ledger.events] == ["TASK_CONTRACT_REGISTERED", "TASK_REASSESSMENT"]
    assert ledger.events[-1]["payload"]["action"] == "ESCALATE"


def test_runtime_shutdown_verification_is_ledgered() -> None:
    ledger = AppendOnlyEventLedger()
    firewall = GovernanceFirewall(ledger)
    status = firewall.verify_shutdown(task_id="task-audit-1", snapshot=ShutdownSnapshot(retry_queue_count=1))
    assert status is TerminationStatus.NOT_TERMINATED
    assert ledger.events[-1]["event_type"] == "SHUTDOWN_VERIFICATION"
    assert ledger.events[-1]["payload"]["residue"] == {"retry_queue_count": 1}
