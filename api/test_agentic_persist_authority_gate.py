from __future__ import annotations

from fastapi.testclient import TestClient

from api import agent_infrastructure
from api.app import app


def test_agentic_post_requires_independent_persist_authority(monkeypatch) -> None:
    monkeypatch.setattr(agent_infrastructure, "ATLAS_AGENT_CONTROL_TOKEN", "test-agent-control")
    client = TestClient(app)

    response = client.post(
        "/v1/agentic-omega/v2/governance/capability-check",
        json={
            "route": {"provider": "test-provider"},
            "capability": "tool_calling",
            "mode": "boolean_true",
            "require_fresh": True,
        },
    )

    assert response.status_code == 401
    payload = response.json()
    assert payload["e5Control"]["code"] == "AGENTIC_PERSIST_AUTHORITY_REQUIRED"
    assert payload["e5Control"]["architecture"] == "CAPABILITY != AUTHORITY; WRITE != PERSIST"


def test_agentic_post_reaches_endpoint_with_valid_control_token(monkeypatch) -> None:
    monkeypatch.setattr(agent_infrastructure, "ATLAS_AGENT_CONTROL_TOKEN", "test-agent-control")
    client = TestClient(app)

    response = client.post(
        "/v1/agentic-omega/v2/governance/capability-check",
        headers={"x-atlas-agent-token": "test-agent-control"},
        json={
            "route": {"provider": "test-provider"},
            "capability": "tool_calling",
            "mode": "boolean_true",
            "require_fresh": True,
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["allowed"] is False
    assert payload["failClosed"] is True


def test_agentic_get_observability_does_not_require_persist_authority(monkeypatch) -> None:
    monkeypatch.setattr(agent_infrastructure, "ATLAS_AGENT_CONTROL_TOKEN", "test-agent-control")
    client = TestClient(app)

    response = client.get("/v1/agentic-omega/health")

    assert response.status_code == 200
    assert response.json()["invariants"]["directTradeExecution"] is False


def test_agentic_mutation_fails_closed_when_control_token_not_configured(monkeypatch) -> None:
    monkeypatch.setattr(agent_infrastructure, "ATLAS_AGENT_CONTROL_TOKEN", "")
    client = TestClient(app)

    response = client.post(
        "/v1/agentic-omega/v2/governance/capability-check",
        json={
            "route": {"provider": "test-provider"},
            "capability": "tool_calling",
            "mode": "boolean_true",
            "require_fresh": True,
        },
    )

    assert response.status_code == 503
    assert response.json()["e5Control"]["code"] == "AGENTIC_PERSIST_AUTHORITY_REQUIRED"
