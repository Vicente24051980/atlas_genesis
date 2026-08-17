from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Iterable

from .orchestrator import (
    EpistemicLabel,
    EvidenceAssertion,
    GateState,
    Specialist,
    SpecialistResult,
)


_SOURCE_WEIGHTS = {
    "primary": 1.0,
    "regulatory": 1.0,
    "company": 0.9,
    "api": 0.8,
    "document": 0.8,
    "web": 0.7,
    "secondary": 0.65,
    "memory": 0.3,
    "unverified": 0.2,
    "unspecified": 0.4,
}


@dataclass(frozen=True)
class MetricObservation:
    key: str
    value: float | int | bool | str
    source: str
    observed_at: str
    confidence: float | None = None
    source_type: str = "unspecified"
    freshness_days: int | None = None
    unit: str = ""
    polarity: int = 0
    metadata: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not self.key.strip():
            raise ValueError("metric key must be non-empty")
        if self.confidence is not None and not 0 <= self.confidence <= 1:
            raise ValueError("metric confidence must be between 0 and 1")
        if self.freshness_days is not None and self.freshness_days < 0:
            raise ValueError("freshness_days cannot be negative")
        if self.polarity not in {-1, 0, 1}:
            raise ValueError("polarity must be -1, 0, or 1")

    def number(self) -> float | None:
        if isinstance(self.value, bool):
            return None
        if isinstance(self.value, (int, float)):
            return float(self.value)
        try:
            return float(str(self.value).strip())
        except (TypeError, ValueError):
            return None


@dataclass(frozen=True)
class Contradiction:
    key: str
    sources: tuple[str, ...]
    values: tuple[str, ...]
    material: bool
    reason: str

    def to_dict(self) -> dict[str, Any]:
        return {
            "key": self.key,
            "sources": list(self.sources),
            "values": list(self.values),
            "material": self.material,
            "reason": self.reason,
        }


class ContradictionGraph:
    """Detect only explicit, auditable conflicts; never infer semantic opposition."""

    @staticmethod
    def detect(observations: Iterable[MetricObservation]) -> tuple[Contradiction, ...]:
        groups: dict[str, list[MetricObservation]] = {}
        for item in observations:
            groups.setdefault(item.key, []).append(item)

        contradictions: list[Contradiction] = []
        for key, items in groups.items():
            if len(items) < 2:
                continue
            polarities = {item.polarity for item in items if item.polarity != 0}
            boolean_values = {item.value for item in items if isinstance(item.value, bool)}
            conflicting = polarities == {-1, 1} or boolean_values == {False, True}
            if not conflicting:
                continue
            material = any(bool(item.metadata.get("material")) for item in items)
            contradictions.append(
                Contradiction(
                    key=key,
                    sources=tuple(item.source for item in items),
                    values=tuple(str(item.value) for item in items),
                    material=material,
                    reason="explicit opposing polarity/boolean evidence for the same key",
                )
            )
        return tuple(contradictions)


@dataclass(frozen=True)
class WorkerPacket:
    observations: tuple[MetricObservation, ...]
    confirmed_falsifiers: tuple[str, ...] = ()
    policies: dict[str, dict[str, float]] = field(default_factory=dict)

    def by_key(self) -> dict[str, list[MetricObservation]]:
        result: dict[str, list[MetricObservation]] = {}
        for item in self.observations:
            result.setdefault(item.key, []).append(item)
        return result

    def latest(self, key: str) -> MetricObservation | None:
        items = self.by_key().get(key, [])
        if not items:
            return None
        return sorted(items, key=lambda item: item.observed_at)[-1]

    def number(self, key: str) -> float | None:
        item = self.latest(key)
        return item.number() if item else None

    def boolean(self, key: str) -> bool | None:
        item = self.latest(key)
        return item.value if item and isinstance(item.value, bool) else None

    def policy(self, specialist: Specialist, key: str, default: float) -> float:
        return float(self.policies.get(specialist.value, {}).get(key, default))


