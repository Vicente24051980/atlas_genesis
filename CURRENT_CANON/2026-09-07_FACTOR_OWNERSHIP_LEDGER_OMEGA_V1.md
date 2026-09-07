# FACTOR OWNERSHIP LEDGER Ω v1.0

**Date:** `2026-09-07`  
**Status:** `ACTIVE_E2_BOUNDARY / CALLSITE_AUDIT_REQUIRED`  
**Canonical engine:** `E2 ASSESSMENT Ω`  
**Creates new engine:** `NO`

## 1. Problem

The ASTRA master audit identified a structural double-counting risk: several specialized modules can observe the same economic fact (for example backlog, FCF, ROIC or valuation) and accidentally turn corroboration into multiple independent points.

The governing rule is:

`MULTIPLE EVIDENCE -> CONFIDENCE`

not:

`MULTIPLE ENGINES -> MULTIPLE POINTS`

## 2. Executable boundary

Source:

`src/atlas/algorithm/factor-ownership-ledger-omega.ts`

Tests:

`src/atlas/algorithm/factor-ownership-ledger-omega.test.ts`

Architecture binding:

`src/atlas/algorithm/atlas-architecture-consolidation-omega.test.ts`

Every registered economic factor has one explicit `E2_SLOT:*` scoring owner. Specialized engines, research programs, external cross-checks and shadow signals are evidence contributors only unless they are routed through that factor's owner slot.

`assertSingleOwnerFactorScoring()` rejects:

- a direct score claim made by a non-owner;
- a second direct score claim for the same factor;
- non-finite factor scores.

`uniqueEvidenceIdsForConfidence()` deduplicates corroborating evidence for confidence handling without creating another score.

## 3. Initial mandatory factor coverage

The v1 ledger registers the core score/risk factors surfaced by the current selection pipeline and the master audit, including:

- business quality;
- growth and earnings revisions;
- per-share economics;
- valuation and 3–6y expected return;
- FCF, margins, ROIC and balance sheet;
- moat durability and disruption risk;
- customer concentration;
- backlog;
- capex bottleneck;
- momentum;
- macro, regulatory, geopolitical, financing and credit risk;
- AI value capture;
- AI capital-formation quality.

## 4. Shadow rule

Shadow signals retain `directScoreWeight = 0` until promotion through independent evidence and out-of-sample validation. Being named as an `evidenceContributor` does not confer score authority.

## 5. What this does NOT prove

This change does **not** prove that every historical scoring callsite has already been migrated through the ledger. Therefore the status is not `DOUBLE_COUNTING_ELIMINATED`.

Required next empirical step:

1. enumerate all current score-producing callsites;
2. map each emitted score to one ledger factor;
3. fail CI on unmapped factor score emissions;
4. demonstrate that a repeated fact from two modules changes confidence/evidence density but not aggregate factor score twice.

Until that callsite audit is complete, the honest status remains:

`ACTIVE_E2_BOUNDARY / CALLSITE_AUDIT_REQUIRED`.
