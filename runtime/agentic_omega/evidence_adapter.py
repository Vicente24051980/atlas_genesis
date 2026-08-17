from __future__ import annotations

from collections.abc import Iterable, Mapping
from dataclasses import dataclass
from typing import Any

from .workers import MetricObservation


@dataclass(frozen=True)
class EvidenceAdapterResult:
    observations: tuple[MetricObservation, ...]
    envelopes_seen: int
    structured_metrics_seen: int
    rejected_metrics: int

    def to_dict(self) -> dict[str, Any]:
        return {
            "observations": len(self.observations),
            "envelopesSeen": self.envelopes_seen,
            "structuredMetricsSeen": self.structured_metrics_seen,
            "rejectedMetrics": self.rejected_metrics,
            "candidateOnly": True,
            "autoCanonical": False,
        }


class EvidenceEnvelopeAdapter:
    """Convert only explicitly structured envelope metadata into metric candidates.

    This adapter deliberately does not parse prose, infer numbers from content, or
    promote an Agent Infrastructure envelope to canonical evidence. A provider or
    upstream parser must place explicit metric objects in ``metadata.metrics``.

    Metric observation time is never substituted with envelope retrieval time:
    retrieval time proves when ATLAS acquired the evidence, not when the economic
    fact was observed. Missing metric ``observed_at`` therefore remains missing and
    will fail the v2.1 critical-provenance gate where applicable.
    """

    @staticmethod
    def _mapping(value: Any) -> Mapping[str, Any] | None:
        return value if isinstance(value, Mapping) else None

    def adapt(self, envelopes: Iterable[Mapping[str, Any]]) -> EvidenceAdapterResult:
        observations: list[MetricObservation] = []
        envelope_count = 0
        metric_count = 0
        rejected = 0

        for raw_envelope in envelopes:
            envelope_count += 1
            envelope = self._mapping(raw_envelope)
            if envelope is None:
                continue
            metadata = self._mapping(envelope.get("metadata")) or {}
            metrics = metadata.get("metrics")
            if not isinstance(metrics, list):
                continue

            source = str(envelope.get("source") or "")
            source_type = str(envelope.get("source_type") or "unspecified")
            envelope_confidence = envelope.get("confidence")
            retrieved_at = str(envelope.get("retrieved_at") or "")
            content_hash = str(envelope.get("content_hash") or "")
            classification = str(envelope.get("classification") or "UNCLASSIFIED")
            envelope_canonical = bool(envelope.get("canonical", False))

            for raw_metric in metrics:
                metric_count += 1
                metric = self._mapping(raw_metric)
                if metric is None:
                    rejected += 1
                    continue
                key = str(metric.get("key") or "").strip()
                if not key or "value" not in metric:
                    rejected += 1
                    continue
                confidence = metric.get("confidence", envelope_confidence)
                try:
                    parsed_confidence = None if confidence is None else float(confidence)
                    if parsed_confidence is not None and not 0 <= parsed_confidence <= 1:
                        raise ValueError
                    freshness = metric.get("freshness_days")
                    parsed_freshness = None if freshness is None else int(freshness)
                    polarity = int(metric.get("polarity", 0))
                    observation = MetricObservation(
                        key=key,
                        value=metric["value"],
                        source=source,
                        observed_at=str(metric.get("observed_at") or ""),
                        confidence=parsed_confidence,
                        source_type=source_type,
                        freshness_days=parsed_freshness,
                        unit=str(metric.get("unit") or ""),
                        polarity=polarity,
                        metadata={
                            **(dict(self._mapping(metric.get("metadata")) or {})),
                            "evidenceCandidateOnly": True,
                            "autoCanonical": False,
                            "envelopeCanonicalClaim": envelope_canonical,
                            "envelopeRetrievedAt": retrieved_at,
                            "contentHash": content_hash,
                            "classification": classification,
                            "provider": metadata.get("provider"),
                        },
                    )
                except (TypeError, ValueError):
                    rejected += 1
                    continue
                observations.append(observation)

        return EvidenceAdapterResult(
            observations=tuple(observations),
            envelopes_seen=envelope_count,
            structured_metrics_seen=metric_count,
            rejected_metrics=rejected,
        )
