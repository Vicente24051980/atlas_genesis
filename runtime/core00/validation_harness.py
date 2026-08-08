from __future__ import annotations

from dataclasses import dataclass, asdict
from typing import Any

from .hash_engine import HashEngine


@dataclass(frozen=True)
class EngineStepResult:
    engine: str
    passed: bool
    status: str
    detail: dict[str, Any]

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass(frozen=True)
class HarnessResult:
    admitted: bool
    terminal_status: str
    steps: list[EngineStepResult]

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


class Core00Harness:
    """Fail-fast runtime orchestrator for frozen CORE-00 engine order.

    Only HashEngine is physically implemented in this commit. The remaining
    four engines are deliberately represented as NOT_IMPLEMENTED rather than
    simulated, so runtime status cannot be mistaken for a 30/30 pass.
    """

    ENGINE_ORDER = (
        "HashEngine",
        "StructuralEngine",
        "AuthenticationEngine",
        "ReferenceEngine",
        "EpistemicEngine",
    )

    @classmethod
    def validate_text_payload(cls, raw_text: str, declared_hash: str) -> HarnessResult:
        hash_result = HashEngine.verify_integrity(raw_text, declared_hash)
        first = EngineStepResult(
            engine="HashEngine",
            passed=hash_result.passed,
            status="PASS" if hash_result.passed else "REJECT",
            detail=hash_result.to_dict(),
        )

        if not hash_result.passed:
            return HarnessResult(
                admitted=False,
                terminal_status="REJECT",
                steps=[first],
            )

        pending = [
            EngineStepResult(
                engine=name,
                passed=False,
                status="NOT_IMPLEMENTED",
                detail={"reason": "runtime_materialization_pending"},
            )
            for name in cls.ENGINE_ORDER[1:]
        ]

        return HarnessResult(
            admitted=False,
            terminal_status="RUNTIME_PENDING",
            steps=[first, *pending],
        )
