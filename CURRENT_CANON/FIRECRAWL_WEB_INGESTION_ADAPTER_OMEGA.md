# FIRECRAWL WEB INGESTION ADAPTER Ω

Status: ACTIVE CANON
Date: 2026-08-19

## Purpose

Add Firecrawl as an acquisition/normalization adapter for public web evidence used by ATLAS Ω. Firecrawl is infrastructure, NOT a source of truth and NOT an investment-decision engine.

## Pipeline

URL(s) -> Firecrawl Adapter Ω -> Evidence Normalizer Ω -> Evidence Director Ω -> FACT/HYPOTHESIS/INTERPRETATION/NOISE -> Evidence Store -> specialist ATLAS engines -> Falsifiers Ω -> Decision.

No Firecrawl output may bypass Evidence Director Ω or Falsifiers Ω.

## Supported acquisition modes

1. Single URL scrape through Firecrawl v2 `/scrape`.
2. Explicit multi-URL batch through v2 `/batch/scrape`.
3. Markdown output for LLM-readable evidence.
4. Structured JSON extraction against an ATLAS schema.
5. Screenshot acquisition when visual evidence is materially useful.
6. Cache-aware retrieval using `maxAge`; freshness must be chosen by evidence type rather than accepted blindly.

## ATLAS Structured Evidence Schema

Minimum normalized record:

```json
{
  "ticker": null,
  "company": null,
  "source_url": "",
  "source_domain": "",
  "source_title": "",
  "source_type": "PRIMARY|SECONDARY|UNKNOWN",
  "publication_date": null,
  "retrieved_at": "",
  "freshness_class": "LIVE|DAILY|QUARTERLY|EVERGREEN",
  "evidence_class": "FACT|HYPOTHESIS|INTERPRETATION|NOISE",
  "metric": null,
  "period": null,
  "value": null,
  "unit": null,
  "currency": null,
  "yoy_change": null,
  "qoq_change": null,
  "guidance": null,
  "markdown_excerpt": null,
  "confidence": 0.0,
  "firecrawl_metadata": {}
}
```

Financial extraction may additionally populate revenue, EPS, CFO, FCF, CAPEX, margins, guidance, backlog, customer concentration, share count/dilution and other engine-specific fields, but absent values MUST remain null. Never infer a missing reported number merely to complete the schema.

## Evidence gates

### Gate F0 — URL provenance
Reject evidence without recoverable source URL/domain.

### Gate F1 — Source classification
Primary sources (SEC/regulator/company IR/official filings) outrank secondary reporting. Firecrawl extraction quality does not upgrade source authority.

### Gate F2 — Temporal validity
Every time-sensitive fact requires a publication/period check. Cached content is forbidden as evidence for intraday/current-state questions unless its timestamp satisfies the requested freshness.

### Gate F3 — Extraction integrity
Structured JSON is a parsing aid, not proof. Material figures should be cross-checked against the underlying markdown/page and, for high-consequence investment decisions, against primary evidence when available.

### Gate F4 — Conflict handling
Conflicting values are preserved as contradictions and routed to Evidence Director Ω. Do not silently choose the convenient value.

### Gate F5 — Decision isolation
Firecrawl output cannot directly emit BUY/HOLD/SELL, Quality Ω, Expected Return Ω, Forward Asymmetry Ω, Money Rotation Ω or valuation conclusions. Specialist engines must derive those conclusions.

## Freshness policy

- Intraday market/flow evidence: do not rely on ordinary cached scrape as the primary real-time feed.
- Breaking corporate disclosures: force fresh acquisition or use authoritative live/primary source connectors.
- Earnings/filings: cache only when the filing itself is immutable and provenance is preserved.
- Evergreen documentation: cache is preferred for efficiency.

Firecrawl v2 currently supports `maxAge` caching; its documented default is two days, so ATLAS MUST override/default consciously for time-sensitive evidence.

## Batch policy

Batch scrape is appropriate for explicit evidence sets such as multiple IR pages, filings or supplier/customer pages. Batch convenience must not collapse provenance: every returned document remains an independent evidence object with its own URL, timestamp, authority and confidence.

## Security / compliance

- API key only through environment secret `FIRECRAWL_API_KEY`; never commit it.
- Do not scrape authenticated/private sources unless explicitly authorized and compatible with applicable terms and controls.
- Respect robots/site policies, contractual restrictions and data-protection requirements.
- For sensitive acquisition, disable storage/cache where appropriate; zero-data-retention is an optional Firecrawl capability subject to account availability.
- Never use anti-bot capability as authorization to defeat access controls.

## Adapter interface (reference)

```python
class FirecrawlWebIngestionAdapter:
    def scrape(self, url, *, formats, freshness_policy, schema=None): ...
    def batch_scrape(self, urls, *, formats, freshness_policy, schema=None): ...
    def normalize(self, firecrawl_response): ...
    def validate_provenance(self, evidence): ...
    def route_to_evidence_director(self, evidence): ...
```

Implementation must use the current Firecrawl v2 contract rather than hard-coding assumptions from social-media examples.

## Failure semantics

429/rate-limit, timeout, extraction failure, blocked page, malformed JSON, stale cache, missing provenance or contradictory evidence => `INGESTION_INCOMPLETE`, never fabricated completion.

`INGESTION_INCOMPLETE` is a valid ATLAS outcome and cannot be converted into positive evidence.

## Canonical rule

> Firecrawl makes web evidence easier to acquire and normalize. It does not make the evidence true.

Evidence authority, freshness, contradiction resolution and investment inference remain responsibilities of ATLAS Ω.
