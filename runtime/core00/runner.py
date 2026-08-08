from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from runtime.core00.validation_harness import Core00Harness


TERMINAL_FAILURE_STATUSES = {"REJECT", "QUARANTINED", "INVALID"}


class Core00HarnessRunner:
    """Physical runner for frozen CORE-00 fixtures.

    A case may match its currently executable expected path without implying
    full CORE-00 certification. `certified` is true only when the expected
    terminal state is reached without any NOT_IMPLEMENTED step that should
    have executed before that terminal state.
    """

    def __init__(self, cases_dir: str | Path):
        self.cases_dir = Path(cases_dir)
        self.results: list[dict[str, Any]] = []

    def run_case(self, case_path: Path) -> dict[str, Any]:
        case_id = case_path.name
        required = {
            "input": case_path / "input.txt",
            "uo": case_path / "uo.json",
            "expected": case_path / "expected-report.json",
        }
        missing = [name for name, path in required.items() if not path.exists()]
        if missing:
            return {
                "case_id": case_id,
                "fixture_status": "MISSING_FIXTURES",
                "missing": missing,
                "expected_match": False,
                "certified": False,
            }

        raw_text = required["input"].read_text(encoding="utf-8")
        uo_data = json.loads(required["uo"].read_text(encoding="utf-8"))
        expected = json.loads(required["expected"].read_text(encoding="utf-8"))

        declared_hash = uo_data.get("input_manifest", {}).get("raw_hash", "")
        result = Core00Harness.validate_uo_payload(raw_text, declared_hash, uo_data)
        actual = result.to_dict()

        executed = [step["engine"] for step in actual["steps"] if step["status"] != "NOT_IMPLEMENTED"]
        pending = [step["engine"] for step in actual["steps"] if step["status"] == "NOT_IMPLEMENTED"]

        terminal_engine = None
        if actual["terminal_status"] in TERMINAL_FAILURE_STATUSES and actual["steps"]:
            terminal_engine = actual["steps"][-1]["engine"]

        expected_terminal = expected.get("terminal_status")
        expected_terminal_engine = expected.get("rejected_by")
        expected_violation = expected.get("violation_code")

        actual_violation = None
        if actual["steps"]:
            violations = actual["steps"][-1].get("detail", {}).get("violations", [])
            if violations:
                actual_violation = violations[0].get("code")

        expected_match = (
            actual["terminal_status"] == expected_terminal
            and terminal_engine == expected_terminal_engine
            and (expected_violation is None or actual_violation == expected_violation)
        )

        certified = expected_match and (
            actual["terminal_status"] in TERMINAL_FAILURE_STATUSES or not pending
        )

        return {
            "case_id": case_id,
            "fixture_status": "PRESENT",
            "terminal_status": actual["terminal_status"],
            "executed_engines": executed,
            "pending_engines": pending,
            "rejected_by": terminal_engine,
            "violation_code": actual_violation,
            "expected_match": expected_match,
            "certified": certified,
            "steps": actual["steps"],
        }

    def run_all(self) -> list[dict[str, Any]]:
        case_folders = sorted(path for path in self.cases_dir.glob("CASE-*") if path.is_dir())
        self.results = [self.run_case(folder) for folder in case_folders]
        return self.results

    def generate_status_md(self, output_filepath: str | Path) -> None:
        output_path = Path(output_filepath)
        materialized = len(self.results)
        certified = sum(1 for result in self.results if result.get("certified"))
        full_suite_present = materialized == 30
        full_suite_certified = full_suite_present and certified == 30

        status = "30/30 RUNTIME CERTIFIED" if full_suite_certified else "RUNTIME INITIALIZATION / NOT CERTIFIED"
        lines = [
            "# CORE00_STATUS.md — AUTOMATED RUNTIME REPORT",
            "",
            f"**Execution Status:** {status}",
            "**Contract Version:** UO 1.1 RC1",
            f"**Fixtures materialized:** {materialized}/30",
            f"**Cases certified on executable path:** {certified}/{materialized}",
            "",
            "> No 30/30 runtime claim is valid until all canonical fixtures are present and the complete frozen engine path is executable.",
            "",
            "| Case ID | Terminal | Executed | Pending | Expected Match | Certified |",
            "| :--- | :--- | :--- | :--- | :---: | :---: |",
        ]

        for result in self.results:
            executed = ", ".join(result.get("executed_engines", [])) or "—"
            pending = ", ".join(result.get("pending_engines", [])) or "—"
            lines.append(
                f"| {result['case_id']} | {result.get('terminal_status', result.get('fixture_status', 'N/A'))} "
                f"| {executed} | {pending} | {'YES' if result.get('expected_match') else 'NO'} "
                f"| {'YES' if result.get('certified') else 'NO'} |"
            )

        output_path.write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    root = Path(__file__).resolve().parent
    runner = Core00HarnessRunner(root / "cases")
    runner.run_all()
    runner.generate_status_md(root / "CORE00_STATUS.md")
    print("CORE-00 harness execution complete; status report updated.")
