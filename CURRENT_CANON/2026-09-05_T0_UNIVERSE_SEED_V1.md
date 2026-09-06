# ATLAS Ω — T0 Universe Seed v1

Date: 2026-09-05
Status: ACTIVE_CANONICAL
Issue: #130
Authority: discovery-universe construction only. Direct score contribution = 0. No BUY/SELL, no portfolio membership, no sizing, no timing.

## 2026-09-06 user-ratified universe semantics

Canonical authority record: `CURRENT_CANON/2026-09-06_ATLAS_UNIVERSE_AUTHORITY.md`.

The 650 user-supplied rows are now explicitly the **ATLAS CORE SCREENING UNIVERSE**. The prospective expansion described below remains an `EXTERNAL_CHALLENGER / DISCOVERY EXTENSION`; it does not silently mutate the user-ratified core set. Core version: `ATLAS_CORE_650_RAW_490_UNIQUE_487_ENTITY_2026-09-06`.

## Input

User supplied 650 listed rows assembled from Nasdaq-100 plus an expanded/adjusted S&P-500 list. That raw list is preserved verbatim as ticker rows in:

`data/t0-universe-user-seed-2026-09-05.txt`

The raw index-derived list is a user-ratified core screening universe, not a source of scoring merit. Index membership has zero discovery merit and zero score authority.

## Economic-entity deduplication

Before any company analysis:
- exact ticker duplicates collapse;
- multiple share classes of the same economic company collapse to a single economic entity for portfolio selection;
- canonical alias examples: GOOG/GOOGL -> GOOGL, FOX/FOXA -> FOXA, NWS/NWSA -> NWSA, BRK.A/BRK.B -> BRK.B;
- raw occurrence counts and aliases remain auditable.

Current deterministic counts for the supplied 650 rows:
- 650 raw occurrences;
- 490 unique ticker symbols after exact-ticker deduplication;
- 487 canonical economic entities after the current GOOG/GOOGL, FOX/FOXA and NWS/NWSA collapses.

Canonical normalized file: `data/atlas-core-universe-economic-entities-2026-09-06.txt`.

This prevents a company from receiving multiple discovery chances simply because it appears in more than one index block or has multiple listed share classes.

## Prospective T0 expansion

The core index universe may be supplemented prospectively for **challenger discovery**, without changing core-universe membership. The first expansion file is:

`data/t0-universe-prospective-expansion-2026-09-05.csv`

It contains 50 discovery candidates from broad, factor, current-index-cross-section and ATLAS challenger sources, deliberately including sub-$10B names and names outside the original Nasdaq/S&P ordering.

These rows are tagged conceptually as `EXTERNAL_CHALLENGER` until evaluated. No candidate receives score for appearing in any screen. A source only establishes discovery provenance.

## Auditable first tranche

The first 10 prospective rows are ordered before scoring and then assigned market-cap buckets after rank freeze. Two verified rows are supplied for each canonical T0 v1.1 bucket:

- LT_1B
- 1B_10B
- 10B_100B
- 100B_1T
- GT_1T

The first-tranche mega share is exactly 20%, equal to but not above the canonical challenger limit. Bucket quotas are discovery coverage only and never change subsequent company scores.

## Current-source basis for the first expansion

Fresh public evidence used for discovery/bucket validation included, among others:
- S&P SmallCap 600 Quality FCF Aristocrats: 79 constituents as of Aug-2026; positive FCF for at least seven consecutive years plus high FCF margin and FCF ROIC criteria; market-cap range approximately $0.67B-$12.17B.
- S&P SmallCap 600 Quality: high-quality small-cap cross-section based on ROE, accruals and leverage.
- S&P MidCap 400 current constituents and value/equal-weight cross-sections.
- AAII Price-to-Free-Cash-Flow screen dated 2026-09-03.
- FinanceCharts current small-cap ROIC/value screens dated 2026-09-01/02.
- Current broad market-cap sources dated 2026-09-03/04 for bucket verification.

These sources are discovery evidence only. They do not create an ATLAS score and do not bypass Fundamental Hard Gates, Expected Return, Financing Quality, Γ, scenario mapping or Endogenous Portfolio Engine v2.

## Critical rules

1. `USER_INDEX_CORE` cannot authorize downstream scoring by itself.
2. The user-ratified core universe is fixed by version; off-index discovery remains separately versioned challenger provenance.
3. Market cap is assigned after candidate discovery rank is frozen.
4. Market cap, index membership, analyst coverage, fame and data convenience contribute exactly zero points.
5. A megacap may ultimately rank first if economic evidence wins after T0.
6. Unknown later-row market caps remain UNKNOWN; they are never silently inferred.
7. The 50-row expansion is the first prospective challenger tranche, not a claim that discovery is globally complete.
8. Portfolio selection remains downstream: T0 constructs who is allowed to compete, not who wins.
9. A Decision Frame must record both the core-universe version and any external-challenger set used.

## Pipeline

`RAW USER CORE 650 -> ECONOMIC ENTITY DEDUP -> CORE 487 -> optional EXTERNAL CHALLENGER DISCOVERY -> T0 AUDIT -> downstream evidence/Hard Gates -> Endogenous Portfolio Engine v2`

## Implementation

- `CURRENT_CANON/2026-09-06_ATLAS_UNIVERSE_AUTHORITY.md`
- `src/atlas/algorithm/t0-universe-seed-builder.ts`
- `src/atlas/algorithm/t0-universe-seed-builder.test.ts`
- `.github/workflows/t0-universe-seed-ci.yml`
- `data/t0-universe-user-seed-2026-09-05.txt`
- `data/atlas-core-universe-economic-entities-2026-09-06.txt`
- `data/t0-universe-prospective-expansion-2026-09-05.csv`

## Boundary

This stage does not score INTU, NVDA, REGN, PWR, FIX, MLI or any other candidate. Every economic entity remains at Point Zero until T0 passes. The next stage is evidence enrichment and Hard-Gate filtering across the clean universe.
