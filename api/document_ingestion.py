from __future__ import annotations
import hashlib,os,subprocess,tempfile
from pathlib import Path
from fastapi import APIRouter,File,Header,HTTPException,UploadFile
from api.agent_infrastructure import EvidenceEnvelope,_control
router=APIRouter(prefix="/v1/agent-infra",tags=["agent-infrastructure"]); MAX_DOCUMENT_BYTES=int(os.getenv("ATLAS_MAX_DOCUMENT_BYTES","25000000"))
@router.post("/ingest/document",response_model=EvidenceEnvelope)
async def ingest_document(file:UploadFile=File(...),x_atlas_agent_token:str|None=Header(default=None)):
 _control(x_atlas_agent_token); raw=await file.read(MAX_DOCUMENT_BYTES+1)
 if len(raw)>MAX_DOCUMENT_BYTES: raise HTTPException(413,"Document too large")
 if not raw: raise HTTPException(400,"Empty document")
 with tempfile.TemporaryDirectory(prefix="atlas-markitdown-") as d:
  p=Path(d)/f"input{Path(file.filename or 'document').suffix[:12]}";p.write_bytes(raw)
  try:r=subprocess.run(["markitdown",str(p)],capture_output=True,text=True,timeout=120,check=False)
  except FileNotFoundError as e: raise HTTPException(503,"MarkItDown CLI is not installed") from e
  except subprocess.TimeoutExpired as e: raise HTTPException(504,"MarkItDown timed out") from e
  if r.returncode!=0 or not r.stdout.strip(): raise HTTPException(422,"Document conversion failed")
  content=r.stdout.strip()
 return EvidenceEnvelope.build(source=file.filename or "uploaded-document",source_type="document",content=content,metadata={"provider":"markitdown","mimeType":file.content_type,"originalSha256":hashlib.sha256(raw).hexdigest()})
