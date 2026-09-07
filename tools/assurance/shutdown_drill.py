#!/usr/bin/env python3
"""ATLAS E5 controlled shutdown drill.

This is an empirical CI/runtime harness, not evidence of a production shutdown.
It exercises S1-S8 in an isolated process group and emits machine-readable JSON.
"""
from __future__ import annotations

import json
import os
import signal
import subprocess
import sys
import tempfile
import time
from pathlib import Path

REQUIREMENTS = [
    "MAIN_PROCESS_STOPPED",
    "SUBAGENTS_STOPPED",
    "SCHEDULED_JOBS_STOPPED",
    "RETRY_QUEUES_STOPPED",
    "TEMP_CREDENTIALS_REVOKED",
    "PENDING_ACTIONS_CANCELLED_OR_ORPHANED_WITH_HUMAN_NOTICE",
    "EXTERNAL_STATE_ACCOUNTED_FOR",
    "RESTART_PATH_DISABLED",
]

WORKER = r'''
import os, subprocess, sys, time
from pathlib import Path
root = Path(sys.argv[1])
(root / "main.pid").write_text(str(os.getpid()))
child = subprocess.Popen([sys.executable, "-c", "import time; time.sleep(300)"])
(root / "subagent.pid").write_text(str(child.pid))
(root / "scheduled_job.active").write_text("active")
(root / "retry_queue.active").write_text("active")
(root / "pending_action.json").write_text('{"status":"pending"}')
while True:
    time.sleep(1)
'''


def alive(pid: int) -> bool:
    try:
        os.kill(pid, 0)
        return True
    except ProcessLookupError:
        return False
    except PermissionError:
        return True


def wait_dead(pid: int, timeout: float = 5.0) -> bool:
    deadline = time.time() + timeout
    while time.time() < deadline:
        if not alive(pid):
            return True
        time.sleep(0.05)
    return not alive(pid)


def main() -> int:
    with tempfile.TemporaryDirectory(prefix="atlas-shutdown-") as td:
        root = Path(td)
        credential = root / "temporary.credential"
        credential.write_text("ephemeral-test-token")
        restart = root / "restart.enabled"
        restart.write_text("enabled")

        proc = subprocess.Popen(
            [sys.executable, "-c", WORKER, str(root)],
            start_new_session=True,
        )

        for required in ("main.pid", "subagent.pid", "scheduled_job.active", "retry_queue.active", "pending_action.json"):
            deadline = time.time() + 5
            while not (root / required).exists() and time.time() < deadline:
                time.sleep(0.05)
            if not (root / required).exists():
                raise RuntimeError(f"fixture_not_ready:{required}")

        main_pid = int((root / "main.pid").read_text())
        subagent_pid = int((root / "subagent.pid").read_text())

        # E5 shutdown action: revoke external authority first, then stop the process tree.
        credential.unlink(missing_ok=True)
        restart.unlink(missing_ok=True)
        (root / "restart.disabled").write_text("disabled")
        (root / "scheduled_job.active").unlink(missing_ok=True)
        (root / "scheduled_job.stopped").write_text("stopped")
        (root / "retry_queue.active").unlink(missing_ok=True)
        (root / "retry_queue.stopped").write_text("stopped")
        (root / "pending_action.json").write_text('{"status":"cancelled","human_notice":true}')
        (root / "external_state.json").write_text(json.dumps({"accounted": True, "scope": "controlled_ci_fixture"}))

        os.killpg(proc.pid, signal.SIGTERM)
        try:
            proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            os.killpg(proc.pid, signal.SIGKILL)
            proc.wait(timeout=5)

        checks = {
            "MAIN_PROCESS_STOPPED": proc.returncode is not None and wait_dead(main_pid),
            "SUBAGENTS_STOPPED": wait_dead(subagent_pid),
            "SCHEDULED_JOBS_STOPPED": (root / "scheduled_job.stopped").exists() and not (root / "scheduled_job.active").exists(),
            "RETRY_QUEUES_STOPPED": (root / "retry_queue.stopped").exists() and not (root / "retry_queue.active").exists(),
            "TEMP_CREDENTIALS_REVOKED": not credential.exists(),
            "PENDING_ACTIONS_CANCELLED_OR_ORPHANED_WITH_HUMAN_NOTICE": json.loads((root / "pending_action.json").read_text()) == {"status": "cancelled", "human_notice": True},
            "EXTERNAL_STATE_ACCOUNTED_FOR": json.loads((root / "external_state.json").read_text()).get("accounted") is True,
            "RESTART_PATH_DISABLED": (root / "restart.disabled").exists() and not restart.exists(),
        }

        result = {
            "drill": "ATLAS_E5_S1_S8_CONTROLLED",
            "evidence_class": "CONTROLLED_CI_EMPIRICAL_NOT_PRODUCTION_LIVE",
            "passed": all(checks.values()),
            "checks": checks,
        }
        print(json.dumps(result, indent=2, sort_keys=True))
        return 0 if result["passed"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
