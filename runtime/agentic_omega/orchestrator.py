from __future__ import annotations

import hashlib
import json
import uuid
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from enum import Enum
from pathlib import Path
from typing import Any, Iterable


class EpistemicLabel(str, Enum):
    FACT = "FACT"
    HYPOTHESIS = "HYPOTHESIS"
    INTERPRETATION = "INTERPRETATION"
    NOISE = "NOISE"


class Specialist(str, Enum):
    ECONOMIC_PROOF = "Economic Proof Ω"
    VALUATION = "Valuation / Implied Return Ω"
    CAPEX_PRODUCTIVITY = "CAPEX Productivity Ω"
    MOAT = "Moat Ω"
    INSTITUTIONAL_ROTATION = "Institutional Rotation Ω"
    MACRO_REGIME = "Macro / Regime Ω"
    FALSIFIERS = "Falsifiers Ω / Red Team"
    EVIDENCE_DIRECTOR = "Evidence Director Ω"


class GateState(str, Enum):
    PASS = "PASS"
    WATCH = "WATCH"
    REJECT = "REJECT"
    VETO = "VETO"
    NOT_EVALUATED = "NOT_EVALUATED"


class RunStatus(str, Enum):
    OPEN = "OPEN"
    WATCH = "WATCH"
    REJECT = "REJECT"
    NO_OPPORTUNITY = "NO_OPPORTUNITY"
    READY_FOR_EXECUTION_GATE = "READY_FOR_EXECUTION_GATE"


REQUIRED_SPECIALISTS = tuple(Specialist)
CORE_DECISION_GATES = frozenset(
    {
        Specialist.ECONOMIC_PROOF,
        Specialist.VALUATION,
        Specialist.CAPEX_PRODUCTIVITY,
        Specialist.MOAT,
        Specialist.EVIDENCE_DIRECTOR,
    }
)


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _canonical_json(value: Any) -> str:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False, default=str)


@dataclass(frozen=True)
class EvidenceAssertion:
    claim: str
    label: EpistemicLabel
    source: str = ""
    observed_at: str = ""
    confidence: float | None = None
    freshness: str = ""
    evidence_id: str = field(default_factory=lambda: uuid.uuid4().hex)

    def __post_init__(self) -> None:
        if not self.claim.strip():
            raise ValueError("claim must be non-empty")
        if self.confidence is not None and not 0.0 <= self.confidence <= 1.0:
            raise ValueError("confidence must be between 0 and 1")
        if self.label is EpistemicLabel.FACT and (not self.source.strip() or not self.observed_at.strip()):
            raise ValueError("FACT requires source and observed_at")

    def to_dict(self) -> dict[str, Any]:
        payload = asdict(self)
        payload["label"] = self.label.value
        return payload


@dataclass(frozen=True)
class SpecialistResult:
    specialist: Specialist
    gate_state: GateState
    conclusion: str
    assertions: tuple[EvidenceAssertion, ...] = ()
    confidence: float | None = None
    confirmed_falsifier: bool = False
    metadata: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not self.conclusion.strip():
            raise ValueError("conclusion must be non-empty")
        if self.confidence is not None and not 0.0 <= self.confidence <= 1.0:
            raise ValueError("confidence must be between 0 and 1")
        if self.confirmed_falsifier and self.specialist is not Specialist.FALSIFIERS:
            raise ValueError("only Falsifiers Ω may confirm an absolute veto")
        if self.gate_state is GateState.VETO and self.specialist is not Specialist.FALSIFIERS:
            raise ValueError("only Falsifiers Ω may emit VETO")

    def to_dict(self) -> dict[str, Any]:
        return {
            "specialist": self.specialist.value,
            "gate_state": self.gate_state.value,
            "conclusion": self.conclusion,
            "assertions": [item.to_dict() for item in self.assertions],
            "confidence": self.confidence,
            "confirmed_falsifier": self.confirmed_falsifier,
            "metadata": self.metadata,
        }


@dataclass
class AgenticRun:
    objective: str
    context: dict[str, Any]
    run_id: str = field(default_factory=lambda: uuid.uuid4().hex)
    created_at: str = field(default_factory=_utc_now)
    results: dict[Specialist, SpecialistResult] = field(default_factory=dict)
    status: RunStatus = RunStatus.OPEN

    @property
    def context_hash(self) -> str:
        return hashlib.sha256(_canonical_json(self.context).encode("utf-8")).hexdigest()


@dataclass(frozen=True)
class OutcomeReceipt:
    run_id: str
    status: RunStatus
    reason: str
    missing_specialists: tuple[str, ...]
    vetoed: bool
    context_hash: str
    emitted_at: str

    def to_dict(self) -> dict[str, Any]:
        payload = asdict(self)
        payload["status"] = self.status.value
        return payload


@dataclass(frozen=True)
class EvolutionProposal:
    proposal_id: str
    title: str
    rationale: str
    evidence_ids: tuple[str, ...]
    created_at: str
    requires_owner_approval: bool = True
    auto_apply: bool = False


