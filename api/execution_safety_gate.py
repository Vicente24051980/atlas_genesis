from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any, Literal

from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter(prefix="/v1/mobile/broker/safety", tags=["execution-safety-gate"])

ExecutionState = Literal[
    "READY",
    "TRADING_HALT",
    "MARKET_CLOSED",
    "CLOSE_ONLY",
    "INSTRUMENT_NOT_TRADABLE",
    "INSUFFICIENT_FUNDS",
    "RATE_LIMIT",
    "AUTH_ERROR",
    "ORDER_REJECTED",
    "API_ERROR",
]

Action = Literal["EXECUTE", "NO_EXECUTE"]
PendingPolicy = Literal["NONE", "KEEP_PENDING", "REVIEW_REQUIRED"]


class SafetyClassificationRequest(BaseModel):
    ticker: str | None = Field(default=None, max_length=64)
    httpStatus: int | None = Field(default=None, ge=100, le=599)
    upstream: Any = None
    orderId: str | int | None = None
    lastPriceBeforeHalt: float | None = None


class SafetyPreflightRequest(BaseModel):
    ticker: str = Field(min_length=1, max_length=64)
    brokerStatus: str | None = Field(default=None, max_length=120)
    instrumentStatus: str | None = Field(default=None, max_length=120)
    exchangeStatus: str | None = Field(default=None, max_length=120)
    closeOnly: bool = False
    tradable: bool | None = None


def _text(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, str):
        return value.lower()
    try:
        return json.dumps(value, ensure_ascii=False, sort_keys=True, default=str).lower()
    except (TypeError, ValueError):
        return str(value).lower()


def _contains(text: str, phrases: tuple[str, ...]) -> bool:
    return any(phrase in text for phrase in phrases)


def _decision(
    state: ExecutionState,
    *,
    reason: str,
    source: str,
    ticker: str | None = None,
    order_id: str | int | None = None,
    last_price_before_halt: float | None = None,
) -> dict[str, Any]:
    now = datetime.now(timezone.utc).isoformat()

    if state == "READY":
        action: Action = "EXECUTE"
        pending_policy: PendingPolicy = "NONE"
        recheck = False
    elif state in {"TRADING_HALT", "MARKET_CLOSED", "RATE_LIMIT"}:
        action = "NO_EXECUTE"
        pending_policy = "KEEP_PENDING"
        recheck = True
    else:
        action = "NO_EXECUTE"
        pending_policy = "REVIEW_REQUIRED"
        recheck = False

    return {
        "gate": "Execution Safety Gate Ω",
        "state": state,
        "action": action,
        "pendingPolicy": pending_policy,
        "recheck": recheck,
        "reason": reason,
        "source": source,
        "detectedAt": now,
        "ticker": ticker,
        "orderId": order_id,
        "lastPriceBeforeHalt": last_price_before_halt,
        "investmentSignalImpact": "NONE",
        "rules": {
            "priceIsNotEvidence": True,
            "executionFailureIsNotInvestmentSignal": True,
            "haltDoesNotInvalidateThesis": True,
            "haltDoesNotTriggerReplacement": True,
        },
    }


