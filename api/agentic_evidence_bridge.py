from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from api.agent_infrastructure import EvidenceEnvelope
from api.agentic_omega import _ENGINE, _ENGINE_LOCK
from runtime.agentic_omega import EvidenceEnvelopeAdapter, RunRecovery, WorkerPacket
from runtime.agentic_omega.hardening import GovernedWorkerCoordinator


router = APIRouter(prefix="/v1/agentic-omega/v2", tags=["agentic-evidence-bridge"])
_ADAPTER = EvidenceEnvelopeAdapter()
_COORDINATOR = GovernedWorkerCoordinator()
_RECOVERY = RunRecovery(_ENGINE.ledger)


class EvidenceWorkerRunRequest(BaseModel):
    objective: str = Field(min_length=1, max_length=1000)
    context: dict[str, Any] = Field(default_factory=dict)
    envelopes: list[EvidenceEnvelope] = Field(default_factory=list)
    confirmed_falsifiers: list[str] = Field(default_factory=list)
    falsifier_review_complete: bool = False
    policies: dict[str, dict[str, float]] = Field(default_factory=dict)
    no_opportunity: bool = False


@router.post("/from-evidence")
def run_from_governed_evidence(request: EvidenceWorkerRunRequest) -> dict[str, Any]:
    """Run ATLAS workers from explicit structured metrics inside evidence envelopes.

    Envelope prose/content is never parsed here. Only ``metadata.metrics`` is
    adapted, and every resulting observation remains candidate-only until the
    Agentic Runtime evidence gates pass it.
    """
    adapted = _ADAPTER.adapt(envelope.model_dump(mode="python") for envelope in request.envelopes)
    packet = WorkerPacket(
        observations=adapted.observations,
        confirmed_falsifiers=tuple(request.confirmed_falsifiers),
        policies=request.policies,
    )
    try:
        with _ENGINE_LOCK:
            run = _ENGINE.start_run(request.objective, request.context)
            _RECOVERY.snapshot_context(run)
            results = _COORDINATOR.run(
                packet,
                falsifier_review_complete=request.falsifier_review_complete,
            )
            for result in results:
                _ENGINE.submit_result(run, result)
            receipt = _ENGINE.finalize(run, no_opportunity=request.no_opportunity)
            _ENGINE.ledger.append(
                "EVIDENCE_ADAPTER_RECEIPT",
                {
                    "run_id": run.run_id,
                    **adapted.to_dict(),
                    "envelopeContentHashes": [item.content_hash for item in request.envelopes],
                },
            )
            return {
                "engine": "Agentic Runtime Ω",
                "version": "2.2-evidence-bridge",
                "runId": run.run_id,
                "adapter": adapted.to_dict(),
                "receipt": receipt.to_dict(),
                "results": [result.to_dict() for result in results],
                "guardrails": {
                    "parseEnvelopeProse": False,
                    "externalEvidenceAutoCanonical": False,
                    "retrievalTimeIsObservationTime": False,
                    "falsifierReviewCompleteRequired": True,
                    "criticalMetricProvenanceRequired": True,
                    "readyForExecutionIsTrade": False,
                },
            }
    except (ValueError, RuntimeError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
