# ATLAS Ω — UNIVERSE 650 AUTHORITY Ω v1.0

**Date:** 2026-09-06  
**Status:** CANONICAL  
**Scope:** ATLAS MAIN discovery/portfolio universe authority

## Canonical declaration

The user-supplied 650-row registry is the authoritative ATLAS base universe for MAIN portfolio research and reconciliation.

Raw source file already preserved verbatim:

`data/t0-universe-user-seed-2026-09-05.txt`

Source blocks:

- Nasdaq-100 block: 100 rows.
- Expanded/adjusted S&P-500 blocks: 550 rows.
- Total raw rows: 650.

The raw list intentionally contains duplicate tickers, duplicate economic entities and multiple share classes because provenance must be preserved.

## Deterministic cleaning law

Before any scoring or portfolio optimization, ATLAS must derive a deterministic clean universe from the 650 raw rows:

`RAW_650 -> NORMALIZE_TICKER -> EXACT_DUPLICATE_COLLAPSE -> ECONOMIC_ENTITY_COLLAPSE -> CANONICAL_SECURITY_ID -> CLEAN_UNIVERSE`

Rules:

1. Exact duplicate ticker rows collapse to one candidate.
2. Multiple share classes of the same economic company collapse to one economic entity for portfolio selection unless a later explicit execution rule requires a specific listing.
3. Alias choice must be deterministic and versioned. Existing examples remain: `GOOG/GOOGL -> GOOGL`, `FOX/FOXA -> FOXA`, `NWS/NWSA -> NWSA`, `BRK.A/BRK.B -> BRK.B`.
4. Raw occurrence count and source provenance remain auditable and never create score.
5. Index membership, fame, market cap, analyst coverage and source frequency contribute exactly zero points.
6. Every clean candidate starts at Point Zero and must pass the same eligibility, evidence, hard-gate, Expected Return, risk, fragility, scenario and portfolio-marginal tests.

## Universe authority

For the current ATLAS MAIN reconciliation run:

- `UNIVERSE_ID = ATLAS_RAW_650_2026-09-06`
- Source authority = user-supplied 650-row registry.
- No off-universe security may enter the MAIN optimization merely because it appeared in a screen, 13F, newsletter, model output or narrative suggestion.
- A new off-universe security requires an explicit future universe-amendment record before it can compete.
- Capital Intelligence, ARRM, Strategy Factory, institutional holdings and other discovery modules may flag research candidates but cannot silently mutate this universe.

This rule eliminates narrative universe drift and is subordinate only to an explicit later canonical universe amendment.

## Portfolio firewall

Universe membership grants **eligibility to compete only**.

It grants no:

- BUY authority,
- score bonus,
- portfolio membership,
- sector/geography quota,
- target weight,
- entry timing.

Portfolio construction remains governed by `PORTFOLIO > TICKER` and MAX RETURN / LOW VOL.

Risk law:

`RISK = 0.40 * PERMANENT_LOSS + 0.20 * TAIL_RISK + 0.40 * VOLATILITY`

The deterministic reconciliation/portfolio engine must use the same cleaned universe snapshot and identical point-in-time inputs for every candidate.

## TEST vs PORTFOLIO

The same universe may feed both modes, but outputs cannot cross-authorize:

- `TEST`: may impose fixed N/equal weights to isolate selection behavior.
- `PORTFOLIO`: N and weights are determined by the portfolio objective and implementation.

`TEST_OUTPUT != PORTFOLIO_OUTPUT`

## Relationship to previous T0 seed canon

`CURRENT_CANON/2026-09-05_T0_UNIVERSE_SEED_V1.md` remains valid for its historical design rationale and raw provenance, but its prospective expansion is not part of the current MAIN universe unless separately promoted by an explicit universe amendment.

The authoritative current MAIN base is the 650-row registry supplied by the user and stored in `data/t0-universe-user-seed-2026-09-05.txt`.

## Reproducibility contract

Every canonical MAIN portfolio run must emit:

- `UNIVERSE_ID = ATLAS_RAW_650_2026-09-06`
- raw row count = 650,
- clean economic-entity count after deterministic dedup,
- alias map version,
- snapshot timestamp,
- missing-data exclusions with reasons,
- eligibility rejects with reasons,
- final marginal ranking.

Same raw universe + same cleaning rules + same snapshot + same canon must produce the same clean candidate set.
