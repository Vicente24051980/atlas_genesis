from __future__ import annotations

import asyncio
from typing import Any, Literal

from fastapi import APIRouter, HTTPException, Query

from api.atlas_core import analyze_symbol
from api.providers.trading212_readonly import configured as trading212_configured
from api.providers.trading212_readonly import live_portfolio
from api.tracked_universe import PORTFOLIO, PORTFOLIO_PENDING, SNAPSHOT_ID, WATCHLIST

router = APIRouter(prefix="/v1/mobile", tags=["mobile-sync"])


def _fallback_portfolio() -> list[dict[str, Any]]:
    return [dict(item) for item in PORTFOLIO]


def _watchlist() -> list[dict[str, Any]]:
    return [dict(item) for item in WATCHLIST]


def _portfolio_item(position: dict[str, Any]) -> dict[str, Any]:
    symbol = str(position.get("analysisSymbol") or "").strip().upper()
    broker_ticker = str(position.get("brokerTicker") or "").strip()
    name = str(position.get("name") or symbol or broker_ticker)
    return {
        "ticker": symbol or broker_ticker,
        "symbol": symbol or broker_ticker,
        "name": name,
        "sector": "Trading 212 LIVE",
        "brokerTicker": broker_ticker,
        "isin": position.get("isin"),
        "currency": position.get("currency"),
        "quantity": position.get("quantity"),
        "quantityAvailableForTrading": position.get("quantityAvailableForTrading"),
        "quantityInPies": position.get("quantityInPies"),
        "averagePricePaid": position.get("averagePricePaid"),
        "currentPrice": position.get("currentPrice"),
        "walletImpact": position.get("walletImpact"),
        "brokerCreatedAt": position.get("createdAt"),
        "portfolioSource": "Trading212",
    }


async def resolved_portfolio() -> tuple[list[dict[str, Any]], dict[str, Any]]:
    if not trading212_configured():
        return _fallback_portfolio(), {
            "provider": "ATLAS_BOOTSTRAP",
            "configured": False,
            "sourceStatus": "FALLBACK",
            "readOnly": True,
        }

    try:
        payload = await live_portfolio()
        rows = payload.get("positions") if isinstance(payload, dict) else []
        positions = [_portfolio_item(item) for item in rows if isinstance(item, dict)]
        if positions:
            return positions, {
                "provider": "Trading212",
                "configured": True,
                "environment": payload.get("environment"),
                "sourceStatus": payload.get("sourceStatus"),
                "generatedAt": payload.get("generatedAt"),
                "rateLimit": payload.get("rateLimit") or {},
                "readOnly": True,
            }
    except HTTPException as exc:
        return _fallback_portfolio(), {
            "provider": "ATLAS_BOOTSTRAP",
            "configured": True,
            "sourceStatus": f"BROKER_UNAVAILABLE:{exc.status_code}",
            "readOnly": True,
        }

    return _fallback_portfolio(), {
        "provider": "ATLAS_BOOTSTRAP",
        "configured": True,
        "sourceStatus": "BROKER_EMPTY_FALLBACK",
        "readOnly": True,
    }


@router.get("/universe")
async def mobile_universe() -> dict[str, Any]:
    portfolio, portfolio_meta = await resolved_portfolio()
    watchlist = _watchlist()
    return {
        "snapshotId": SNAPSHOT_ID,
        "portfolio": portfolio,
        "portfolioPending": [dict(item) for item in PORTFOLIO_PENDING],
        "watchlist": watchlist,
        "counts": {
            "portfolio": len(portfolio),
            "pending": len(PORTFOLIO_PENDING),
            "watchlist": len(watchlist),
        },
        "portfolioMeta": portfolio_meta,
        "watchlistMeta": {
            "provider": "ATLAS_EDITABLE_WATCHLIST",
            "analysisProvider": "Finnhub via resilient ATLAS backend",
        },
        "guardrail": "Trading 212 is authoritative for held positions when read-only credentials are configured. Watchlist identity remains user-editable; analysis is fetched separately from the configured market/fundamental provider.",
    }


@router.get("/monitor/{kind}")
async def mobile_monitor(
    kind: Literal["portfolio", "watchlist"],
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=6, ge=1, le=8),
) -> dict[str, Any]:
    if kind == "portfolio":
        source, portfolio_meta = await resolved_portfolio()
        context: Literal["portfolio", "watchlist"] = "portfolio"
    else:
        source = _watchlist()
        portfolio_meta = None
        context = "watchlist"

    page = source[offset: offset + limit]

    async def one(item: dict[str, Any]) -> dict[str, Any]:
        symbol = str(item.get("symbol") or item.get("ticker") or "").strip().upper()
        if not symbol:
            return {"item": item, "ok": False, "error": "UNRESOLVED_SYMBOL"}
        try:
            result = await analyze_symbol(symbol, context)
            return {"item": item, "ok": True, **result}
        except HTTPException as exc:
            return {
                "item": item,
                "ok": False,
                "symbol": symbol,
                "error": str(exc.detail),
                "statusCode": exc.status_code,
            }
        except Exception as exc:
            return {"item": item, "ok": False, "symbol": symbol, "error": exc.__class__.__name__}

    rows = await asyncio.gather(*(one(item) for item in page))
    next_offset = offset + len(page) if offset + len(page) < len(source) else None
    return {
        "kind": kind,
        "snapshotId": SNAPSHOT_ID,
        "offset": offset,
        "limit": limit,
        "total": len(source),
        "nextOffset": next_offset,
        "items": rows,
        "portfolioMeta": portfolio_meta,
        "guardrail": "Monitoring is paginated and provider-resilient. A provider limit never changes portfolio identity and never fabricates missing analysis.",
    }
