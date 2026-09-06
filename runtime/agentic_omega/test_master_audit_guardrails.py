from __future__ import annotations

from datetime import date, datetime, timedelta, timezone

import pytest

from runtime.agentic_omega.capital_flow_firewall import (
    CapitalFlowObservation,
    FitState,
    FlowStage,
    FlowType,
    InstrumentProfile,
    ObjectiveRequirements,
    ObjectiveType,
    PITStatus,
    SignalDependency,
    SignalLifecycle,
    TransmissionCase,
    drivers,
    evaluate_flow_case,
    objective_instrument_fit,
    signal_dependency_overlap,
)
from runtime.agentic_omega.governance_firewall import (
    AuthorityContext,
    AuthorityMode,
    Capability,
    CapabilityLease,
    ConsequenceClass,
    ExternalStateWrite,
    InterAgentExchange,
    ReassessmentAction,
    ReassessmentObservation,
    ReconciliationSnapshot,
    ShutdownSnapshot,
    TaskContract,
    TerminationStatus,
    capabilities,
    decide_authority,
    reassess,
    reconcile_shutdown,
    validate_external_state,
    validate_inter_agent_exchange,
    verify_termination,
)


NOW = datetime(2026, 9, 6, 21, 0, tzinfo=timezone.utc)


def lease(*caps: Capability, resource: str = "github://atlas", task_id: str = "task-1", authorized: bool = True) -> CapabilityLease:
    return CapabilityLease(
        lease_id="lease-1",
        task_id=task_id,
        subject="agent:test",
        scoped_resource=resource,
        capabilities=capabilities(caps),
        issued_at=NOW - timedelta(minutes=5),
        expires_at=NOW + timedelta(minutes=55),
        owner_authorized=authorized,
    )


def strong_case(observation: CapitalFlowObservation, *, mechanism: str = "funded spend reaches constrained supplier", security: str | None = "TEST") -> TransmissionCase:
    return TransmissionCase(
        observation=observation,
        transmission_mechanism=mechanism,
        investable_security=security,
        bottleneck_strength=0.80,
        economic_capture=0.80,
        duration=0.80,
        expectation_gap_score=0.70,
        competitive_leakage=0.20,
        execution_risk=0.20,
        signal_horizon_days=90,
        decision_horizon_days=1460,
        falsifiers=("orders fail to convert to revenue",),
    )


def observation(flow_type: FlowType, stage: FlowStage, *, pit: PITStatus = PITStatus.CONFIRMED) -> CapitalFlowObservation:
    return CapitalFlowObservation(
        flow_type=flow_type,
        stage=stage,
        source="primary:test",
        publication_date=date(2026, 9, 6),
        information_date=date(2026, 9, 5),
        pit_status=pit,
        confidence=0.90,
    )


def test_write_does_not_imply_persist() -> None:
    current = lease(Capability.WRITE)
    decision = validate_external_state(
        ExternalStateWrite(
            task_id="task-1",
            resource="github://atlas/reports/state.json",
            persistent=True,
            discoverable=True,
            attributable=True,
            auditable=True,
            revocable_or_immutable_audit=True,
        ),
        current,
        at=NOW,
    )
    assert decision.allowed is False
    assert "WRITE does not imply PERSIST" in decision.reason


def test_persistence_requires_task_scope_resource_scope_and_expiry() -> None:
    current = lease(Capability.WRITE, Capability.PERSIST)
    assert current.permits(Capability.PERSIST, task_id="task-1", resource="github://atlas/x", at=NOW)
    assert not current.permits(Capability.PERSIST, task_id="other", resource="github://atlas/x", at=NOW)
    assert not current.permits(Capability.PERSIST, task_id="task-1", resource="notion://other", at=NOW)
    assert not current.permits(Capability.PERSIST, task_id="task-1", resource="github://atlas/x", at=NOW + timedelta(hours=2))


def test_c3_never_executes_autonomously() -> None:
    decision = decide_authority(
        AuthorityContext(
            consequence=ConsequenceClass.C3_SAFETY_CRITICAL_IRREVERSIBLE,
            uncertainty=0.0,
            reversibility=1.0,
            evidence_complete=True,
            lease_permits_action=True,
            owner_authorized=True,
        )
    )
    assert decision.mode is AuthorityMode.STOP


