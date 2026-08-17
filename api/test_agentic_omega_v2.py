from __future__ import annotations

from api.agentic_omega_v2 import (
    MetricObservationPayload,
    PredictionRequest,
    SettlePredictionRequest,
    WorkerRunRequest,
    calibration_summary,
    record_prediction,
    run_workers,
    settle_prediction,
)


def _metric(key: str, value, *, polarity: int = 0, material: bool = False) -> MetricObservationPayload:
    return MetricObservationPayload(
        key=key,
        value=value,
        source="primary:test",
        observed_at="2026-08-17",
        confidence=0.95,
        source_type="primary",
        freshness_days=1,
        polarity=polarity,
        metadata={"material": material},
    )


def _request() -> WorkerRunRequest:
    return WorkerRunRequest(
        objective="worker-api-smoke",
        context={"ticker": "TEST"},
        observations=[
            _metric("demand_growth", 0.20),
            _metric("capture_growth", 0.15),
            _metric("fcf_conversion", 0.30),
            _metric("roic", 0.22),
            _metric("expected_return_annualized", 0.15),
            _metric("hurdle_rate", 0.10),
            _metric("incremental_roic", 0.18),
            _metric("capex_payback_years", 3),
            _metric("wacc", 0.08),
            _metric("moat_score", 82),
            _metric("moat_erosion_confirmed", False),
            _metric("institutional_flow_score", 72),
            _metric("macro_regime_support_score", 55),
        ],
    )


def test_worker_api_reaches_execution_gate_without_trade() -> None:
    response = run_workers(_request())
    assert response["receipt"]["status"] == "READY_FOR_EXECUTION_GATE"
    assert len(response["results"]) == 8
    assert response["guardrails"]["readyForExecutionIsTrade"] is False


def test_worker_api_material_contradiction_does_not_pass_evidence_director() -> None:
    request = _request()
    request.observations.extend(
        [
            _metric("moat_intact", True, polarity=1, material=True),
            MetricObservationPayload(
                key="moat_intact",
                value=False,
                source="regulator:test",
                observed_at="2026-08-17",
                confidence=0.99,
                source_type="regulatory",
                freshness_days=1,
                polarity=-1,
                metadata={"material": True},
            ),
        ]
    )
    response = run_workers(request)
    director = response["results"][-1]
    assert director["gate_state"] in {"WATCH", "REJECT"}
    assert director["metadata"]["contradictions"]
    assert response["receipt"]["status"] != "READY_FOR_EXECUTION_GATE"


def test_prediction_api_calibrates_realized_outcome() -> None:
    run = run_workers(_request())
    prediction = record_prediction(
        PredictionRequest(
            run_id=run["runId"],
            metric="fcf",
            predicted_value=120,
            horizon_days=90,
            baseline_value=100,
        )
    )
    settled = settle_prediction(
        prediction["prediction_id"],
        SettlePredictionRequest(realized_value=115),
    )
    assert settled["absolute_error"] == 5
    summary = calibration_summary("fcf")
    assert summary["count"] >= 1
