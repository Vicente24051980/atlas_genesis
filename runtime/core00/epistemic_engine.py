from __future__ import annotations

from typing import Any


class EpistemicEngine:
    """Evaluate frozen UO 1.1 RC1 epistemic resolution state.

    This engine classifies the final admissible epistemic state after integrity,
    structural, authentication, and reference checks have already passed.
    It does not promote unverified information into evidence.
    """

    @classmethod
    def evaluate_epistemics(cls, uo_data: dict[str, Any]) -> dict[str, Any]:
        violations: list[dict[str, Any]] = []
        resolution_state = uo_data.get("resolution_state", {})
        reconciliation = uo_data.get("reconciliation", {})

        overall_res = resolution_state.get("overall_resolution", "resolved")
        consistency_state = resolution_state.get("consistency_state", "consistent")
        conflict_type = resolution_state.get("conflict_type")
        requires_context = resolution_state.get("requires_context", False)

        # Precedence is intentional and part of the frozen benchmark contract:
        # 1) explicit reconciliation wins;
        # 2) explicit ambiguity/context requirement remains ambiguity even when
        #    overall resolution is partial;
        # 3) unresolved/conflicted states are conflict;
        # 4) otherwise the payload passes cleanly.
        if consistency_state == "reconciled":
            execution_status = "PASS_RECONCILED"
            violations.append(
                {
                    "code": "EVENT.EPISTEMIC_RECONCILIATION_APPLIED",
                    "severity": "info",
                    "blocking": False,
                    "message": (
                        f"Reconciliation policy '{reconciliation.get('policy')}' "
                        "applied successfully."
                    ),
                    "location": "reconciliation",
                }
            )
        elif requires_context or conflict_type == "ambiguity":
            execution_status = "PASS_AMBIGUOUS"
        elif consistency_state == "conflicted" or overall_res in ("partial", "unresolved"):
            execution_status = "PASS_WITH_CONFLICT"
        else:
            execution_status = "PASS"

        return {
            "engine": "EpistemicEngine",
            "executed": True,
            "passed": True,
            "execution_status": execution_status,
            "violationCount": len(violations),
            "violations": violations,
            "status": "COMPLETED",
        }
