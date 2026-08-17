from __future__ import annotations

from collections import defaultdict
from dataclasses import replace
from typing import Iterable

from .orchestrator import GateState, Specialist, SpecialistResult
from .workers import MetricObservation, WorkerCoordinator, WorkerPacket


_CRITICAL_PROVENANCE: dict[Specialist, tuple[str, ...]] = {
    Specialist.ECONOMIC_PROOF: ("demand_growth", "capture_growth", "fcf_conversion", "roic"),
    Specialist.VALUATION: ("expected_return_annualized",),
    Specialist.CAPEX_PRODUCTIVITY: ("incremental_roic", "capex_payback_years"),
    Specialist.MOAT: ("moat_score",),
}


def _temporal_filter(observations: Iterable[MetricObservation]) -> tuple[MetricObservation, ...]:
    """Apply explicit supersession only; never infer that newer automatically wins."""
    grouped: dict[str, list[MetricObservation]] = defaultdict(list)
    for item in observations:
        grouped[item.key].append(item)
    kept: list[MetricObservation] = []
    for items in grouped.values():
        superseding = [item for item in items if bool(item.metadata.get("supersedes_previous"))]
        if superseding:
            latest = sorted(superseding, key=lambda item: item.observed_at)[-1]
            kept.append(latest)
        else:
            kept.extend(items)
    return tuple(kept)


def _replace_state(result: SpecialistResult, state: GateState, conclusion: str, **metadata) -> SpecialistResult:
    merged = dict(result.metadata)
    merged.update(metadata)
    return replace(result, gate_state=state, conclusion=conclusion, metadata=merged)


class GovernedWorkerCoordinator:
    """Hardening wrapper around v2 workers.

    Adds three fail-closed gates without changing the v1/v2 orchestrator:
    1) core financial metrics require source + observed_at;
    2) no-falsifier PASS requires an explicit completed Red Team review;
    3) explicit temporal supersession removes stale contradiction edges only when
       the newer observation declares that it supersedes prior evidence.
    """

    def __init__(self) -> None:
        self._base = WorkerCoordinator()

    def run(
        self,
        packet: WorkerPacket,
        *,
        falsifier_review_complete: bool,
    ) -> tuple[SpecialistResult, ...]:
        filtered = WorkerPacket(
            observations=_temporal_filter(packet.observations),
            confirmed_falsifiers=packet.confirmed_falsifiers,
            policies=packet.policies,
        )
        results = list(self._base.run(filtered))
        by_specialist = {result.specialist: index for index, result in enumerate(results)}
        observations_by_key: dict[str, list[MetricObservation]] = defaultdict(list)
        for item in filtered.observations:
            observations_by_key[item.key].append(item)

        provenance_gaps: dict[str, list[str]] = {}
        for specialist, keys in _CRITICAL_PROVENANCE.items():
            missing: list[str] = []
            for key in keys:
                candidates = observations_by_key.get(key, [])
                if not candidates or not any(item.source.strip() and item.observed_at.strip() for item in candidates):
                    missing.append(key)
            if missing:
                index = by_specialist[specialist]
                results[index] = _replace_state(
                    results[index],
                    GateState.NOT_EVALUATED,
                    "critical metric provenance incomplete: " + ", ".join(missing),
                    provenanceGap=missing,
                    failClosed=True,
                )
                provenance_gaps[specialist.value] = missing

        falsifier_index = by_specialist[Specialist.FALSIFIERS]
        falsifier_result = results[falsifier_index]
        if not packet.confirmed_falsifiers and not falsifier_review_complete:
            results[falsifier_index] = _replace_state(
                falsifier_result,
                GateState.NOT_EVALUATED,
                "Falsifiers Ω review has not been explicitly completed",
                reviewComplete=False,
                failClosed=True,
            )

        director_index = by_specialist[Specialist.EVIDENCE_DIRECTOR]
        director = results[director_index]
        unresolved_governance = bool(provenance_gaps) or (
            not packet.confirmed_falsifiers and not falsifier_review_complete
        )
        if unresolved_governance and director.gate_state is GateState.PASS:
            reasons: list[str] = []
            if provenance_gaps:
                reasons.append("critical provenance gaps")
            if not packet.confirmed_falsifiers and not falsifier_review_complete:
                reasons.append("Falsifiers review incomplete")
            results[director_index] = _replace_state(
                director,
                GateState.WATCH,
                "governance review incomplete: " + "; ".join(reasons),
                governanceWatch=True,
                provenanceGaps=provenance_gaps,
                falsifierReviewComplete=falsifier_review_complete,
            )
        else:
            results[director_index] = replace(
                director,
                metadata={
                    **director.metadata,
                    "provenanceGaps": provenance_gaps,
                    "falsifierReviewComplete": falsifier_review_complete,
                },
            )

        return tuple(results)