class AppendOnlyEventLedger:
    """Append-only JSONL ledger with a SHA-256 hash chain.

    A missing path keeps the ledger in memory, which is useful for tests and
    ephemeral execution. Persistent runs should provide a path outside frozen
    CORE-00.
    """

    def __init__(self, path: str | Path | None = None) -> None:
        self.path = Path(path) if path else None
        self._events: list[dict[str, Any]] = []
        if self.path and self.path.exists():
            self._events = [
                json.loads(line)
                for line in self.path.read_text(encoding="utf-8").splitlines()
                if line.strip()
            ]
            self.verify()

    @property
    def events(self) -> tuple[dict[str, Any], ...]:
        return tuple(self._events)

    def append(self, event_type: str, payload: dict[str, Any]) -> dict[str, Any]:
        previous_hash = self._events[-1]["event_hash"] if self._events else "GENESIS"
        core = {
            "event_type": event_type,
            "payload": payload,
            "previous_hash": previous_hash,
            "recorded_at": _utc_now(),
        }
        event_hash = hashlib.sha256(_canonical_json(core).encode("utf-8")).hexdigest()
        event = {**core, "event_hash": event_hash}
        self._events.append(event)
        if self.path:
            self.path.parent.mkdir(parents=True, exist_ok=True)
            with self.path.open("a", encoding="utf-8") as handle:
                handle.write(_canonical_json(event) + "\n")
        return event

    def verify(self) -> bool:
        previous_hash = "GENESIS"
        for event in self._events:
            core = {
                "event_type": event["event_type"],
                "payload": event["payload"],
                "previous_hash": event["previous_hash"],
                "recorded_at": event["recorded_at"],
            }
            expected = hashlib.sha256(_canonical_json(core).encode("utf-8")).hexdigest()
            if event["previous_hash"] != previous_hash or event["event_hash"] != expected:
                raise ValueError("agentic ledger hash-chain verification failed")
            previous_hash = event["event_hash"]
        return True


class AgenticOmegaOrchestrator:
    """Ouroboros-inspired orchestration subordinate to ATLAS Ω governance.

    It coordinates specialists, preserves evidence and outcomes, and records
    evolution proposals. It never self-modifies code, never turns a majority
    vote into an investment action, and never bypasses Falsifiers Ω.
    """

    def __init__(self, ledger: AppendOnlyEventLedger | None = None) -> None:
        self.ledger = ledger or AppendOnlyEventLedger()

    def start_run(self, objective: str, context: dict[str, Any] | None = None) -> AgenticRun:
        if not objective.strip():
            raise ValueError("objective must be non-empty")
        run = AgenticRun(objective=objective.strip(), context=context or {})
        self.ledger.append(
            "RUN_STARTED",
            {
                "run_id": run.run_id,
                "objective": run.objective,
                "context_hash": run.context_hash,
                "required_specialists": [item.value for item in REQUIRED_SPECIALISTS],
            },
        )
        return run

    def submit_result(self, run: AgenticRun, result: SpecialistResult) -> None:
        if run.status is not RunStatus.OPEN:
            raise RuntimeError("cannot submit a result after run finalization")
        if result.specialist in run.results:
            raise ValueError(f"duplicate specialist result: {result.specialist.value}")
        run.results[result.specialist] = result
        self.ledger.append(
            "SPECIALIST_RESULT",
            {"run_id": run.run_id, "result": result.to_dict()},
        )

    def finalize(self, run: AgenticRun, *, no_opportunity: bool = False) -> OutcomeReceipt:
        if run.status is not RunStatus.OPEN:
            raise RuntimeError("run has already been finalized")

        falsifier = run.results.get(Specialist.FALSIFIERS)
        if falsifier and (falsifier.confirmed_falsifier or falsifier.gate_state is GateState.VETO):
            status = RunStatus.REJECT
            reason = "confirmed material falsifier; absolute independent veto"
            vetoed = True
        else:
            vetoed = False
            missing = [item for item in REQUIRED_SPECIALISTS if item not in run.results]
            evidence_director = run.results.get(Specialist.EVIDENCE_DIRECTOR)
            rejected_core = [
                item for item in CORE_DECISION_GATES
                if item in run.results and run.results[item].gate_state is GateState.REJECT
            ]
            watched_core = [
                item for item in CORE_DECISION_GATES
                if item in run.results and run.results[item].gate_state in {GateState.WATCH, GateState.NOT_EVALUATED}
            ]

            if evidence_director and evidence_director.gate_state is GateState.REJECT:
                status = RunStatus.REJECT
                reason = "Evidence Director Ω rejected the evidence packet"
            elif rejected_core:
                status = RunStatus.REJECT
                reason = "hard decision gate rejected: " + ", ".join(item.value for item in rejected_core)
            elif missing:
                status = RunStatus.WATCH
                reason = "committee incomplete; majority voting is prohibited"
            elif watched_core:
                status = RunStatus.WATCH
                reason = "one or more hard gates remain unresolved"
            elif no_opportunity:
                status = RunStatus.NO_OPPORTUNITY
                reason = "valid null result; no portfolio action is manufactured"
            else:
                status = RunStatus.READY_FOR_EXECUTION_GATE
                reason = "all evidence gates passed; execution/sizing remains separate"

        run.status = status
        missing_names = tuple(item.value for item in REQUIRED_SPECIALISTS if item not in run.results)
        receipt = OutcomeReceipt(
            run_id=run.run_id,
            status=status,
            reason=reason,
            missing_specialists=missing_names,
            vetoed=vetoed,
            context_hash=run.context_hash,
            emitted_at=_utc_now(),
        )
        self.ledger.append("OUTCOME_RECEIPT", receipt.to_dict())
        return receipt

    def propose_evolution(
        self,
        *,
        title: str,
        rationale: str,
        evidence_ids: Iterable[str],
    ) -> EvolutionProposal:
        if not title.strip() or not rationale.strip():
            raise ValueError("title and rationale must be non-empty")
        evidence = tuple(item for item in evidence_ids if str(item).strip())
        if not evidence:
            raise ValueError("evolution proposals require evidence_ids")
        proposal = EvolutionProposal(
            proposal_id=uuid.uuid4().hex,
            title=title.strip(),
            rationale=rationale.strip(),
            evidence_ids=evidence,
            created_at=_utc_now(),
        )
        self.ledger.append("EVOLUTION_PROPOSED", asdict(proposal))
        return proposal
