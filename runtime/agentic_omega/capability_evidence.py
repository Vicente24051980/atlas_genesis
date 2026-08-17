from __future__ import annotations

import hashlib
import json
import uuid
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Mapping

from .orchestrator import AppendOnlyEventLedger


_CREDENTIAL_HEADERS = {
    "authorization",
    "proxy-authorization",
    "api-key",
    "x-api-key",
    "x-goog-api-key",
    "anthropic-api-key",
    "openai-api-key",
}


class CapabilityStatus(str, Enum):
    CONFIRMED = "confirmed"
    ASSERTED = "asserted"
    UNPROBEABLE = "unprobeable"
    FAILED = "failed"


class CapabilitySource(str, Enum):
    PROVIDER_METADATA = "provider_metadata"
    LOCAL_HEALTH = "local_health"
    OWNER_ACK = "owner_ack"
    PROBE = "probe"
    NONE = "none"


@dataclass(frozen=True)
class RouteDescriptor:
    provider: str
    base_url: str = ""
    model: str = ""
    headers: Mapping[str, Any] | None = None
    options: Mapping[str, Any] | None = None

    def fingerprint(self) -> str:
        safe_headers = tuple(
            sorted(
                (str(key).lower(), str(value))
                for key, value in (self.headers or {}).items()
                if str(key).lower() not in _CREDENTIAL_HEADERS
            )
        )
        options = tuple(sorted((str(key), str(value)) for key, value in (self.options or {}).items()))
        payload = json.dumps(
            {
                "provider": self.provider.strip().lower(),
                "base_url": self.base_url.strip().rstrip("/").lower(),
                "model": self.model.strip(),
                "headers": safe_headers,
                "options": options,
            },
            sort_keys=True,
            separators=(",", ":"),
        )
        return hashlib.sha256(payload.encode("utf-8")).hexdigest()[:24]

    def safe_identity(self) -> dict[str, Any]:
        return {
            "provider": self.provider.strip().lower(),
            "baseUrl": self.base_url.strip().rstrip("/"),
            "model": self.model.strip(),
            "routeFingerprint": self.fingerprint(),
        }


@dataclass(frozen=True)
class CapabilityEvidenceRecord:
    evidence_id: str
    route_fingerprint: str
    capability: str
    value: bool | int | float | str | None
    status: CapabilityStatus
    source: CapabilitySource
    observed_at: str
    valid_until: str = ""
    detail: str = ""

    def to_dict(self) -> dict[str, Any]:
        data = asdict(self)
        data["status"] = self.status.value
        data["source"] = self.source.value
        return data


class CapabilityEvidenceRegistry:
    """Sourced route capability registry with fail-closed authorization checks."""

    def __init__(self, ledger: AppendOnlyEventLedger) -> None:
        self.ledger = ledger

    @staticmethod
    def _utc_now() -> str:
        return datetime.now(timezone.utc).isoformat()

    @staticmethod
    def _parse_datetime(value: str) -> datetime | None:
        if not value:
            return None
        try:
            parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError:
            return None
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed.astimezone(timezone.utc)

    def _refresh_if_supported(self) -> None:
        refresh = getattr(self.ledger, "refresh", None)
        if callable(refresh):
            refresh()

    @staticmethod
    def _validate_source(status: CapabilityStatus, source: CapabilitySource) -> None:
        if status is CapabilityStatus.CONFIRMED and source not in {
            CapabilitySource.PROVIDER_METADATA,
            CapabilitySource.LOCAL_HEALTH,
            CapabilitySource.PROBE,
        }:
            raise ValueError("confirmed capability evidence requires provider/local/probe source")
        if status is CapabilityStatus.ASSERTED and source is not CapabilitySource.OWNER_ACK:
            raise ValueError("asserted capability evidence requires owner_ack source")

    def record(
        self,
        *,
        route: RouteDescriptor,
        capability: str,
        value: bool | int | float | str | None,
        status: CapabilityStatus,
        source: CapabilitySource,
        observed_at: str | None = None,
        valid_until: str = "",
        detail: str = "",
    ) -> CapabilityEvidenceRecord:
        capability = capability.strip()
        if not capability:
            raise ValueError("capability is required")
        self._validate_source(status, source)
        record = CapabilityEvidenceRecord(
            evidence_id=uuid.uuid4().hex,
            route_fingerprint=route.fingerprint(),
            capability=capability,
            value=value,
            status=status,
            source=source,
            observed_at=observed_at or self._utc_now(),
            valid_until=valid_until,
            detail=detail,
        )
        self.ledger.append(
            "CAPABILITY_EVIDENCE_RECORDED",
            {**record.to_dict(), "route": route.safe_identity()},
        )
        return record

    def latest(self, *, route: RouteDescriptor, capability: str) -> CapabilityEvidenceRecord | None:
        self._refresh_if_supported()
        fingerprint = route.fingerprint()
        for event in reversed(self.ledger.events):
            if event.get("event_type") != "CAPABILITY_EVIDENCE_RECORDED":
                continue
            payload = event.get("payload", {})
            if payload.get("route_fingerprint") != fingerprint or payload.get("capability") != capability:
                continue
            return CapabilityEvidenceRecord(
                evidence_id=str(payload["evidence_id"]),
                route_fingerprint=str(payload["route_fingerprint"]),
                capability=str(payload["capability"]),
                value=payload.get("value"),
                status=CapabilityStatus(str(payload["status"])),
                source=CapabilitySource(str(payload["source"])),
                observed_at=str(payload["observed_at"]),
                valid_until=str(payload.get("valid_until") or ""),
                detail=str(payload.get("detail") or ""),
            )
        return None

    def is_trusted(self, record: CapabilityEvidenceRecord | None, *, require_fresh: bool = True) -> bool:
        if record is None or record.status not in {CapabilityStatus.CONFIRMED, CapabilityStatus.ASSERTED}:
            return False
        if require_fresh and record.valid_until:
            valid_until = self._parse_datetime(record.valid_until)
            if valid_until is None or valid_until < datetime.now(timezone.utc):
                return False
        return True

    def boolean_allows(self, *, route: RouteDescriptor, capability: str, require_fresh: bool = True) -> bool:
        record = self.latest(route=route, capability=capability)
        return self.is_trusted(record, require_fresh=require_fresh) and record.value is True

    def at_least(
        self,
        *,
        route: RouteDescriptor,
        capability: str,
        threshold: float,
        require_fresh: bool = True,
    ) -> bool:
        record = self.latest(route=route, capability=capability)
        if not self.is_trusted(record, require_fresh=require_fresh):
            return False
        if isinstance(record.value, bool) or not isinstance(record.value, (int, float)):
            return False
        return float(record.value) >= float(threshold)
