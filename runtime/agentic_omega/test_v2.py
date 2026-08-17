from __future__ import annotations

from runtime.agentic_omega import (
    AgenticRun,
    AppendOnlyEventLedger,
    CalibrationEngine,
    GateState,
    MetricObservation,
    RunRecovery,
    Specialist,
    WorkerCoordinator,
    WorkerPacket,
)


def _obs(
    key: str,
    value,
    *,
    source: str = "primary:test",
    source_type: str = "primary",
    polarity: int = 0,
    material: bool = False,
) -> MetricObservation:
    return MetricObservation(
        key=key,
        value=value,
        source=source,
        observed_at="2026-08-17",
        confidence=0.95,
        source_type=source_type,
        freshness_days=1,
        polarity=polarity,
        metadata={"material": material},
    )


def _packet() -> WorkerPacket:
    return WorkerPacket(
        observations=(
            _obs("demand_growth", 0.20),
            _obs("capture_growth", 0.15),
            _obs("fcf_conversion", 0.30),
            _obs("roic", 0.22),
            _obs("expected_return_annualized", 0.15),
            _obs("hurdle_rate", 0.10),
            _obs("incremental_roic", 0.18),
            _obs("capex_payback_years", 3),
            _obs("wacc", 0.08),
            _obs("moat_score", 82),
            _obs("moat_erosion_confirmed", False),
            _obs("institutional_flow_score", 72),
            _obs("macro_regime_support_score", 55),
        )
    )


def test_workers_all_execute() -> None:
    results = WorkerCoordinator().run(_packet())
    assert len(results) == 8
    assert all(result.gate_state is GateState.PASS for result in results)


def test_missing_metric_fails_closed() -> None:
    packet = WorkerPacket(observations=tuple(item for item in _packet().observations if item.key != "roic"))
    result = WorkerCoordinator().run(packet)[0]
    assert result.gate_state is GateState.NOT_EVALUATED


def test_falsifier_veto() -> None:
    packet = WorkerPacket(
        observations=_packet().observations,
        confirmed_falsifiers=("fraud confirmed",),
    )
    result = WorkerCoordinator().run(packet)[6]
    assert result.gate_state is GateState.VETO
    assert result.confirmed_falsifier is True


def test_contradiction_graph_forces_evidence_review() -> None:
    packet = WorkerPacket(
        observations=_packet().observations
        + (
            _obs("moat_intact", True, polarity=1, material=True),
            _obs(
                "moat_intact",
                False,
                source="regulator:test",
                source_type="regulatory",
                polarity=-1,
                material=True,
            ),
        )
    )
    director = WorkerCoordinator().run(packet)[-1]
    assert director.metadata["contradictions"]
    assert director.gate_state in {GateState.WATCH, GateState.REJECT}


def test_calibration_predicted_vs_realized() -> None:
    ledger = AppendOnlyEventLedger()
    calibration = CalibrationEngine(ledger)
    prediction = calibration.record_prediction(
        run_id="r1",
        metric="revenue",
        predicted_value=110,
        horizon_days=90,
        baseline_value=100,
    )
    settled = calibration.settle(prediction_id=prediction.prediction_id, realized_value=108)
    assert settled.absolute_error == 2
    summary = calibration.summary("revenue")
    assert summary["count"] == 1
    assert summary["directionalAccuracy"] == 1.0


def test_recovery_reconstructs_open_run() -> None:
    ledger = AppendOnlyEventLedger()
    recovery = RunRecovery(ledger)
    run = AgenticRun(objective="x", context={"ticker": "ABC"}, run_id="r1")
    ledger.append(
        "RUN_STARTED",
        {"run_id": "r1", "objective": "x", "context_hash": run.context_hash},
    )
    recovery.snapshot_context(run)
    result = WorkerCoordinator().run(_packet())[0]
    ledger.append("SPECIALIST_RESULT", {"run_id": "r1", "result": result.to_dict()})
    recovered = recovery.recover_open_run("r1")
    assert recovered.context == {"ticker": "ABC"}
    assert Specialist.ECONOMIC_PROOF in recovered.results
