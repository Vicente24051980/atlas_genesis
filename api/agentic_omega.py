from __future__ import annotations

import os
from pathlib import Path
from threading import RLock
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from runtime.agentic_omega import (
    AgenticOmegaOrchestrator,
    EpistemicLabel,
    EvidenceAssertion,
    GateState,
    Specialist,
    SpecialistResult,
)
from runtime.agentic_omega.durable_ledger import DurableAgenticLedger


router = APIRouter(prefix="/v1/agentic-omega", tags=["agentic-omega"])

_LEDGER_PATH = Path(
    os.getenv("ATLAS_AGENTIC_LEDGER_PATH", ".atlas_state/agentic_omega/events.jsonl")
)
_ENGINE = AgenticOmegaOrchestrator(DurableAgenticLedger(_LEDGER_PATH))
_ENGINE_LOCK = RLock()


class EvidenceAssertionPayload(BaseModel):
    claim: str = Field(min_length=1)
    label: EpistemicLabel
    source: str = ""
    observed_at: str = ""
    confidence: float | None = Field(default=None, ge=0.0, le=1.0)
    freshness: str = ""


class SpecialistResultPayload(BaseModel):
    specialist: Specialist
    gate_state: GateState
    conclusion: str = Field(min_length=1)
    assertions: list[EvidenceAssertionPayload] = Field(default_factory=list)
    confidence: float | None = Field(default=None, ge=0.0, le=1.0)
    confirmed_falsifier: bool = False
    metadata: dict[str, Any] = Field(default_factory=dict)


class EvaluateRunRequest(BaseModel):
    objective: str = Field(min_length=1, max_length=1000)
    context: dict[str, Any] = Field(default_factory=dict)
    results: list[SpecialistResultPayload] = Field(default_factory=list)
    no_opportunity: bool = False


class EvolutionProposalRequest(BaseModel):
    title: str = Field(min_length=1, max_length=300)
    rationale: str = Field(min_length=1, max_length=4000)
    evidence_ids: list[str] = Field(min_length=1)


def _materialize_result(payload: SpecialistResultPayload) -> SpecialistResult:
    assertions = tuple(
        EvidenceAssertion(
            claim=item.claim,
            label=item.label,
            source=item.source,
            observed_at=item.observed_at,
            confidence=item.confidence,
            freshness=item.freshness,
        )
        for item in payload.assertions
    )
    return SpecialistResult(
        specialist=payload.specialist,
        gate_state=payload.gate_state,
        conclusion=payload.conclusion,
        assertions=assertions,
        confidence=payload.confidence,
        confirmed_falsifier=payload.confirmed_falsifier,
        metadata=payload.metadata,
    )


@router.get("/health")
def agentic_omega_health() -> dict[str, Any]:
    return {
        "ok": True,
        "engine": "Agentic Runtime Ω",
        "version": "1.0+durable-ledger",
        "ledgerPath": str(_LEDGER_PATH),
        "ledgerEvents": len(_ENGINE.ledger.events),
        "durableLedger": True,
        "invariants": {
            "majorityVoting": False,
            "falsifiersAbsoluteVeto": True,
            "factRequiresProvenance": True,
            "autoSelfModification": False,
            "directTradeExecution": False,
        },
    }


@router.post("/evaluate")
def evaluate_agentic_run(request: EvaluateRunRequest) -> dict[str, Any]:
    try:
        with _ENGINE_LOCK:
            run = _ENGINE.start_run(request.objective, request.context)
            for item in request.results:
                _ENGINE.submit_result(run, _materialize_result(item))
            receipt = _ENGINE.finalize(run, no_opportunity=request.no_opportunity)
            return {
                "engine": "Agentic Runtime Ω",
                "runId": run.run_id,
                "receipt": receipt.to_dict(),
                "specialistsReceived": [item.specialist.value for item in request.results],
                "ledgerEvents": len(_ENGINE.ledger.events),
                "guardrail": (
                    "READY_FOR_EXECUTION_GATE is not a trade instruction. "
                    "Broker execution and sizing remain separate."
                ),
            }
    except (ValueError, RuntimeError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/evolution-proposals")
def create_evolution_proposal(request: EvolutionProposalRequest) -> dict[str, Any]:
    try:
        with _ENGINE_LOCK:
            proposal = _ENGINE.propose_evolution(
                title=request.title,
                rationale=request.rationale,
                evidence_ids=request.evidence_ids,
            )
            return {
                "proposal": {
                    "proposalId": proposal.proposal_id,
                    "title": proposal.title,
                    "rationale": proposal.rationale,
                    "evidenceIds": list(proposal.evidence_ids),
                    "createdAt": proposal.created_at,
                    "requiresOwnerApproval": proposal.requires_owner_approval,
                    "autoApply": proposal.auto_apply,
                },
                "guardrail": "Evolution is proposal-only; no code or canon is modified by this endpoint.",
            }
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
