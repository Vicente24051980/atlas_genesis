from api.kronos_validation import (
    ForecastObservation,
    evaluate_observations,
    expanding_walk_forward_indices,
    momentum_baseline_pct,
    realized_return_pct,
)


def test_walk_forward_has_no_leakage() -> None:
    windows = expanding_walk_forward_indices(200, lookback=64, horizon=20, step=20)
    assert windows
    for start, origin, target in windows:
        assert start <= origin < target
        assert origin - start + 1 == 64
        assert target - origin == 20


def test_realized_return() -> None:
    assert round(realized_return_pct(100.0, 110.0), 4) == 10.0


def test_momentum_baseline() -> None:
    closes = [100.0 + i for i in range(100)]
    value = momentum_baseline_pct(closes, origin=50, horizon=20)
    assert value is not None
    assert value > 0


def test_validation_metrics_compare_against_zero_and_momentum() -> None:
    observations = [
        ForecastObservation("A", "2026-01-01", 20, 5.0, 4.0, 3.0),
        ForecastObservation("B", "2026-01-01", 20, -3.0, -2.0, -1.0),
        ForecastObservation("C", "2026-01-01", 20, 2.0, -1.0, 1.0),
    ]
    metrics = evaluate_observations(observations)[20]
    assert metrics.observations == 3
    assert round(metrics.directional_accuracy, 4) == round(2 / 3, 4)
    assert metrics.mean_absolute_error_pct > 0
    assert metrics.zero_baseline_mae_pct > 0
    assert metrics.momentum_directional_accuracy is not None
