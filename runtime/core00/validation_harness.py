from __future__ import annotations

from dataclasses import dataclass, asdict
from typing import Any

from .hash_engine import HashEngine
from .structural_engine import StructuralEngine


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

    HashEngine and StructuralEngine are physically materialized. The remaining
    three engines remain explicit NOT_IMPLEMENTED steps so runtime status cannot
    be mistaken for a certified 30/30 pass.
    """

    ENGINE_ORDER = (
        "HashEngine",
        "StructuralEngine",
        "AuthenticationEngine",
        "ReferenceEngine",
        "EpistemicEngine",
    )

    @staticmethod
    def _pending_steps(names: tuple[str, ...]) -> list[EngineStepResult]:
        return [
            EngineStepResult(
                engine=name,
                passed=False,
                status="NOT_IMPLEMENTED",
                detail={"reason": "runtime_materialization_pending"},
            )
            for name in names
        ]

    @classmethod
    def validate_uo_payload(
        cls,
        raw_text: str,
        declared_hash: str,
        uo_data: dict[str, Any],
    ) -> HarnessResult:
        hash_result = HashEngine.verify_integrity(raw_text, declared_hash)
        hash_step = EngineStepResult(
            engine="HashEngine",
            passed=hash_result.passed,
            status="PASS" if hash_result.passed else "REJECT",
            detail=hash_result.to_dict(),
        )

        if not hash_result.passed:
            return HarnessResult(
                admitted=False,
                terminal_status="REJECT",
                steps=[hash_step],
            )

        structural_result = StructuralEngine.validate_uo(uo_data)
        structural_step = EngineStepResult(
            engine="StructuralEngine",
            passed=structural_result["passed"],
            status="PASS" if structural_result["passed"] else "REJECT",
            detail=structural_result,
        )

        if not structural_result["passed"]:
            return HarnessResult(
                admitted=False,
                terminal_status="REJECT",
                steps=[hash_step, structural_step],
            )

        pending = cls._pending_steps(cls.ENGINE_ORDER[2:])
        return HarnessResult(
            admitted=False,
            terminal_status="RUNTIME_PENDING",
            steps=[hash_step, structural_step, *pending],
        )

    @classmethod
    def validate_text_payload(cls, raw_text: str, declared_hash: str) -> HarnessResult:
        """Backward-compatible HashEngine-only entrypoint."""
        hash_result = HashEngine.verify_integrity(raw_text, declared_hash)
        first = EngineStepResult(
            engine="HashEngine",
            passed=hash_result.passed,
            status="PASS" if hash_result.passed else "REJECT",
            detail=hash_result.to_dict(),
        )

        if not hash_result.passed:
            return HarnessResult(False, "REJECT", [first])

        return HarnessResult(
            admitted=False,
            terminal_status="RUNTIME_PENDING",
            steps=[first, *cls._pending_steps(cls.ENGINE_ORDER[1:])],
        )
