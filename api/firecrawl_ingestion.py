from __future__ import annotations

import ipaddress
import os
import socket
from datetime import datetime, timezone
from typing import Any, Literal
from urllib.parse import urlparse

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, model_validator

router = APIRouter(prefix="/v1/evidence/web", tags=["evidence", "firecrawl"])

FIRECRAWL_API_URL = os.getenv("FIRECRAWL_API_URL", "https://api.firecrawl.dev/v2").rstrip("/")
FIRECRAWL_TIMEOUT_SECONDS = float(os.getenv("FIRECRAWL_TIMEOUT_SECONDS", "45"))

Freshness = Literal["LIVE", "DAILY", "QUARTERLY", "EVERGREEN"]
SearchSource = Literal["web", "news", "images"]
SearchCategory = Literal["github", "research", "pdf", "developer"]


class ScrapeRequest(BaseModel):
    url: str
    ticker: str | None = None
    freshness: Freshness = "DAILY"
    max_age_ms: int | None = Field(default=None, ge=0)
    include_screenshot: bool = False


class SearchRequest(BaseModel):
    query: str = Field(min_length=1, max_length=500)
    ticker: str | None = None
    freshness: Freshness = "DAILY"
    limit: int = Field(default=5, ge=1, le=25)
    sources: list[SearchSource] = Field(default_factory=lambda: ["web"])
    categories: list[SearchCategory] = Field(default_factory=list)
    include_domains: list[str] = Field(default_factory=list, max_length=20)
    exclude_domains: list[str] = Field(default_factory=list, max_length=20)
    location: str | None = Field(default=None, max_length=200)
    country: str | None = Field(default=None, min_length=2, max_length=2)
    tbs: str | None = Field(default=None, max_length=32)
    scrape_content: bool = True
    include_links: bool = False
    include_screenshot: bool = False
    max_age_ms: int | None = Field(default=None, ge=0)

    @model_validator(mode="after")
    def validate_filters(self) -> "SearchRequest":
        if self.include_domains and self.exclude_domains:
            raise ValueError("include_domains and exclude_domains are mutually exclusive")
        if not self.sources and not self.categories:
            raise ValueError("At least one source or category is required")
        self.sources = list(dict.fromkeys(self.sources))
        self.categories = list(dict.fromkeys(self.categories))
        self.include_domains = [_validate_domain(item) for item in self.include_domains]
        self.exclude_domains = [_validate_domain(item) for item in self.exclude_domains]
        if self.country:
            self.country = self.country.upper()
        return self


def _api_key() -> str:
    key = os.getenv("FIRECRAWL_API_KEY", "").strip()
    if not key:
        raise HTTPException(status_code=503, detail="FIRECRAWL_API_KEY is not configured")
    return key


def _validate_domain(raw_domain: str) -> str:
    domain = raw_domain.strip().lower().rstrip(".")
    if not domain or "://" in domain or "/" in domain or domain.startswith("."):
        raise ValueError(f"Invalid search domain: {raw_domain}")
    if domain in {"localhost", "localhost.localdomain"} or domain.endswith(".local"):
        raise ValueError("Private/local search domains are forbidden")
    return domain


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
    ceiling = {"LIVE": 0, "DAILY": 300_000, "QUARTERLY": 86_400_000, "EVERGREEN": 172_800_000}[freshness]
    return min(requested, ceiling) if requested is not None else ceiling


def _source_type(url: str) -> str:
    host = (urlparse(url).hostname or "").lower()
    if host.endswith(".gov") or host == "sec.gov" or host.endswith(".sec.gov"):
        return "PRIMARY"
    return "UNKNOWN"


def _guardrail() -> str:
    return (
        "Firecrawl is acquisition/discovery infrastructure only. Search rank, snippets, highlights and extracted content "
        "are not verified evidence and may never directly emit BUY/HOLD/SELL or any ATLAS investment score. "
        "Evidence Director must verify authority, period, units, freshness and contradictions before specialist engines use it."
    )


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
        "guardrail": _guardrail(),
    }


def _result_url(item: dict[str, Any]) -> str | None:
    candidate = item.get("url") or item.get("sourceURL")
    if isinstance(candidate, str) and candidate.startswith(("http://", "https://")):
        return candidate
    return None


