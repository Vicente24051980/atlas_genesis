#!/usr/bin/env python3
"""Fail-closed repository integrity checks for ATLAS P0 governance.

The audit is dependency-free and distinguishes a textual reference to CURRENT_CANON
from executable code that appears to write to a CURRENT_CANON path.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
E5 = ROOT / "src/atlas/algorithm/e5-control-policy-omega.ts"
LEDGER = ROOT / "src/atlas/algorithm/atlas-factor-ownership-ledger-omega.ts"
EXECUTABLE_SUFFIXES = {".py", ".ts", ".tsx", ".js", ".mjs", ".cjs", ".sh"}

REQUIRED_SHUTDOWN = [
    "MAIN_PROCESS_STOPPED",
    "SUBAGENTS_STOPPED",
    "SCHEDULED_JOBS_STOPPED",
    "RETRY_QUEUES_STOPPED",
    "TEMP_CREDENTIALS_REVOKED",
    "PENDING_ACTIONS_CANCELLED_OR_ORPHANED_WITH_HUMAN_NOTICE",
    "EXTERNAL_STATE_ACCOUNTED_FOR",
    "RESTART_PATH_DISABLED",
]

EFFECT_PATTERNS = {
    "schedule": re.compile(r"\b(schedule|scheduler|cron|RRULE)\b", re.I),
    "delegate": re.compile(r"\b(delegate|subagent|worker)\b", re.I),
    "communicate": re.compile(r"\b(send|email|slack|notify|communicat)\w*\b", re.I),
    "persist": re.compile(r"\b(persist|write_text|writeFile|create_file|update_file|commit|ledger)\b", re.I),
    "execute": re.compile(r"\b(execute|subprocess|Popen|spawn|exec\()", re.I),
}
WRITE_PATTERN = re.compile(r"\b(write_text|writeFile|writeFileSync|create_file|update_file)\b|open\([^\n]{0,180}['\"](?:w|a)[+b]?['\"]", re.I)


def executable_files():
    for base in (ROOT / "src", ROOT / "runtime", ROOT / "api", ROOT / "scripts", ROOT / "tools"):
        if not base.exists():
            continue
        for p in base.rglob("*"):
            if p.is_file() and p.suffix in EXECUTABLE_SUFFIXES:
                yield p


def possible_current_canon_write(text: str) -> bool:
    """Require CURRENT_CANON and write semantics to occur in the same local code window."""
    for match in re.finditer(r"CURRENT_CANON", text):
        start = max(0, match.start() - 300)
        end = min(len(text), match.end() + 300)
        if WRITE_PATTERN.search(text[start:end]):
            return True
    return False


def main() -> int:
    failures: list[str] = []
    warnings: list[str] = []

    e5 = E5.read_text(encoding="utf-8")
    missing_shutdown = [x for x in REQUIRED_SHUTDOWN if x not in e5]
    if missing_shutdown:
        failures.append("missing_shutdown_requirements:" + ",".join(missing_shutdown))
    if "automaticCanonWriteForbidden: true" not in e5 or "MODIFY_CANON: 'DENY'" not in e5:
        failures.append("automatic_canon_write_not_fail_closed")

    ledger = LEDGER.read_text(encoding="utf-8")
    unresolved_factors = re.findall(
        r"factorId:\s*'([^']+)'[\s\S]{0,500}?scoringOwner:\s*'UNRESOLVED_RUNTIME_MAPPING'",
        ledger,
    )
    if unresolved_factors and "scoring_owner_unresolved_fail_closed" not in ledger:
        failures.append("unresolved_factor_mapping_without_fail_closed_guard")
    if unresolved_factors:
        warnings.append("factor_callsite_mapping_unresolved:" + ",".join(sorted(set(unresolved_factors))))

    canon_write_candidates = []
    effect_surface: dict[str, list[str]] = {k: [] for k in EFFECT_PATTERNS}
    for p in executable_files():
        rel = p.relative_to(ROOT).as_posix()
        text = p.read_text(encoding="utf-8", errors="ignore")
        if rel != "tools/assurance/repo_integrity_audit.py" and possible_current_canon_write(text):
            canon_write_candidates.append(rel)
        for label, pattern in EFFECT_PATTERNS.items():
            if pattern.search(text):
                effect_surface[label].append(rel)

    if canon_write_candidates:
        failures.append("possible_automatic_canon_write_surface:" + ",".join(sorted(canon_write_candidates)))

    result = {
        "gate": "ATLAS_P0_REPOSITORY_INTEGRITY",
        "passed": not failures,
        "failures": failures,
        "warnings": warnings,
        "unresolved_factor_mappings": sorted(set(unresolved_factors)),
        "effect_surface_inventory": {k: sorted(v) for k, v in effect_surface.items()},
        "authority": {
            "memory_is_context_not_canon": True,
            "model_outputs_default_to_shadow": True,
            "automatic_canon_write_forbidden": True,
        },
    }
    print(json.dumps(result, indent=2, sort_keys=True))
    return 0 if result["passed"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