def test_c2_requires_owner_authorization_and_lease() -> None:
    no_owner = decide_authority(
        AuthorityContext(
            consequence=ConsequenceClass.C2_HIGH_CONSEQUENCE,
            uncertainty=0.05,
            reversibility=0.90,
            evidence_complete=True,
            lease_permits_action=True,
            owner_authorized=False,
        )
    )
    no_lease = decide_authority(
        AuthorityContext(
            consequence=ConsequenceClass.C2_HIGH_CONSEQUENCE,
            uncertainty=0.05,
            reversibility=0.90,
            evidence_complete=True,
            lease_permits_action=False,
            owner_authorized=True,
        )
    )
    assert no_owner.mode is AuthorityMode.STOP
    assert no_lease.mode is AuthorityMode.STOP


def test_manual_execution_policy_blocks_even_authorized_c2() -> None:
    decision = decide_authority(
        AuthorityContext(
            consequence=ConsequenceClass.C2_HIGH_CONSEQUENCE,
            uncertainty=0.01,
            reversibility=1.0,
            evidence_complete=True,
            lease_permits_action=True,
            owner_authorized=True,
            manual_execution_required=True,
        )
    )
    assert decision.mode is AuthorityMode.STOP


def test_material_task_contract_requires_abort_and_checkpoints() -> None:
    contract = TaskContract(
        objective="material change",
        assumptions=("repo is correct",),
        limits=("no delete",),
        success_criteria=("tests pass",),
        checkpoints=(),
        abort_criteria=(),
    )
    with pytest.raises(ValueError):
        contract.validate(ConsequenceClass.C1_MATERIAL)


def test_reassessment_aborts_or_escalates_instead_of_sunk_cost_persistence() -> None:
    assert reassess(ReassessmentObservation(abort_criterion_hit=True)) is ReassessmentAction.ABORT
    assert reassess(ReassessmentObservation(material_contradiction=True)) is ReassessmentAction.ESCALATE
    assert reassess(ReassessmentObservation(success_reached=True)) is ReassessmentAction.COMPLETE


def test_inter_agent_communication_cannot_launder_privilege() -> None:
    sender = lease(Capability.INTER_AGENT_COMMUNICATION, Capability.READ)
    receiver = lease(Capability.INTER_AGENT_COMMUNICATION, Capability.READ, Capability.DELETE)
    result = validate_inter_agent_exchange(
        InterAgentExchange(
            task_id="task-1",
            resource="github://atlas",
            requested_capabilities=capabilities((Capability.DELETE,)),
        ),
        sender,
        receiver,
        at=NOW,
    )
    assert result.allowed is False
    assert "privilege laundering" in result.reason


def test_verified_shutdown_requires_zero_residue() -> None:
    assert verify_termination(ShutdownSnapshot()) is TerminationStatus.VERIFIED_TERMINATED
    assert verify_termination(ShutdownSnapshot(retry_queue_count=1)) is TerminationStatus.NOT_TERMINATED
    assert verify_termination(ShutdownSnapshot(scheduled_job_count=1)) is TerminationStatus.NOT_TERMINATED


def test_state_reconciliation_is_separate_from_process_termination() -> None:
    terminated = verify_termination(ShutdownSnapshot())
    dirty = reconcile_shutdown(terminated, ReconciliationSnapshot(unreconciled_writes=1))
    clean = reconcile_shutdown(terminated, ReconciliationSnapshot())
    assert dirty is TerminationStatus.VERIFIED_TERMINATED
    assert clean is TerminationStatus.STATE_RECONCILED


def test_central_bank_gold_purchase_is_asset_allocation_not_capex_chain() -> None:
    gold = observation(FlowType.ASSET_ALLOCATION, FlowStage.EXECUTED)
    result = evaluate_flow_case(strong_case(gold, mechanism="reserve reallocation creates direct bullion demand", security="GOLD"))
    assert result.capex_chain_allowed is False
    assert result.direct_atlas_score_delta == 0.0
    assert result.portfolio_action_allowed is False
    assert any("not productive CAPEX" in reason for reason in result.reasons)


def test_budget_request_cannot_be_promoted_as_contract_or_revenue() -> None:
    budget = observation(FlowType.FISCAL_PROCUREMENT, FlowStage.BUDGET_REQUEST)
    result = evaluate_flow_case(strong_case(budget))
    assert result.lifecycle is SignalLifecycle.SHADOW
    assert result.capex_chain_allowed is False
    assert any("budget request" in reason for reason in result.reasons)
    assert budget.realized_revenue_evidence is False