class SpecialistWorker:
    specialist: Specialist

    def run(self, packet: WorkerPacket, *, prior_results: tuple[SpecialistResult, ...] = ()) -> SpecialistResult:
        raise NotImplementedError

    @staticmethod
    def _assertions(items: Iterable[MetricObservation]) -> tuple[EvidenceAssertion, ...]:
        assertions: list[EvidenceAssertion] = []
        for item in items:
            if not item.source.strip() or not item.observed_at.strip():
                continue
            unit = f" {item.unit}" if item.unit else ""
            assertions.append(
                EvidenceAssertion(
                    claim=f"{item.key}={item.value}{unit}",
                    label=EpistemicLabel.FACT,
                    source=item.source,
                    observed_at=item.observed_at,
                    confidence=item.confidence,
                    freshness=(f"{item.freshness_days}d" if item.freshness_days is not None else ""),
                )
            )
        return tuple(assertions)

    def _missing(self, keys: Iterable[str]) -> SpecialistResult:
        names = tuple(keys)
        return SpecialistResult(
            specialist=self.specialist,
            gate_state=GateState.NOT_EVALUATED,
            conclusion="missing required structured evidence: " + ", ".join(names),
            metadata={"missing": list(names), "worker": self.__class__.__name__},
        )


class EconomicProofWorker(SpecialistWorker):
    specialist = Specialist.ECONOMIC_PROOF

    def run(self, packet: WorkerPacket, *, prior_results: tuple[SpecialistResult, ...] = ()) -> SpecialistResult:
        keys = ("demand_growth", "capture_growth", "fcf_conversion", "roic")
        items = [packet.latest(key) for key in keys]
        missing = [key for key, item in zip(keys, items) if item is None or item.number() is None]
        if missing:
            return self._missing(missing)
        demand, capture, fcf, roic = (item.number() for item in items)  # type: ignore[union-attr]
        roic_min = packet.policy(self.specialist, "roic_min", 0.10)
        severe_decline = packet.policy(self.specialist, "severe_decline", -0.10)
        if demand <= severe_decline or capture <= severe_decline or fcf < 0 or roic < 0:
            state = GateState.REJECT
            conclusion = "economic proof structurally fails one or more hard conditions"
        elif demand >= 0 and capture >= 0 and fcf > 0 and roic >= roic_min:
            state = GateState.PASS
            conclusion = "Demand → Capture → FCF → ROIC chain clears worker thresholds"
        else:
            state = GateState.WATCH
            conclusion = "economic chain is positive/incomplete but does not clear all thresholds"
        return SpecialistResult(
            specialist=self.specialist,
            gate_state=state,
            conclusion=conclusion,
            assertions=self._assertions(item for item in items if item),
            metadata={"worker": self.__class__.__name__, "roicMin": roic_min},
        )


class ValuationWorker(SpecialistWorker):
    specialist = Specialist.VALUATION

    def run(self, packet: WorkerPacket, *, prior_results: tuple[SpecialistResult, ...] = ()) -> SpecialistResult:
        expected = packet.latest("expected_return_annualized")
        hurdle = packet.latest("hurdle_rate")
        if expected is None or expected.number() is None:
            return self._missing(["expected_return_annualized"])
        expected_value = expected.number()
        hurdle_value = hurdle.number() if hurdle and hurdle.number() is not None else packet.policy(self.specialist, "hurdle_rate", 0.10)
        if expected_value < 0:
            state = GateState.REJECT
            conclusion = "forward expected return is negative"
        elif expected_value >= hurdle_value:
            state = GateState.PASS
            conclusion = "expected return clears hurdle"
        else:
            state = GateState.WATCH
            conclusion = "expected return is positive but below hurdle"
        assertions = [expected]
        if hurdle:
            assertions.append(hurdle)
        return SpecialistResult(
            specialist=self.specialist,
            gate_state=state,
            conclusion=conclusion,
            assertions=self._assertions(assertions),
            metadata={"worker": self.__class__.__name__, "hurdle": hurdle_value},
        )


