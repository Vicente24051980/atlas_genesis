# ATLAS Ω CANONICAL AMENDMENT — GREEN CONTINUITY Ω

Date: 2026-08-10
Status: CANONICAL AMENDMENT
Applies to: `ATLAS_OMEGA_MASTER_PROMPT_CANONICAL.md`

## Precedence

This amendment modifies the current ATLAS Ω master canon. Where the master prompt conflicts with this amendment on listed-equity discovery, primary selection, portfolio maintenance or engine hierarchy, this amendment prevails.

All Evidence Integrity Ω, Mobile-First Ω, source hierarchy, quantitative integrity, temporal normalization, falsifier and Decision Safety rules remain in force unless explicitly changed below.

## Amendment A — principal engine

GREEN CONTINUITY Ω v1.0 is the principal engine for normal listed-equity discovery, selection and portfolio continuity.

Primary hard entry gate:

`1W > 0 AND 1M > 0 AND 3M > 0 AND 1Y > 0 AND TOTAL > 0`

All five returns must use one synchronized regular-market cut.

## Amendment B — pipeline

For normal listed-equity discovery, replace the former sequence that placed Business Quality directly after market filters with:

`GLOBAL DISCOVERY -> GREEN CONTINUITY Ω -> BUSINESS QUALITY Ω -> GROWTH Ω -> CAPEX PRODUCTIVITY Ω -> VALUATION Ω -> RISK Ω -> MONEY/ENERGY ROTATION WHEN APPLICABLE -> SPECIALIZED/CONTRARIAN CONTEXT WHEN APPLICABLE -> DECISION SAFETY GATE Ω -> DECISION LOG Ω`

Evidence Ingestion, Source Authenticity, Quantitative Integrity, Temporal Normalization and all upstream validation remain mandatory before GLOBAL DISCOVERY / market calculations.

## Amendment C — role of the former principal stack

Business Quality / Growth / Moat / Financial Quality / Management / Valuation no longer own primary listed-equity selection.

They remain mandatory refinement layers for:

- business durability;
- conviction;
- ranking;
- valuation;
- risk;
- position sizing;
- structural falsifier detection.

They may block a BUY or force a SELL only when a valid structural falsifier or applicable hard gate is confirmed. They may not create SELL solely because of portfolio size, overlap, sector concentration or a preference to prune positions.

## Amendment D — maintenance

For a position justified by GREEN CONTINUITY Ω:

- 5/5 GREEN -> HOLD.
- 1W or 1M break while 3M, 1Y and TOTAL remain positive -> WATCH.
- 3M <= 0 or 1Y <= 0 or TOTAL <= 0 -> SELL from GREEN CONTINUITY Ω.
- confirmed structural falsifier -> SELL override even if 5/5 price continuity remains positive.

A single red daily session is not an exit condition in GREEN CONTINUITY Ω.

## Amendment E — independent engines

Good Companies Cheap Ω, Historical Dislocation / Burry Ω, Money Rotation Ω, Energy Rotation Ω and specialized engines remain independent.

A security may fail GREEN CONTINUITY Ω while remaining valid in an independent contrarian or specialized engine. Engine provenance must be preserved; one engine must not rewrite another engine's output.

## Implementation references

Canonical engine specification:

`docs/canon/GREEN_CONTINUITY_OMEGA_v1.md`

Executable TypeScript engine:

`src/atlas/algorithm/green-continuity-omega.ts`

Canonical engine hierarchy:

`src/atlas/algorithm/atlas-primary-engine-hierarchy.ts`
