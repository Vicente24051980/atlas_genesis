from __future__ import annotations

import ipaddress
import os
import socket
from datetime import datetime, timezone
from typing import Any, Literal
from urllib.parse import urlparse

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/v1/evidence/web", tags=["evidence", "firecrawl"])

FIRECRAWL_API_URL = os.getenv("FIRECRAWL_API_URL", "https://api.firecrawl.dev/v2").rstrip("/")
FIRECRAWL_TIMEOUT_SECONDS = float(os.getenv("FIRECRAWL_TIMEOUT_SECONDS", "45"))


class ScrapeRequest(BaseModel):
    url: str
    ticker: str | None = None
    freshness: Literal["LIVE", "DAILY", "QUARTERLY", "EVERGREEN"] = "DAILY"
    max_age_ms: int | None = Field(default=None, ge=0)
    include_screenshot: bool = False


def _api_key() -> str:
    key = os.getenv("FIRECRAWL_API_KEY", "").strip()
    if not key:
        raise HTTPException(status_code=503, detail="FIRECRAWL_API_KEY is not configured")
    return key


def _validate_public_url(raw_url: str) -> str:
    parsed = urlparse(raw_url.strip())
    if parsed.scheme not in {"http", "https"} or not parsed.hostname:
        raise HTTPException(status_code=400, detail="A valid public http(s) URL is required")
    host = parsed.hostname.lower()
    if host in {"localhost", "localhost.localdomain"} or host.endswith(".local"):
        raise HTTPException(status_code=400, detail="Private/local destinations are forbidden")
    try:
        addresses = {item[4][0] for item in socket.getaddrinfo(host, parsed.port or 443, type=socket.SOCK_STREAM)}
    except socket.gaierror as exc:
        raise HTTPException(status_code=400, detail="URL hostname cannot be resolved") from exc
    for address in addresses:
        ip = ipaddress.ip_address(address)
        if not ip.is_global:
            raise HTTPException(status_code=400, detail="Private/reserved network destinations are forbidden")
    return raw_url.strip()


def _max_age(freshness: str, requested: int | None) -> int:
    # Current-state evidence must not silently inherit Firecrawl's ordinary cache.
    ceiling = {"LIVE": 0, "DAILY": 300_000, "QUARTERLY": 86_400_000, "EVERGREEN": 172_800_000}[freshness]
    return min(requested, ceiling) if requested is not None else ceiling


def _source_type(url: str) -> str:
    host = (urlparse(url).hostname or "").lower()
    if host.endswith("sec.gov") or host.endswith("gov"):
        return "PRIMARY"
    return "UNKNOWN"


def _normalize(payload: dict[str, Any], request: ScrapeRequest) -> dict[str, Any]:
    data = payload.get("data") if isinstance(payload.get("data"), dict) else payload
    metadata = data.get("metadata") if isinstance(data.get("metadata"), dict) else {}
    source_url = str(metadata.get("sourceURL") or metadata.get("url") or request.url)
    markdown = data.get("markdown") if isinstance(data.get("markdown"), str) else None
    screenshot = data.get("screenshot") if isinstance(data.get("screenshot"), str) else None
    status = "OK" if source_url and (markdown or screenshot) else "INGESTION_INCOMPLETE"
    return {
        "ticker": request.ticker.upper().strip() if request.ticker else None,
        "status": status,
        "adapter": "FIRECRAWL_V2",
        "sourceUrl": source_url,
        "sourceDomain": urlparse(source_url).hostname,
        "sourceTitle": metadata.get("title"),
        "sourceType": _source_type(source_url),
        "publicationDate": metadata.get("publishedTime") or metadata.get("published_time"),
        "retrievedAt": datetime.now(timezone.utc).isoformat(),
        "freshnessClass": request.freshness,
        "evidenceClass": "UNCLASSIFIED",
        "verification": "PENDING",
        "markdown": markdown,
        "screenshot": screenshot,
        "metadata": metadata,
        "guardrail": "Firecrawl extraction is acquisition evidence only. Evidence Director must verify authority, period, units, freshness and contradictions before specialist engines may use it.",
    }


async def _scrape(request: ScrapeRequest) -> dict[str, Any]:
    url = _validate_public_url(request.url)
    formats: list[Any] = ["markdown"]
    if request.include_screenshot:
        formats.append("screenshot")
    body = {"url": url, "formats": formats, "maxAge": _max_age(request.freshness, request.max_age_ms)}
    headers = {"Authorization": f"Bearer {_api_key()}", "Content-Type": "application/json"}
    timeout = httpx.Timeout(FIRECRAWL_TIMEOUT_SECONDS, connect=10.0)
    try:
        async with httpx.AsyncClient(timeout=timeout, follow_redirects=False) as client:
            response = await client.post(f"{FIRECRAWL_API_URL}/scrape", json=body, headers=headers)
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail={"status": "INGESTION_INCOMPLETE", "reason": exc.__class__.__name__}) from exc
    if response.status_code == 429:
        raise HTTPException(status_code=429, detail={"status": "INGESTION_INCOMPLETE", "reason": "FIRECRAWL_RATE_LIMIT"})
    if response.status_code >= 400:
        raise HTTPException(status_code=502, detail={"status": "INGESTION_INCOMPLETE", "reason": f"FIRECRAWL_HTTP_{response.status_code}"})
    try:
        payload = response.json()
    except ValueError as exc:
        raise HTTPException(status_code=502, detail={"status": "INGESTION_INCOMPLETE", "reason": "MALFORMED_FIRECRAWL_JSON"}) from exc
    if not isinstance(payload, dict) or payload.get("success") is False:
        raise HTTPException(status_code=502, detail={"status": "INGESTION_INCOMPLETE", "reason": "FIRECRAWL_UNSUCCESSFUL"})
    return _normalize(payload, request)


@router.post("/scrape")
async def scrape_web_evidence(request: ScrapeRequest) -> dict[str, Any]:
    """Acquire public web evidence; never emits an investment decision."""
    return await _scrape(request)
