from __future__ import annotations

import uuid

import pytest
from fastapi import HTTPException

import api.agent_infrastructure as agent_infrastructure
from api.agentic_governance import (
    CapabilityCheckRequest,
    CapabilityRecordRequest,
    RoutePayload,
    SyncReceiptRequest,
    check_capability,
    get_sync_receipt,
    record_capability_evidence,
    record_sync_receipt,
)
from runtime.agentic_omega import CapabilitySource, CapabilityStatus


def _token() -> str:
    agent_infrastructure.ATLAS_AGENT_CONTROL_TOKEN = "governance-test-token"
    return "governance-test-token"


def _route(model: str = "m") -> RoutePayload:
    return RoutePayload(
        provider="test-provider",
        base_url="https://api.example.test/v1",
        model=model,
        headers={"Authorization": "Bearer SECRET", "x-beta": "large"},
        options={"reasoning": "high"},
    )


def test_capability_write_requires_agent_control_token() -> None:
    _token()
    request = CapabilityRecordRequest(
        route=_route(),
        capability="tool_calling",
        value=True,
        status=CapabilityStatus.CONFIRMED,
        source=CapabilitySource.LOCAL_HEALTH,
    )
    with pytest.raises(HTTPException) as exc:
        record_capability_evidence(request, x_atlas_agent_token="wrong")
    assert exc.value.status_code == 401


def test_capability_record_and_fail_closed_check() -> None:
    token = _token()
    model = f"m-{uuid.uuid4().hex}"
    route = _route(model)
    response = record_capability_evidence(
        CapabilityRecordRequest(
            route=route,
            capability="context_window_tokens",
            value=1_000_000,
            status=CapabilityStatus.CONFIRMED,
            source=CapabilitySource.PROVIDER_METADATA,
            valid_until="2099-01-01T00:00:00+00:00",
        ),
        x_atlas_agent_token=token,
    )
    assert response["record"]["status"] == "confirmed"
    assert "headers" not in response["route"]
    allowed = check_capability(
        CapabilityCheckRequest(
            route=route,
            capability="context_window_tokens",
            mode="at_least",
            threshold=1_000_000,
        )
    )
    assert allowed["allowed"] is True
    unknown = check_capability(
        CapabilityCheckRequest(
            route=_route(model + "-other"),
            capability="context_window_tokens",
            mode="at_least",
            threshold=1_000_000,
        )
    )
    assert unknown["allowed"] is False
    assert unknown["failClosed"] is True


def test_sync_receipt_requires_both_destinations_for_complete() -> None:
    token = _token()
    change_id = f"change-{uuid.uuid4().hex}"
    partial = record_sync_receipt(
        SyncReceiptRequest(change_id=change_id, github_commit_sha="abc123"),
        x_atlas_agent_token=token,
    )
    assert partial["complete"] is False
    assert partial["receipt"]["status"] == "GITHUB_ONLY"
    complete = record_sync_receipt(
        SyncReceiptRequest(
            change_id=change_id,
            github_commit_sha="abc123",
            notion_page_id="notion-page-test",
            github_path="CURRENT_CANON/example.md",
            notion_url="https://notion.test/page",
        ),
        x_atlas_agent_token=token,
    )
    assert complete["complete"] is True
    assert complete["receipt"]["status"] == "COMPLETE"
    latest = get_sync_receipt(change_id)
    assert latest["complete"] is True
