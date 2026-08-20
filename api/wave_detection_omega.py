"""ATLAS Ω Wave Detection Ω — event-to-actionable-knowledge scoring.

Independent from the screener. Consumes verified EvidenceEvent objects.
A score is decision support, never evidence.
"""
from dataclasses import dataclass
from typing import Sequence
from realtime_evidence_ingestion import EvidenceEvent, SourceTier


@dataclass(frozen=True)
class WaveInputs:
    fundamental: float      # 0..100
    revisions: float        # 0..100
    momentum: float         # 0..100
    material_news: float    # 0..100
    risk: float             # 0..100, higher = more risk
    evidence_quality: float # 0..100


@dataclass(frozen=True)
class WaveResult:
    ticker: str
    score: float
    alert: bool
    evidence_ids: tuple[str, ...]
    reasons: tuple[str, ...]


DEFAULT_ALERT_THRESHOLD = 80.0


def calculate_wave_score(x: WaveInputs) -> float:
    # Fundamentals + revisions + momentum + material event; risk is a penalty.
    raw = (
        0.25 * x.fundamental
        + 0.20 * x.revisions
        + 0.20 * x.momentum
        + 0.25 * x.material_news
        + 0.10 * x.evidence_quality
        - 0.20 * x.risk
    )
    return round(max(0.0, min(100.0, raw)), 2)


def evaluate_wave(
    ticker: str,
    inputs: WaveInputs,
    evidence: Sequence[EvidenceEvent],
    threshold: float = DEFAULT_ALERT_THRESHOLD,
) -> WaveResult:
    traceable = [e for e in evidence if e.ticker in {ticker, None}]
    primary = [e for e in traceable if e.source_tier == SourceTier.PRIMARY]
    score = calculate_wave_score(inputs)

    # Evidence Gate: no alert without traceable evidence and at least one primary source.
    evidence_gate = bool(traceable) and bool(primary)
    alert = evidence_gate and score >= threshold

    reasons = [f"wave_score={score}", f"primary_evidence={len(primary)}"]
    if not evidence_gate:
        reasons.append("EVIDENCE_GATE_FAILED")
    if score < threshold:
        reasons.append("BELOW_ALERT_THRESHOLD")

    return WaveResult(
        ticker=ticker,
        score=score,
        alert=alert,
        evidence_ids=tuple(e.evidence_id for e in traceable),
        reasons=tuple(reasons),
    )
