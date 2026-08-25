# FIRECRAWL RESEARCH MODES CALIBRATION Ω

**Status:** ACTIVE · CANONICAL  
**Effective:** 2026-08-23  
**Implementation:** `api/firecrawl_ingestion.py`

## Verified Firecrawl capabilities

Official Firecrawl documentation was rechecked on 2026-08-23 before implementation.

Supported ATLAS acquisition modes now include:
- `/scrape` — deterministic acquisition of a known public URL;
- `/search` — discovery plus optional content acquisition;
- `/map` — fast discovery of URLs within a site, optionally topic-filtered;
- `/crawl` — bounded recursive site acquisition with async job polling;
- `/extract` — structured extraction from one or more known URLs/domains;
- `/agent` — autonomous web research when URLs are unknown or navigation must be delegated;
- Change Tracking — snapshot comparison through scrape/crawl using basic, `git-diff` or schema-driven `json` modes.

## Canonical tool-selection law

`KNOWN PRIMARY URL -> SCRAPE/JSON FIRST`

`KNOWN SITE, UNKNOWN RELEVANT PATHS -> MAP -> TARGETED SCRAPE`

`KNOWN SITE, MANY RELEVANT PAGES -> BOUNDED CRAWL`

`KNOWN URL SET, STRUCTURED FIELDS -> EXTRACT`

`UNKNOWN URLS / AUTONOMOUS MULTI-SOURCE RESEARCH -> AGENT`

`REPEATED MONITORING OF THE SAME PAGE -> CHANGE TRACKING`

Agent is not the default extractor. Firecrawl identifies Agent as a research-preview tool suited to cases where URLs are unknown or autonomous navigation is required. Known URLs should prefer deterministic scrape/JSON because they are cheaper, easier to reproduce and easier to audit.

## Cost and scope controls

ATLAS overrides Firecrawl's broad defaults with conservative limits:
- Map default: 250 URLs; hard API-adapter maximum: 5,000.
- Crawl default: 50 pages; hard ATLAS adapter maximum: 250 pages.
- Crawl default discovery depth: 3; maximum: 10.
- External-link crawling is disabled in the ATLAS adapter.
- Crawl subdomains and whole-domain traversal are opt-in.
- Agent defaults to `spark-1-mini`, 40 credits; hard adapter maximum: 100 credits.
- Extract accepts at most 20 explicit URL inputs per request.
- `enableWebSearch` on Extract is disabled by default.

These are ATLAS safety/cost bounds, not Firecrawl platform maxima.

## Change Tracking policy

Change Tracking is preferred for recurring investor-relations, guidance, pricing, capacity, product, filing-index and documentation pages where the same URL is revisited.

Modes:
- `basic`: classify `new/same/changed/removed`;
- `git-diff`: line-level content change, default preferred mode for narrative disclosures;
- `json`: field-level comparison for a declared schema, used only when the tracked fields are stable and well-defined.

Change Tracking output is a **trigger for re-audit**, not proof that a thesis changed materially.

`PAGE CHANGED != FUNDAMENTAL CHANGE != THESIS CHANGE`

## Evidence isolation

Every Firecrawl result remains:

`verification = PENDING`

until Evidence Director Ω verifies:
- source authority;
- primary listing/entity identity when relevant;
- publication/reporting period;
- units and currency;
- freshness;
- contradictions;
- extraction fidelity.

Search rank, Map relevance, Agent reasoning, extracted JSON and diffs carry zero direct investment score.

## Security

- All explicit URL inputs pass public-network validation.
- Localhost, private and reserved-network destinations are rejected.
- Firecrawl API key remains environment-only.
- Async job IDs are format-validated before polling.
- Crawl external links remain disabled by default and in the active adapter body.
- 402 credit exhaustion, 429 rate limits, expired jobs, malformed provider JSON and transport failures remain fail-closed ingestion outcomes.

## Investment-research production pipeline

`MAP/SEARCH -> PRIMARY-SOURCE FILTER -> SCRAPE/CRAWL -> EXTRACT WHEN NEEDED -> EVIDENCE NORMALIZATION -> INTEGRITY -> ATLAS ENGINES -> CHANGE TRACKING -> MATERIALITY GATE -> RE-AUDIT`

Agent may enter before primary-source filtering only when the relevant URLs are unknown. Any material Agent finding must be grounded back to recoverable source URLs before it can become evidence.

## Canonical invariants

`FIRECRAWL OUTPUT != VERIFIED EVIDENCE`

`AGENT OUTPUT != FACT`

`MAP RESULT != SOURCE AUTHORITY`

`CHANGE DIFF != MATERIALITY`

`EXTRACTED JSON != ACCOUNTING TRUTH`

`FIRECRAWL NEVER EMITS BUY/HOLD/SELL OR ATLAS SCORE`