class CapexProductivityWorker(SpecialistWorker):
    specialist = Specialist.CAPEX_PRODUCTIVITY

    def run(self, packet: WorkerPacket, *, prior_results: tuple[SpecialistResult, ...] = ()) -> SpecialistResult:
        iroic = packet.latest("incremental_roic")
        payback = packet.latest("capex_payback_years")
        missing = [key for key, item in (("incremental_roic", iroic), ("capex_payback_years", payback)) if item is None or item.number() is None]
        if missing:
            return self._missing(missing)
        iroic_value, payback_value = iroic.number(), payback.number()  # type: ignore[union-attr]
        wacc = packet.number("wacc")
        if wacc is None:
            wacc = packet.policy(self.specialist, "wacc", 0.08)
        pass_payback = packet.policy(self.specialist, "pass_payback_years", 5.0)
        reject_payback = packet.policy(self.specialist, "reject_payback_years", 10.0)
        if iroic_value < 0 or payback_value > reject_payback:
            state = GateState.REJECT
            conclusion = "incremental capital economics are destructive or payback is excessive"
        elif iroic_value >= wacc and payback_value <= pass_payback:
            state = GateState.PASS
            conclusion = "incremental ROIC clears cost of capital with acceptable payback"
        else:
            state = GateState.WATCH
            conclusion = "CAPEX productivity remains below full pass threshold"
        support = [iroic, payback]
        wacc_obs = packet.latest("wacc")
        if wacc_obs:
            support.append(wacc_obs)
        return SpecialistResult(
            specialist=self.specialist,
            gate_state=state,
            conclusion=conclusion,
            assertions=self._assertions(item for item in support if item),
            metadata={"worker": self.__class__.__name__, "wacc": wacc, "passPaybackYears": pass_payback},
        )


class MoatWorker(SpecialistWorker):
    specialist = Specialist.MOAT

    def run(self, packet: WorkerPacket, *, prior_results: tuple[SpecialistResult, ...] = ()) -> SpecialistResult:
        score = packet.latest("moat_score")
        if score is None or score.number() is None:
            return self._missing(["moat_score"])
        score_value = score.number()
        erosion = packet.boolean("moat_erosion_confirmed") is True
        pass_score = packet.policy(self.specialist, "pass_score", 70.0)
        reject_score = packet.policy(self.specialist, "reject_score", 40.0)
        if erosion or score_value < reject_score:
            state = GateState.REJECT
            conclusion = "moat is structurally inadequate or confirmed as eroding"
        elif score_value >= pass_score:
            state = GateState.PASS
            conclusion = "moat clears durability threshold"
        else:
            state = GateState.WATCH
            conclusion = "moat is plausible but not strong enough for a hard pass"
        items = [score]
        erosion_obs = packet.latest("moat_erosion_confirmed")
        if erosion_obs:
            items.append(erosion_obs)
        return SpecialistResult(
            specialist=self.specialist,
            gate_state=state,
            conclusion=conclusion,
            assertions=self._assertions(items),
            metadata={"worker": self.__class__.__name__, "passScore": pass_score},
        )


class InstitutionalRotationWorker(SpecialistWorker):
    specialist = Specialist.INSTITUTIONAL_ROTATION

    def run(self, packet: WorkerPacket, *, prior_results: tuple[SpecialistResult, ...] = ()) -> SpecialistResult:
        score = packet.latest("institutional_flow_score")
        if score is None or score.number() is None:
            return self._missing(["institutional_flow_score"])
        value = score.number()
        pass_score = packet.policy(self.specialist, "pass_score", 65.0)
        state = GateState.PASS if value >= pass_score else GateState.WATCH
        conclusion = "institutional sponsorship confirmed" if state is GateState.PASS else "institutional sponsorship is insufficient or early"
        return SpecialistResult(
            specialist=self.specialist,
            gate_state=state,
            conclusion=conclusion,
            assertions=self._assertions([score]),
            metadata={"worker": self.__class__.__name__, "signalOnly": True, "passScore": pass_score},
        )


class MacroRegimeWorker(SpecialistWorker):
    specialist = Specialist.MACRO_REGIME

    def run(self, packet: WorkerPacket, *, prior_results: tuple[SpecialistResult, ...] = ()) -> SpecialistResult:
        score = packet.latest("macro_regime_support_score")
        if score is None or score.number() is None:
            return self._missing(["macro_regime_support_score"])
        value = score.number()
        pass_score = packet.policy(self.specialist, "pass_score", 50.0)
        state = GateState.PASS if value >= pass_score else GateState.WATCH
        conclusion = "macro regime is supportive/neutral" if state is GateState.PASS else "macro regime is a headwind or unresolved"
        return SpecialistResult(
            specialist=self.specialist,
            gate_state=state,
            conclusion=conclusion,
            assertions=self._assertions([score]),
            metadata={"worker": self.__class__.__name__, "contextOnly": True, "passScore": pass_score},
        )


