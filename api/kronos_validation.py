from __future__ import annotations

from dataclasses import dataclass
from math import sqrt
from statistics import mean
from typing import Iterable

SUPPORTED_HORIZONS = (5, 20, 60)


@dataclass(frozen=True)
class ForecastObservation:
    symbol: str
    as_of: str
    horizon_days: int
    predicted_return_pct: float
    actual_return_pct: float
    momentum_return_pct: float | None = None


@dataclass(frozen=True)
class ValidationMetrics:
    horizon_days: int
    observations: int
    directional_accuracy: float
    mean_absolute_error_pct: float
    zero_baseline_mae_pct: float
    momentum_directional_accuracy: float | None
    kronos_mae_improvement_vs_zero_pct: float
    mean_predicted_return_pct: float
    mean_actual_return_pct: float


def _direction(value: float) -> int:
    if value > 0:
        return 1
    if value < 0:
        return -1
    return 0


def evaluate_observations(observations: Iterable[ForecastObservation]) -> dict[int, ValidationMetrics]:
    grouped: dict[int, list[ForecastObservation]] = {h: [] for h in SUPPORTED_HORIZONS}
    for obs in observations:
        if obs.horizon_days not in grouped:
            raise ValueError(f"unsupported horizon: {obs.horizon_days}")
        grouped[obs.horizon_days].append(obs)

    results: dict[int, ValidationMetrics] = {}
    for horizon, rows in grouped.items():
        if not rows:
            continue
        correct = sum(
            1 for row in rows if _direction(row.predicted_return_pct) == _direction(row.actual_return_pct)
        )
        mae = mean(abs(row.predicted_return_pct - row.actual_return_pct) for row in rows)
        zero_mae = mean(abs(row.actual_return_pct) for row in rows)
        momentum_rows = [row for row in rows if row.momentum_return_pct is not None]
        momentum_accuracy = None
        if momentum_rows:
            momentum_correct = sum(
                1
                for row in momentum_rows
                if _direction(float(row.momentum_return_pct)) == _direction(row.actual_return_pct)
            )
            momentum_accuracy = momentum_correct / len(momentum_rows)

        improvement = ((zero_mae - mae) / zero_mae * 100.0) if zero_mae else 0.0
        results[horizon] = ValidationMetrics(
            horizon_days=horizon,
            observations=len(rows),
            directional_accuracy=correct / len(rows),
            mean_absolute_error_pct=mae,
            zero_baseline_mae_pct=zero_mae,
            momentum_directional_accuracy=momentum_accuracy,
            kronos_mae_improvement_vs_zero_pct=improvement,
            mean_predicted_return_pct=mean(row.predicted_return_pct for row in rows),
            mean_actual_return_pct=mean(row.actual_return_pct for row in rows),
        )
    return results


def expanding_walk_forward_indices(
    total_rows: int,
    *,
    lookback: int,
    horizon: int,
    step: int | None = None,
) -> list[tuple[int, int, int]]:
    """Return leakage-safe (history_start, forecast_origin, target_index) tuples.

    forecast_origin is the final observed row included in model context. target_index
    is horizon trading rows later. No future row is ever included in the context.
    """
    if lookback < 32 or lookback > 512:
        raise ValueError("lookback must be between 32 and 512")
    if horizon not in SUPPORTED_HORIZONS:
        raise ValueError(f"unsupported horizon: {horizon}")
    if step is None:
        step = horizon
    if step < 1:
        raise ValueError("step must be >= 1")

    windows: list[tuple[int, int, int]] = []
    origin = lookback - 1
    while origin + horizon < total_rows:
        history_start = origin - lookback + 1
        windows.append((history_start, origin, origin + horizon))
        origin += step
    return windows


def realized_return_pct(origin_close: float, target_close: float) -> float:
    if origin_close == 0:
        raise ValueError("origin_close cannot be zero")
    return (target_close / origin_close - 1.0) * 100.0


def momentum_baseline_pct(closes: list[float], origin: int, horizon: int) -> float | None:
    previous = origin - horizon
    if previous < 0 or closes[previous] == 0:
        return None
    return realized_return_pct(closes[previous], closes[origin])
