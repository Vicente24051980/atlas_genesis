from __future__ import annotations

import json
from contextlib import contextmanager
from pathlib import Path
from threading import RLock
from typing import Iterator

from .orchestrator import AppendOnlyEventLedger

try:
    import fcntl  # type: ignore
except ImportError:  # pragma: no cover - Windows/local fallback
    fcntl = None


_PROCESS_LOCK = RLock()


class DurableAgenticLedger(AppendOnlyEventLedger):
    """Append-only agentic ledger hardened for multiple process instances.

    The original v1 ledger is hash chained but keeps an in-memory tail. Two
    processes can therefore otherwise append from the same stale tail. This
    subclass serializes file-backed appends with an OS lock where available,
    reloads the ledger under that lock, verifies the chain, and only then
    appends the next event.
    """

    @contextmanager
    def _exclusive(self) -> Iterator[None]:
        if self.path is None:
            with _PROCESS_LOCK:
                yield
            return
        lock_path = Path(str(self.path) + ".lock")
        lock_path.parent.mkdir(parents=True, exist_ok=True)
        with _PROCESS_LOCK:
            with lock_path.open("a+", encoding="utf-8") as handle:
                if fcntl is not None:
                    fcntl.flock(handle.fileno(), fcntl.LOCK_EX)
                try:
                    yield
                finally:
                    if fcntl is not None:
                        fcntl.flock(handle.fileno(), fcntl.LOCK_UN)

    def _reload_verified(self) -> None:
        if self.path is None or not self.path.exists():
            self._events = []
            return
        self._events = [
            json.loads(line)
            for line in self.path.read_text(encoding="utf-8").splitlines()
            if line.strip()
        ]
        super().verify()

    def append(self, event_type: str, payload: dict) -> dict:
        if self.path is None:
            return super().append(event_type, payload)
        with self._exclusive():
            self._reload_verified()
            return super().append(event_type, payload)

    def refresh(self) -> tuple[dict, ...]:
        with self._exclusive():
            self._reload_verified()
            return self.events
