# ATLAS Ω — PIT 488 Completeness Contract

Date: 2026-09-06
Status: ACTIVE_RESEARCH_CONTRACT / BLOCKING
Universe: `ATLAS_CORE_487_PLUS_VRT_ADMITTED_488_2026-09-06`

## Objective

Build one homogeneous Point-Zero evidence matrix for all 488 permitted economic entities. No ranking or structural portfolio publication is valid from a partial matrix.

## One row per canonical entity

Required minimum fields:

- `canonicalEntityId`
- `ticker`
- `snapshotTimestamp`
- `sourceCutoffTimestamp`
- `identityStatus`
- `hardGatesPassed`
- `falsifierVetoPassed`
- forward Expected Return bridge:
  - fundamental growth
  - cash yield
  - capital returns
  - multiple normalization
- permanent-loss raw evidence + normalized value + unit-contract version
- tail-risk raw evidence + normalized value + unit-contract version
- volatility evidence + normalized value + unit-contract version
- fragility raw evidence + normalized value + unit-contract version
- convexity/offset evidence + normalized value + unit-contract version
- confidence
- causal-driver diagnostic map
- funding/common-fragility sources
- all canonical scenario impacts
- valuation timestamp/source
- provenance references
- missing-field flags

## Completeness law

`row_count == 488`
AND
`unique(canonicalEntityId) == 488`
AND
`all_required_fields_present == true`
AND
`same_snapshot_policy == true`

Anything else:
`BLOCKED_INCOMPLETE_UNIVERSE_EVIDENCE`.

## PIT law

A later fact may not be inserted into an earlier snapshot. Every field must be knowable at or before the declared cutoff. If a field is unavailable, mark missing and block; do not backfill from later evidence.

## Source-quality order

Prefer primary issuer filings/releases, regulatory filings and directly auditable market-data sources. Secondary synthesis may nominate questions but must not silently become a primary numeric input.

## No incumbent shortcuts

The current 27 receive no priority in data collection, missing-data imputation, evidence thresholds or manual review. Coverage order must not create score authority.

## Completion output

Persist:

- raw source manifest
- normalized 488-row matrix
- schema version
- snapshot hash
- source manifest hash
- missingness report
- duplicate/conflict report
- risk-unit contract version
- engine/policy versions

Only then may deterministic structural selection start.
