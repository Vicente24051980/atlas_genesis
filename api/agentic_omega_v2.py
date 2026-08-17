from __future__ import annotations

from dataclasses import asdict
from typing import Any

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from api.agentic_omega import (
    SpecialistResultPayload,
    _ENGINE,
    _ENGINE_LOCK,
    _materialize_result,
)
from runtime.agentic_omega import (
    AgenticRun,
    CalibrationEngine,
    MetricObservation,
    RunRecovery,
    WorkerCoordinator,
    WorkerPacket,
)


router = APIRouter(prefix="/v1/agentic-omega", tags=["agentic-omega-v2"])
_COORDINATOR = WorkerCoordinator()
_RECOVERY = RunRecovery(_ENGINE.ledger)
_CALIBRATION = CalibrationEngine(_ENGINE.ledger)
_ACTIVE_RUNS: dict[str, AgenticRun] = {}


class MetricObservationPayload(BaseModel):
    key: str = Field(min_length=1, max_length=200)
    value: float | int | bool | str
    source: str = ""
    observed_at: str = ""
    confidence: float | None = Field(default=None, ge=0.0, le=1.0)
    source_type: str = Field(default="unspecified", max_length=40)
    freshness_days: int | None = Field(default=None, ge=0)
    unit: str = Field(default="", max_length=40)
    polarity: int = Field(default=0, ge=-1, le=1)
    metadata: dict[str, Any] = Field(default_factory=dict)


class WorkerRunRequest(BaseModel):
    objective: str = Field(min_length=1, max_length=1000)
    context: dict[str, Any] = Field(default_factory=dict)
    observations: list[MetricObservationPayload] = Field(default_factory=list)
    confirmed_falsifiers: list[str] = Field(default_factory=list)
    policies: dict[str, dict[str, float]] = Field(default_factory=dict)
    no_opportunity: bool = False


class StartRunRequest(BaseModel):
    objective: str = Field(min_length=1, max_length=1000)
    context: dict[str, Any] = Field(default_factory=dict)


class FinalizeRunRequest(BaseModel):
    no_opportunity: bool = False


class PredictionRequest(BaseModel):
    run_id: str = Field(min_length=1, max_length=100)
    metric: str = Field(min_length=1, max_length=200)
    predicted_value: float
    horizon_days: int = Field(gt=0, le=3650)
    baseline_value: float | None = None


class SettlePredictionRequest(BaseModel):
    realized_value: float


def _observation(item: MetricObservationPayload) -> MetricObservation:
    return MetricObservation(
        key=item.key,
        value=item.value,
        source=item.source,
        observed_at=item.observed_at,
        confidence=item.confidence,
        source_type=item.source_type,
        freshness_days=item.freshness_days,
        unit=item.unit,
        polarity=item.polarity,
        metadata=item.metadata,
    )


def _load_open_run(run_id: str) -> AgenticRun:
    existing = _ACTIVE_RUNS.get(run_id)
    if existing is not None:
        return existing
    recovered = _RECOVERY.recover_open_run(run_id)
    _ACTIVE_RUNS[run_id] = recovered
    return recovered


@router.get("/v2/capabilities")
def agentic_v2_capabilities() -> dict[str, Any]:
    return {
        "engine": "Agentic Runtime Ω",
        "version": "2.0",
        "workers": 8,
        "deterministicWorkers": True,
        "contradictionGraph": True,
        "evidenceDirectorScoring": True,
        "replayRecovery": True,
        "predictionCalibration": True,
        "externalEvidenceAutoCanonical": False,
        "autoSelfModification": False,
        "directTradeExecution": False,
    }


@router.post("/v2/run-workers")
def run_workers(request: WorkerRunRequest) -> dict[str, Any]:
    packet = WorkerPacket(
        observations=tuple(_observation(item) for item in request.observations),
        confirmed_falsifiers=tuple(request.confirmed_falsifiers),
        policies=request.policies,
    )
    try:
        with _ENGINE_LOCK:
            run = _ENGINE.start_run(request.objective, request.context)
            _RECOVERY.snapshot_context(run)
            results = _COORDINATOR.run(packet)
            for result in results:
                _ENGINE.submit_result(run, result)
            receipt = _ENGINE.finalize(run, no_opportunity=request.no_opportunity)
            return {
                "engine": "Agentic Runtime Ω",
                "version": "2.0",
                "runId": run.run_id,
                "receipt": receipt.to_dict(),
                "results": [result.to_dict() for result in results],
                "guardrails": {
                    "externalEvidenceAutoCanonical": False,
                    "majorityVoting": False,
                    "falsifiersAbsoluteVeto": True,
                    "readyForExecutionIsTrade": False,
                },
            }
    except (ValueError, RuntimeError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/v2/runs/start")
def start_recoverable_run(request: StartRunRequest) -> dict[str, Any]:
    try:
        with _ENGINE_LOCK:
            run = _ENGINE.start_run(request.objective, request.context)
            _RECOVERY.snapshot_context(run)
            _ACTIVE_RUNS[run.run_id] = run
            return {"runId": run.run_id, "status": run.status.value, "contextHash": run.context_hash}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/v2/runs/{run_id}/results")
def submit_recoverable_result(run_id: str, payload: SpecialistResultPayload) -> dict[str, Any]:
    try:
        with _ENGINE_LOCK:
            run = _load_open_run(run_id)
            result = _materialize_result(payload)
            _ENGINE.submit_result(run, result)
            return {
                "runId": run_id,
                "accepted": result.specialist.value,
                "resultCount": len(run.results),
            }
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except (ValueError, RuntimeError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/v2/runs/{run_id}/finalize")
def finalize_recoverable_run(run_id: str, request: FinalizeRunRequest) -> dict[str, Any]:
    try:
        with _ENGINE_LOCK:
            run = _load_open_run(run_id)
            receipt = _ENGINE.finalize(run, no_opportunity=request.no_opportunity)
            _ACTIVE_RUNS.pop(run_id, None)
            return {"runId": run_id, "receipt": receipt.to_dict()}
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except (ValueError, RuntimeError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/v2/runs/{run_id}")
def get_run_view(run_id: str) -> dict[str, Any]:
    try:
        return _RECOVERY.view(run_id).to_dict()
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/v2/runs/{run_id}/recover")
def recover_run(run_id: str) -> dict[str, Any]:
    try:
        with _ENGINE_LOCK:
            run = _RECOVERY.recover_open_run(run_id)
            _ACTIVE_RUNS[run_id] = run
            return {
                "runId": run_id,
                "status": run.status.value,
                "resultsRecovered": len(run.results),
                "contextHash": run.context_hash,
            }
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@router.post("/v2/predictions")
def record_prediction(request: PredictionRequest) -> dict[str, Any]:
    try:
        with _ENGINE_LOCK:
            record = _CALIBRATION.record_prediction(
                run_id=request.run_id,
                metric=request.metric,
                predicted_value=request.predicted_value,
                horizon_days=request.horizon_days,
                baseline_value=request.baseline_value,
            )
            return asdict(record)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/v2/predictions/{prediction_id}/settle")
def settle_prediction(prediction_id: str, request: SettlePredictionRequest) -> dict[str, Any]:
    try:
        with _ENGINE_LOCK:
            return _CALIBRATION.settle(
                prediction_id=prediction_id,
                realized_value=request.realized_value,
            ).to_dict()
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@router.get("/v2/calibration")
def calibration_summary(metric: str | None = Query(default=None, max_length=200)) -> dict[str, Any]:
    return _CALIBRATION.summary(metric)
