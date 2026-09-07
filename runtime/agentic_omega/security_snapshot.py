from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Mapping, Sequence

OMEGA_DATA_CONTRACT_VERSION = "2026-09-07-v1.0.0"


def _parse_ts(value: str) -> datetime:
    if not isinstance(value, str) or not value.strip():
        raise ValueError("INVALID_TIMESTAMP")
    text = value.strip().replace("Z", "+00:00")
    try:
        dt = datetime.fromisoformat(text)
    except ValueError as exc:
        raise ValueError("INVALID_TIMESTAMP") from exc
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


@dataclass(frozen=True)
class PointInTimeValue:
    value: Any
    publication_timestamp: str
    source: str
    confidence: float
    economic_period_start: str | None = None
    economic_period_end: str | None = None

    def available_as_of(self, as_of_timestamp: str) -> bool:
        return _parse_ts(self.publication_timestamp) <= _parse_ts(as_of_timestamp)


@dataclass(frozen=True)
class SecurityIdentity:
    issuer_id: str
    security_id: str
    ticker_at_time: str
    share_class: str | None = None
    exchange: str | None = None
    cusip: str | None = None
    isin: str | None = None


@dataclass(frozen=True)
class CorporateAction:
    type: str
    effective_timestamp: str
    publication_timestamp: str
    source: str


@dataclass(frozen=True)
class SecuritySnapshot:
    schema_version: str
    identity: SecurityIdentity
    timestamp: str
    reporting_currency: str
    security_currency: str
    portfolio_base_currency: str
    source: str
    valuation: Mapping[str, PointInTimeValue] = field(default_factory=dict)
    fundamentals: Mapping[str, PointInTimeValue] = field(default_factory=dict)
    estimates: Mapping[str, PointInTimeValue] = field(default_factory=dict)
    revisions: Mapping[str, Sequence[PointInTimeValue]] = field(default_factory=dict)
    price_history: Sequence[PointInTimeValue] = field(default_factory=tuple)
    volatility: Mapping[str, PointInTimeValue] = field(default_factory=dict)
    balance_sheet: Mapping[str, PointInTimeValue] = field(default_factory=dict)
    share_count: Mapping[str, PointInTimeValue] = field(default_factory=dict)
    sbc: Mapping[str, PointInTimeValue] = field(default_factory=dict)
    corporate_actions: Sequence[CorporateAction] = field(default_factory=tuple)
    confidence: float = 0.0
    missing_fields: Sequence[str] = field(default_factory=tuple)
    last_updated_by_field: Mapping[str, str] = field(default_factory=dict)


def validate_confidence(value: float) -> bool:
    return isinstance(value, (int, float)) and 0.0 <= float(value) <= 1.0


def latest_available(values: Sequence[PointInTimeValue], as_of_timestamp: str) -> PointInTimeValue | None:
    available = [v for v in values if v.available_as_of(as_of_timestamp)]
    if not available:
        return None
    return max(available, key=lambda v: _parse_ts(v.publication_timestamp))


def _iter_values(snapshot: SecuritySnapshot):
    for block in (
        snapshot.valuation,
        snapshot.fundamentals,
        snapshot.estimates,
        snapshot.volatility,
        snapshot.balance_sheet,
        snapshot.share_count,
        snapshot.sbc,
    ):
        yield from block.values()
    for series in snapshot.revisions.values():
        yield from series
    yield from snapshot.price_history


def validate_snapshot(snapshot: SecuritySnapshot, as_of_timestamp: str) -> tuple[bool, tuple[str, ...]]:
    reasons: list[str] = []
    try:
        as_of = _parse_ts(as_of_timestamp)
        snap_ts = _parse_ts(snapshot.timestamp)
    except ValueError as exc:
        return False, (str(exc),)

    if snapshot.schema_version != OMEGA_DATA_CONTRACT_VERSION:
        reasons.append("UNSUPPORTED_SCHEMA_VERSION")
    if snap_ts > as_of:
        reasons.append("SNAPSHOT_AFTER_AS_OF")
    if not validate_confidence(snapshot.confidence):
        reasons.append("INVALID_SNAPSHOT_CONFIDENCE")
    if not snapshot.identity.issuer_id or not snapshot.identity.security_id or not snapshot.identity.ticker_at_time:
        reasons.append("INVALID_SECURITY_IDENTITY")

    for value in _iter_values(snapshot):
        if not validate_confidence(value.confidence):
            reasons.append("INVALID_INPUT_CONFIDENCE")
            break
        try:
            if not value.available_as_of(as_of_timestamp):
                reasons.append("FUTURE_PUBLICATION_PRESENT")
                break
        except ValueError:
            reasons.append("INVALID_PUBLICATION_TIMESTAMP")
            break

    for action in snapshot.corporate_actions:
        try:
            if _parse_ts(action.publication_timestamp) > as_of:
                reasons.append("FUTURE_CORPORATE_ACTION_PRESENT")
                break
        except ValueError:
            reasons.append("INVALID_CORPORATE_ACTION_TIMESTAMP")
            break

    return not reasons, tuple(dict.fromkeys(reasons))


def pit_value(block: Mapping[str, PointInTimeValue], key: str, as_of_timestamp: str) -> Any | None:
    value = block.get(key)
    if value is None or not value.available_as_of(as_of_timestamp):
        return None
    return value.value
