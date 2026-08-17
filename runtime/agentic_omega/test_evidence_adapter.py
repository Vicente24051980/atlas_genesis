from __future__ import annotations

from runtime.agentic_omega import EvidenceEnvelopeAdapter


def _envelope(*, metrics=None, canonical=False, source_type="web"):
    return {
        "source": "https://example.test/source",
        "source_type": source_type,
        "retrieved_at": "2026-08-17T21:00:00+00:00",
        "content_hash": "abc123",
        "classification": "FACT",
        "confidence": 0.9,
        "canonical": canonical,
        "content": "Revenue grew 20%.",
        "metadata": {"provider": "test", **({"metrics": metrics} if metrics is not None else {})},
    }


def test_adapter_only_reads_explicit_structured_metrics() -> None:
    result = EvidenceEnvelopeAdapter().adapt([
        _envelope(metrics=[{"key": "demand_growth", "value": 0.20, "observed_at": "2026-06-30"}])
    ])
    assert len(result.observations) == 1
    observation = result.observations[0]
    assert observation.key == "demand_growth"
    assert observation.value == 0.20
    assert observation.observed_at == "2026-06-30"
    assert observation.metadata["evidenceCandidateOnly"] is True
    assert observation.metadata["autoCanonical"] is False


def test_adapter_does_not_parse_prose_without_metrics() -> None:
    result = EvidenceEnvelopeAdapter().adapt([_envelope(metrics=None)])
    assert result.observations == ()
    assert result.structured_metrics_seen == 0


def test_retrieval_time_never_substitutes_metric_observation_time() -> None:
    result = EvidenceEnvelopeAdapter().adapt([
        _envelope(metrics=[{"key": "roic", "value": 0.21}])
    ])
    assert len(result.observations) == 1
    observation = result.observations[0]
    assert observation.observed_at == ""
    assert observation.metadata["envelopeRetrievedAt"] == "2026-08-17T21:00:00+00:00"


def test_envelope_canonical_claim_does_not_auto_promote_metric() -> None:
    result = EvidenceEnvelopeAdapter().adapt([
        _envelope(
            canonical=True,
            metrics=[{"key": "moat_score", "value": 85, "observed_at": "2026-08-17"}],
        )
    ])
    observation = result.observations[0]
    assert observation.metadata["envelopeCanonicalClaim"] is True
    assert observation.metadata["autoCanonical"] is False
    assert result.to_dict()["autoCanonical"] is False


def test_memory_source_type_is_preserved_for_lower_evidence_weight() -> None:
    result = EvidenceEnvelopeAdapter().adapt([
        _envelope(
            source_type="memory",
            metrics=[{"key": "macro_regime_support_score", "value": 60, "observed_at": "2026-08-17"}],
        )
    ])
    assert result.observations[0].source_type == "memory"


def test_malformed_metric_is_rejected_not_guessed() -> None:
    result = EvidenceEnvelopeAdapter().adapt([
        _envelope(metrics=[{"value": 1}, {"key": "roic"}, "bad"])
    ])
    assert result.observations == ()
    assert result.structured_metrics_seen == 3
    assert result.rejected_metrics == 3
