from __future__ import annotations

import asyncio

import pytest
from fastapi import HTTPException

from api import agent_infrastructure as infra


def _assert_blocked(exc: HTTPException, expected_code: str) -> None:
    assert exc.status_code == 403
    assert isinstance(exc.detail, dict)
    assert exc.detail["code"] == expected_code
    assert exc.detail["status"] == "DISABLED_P0_SHADOW_MEMORY_FIREWALL"
    assert exc.detail["architecture"] == "CAPABILITY != AUTHORITY; WRITE != PERSIST"
    assert exc.detail["approvedPersistenceSurfaces"] == ["GITHUB", "NOTION"]


def test_external_memory_write_fails_closed_without_calling_provider(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(infra, "ATLAS_AGENT_CONTROL_TOKEN", "test-control")
    monkeypatch.setattr(infra, "MEM0_API_KEY", "configured-but-forbidden")

    async def forbidden_provider_call(*args, **kwargs):
        raise AssertionError("Mem0 provider must never be called")

    monkeypatch.setattr(infra, "_post", forbidden_provider_call)

    with pytest.raises(HTTPException) as caught:
        asyncio.run(
            infra.memory_write(
                infra.MemoryWriteRequest(text="must not persist"),
                x_atlas_agent_token="test-control",
            )
        )

    _assert_blocked(caught.value, "EXTERNAL_MEMORY_PERSISTENCE_FORBIDDEN")


def test_external_memory_read_fails_closed_without_calling_provider(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(infra, "ATLAS_AGENT_CONTROL_TOKEN", "test-control")
    monkeypatch.setattr(infra, "MEM0_API_KEY", "configured-but-forbidden")

    async def forbidden_provider_call(*args, **kwargs):
        raise AssertionError("Mem0 provider must never be called")

    monkeypatch.setattr(infra, "_post", forbidden_provider_call)

    with pytest.raises(HTTPException) as caught:
        asyncio.run(
            infra.memory_search(
                infra.MemorySearchRequest(query="must not contaminate context"),
                x_atlas_agent_token="test-control",
            )
        )

    _assert_blocked(caught.value, "EXTERNAL_MEMORY_READ_FORBIDDEN")


def test_health_reports_external_memory_disabled(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(infra, "MEM0_API_KEY", "configured-but-forbidden")
    payload = asyncio.run(infra.health())

    assert payload["mem0"] is False
    assert payload["externalMemory"] == "DISABLED_P0_SHADOW_MEMORY_FIREWALL"
    assert payload["decisionAuthority"] is False
