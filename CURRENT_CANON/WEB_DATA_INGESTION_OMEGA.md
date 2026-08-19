# WEB & DATA INGESTION Ω — ATLAS

Status: ACTIVE CANON
Date: 2026-08-19

## Objective
Create a dedicated acquisition and normalization layer upstream of ATLAS Evidence Architecture. Ingestion collects evidence; it never creates BUY/SELL decisions.

## Canonical pipeline

SOURCE -> ROUTER -> ACQUIRE -> NORMALIZE -> PROVENANCE -> DEDUP -> EVIDENCE GATE -> FACT/HYPOTHESIS/INTERPRETATION/NOISE -> ATLAS specialist engines

## Tool routing

### 1. Crawl4AI — PRIMARY WEB INGESTION
Use for public HTML, ordinary JavaScript pages, multi-page crawling and LLM-ready Markdown.

Required output envelope:
- source_url
- canonical_url
- retrieved_at_utc
- acquisition_engine
- content_hash
- raw/fit markdown
- page title
- extraction status
- errors/warnings

Default policy:
- cache bypass for time-sensitive market evidence
- bounded concurrency
- domain rate limiting
- no authentication circumvention
- preserve source URL and retrieval timestamp
- version pin dependencies

### 2. Browser Use — CONDITIONAL FALLBACK
Invoke only when Crawl4AI cannot obtain sufficient evidence because the page requires legitimate interactive browser behavior, e.g. JavaScript interaction, pagination, user-authorized login or form/navigation state.

Browser Use is NOT the default crawler.

Escalation states:
WEB_OK -> no escalation
JS_REQUIRED -> Browser Use eligible
INTERACTION_REQUIRED -> Browser Use eligible
AUTH_REQUIRED -> only with authorized credentials/session
BLOCKED/PROHIBITED -> STOP

### 3. Microsoft MarkItDown — DOCUMENT INGESTION
Use for supported office/document formats that benefit from conversion into Markdown before evidence parsing.

Untrusted documents must be processed with least privilege and isolation. Conversion does not establish truth; provenance remains mandatory.

## Deferred / non-core tools
- Scrapling: WATCH; specialized fallback only after measured need.
- Scrapy: RESERVE; large-scale deterministic crawling workloads.
- Crawlee: DEFER; overlaps current primary stack.
- Firecrawl: NOT CORE; avoid adding AGPL core dependency without explicit licensing review.
- scrcpy: OUT OF SCOPE for web evidence ingestion.
- curl-impersonate: NOT DEFAULT; no anti-bot circumvention mandate.
- AutoScraper: DEFER; insufficient incremental value for current architecture.

## Evidence contract
No acquired content enters an ATLAS decision engine without:
1. URL/source identity
2. retrieval timestamp
3. acquisition engine
4. content hash/dedup identity
5. source classification
6. evidence freshness state
7. extraction confidence/status
8. FACT/HYPOTHESIS/INTERPRETATION/NOISE classification downstream

## Safety and reliability gates
- SSRF protection: reject localhost, link-local, private network ranges and unsafe redirects unless explicitly allowlisted for controlled internal use.
- Scheme allowlist: HTTPS/HTTP only for web acquisition.
- Domain/request rate limits.
- Maximum response/document size.
- Timeout and bounded retries.
- Dependency pinning and vulnerability audit.
- Sandbox browser/document processing where feasible.
- Never treat crawler success as evidence quality.
- Never silently replace primary-source evidence with scraped secondary commentary.

## Financial evidence priority
For ATLAS investment research, acquisition priority remains:
PRIMARY REGULATORY/CORPORATE SOURCE -> OFFICIAL DATA -> HIGH-QUALITY SECONDARY SOURCE -> OTHER SECONDARY SOURCE.

Scraping convenience never overrides Evidence Architecture.

## Router pseudocode

```text
if input is document:
    MarkItDown -> normalize -> provenance -> evidence gate
elif input is URL:
    Crawl4AI
    if sufficient:
        normalize -> provenance -> evidence gate
    elif reason in {JS_REQUIRED, INTERACTION_REQUIRED, AUTH_REQUIRED_AUTHORIZED}:
        Browser Use -> normalize -> provenance -> evidence gate
    else:
        STOP + record failure
```

## Acceptance criteria for production implementation
- Crawl4AI adapter passes static + JS fixture tests.
- Browser fallback is triggered only by explicit router state.
- MarkItDown adapter handles supported document fixture.
- Every record has provenance and SHA-256 content hash.
- Duplicate content is detected before specialist analysis.
- SSRF/private-network tests fail closed.
- Timeout/retry/rate-limit behavior is tested.
- Existing ATLAS engines remain independent of acquisition vendor APIs.

## Architectural invariant
WEB & DATA INGESTION Ω is an upstream evidence service. It cannot issue investment verdicts, alter portfolio state, bypass Falsifiers Ω, or downgrade the constitutional distinction between FACT, HYPOTHESIS, INTERPRETATION and NOISE.
