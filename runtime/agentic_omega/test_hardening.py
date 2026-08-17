from __future__ import annotations

from runtime.agentic_omega import GateState, MetricObservation, Specialist, WorkerPacket
from runtime.agentic_omega.durable_ledger import DurableAgenticLedger
from runtime.agentic_omega.hardening import GovernedWorkerCoordinator


def _obs(key: str, value, *, source: str = "primary:test", observed_at: str = "2026-08-17", polarity: int = 0, **metadata) -> MetricObservation:
    return MetricObservation(
        key=key,
        value=value,
        source=source,
        observed_at=observed_at,
        confidence=0.95,
        source_type="primary",
        freshness_days=1,
        polarity=polarity,
        metadata=metadata,
    )


def _packet(extra=()) -> WorkerPacket:
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
        ) + tuple(extra)
    )


def test_falsifiers_review_incomplete_is_fail_closed() -> None:
    results = GovernedWorkerCoordinator().run(_packet(), falsifier_review_complete=False)
    falsifier = next(result for result in results if result.specialist is Specialist.FALSIFIERS)
    director = next(result for result in results if result.specialist is Specialist.EVIDENCE_DIRECTOR)
    assert falsifier.gate_state is GateState.NOT_EVALUATED
    assert director.gate_state is GateState.WATCH


def test_confirmed_falsifier_veto_does_not_require_review_complete_flag() -> None:
    packet = WorkerPacket(
        observations=_packet().observations,
        confirmed_falsifiers=("confirmed fraud",),
    )
    results = GovernedWorkerCoordinator().run(packet, falsifier_review_complete=False)
    falsifier = next(result for result in results if result.specialist is Specialist.FALSIFIERS)
    assert falsifier.gate_state is GateState.VETO
    assert falsifier.confirmed_falsifier is True


def test_temporal_supersession_removes_only_explicitly_superseded_conflict() -> None:
    packet = _packet(
        extra=(
            _obs("moat_intact", False, source="old:test", observed_at="2026-07-01", polarity=-1),
            _obs(
                "moat_intact",
                True,
                source="new:test",
                observed_at="2026-08-17",
                polarity=1,
                supersedes_previous=True,
            ),
        )
    )
    results = GovernedWorkerCoordinator().run(packet, falsifier_review_complete=True)
    director = next(result for result in results if result.specialist is Specialist.EVIDENCE_DIRECTOR)
    assert director.metadata["contradictions"] == []


def test_durable_ledger_refreshes_stale_instance_before_append(tmp_path) -> None:
    path = tmp_path / "events.jsonl"
    first = DurableAgenticLedger(path)
    second = DurableAgenticLedger(path)
    first.append("A", {"n": 1})
    second.append("B", {"n": 2})
    first.append("C", {"n": 3})
    refreshed = DurableAgenticLedger(path)
    assert [event["event_type"] for event in refreshed.events] == ["A", "B", "C"]
    assert refreshed.verify() is True
