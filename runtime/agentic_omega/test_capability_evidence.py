from __future__ import annotations

import pytest

from runtime.agentic_omega import (
    AppendOnlyEventLedger,
    CapabilityEvidenceRegistry,
    CapabilitySource,
    CapabilityStatus,
    RouteDescriptor,
)


def test_route_fingerprint_ignores_credentials_but_tracks_capability_route() -> None:
    first = RouteDescriptor(
        provider="OpenAI",
        base_url="https://api.example.test/v1/",
        model="model-a",
        headers={"Authorization": "Bearer secret-one", "x-beta": "context-1m"},
        options={"reasoning": "high"},
    )
    rotated_key = RouteDescriptor(
        provider="openai",
        base_url="https://api.example.test/v1",
        model="model-a",
        headers={"Authorization": "Bearer secret-two", "x-beta": "context-1m"},
        options={"reasoning": "high"},
    )
    changed_beta = RouteDescriptor(
        provider="openai",
        base_url="https://api.example.test/v1",
        model="model-a",
        headers={"Authorization": "Bearer secret-two", "x-beta": "different"},
        options={"reasoning": "high"},
    )
    changed_model = RouteDescriptor(
        provider="openai",
        base_url="https://api.example.test/v1",
        model="model-b",
        headers={"Authorization": "Bearer secret-two", "x-beta": "context-1m"},
        options={"reasoning": "high"},
    )
    assert first.fingerprint() == rotated_key.fingerprint()
    assert first.fingerprint() != changed_beta.fingerprint()
    assert first.fingerprint() != changed_model.fingerprint()


def test_unknown_or_failed_capability_fails_closed() -> None:
    registry = CapabilityEvidenceRegistry(AppendOnlyEventLedger())
    route = RouteDescriptor(provider="test", model="m")
    assert registry.boolean_allows(route=route, capability="tool_calling") is False
    assert registry.at_least(route=route, capability="context_window_tokens", threshold=1000) is False
    registry.record(
        route=route,
        capability="tool_calling",
        value=True,
        status=CapabilityStatus.FAILED,
        source=CapabilitySource.PROBE,
    )
    assert registry.boolean_allows(route=route, capability="tool_calling") is False


def test_confirmed_numeric_capability_is_route_scoped() -> None:
    ledger = AppendOnlyEventLedger()
    registry = CapabilityEvidenceRegistry(ledger)
    route = RouteDescriptor(provider="test", model="m1", options={"beta": "large"})
    other = RouteDescriptor(provider="test", model="m1", options={"beta": "small"})
    registry.record(
        route=route,
        capability="context_window_tokens",
        value=1_000_000,
        status=CapabilityStatus.CONFIRMED,
        source=CapabilitySource.PROVIDER_METADATA,
        valid_until="2099-01-01T00:00:00+00:00",
    )
    assert registry.at_least(route=route, capability="context_window_tokens", threshold=1_000_000)
    assert registry.at_least(route=other, capability="context_window_tokens", threshold=1_000_000) is False


def test_owner_assertion_requires_owner_ack_source() -> None:
    registry = CapabilityEvidenceRegistry(AppendOnlyEventLedger())
    route = RouteDescriptor(provider="test", model="m")
    with pytest.raises(ValueError):
        registry.record(
            route=route,
            capability="tool_calling",
            value=True,
            status=CapabilityStatus.ASSERTED,
            source=CapabilitySource.PROVIDER_METADATA,
        )
    registry.record(
        route=route,
        capability="tool_calling",
        value=True,
        status=CapabilityStatus.ASSERTED,
        source=CapabilitySource.OWNER_ACK,
        valid_until="2099-01-01T00:00:00+00:00",
    )
    assert registry.boolean_allows(route=route, capability="tool_calling") is True


def test_stale_capability_fails_when_freshness_is_required() -> None:
    registry = CapabilityEvidenceRegistry(AppendOnlyEventLedger())
    route = RouteDescriptor(provider="test", model="m")
    registry.record(
        route=route,
        capability="tool_calling",
        value=True,
        status=CapabilityStatus.CONFIRMED,
        source=CapabilitySource.LOCAL_HEALTH,
        valid_until="2020-01-01T00:00:00+00:00",
    )
    assert registry.boolean_allows(route=route, capability="tool_calling", require_fresh=True) is False
    assert registry.boolean_allows(route=route, capability="tool_calling", require_fresh=False) is True


def test_credential_values_are_not_persisted_in_route_identity() -> None:
    ledger = AppendOnlyEventLedger()
    registry = CapabilityEvidenceRegistry(ledger)
    route = RouteDescriptor(
        provider="test",
        model="m",
        headers={"Authorization": "Bearer DO_NOT_PERSIST", "x-beta": "ok"},
    )
    registry.record(
        route=route,
        capability="tool_calling",
        value=True,
        status=CapabilityStatus.CONFIRMED,
        source=CapabilitySource.LOCAL_HEALTH,
    )
    serialized = str(ledger.events)
    assert "DO_NOT_PERSIST" not in serialized
    assert "routeFingerprint" in serialized
