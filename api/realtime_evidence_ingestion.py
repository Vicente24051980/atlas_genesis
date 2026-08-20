"""ATLAS Ω — Real-Time Useful Evidence Ingestion.

Isolated ingestion layer. It does NOT import, mutate, or alter screener code.
Primary-source-first architecture for SEC/IR events and optional licensed providers.
AI is never evidence: every normalized event retains source/provenance.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from hashlib import sha256
from typing import Any, Iterable


class SourceTier(str, Enum):
    PRIMARY = "PRIMARY"       # SEC / issuer IR / regulator
    LICENSED = "LICENSED"     # Finnhub/Polygon/Benzinga/etc.
    SECONDARY = "SECONDARY"   # discovery only; requires corroboration


class EventType(str, Enum):
    EARNINGS = "EARNINGS"
    GUIDANCE = "GUIDANCE"
    MA = "M&A"
    INSIDER = "INSIDER_TRADING"
    DIVIDEND = "DIVIDEND"
    BUYBACK = "BUYBACK"
    CONTRACT = "NEW_CONTRACT"
    REGULATORY = "REGULATORY"
    FILING = "FILING"
    OTHER = "OTHER"


@dataclass(frozen=True)
class EvidenceEvent:
    source: str
    source_tier: SourceTier
    source_url: str
    published_at: datetime
    received_at: datetime
    event_type: EventType
    ticker: str | None
    title: str
    raw_id: str
    facts: dict[str, Any] = field(default_factory=dict)
    accession_number: str | None = None

    @property
    def latency_seconds(self) -> float:
        return max(0.0, (self.received_at - self.published_at).total_seconds())

    @property
    def evidence_id(self) -> str:
        material = f"{self.source}|{self.raw_id}|{self.source_url}|{self.published_at.isoformat()}"
        return sha256(material.encode("utf-8")).hexdigest()


class EvidenceDeduplicator:
    def __init__(self) -> None:
        self._seen: set[str] = set()

    def accept(self, event: EvidenceEvent) -> bool:
        if event.evidence_id in self._seen:
            return False
        self._seen.add(event.evidence_id)
        return True


class RealtimeEvidenceBus:
    """Provider-neutral event bus feeding Evidence Ω and Wave Detection Ω.

    Connectors are intentionally adapters: SEC submissions/RSS, issuer IR RSS,
    SEC stream/WebSocket when configured, and licensed financial APIs.
    """

    def __init__(self) -> None:
        self.dedup = EvidenceDeduplicator()
        self._events: list[EvidenceEvent] = []

    def ingest(self, event: EvidenceEvent) -> bool:
        if not event.source_url or not event.raw_id:
            raise ValueError("Traceable source_url and raw_id are mandatory")
        if not self.dedup.accept(event):
            return False
        self._events.append(event)
        return True

    def ingest_many(self, events: Iterable[EvidenceEvent]) -> int:
        return sum(1 for event in events if self.ingest(event))

    def drain(self) -> list[EvidenceEvent]:
        out, self._events = self._events, []
        return out


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def classify_event(form: str | None, text: str) -> EventType:
    haystack = f"{form or ''} {text}".lower()
    if "earnings" in haystack or "results" in haystack:
        return EventType.EARNINGS
    if "guidance" in haystack or "outlook" in haystack:
        return EventType.GUIDANCE
    if "merger" in haystack or "acquisition" in haystack:
        return EventType.MA
    if form in {"3", "4", "5"} or "insider" in haystack:
        return EventType.INSIDER
    if "dividend" in haystack:
        return EventType.DIVIDEND
    if "repurchase" in haystack or "buyback" in haystack:
        return EventType.BUYBACK
    if "contract" in haystack or "award" in haystack:
        return EventType.CONTRACT
    if "fda" in haystack or "regulatory" in haystack:
        return EventType.REGULATORY
    if form:
        return EventType.FILING
    return EventType.OTHER
