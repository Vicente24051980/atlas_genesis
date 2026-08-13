from scripts.run_kronos_atlas_universe import _market_symbol, history_to_frame


def test_market_symbol_prefers_explicit_symbol() -> None:
    assert _market_symbol({"ticker": "SU", "symbol": "SU.PA"}) == "SU.PA"
    assert _market_symbol({"ticker": "MSFT"}) == "MSFT"


def test_history_to_frame_normalizes_stooq_rows() -> None:
    rows = [
        {"date": "2026-01-02", "open": 100.0, "high": 102.0, "low": 99.0, "close": 101.0, "volume": 1000},
        {"date": "2026-01-05", "open": 101.0, "high": 103.0, "low": 100.0, "close": 102.0, "volume": 1100},
    ]
    frame = history_to_frame(rows)
    assert list(frame.columns)[:5] == ["timestamp", "open", "high", "low", "close"]
    assert len(frame) == 2
    assert float(frame.iloc[-1]["close"]) == 102.0
