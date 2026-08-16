from __future__ import annotations

import base64

import pytest
from fastapi import HTTPException

from api import trading212_v2 as broker


def test_auth_header_uses_basic_key_pair(monkeypatch):
    monkeypatch.setattr(broker, "TRADING212_API_KEY", "key")
    monkeypatch.setattr(broker, "TRADING212_API_SECRET", "secret")
    expected = base64.b64encode(b"key:secret").decode("ascii")
    assert broker._auth_header() == f"Basic {expected}"


@pytest.mark.asyncio
async def test_status_never_exposes_credentials(monkeypatch):
    monkeypatch.setattr(broker, "TRADING212_API_KEY", "sensitive-key")
    monkeypatch.setattr(broker, "TRADING212_API_SECRET", "sensitive-secret")
    monkeypatch.setattr(broker, "ATLAS_BROKER_CONTROL_TOKEN", "sensitive-control")
    payload = await broker.status()
    assert payload["credentialsConfigured"] is True
    assert payload["controlTokenConfigured"] is True
    assert payload["secretsExposed"] is False
    text = str(payload)
    assert "sensitive-key" not in text
    assert "sensitive-secret" not in text
    assert "sensitive-control" not in text


def test_live_execution_is_locked_by_default(monkeypatch):
    monkeypatch.setattr(broker, "TRADING212_ENV", "live")
    monkeypatch.setattr(broker, "TRADING212_LIVE_TRADING_ENABLED", False)
    with pytest.raises(HTTPException) as exc:
        broker._require_order_permission("EXECUTE_LIVE")
    assert exc.value.status_code == 403


def test_demo_requires_demo_confirmation(monkeypatch):
    monkeypatch.setattr(broker, "TRADING212_ENV", "demo")
    with pytest.raises(HTTPException) as exc:
        broker._require_order_permission("EXECUTE_LIVE")
    assert exc.value.status_code == 400


def test_history_next_page_path_is_restricted_to_t212_history():
    path, params = broker._next_page_request(
        "/api/v0/equity/history/orders?limit=20&cursor=1760346100000"
    )
    assert path == "/equity/history/orders"
    assert params == {"limit": "20", "cursor": "1760346100000"}

    with pytest.raises(HTTPException):
        broker._next_page_request("https://evil.example/api/v0/equity/history/orders?limit=20")

    with pytest.raises(HTTPException):
        broker._next_page_request("/api/v0/equity/account/summary")


def test_duplicate_order_request_id_is_blocked(monkeypatch):
    monkeypatch.setattr(broker, "_ORDER_REQUEST_IDS", {})
    broker._register_order_request_id("request-123456")
    with pytest.raises(HTTPException) as exc:
        broker._register_order_request_id("request-123456")
    assert exc.value.status_code == 409
