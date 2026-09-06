#!/usr/bin/env python3
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ENTITIES = ROOT / "data" / "dynasty" / "entities.jsonl"
RELATIONS = ROOT / "data" / "dynasty" / "relations.jsonl"
CONTROL_TRANSFERS = ROOT / "data" / "dynasty" / "control_transfers.jsonl"
SOURCE_PROFILES = ROOT / "data" / "dynasty" / "source_profiles.jsonl"

ALLOWED_GRADES = {"A1", "A2", "B1", "B2", "C", "X"}
ALLOWED_STATUS = {"accepted", "provisional", "disputed", "rejected", "unresolved"}
HISTORICAL_ENTITY_TYPES = {"person", "surname", "family", "dynasty", "branch", "institution", "territory", "title", "office", "event", "source"}
CORPORATE_ENTITY_TYPES = {"company", "holding", "corporate_group", "fund", "foundation", "bank", "trust", "vehicle", "security", "filing"}
GENEALOGICAL = {"parent_of", "child_of", "sibling_of", "spouse_of", "grandparent_of", "maternal_line_of", "paternal_line_of", "adopted_by"}
HISTORICAL_CONTROL = {
    "holds_office", "inherits_office", "holds_territory", "controls_territory", "inherits_territory",
    "acquires_territory", "purchases_territory", "transfers_patrimony", "marriage_transfer",
    "political_successor_of", "office_transferred_to", "office_displaced_by", "granted_to", "confiscated_from"
}
ALLOWED_ASSET_TYPES = {"office", "territory", "patrimony", "state_function"}
ALLOWED_MECHANISMS = {
    "marriage_inheritance", "collateral_office_succession", "political_appointment_transfer",
    "office_displacement", "post_defeat_absorption", "purchase", "institutional_conversion_and_external_recognition"
}


def read_jsonl(path: Path):
    rows = []
    if not path.exists():
        return rows
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
    transfer_rows = read_jsonl(CONTROL_TRANSFERS)
    source_profile_rows = read_jsonl(SOURCE_PROFILES)

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
        etype = row.get("entity_type")
        if etype in CORPORATE_ENTITY_TYPES:
            fail(errors, f"entities:{line}: corporate entity type {etype} forbidden in HISTORICAL_GRAPH")
        if etype not in HISTORICAL_ENTITY_TYPES:
            fail(errors, f"entities:{line}: invalid historical entity type {etype}")
        domain = row.get("epistemic_domain", "historical")
        if domain != "historical":
            fail(errors, f"entities:{line}: historical file cannot contain epistemic_domain={domain}")

    relation_ids = set()
    for line, row in relation_rows:
        rid = row.get("id")
        if not rid:
            fail(errors, f"relations:{line}: missing id")
            continue
        if rid in relation_ids:
            fail(errors, f"relations:{line}: duplicate relation id {rid}")
        relation_ids.add(rid)

        domain = row.get("epistemic_domain", "historical")
        if domain != "historical":
            fail(errors, f"relations:{line}: no cross-domain confidence propagation; got {domain}")

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

        relation_type = row.get("relation_type")
        grade = row.get("evidence_grade")
        basis = row.get("relation_basis")

        # Hard anti-hallucination gates.
        if relation_type in GENEALOGICAL and basis == "membership_only":
            fail(errors, f"relations:{line}: membership_only cannot create genealogical edge")
        if relation_type == "same_as" and grade in {"B2", "C", "X"}:
            fail(errors, f"relations:{line}: low-grade identity must use possible_same_as, not same_as")
        if grade == "C" and relation_type in GENEALOGICAL | HISTORICAL_CONTROL:
            fail(errors, f"relations:{line}: grade C cannot assert genealogy/control transfer")
        if grade == "X" and row.get("status") != "rejected":
            fail(errors, f"relations:{line}: grade X must be rejected")
        if relation_type == "historiographically_derived_from" and row.get("status") == "accepted" and basis == "modern_reconstruction":
            fail(errors, f"relations:{line}: modern remote derivation cannot be hard-accepted without decomposed independent support")

    transfer_ids = set()
    for line, row in transfer_rows:
        tid = row.get("id")
        if not tid:
            fail(errors, f"control_transfers:{line}: missing id")
            continue
        if tid in transfer_ids:
            fail(errors, f"control_transfers:{line}: duplicate id {tid}")
        transfer_ids.add(tid)
        if row.get("record_type") != "control_transfer":
            fail(errors, f"control_transfers:{line}: record_type must be control_transfer")
        if row.get("epistemic_domain") != "historical":
            fail(errors, f"control_transfers:{line}: epistemic_domain must be historical")
        if row.get("asset_type") not in ALLOWED_ASSET_TYPES:
            fail(errors, f"control_transfers:{line}: invalid asset_type {row.get('asset_type')}")
        if row.get("mechanism") not in ALLOWED_MECHANISMS:
            fail(errors, f"control_transfers:{line}: invalid mechanism {row.get('mechanism')}")
        if row.get("status") not in ALLOWED_STATUS:
            fail(errors, f"control_transfers:{line}: invalid status {row.get('status')}")
        if not row.get("source_ids"):
            fail(errors, f"control_transfers:{line}: source_ids cannot be empty")
        for endpoint in ("source_house", "target_house"):
            house = row.get(endpoint)
            if house and house not in ids:
                fail(errors, f"control_transfers:{line}: unknown {endpoint} {house}")
        # Control transfer cannot silently assert blood relationship.
        notes = str(row.get("notes", "")).lower()
        if "therefore descended" in notes or "therefore child" in notes:
            fail(errors, f"control_transfers:{line}: control transfer cannot infer genealogy")

    # Source profiles are metadata, not claims. They may not carry a universal truth/confidence score.
    profile_ids = set()
    for line, row in source_profile_rows:
        sid = row.get("source_id")
        if not sid:
            fail(errors, f"source_profiles:{line}: missing source_id")
            continue
        if sid in profile_ids:
            fail(errors, f"source_profiles:{line}: duplicate source_id {sid}")
        profile_ids.add(sid)
        if "confidence" in row:
            fail(errors, f"source_profiles:{line}: source profile cannot use one universal confidence scalar")

    if errors:
        print("DINASTÍA HISTÓRICA Ω validation: FAILED")
        for e in errors:
            print(f"- {e}")
        return 1

    print(
        "DINASTÍA HISTÓRICA Ω validation: OK — "
        f"{len(entity_rows)} entities, {len(relation_rows)} relations, "
        f"{len(transfer_rows)} control transfers, {len(source_profile_rows)} source profiles"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
