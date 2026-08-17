from __future__ import annotations

from typing import Any, Literal

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel, Field

from api.agent_infrastructure import _control
from api.agentic_omega import _ENGINE, _ENGINE_LOCK
from runtime.agentic_omega import (
    CapabilityEvidenceRegistry,
    CapabilitySource,
    CapabilityStatus,
    DualPersistenceRegistry,
    RouteDescriptor,
)


router = APIRouter(prefix="/v1/agentic-omega/v2/governance", tags=["agentic-governance"])
_CAPABILITIES = CapabilityEvidenceRegistry(_ENGINE.ledger)
_SYNC = DualPersistenceRegistry(_ENGINE.ledger)


class RoutePayload(BaseModel):
    provider: str = Field(min_length=1, max_length=100)
    base_url: str = Field(default="", max_length=1000)
    model: str = Field(default="", max_length=300)
    headers: dict[str, Any] = Field(default_factory=dict)
    options: dict[str, Any] = Field(default_factory=dict)

    def materialize(self) -> RouteDescriptor:
        return RouteDescriptor(
            provider=self.provider,
            base_url=self.base_url,
            model=self.model,
            headers=self.headers,
            options=self.options,
        )


class CapabilityRecordRequest(BaseModel):
    route: RoutePayload
    capability: str = Field(min_length=1, max_length=200)
    value: bool | int | float | str | None = None
    status: CapabilityStatus
    source: CapabilitySource
    observed_at: str | None = None
    valid_until: str = ""
    detail: str = Field(default="", max_length=4000)


class CapabilityCheckRequest(BaseModel):
    route: RoutePayload
    capability: str = Field(min_length=1, max_length=200)
    mode: Literal["boolean_true", "at_least"]
    threshold: float | None = None
    require_fresh: bool = True


class SyncReceiptRequest(BaseModel):
    change_id: str = Field(min_length=1, max_length=300)
    github_commit_sha: str = Field(default="", max_length=100)
    notion_page_id: str = Field(default="", max_length=200)
    github_path: str = Field(default="", max_length=1000)
    notion_url: str = Field(default="", max_length=2000)
    detail: str = Field(default="", max_length=4000)


@router.get("/capabilities")
def governance_capabilities() -> dict[str, Any]:
    return {
        "engine": "Agentic Runtime Ω",
        "version": "2.3-governance-evidence",
        "routeFingerprinting": True,
        "credentialValuesPersisted": False,
        "unknownCapabilityFailsClosed": True,
        "trustedStatuses": ["confirmed", "asserted"],
        "ownerAssertionsRequire": "owner_ack",
        "dualPersistenceReceipts": True,
        "dualPersistenceCompleteRequires": ["github_commit_sha", "notion_page_id"],
        "writeEndpointsRequireAgentControlToken": True,
    }


@router.post("/capability-evidence")
def record_capability_evidence(
    request: CapabilityRecordRequest,
    x_atlas_agent_token: str | None = Header(default=None),
) -> dict[str, Any]:
    _control(x_atlas_agent_token)
    try:
        with _ENGINE_LOCK:
            record = _CAPABILITIES.record(
                route=request.route.materialize(),
                capability=request.capability,
                value=request.value,
                status=request.status,
                source=request.source,
                observed_at=request.observed_at,
                valid_until=request.valid_until,
                detail=request.detail,
            )
            return {
                "record": record.to_dict(),
                "route": request.route.materialize().safe_identity(),
                "guardrail": "Credential header values are excluded from route identity and persistence.",
            }
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/capability-check")
def check_capability(request: CapabilityCheckRequest) -> dict[str, Any]:
    route = request.route.materialize()
    record = _CAPABILITIES.latest(route=route, capability=request.capability)
    if request.mode == "boolean_true":
        allowed = _CAPABILITIES.boolean_allows(
            route=route,
            capability=request.capability,
            require_fresh=request.require_fresh,
        )
    else:
        if request.threshold is None:
            raise HTTPException(status_code=400, detail="threshold is required for at_least mode")
        allowed = _CAPABILITIES.at_least(
            route=route,
            capability=request.capability,
            threshold=request.threshold,
            require_fresh=request.require_fresh,
        )
    return {
        "route": route.safe_identity(),
        "capability": request.capability,
        "mode": request.mode,
        "allowed": allowed,
        "failClosed": True,
        "evidence": record.to_dict() if record else None,
    }


@router.post("/sync-receipts")
def record_sync_receipt(
    request: SyncReceiptRequest,
    x_atlas_agent_token: str | None = Header(default=None),
) -> dict[str, Any]:
    _control(x_atlas_agent_token)
    with _ENGINE_LOCK:
        receipt = _SYNC.record(
            change_id=request.change_id,
            github_commit_sha=request.github_commit_sha,
            notion_page_id=request.notion_page_id,
            github_path=request.github_path,
            notion_url=request.notion_url,
            detail=request.detail,
        )
        return {
            "receipt": receipt.to_dict(),
            "complete": receipt.status.value == "COMPLETE",
            "guardrail": "COMPLETE reflects concrete GitHub + Notion identifiers, not intended writes.",
        }


@router.get("/sync-receipts/{change_id}")
def get_sync_receipt(change_id: str) -> dict[str, Any]:
    receipt = _SYNC.latest(change_id)
    if receipt is None:
        raise HTTPException(status_code=404, detail="dual-persistence receipt not found")
    return {
        "receipt": receipt.to_dict(),
        "complete": receipt.status.value == "COMPLETE",
    }
