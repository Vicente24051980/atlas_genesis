from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest
from fastapi import HTTPException

from api import trading212_v2 as broker
from api.execution_safety_gate import (
    LiquidityQuoteEvidence,
    evaluate_liquidity_spread_gate,
    require_liquidity_execution,
)


EVALUATED_AT = datetime(2026, 8, 25, 12, 0, 10, tzinfo=timezone.utc)


def quote(
    ticker: str = "ATYM",
    *,
    bid: float = 99.95,
    ask: float = 100.05,
    last: float = 100,
    timestamp: datetime | None = None,
    low_liquidity: bool = False,
) -> LiquidityQuoteEvidence:
    return LiquidityQuoteEvidence(
        ticker=ticker,
        lastTradePrice=last,
        bidPrice=bid,
        askPrice=ask,
        quoteTimestamp=timestamp or EVALUATED_AT - timedelta(seconds=10),
        quoteSource="TEST_REGULATED_FEED",
        venue="TEST",
        lowLiquidityFlag=low_liquidity,
    )


def test_market_gate_is_symmetric_for_buy_and_sell():
    buy = evaluate_liquidity_spread_gate(
        evidence=quote(),
        side="BUY",
        order_type="MARKET",
        evaluated_at=EVALUATED_AT,
    )
    sell = evaluate_liquidity_spread_gate(
        evidence=quote(),
        side="SELL",
        order_type="MARKET",
        evaluated_at=EVALUATED_AT,
    )

    assert buy["decision"] == "PASS"
    assert sell["decision"] == "PASS"
    assert buy["executionAllowed"] is True
    assert sell["executionAllowed"] is True


def test_stale_or_reversed_quote_fails_closed():
    stale = evaluate_liquidity_spread_gate(
        evidence=quote(timestamp=EVALUATED_AT - timedelta(seconds=31)),
        side="BUY",
        order_type="MARKET",
        evaluated_at=EVALUATED_AT,
    )
    reversed_book = evaluate_liquidity_spread_gate(
        evidence=quote(bid=101, ask=100),
        side="BUY",
        order_type="MARKET",
        evaluated_at=EVALUATED_AT,
    )

    assert stale["decision"] == "EVIDENCE_REQUIRED"
    assert reversed_book["decision"] == "EVIDENCE_REQUIRED"


def test_protected_limit_allows_placement_without_claiming_fill():
    result = evaluate_liquidity_spread_gate(
        evidence=quote(bid=91.5, ask=96.45, last=93.95, low_liquidity=True),
        side="BUY",
        order_type="LIMIT",
        proposed_limit_price=94.2,
        evaluated_at=EVALUATED_AT,
    )

    assert result["decision"] == "PASS_LIMIT_PROTECTED"
    assert result["orderPlacementAllowed"] is True
    assert result["immediateExecutionPossible"] is False


def test_order_and_quote_ticker_mismatch_is_blocked():
    with pytest.raises(HTTPException) as exc:
        require_liquidity_execution(
            order_ticker="NVDA",
            quantity=1,
            order_type="MARKET",
            evidence=quote("ATYM", timestamp=datetime.now(timezone.utc)),
        )

    assert exc.value.status_code == 409
    assert "do not match" in exc.value.detail["message"]


@pytest.mark.asyncio
async def test_v2_market_order_passes_gate_receipt_to_order_audit(monkeypatch):
    captured: dict[str, object] = {}

    async def fake_place_order(*args):
        captured["args"] = args
        return {"ok": True, "liquiditySpreadGate": args[-1]}

    monkeypatch.setattr(broker, "_place_order", fake_place_order)
    order = broker.MarketOrderRequest(
        ticker="ATYM",
        quantity=1,
        confirmation="EXECUTE_DEMO",
        clientRequestId="request-liquidity-001",
        liquidity=quote(timestamp=datetime.now(timezone.utc)),
    )

    result = await broker.market_order(order, None)

    assert result["ok"] is True
    assert result["liquiditySpreadGate"]["decision"] == "PASS"
    assert captured["args"][-1]["ticker"] == "ATYM"