def test_pit_uncertain_caps_strong_signal_at_shadow() -> None:
    capex = observation(FlowType.PRODUCTIVE_CAPITAL_FORMATION, FlowStage.ORDERED, pit=PITStatus.UNCERTAIN)
    result = evaluate_flow_case(strong_case(capex))
    assert result.lifecycle is SignalLifecycle.SHADOW
    assert result.portfolio_action_allowed is False


def test_financed_productive_capital_can_enter_research_production_but_not_trade() -> None:
    capex = observation(FlowType.PRODUCTIVE_CAPITAL_FORMATION, FlowStage.FINANCED)
    result = evaluate_flow_case(strong_case(capex))
    assert result.lifecycle is SignalLifecycle.PRODUCTION
    assert result.capex_chain_allowed is True
    assert result.direct_atlas_score_delta == 0.0
    assert result.portfolio_action_allowed is False


def test_announced_capex_is_too_early_for_production() -> None:
    announced = observation(FlowType.PRODUCTIVE_CAPITAL_FORMATION, FlowStage.ANNOUNCED)
    result = evaluate_flow_case(strong_case(announced))
    assert result.lifecycle is SignalLifecycle.SHADOW
    assert result.capex_chain_allowed is False


def test_buyback_authorization_is_not_execution() -> None:
    authorized = observation(FlowType.CAPITAL_RETURN, FlowStage.AUTHORIZED)
    executed = observation(FlowType.CAPITAL_RETURN, FlowStage.EXECUTED)
    assert evaluate_flow_case(strong_case(authorized)).lifecycle is SignalLifecycle.SHADOW
    assert evaluate_flow_case(strong_case(executed)).lifecycle is SignalLifecycle.PRODUCTION


def test_short_horizon_signal_without_transmission_bridge_stays_shadow() -> None:
    capex = observation(FlowType.PRODUCTIVE_CAPITAL_FORMATION, FlowStage.ORDERED)
    case = strong_case(capex, mechanism="")
    result = evaluate_flow_case(case)
    assert result.lifecycle is SignalLifecycle.SHADOW
    assert any("long-horizon decision" in reason for reason in result.reasons)


def test_security_objective_rejects_illiquid_niche_instrument() -> None:
    emergency = ObjectiveRequirements(
        objective=ObjectiveType.SECURITY,
        horizon_days=365,
        minimum_liquidity=0.90,
        maximum_exit_spread_bps=100.0,
        minimum_recognition=0.85,
        minimum_counterparty_depth=0.85,
        minimum_reversibility=0.90,
    )
    niche_coin = InstrumentProfile(
        name="niche seminumismatic coin",
        liquidity=0.35,
        typical_exit_spread_bps=650.0,
        recognition=0.30,
        counterparty_depth=0.25,
        reversibility=0.40,
    )
    recognized_bullion = InstrumentProfile(
        name="widely recognized bullion instrument",
        liquidity=0.95,
        typical_exit_spread_bps=60.0,
        recognition=0.98,
        counterparty_depth=0.95,
        reversibility=0.95,
    )
    assert objective_instrument_fit(emergency, niche_coin).state is FitState.REJECT
    assert objective_instrument_fit(emergency, recognized_bullion).state is FitState.PASS


def test_signal_dependency_graph_flags_causal_double_counting() -> None:
    first = SignalDependency("FTC", drivers(("ai_capex", "backlog", "supplier_orders")))
    second = SignalDependency("revisions", drivers(("ai_capex", "backlog", "revenue_revisions")))
    result = signal_dependency_overlap(first, second)
    assert result.overlap == 0.5
    assert result.possible_double_counting is True
    assert result.shared_drivers == ("ai_capex", "backlog")


def test_publication_date_cannot_precede_information_date() -> None:
    with pytest.raises(ValueError):
        CapitalFlowObservation(
            flow_type=FlowType.ASSET_ALLOCATION,
            stage=FlowStage.EXECUTED,
            source="primary:test",
            publication_date=date(2026, 9, 1),
            information_date=date(2026, 9, 2),
            pit_status=PITStatus.CONFIRMED,
            confidence=0.9,
        )
