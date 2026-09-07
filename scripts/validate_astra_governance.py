#!/usr/bin/env python3
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AUTH = ROOT / "governance" / "authority_registry_omega_v0_1.json"
FACT = ROOT / "governance" / "factor_ownership_ledger_omega_v0_1.json"


def fail(msg: str) -> None:
    raise SystemExit(f"ASTRA_GOVERNANCE_FAIL: {msg}")


auth = json.loads(AUTH.read_text(encoding="utf-8"))
fact = json.loads(FACT.read_text(encoding="utf-8"))

if auth.get("fail_closed") is not True:
    fail("authority registry must be fail_closed")

required = {
    "component", "status", "owner", "runtime_authority", "selection_authority",
    "direct_score_weight", "can_write_canon", "activation_gate"
}

for row in auth.get("components", []):
    missing = required - row.keys()
    if missing:
        fail(f"authority row missing fields for {row.get('component')}: {sorted(missing)}")
    status = row["status"]
    if status != "CANONICAL_AUTHORITY":
        if row["runtime_authority"] or row["selection_authority"] or row["can_write_canon"]:
            fail(f"non-canonical component has authority: {row['component']}")
        if row["direct_score_weight"] != 0:
            fail(f"non-canonical component has nonzero direct score weight: {row['component']}")

factors = fact.get("factors", [])
names = [x.get("factor") for x in factors]
if len(names) != len(set(names)):
    fail("duplicate factor keys detected")

for row in factors:
    if not row.get("factor") or not row.get("owner"):
        fail("factor row missing factor or owner")
    if not isinstance(row.get("direct_score_allowed"), bool):
        fail(f"factor direct_score_allowed must be boolean: {row.get('factor')}")

print(f"ASTRA_GOVERNANCE_OK authority_rows={len(auth.get('components', []))} factor_rows={len(factors)}")
