# ATLAS Ω — Real-Time Useful Intelligence Ω

Status: ACTIVE CANON
Date: 2026-08-20
Branch: main

## Objective
ATLAS does not compete for absolute market-data latency. It optimizes **time-to-actionable-knowledge**: detect material evidence within seconds/minutes, normalize it, verify provenance, run Evidence Ω, then Wave Detection Ω, and alert only on high-value events.

## Source hierarchy
1. PRIMARY: SEC EDGAR submissions/APIs, SEC RSS, issuer Investor Relations RSS/feeds, regulators.
2. LICENSED: Finnhub, Polygon, Benzinga, Alpha Vantage or equivalent when credentials/budget are configured.
3. SECONDARY: discovery only. It cannot independently satisfy an Evidence Gate.

Institutional millisecond feeds (Bloomberg/LSEG/ICE/Nasdaq direct feeds/consolidated tapes) are optional future infrastructure, not required for the current medium/long-term mandate.

## Pipeline
Source event -> ingestion -> deduplication -> typed EvidenceEvent -> provenance/evidence gate -> classification -> Evidence Ω -> specialist engines -> Wave Detection Ω -> alert threshold -> Atlas Diario/UI/notification.

Target useful-latency budget for a material issuer event:
- detection: <= 30s when source transport supports it
- parse/normalize: <= 30s
- Evidence Ω + specialists: <= 30s
- Wave score + publication: <= 30s

These are engineering SLO targets, not guarantees; provider/source latency remains observable.

## Event coverage
Earnings; guidance; M&A; insider transactions; dividends; repurchases; material contracts; regulatory events; 8-K/10-Q/10-K/XBRL and other material filings.

## Governance gates
- AI IS NEVER EVIDENCE.
- Every event requires traceable source URL + source/raw identifier + timestamps.
- Primary evidence has precedence over secondary reports.
- Duplicate reports do not increase confidence.
- No Wave alert without traceable evidence and >=1 PRIMARY evidence item.
- All downstream AI assertions must reference evidence IDs.
- Falsifiers Ω retains veto authority.
- Event trade, investment thesis and portfolio execution remain separate decisions.

## Wave Detection Ω
Inputs 0-100: fundamentals, analyst revisions, momentum, material news, evidence quality, and risk penalty. Default alert threshold: 80/100. The threshold is configurable and intended to suppress noise so that thousands of raw events can collapse into a small number of actionable alerts.

## Scale target
100+ sources; 500+ companies; thousands of raw events/day; ideally only 2-3 high-signal alerts/day.

## Isolation / UI safety
This implementation is backend-only and additive. **No screener files, screener routes, frontend components, menus, styling or today's UI work are modified.**

## Implemented modules
- `api/realtime_evidence_ingestion.py`: provider-neutral typed ingestion, provenance, event classification and deduplication.
- `api/wave_detection_omega.py`: Wave Score, primary-evidence gate and alert decision.

## Still requires external configuration
Actual continuous SEC/IR/provider network listeners require deployment/runtime credentials, source endpoints and scheduling/stream infrastructure. Their absence must never be represented as real-time coverage. This canon establishes the production contract and scoring path without pretending a feed is connected when it is not.
