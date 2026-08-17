from __future__ import annotations

import hashlib
import hmac
import os
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Literal

import httpx
from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel, Field, HttpUrl

router = APIRouter(prefix="/v1/agent-infra", tags=["agent-infrastructure"])

FIRECRAWL_API_KEY = os.getenv("FIRECRAWL_API_KEY", "").strip()
FIRECRAWL_BASE_URL = os.getenv("FIRECRAWL_BASE_URL", "https://api.firecrawl.dev/v1").rstrip("/")
MEM0_API_KEY = os.getenv("MEM0_API_KEY", "").strip()
MEM0_BASE_URL = os.getenv("MEM0_BASE_URL", "https://api.mem0.ai/v1").rstrip("/")
N8N_WEBHOOK_SECRET = os.getenv("N8N_WEBHOOK_SECRET", "").strip()
ATLAS_AGENT_CONTROL_TOKEN = os.getenv("ATLAS_AGENT_CONTROL_TOKEN", "").strip()


class EvidenceClass(str, Enum):
    FACT = "FACT"
    HYPOTHESIS = "HYPOTHESIS"
    INTERPRETATION = "INTERPRETATION"
    NOISE = "NOISE"
    UNCLASSIFIED = "UNCLASSIFIED"


class EvidenceEnvelope(BaseModel):
    source: str
    source_type: Literal["web", "document", "api", "memory"]
    retrieved_at: str
    content_hash: str
    classification: EvidenceClass = EvidenceClass.UNCLASSIFIED
    confidence: float | None = Field(default=None, ge=0, le=1)
    canonical: bool = False
    content: str
    metadata: dict[str, Any] = Field(default_factory=dict)

    @classmethod
    def build(cls, *, source: str, source_type: str, content: str, metadata: dict[str, Any] | None = None) -> "EvidenceEnvelope":
        return cls(
            source=source,
            source_type=source_type,
            retrieved_at=datetime.now(timezone.utc).isoformat(),
            content_hash=hashlib.sha256(content.encode("utf-8")).hexdigest(),
            content=content,
            metadata=metadata or {},
        )


class WebIngestRequest(BaseModel):
    url: HttpUrl


class MemoryWriteRequest(BaseModel):
    text: str = Field(min_length=1, max_length=50_000)
    user_id: str = Field(default="atlas", min_length=1, max_length=128)
    metadata: dict[str, Any] = Field(default_factory=dict)


class MemorySearchRequest(BaseModel):
    query: str = Field(min_length=1, max_length=10_000)
    user_id: str = Field(default="atlas", min_length=1, max_length=128)


class ClassifyRequest(BaseModel):
    envelope: EvidenceEnvelope
    classification: EvidenceClass
    confidence: float = Field(ge=0, le=1)
    rationale: str = Field(min_length=3, max_length=10_000)


def _control(token: str | None) -> None:
    if not ATLAS_AGENT_CONTROL_TOKEN:
        raise HTTPException(503, "ATLAS_AGENT_CONTROL_TOKEN is not configured")
    if not token or not hmac.compare_digest(token, ATLAS_AGENT_CONTROL_TOKEN):
        raise HTTPException(401, "Invalid ATLAS agent control token")


async def _post(url: str, *, headers: dict[str, str], json: dict[str, Any]) -> dict[str, Any]:
    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(45, connect=10), follow_redirects=True) as client:
            response = await client.post(url, headers=headers, json=json)
    except httpx.RequestError as exc:
        raise HTTPException(502, f"Upstream connection failed: {exc.__class__.__name__}") from exc
    if response.status_code >= 400:
        raise HTTPException(502, {"upstreamStatus": response.status_code, "service": url.split('/')[2]})
    try:
        payload = response.json()
    except ValueError as exc:
        raise HTTPException(502, "Upstream returned non-JSON data") from exc
    return payload if isinstance(payload, dict) else {"data": payload}


