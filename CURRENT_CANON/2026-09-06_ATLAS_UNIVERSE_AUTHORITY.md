# ATLAS Ω — UNIVERSE AUTHORITY

**Date:** 2026-09-06  
**Status:** ACTIVE_CANONICAL / USER_RATIFIED  
**Authority:** discovery universe / screening membership only  
**Direct company-score contribution:** `0`  
**Portfolio authority:** `NONE`

## User ratification
The user-supplied consolidation of **650 listed rows** — Nasdaq-100 block plus expanded/adjusted S&P-500 block — is the **ATLAS CORE SCREENING UNIVERSE**.

Raw source of truth:

`data/t0-universe-user-seed-2026-09-05.txt`

That file preserves all 650 supplied ticker occurrences, including intentional duplicates and repeated adjusted-list entries, so the original input remains auditable.

## Deterministic normalization
From the 650 raw rows:

- **650 raw ticker occurrences** are preserved;
- **490 unique ticker symbols** remain after exact-ticker deduplication;
- **487 canonical economic entities** remain after the current share-class alias collapse:
  - `GOOG -> GOOGL`
  - `FOX -> FOXA`
  - `NWS -> NWSA`

Canonical normalized entity file:

`data/atlas-core-universe-economic-entities-2026-09-06.txt`

These counts are descriptive/audit fields only. A duplicate occurrence never creates a second chance, extra score, extra weight or extra portfolio slot.

## Universe semantics
`ATLAS CORE SCREENING UNIVERSE` answers only:

> Which user-ratified companies are admitted to the default ATLAS competition set?

It does **not** answer:
- which companies score highest;
- how many positions the portfolio should contain;
- which sectors/geographies should be represented;
- which security should receive capital;
- whether a company should be bought now.

All entities still start from Point Zero and must pass the same downstream evidence, quality, expected-return, valuation, risk, financing, Falsifier and Competition for Capital gates.

## Relationship to the MAX RETURN / LOW VOL law
The universe does not impose diversification or cardinality. The portfolio remains governed by:

`CURRENT_CANON/2026-09-06_MAX_RETURN_LOW_VOL_PORTFOLIO_LAW.md`

Therefore:
- 487 eligible economic entities do not imply 487 holdings;
- no sector quota exists;
- no geographic quota exists;
- no minimum number of holdings is created by the universe;
- the Endogenous Portfolio Engine may select any cardinality permitted by its own canonical search constraints if the whole-portfolio return/risk utility wins.

## External / global challengers
The 650-row user-ratified set is the **core screening universe**, not a ban on explicit external challengers.

Off-universe/global candidates may still enter the research pipeline only through explicit provenance such as:
- prospective T0 discovery;
- user nomination;
- Capital Intelligence Ω;
- Trader Intelligence Ω;
- institutional/capital-flow discovery;
- global/off-index research screens.

They are tagged `EXTERNAL_CHALLENGER` until explicitly evaluated. External provenance adds **0 score**. A challenger may enter the portfolio only by beating incumbents under the same economic and portfolio gates.

This preserves current legitimate global candidates such as non-US listings without silently redefining the user-ratified 650-row core universe.

## No silent universe mutation
Any future addition/removal from the **core** universe requires a versioned Universe Decision Record containing:
- ticker/entity;
- reason;
- source/provenance;
- effective date;
- old universe version;
- new universe version.

A conversation output, screen result or famous-manager holding cannot silently mutate the core universe.

## Reproducibility contract
For deterministic portfolio work, every Decision Frame must record:

`UNIVERSE_VERSION = ATLAS_CORE_650_RAW_490_UNIQUE_487_ENTITY_2026-09-06`

and, where external challengers are included:

`EXTERNAL_CHALLENGER_SET = <versioned list>`

Two runs claiming the same Decision Frame may not use different universes.

## Relationship to T0 Universe Seed v1
`CURRENT_CANON/2026-09-05_T0_UNIVERSE_SEED_V1.md` remains the normalization/discovery method.

This 2026-09-06 authority record clarifies terminology:
- the **650 supplied rows are the user-ratified ATLAS CORE SCREENING UNIVERSE**;
- T0 prospective expansion is an **external challenger/discovery extension**, not a silent rewrite of the 650-row core set;
- all scoring remains downstream and identity/index membership contributes zero points.

## Canonical identity
`ATLAS_UNIVERSE_VERSION = ATLAS_CORE_650_RAW_490_UNIQUE_487_ENTITY_2026-09-06`
