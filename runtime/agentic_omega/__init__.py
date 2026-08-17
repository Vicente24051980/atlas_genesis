"""ATLAS Ω Agentic Runtime.

This package is deliberately separate from frozen CORE-00. It orchestrates
specialists and persists execution evidence while remaining subordinate to
ATLAS constitutional and epistemic gates.
"""

from .orchestrator import (
    AgenticOmegaOrchestrator,
    AgenticRun,
    AppendOnlyEventLedger,
    EpistemicLabel,
    EvidenceAssertion,
    EvolutionProposal,
    GateState,
    OutcomeReceipt,
    RunStatus,
    Specialist,
    SpecialistResult,
)
from .workers import (
    Contradiction,
    ContradictionGraph,
    EvidenceDirectorWorker,
    MetricObservation,
    WorkerCoordinator,
    WorkerPacket,
)
from .calibration import CalibrationEngine, CalibrationResult, PredictionRecord
from .recovery import RecoveredRunView, RunRecovery
from .durable_ledger import DurableAgenticLedger
from .hardening import GovernedWorkerCoordinator

__all__ = [
    "AgenticOmegaOrchestrator",
    "AgenticRun",
    "AppendOnlyEventLedger",
    "DurableAgenticLedger",
    "EpistemicLabel",
    "EvidenceAssertion",
    "EvolutionProposal",
    "GateState",
    "OutcomeReceipt",
    "RunStatus",
    "Specialist",
    "SpecialistResult",
    "MetricObservation",
    "Contradiction",
    "ContradictionGraph",
    "EvidenceDirectorWorker",
    "WorkerPacket",
    "WorkerCoordinator",
    "GovernedWorkerCoordinator",
    "PredictionRecord",
    "CalibrationResult",
    "CalibrationEngine",
    "RecoveredRunView",
    "RunRecovery",
]
