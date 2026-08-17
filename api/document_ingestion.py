from __future__ import annotations

import hashlib
import os
import subprocess
import tempfile
from pathlib import Path

from fastapi import APIRouter, File, Header, HTTPException, UploadFile

from api.agent_infrastructure import EvidenceEnvelope, _control

router = APIRouter(prefix="/v1/agent-infra", tags=["agent-infrastructure"])
MAX_DOCUMENT_BYTES = int(os.getenv("ATLAS_MAX_DOCUMENT_BYTES", "25000000"))


@router.post("/ingest/document", response_model=EvidenceEnvelope)
async def ingest_document(file: UploadFile = File(...), x_atlas_agent_token: str | None = Header(default=None)) -> EvidenceEnvelope:
    _control(x_atlas_agent_token)
    raw = await file.read(MAX_DOCUMENT_BYTES + 1)
    if len(raw) > MAX_DOCUMENT_BYTES:
        raise HTTPException(413, "Document exceeds ATLAS_MAX_DOCUMENT_BYTES")
    if not raw:
        raise HTTPException(400, "Empty document")

    suffix = Path(file.filename or "document").suffix[:12]
    with tempfile.TemporaryDirectory(prefix="atlas-markitdown-") as directory:
        source = Path(directory) / f"input{suffix}"
        source.write_bytes(raw)
        try:
            completed = subprocess.run(
                ["markitdown", str(source)],
                capture_output=True,
                text=True,
                timeout=120,
                check=False,
            )
        except FileNotFoundError as exc:
            raise HTTPException(503, "MarkItDown CLI is not installed") from exc
        except subprocess.TimeoutExpired as exc:
            raise HTTPException(504, "MarkItDown conversion timed out") from exc
        if completed.returncode != 0:
            raise HTTPException(422, "MarkItDown could not convert this document")
        content = completed.stdout.strip()
        if not content:
            raise HTTPException(422, "Document produced no text")

    envelope = EvidenceEnvelope.build(
        source=file.filename or "uploaded-document",
        source_type="document",
        content=content,
        metadata={
            "provider": "markitdown",
            "mimeType": file.content_type,
            "originalSha256": hashlib.sha256(raw).hexdigest(),
        },
    )
    return envelope
