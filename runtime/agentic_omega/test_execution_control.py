from datetime import datetime, timezone

from runtime.agentic_omega.execution_control import (
    ActionDomain,
    ActionOperation,
    ActionRequest,
    ActionState,
    AgenticExecutionController,
    AutonomyLevel,
    PostconditionEvidence,
    VerificationSource,
    WorldStateClass,
    autonomy_required,
)


NOW = datetime.now(timezone.utc).isoformat()


def request(**overrides):
    base = dict(
        objective="update reversible internal state",
        operation=ActionOperation.WRITE,
        domain=ActionDomain.INTERNAL,
        tool="notion",
        target="internal draft",
        idempotency_key="idem-default",
        requested_level=AutonomyLevel.L2_SAFE_WRITE,
        reversible=True,
        compensation_action="restore previous draft",
        expected_postconditions=("draft updated",),
        pre_state_class=WorldStateClass.STABLE,
        pre_state_verified=True,
    )
    base.update(overrides)
    return ActionRequest(**base)


def evidence(postcondition="draft updated", *, matches=True, source_kind=VerificationSource.API_READBACK):
    return PostconditionEvidence(
        postcondition=postcondition,
        source_kind=source_kind,
        source="readback://target",
        observed_at=NOW,
        matches_expected=matches,
    )


def test_autonomy_floor_cannot_be_downgraded_by_request():
    material = request(
        operation=ActionOperation.EXECUTE,
        domain=ActionDomain.FINANCIAL,
        requested_level=AutonomyLevel.L0_READ_ONLY,
        idempotency_key="financial-floor",
    )
    assert autonomy_required(material) is AutonomyLevel.L4_HUMAN_APPROVAL_REQUIRED


def test_nonreversible_write_is_promoted_out_of_l2_safe_write():
    controller = AgenticExecutionController()
    unsafe = request(reversible=False, compensation_action="", idempotency_key="unsafe-l2")
    receipt = controller.authorize(unsafe)
    assert receipt.state is ActionState.AUTHORIZED
    assert receipt.required_level is AutonomyLevel.L3_CONTROLLED_EXECUTION


def test_l2_reversible_write_requires_compensation_metadata():
    controller = AgenticExecutionController()
    action = request(compensation_action="", idempotency_key="missing-compensation")
    receipt = controller.authorize(action)
    assert receipt.state is ActionState.BLOCKED
    assert receipt.reason == "L2_SAFE_WRITE_REQUIRES_REVERSIBILITY_AND_COMPENSATION"


def test_l4_material_action_requires_human_approval():
    controller = AgenticExecutionController()
    material = request(
        operation=ActionOperation.EXECUTE,
        domain=ActionDomain.EXTERNAL,
        idempotency_key="external-no-approval",
        human_approval_id="",
    )
    receipt = controller.authorize(material)
    assert receipt.state is ActionState.BLOCKED
    assert receipt.reason == "HUMAN_APPROVAL_REQUIRED"


def test_unknown_or_unverified_pre_state_fails_closed_for_material_action():
    controller = AgenticExecutionController()
    material = request(
        operation=ActionOperation.EXECUTE,
        requested_level=AutonomyLevel.L3_CONTROLLED_EXECUTION,
        idempotency_key="stale",
        pre_state_class=WorldStateClass.UNKNOWN,
        pre_state_verified=False,
    )
    receipt = controller.authorize(material)
    assert receipt.state is ActionState.BLOCKED
    assert "ACTION_BLOCKED_STALE_ASSUMPTION" in receipt.reason


def test_idempotency_key_blocks_duplicate_action_attempt():
    controller = AgenticExecutionController()
    first = request(idempotency_key="same-idem")
    second = request(idempotency_key="same-idem")
    assert controller.authorize(first).state is ActionState.AUTHORIZED
    duplicate = controller.authorize(second)
    assert duplicate.state is ActionState.BLOCKED
    assert duplicate.reason.startswith("DUPLICATE_ACTION")


def test_execution_claim_never_equals_verified_completion():
    controller = AgenticExecutionController()
    action = request(idempotency_key="claim-not-proof")
    assert controller.authorize(action).state is ActionState.AUTHORIZED
    receipt = controller.mark_executed(
        action.action_id,
        execution_reference="tool-receipt-123",
        agent_claim="I completed it successfully",
    )
    assert receipt.state is ActionState.EXECUTED_UNVERIFIED


def test_model_self_report_cannot_verify_poststate():
    controller = AgenticExecutionController()
    action = request(idempotency_key="self-report")
    controller.authorize(action)
    controller.mark_executed(action.action_id, execution_reference="tool-receipt-124")
    receipt = controller.verify(
        action.action_id,
        [evidence(source_kind=VerificationSource.MODEL_SELF_REPORT)],
    )
    assert receipt.state is ActionState.EXECUTED_UNVERIFIED
    assert receipt.reason == "MODEL_SELF_REPORT_IS_NOT_POSTSTATE_EVIDENCE"


def test_all_declared_postconditions_require_independent_readback():
    controller = AgenticExecutionController()
    action = request(
        idempotency_key="two-postconditions",
        expected_postconditions=("draft updated", "audit row exists"),
    )
    controller.authorize(action)
    controller.mark_executed(action.action_id, execution_reference="tool-receipt-125")

    partial = controller.verify(action.action_id, [evidence("draft updated")])
    assert partial.state is ActionState.EXECUTED_UNVERIFIED
    assert "audit row exists" in partial.reason

    complete = controller.verify(
        action.action_id,
        [
            evidence("draft updated"),
            evidence("audit row exists", source_kind=VerificationSource.SYSTEM_OBSERVATION),
        ],
    )
    assert complete.state is ActionState.VERIFIED_COMPLETE


def test_conflicting_postcondition_evidence_produces_unknown_poststate():
    controller = AgenticExecutionController()
    action = request(idempotency_key="conflict")
    controller.authorize(action)
    controller.mark_executed(action.action_id, execution_reference="tool-receipt-126")
    receipt = controller.verify(
        action.action_id,
        [
            evidence(matches=True),
            evidence(matches=False, source_kind=VerificationSource.SYSTEM_OBSERVATION),
        ],
    )
    assert receipt.state is ActionState.UNKNOWN_POSTSTATE


def test_failed_postcondition_requires_rollback_when_reversible():
    controller = AgenticExecutionController()
    action = request(idempotency_key="rollback")
    controller.authorize(action)
    controller.mark_executed(action.action_id, execution_reference="tool-receipt-127")
    receipt = controller.verify(action.action_id, [evidence(matches=False)])
    assert receipt.state is ActionState.ROLLBACK_REQUIRED


def test_modify_canon_never_self_authorizes_even_with_approval_id():
    controller = AgenticExecutionController()
    action = request(
        operation=ActionOperation.MODIFY_CANON,
        domain=ActionDomain.INTERNAL,
        idempotency_key="canon",
        human_approval_id="human-approval",
    )
    receipt = controller.authorize(action)
    assert receipt.state is ActionState.BLOCKED
    assert "cannot self-authorize" in receipt.reason
