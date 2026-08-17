from __future__ import annotations

import uuid
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from enum import Enum
from typing import Any

from .orchestrator import AppendOnlyEventLedger


class DualPersistenceStatus(str, Enum):
    COMPLETE = "COMPLETE"
    GITHUB_ONLY = "GITHUB_ONLY"
    NOTION_ONLY = "NOTION_ONLY"
    INCOMPLETE = "INCOMPLETE"


@dataclass(frozen=True)
class DualPersistenceReceipt:
    receipt_id: str
    change_id: str
    github_commit_sha: str
    notion_page_id: str
    github_path: str = ""
    notion_url: str = ""
    created_at: str = ""
    status: DualPersistenceStatus = DualPersistenceStatus.INCOMPLETE
    detail: str = ""

    def to_dict(self) -> dict[str, Any]:
        data = asdict(self)
        data["status"] = self.status.value
        return data


class DualPersistenceRegistry:
    """Auditable receipts for the GitHub + Notion synchronization law.

    The registry does not perform connector writes itself and therefore never
    claims persistence from intent alone. COMPLETE requires concrete identifiers
    for both the GitHub commit and the Notion page.
    """

    def __init__(self, ledger: AppendOnlyEventLedger) -> None:
        self.ledger = ledger

    def _refresh_if_supported(self) -> None:
        refresh = getattr(self.ledger, "refresh", None)
        if callable(refresh):
            refresh()

    @staticmethod
    def _status(github_commit_sha: str, notion_page_id: str) -> DualPersistenceStatus:
        github = bool(github_commit_sha.strip())
        notion = bool(notion_page_id.strip())
        if github and notion:
            return DualPersistenceStatus.COMPLETE
        if github:
            return DualPersistenceStatus.GITHUB_ONLY
        if notion:
            return DualPersistenceStatus.NOTION_ONLY
        return DualPersistenceStatus.INCOMPLETE

    def record(
        self,
        *,
        change_id: str,
        github_commit_sha: str = "",
        notion_page_id: str = "",
        github_path: str = "",
        notion_url: str = "",
        detail: str = "",
    ) -> DualPersistenceReceipt:
        change_id = change_id.strip()
        if not change_id:
            raise ValueError("change_id is required")
        receipt = DualPersistenceReceipt(
            receipt_id=uuid.uuid4().hex,
            change_id=change_id,
            github_commit_sha=github_commit_sha.strip(),
            notion_page_id=notion_page_id.strip(),
            github_path=github_path.strip(),
            notion_url=notion_url.strip(),
            created_at=datetime.now(timezone.utc).isoformat(),
            status=self._status(github_commit_sha, notion_page_id),
            detail=detail,
        )
        self.ledger.append("DUAL_PERSISTENCE_RECEIPT", receipt.to_dict())
        return receipt

    def latest(self, change_id: str) -> DualPersistenceReceipt | None:
        self._refresh_if_supported()
        for event in reversed(self.ledger.events):
            if event.get("event_type") != "DUAL_PERSISTENCE_RECEIPT":
                continue
            payload = event.get("payload", {})
            if payload.get("change_id") != change_id:
                continue
            return DualPersistenceReceipt(
                receipt_id=str(payload["receipt_id"]),
                change_id=str(payload["change_id"]),
                github_commit_sha=str(payload.get("github_commit_sha") or ""),
                notion_page_id=str(payload.get("notion_page_id") or ""),
                github_path=str(payload.get("github_path") or ""),
                notion_url=str(payload.get("notion_url") or ""),
                created_at=str(payload.get("created_at") or ""),
                status=DualPersistenceStatus(str(payload["status"])),
                detail=str(payload.get("detail") or ""),
            )
        return None

    def require_complete(self, change_id: str) -> DualPersistenceReceipt:
        receipt = self.latest(change_id)
        if receipt is None:
            raise RuntimeError(f"no dual-persistence receipt for change: {change_id}")
        if receipt.status is not DualPersistenceStatus.COMPLETE:
            raise RuntimeError(
                f"dual persistence incomplete for {change_id}: {receipt.status.value}"
            )
        return receipt
