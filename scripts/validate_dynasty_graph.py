#!/usr/bin/env python3
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ENTITIES = ROOT / "data" / "dynasty" / "entities.jsonl"
RELATIONS = ROOT / "data" / "dynasty" / "relations.jsonl"

ALLOWED_GRADES = {"A1", "A2", "B1", "B2", "C", "X"}
ALLOWED_STATUS = {"accepted", "provisional", "disputed", "rejected", "unresolved"}
GENEALOGICAL = {"parent_of", "child_of", "sibling_of", "spouse_of", "grandparent_of", "maternal_line_of", "paternal_line_of", "adopted_by"}
CONTROL = {"owns", "controls", "holds_stake_in", "subsidiary_of", "parent_company_of"}


def read_jsonl(path: Path):
    rows = []
    for n, raw in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
        if not raw.strip():
            continue
        try:
            rows.append((n, json.loads(raw)))
        except json.JSONDecodeError as exc:
            raise SystemExit(f"{path}:{n}: invalid JSON: {exc}")
    return rows


def fail(errors, message):
    errors.append(message)


def main() -> int:
    errors = []
    entity_rows = read_jsonl(ENTITIES)
    relation_rows = read_jsonl(RELATIONS)

    ids = {}
    for line, row in entity_rows:
        eid = row.get("id")
        if not eid:
            fail(errors, f"entities:{line}: missing id")
            continue
        if eid in ids:
            fail(errors, f"entities:{line}: duplicate id {eid}")
        ids[eid] = row
        if row.get("record_type") != "entity":
            fail(errors, f"entities:{line}: record_type must be entity")
        if row.get("status") not in ALLOWED_STATUS:
            fail(errors, f"entities:{line}: invalid status {row.get('status')}")

    relation_ids = set()
    for line, row in relation_rows:
        rid = row.get("id")
        if not rid:
            fail(errors, f"relations:{line}: missing id")
            continue
        if rid in relation_ids:
            fail(errors, f"relations:{line}: duplicate relation id {rid}")
        relation_ids.add(rid)

        s = row.get("source_id")
        t = row.get("target_id")
        if s not in ids:
            fail(errors, f"relations:{line}: unknown source_id {s}")
        if t not in ids:
            fail(errors, f"relations:{line}: unknown target_id {t}")
        if row.get("evidence_grade") not in ALLOWED_GRADES:
            fail(errors, f"relations:{line}: invalid evidence grade {row.get('evidence_grade')}")
        if row.get("status") not in ALLOWED_STATUS:
            fail(errors, f"relations:{line}: invalid status {row.get('status')}")
        confidence = row.get("confidence")
        if not isinstance(confidence, (int, float)) or not 0 <= confidence <= 1:
            fail(errors, f"relations:{line}: confidence must be 0..1")
        if not row.get("source_ids"):
            fail(errors, f"relations:{line}: source_ids cannot be empty")

        # Hard anti-hallucination gates.
        relation_type = row.get("relation_type")
        grade = row.get("evidence_grade")
        basis = row.get("relation_basis")
        if relation_type in GENEALOGICAL and basis == "membership_only":
            fail(errors, f"relations:{line}: membership_only cannot create genealogical edge")
        if relation_type in CONTROL and basis in {"membership_only", "later_tradition"}:
            fail(errors, f"relations:{line}: weak basis cannot establish economic control")
        if relation_type == "same_as" and grade in {"B2", "C", "X"}:
            fail(errors, f"relations:{line}: low-grade identity must use possible_same_as, not same_as")
        if grade == "C" and relation_type in GENEALOGICAL | CONTROL:
            fail(errors, f"relations:{line}: grade C cannot assert genealogy or control")
        if grade == "X" and row.get("status") != "rejected":
            fail(errors, f"relations:{line}: grade X must be rejected")

    if errors:
        print("ATLAS Dynasty Graph Ω validation: FAILED")
        for e in errors:
            print(f"- {e}")
        return 1

    print(f"ATLAS Dynasty Graph Ω validation: OK — {len(entity_rows)} entities, {len(relation_rows)} relations")
    return 0


if __name__ == "__main__":
    sys.exit(main())
