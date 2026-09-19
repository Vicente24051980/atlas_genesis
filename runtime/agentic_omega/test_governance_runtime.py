from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest

from runtime.agentic_omega.correctability import CorrectionReceipt, CorrectionStage, CorrectabilityTracker
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


def test_correctability_is_ordered_and_preserves_the_original_failure() -> None:
    ledger = AppendOnlyEventLedger()
    tracker = CorrectabilityTracker(ledger)
    common = {"task_id": "task-audit-1", "error_id": "ERR-HORIZON-1"}

    tracker.record(CorrectionReceipt(
        **common,
        stage=CorrectionStage.DETECTED,
        detail="CI exposed a horizon-mismatch assertion failure",
        evidence_refs=("ci:34063302948",),
    ))
    tracker.record(CorrectionReceipt(
        **common,
        stage=CorrectionStage.CONTAINED,
        detail="PR remained draft and main was not modified",
        evidence_refs=("pr:169", "main:1bd56a13"),
    ))
    tracker.record(CorrectionReceipt(
        **common,
        stage=CorrectionStage.CORRECTED,
        detail="removed the arbitrary 20x ratio and enforced an explicit transmission bridge",
        evidence_refs=("commit:8209c3d7",),
        rollback_ref="main:1bd56a13",
    ))
    tracker.record(CorrectionReceipt(
        **common,
        stage=CorrectionStage.VALIDATED,
        detail="focused CI passed after correction",
        evidence_refs=("ci:34063435956",),
    ))
    tracker.record(CorrectionReceipt(
        **common,
        stage=CorrectionStage.LEARNING_RECORDED,
        detail="arbitrary horizon ratios must not substitute for a causal transmission requirement",
        evidence_refs=("report:ASTRA_MASTER_AUDIT_GUARDRAILS_OMEGA",),
    ))

    status = tracker.status("ERR-HORIZON-1")
    assert status.complete is True
    assert status.last_stage is CorrectionStage.LEARNING_RECORDED
    assert status.missing_stages == ()
    stages = [event["payload"]["stage"] for event in ledger.events]
    assert stages == [stage.value for stage in CorrectionStage]
    assert ledger.verify() is True


def test_correctability_refuses_silent_history_rewrite_or_stage_skipping() -> None:
    ledger = AppendOnlyEventLedger()
    tracker = CorrectabilityTracker(ledger)
    with pytest.raises(RuntimeError, match="expected DETECTED"):
        tracker.record(CorrectionReceipt(
            task_id="task-audit-1",
            error_id="ERR-1",
            stage=CorrectionStage.CORRECTED,
            detail="attempted silent correction",
            evidence_refs=("commit:x",),
            rollback_ref="commit:before",
        ))
    assert ledger.events == ()


def test_correction_requires_explicit_rollback_or_non_applicability_reason() -> None:
    with pytest.raises(ValueError, match="rollback_ref"):
        CorrectionReceipt(
            task_id="task-audit-1",
            error_id="ERR-2",
            stage=CorrectionStage.CORRECTED,
            detail="patch applied",
            evidence_refs=("commit:x",),
        )
