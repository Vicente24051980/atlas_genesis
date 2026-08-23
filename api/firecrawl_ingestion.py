from __future__ import annotations

import ipaddress
import os
import re
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
ChangeTrackingMode = Literal["basic", "git-diff", "json"]
SitemapMode = Literal["include", "skip", "only"]
AgentModel = Literal["spark-1-mini", "spark-1-pro", "spark-2"]
JobKind = Literal["crawl", "extract", "agent"]


class ScrapeRequest(BaseModel):
    url: str
    ticker: str | None = None
    freshness: Freshness = "DAILY"
    max_age_ms: int | None = Field(default=None, ge=0)
    include_screenshot: bool = False
    change_tracking_mode: ChangeTrackingMode | None = None
    change_tracking_schema: dict[str, Any] | None = None
    tag: str | None = Field(default=None, max_length=120)

    @model_validator(mode="after")
    def validate_change_tracking(self) -> "ScrapeRequest":
        if self.change_tracking_mode == "json" and not self.change_tracking_schema:
            raise ValueError("change_tracking_schema is required for json change tracking")
        if self.change_tracking_schema is not None and self.change_tracking_mode != "json":
            raise ValueError("change_tracking_schema is only valid with json change tracking")
        return self


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


class MapRequest(BaseModel):
    url: str
    ticker: str | None = None
    search: str | None = Field(default=None, max_length=300)
    limit: int = Field(default=250, ge=1, le=5000)
    sitemap: SitemapMode = "include"
    country: str | None = Field(default=None, min_length=2, max_length=2)
    languages: list[str] = Field(default_factory=list, max_length=10)

    @model_validator(mode="after")
    def normalize_location(self) -> "MapRequest":
        if self.country:
            self.country = self.country.upper()
        self.languages = list(dict.fromkeys(item.strip() for item in self.languages if item.strip()))
        return self


class CrawlRequest(BaseModel):
    url: str
    ticker: str | None = None
    freshness: Freshness = "DAILY"
    limit: int = Field(default=50, ge=1, le=250)
    max_discovery_depth: int | None = Field(default=3, ge=0, le=10)
    include_paths: list[str] = Field(default_factory=list, max_length=30)
    exclude_paths: list[str] = Field(default_factory=list, max_length=30)
    crawl_entire_domain: bool = False
    allow_subdomains: bool = False
    sitemap: SitemapMode = "include"
    ignore_query_parameters: bool = True
    max_concurrency: int | None = Field(default=4, ge=1, le=10)
    max_age_ms: int | None = Field(default=None, ge=0)
    change_tracking_mode: ChangeTrackingMode | None = None
    change_tracking_schema: dict[str, Any] | None = None
    tag: str | None = Field(default=None, max_length=120)

    @model_validator(mode="after")
    def validate_crawl(self) -> "CrawlRequest":
        if self.change_tracking_mode == "json" and not self.change_tracking_schema:
            raise ValueError("change_tracking_schema is required for json change tracking")
        if self.change_tracking_schema is not None and self.change_tracking_mode != "json":
            raise ValueError("change_tracking_schema is only valid with json change tracking")
        return self


class ExtractRequest(BaseModel):
    urls: list[str] = Field(min_length=1, max_length=20)
    prompt: str | None = Field(default=None, max_length=3000)
    schema_: dict[str, Any] | None = Field(default=None, alias="schema")
    enable_web_search: bool = False
    ticker: str | None = None

    @model_validator(mode="after")
    def validate_extract(self) -> "ExtractRequest":
        if not self.prompt and not self.schema_:
            raise ValueError("prompt or schema is required")
        return self


class AgentRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=4000)
    urls: list[str] = Field(default_factory=list, max_length=20)
    schema_: dict[str, Any] | None = Field(default=None, alias="schema")
    model: AgentModel = "spark-1-mini"
    max_credits: int = Field(default=40, ge=1, le=100)
    ticker: str | None = None


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


def _validate_job_id(job_id: str) -> str:
    value = job_id.strip()
    if not re.fullmatch(r"[A-Za-z0-9_-]{6,160}", value):
        raise HTTPException(status_code=400, detail="Invalid Firecrawl job id")
    return value


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
        "Firecrawl is acquisition/discovery infrastructure only. Search rank, snippets, highlights, autonomous-agent output, "
        "maps, diffs and extracted content are not verified evidence and may never directly emit BUY/HOLD/SELL or any ATLAS "
        "investment score. Evidence Director must verify authority, period, units, freshness and contradictions before specialist "
        "engines use it."
    )


