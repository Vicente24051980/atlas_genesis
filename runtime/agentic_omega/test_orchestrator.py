from __future__ import annotations

import pytest

from runtime.agentic_omega import (
    AgenticOmegaOrchestrator,
    AppendOnlyEventLedger,
    EpistemicLabel,
    EvidenceAssertion,
    GateState,
    RunStatus,
    Specialist,
    SpecialistResult,
)


def _fact(claim: str = "verified") -> EvidenceAssertion:
    return EvidenceAssertion(
        claim=claim,
        label=EpistemicLabel.FACT,
        source="primary:test",
        observed_at="2026-08-17",
        confidence=0.95,
    )


def _result(specialist: Specialist, state: GateState = GateState.PASS, **kwargs) -> SpecialistResult:
    return SpecialistResult(
        specialist=specialist,
        gate_state=state,
        conclusion=f"{specialist.value}: {state.value}",
        assertions=(_fact(),),
        **kwargs,
    )


def test_fact_requires_provenance() -> None:
    with pytest.raises(ValueError):
        EvidenceAssertion(claim="x", label=EpistemicLabel.FACT)


def test_majority_cannot_bypass_missing_specialist() -> None:
    engine = AgenticOmegaOrchestrator()
    run = engine.start_run("test")
    for specialist in list(Specialist)[:-1]:
        engine.submit_result(run, _result(specialist))
    receipt = engine.finalize(run)
    assert receipt.status is RunStatus.WATCH
    assert "majority voting" in receipt.reason


def test_falsifier_veto_is_absolute() -> None:
    engine = AgenticOmegaOrchestrator()
    run = engine.start_run("test")
    for specialist in Specialist:
        if specialist is Specialist.FALSIFIERS:
            result = _result(specialist, GateState.VETO, confirmed_falsifier=True)
        else:
            result = _result(specialist)
        engine.submit_result(run, result)
    receipt = engine.finalize(run)
    assert receipt.status is RunStatus.REJECT
    assert receipt.vetoed is True


def test_all_gates_pass_only_reaches_execution_gate() -> None:
    engine = AgenticOmegaOrchestrator()
    run = engine.start_run("test")
    for specialist in Specialist:
        engine.submit_result(run, _result(specialist))
    receipt = engine.finalize(run)
    assert receipt.status is RunStatus.READY_FOR_EXECUTION_GATE


def test_null_opportunity_is_valid() -> None:
    engine = AgenticOmegaOrchestrator()
    run = engine.start_run("test")
    for specialist in Specialist:
        engine.submit_result(run, _result(specialist))
    receipt = engine.finalize(run, no_opportunity=True)
    assert receipt.status is RunStatus.NO_OPPORTUNITY


def test_ledger_is_hash_chained(tmp_path) -> None:
    path = tmp_path / "events.jsonl"
    ledger = AppendOnlyEventLedger(path)
    ledger.append("A", {"x": 1})
    ledger.append("B", {"x": 2})
    assert ledger.verify() is True
    reloaded = AppendOnlyEventLedger(path)
    assert len(reloaded.events) == 2


def test_evolution_is_proposal_only() -> None:
    engine = AgenticOmegaOrchestrator()
    proposal = engine.propose_evolution(
        title="Improve specialist routing",
        rationale="Observed repeated evidence-routing mismatch.",
        evidence_ids=["ev-1"],
    )
    assert proposal.requires_owner_approval is True
    assert proposal.auto_apply is False
