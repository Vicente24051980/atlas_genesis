from __future__ import annotations

from api.agent_infrastructure import EvidenceEnvelope
from api.agentic_evidence_bridge import EvidenceWorkerRunRequest, run_from_governed_evidence


def _envelope(metrics, *, canonical=False, source_type="api") -> EvidenceEnvelope:
    return EvidenceEnvelope(
        source="provider:test",
        source_type=source_type,
        retrieved_at="2026-08-17T21:00:00+00:00",
        content_hash="hash-test",
        classification="FACT",
        confidence=0.95,
        canonical=canonical,
        content="Structured provider payload.",
        metadata={"provider": "test", "metrics": metrics},
    )


def _metrics():
    observed = "2026-08-17"
    return [
        {"key": "demand_growth", "value": 0.20, "observed_at": observed},
        {"key": "capture_growth", "value": 0.15, "observed_at": observed},
        {"key": "fcf_conversion", "value": 0.30, "observed_at": observed},
        {"key": "roic", "value": 0.22, "observed_at": observed},
        {"key": "expected_return_annualized", "value": 0.15, "observed_at": observed},
        {"key": "hurdle_rate", "value": 0.10, "observed_at": observed},
        {"key": "incremental_roic", "value": 0.18, "observed_at": observed},
        {"key": "capex_payback_years", "value": 3, "observed_at": observed},
        {"key": "wacc", "value": 0.08, "observed_at": observed},
        {"key": "moat_score", "value": 82, "observed_at": observed},
        {"key": "moat_erosion_confirmed", "value": False, "observed_at": observed},
        {"key": "institutional_flow_score", "value": 72, "observed_at": observed},
        {"key": "macro_regime_support_score", "value": 55, "observed_at": observed},
    ]


def test_structured_envelope_can_reach_execution_gate_without_trade() -> None:
    response = run_from_governed_evidence(
        EvidenceWorkerRunRequest(
            objective="bridge-smoke",
            context={"ticker": "TEST"},
            envelopes=[_envelope(_metrics())],
            falsifier_review_complete=True,
        )
    )
    assert response["adapter"]["observations"] == len(_metrics())
    assert response["receipt"]["status"] == "READY_FOR_EXECUTION_GATE"
    assert response["guardrails"]["readyForExecutionIsTrade"] is False
    assert response["guardrails"]["externalEvidenceAutoCanonical"] is False


def test_unstructured_envelope_fails_closed() -> None:
    envelope = _envelope([])
    envelope.metadata = {"provider": "test"}
    response = run_from_governed_evidence(
        EvidenceWorkerRunRequest(
            objective="bridge-no-metrics",
            envelopes=[envelope],
            falsifier_review_complete=True,
        )
    )
    assert response["adapter"]["observations"] == 0
    assert response["receipt"]["status"] == "WATCH"


def test_missing_metric_observed_at_is_not_filled_from_retrieved_at() -> None:
    metrics = _metrics()
    metrics[0] = {"key": "demand_growth", "value": 0.20}
    response = run_from_governed_evidence(
        EvidenceWorkerRunRequest(
            objective="bridge-missing-date",
            envelopes=[_envelope(metrics)],
            falsifier_review_complete=True,
        )
    )
    economic = response["results"][0]
    assert economic["gate_state"] == "NOT_EVALUATED"
    assert "demand_growth" in economic["metadata"]["provenanceGap"]
    assert response["receipt"]["status"] == "WATCH"


def test_canonical_envelope_claim_still_remains_candidate_only() -> None:
    response = run_from_governed_evidence(
        EvidenceWorkerRunRequest(
            objective="bridge-canonical-claim",
            envelopes=[_envelope(_metrics(), canonical=True)],
            falsifier_review_complete=True,
        )
    )
    assert response["adapter"]["autoCanonical"] is False
    assert response["guardrails"]["externalEvidenceAutoCanonical"] is False