def _change_tracking_format(mode: ChangeTrackingMode | None, schema: dict[str, Any] | None) -> Any | None:
    if mode is None:
        return None
    if mode == "basic":
        return "changeTracking"
    payload: dict[str, Any] = {"type": "changeTracking", "modes": [mode]}
    if mode == "json" and schema is not None:
        payload["schema"] = schema
    return payload


def _normalize(payload: dict[str, Any], request: ScrapeRequest) -> dict[str, Any]:
    data = payload.get("data") if isinstance(payload.get("data"), dict) else payload
    metadata = data.get("metadata") if isinstance(data.get("metadata"), dict) else {}
    source_url = str(metadata.get("sourceURL") or metadata.get("url") or request.url)
    markdown = data.get("markdown") if isinstance(data.get("markdown"), str) else None
    screenshot = data.get("screenshot") if isinstance(data.get("screenshot"), str) else None
    change_tracking = data.get("changeTracking") if isinstance(data.get("changeTracking"), dict) else None
    status = "OK" if source_url and (markdown or screenshot or change_tracking) else "INGESTION_INCOMPLETE"
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
        "changeTracking": change_tracking,
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


def _normalize_crawl_document(item: dict[str, Any], ticker: str | None) -> dict[str, Any]:
    metadata = item.get("metadata") if isinstance(item.get("metadata"), dict) else {}
    source_url = str(metadata.get("sourceURL") or metadata.get("url") or "")
    return {
        "ticker": ticker.upper().strip() if ticker else None,
        "status": "OK" if source_url and (item.get("markdown") or item.get("json") or item.get("changeTracking")) else "INGESTION_INCOMPLETE",
        "sourceUrl": source_url or None,
        "sourceDomain": urlparse(source_url).hostname if source_url else None,
        "sourceTitle": metadata.get("title"),
        "sourceType": _source_type(source_url) if source_url else "UNKNOWN",
        "verification": "PENDING",
        "markdown": item.get("markdown") if isinstance(item.get("markdown"), str) else None,
        "json": item.get("json"),
        "changeTracking": item.get("changeTracking"),
        "metadata": metadata,
    }


async def _request_firecrawl(method: Literal["GET", "POST"], endpoint: str, body: dict[str, Any] | None = None) -> dict[str, Any]:
    headers = {"Authorization": f"Bearer {_api_key()}", "Content-Type": "application/json"}
    timeout = httpx.Timeout(FIRECRAWL_TIMEOUT_SECONDS, connect=10.0)
    try:
        async with httpx.AsyncClient(timeout=timeout, follow_redirects=False) as client:
            if method == "POST":
                response = await client.post(f"{FIRECRAWL_API_URL}/{endpoint.lstrip('/')}", json=body or {}, headers=headers)
            else:
                response = await client.get(f"{FIRECRAWL_API_URL}/{endpoint.lstrip('/')}", headers=headers)
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail={"status": "INGESTION_INCOMPLETE", "reason": exc.__class__.__name__}) from exc
    if response.status_code == 429:
        raise HTTPException(status_code=429, detail={"status": "INGESTION_INCOMPLETE", "reason": "FIRECRAWL_RATE_LIMIT"})
    if response.status_code == 402:
        raise HTTPException(status_code=402, detail={"status": "INGESTION_INCOMPLETE", "reason": "FIRECRAWL_CREDIT_LIMIT"})
    if response.status_code == 404:
        raise HTTPException(status_code=404, detail={"status": "INGESTION_INCOMPLETE", "reason": "FIRECRAWL_JOB_NOT_FOUND_OR_EXPIRED"})
    if response.status_code >= 400:
        raise HTTPException(status_code=502, detail={"status": "INGESTION_INCOMPLETE", "reason": f"FIRECRAWL_HTTP_{response.status_code}"})
    try:
        payload = response.json()
    except ValueError as exc:
        raise HTTPException(status_code=502, detail={"status": "INGESTION_INCOMPLETE", "reason": "MALFORMED_FIRECRAWL_JSON"}) from exc
    if not isinstance(payload, dict) or payload.get("success") is False:
        raise HTTPException(status_code=502, detail={"status": "INGESTION_INCOMPLETE", "reason": "FIRECRAWL_UNSUCCESSFUL"})
    return payload


async def _post_firecrawl(endpoint: str, body: dict[str, Any]) -> dict[str, Any]:
    return await _request_firecrawl("POST", endpoint, body)