@router.get("/health")
async def health() -> dict[str, Any]:
    return {
        "status": "OK",
        "firecrawl": bool(FIRECRAWL_API_KEY),
        "mem0": bool(MEM0_API_KEY),
        "n8nWebhookVerification": bool(N8N_WEBHOOK_SECRET),
        "controlGate": bool(ATLAS_AGENT_CONTROL_TOKEN),
        "governance": "Evidence Director Ω -> Investment Committee Ω -> Falsifiers Ω veto",
    }


@router.post("/ingest/web", response_model=EvidenceEnvelope)
async def ingest_web(req: WebIngestRequest, x_atlas_agent_token: str | None = Header(default=None)) -> EvidenceEnvelope:
    _control(x_atlas_agent_token)
    if not FIRECRAWL_API_KEY:
        raise HTTPException(503, "FIRECRAWL_API_KEY is not configured")
    payload = await _post(
        f"{FIRECRAWL_BASE_URL}/scrape",
        headers={"Authorization": f"Bearer {FIRECRAWL_API_KEY}"},
        json={"url": str(req.url), "formats": ["markdown"]},
    )
    data = payload.get("data") if isinstance(payload.get("data"), dict) else payload
    content = str(data.get("markdown") or data.get("content") or "")
    if not content:
        raise HTTPException(502, "Firecrawl returned no extractable content")
    return EvidenceEnvelope.build(source=str(req.url), source_type="web", content=content, metadata={"provider": "firecrawl"})


@router.post("/memory/write")
async def memory_write(req: MemoryWriteRequest, x_atlas_agent_token: str | None = Header(default=None)) -> dict[str, Any]:
    _control(x_atlas_agent_token)
    if not MEM0_API_KEY:
        raise HTTPException(503, "MEM0_API_KEY is not configured")
    result = await _post(
        f"{MEM0_BASE_URL}/memories/",
        headers={"Authorization": f"Token {MEM0_API_KEY}", "Content-Type": "application/json"},
        json={"messages": [{"role": "user", "content": req.text}], "user_id": req.user_id, "metadata": req.metadata},
    )
    return {"status": "STORED_NON_CANONICAL", "canonical": False, "provider": "mem0", "result": result}


@router.post("/memory/search")
async def memory_search(req: MemorySearchRequest, x_atlas_agent_token: str | None = Header(default=None)) -> dict[str, Any]:
    _control(x_atlas_agent_token)
    if not MEM0_API_KEY:
        raise HTTPException(503, "MEM0_API_KEY is not configured")
    result = await _post(
        f"{MEM0_BASE_URL}/memories/search/",
        headers={"Authorization": f"Token {MEM0_API_KEY}", "Content-Type": "application/json"},
        json={"query": req.query, "user_id": req.user_id},
    )
    return {"status": "CONTEXT_ONLY", "canonical": False, "provider": "mem0", "result": result}


@router.post("/evidence/classify", response_model=EvidenceEnvelope)
async def classify(req: ClassifyRequest, x_atlas_agent_token: str | None = Header(default=None)) -> EvidenceEnvelope:
    _control(x_atlas_agent_token)
    envelope = req.envelope.model_copy(deep=True)
    envelope.classification = req.classification
    envelope.confidence = req.confidence
    envelope.canonical = False
    envelope.metadata["classificationRationale"] = req.rationale
    envelope.metadata["classifiedAt"] = datetime.now(timezone.utc).isoformat()
    return envelope


@router.post("/n8n/event")
async def n8n_event(payload: dict[str, Any], x_n8n_secret: str | None = Header(default=None)) -> dict[str, Any]:
    if not N8N_WEBHOOK_SECRET:
        raise HTTPException(503, "N8N_WEBHOOK_SECRET is not configured")
    if not x_n8n_secret or not hmac.compare_digest(x_n8n_secret, N8N_WEBHOOK_SECRET):
        raise HTTPException(401, "Invalid n8n webhook secret")
    return {
        "accepted": True,
        "decisionAuthority": False,
        "canonical": False,
        "receivedAt": datetime.now(timezone.utc).isoformat(),
        "event": payload,
    }
