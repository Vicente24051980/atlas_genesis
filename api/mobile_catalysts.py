from __future__ import annotations

import asyncio
from datetime import date, timedelta
from typing import Any

from fastapi import APIRouter, Query

router = APIRouter(prefix="/v1/mobile/catalysts", tags=["mobile-catalysts"])


def _rows(payload: Any, key: str) -> list[dict[str, Any]]:
    if not isinstance(payload, dict):
        return []
    value = payload.get(key)
    if not isinstance(value, list):
        return []
    return [row for row in value if isinstance(row, dict)]


def _earnings_row(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "date": row.get("date"),
        "symbol": row.get("symbol"),
        "hour": row.get("hour"),
        "quarter": row.get("quarter"),
        "year": row.get("year"),
        "epsEstimate": row.get("epsEstimate"),
        "revenueEstimate": row.get("revenueEstimate"),
    }


def _macro_row(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "time": row.get("time"),
        "country": row.get("country"),
        "event": row.get("event"),
        "impact": row.get("impact"),
        "estimate": row.get("estimate"),
        "prev": row.get("prev"),
        "unit": row.get("unit"),
    }


@router.get("")
async def mobile_catalysts(days: int = Query(default=14, ge=1, le=31)) -> dict[str, Any]:
    """Return traceable catalyst calendars without inventing unavailable feeds.

    Earnings Calendar is available from Finnhub on the ordinary API surface.
    Economic Calendar is entitlement-dependent; absence remains an explicit DATA_GATE.
    """
    from api import main as legacy

    today = date.today()
    end = today + timedelta(days=days)
    window = {"from": today.isoformat(), "to": end.isoformat()}

    if not legacy.FINNHUB_TOKEN:
        return {
            "source": "Finnhub",
            "generatedAt": today.isoformat(),
            "window": window,
            "earnings": {
                "state": "DATA_GATE",
                "count": 0,
                "items": [],
                "detail": "FINNHUB_TOKEN is not configured on the deployed server.",
            },
            "macro": {
                "state": "DATA_GATE",
                "count": 0,
                "items": [],
                "detail": "Economic calendar requires a configured provider and sufficient entitlement.",
            },
            "guardrails": [
                "Calendar absence is never converted into a claim that no catalyst exists.",
                "A calendar event is not thesis evidence; it only defines an observation window.",
            ],
        }

    earnings_result, macro_result = await asyncio.gather(
        legacy._optional("/calendar/earnings", {**window, "international": "false"}),
        legacy._optional("/calendar/economic", window),
    )
    earnings_payload, earnings_status = earnings_result
    macro_payload, macro_status = macro_result

    earnings = [_earnings_row(row) for row in _rows(earnings_payload, "earningsCalendar")]
    earnings = [row for row in earnings if row.get("date") and row.get("symbol")]
    earnings.sort(key=lambda row: (str(row.get("date") or ""), str(row.get("hour") or ""), str(row.get("symbol") or "")))

    macro = [_macro_row(row) for row in _rows(macro_payload, "economicCalendar")]
    macro = [row for row in macro if row.get("time") and row.get("event")]
    macro.sort(key=lambda row: str(row.get("time") or ""))

    earnings_ready = earnings_status == "OK"
    macro_ready = macro_status == "OK"

    return {
        "source": "Finnhub",
        "generatedAt": today.isoformat(),
        "window": window,
        "earnings": {
            "state": "READY" if earnings_ready else "DATA_GATE",
            "count": len(earnings),
            "items": earnings[:80],
            "detail": (
                f"{len(earnings)} earnings events returned for the next {days} days."
                if earnings_ready
                else f"Earnings calendar unavailable ({earnings_status})."
            ),
        },
        "macro": {
            "state": "READY" if macro_ready else "DATA_GATE",
            "count": len(macro),
            "items": macro[:80],
            "detail": (
                f"{len(macro)} economic events returned for the next {days} days."
                if macro_ready
                else "Economic Calendar is unavailable with the current Finnhub entitlement/provider state; DATA_GATE remains explicit."
            ),
        },
        "guardrails": [
            "Earnings Calendar uses provider-reported event timing; BMO/AMC/DMH remain explicit when supplied.",
            "Economic Calendar is entitlement-dependent and fails closed when unavailable.",
            "Calendar events define catalyst windows; they do not generate BUY/SELL decisions.",
        ],
    }
