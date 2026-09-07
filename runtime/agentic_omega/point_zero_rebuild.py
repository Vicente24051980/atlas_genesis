from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

from .security_snapshot import SecuritySnapshot, pit_value, validate_snapshot
from .universe_competition import UniverseCandidate, full_universe_competition


@dataclass(frozen=True)
class PointZeroRebuildResult:
    status: str
    as_of_timestamp: str
    ranked_rows: tuple[dict, ...]
    rejected: tuple[dict, ...]
    snapshot_count: int
    accepted_snapshot_count: int
    pit_safe: bool


_REQUIRED_BINDINGS = {
    "fundamental_quality": ("fundamentals", "fundamental_quality_score"),
    "expected_return": ("estimates", "expected_return_score"),
    "market_validation": ("volatility", "market_validation_score"),
    "regime_compatibility": ("estimates", "regime_compatibility_score"),
    "normalized_economics": ("fundamentals", "normalized_economics_score"),
    "evidence_completeness": ("fundamentals", "evidence_completeness_score"),
    "normalized_expected_cagr": ("estimates", "normalized_expected_cagr_pct"),
    "valuation_confidence": ("valuation", "valuation_confidence_pct"),
    "market_data_age_hours": ("volatility", "market_data_age_hours"),
}


def _block(snapshot: SecuritySnapshot, name: str):
    return getattr(snapshot, name)


def _candidate_from_snapshot(snapshot: SecuritySnapshot, as_of_timestamp: str) -> tuple[UniverseCandidate | None, tuple[str, ...]]:
    values: dict[str, float] = {}
    missing: list[str] = []
    for target, (block_name, key) in _REQUIRED_BINDINGS.items():
        raw = pit_value(_block(snapshot, block_name), key, as_of_timestamp)
        if raw is None:
            missing.append(f"MISSING_BINDING:{block_name}.{key}")
            continue
        try:
            values[target] = float(raw)
        except (TypeError, ValueError):
            missing.append(f"INVALID_BINDING:{block_name}.{key}")

    if missing:
        return None, tuple(missing)

    candidate = UniverseCandidate(
        ticker=snapshot.identity.ticker_at_time,
        fundamental_quality=values["fundamental_quality"],
        expected_return=values["expected_return"],
        market_validation=values["market_validation"],
        regime_compatibility=values["regime_compatibility"],
        normalized_economics=values["normalized_economics"],
        evidence_completeness=values["evidence_completeness"],
        sector="UNKNOWN",
        normalized_expected_cagr=values["normalized_expected_cagr"],
        valuation_confidence=values["valuation_confidence"],
        market_data_age_hours=values["market_data_age_hours"],
        trading212_available=None,
        event_gate=False,
        structural_falsifier=False,
        incumbent=False,
    )
    return candidate, ()


def run_point_zero_rebuild(
    snapshots: Iterable[SecuritySnapshot],
    *,
    as_of_timestamp: str,
) -> PointZeroRebuildResult:
    """Canonical runtime entrypoint for clean Point-Zero ranking.

    Every security must arrive as a versioned SecuritySnapshot. The function
    fails closed per security on raw provider objects, future publications,
    invalid timestamps, schema mismatch or absent score bindings. It never
    consumes incumbent or broker state for clean selection.
    """
    materialized = tuple(snapshots)
    accepted: list[UniverseCandidate] = []
    rejected: list[dict] = []

    for raw in materialized:
        if not isinstance(raw, SecuritySnapshot):
            rejected.append({
                "ticker": None,
                "security_id": None,
                "reasons": ("RAW_PROVIDER_OBJECT_FORBIDDEN",),
            })
            continue

        snapshot = raw
        ok, reasons = validate_snapshot(snapshot, as_of_timestamp)
        if not ok:
            rejected.append({
                "ticker": snapshot.identity.ticker_at_time,
                "security_id": snapshot.identity.security_id,
                "reasons": reasons,
            })
            continue
        candidate, binding_reasons = _candidate_from_snapshot(snapshot, as_of_timestamp)
        if candidate is None:
            rejected.append({
                "ticker": snapshot.identity.ticker_at_time,
                "security_id": snapshot.identity.security_id,
                "reasons": binding_reasons,
            })
            continue
        accepted.append(candidate)

    rows = tuple(full_universe_competition(accepted))
    status = "SELECTED" if rows else "EVIDENCE_PENDING"
    return PointZeroRebuildResult(
        status=status,
        as_of_timestamp=as_of_timestamp,
        ranked_rows=rows,
        rejected=tuple(rejected),
        snapshot_count=len(materialized),
        accepted_snapshot_count=len(accepted),
        pit_safe=not any(
            "FUTURE_" in reason or "SNAPSHOT_AFTER_AS_OF" in reason
            for item in rejected
            for reason in item["reasons"]
        ),
    )
