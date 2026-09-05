# T0 — Anti-Megacap Discovery Gate Ω v1.0

**Date:** 2026-09-05  
**Status:** CANONICAL · CONSTITUTIONAL FIRST GATE  
**Direct Structural ATLAS weight:** 0  
**Authority:** discovery-bias prevention only; no BUY/SELL, no score bonus/penalty, no allocation authority.

## Constitutional rule

Every ATLAS path begins at T0 before Φ, Δ, Κ, Γ, Ρ, Ξ, Υ, Expected Return, challenger search, factor research, predictive engines, Competition for Capital or execution.

T0 solves a discovery problem, not a valuation problem: zeroing market-cap points after the candidate universe has already been selected does not neutralize megacap bias.

## Point Zero

Every company enters post-T0 analysis at zero.

The following contribute exactly zero to discovery priority and exactly zero to score:

- market capitalization;
- index membership;
- analyst coverage;
- brand/familiarity;
- raw data convenience/availability.

A megacap is never penalized for being large. It can finish #1 if it wins on economic evidence after T0.

## Discovery coverage

Discovery must deliberately cover capitalization buckets. Bucket balancing is a coverage mechanism only; it cannot change a frozen company score.

Canonical audit buckets:

- MICRO: < $300M
- SMALL: $300M–<$2B
- MID: $2B–<$10B
- LARGE: $10B–<$200B
- MEGA: >= $200B

The bucket is assigned after discovery priority is frozen.

For `CHALLENGER` and `NO_AI` discovery, absent explicit evidence justifying a different composition, megacaps may not exceed 20% of the first discovery tranche. A breach yields `DISCOVERY_BIAS_DETECTED`; it is not a penalty to the megacap company itself.

## Audit trail

Every discovery candidate preserves:

- `discovery_source`
- `candidate_rank_before_size`
- `market_cap_bucket_after_freeze`
- `entered_before_size_known`
- `selection_reason`
- `size_influenced_discovery`
- any analyst-coverage, familiarity or data-availability contamination.

## Admissible size economics

T0 does not erase real economics associated with scale. After discovery, ATLAS may penalize or reward evidence about:

- market saturation;
- reinvestment runway;
- liquidity/execution capacity;
- customer concentration;
- capital intensity;
- incremental ROIC;
- competitive scale advantages.

But the causal variable must be demonstrated. `Large company` is never itself proof of lower return, higher quality or lower risk.

## Relationship to existing engines

- `SIZE_NEUTRAL_RETURN_RANKING_OMEGA_V1` continues to enforce zero size contribution in ranking.
- `SIZE_NEUTRALITY_AUDIT_OMEGA_V1` remains a downstream audit.
- T0 is upstream and constitutional: it prevents the candidate universe from being biased before either of those engines sees it.
- Greek contracts remain orthogonal. T0 governs which evidence/candidates enter the pipeline; it does not alter Δ/Κ/Γ/Ρ/Υ contract boundaries.

## Canonical pipeline

`INPUT -> T0 -> integrity/evidence gates -> GLOBAL_DISCOVERY -> GREEN -> PRINCIPAL -> all other applicable engines -> Decision/Execution`

No engine may claim a size-neutral result if its input universe failed T0.

## Implementation

- `src/atlas/algorithm/t0-anti-megacap-discovery-gate-omega.ts`
- `src/atlas/algorithm/t0-anti-megacap-discovery-gate-omega.test.ts`
- `src/atlas/algorithm/atlas-primary-engine-hierarchy.ts` -> v4.17.0
- `.github/workflows/t0-anti-megacap-discovery-gate-ci.yml`

## Decision / Governance

**2026-09-05 — Issue #102**  
User instruction: all ATLAS discovery and evaluation must start at T0; no default tendency toward megacaps.  
Decision: constitutionalize T0 as the first gate while explicitly preserving the right of a megacap to win after evidence-based evaluation.
