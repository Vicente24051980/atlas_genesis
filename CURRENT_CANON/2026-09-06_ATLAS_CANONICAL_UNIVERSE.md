# ATLAS Ω — CANONICAL SELECTION UNIVERSE

Date: 2026-09-06
Status: ACTIVE_CANONICAL
Authority: universe definition only; no ticker receives score, portfolio membership or trade authority merely by inclusion.

## Canonical raw source

`data/t0-universe-user-seed-2026-09-05.txt`

The raw source preserves the 650 enumerated company rows supplied by the user from the Nasdaq-100 block plus the expanded/adjusted S&P 500 blocks. Duplicates are intentionally preserved in the raw ledger so the source can be audited exactly.

## Normalization law

Before any portfolio run, ATLAS MUST deterministically normalize the raw source:

1. Deduplicate repeated ticker rows.
2. Treat duplicate adjusted entries such as `II` labels as the same economic security when ticker is identical.
3. Preserve distinct share classes when ticker differs (for example GOOGL vs GOOG).
4. Emit a normalized-universe hash before scoring.
5. Never give incumbents, index membership, sector, geography, style or historical ATLAS membership any score advantage.
6. Every normalized candidate starts from zero under the same evidence snapshot and same scoring inputs.
7. External challengers not present in the base universe may be appended only through the canonical challenger/discovery process; they receive identical gates and zero prior authority.

## Portfolio-selection law

The universe feeds the canonical MAX RETURN / LOW VOL portfolio process:

`RAW UNIVERSE -> NORMALIZE -> ELIGIBILITY / HARD GATES -> EXPECTED RETURN -> RISK -> FRAGILITY -> SCENARIOS -> PORTFOLIO MARGINAL CONTRIBUTION -> ENDOGENOUS N -> SIZING`

Canonical risk policy remains:

- Permanent-loss risk: 40%
- Tail risk: 20%
- Volatility risk: 40%

Diversification, sector balance, geographic balance, style balance and visual portfolio symmetry have zero independent portfolio-membership authority.

## Determinism requirement

Same raw universe + same normalized universe + same PIT evidence snapshot + same engine version + same policy parameters MUST produce the same ranking, same selected tickers, same N and same weights.

A portfolio run must persist at minimum:

- `raw_universe_source`
- `normalized_universe_hash`
- `snapshot_hash`
- `engine_version`
- `policy_hash`
- full candidate ranking
- marginal inclusion utility `DeltaU_add`
- best swap utility `DeltaU_swap`
- selected endogenous N
- final weights
- `globalOptimalityProven`

If repeated execution on the same snapshot produces a different portfolio hash, result state is:

`FAIL_NON_DETERMINISTIC_PORTFOLIO_SELECTION`

and no result may be labeled canonical.

## Separation from the four-session experiment

`EXPERIMENT_4D_EQUAL_WEIGHT` is a separate experimental mode. It may freeze and equal-weight an approved test basket to measure selection skill, but it MUST NOT overwrite or masquerade as the structural MAX RETURN / LOW VOL portfolio optimizer.

## Precedence

This universe manifest supersedes ad-hoc candidate lists as the base selector universe. Old 23/25/29/31/37 portfolio lists are outputs/candidates/experiments, not universe definitions and not incumbency priors.