async def _get_firecrawl(endpoint: str) -> dict[str, Any]:
    return await _request_firecrawl("GET", endpoint)


async def _scrape(request: ScrapeRequest) -> dict[str, Any]:
    url = _validate_public_url(request.url)
    formats: list[Any] = ["markdown"]
    if request.include_screenshot:
        formats.append("screenshot")
    change_format = _change_tracking_format(request.change_tracking_mode, request.change_tracking_schema)
    if change_format is not None:
        formats.append(change_format)
    body: dict[str, Any] = {"url": url, "formats": formats, "maxAge": _max_age(request.freshness, request.max_age_ms)}
    if request.tag:
        body["tags"] = [request.tag]
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


async def _map(request: MapRequest) -> dict[str, Any]:
    url = _validate_public_url(request.url)
    body: dict[str, Any] = {"url": url, "limit": request.limit, "sitemap": request.sitemap}
    if request.search:
        body["search"] = request.search.strip()
    if request.country or request.languages:
        body["location"] = {}
        if request.country:
            body["location"]["country"] = request.country
        if request.languages:
            body["location"]["languages"] = request.languages
    payload = await _post_firecrawl("map", body)
    raw_links = payload.get("links") if isinstance(payload.get("links"), list) else []
    links = [
        {
            "url": item.get("url"),
            "title": item.get("title"),
            "description": item.get("description"),
            "verification": "DISCOVERY_ONLY",
        }
        for item in raw_links
        if isinstance(item, dict) and isinstance(item.get("url"), str)
    ]
    return {
        "status": "OK" if links else "NO_RESULTS",
        "adapter": "FIRECRAWL_V2_MAP",
        "ticker": request.ticker.upper().strip() if request.ticker else None,
        "rootUrl": url,
        "resultCount": len(links),
        "links": links,
        "guardrail": _guardrail(),
    }


def _crawl_body(request: CrawlRequest) -> dict[str, Any]:
    formats: list[Any] = ["markdown"]
    change_format = _change_tracking_format(request.change_tracking_mode, request.change_tracking_schema)
    if change_format is not None:
        formats.append(change_format)
    body: dict[str, Any] = {
        "url": _validate_public_url(request.url),
        "limit": request.limit,
        "crawlEntireDomain": request.crawl_entire_domain,
        "allowSubdomains": request.allow_subdomains,
        "allowExternalLinks": False,
        "sitemap": request.sitemap,
        "ignoreQueryParameters": request.ignore_query_parameters,
        "scrapeOptions": {
            "formats": formats,
            "maxAge": _max_age(request.freshness, request.max_age_ms),
        },
    }
    if request.max_discovery_depth is not None:
        body["maxDiscoveryDepth"] = request.max_discovery_depth
    if request.include_paths:
        body["includePaths"] = request.include_paths
    if request.exclude_paths:
        body["excludePaths"] = request.exclude_paths
    if request.max_concurrency is not None:
        body["maxConcurrency"] = request.max_concurrency
    if request.tag:
        body["scrapeOptions"]["tags"] = [request.tag]
    return body


async def _start_crawl(request: CrawlRequest) -> dict[str, Any]:
    payload = await _post_firecrawl("crawl", _crawl_body(request))
    job_id = payload.get("id")
    if not isinstance(job_id, str) or not job_id:
        raise HTTPException(status_code=502, detail={"status": "INGESTION_INCOMPLETE", "reason": "MISSING_CRAWL_JOB_ID"})
    return {
        "status": "SUBMITTED",
        "adapter": "FIRECRAWL_V2_CRAWL",
        "jobId": job_id,
        "ticker": request.ticker.upper().strip() if request.ticker else None,
        "pageLimit": request.limit,
        "verification": "PENDING",
        "guardrail": _guardrail(),
    }


async def _crawl_status(job_id: str, ticker: str | None = None) -> dict[str, Any]:
    payload = await _get_firecrawl(f"crawl/{_validate_job_id(job_id)}")
    raw_data = payload.get("data") if isinstance(payload.get("data"), list) else []
    documents = [_normalize_crawl_document(item, ticker) for item in raw_data if isinstance(item, dict)]
    return {
        "status": payload.get("status") or "UNKNOWN",
        "adapter": "FIRECRAWL_V2_CRAWL",
        "jobId": job_id,
        "completed": payload.get("completed"),
        "total": payload.get("total"),
        "creditsUsed": payload.get("creditsUsed"),
        "expiresAt": payload.get("expiresAt"),
        "next": payload.get("next"),
        "documents": documents,
        "verification": "PENDING",
        "guardrail": _guardrail(),
    }


