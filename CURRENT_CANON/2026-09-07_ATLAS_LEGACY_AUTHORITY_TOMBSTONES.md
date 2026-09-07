# ATLAS Ω — LEGACY AUTHORITY TOMBSTONES

**Effective:** 2026-09-07  
**Status:** `CURRENT / CANONICAL INTERPRETATION REGISTRY`

This file changes authority, not history. Legacy text remains available for provenance.

## Rule

Words embedded in historical files such as `CANONICAL`, `FROZEN`, `SEALED`, `SELLADO`, `CURRENT`, `PRIMARY ENGINE`, `INVIOLABLE`, `FINAL PORTFOLIO` or `OFFICIAL WATCHLIST` do **not** retain authority when they conflict with the 2026-09-07 ratified canon.

## Tombstones

| Legacy object | Current interpretation |
|---|---|
| `CONSTITUTION.md` v1.0 | `HISTORICAL / SUPERSEDED`. Old immune pillars, fixed portfolio, fixed watchlist, automatic stop-loss and old engine hierarchy have zero current authority. |
| `00_READ_ME_FIRST.md` | `HISTORICAL / SUPERSEDED ENTRY POINT`. |
| `INDEX.md` legacy | `HISTORICAL / SUPERSEDED ENTRY POINT`. |
| `src/atlas/algorithm/atlas-primary-engine-hierarchy.ts` v4.18 | `LEGACY CLASSIFICATION MAP / ZERO ARCHITECTURAL AUTHORITY`. Kernel Registry v4 + E1–E6 supersede it architecturally. |
| Any former portfolio 35/36/39/41/Top-N | `HISTORICAL PORTFOLIO SNAPSHOT`. |
| Any former watchlist v1…v6 | `HISTORICAL RESEARCH SNAPSHOT`. |
| Former master prompts/amendments | `SUPERSEDED_AS_SELECTION_AUTHORITY`. |
| Former independent named gate engines | Functions/rules hosted by `E3 GATE Ω`; names do not create extra engines. |
| Former independent research/scoring engines | Must resolve to E1–E6 host, shadow signal, research family, test, hypothesis generator, documentation, redundant or reject. |

## Current logical-object authorities

- Architecture: `CURRENT_CANON/2026-09-07_ASTRA_CONSOLIDATION_RATIFICATION_v1_0.md` + `src/atlas/algorithm/atlas-kernel-contract-registry-omega.ts` v4.0.0.
- Current canon: `CURRENT_CANON/ATLAS_OMEGA_CURRENT_CANON.md`.
- Financial clean selection: `docs/canon/ATLAS_OMEGA_MASTER_PROMPT_CANONICAL.md`.
- Clean selection universe: `ATLAS_CORE_650_RAW_490_UNIQUE_487_ENTITY_2026-09-06`.
- Operational portfolio snapshot: `CURRENT_CANON/2026-09-06_ATLAS_CURRENT_OPERATIONAL_PORTFOLIO_27.md`.
- Research queue: `CURRENT_CANON/WATCHLIST_OMEGA.md`, explicitly non-selection authority.

## Frozen exclusivity

Exactly one `CURRENT/FROZEN` authority is permitted per logical object. Publishing a successor automatically makes the predecessor `SUPERSEDED/HISTORICAL` even if the predecessor text is not physically rewritten.

## Safety

No historical file may be consumed as active authority merely because a parser finds a legacy status token inside it. Authority resolution must consult this registry/current canon first.
