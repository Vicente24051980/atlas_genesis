from datetime import datetime, timedelta, timezone

from fastapi import HTTPException

from api.kronos_adapter import KronosSmallAdapter
from api.kronos_market_forecast import (
    KronosBar,
    KronosMarketForecastRequest,
    validate_kronos_request,
)


def _bars(count: int = 32) -> list[KronosBar]:
    start = datetime(2026, 1, 1, 16, 0, tzinfo=timezone.utc)
    return [
        KronosBar(
            timestamp=(start + timedelta(days=i)).isoformat(),
            open=100.0 + i,
            high=102.0 + i,
            low=99.0 + i,
            close=101.0 + i,
            volume=1_000_000 + i,
        )
        for i in range(count)
    ]


def test_contract_is_signal_only() -> None:
    payload = KronosMarketForecastRequest(symbol="msft", bars=_bars(), horizon_days=20)
    result = validate_kronos_request(payload)
    assert result.symbol == "MSFT"
    assert result.inferenceStatus == "VALIDATED_NOT_EXECUTED"
    assert result.forecast is None
    assert result.authority == "SIGNAL_ONLY_NO_BUY_SELL_AUTHORITY"
    assert result.status == "EXPERIMENTAL_NON_CANONICAL"


def test_duplicate_timestamps_rejected() -> None:
    bars = _bars()
    bars[-1] = bars[0]
    payload = KronosMarketForecastRequest(symbol="NVDA", bars=bars, horizon_days=5)
    try:
        validate_kronos_request(payload)
    except HTTPException as exc:
        assert exc.status_code == 422
    else:
        raise AssertionError("duplicate timestamps must be rejected")


def test_out_of_order_timestamps_rejected_when_pandas_available() -> None:
    try:
        import pandas  # noqa: F401
    except ImportError:
        return
    bars = _bars()
    bars[-1], bars[-2] = bars[-2], bars[-1]
    payload = KronosMarketForecastRequest(symbol="TSM", bars=bars, horizon_days=5)
    try:
        validate_kronos_request(payload)
    except HTTPException as exc:
        assert exc.status_code == 422
    else:
        raise AssertionError("out-of-order timestamps must be rejected")


def test_invalid_ohlc_rejected() -> None:
    try:
        KronosBar(
            timestamp="2026-01-01",
            open=100,
            high=99,
            low=98,
            close=101,
        )
    except ValueError:
        pass
    else:
        raise AssertionError("invalid OHLC must be rejected")


def test_adapter_is_disabled_by_default(monkeypatch) -> None:
    monkeypatch.delenv("ATLAS_KRONOS_ENABLED", raising=False)
    local_adapter = KronosSmallAdapter()
    status = local_adapter.status()
    assert status.enabled is False
    assert status.model_loaded is False
