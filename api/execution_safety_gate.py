from __future__ import annotations

import json
import math
from datetime import datetime, timezone
from typing import Any, Literal

from fastapi import APIRouter, HTTPException
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
LiquidityDecision = Literal[
    "PASS",
    "PASS_LIMIT_PROTECTED",
    "LIMIT_ONLY",
    "WAIT_SPREAD",
    "EVIDENCE_REQUIRED",
]

MAX_QUOTED_SPREAD_PCT = 1.0
MAX_REFERENCE_PREMIUM_PCT = 0.75
SEVERE_QUOTED_SPREAD_PCT = 2.0
MAX_QUOTE_AGE_SECONDS = 30.0


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


class LiquidityQuoteEvidence(BaseModel):
    ticker: str = Field(min_length=1, max_length=64)
    lastTradePrice: float | None = Field(default=None, gt=0)
    bidPrice: float = Field(gt=0)
    askPrice: float = Field(gt=0)
    quoteTimestamp: datetime
    quoteSource: str = Field(min_length=1, max_length=120)
    venue: str | None = Field(default=None, max_length=64)
    lowLiquidityFlag: bool = False


class LiquiditySpreadRequest(BaseModel):
    side: Literal["BUY", "SELL"]
    orderType: Literal["MARKET", "LIMIT"]
    evidence: LiquidityQuoteEvidence
    proposedLimitPrice: float | None = Field(default=None, gt=0)


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


def evaluate_liquidity_spread_gate(
    *,
    evidence: LiquidityQuoteEvidence,
    side: Literal["BUY", "SELL"],
    order_type: Literal["MARKET", "LIMIT"],
    proposed_limit_price: float | None = None,
    evaluated_at: datetime | None = None,
) -> dict[str, Any]:
    reasons: list[str] = []
    now = evaluated_at or datetime.now(timezone.utc)
    timestamp = evidence.quoteTimestamp
    prices = [evidence.bidPrice, evidence.askPrice]
    if evidence.lastTradePrice is not None:
        prices.append(evidence.lastTradePrice)

    def build(
        decision: LiquidityDecision,
        allowed: bool,
        *,
        immediate: bool | None,
        quoted_spread_pct: float | None = None,
        reference_premium_pct: float | None = None,
        quote_age_seconds: float | None = None,
    ) -> dict[str, Any]:
        return {
            "gate": "Liquidity / Spread Gate Ω",
            "version": "1.1.0",
            "ticker": evidence.ticker.strip(),
            "side": side,
            "orderType": order_type,
            "decision": decision,
            "executionAllowed": allowed,
            "orderPlacementAllowed": allowed,
            "immediateExecutionPossible": immediate,
            "quotedSpreadPct": quoted_spread_pct,
            "referencePremiumPct": reference_premium_pct,
            "quoteAgeSeconds": quote_age_seconds,
            "quoteSource": evidence.quoteSource.strip() or None,
            "reasons": reasons,
            "investmentSignalImpact": "NONE",
        }

    if now.tzinfo is None or timestamp.tzinfo is None:
        reasons.append("Timezone-aware quoteTimestamp and evaluation time are required.")
        return build("EVIDENCE_REQUIRED", False, immediate=None)

    if not evidence.quoteSource.strip():
        reasons.append("Attributable quoteSource evidence is required.")
        return build("EVIDENCE_REQUIRED", False, immediate=None)

    if not all(math.isfinite(value) and value > 0 for value in prices):
        reasons.append("All supplied quote prices must be finite and positive.")
        return build("EVIDENCE_REQUIRED", False, immediate=None)

    if evidence.askPrice < evidence.bidPrice:
        reasons.append("Invalid quote book: askPrice is below bidPrice.")
        return build("EVIDENCE_REQUIRED", False, immediate=None)

    quote_age_seconds = round((now.astimezone(timezone.utc) - timestamp.astimezone(timezone.utc)).total_seconds(), 3)
    if quote_age_seconds < -5 or quote_age_seconds > MAX_QUOTE_AGE_SECONDS:
        reasons.append(
            f"Quote age {quote_age_seconds}s is outside the permitted {MAX_QUOTE_AGE_SECONDS:g}s freshness window."
        )
        return build("EVIDENCE_REQUIRED", False, immediate=None, quote_age_seconds=quote_age_seconds)

    midpoint = (evidence.bidPrice + evidence.askPrice) / 2
    reference_price = evidence.lastTradePrice or midpoint
    quoted_spread_pct = round(((evidence.askPrice - evidence.bidPrice) / midpoint) * 100, 4)
    executable_price = evidence.askPrice if side == "BUY" else evidence.bidPrice
    if side == "BUY":
        reference_premium_pct = round(((executable_price - reference_price) / reference_price) * 100, 4)
        max_acceptable_limit = reference_price * (1 + MAX_REFERENCE_PREMIUM_PCT / 100)
    else:
        reference_premium_pct = round(((reference_price - executable_price) / reference_price) * 100, 4)
        max_acceptable_limit = reference_price * (1 - MAX_REFERENCE_PREMIUM_PCT / 100)

    reasons.append(
        f"Quote evidence from {evidence.quoteSource.strip()} is attributable and fresh ({quote_age_seconds}s old)."
    )

    if order_type == "LIMIT":
        if proposed_limit_price is None or not math.isfinite(proposed_limit_price) or proposed_limit_price <= 0:
            reasons.append("A finite positive proposed limit price is required.")
            return build(
                "EVIDENCE_REQUIRED",
                False,
                immediate=None,
                quoted_spread_pct=quoted_spread_pct,
                reference_premium_pct=reference_premium_pct,
                quote_age_seconds=quote_age_seconds,
            )
        protected = proposed_limit_price <= max_acceptable_limit if side == "BUY" else proposed_limit_price >= max_acceptable_limit
        if not protected:
            reasons.append("Proposed limit is too aggressive relative to the reference-price execution budget.")
            return build(
                "WAIT_SPREAD",
                False,
                immediate=False,
                quoted_spread_pct=quoted_spread_pct,
                reference_premium_pct=reference_premium_pct,
                quote_age_seconds=quote_age_seconds,
            )
        immediate = proposed_limit_price >= evidence.askPrice if side == "BUY" else proposed_limit_price <= evidence.bidPrice
        reasons.append("Protected limit placement is inside the configured execution budget.")
        if not immediate:
            reasons.append("No immediate fill is asserted at the current bid/ask.")
        return build(
            "PASS_LIMIT_PROTECTED",
            True,
            immediate=immediate,
            quoted_spread_pct=quoted_spread_pct,
            reference_premium_pct=reference_premium_pct,
            quote_age_seconds=quote_age_seconds,
        )

    if quoted_spread_pct > SEVERE_QUOTED_SPREAD_PCT:
        reasons.append("Severe quoted spread blocks market execution.")
        return build(
            "WAIT_SPREAD",
            False,
            immediate=False,
            quoted_spread_pct=quoted_spread_pct,
            reference_premium_pct=reference_premium_pct,
            quote_age_seconds=quote_age_seconds,
        )

    if (
        quoted_spread_pct > MAX_QUOTED_SPREAD_PCT
        or reference_premium_pct > MAX_REFERENCE_PREMIUM_PCT
        or evidence.lowLiquidityFlag
    ):
        reasons.append("Market order blocked; use a price-protected limit order or wait for liquidity.")
        return build(
            "LIMIT_ONLY",
            False,
            immediate=False,
            quoted_spread_pct=quoted_spread_pct,
            reference_premium_pct=reference_premium_pct,
            quote_age_seconds=quote_age_seconds,
        )

    reasons.append("Bid/ask spread and executable-price premium are inside budget.")
    return build(
        "PASS",
        True,
        immediate=True,
        quoted_spread_pct=quoted_spread_pct,
        reference_premium_pct=reference_premium_pct,
        quote_age_seconds=quote_age_seconds,
    )


