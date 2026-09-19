# ATLAS Intelligence Ingestion Ω v1.0

Status: PROPOSED CANONICAL MODULE
Date: 2026-09-06
Scope: Bloomberg, Reuters, Investing.com, AInvest and future financial-information sources

## Purpose

Create a source-agnostic intelligence ingestion layer for ATLAS Ω using only the existing operating stack: ChatGPT + GitHub + Notion.

The module converts user-supplied articles, newsletters, links, excerpts and reports into structured evidence that can be evaluated by ATLAS engines without granting authority to the publisher itself.

## Governing law

SOURCE != SIGNAL != DECISION

A source can contribute evidence. It cannot receive score, ranking preference or portfolio authority because of brand, prestige, popularity or repetition.

All entities remain subject to Point Zero / Capital-Blind selection rules.

## Supported sources v1

- Bloomberg
- Reuters
- Investing.com
- AInvest
- Extensible adapter interface for future sources

## Operating architecture

SOURCE CONTENT
  -> ChatGPT extraction / normalization
  -> provenance capture
  -> entity + ticker resolution
  -> event extraction
  -> evidence de-duplication
  -> economic significance assessment
  -> ATLAS engine routing
  -> GitHub canonical record
  -> Notion human-readable knowledge layer

No external database, scraping daemon, cloud server, FinBERT service, Supabase, AWS or additional infrastructure is required.

## Required evidence schema

Each processed item should resolve to the following normalized fields where available:

- source_name
- source_type: original_reporting | wire | aggregation | opinion | analysis | filing | company_statement
- source_url
- author
- published_at
- captured_at
- headline
- entities
- tickers
- geography
- event_type
- event_summary
- raw_fact_claims
- primary_source_references
- source_independence_group
- novelty
- direction
- magnitude
- confidence
- time_horizon
- economic_channels
- atlas_engine_routes
- contradiction_flags
- duplicate_cluster_id
- evidence_fingerprint

## Event taxonomy v1

- capex
- backlog
- order
- pricing
- financing
- supply_constraint
- capacity_expansion
- M&A
- regulation
- guidance
- hyperscaler_spending
- demand_acceleration
- demand_deceleration
- margin_change
- customer_concentration
- competitive_shift
- management_change
- capital_allocation
- strategic_partnership
- production_ramp
- delay
- cancellation
- litigation
- balance_sheet

## ATLAS engine routing

Evidence may route to one or more engines, including:

- Economic-Proof Chain Ω
- Pre-Consensus Ω
- Expectation Gap Ω
- Capital Intelligence Ω
- AI Value Migration Ω
- AI Capital Formation Ω
- AI Compute Price Ω
- Macro Risk Gate Ω
- Tape / RS Score Ω only when price/tape evidence is explicitly present

Routing does not imply score impact. Each downstream engine applies its own canonical rules.

## De-duplication law

Four articles are not four independent evidences if they derive from the same underlying fact or source.

Rules:

1. Syndicated Reuters text reproduced by another outlet belongs to the same evidence cluster.
2. Aggregators repeating Bloomberg or Reuters do not create independent confirmation.
3. Company press release + independent reporting can be separate evidence, but must be tagged as related.
4. Two genuinely independent reporters confirming the same fact may increase confidence, not magnitude by default.
5. Repetition frequency is never used as a substitute for Economic-Proof.

## Source treatment

### Bloomberg
Use as high-value reporting and context source. Bloomberg brand itself confers zero score.

### Reuters
Prefer wire facts, timestamps and direct attribution. Reuters text republished elsewhere remains one provenance chain.

### Investing.com
Treat as either original article, market commentary or aggregator depending on article-level provenance.

### AInvest
Treat as original analysis, automated/aggregated content or derivative reporting depending on provenance. Never assume independence without source tracing.

## Human-in-the-loop ingestion

The user may provide any of:

- full article text
- newsletter text
- article URL
- screenshots
- copied excerpts
- forwarded email content

ChatGPT performs extraction and normalization. The normalized result is then written to GitHub/Notion when requested.

## Evidence-quality rules

Evidence quality is assessed from:

- directness
- source independence
- primary-source proximity
- specificity
- timestamp quality
- quantitative content
- falsifiability
- consistency with prior evidence
- contradiction state
- recency relative to thesis horizon

Publisher prestige is excluded from the score.

## Canonical firewall

This module MUST NOT:

- alter portfolio ranking directly
- add points because a ticker appears in Bloomberg/Reuters/etc.
- favor megacaps because they receive more coverage
- count copied stories multiple times
- replace Point Zero
- replace Capital-Blind Portfolio Selection Ω
- override Hard Gates
- infer source consensus from article count alone

## Recommended GitHub record path

research/intelligence/records/YYYY-MM-DD/<ticker-or-theme>/<slug>.md

Each record should contain:

1. normalized metadata
2. extracted atomic facts
3. provenance chain
4. duplicate cluster
5. contradictions
6. mapped ATLAS engines
7. preliminary evidence assessment
8. unresolved questions

## Notion role

Notion is the readable knowledge layer, not the scoring authority.

Recommended properties:

- Title
- Source
- Date
- Tickers
- Event Type
- Evidence Quality
- Novelty
- Direction
- Confidence
- ATLAS Engines
- Duplicate Cluster
- Contradictions
- GitHub Canonical Path

## Acceptance criteria

ATLAS Intelligence Ingestion Ω v1.0 is valid when:

- the same fact copied across outlets resolves to one evidence cluster
- source brand does not affect ranking
- provenance is preserved
- evidence can route to multiple engines
- contradictory evidence is retained rather than overwritten
- GitHub remains the canonical machine-readable source
- Notion remains the human-readable knowledge layer
- the workflow requires only ChatGPT + GitHub + Notion
