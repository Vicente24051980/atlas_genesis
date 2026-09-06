from __future__ import annotations

from dataclasses import asdict
from datetime import datetime
from typing import Any

from .governance_firewall import (
    AuthorityContext,
    AuthorityDecision,
    Capability,
    CapabilityLease,
    ConsequenceClass,
    ExternalStateDecision,
    ExternalStateWrite,
    InterAgentDecision,
    InterAgentExchange,
    ReconciliationSnapshot,
    ShutdownSnapshot,
    TerminationStatus,
    decide_authority,
    reconcile_shutdown,
    validate_external_state,
    validate_inter_agent_exchange,
    verify_termination,
)
from .orchestrator import AppendOnlyEventLedger


class GovernanceFirewall:
    """Audited runtime binding for ATLAS authority and persistence guardrails.

    This class does not grant capabilities. It consumes an already owner-authorized,
    task-scoped CapabilityLease, evaluates it against the requested action and writes
    the decision to the existing append-only ledger. Callers should treat any mode
    other than EXECUTE as a hard non-execution result.
    """

    def __init__(self, ledger: AppendOnlyEventLedger) -> None:
        self.ledger = ledger

    def register_lease(self, lease: CapabilityLease) -> None:
        if not lease.owner_authorized:
            raise ValueError("cannot register a capability lease without explicit owner authorization")
        self.ledger.append(
            "CAPABILITY_LEASE_REGISTERED",
            {
                "lease_id": lease.lease_id,
                "task_id": lease.task_id,
                "subject": lease.subject,
                "scoped_resource": lease.scoped_resource,
                "capabilities": sorted(capability.value for capability in lease.capabilities),
                "issued_at": lease.issued_at.isoformat(),
                "expires_at": lease.expires_at.isoformat(),
                "owner_authorized": True,
            },
        )

    def authorize_action(
        self,
        *,
        action_id: str,
        lease: CapabilityLease,
        capability: Capability,
        task_id: str,
        resource: str,
        consequence: ConsequenceClass,
        uncertainty: float,
        reversibility: float,
        evidence_complete: bool,
        owner_authorized: bool,
        manual_execution_required: bool = False,
        at: datetime | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> AuthorityDecision:
        if not action_id.strip():
            raise ValueError("action_id is required")
        lease_permits = lease.permits(capability, task_id=task_id, resource=resource, at=at)
        decision = decide_authority(
            AuthorityContext(
                consequence=consequence,
                uncertainty=uncertainty,
                reversibility=reversibility,
                evidence_complete=evidence_complete,
                lease_permits_action=lease_permits,
                owner_authorized=owner_authorized,
                manual_execution_required=manual_execution_required,
            )
        )
        self.ledger.append(
            "AUTHORITY_DECISION",
            {
                "action_id": action_id,
                "task_id": task_id,
                "resource": resource,
                "capability": capability.value,
                "lease_id": lease.lease_id,
                "lease_permits_action": lease_permits,
                "consequence": consequence.value,
                "uncertainty": uncertainty,
                "reversibility": reversibility,
                "evidence_complete": evidence_complete,
                "owner_authorized": owner_authorized,
                "manual_execution_required": manual_execution_required,
                "mode": decision.mode.value,
                "reason": decision.reason,
                "threshold_policy_calibrated": decision.threshold_policy_calibrated,
                "metadata": metadata or {},
            },
        )
        return decision

    def authorize_external_state(
        self,
        write: ExternalStateWrite,
        lease: CapabilityLease,
        *,
        at: datetime | None = None,
    ) -> ExternalStateDecision:
        decision = validate_external_state(write, lease, at=at)
        self.ledger.append(
            "EXTERNAL_STATE_DECISION",
            {
                **asdict(write),
                "lease_id": lease.lease_id,
                "allowed": decision.allowed,
                "reason": decision.reason,
            },
        )
        return decision

    def authorize_inter_agent_exchange(
        self,
        exchange: InterAgentExchange,
        sender_lease: CapabilityLease,
        receiver_lease: CapabilityLease,
        *,
        at: datetime | None = None,
    ) -> InterAgentDecision:
        decision = validate_inter_agent_exchange(exchange, sender_lease, receiver_lease, at=at)
        self.ledger.append(
            "INTER_AGENT_COMMUNICATION_DECISION",
            {
                "task_id": exchange.task_id,
                "resource": exchange.resource,
                "requested_capabilities": sorted(capability.value for capability in exchange.requested_capabilities),
                "sender_lease_id": sender_lease.lease_id,
                "receiver_lease_id": receiver_lease.lease_id,
                "allowed": decision.allowed,
                "reason": decision.reason,
            },
        )
        return decision

    def verify_shutdown(self, *, task_id: str, snapshot: ShutdownSnapshot) -> TerminationStatus:
        status = verify_termination(snapshot)
        self.ledger.append(
            "SHUTDOWN_VERIFICATION",
            {
                "task_id": task_id,
                "status": status.value,
                "residue": snapshot.residue,
                "snapshot": asdict(snapshot),
            },
        )
        return status

    def reconcile_shutdown(
        self,
        *,
        task_id: str,
        termination: TerminationStatus,
        snapshot: ReconciliationSnapshot,
    ) -> TerminationStatus:
        status = reconcile_shutdown(termination, snapshot)
        self.ledger.append(
            "SHUTDOWN_STATE_RECONCILIATION",
            {
                "task_id": task_id,
                "input_termination_status": termination.value,
                "status": status.value,
                "residue": snapshot.residue,
                "snapshot": asdict(snapshot),
            },
        )
        return status