def require_liquidity_execution(
    *,
    order_ticker: str,
    quantity: float,
    order_type: Literal["MARKET", "LIMIT"],
    evidence: LiquidityQuoteEvidence,
    proposed_limit_price: float | None = None,
) -> dict[str, Any]:
    normalized_order_ticker = order_ticker.strip().upper()
    normalized_quote_ticker = evidence.ticker.strip().upper()
    if normalized_order_ticker != normalized_quote_ticker:
        raise HTTPException(
            status_code=409,
            detail={
                "message": "Timing/order ticker and liquidity-evidence ticker do not match; execution fails closed.",
                "ticker": normalized_order_ticker,
                "liquidityTicker": normalized_quote_ticker,
            },
        )
    side: Literal["BUY", "SELL"] = "SELL" if quantity < 0 else "BUY"
    result = evaluate_liquidity_spread_gate(
        evidence=evidence,
        side=side,
        order_type=order_type,
        proposed_limit_price=proposed_limit_price,
    )
    if not result["executionAllowed"]:
        raise HTTPException(
            status_code=409,
            detail={
                "message": "Liquidity / Spread Gate Ω blocked execution.",
                "ticker": normalized_order_ticker,
                "liquiditySpreadGate": result,
            },
        )
    return result


@router.get("/policy")
async def policy() -> dict[str, Any]:
    return {
        "gate": "Execution Safety Gate Ω",
        "version": "1.1.0",
        "chain": "TRADING_HALT -> NO_EXECUTE -> KEEP_PENDING -> RECHECK",
        "temporaryStates": ["TRADING_HALT", "MARKET_CLOSED", "RATE_LIMIT"],
        "reviewStates": ["CLOSE_ONLY", "INSTRUMENT_NOT_TRADABLE", "INSUFFICIENT_FUNDS", "AUTH_ERROR", "ORDER_REJECTED", "API_ERROR"],
        "investmentSignalImpact": "NONE",
        "principle": "Execution availability is operational evidence, not an investment thesis signal.",
        "liquiditySpreadGate": {
            "maxQuotedSpreadPct": MAX_QUOTED_SPREAD_PCT,
            "maxReferencePremiumPct": MAX_REFERENCE_PREMIUM_PCT,
            "severeQuotedSpreadPct": SEVERE_QUOTED_SPREAD_PCT,
            "maxQuoteAgeSeconds": MAX_QUOTE_AGE_SECONDS,
        },
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


@router.post("/liquidity")
async def liquidity(payload: LiquiditySpreadRequest) -> dict[str, Any]:
    return evaluate_liquidity_spread_gate(
        evidence=payload.evidence,
        side=payload.side,
        order_type=payload.orderType,
        proposed_limit_price=payload.proposedLimitPrice,
    )
