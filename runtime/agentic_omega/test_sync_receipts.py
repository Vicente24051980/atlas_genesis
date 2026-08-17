from __future__ import annotations

import pytest

from runtime.agentic_omega import (
    AppendOnlyEventLedger,
    DualPersistenceRegistry,
    DualPersistenceStatus,
)


def test_sync_receipt_is_not_complete_from_intent_or_one_destination() -> None:
    registry = DualPersistenceRegistry(AppendOnlyEventLedger())
    incomplete = registry.record(change_id="change-1")
    github_only = registry.record(change_id="change-1", github_commit_sha="abc123")
    assert incomplete.status is DualPersistenceStatus.INCOMPLETE
    assert github_only.status is DualPersistenceStatus.GITHUB_ONLY
    with pytest.raises(RuntimeError):
        registry.require_complete("change-1")


def test_sync_receipt_complete_requires_concrete_github_and_notion_ids() -> None:
    registry = DualPersistenceRegistry(AppendOnlyEventLedger())
    receipt = registry.record(
        change_id="change-2",
        github_commit_sha="abc123",
        notion_page_id="notion-page-123",
        github_path="CURRENT_CANON/test.md",
        notion_url="https://notion.test/page",
    )
    assert receipt.status is DualPersistenceStatus.COMPLETE
    assert registry.require_complete("change-2").receipt_id == receipt.receipt_id


def test_latest_receipt_can_upgrade_prior_partial_state() -> None:
    registry = DualPersistenceRegistry(AppendOnlyEventLedger())
    registry.record(change_id="change-3", github_commit_sha="abc123")
    registry.record(
        change_id="change-3",
        github_commit_sha="abc123",
        notion_page_id="notion-page-123",
    )
    latest = registry.latest("change-3")
    assert latest is not None
    assert latest.status is DualPersistenceStatus.COMPLETE
