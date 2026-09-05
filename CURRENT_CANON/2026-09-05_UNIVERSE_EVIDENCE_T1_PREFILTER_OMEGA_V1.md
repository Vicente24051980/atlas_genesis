# ATLAS Ω — Universe Evidence Ladder + T1 Hard-Gate Prefilter v1

Date: 2026-09-05  
Status: ACTIVE_CANONICAL once merged  
Issue: #132  
Direct Structural ATLAS contribution: 0  
Authority: evidence sufficiency + hard-gate routing only. No BUY/SELL, portfolio membership, sizing or timing.

## Position in pipeline

`T0 CLEAN UNIVERSE -> T1 EVIDENCE LADDER / HARD-GATE PREFILTER -> downstream fundamental analysis -> Expected Return / Financing Quality / Circular Demand -> Endogenous Portfolio Engine v2`

T1 consumes the T0-clean economic-entity universe. It does not rank it.

## Evidence Ladder

Every required field carries one of:

- `VERIFIED_PRIMARY`
- `VERIFIED_SECONDARY`
- `PROXY`
- `MISSING`

`PROXY` and `MISSING` cannot create a hard fail and cannot create a pass. They produce `EVIDENCE_PENDING`.

## Fundamental hard-gate preconditions

Before a company is allowed to receive a downstream fundamental score, T1 requires decision-grade evidence on:

1. economic-entity identity;
2. going-concern / solvency safety;
3. positive economic throughput or a separately verified inflection case;
4. cash-conversion visibility;
5. refinancing / capital-structure fragility;
6. accounting and disclosure integrity;
7. explicit thesis identity.

A verified adverse observation can produce a `HARD_GATE_FAIL`. Missing evidence never becomes a synthetic negative or synthetic positive.

## AI-CAPEX routing

For names materially linked to AI CAPEX, passing the basic T1 fields is not enough. Before downstream fundamental score they must also complete:

- Financing Quality Ω;
- Circular Demand Gate Ω.

Until both are complete, state remains `EVIDENCE_PENDING`.

This prevents reported order growth or backlog from being capitalized before the origin and independence of the financing are examined.

## Point Zero law

T1 preserves Point Zero. `directScoreContribution = 0` for every company.

The following remain inert in T1:

- market capitalization;
- index membership;
- analyst fame/coverage;
- current portfolio membership;
- current position size;
- personal P/L;
- personal cost basis;
- total personal capital.

T1 therefore cannot reintroduce the megacap/incumbent bias removed by T0.

## States

- `SURVIVOR`: all required evidence is decision-grade and no hard gate fails. Downstream fundamental scoring authorized.
- `EVIDENCE_PENDING`: required evidence is missing/proxy or a required AI financing/circularity module is incomplete. No downstream score.
- `HARD_GATE_FAIL`: at least one verified hard-gate condition is adverse. No downstream score.

## Required reason codes

The engine emits explicit codes, including:

- `IDENTITY_NOT_VERIFIED`
- `SOLVENCY_EVIDENCE_MISSING` / `SOLVENCY_HARD_FAIL`
- `THROUGHPUT_EVIDENCE_MISSING` / `THROUGHPUT_HARD_FAIL`
- `CASH_CONVERSION_EVIDENCE_MISSING` / `CASH_CONVERSION_HARD_FAIL`
- `REFINANCING_EVIDENCE_MISSING` / `REFINANCING_HARD_FAIL`
- `DISCLOSURE_EVIDENCE_MISSING` / `DISCLOSURE_HARD_FAIL`
- `THESIS_IDENTITY_MISSING`
- `AI_FINANCING_QUALITY_REQUIRED`
- `AI_CIRCULAR_DEMAND_REQUIRED`
- `POINT_ZERO_PRESERVED`

## Batch use over the 532-entity universe

The current T0 universe contains 532 economic entities after economic-entity deduplication and the first prospective expansion. T1 may process all of them in batches, but no company receives a fabricated live result merely because the engine exists.

Company evidence is filled from actual filings, audited results and other admissible sources. Until then it remains `EVIDENCE_PENDING`.

This is intentional: the engine is a fail-closed evidence firewall, not a score generator.

## Implementation

- `src/atlas/algorithm/universe-evidence-t1-prefilter-omega.ts`
- `src/atlas/algorithm/universe-evidence-t1-prefilter-omega.test.ts`
- `.github/workflows/universe-evidence-t1-prefilter-ci.yml`

## Governance boundary

T1 determines whether sufficient trustworthy evidence exists to continue. It does not decide whether a surviving company is attractive at today's price and does not compare surviving companies against one another.
