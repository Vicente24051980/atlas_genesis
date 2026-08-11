from api.bottom_score import EXAMPLES, BottomComponents, BottomScoreRequest, calculate_bottom_score


def test_dormant_gate_blocks_bottom_event() -> None:
    result = calculate_bottom_score(EXAMPLES["near_ath_dormant"])
    assert result.drawdownGate == "DORMANT_NO_BOTTOM_EVENT"
    assert result.state == "DORMANT"
    assert result.action == "NONE"


def test_false_bottom_stays_watch() -> None:
    result = calculate_bottom_score(EXAMPLES["false_bottom"])
    assert result.drawdownGate == "CORRECTION_MODE"
    assert 40 <= result.score < 60
    assert result.state == "WATCH"


def test_tactical_and_confirmed_examples() -> None:
    tactical = calculate_bottom_score(EXAMPLES["tactical_bottom"])
    confirmed = calculate_bottom_score(EXAMPLES["confirmed_bottom"])
    assert 60 <= tactical.score < 75
    assert tactical.state == "TACTICAL_BOTTOM"
    assert confirmed.score >= 75
    assert confirmed.state == "CONFIRMED_BOTTOM"


def test_missing_data_never_silently_becomes_signal() -> None:
    payload = BottomScoreRequest(
        label="partial coverage",
        drawdown_pct=-25,
        components=BottomComponents(
            capitulation=95,
            divergences=95,
        ),
    )
    result = calculate_bottom_score(payload)
    assert result.coveragePct == 40.0
    assert result.state == "INSUFFICIENT_COVERAGE"
    assert result.action == "COLLECT_MISSING_DATA"