def classify_execution_error(
    *,
    http_status: int | None,
    upstream: Any,
    ticker: str | None = None,
    order_id: str | int | None = None,
    last_price_before_halt: float | None = None,
) -> dict[str, Any]:
    text = _text(upstream)

    halt_phrases = (
        "trading halt",
        "trading halted",
        "is halted",
        "security halted",
        "halted security",
        "volatility halt",
        "volatility pause",
        "regulatory halt",
        "news pending halt",
        "limit up-limit down",
        "limit up limit down",
        "luld pause",
    )
    close_only_phrases = ("close only", "close-only", "reduce only", "reduce-only")
    market_closed_phrases = (
        "market closed",
        "market is closed",
        "outside market hours",
        "outside trading hours",
        "trading session is closed",
    )
    insufficient_funds_phrases = (
        "insufficient funds",
        "insufficient cash",
        "not enough funds",
        "not enough cash",
        "insufficient buying power",
    )
    not_tradable_phrases = (
        "instrument not tradable",
        "instrument is not tradable",
        "not available for trading",
        "trading unavailable",
        "instrument unavailable",
        "instrument suspended",
        "security suspended",
    )

    if _contains(text, halt_phrases):
        return _decision(
            "TRADING_HALT",
            reason="Exchange/regulatory/volatility trading halt detected. Preserve the investment decision and retry only after trading resumes.",
            source="broker_error_classifier",
            ticker=ticker,
            order_id=order_id,
            last_price_before_halt=last_price_before_halt,
        )
    if _contains(text, close_only_phrases):
        return _decision("CLOSE_ONLY", reason="Instrument is in close-only/reduce-only mode.", source="broker_error_classifier", ticker=ticker, order_id=order_id)
    if _contains(text, market_closed_phrases):
        return _decision("MARKET_CLOSED", reason="Trading session is closed. Keep the intended order pending for the next valid session.", source="broker_error_classifier", ticker=ticker, order_id=order_id)
    if _contains(text, insufficient_funds_phrases):
        return _decision("INSUFFICIENT_FUNDS", reason="Broker reported insufficient cash or buying power.", source="broker_error_classifier", ticker=ticker, order_id=order_id)
    if _contains(text, not_tradable_phrases):
        return _decision("INSTRUMENT_NOT_TRADABLE", reason="Instrument is unavailable or suspended outside the explicit trading-halt rule.", source="broker_error_classifier", ticker=ticker, order_id=order_id)
    if http_status == 429:
        return _decision("RATE_LIMIT", reason="Trading 212 API rate limit reached. Do not duplicate the order; recheck after reset.", source="http_status", ticker=ticker, order_id=order_id)
    if http_status in {401, 403}:
        return _decision("AUTH_ERROR", reason="Broker authentication/authorization failure requires configuration review.", source="http_status", ticker=ticker, order_id=order_id)
    if http_status is not None and 400 <= http_status < 500:
        return _decision("ORDER_REJECTED", reason="Broker rejected the order for a reason not mapped to a temporary execution state.", source="http_status", ticker=ticker, order_id=order_id)
    return _decision("API_ERROR", reason="Unclassified broker/API execution failure.", source="broker_error_classifier", ticker=ticker, order_id=order_id)


def classify_preflight(
    *,
    ticker: str,
    broker_status: str | None,
    instrument_status: str | None,
    exchange_status: str | None,
    close_only: bool,
    tradable: bool | None,
) -> dict[str, Any]:
    combined = " ".join(value for value in (broker_status, instrument_status, exchange_status) if value)

    if close_only:
        return _decision("CLOSE_ONLY", reason="Preflight metadata marks the instrument close-only.", source="preflight", ticker=ticker)

    classified = classify_execution_error(http_status=None, upstream=combined, ticker=ticker)
    if classified["state"] != "API_ERROR":
        classified["source"] = "preflight"
        return classified

    if tradable is False:
        return _decision("INSTRUMENT_NOT_TRADABLE", reason="Preflight metadata marks the instrument non-tradable.", source="preflight", ticker=ticker)

    return _decision("READY", reason="No blocking execution condition detected by available preflight metadata.", source="preflight", ticker=ticker)


@router.get("/policy")
async def policy() -> dict[str, Any]:
    return {
        "gate": "Execution Safety Gate Ω",
        "version": "1.0.0",
        "chain": "TRADING_HALT -> NO_EXECUTE -> KEEP_PENDING -> RECHECK",
        "temporaryStates": ["TRADING_HALT", "MARKET_CLOSED", "RATE_LIMIT"],
        "reviewStates": ["CLOSE_ONLY", "INSTRUMENT_NOT_TRADABLE", "INSUFFICIENT_FUNDS", "AUTH_ERROR", "ORDER_REJECTED", "API_ERROR"],
        "investmentSignalImpact": "NONE",
        "principle": "Execution availability is operational evidence, not an investment thesis signal.",
    }


@router.post("/classify")
async def classify(payload: SafetyClassificationRequest) -> dict[str, Any]:
    return classify_execution_error(
        http_status=payload.httpStatus,
        upstream=payload.upstream,
        ticker=payload.ticker.strip() if payload.ticker else None,
        order_id=payload.orderId,
        last_price_before_halt=payload.lastPriceBeforeHalt,
    )


@router.post("/preflight")
async def preflight(payload: SafetyPreflightRequest) -> dict[str, Any]:
    return classify_preflight(
        ticker=payload.ticker.strip(),
        broker_status=payload.brokerStatus,
        instrument_status=payload.instrumentStatus,
        exchange_status=payload.exchangeStatus,
        close_only=payload.closeOnly,
        tradable=payload.tradable,
    )