async def _extract(request: ExtractRequest) -> dict[str, Any]:
    urls = [_validate_public_url(url) for url in request.urls]
    body: dict[str, Any] = {"urls": urls, "enableWebSearch": request.enable_web_search}
    if request.prompt:
        body["prompt"] = request.prompt.strip()
    if request.schema_:
        body["schema"] = request.schema_
    payload = await _post_firecrawl("extract", body)
    return {
        "status": payload.get("status") or ("completed" if "data" in payload else "submitted"),
        "adapter": "FIRECRAWL_V2_EXTRACT",
        "jobId": payload.get("id"),
        "ticker": request.ticker.upper().strip() if request.ticker else None,
        "data": payload.get("data"),
        "sources": payload.get("sources"),
        "expiresAt": payload.get("expiresAt"),
        "verification": "PENDING",
        "guardrail": _guardrail(),
    }


async def _agent(request: AgentRequest) -> dict[str, Any]:
    urls = [_validate_public_url(url) for url in request.urls]
    body: dict[str, Any] = {
        "prompt": request.prompt.strip(),
        "model": request.model,
        "maxCredits": request.max_credits,
    }
    if urls:
        body["urls"] = urls
    if request.schema_:
        body["schema"] = request.schema_
    payload = await _post_firecrawl("agent", body)
    return {
        "status": payload.get("status") or ("completed" if "data" in payload else "submitted"),
        "adapter": "FIRECRAWL_V2_AGENT_RESEARCH_PREVIEW",
        "jobId": payload.get("id"),
        "ticker": request.ticker.upper().strip() if request.ticker else None,
        "data": payload.get("data"),
        "creditsUsed": payload.get("creditsUsed"),
        "expiresAt": payload.get("expiresAt"),
        "verification": "PENDING",
        "researchPreview": True,
        "guardrail": _guardrail(),
    }


async def _generic_job_status(kind: JobKind, job_id: str) -> dict[str, Any]:
    payload = await _get_firecrawl(f"{kind}/{_validate_job_id(job_id)}")
    return {
        "status": payload.get("status") or "UNKNOWN",
        "adapter": f"FIRECRAWL_V2_{kind.upper()}",
        "jobId": job_id,
        "data": payload.get("data"),
        "sources": payload.get("sources"),
        "creditsUsed": payload.get("creditsUsed"),
        "expiresAt": payload.get("expiresAt"),
        "error": payload.get("error"),
        "verification": "PENDING",
        "guardrail": _guardrail(),
    }


@router.post("/scrape")
async def scrape_web_evidence(request: ScrapeRequest) -> dict[str, Any]:
    """Acquire one public URL; optionally compare it with its previous Firecrawl snapshot."""
    return await _scrape(request)


@router.post("/search")
async def search_web_evidence(request: SearchRequest) -> dict[str, Any]:
    """Discover and optionally acquire public evidence; never emits an investment decision."""
    return await _search(request)


@router.post("/map")
async def map_web_evidence(request: MapRequest) -> dict[str, Any]:
    """Discover candidate URLs on one public site; all returned links remain discovery-only."""
    return await _map(request)


@router.post("/crawl")
async def crawl_web_evidence(request: CrawlRequest) -> dict[str, Any]:
    """Start a bounded recursive crawl. Limits are intentionally conservative for cost and auditability."""
    return await _start_crawl(request)


@router.get("/crawl/{job_id}")
async def crawl_web_evidence_status(job_id: str, ticker: str | None = None) -> dict[str, Any]:
    """Poll a crawl job and normalize each successfully acquired page independently."""
    return await _crawl_status(job_id, ticker)


@router.post("/extract")
async def extract_web_evidence(request: ExtractRequest) -> dict[str, Any]:
    """Extract structured data from known public URLs; output remains pending verification."""
    return await _extract(request)


@router.get("/extract/{job_id}")
async def extract_web_evidence_status(job_id: str) -> dict[str, Any]:
    return await _generic_job_status("extract", job_id)


@router.post("/agent")
async def agent_web_research(request: AgentRequest) -> dict[str, Any]:
    """Autonomous research for unknown/ambiguous URLs; Research Preview output is never self-validating evidence."""
    return await _agent(request)


@router.get("/agent/{job_id}")
async def agent_web_research_status(job_id: str) -> dict[str, Any]:
    return await _generic_job_status("agent", job_id)