class FalsifiersWorker(SpecialistWorker):
    specialist = Specialist.FALSIFIERS

    def run(self, packet: WorkerPacket, *, prior_results: tuple[SpecialistResult, ...] = ()) -> SpecialistResult:
        confirmed = tuple(item.strip() for item in packet.confirmed_falsifiers if item.strip())
        if confirmed:
            return SpecialistResult(
                specialist=self.specialist,
                gate_state=GateState.VETO,
                conclusion="confirmed material falsifier(s): " + "; ".join(confirmed),
                confirmed_falsifier=True,
                metadata={"worker": self.__class__.__name__, "confirmedFalsifiers": list(confirmed)},
            )
        return SpecialistResult(
            specialist=self.specialist,
            gate_state=GateState.PASS,
            conclusion="no confirmed material falsifier supplied to the worker packet",
            metadata={"worker": self.__class__.__name__, "confirmedFalsifiers": []},
        )


class EvidenceDirectorWorker(SpecialistWorker):
    specialist = Specialist.EVIDENCE_DIRECTOR

    @staticmethod
    def _freshness_score(item: MetricObservation) -> float:
        if item.freshness_days is None:
            return 0.5
        if item.freshness_days <= 30:
            return 1.0
        if item.freshness_days <= 90:
            return 0.8
        if item.freshness_days <= 365:
            return 0.5
        return 0.2

    def run(self, packet: WorkerPacket, *, prior_results: tuple[SpecialistResult, ...] = ()) -> SpecialistResult:
        observations = packet.observations
        if not observations:
            return self._missing(["observations"])
        contradictions = ContradictionGraph.detect(observations)
        material = [item for item in contradictions if item.material]
        source_quality = sum(_SOURCE_WEIGHTS.get(item.source_type.lower(), 0.4) for item in observations) / len(observations)
        provenance = sum(1 for item in observations if item.source.strip() and item.observed_at.strip()) / len(observations)
        freshness = sum(self._freshness_score(item) for item in observations) / len(observations)
        confidence = sum(item.confidence if item.confidence is not None else 0.5 for item in observations) / len(observations)
        penalty = min(40.0, len(contradictions) * 10.0 + len(material) * 15.0)
        score = max(0.0, min(100.0, (35 * source_quality + 25 * provenance + 20 * freshness + 20 * confidence) - penalty))
        if score < 40 or len(material) >= 2:
            state = GateState.REJECT
            conclusion = "evidence packet fails quality/contradiction gate"
        elif score < 70 or contradictions:
            state = GateState.WATCH
            conclusion = "evidence packet requires clarification or stronger sourcing"
        else:
            state = GateState.PASS
            conclusion = "evidence packet clears source, freshness, confidence and contradiction gates"
        return SpecialistResult(
            specialist=self.specialist,
            gate_state=state,
            conclusion=conclusion,
            assertions=self._assertions(observations),
            confidence=round(score / 100.0, 4),
            metadata={
                "worker": self.__class__.__name__,
                "evidenceScore": round(score, 2),
                "sourceQuality": round(source_quality, 4),
                "provenance": round(provenance, 4),
                "freshness": round(freshness, 4),
                "meanConfidence": round(confidence, 4),
                "contradictions": [item.to_dict() for item in contradictions],
            },
        )


class WorkerCoordinator:
    """Execute all eight specialists without majority voting or hidden promotion."""

    def __init__(self) -> None:
        self._workers: tuple[SpecialistWorker, ...] = (
            EconomicProofWorker(),
            ValuationWorker(),
            CapexProductivityWorker(),
            MoatWorker(),
            InstitutionalRotationWorker(),
            MacroRegimeWorker(),
            FalsifiersWorker(),
        )
        self._director = EvidenceDirectorWorker()

    def run(self, packet: WorkerPacket) -> tuple[SpecialistResult, ...]:
        results = tuple(worker.run(packet) for worker in self._workers)
        director = self._director.run(packet, prior_results=results)
        return (*results, director)
