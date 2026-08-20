# FIRECRAWL WEB INGESTION ADAPTER Ω

Status: ACTIVE CANON
Date: 2026-08-20

## Purpose

Firecrawl is the public-web discovery/acquisition adapter for ATLAS Ω. It is infrastructure, NOT a source of truth and NOT an investment-decision engine.

## Pipeline

Query/URL(s) -> Firecrawl Adapter Ω -> Evidence Normalizer Ω -> Evidence Director Ω -> FACT/HYPOTHESIS/INTERPRETATION/NOISE -> Evidence Store -> specialist ATLAS engines -> Falsifiers Ω -> Decision.

No Firecrawl output may bypass Evidence Director Ω or Falsifiers Ω.

## Active acquisition and discovery modes

1. Single URL scrape through Firecrawl v2 `/scrape`.
2. Search + optional full-content scrape through Firecrawl v2 `/search` and `scrapeOptions`.
3. Search sources: `web`, `news`, `images`.
4. Search categories: `github`, `research`, `pdf`, `developer`.
5. Domain controls through `includeDomains` OR `excludeDomains`; never both in one request.
6. Location/country controls for geographically scoped discovery.
7. Time filtering through `tbs` where supported by Firecrawl; it MUST NOT be assumed to filter every source type equally.
8. Markdown extraction by default for acquired textual evidence; links and screenshots are optional.
9. Cache-aware acquisition using `maxAge`; freshness is chosen by evidence type.
10. Explicit multi-URL batch through v2 `/batch/scrape` remains an approved adapter capability for evidence sets, even when a deployment exposes it separately from the `/v1/evidence/web/search` route.
11. Structured JSON extraction against an ATLAS schema remains an approved downstream normalization mode.

Search and scrape in one call is preferred when ATLAS needs full content from all discovered results. A two-step search -> rank/filter -> scrape pattern is preferred when only selected results merit extraction cost.

## Search semantics

Search results are discovery candidates, not verified facts. Search rank, description/snippet, highlights, category and result position MUST NOT be interpreted as evidence quality, source authority or investment conviction.

Every result is normalized independently. Provenance MUST remain per-result even when Firecrawl returns grouped results from one request.

A search result without scraped content may be marked `DISCOVERED`; it is not equivalent to verified evidence. When full-content acquisition was requested but content/provenance is missing, the result is `INGESTION_INCOMPLETE`.

Partial acquisition is preserved. One failed result MUST NOT poison valid independent results, and valid results MUST NOT hide failed ones. Aggregate status may therefore be `OK`, `PARTIAL`, `NO_RESULTS` or `INGESTION_INCOMPLETE`.

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
  "evidence_class": "FACT|HYPOTHESIS|INTERPRETATION|NOISE|UNCLASSIFIED",
  "verification": "PENDING",
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

### Gate F0 — Provenance
Reject evidence without recoverable source URL/domain. Discovery without provenance is `INGESTION_INCOMPLETE`.

### Gate F1 — Source classification
Primary sources (regulators, SEC, company IR, official filings and other authoritative first-party evidence) outrank secondary reporting. Firecrawl extraction quality and search rank do not upgrade authority.

### Gate F2 — Temporal validity
Every time-sensitive fact requires publication/period validation. Cached content is forbidden as evidence for intraday/current-state questions unless its timestamp satisfies requested freshness. `tbs` is a discovery filter, not proof of the publication timestamp.

### Gate F3 — Extraction integrity
Markdown/structured parsing is an acquisition aid, not proof. Material figures should be checked against underlying content and, for high-consequence investment decisions, against primary evidence when available.

### Gate F4 — Conflict handling
Conflicting values are preserved as contradictions and routed to Evidence Director Ω. Never silently choose the convenient value.

### Gate F5 — Decision isolation
Firecrawl output cannot directly emit BUY/HOLD/SELL, Quality Ω, Expected Return Ω, Forward Asymmetry Ω, Money Rotation Ω, Clinical Evidence Shock Ω, valuation conclusions or portfolio actions. Specialist engines derive those conclusions only after evidence gates.

### Gate F6 — Search-result isolation
Snippets, descriptions, highlights, positions, categories and result counts are discovery metadata. They cannot by themselves satisfy a factual evidence gate.

## Freshness policy

- `LIVE`: adapter cache ceiling 0 ms; use for current-state acquisition where Firecrawl is appropriate. Firecrawl is not the primary market-price/flow feed.
- `DAILY`: adapter cache ceiling 300,000 ms.
- `QUARTERLY`: adapter cache ceiling 86,400,000 ms.
- `EVERGREEN`: adapter cache ceiling 172,800,000 ms.
- User/requested `maxAge` can tighten these ceilings but cannot loosen them.
- Breaking corporate disclosures: force fresh acquisition or use authoritative live/primary connectors.
- Earnings/filings: cache only when the document itself is immutable and provenance is preserved.
- Evergreen documentation: caching is preferred for efficiency.

## Domain and search policy

- `includeDomains` and `excludeDomains` are mutually exclusive.
- Domain filters accept domains, not arbitrary URLs/paths.
- Prefer primary-domain allowlists when a specialist requires authoritative evidence.
- `research` is a discovery lane for academic/research sources; it does not waive evidence verification.
- `github` and `developer` are discovery lanes for software/code evidence; repository content remains subject to provenance, version and authority checks.
- `pdf` identifies document-format candidates; PDF format itself conveys no authority.
- `images` are discovery objects and require independent verification before visual claims enter Evidence Store.

## Security / compliance

- API key only through environment secret `FIRECRAWL_API_KEY`; never commit it.
- Direct `/scrape` URLs must pass public-network validation; localhost/private/reserved destinations are forbidden.
- Search domain filters reject local/private-style domains and malformed URL-like values.
- Do not scrape authenticated/private sources unless explicitly authorized and compatible with applicable terms and controls.
- Respect robots/site policies, contractual restrictions and data-protection requirements.
- For sensitive acquisition, disable storage/cache where appropriate; zero-data-retention is optional subject to account capability.
- Never use anti-bot capability as authorization to defeat access controls.

## Adapter interface

```python
class FirecrawlWebIngestionAdapter:
    def scrape(self, url, *, formats, freshness_policy, schema=None): ...
    def search(self, query, *, sources, categories, domains, location, time_filter, scrape_options=None): ...
    def batch_scrape(self, urls, *, formats, freshness_policy, schema=None): ...
    def normalize(self, firecrawl_response): ...
    def validate_provenance(self, evidence): ...
    def route_to_evidence_director(self, evidence): ...
```

Implementation must use the current Firecrawl v2 contract rather than hard-coding assumptions from email/social-media examples.

## Failure semantics

429/rate-limit, timeout, extraction failure, blocked page, malformed JSON, stale cache, missing provenance or contradictory evidence => `INGESTION_INCOMPLETE` at the affected evidence-object level, never fabricated completion.

`PARTIAL`, `NO_RESULTS` and `INGESTION_INCOMPLETE` are valid ATLAS outcomes and cannot be converted into positive evidence.

## Canonical rule

> Firecrawl makes public-web evidence easier to discover, acquire and normalize. It does not make the evidence true.

Evidence authority, freshness, contradiction resolution and investment inference remain responsibilities of ATLAS Ω.
