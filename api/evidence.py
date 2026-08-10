from __future__ import annotations

import os
import time
from datetime import datetime, timezone
from typing import Any

import httpx
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/v1/evidence", tags=["evidence"])

SEC_USER_AGENT = os.getenv(
    "SEC_USER_AGENT",
    "ATLAS-OS (contact: vicentebellverfrances@gmail.com)",
).strip()
SEC_TICKERS_URL = "https://www.sec.gov/files/company_tickers.json"
SEC_SUBMISSIONS_URL = "https://data.sec.gov/submissions/CIK{cik}.json"
SEC_CACHE_TTL_SECONDS = 86_400
SUBMISSION_CACHE_TTL_SECONDS = 900

_TICKER_CACHE: tuple[float, dict[str, dict[str, Any]]] = (0.0, {})
_SUBMISSION_CACHE: dict[str, tuple[float, dict[str, Any]]] = {}


def _normalize_symbol(value: str) -> str:
    normalized = value.strip().upper().replace("-", ".")
    if not normalized or len(normalized) > 20 or any(ch not in "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789." for ch in normalized):
        raise HTTPException(status_code=400, detail="valid symbol is required")
    return normalized


async def _sec_json(url: str) -> Any:
    timeout = httpx.Timeout(18.0, connect=8.0)
    headers = {
        "User-Agent": SEC_USER_AGENT,
        "Accept-Encoding": "gzip, deflate",
        "Host": "www.sec.gov" if "www.sec.gov" in url else "data.sec.gov",
    }
    try:
        async with httpx.AsyncClient(timeout=timeout, follow_redirects=True) as client:
            response = await client.get(url, headers=headers)
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=f"SEC connection failed: {exc.__class__.__name__}") from exc
    if response.status_code == 429:
        raise HTTPException(status_code=429, detail="SEC rate limit reached")
    if response.status_code >= 400:
        raise HTTPException(status_code=502, detail=f"SEC HTTP {response.status_code}")
    try:
        return response.json()
    except ValueError as exc:
        raise HTTPException(status_code=502, detail="SEC returned non-JSON data") from exc


async def _ticker_map() -> dict[str, dict[str, Any]]:
    global _TICKER_CACHE
    cached_at, cached = _TICKER_CACHE
    if cached and time.time() - cached_at < SEC_CACHE_TTL_SECONDS:
        return cached
    payload = await _sec_json(SEC_TICKERS_URL)
    result: dict[str, dict[str, Any]] = {}
    if isinstance(payload, dict):
        for item in payload.values():
            if not isinstance(item, dict):
                continue
            ticker = str(item.get("ticker") or "").upper()
            if ticker:
                result[ticker] = item
    _TICKER_CACHE = (time.time(), result)
    return result


async def _submissions(cik: str) -> dict[str, Any]:
    cached = _SUBMISSION_CACHE.get(cik)
    if cached and time.time() - cached[0] < SUBMISSION_CACHE_TTL_SECONDS:
        return cached[1]
    payload = await _sec_json(SEC_SUBMISSIONS_URL.format(cik=cik))
    result = payload if isinstance(payload, dict) else {}
    _SUBMISSION_CACHE[cik] = (time.time(), result)
    return result