def _normalize_search_item(item: dict[str, Any], group: str, request: SearchRequest) -> dict[str, Any]:
    metadata = item.get("metadata") if isinstance(item.get("metadata"), dict) else {}
    source_url = _result_url(item) or _result_url(metadata) or ""
    markdown = item.get("markdown") if isinstance(item.get("markdown"), str) else None
    screenshot = item.get("screenshot") if isinstance(item.get("screenshot"), str) else None
    links = item.get("links") if isinstance(item.get("links"), list) else None
    is_image = group == "images"
    image_url = item.get("imageUrl") if isinstance(item.get("imageUrl"), str) else None
    has_acquired_content = bool(markdown or screenshot or links)
    if is_image:
        status = "DISCOVERED" if image_url and source_url else "INGESTION_INCOMPLETE"
    elif request.scrape_content:
        status = "OK" if source_url and has_acquired_content else "INGESTION_INCOMPLETE"
    else:
        status = "DISCOVERED" if source_url else "INGESTION_INCOMPLETE"
    publication_date = (
        metadata.get("publishedTime")
        or metadata.get("published_time")
        or item.get("date")
        or item.get("publishedTime")
    )
    return {
        "ticker": request.ticker.upper().strip() if request.ticker else None,
        "status": status,
        "adapter": "FIRECRAWL_V2_SEARCH",
        "resultGroup": group,
        "category": item.get("category"),
        "position": item.get("position"),
        "sourceUrl": source_url or None,
        "sourceDomain": urlparse(source_url).hostname if source_url else None,
        "sourceTitle": item.get("title") or metadata.get("title"),
        "sourceType": _source_type(source_url) if source_url else "UNKNOWN",
        "publicationDate": publication_date,
        "retrievedAt": datetime.now(timezone.utc).isoformat(),
        "freshnessClass": request.freshness,
        "evidenceClass": "UNCLASSIFIED",
        "verification": "PENDING",
        "description": item.get("description") or item.get("snippet"),
        "highlights": item.get("highlights"),
        "markdown": markdown,
        "links": links,
        "screenshot": screenshot,
        "imageUrl": image_url,
        "metadata": metadata,
        "guardrail": _guardrail(),
    }


async def _post_firecrawl(endpoint: str, body: dict[str, Any]) -> dict[str, Any]:
    headers = {"Authorization": f"Bearer {_api_key()}", "Content-Type": "application/json"}
    timeout = httpx.Timeout(FIRECRAWL_TIMEOUT_SECONDS, connect=10.0)
    try:
        async with httpx.AsyncClient(timeout=timeout, follow_redirects=False) as client:
            response = await client.post(f"{FIRECRAWL_API_URL}/{endpoint.lstrip('/')}", json=body, headers=headers)
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
    return payload


async def _scrape(request: ScrapeRequest) -> dict[str, Any]:
    url = _validate_public_url(request.url)
    formats: list[Any] = ["markdown"]
    if request.include_screenshot:
        formats.append("screenshot")
    body = {"url": url, "formats": formats, "maxAge": _max_age(request.freshness, request.max_age_ms)}
    return _normalize(await _post_firecrawl("scrape", body), request)


def _search_body(request: SearchRequest) -> dict[str, Any]:
    body: dict[str, Any] = {"query": request.query.strip(), "limit": request.limit}
    if request.sources:
        body["sources"] = request.sources
    if request.categories:
        body["categories"] = request.categories
    if request.include_domains:
        body["includeDomains"] = request.include_domains
    if request.exclude_domains:
        body["excludeDomains"] = request.exclude_domains
    if request.location:
        body["location"] = request.location.strip()
    if request.country:
        body["country"] = request.country
    if request.tbs:
        body["tbs"] = request.tbs.strip()
    if request.scrape_content:
        formats: list[Any] = ["markdown"]
        if request.include_links:
            formats.append("links")
        if request.include_screenshot:
            formats.append("screenshot")
        body["scrapeOptions"] = {
            "formats": formats,
            "maxAge": _max_age(request.freshness, request.max_age_ms),
        }
    return body


async def _search(request: SearchRequest) -> dict[str, Any]:
    payload = await _post_firecrawl("search", _search_body(request))
    data = payload.get("data")
    groups: dict[str, list[dict[str, Any]]] = {}
    if isinstance(data, list):
        groups["web"] = [item for item in data if isinstance(item, dict)]
    elif isinstance(data, dict):
        for group, raw_items in data.items():
            if isinstance(raw_items, list):
                groups[str(group)] = [item for item in raw_items if isinstance(item, dict)]
    else:
        raise HTTPException(status_code=502, detail={"status": "INGESTION_INCOMPLETE", "reason": "MALFORMED_SEARCH_DATA"})

    normalized: dict[str, list[dict[str, Any]]] = {
        group: [_normalize_search_item(item, group, request) for item in items]
        for group, items in groups.items()
    }
    flattened = [item for items in normalized.values() for item in items]
    incomplete = sum(1 for item in flattened if item["status"] == "INGESTION_INCOMPLETE")
    if not flattened:
        overall_status = "NO_RESULTS"
    elif incomplete == len(flattened):
        overall_status = "INGESTION_INCOMPLETE"
    elif incomplete:
        overall_status = "PARTIAL"
    else:
        overall_status = "OK"
    return {
        "status": overall_status,
        "adapter": "FIRECRAWL_V2_SEARCH",
        "query": request.query.strip(),
        "ticker": request.ticker.upper().strip() if request.ticker else None,
        "freshnessClass": request.freshness,
        "requestedSources": request.sources,
        "requestedCategories": request.categories,
        "resultCount": len(flattened),
        "incompleteCount": incomplete,
        "results": normalized,
        "guardrail": _guardrail(),
    }


@router.post("/scrape")
async def scrape_web_evidence(request: ScrapeRequest) -> dict[str, Any]:
    """Acquire one public URL; never emits an investment decision."""
    return await _scrape(request)


@router.post("/search")
async def search_web_evidence(request: SearchRequest) -> dict[str, Any]:
    """Discover and optionally acquire public evidence; never emits an investment decision."""
    return await _search(request)
