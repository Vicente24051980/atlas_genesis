# ATLAS Ω — Capital-Blind Portfolio Selection Ω v1.0

**Status:** `HISTORICAL / SUPERSEDED_AS_CARDINALITY_AUTHORITY`  
**Original date:** `2026-09-05`  
**Superseded by:** `ATLAS Ω — MASTER UNIVERSE PROMPT` effective `2026-09-06`

## Governance notice

This file is retained only for provenance and audit history.

The original v1.0 law correctly established that current invested capital, current position weight, personal P/L, personal average cost and incumbent status have **zero clean-selection authority**. That Capital-Blind principle survives.

The original v1.0 cardinality rule **does not survive**. The former `MIN_POSITIONS = 20` and `MAX_POSITIONS = 35` are void as canonical portfolio constraints.

## Current controlling law

Authoritative source:

`docs/canon/ATLAS_OMEGA_MASTER_PROMPT_CANONICAL.md`

Universe:

`ATLAS_CORE_650_RAW_490_UNIQUE_487_ENTITY_2026-09-06`

Current cardinality law:

`OPTIMAL_N = FULLY_ENDOGENOUS`

There is no ex-ante target, floor or ceiling of 20, 25, 30, 32, 35, 37, 50 or any other arbitrary position count.

Clean selection starts from Point Zero. Every canonical economic entity begins with zero prior advantage. The portfolio expands only while the best next addition improves whole-portfolio return/risk utility; expansion stops when the next addition fails that test.

## What remains valid from v1.0

- current invested euros have zero selection authority;
- current position weight has zero selection authority;
- personal unrealized/realized P/L has zero selection authority;
- personal average cost has zero selection authority;
- current total portfolio capital base has zero selection authority;
- held/incumbent status has zero clean-selection authority;
- Capital-Blind is not Price-Blind: valuation and Expected Return remain legitimate economic inputs;
- selection remains separate from sizing and entry timing;
- execution friction / hysteresis may exist downstream but cannot rewrite the clean Point-Zero ranking.

## What is explicitly superseded

- `20 <= N <= 35`;
- `MIN_POSITIONS = 20`;
- `MAX_POSITIONS = 35`;
- any requirement to fill a minimum number of slots;
- any preferred Top‑N inherited from prior portfolio snapshots;
- any use of a fixed ceiling as a proxy for endogenous portfolio optimization.

## Current implementation

Primary modules:

- `src/atlas/algorithm/capital-blind-portfolio-selection-omega.ts`
- `src/atlas/algorithm/endogenous-portfolio-engine-v2.ts`
- `src/atlas/algorithm/portfolio-selection-canon-omega.ts`
- `src/atlas/algorithm/endogenous-portfolio-engine-v2-canon.ts`
- `src/atlas/algorithm/atlas-kernel-contract-registry-omega.ts`

> **No intentes justificar la cartera que ya tenemos. Intenta derrotarla.**
