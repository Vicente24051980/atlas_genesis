from __future__ import annotations

from dataclasses import dataclass, asdict
from typing import Any, Dict, List

VALID_KINDS = {"fact", "evidence", "hypothesis", "interpretation"}
VALID_TRUTH = {"established", "supported", "not_established", "false"}
VALID_ATTRIBUTION = {"preserved", "none"}
ROUTES = {
    "fact": "facts",
    "evidence": "evidence",
    "hypothesis": "hypotheses",
    "interpretation": "interpretations",
}


@dataclass(frozen=True)
class HarnessResult:
    status: str
    route: str
    reasons: List[str]
    item: Dict[str, Any]

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


def _reject(item: Dict[str, Any], *reasons: str) -> HarnessResult:
    return HarnessResult("REJECT", "rejected", list(reasons), item)


def validate_and_route(raw: Dict[str, Any]) -> HarnessResult:
    if not isinstance(raw, dict):
        return _reject({}, "input_not_mapping")

    item = dict(raw)
    required = ("id", "text", "kind", "canonical_evidence", "truth_claim", "attribution")
    missing = [field for field in required if field not in item]
    if missing:
        return _reject(item, "missing_fields:" + ",".join(missing))

    if not isinstance(item["id"], str) or not item["id"].strip():
        return _reject(item, "invalid_id")
    if not isinstance(item["text"], str) or not item["text"].strip():
        return _reject(item, "invalid_text")
    if item["kind"] not in VALID_KINDS:
        return _reject(item, "invalid_kind")
    if not isinstance(item["canonical_evidence"], bool):
        return _reject(item, "canonical_evidence_not_boolean")
    if item["truth_claim"] not in VALID_TRUTH:
        return _reject(item, "invalid_truth_claim")
    if item["attribution"] not in VALID_ATTRIBUTION:
        return _reject(item, "invalid_attribution")

    kind = item["kind"]
    canonical = item["canonical_evidence"]
    truth = item["truth_claim"]
    source = item.get("source")
    attributed_to = item.get("attributed_to")

    # Hard anti-promotion guards.
    if kind == "interpretation" and canonical:
        return _reject(item, "interpretation_cannot_be_canonical_evidence")
    if kind == "interpretation" and truth == "established":
        return _reject(item, "interpretation_truth_cannot_be_established")
    if kind == "hypothesis" and canonical:
        return _reject(item, "hypothesis_cannot_be_canonical_evidence")
    if kind == "hypothesis" and truth == "established":
        return _reject(item, "hypothesis_truth_cannot_be_established")

    # Attribution must survive whenever an interpretation names a source/author.
    if kind == "interpretation" and attributed_to and item["attribution"] != "preserved":
        return _reject(item, "interpretation_attribution_must_be_preserved")

    reasons: List[str] = []

    # Provenance gates: well-formed material may continue, but not as canonical evidence.
    if kind in {"fact", "evidence"} and canonical and not source:
        reasons.append("canonical_material_missing_source")
    if kind == "interpretation" and not source:
        reasons.append("interpretation_missing_source")
    if kind == "interpretation" and attributed_to is None:
        reasons.append("interpretation_missing_attributed_to")

    if reasons:
        return HarnessResult("QUARANTINED", ROUTES[kind], reasons, item)

    return HarnessResult("PASS", ROUTES[kind], [], item)


def validate_batch(items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    return [validate_and_route(item).to_dict() for item in items]