def classify_filing(form: str, items: list[str]) -> dict[str, Any]:
    normalized_form = form.upper().strip()
    normalized_items = [item.strip() for item in items if item.strip()]
    event = "PRIMARY_DISCLOSURE"
    priority = 35

    rules = [
        ("1.03", "DISTRESS_OR_BANKRUPTCY", 100),
        ("2.02", "EARNINGS_RESULTS", 80),
        ("2.05", "RESTRUCTURING", 85),
        ("2.06", "IMPAIRMENT", 85),
        ("3.01", "LISTING_RISK", 90),
        ("5.02", "LEADERSHIP_CHANGE", 70),
        ("7.01", "REG_FD", 55),
        ("8.01", "OTHER_MATERIAL_EVENT", 55),
    ]
    for prefix, label, score in rules:
        if any(item.startswith(prefix) for item in normalized_items) and score > priority:
            event = label
            priority = score

    if normalized_form in {"10-K", "20-F"}:
        event = "ANNUAL_REPORT"
        priority = max(priority, 75)
    elif normalized_form in {"10-Q", "6-K"}:
        event = "PERIODIC_REPORT"
        priority = max(priority, 65)
    elif normalized_form == "8-K" and event == "PRIMARY_DISCLOSURE":
        event = "CURRENT_REPORT"
        priority = 50

    return {
        "eventClass": event,
        "reviewPriority": priority,
        "sourceQuality": "PRIMARY",
        "admissibility": "PRIMARY_SOURCE_OBSERVED",
        "thesisImpact": "REVIEW_REQUIRED" if priority >= 70 else "OBSERVE",
        "falsifierConfirmed": False,
    }


def _filing_url(cik: str, accession: str | None, primary_document: str | None) -> str | None:
    if not accession or not primary_document:
        return None
    accession_compact = accession.replace("-", "")
    cik_compact = str(int(cik))
    return f"https://www.sec.gov/Archives/edgar/data/{cik_compact}/{accession_compact}/{primary_document}"


@router.get("/{symbol}")
async def evidence_for_symbol(symbol: str) -> dict[str, Any]:
    normalized = _normalize_symbol(symbol)
    mapping = await _ticker_map()
    item = mapping.get(normalized)
    if not item and "." in normalized:
        item = mapping.get(normalized.replace(".", "-"))
    if not item:
        return {
            "symbol": normalized,
            "status": "NO_SEC_MATCH",
            "source": "SEC EDGAR",
            "primaryEvidence": [],
            "observedAt": datetime.now(timezone.utc).isoformat(),
            "guardrail": "No SEC match is not evidence of absence. Non-US issuers may require another primary regulator/source.",
        }

    cik = str(item.get("cik_str") or "").zfill(10)
    submissions = await _submissions(cik)
    recent = ((submissions.get("filings") or {}).get("recent") or {}) if isinstance(submissions, dict) else {}
    forms = recent.get("form") if isinstance(recent.get("form"), list) else []
    allowed = {"10-K", "10-Q", "8-K", "20-F", "6-K"}
    evidence: list[dict[str, Any]] = []

    for index, form in enumerate(forms):
        if str(form).upper() not in allowed:
            continue
        items_raw = _at(recent.get("items"), index)
        filing_items = [part.strip() for part in str(items_raw or "").split(",") if part.strip()]
        accession = _string(_at(recent.get("accessionNumber"), index))
        primary_document = _string(_at(recent.get("primaryDocument"), index))
        classification = classify_filing(str(form), filing_items)
        evidence.append({
            "form": str(form),
            "filingDate": _string(_at(recent.get("filingDate"), index)),
            "reportDate": _string(_at(recent.get("reportDate"), index)),
            "accessionNumber": accession,
            "primaryDocument": primary_document,
            "items": filing_items,
            "sourceUrl": _filing_url(cik, accession, primary_document),
            **classification,
        })
        if len(evidence) >= 20:
            break

    return {
        "symbol": normalized,
        "companyName": submissions.get("name") or item.get("title"),
        "cik": cik,
        "status": "OK",
        "source": "SEC EDGAR",
        "primaryEvidence": evidence,
        "highPriority": [entry for entry in evidence if entry["reviewPriority"] >= 70],
        "observedAt": datetime.now(timezone.utc).isoformat(),
        "guardrail": "A primary filing is admissible evidence that the disclosure exists. Its presence does not confirm a thesis falsifier; ATLAS requires content-level validation before changing conviction or exiting a position.",
    }


def _at(value: Any, index: int) -> Any:
    return value[index] if isinstance(value, list) and index < len(value) else None


def _string(value: Any) -> str | None:
    if isinstance(value, str) and value.strip():
        return value.strip()
    return None
