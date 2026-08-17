from __future__ import annotations

import uuid
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from typing import Any

from .orchestrator import AppendOnlyEventLedger


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


@dataclass(frozen=True)
class PredictionRecord:
    prediction_id: str
    run_id: str
    metric: str
    predicted_value: float
    horizon_days: int
    created_at: str
    baseline_value: float | None = None


@dataclass(frozen=True)
class CalibrationResult:
    prediction_id: str
    run_id: str
    metric: str
    predicted_value: float
    realized_value: float
    error: float
    absolute_error: float
    absolute_percentage_error: float | None
    directional_hit: bool | None
    settled_at: str

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


class CalibrationEngine:
    def __init__(self, ledger: AppendOnlyEventLedger) -> None:
        self.ledger = ledger

    def record_prediction(
        self,
        *,
        run_id: str,
        metric: str,
        predicted_value: float,
        horizon_days: int,
        baseline_value: float | None = None,
    ) -> PredictionRecord:
        if not run_id.strip() or not metric.strip():
            raise ValueError("run_id and metric are required")
        if horizon_days <= 0:
            raise ValueError("horizon_days must be positive")
        record = PredictionRecord(
            prediction_id=uuid.uuid4().hex,
            run_id=run_id.strip(),
            metric=metric.strip(),
            predicted_value=float(predicted_value),
            horizon_days=int(horizon_days),
            created_at=_utc_now(),
            baseline_value=None if baseline_value is None else float(baseline_value),
        )
        self.ledger.append("PREDICTION_RECORDED", asdict(record))
        return record

    def _prediction(self, prediction_id: str) -> dict[str, Any]:
        for event in reversed(self.ledger.events):
            if event.get("event_type") == "PREDICTION_RECORDED" and event.get("payload", {}).get("prediction_id") == prediction_id:
                return event["payload"]
        raise KeyError(f"prediction not found: {prediction_id}")

    def settle(self, *, prediction_id: str, realized_value: float) -> CalibrationResult:
        for event in self.ledger.events:
            if event.get("event_type") == "PREDICTION_SETTLED" and event.get("payload", {}).get("prediction_id") == prediction_id:
                raise ValueError("prediction has already been settled")
        prediction = self._prediction(prediction_id)
        predicted = float(prediction["predicted_value"])
        realized = float(realized_value)
        error = realized - predicted
        absolute_error = abs(error)
        ape = None if realized == 0 else absolute_error / abs(realized)
        baseline = prediction.get("baseline_value")
        directional_hit = None
        if baseline is not None:
            predicted_direction = predicted - float(baseline)
            realized_direction = realized - float(baseline)
            directional_hit = (predicted_direction == 0 and realized_direction == 0) or (predicted_direction * realized_direction > 0)
        result = CalibrationResult(
            prediction_id=prediction_id,
            run_id=str(prediction["run_id"]),
            metric=str(prediction["metric"]),
            predicted_value=predicted,
            realized_value=realized,
            error=error,
            absolute_error=absolute_error,
            absolute_percentage_error=ape,
            directional_hit=directional_hit,
            settled_at=_utc_now(),
        )
        self.ledger.append("PREDICTION_SETTLED", result.to_dict())
        return result

    def summary(self, metric: str | None = None) -> dict[str, Any]:
        rows = [
            event["payload"]
            for event in self.ledger.events
            if event.get("event_type") == "PREDICTION_SETTLED"
            and (metric is None or event.get("payload", {}).get("metric") == metric)
        ]
        if not rows:
            return {"metric": metric, "count": 0, "mae": None, "mape": None, "directionalAccuracy": None}
        maes = [float(row["absolute_error"]) for row in rows]
        apes = [float(row["absolute_percentage_error"]) for row in rows if row.get("absolute_percentage_error") is not None]
        directions = [bool(row["directional_hit"]) for row in rows if row.get("directional_hit") is not None]
        return {
            "metric": metric,
            "count": len(rows),
            "mae": sum(maes) / len(maes),
            "mape": (sum(apes) / len(apes)) if apes else None,
            "directionalAccuracy": (sum(1 for hit in directions if hit) / len(directions)) if directions else None,
        }
