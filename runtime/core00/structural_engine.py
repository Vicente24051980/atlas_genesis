from __future__ import annotations

from typing import Any


class StructuralEngine:
    """Strict UO 1.1 RC1 structural admissibility checks.

    This implementation is intentionally narrow: it validates only constraints
    explicitly materialized in the current runtime workstream and must not be
    interpreted as the complete frozen UO 1.1 RC1 schema until all canonical
    schema constraints and CASE-001..CASE-030 fixtures are present.
    """

    ALLOWED_ROOT_KEYS = {
        "version",
        "input_manifest",
        "history",
        "identity",
        "resolution_state",
        "reconciliation",
        "epistemic_summary",
        "context",
        "assertions",
        "derived_claims",
        "evidence",
        "personal_relevance",
        "freshness",
        "inaction_cost",
        "relations",
        "actions",
        "value",
        "confidence_matrix",
    }

    REQUIRED_ROOT_KEYS = {
        "version",
        "input_manifest",
        "history",
        "identity",
        "resolution_state",
        "assertions",
        "evidence",
    }

    @classmethod
    def validate_uo(cls, uo_data: dict[str, Any]) -> dict[str, Any]:
        violations: list[dict[str, Any]] = []

        if not isinstance(uo_data, dict):
            return {
                "engine": "StructuralEngine",
                "executed": True,
                "passed": False,
                "violationCount": 1,
                "violations": [{
                    "code": "STRUCTURAL.SCHEMA_VALIDATION_FAILED",
                    "severity": "fatal",
                    "blocking": True,
                    "message": "Root payload must be a JSON object.",
                    "location": "root",
                }],
                "status": "FAILED",
            }

        version = uo_data.get("version")
        if version != "1.1":
            violations.append({
                "code": "STRUCTURAL.SCHEMA_VALIDATION_FAILED",
                "severity": "fatal",
                "blocking": True,
                "message": f"Unsupported UO version: {version!r}. Expected '1.1'.",
                "location": "root.version",
            })

        for missing in sorted(cls.REQUIRED_ROOT_KEYS - set(uo_data.keys())):
            violations.append({
                "code": "STRUCTURAL.SCHEMA_VALIDATION_FAILED",
                "severity": "fatal",
                "blocking": True,
                "message": f"Missing required root property: '{missing}'.",
                "location": f"root.{missing}",
            })

        for extra_key in sorted(set(uo_data.keys()) - cls.ALLOWED_ROOT_KEYS):
            violations.append({
                "code": "STRUCTURAL.SCHEMA_VALIDATION_FAILED",
                "severity": "fatal",
                "blocking": True,
                "message": f"Additional property '{extra_key}' is not permitted by contract UO 1.1 RC1.",
                "location": f"root.{extra_key}",
            })

        assertions = uo_data.get("assertions", [])
        if not isinstance(assertions, list):
            violations.append({
                "code": "STRUCTURAL.SCHEMA_VALIDATION_FAILED",
                "severity": "fatal",
                "blocking": True,
                "message": "'assertions' must be an array.",
                "location": "root.assertions",
            })
        else:
            for idx, assertion in enumerate(assertions):
                if not isinstance(assertion, dict):
                    violations.append({
                        "code": "STRUCTURAL.SCHEMA_VALIDATION_FAILED",
                        "severity": "fatal",
                        "blocking": True,
                        "message": "Assertion entry must be an object.",
                        "location": f"assertions[{idx}]",
                    })
                    continue

                confidence = assertion.get("confidence", {})
                if isinstance(confidence, dict):
                    for field in ("source_fidelity", "evidential_support", "composite_confidence"):
                        value = confidence.get(field)
                        if value is not None and (
                            not isinstance(value, (int, float)) or isinstance(value, bool) or value < 0.0 or value > 1.0
                        ):
                            violations.append({
                                "code": "STRUCTURAL.SCHEMA_VALIDATION_FAILED",
                                "severity": "fatal",
                                "blocking": True,
                                "message": f"Value {value!r} for 'assertions[{idx}].confidence.{field}' must be within [0.0, 1.0].",
                                "location": f"assertions[{idx}].confidence.{field}",
                            })

        passed = not violations
        return {
            "engine": "StructuralEngine",
            "executed": True,
            "passed": passed,
            "violationCount": len(violations),
            "violations": violations,
            "status": "COMPLETED" if passed else "FAILED",
        }
