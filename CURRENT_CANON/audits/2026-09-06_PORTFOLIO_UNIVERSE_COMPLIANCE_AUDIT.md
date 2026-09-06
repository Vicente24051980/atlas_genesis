# ATLAS Ω — Portfolio Universe Compliance Audit

Date: 2026-09-06
Status: CANONICAL AUDIT INPUT — NOT PORTFOLIO
Universe authority: `ATLAS_CORE_650_RAW_490_UNIQUE_487_ENTITY_2026-09-06`

## Purpose

Audit previously proposed portfolio constituents against the newly ratified canonical 487-entity universe and enforce the Structural Portfolio Publication Gate.

## Key finding

A previously proposed 29-name portfolio mixed canonical-core entities and names outside the frozen 487-entity whitelist. That portfolio therefore cannot be certified as a canonical structural ATLAS portfolio under the current publication gate.

### Inside canonical 487-entity universe (19)

AVGO, APH, HWM, ASML, NVDA, ANET, KLAC, SPGI, MCO, ISRG, MA, VRTX, PWR, LIN, MU, MELI, GEV, TDG, CEG.

### Outside canonical 487-entity universe (10)

TSM, 000660.KS (SK Hynix), IBKR, NOW, CLS, 8035.T (Tokyo Electron), FIX, 6501.T (Hitachi), 7011.T (Mitsubishi Heavy Industries), CRDO.

## Interpretation

`OUTSIDE_CORE_UNIVERSE != REJECTED_SECURITY`.

These names may remain valid research challengers, but they have zero authority in a frozen core-universe run until they pass an explicit admission process. The canonical selector must not silently mix external challengers with the base universe.

## Required separation

- `CORE_UNIVERSE_487`: eligible for the current master-universe rebuild.
- `EXTERNAL_CHALLENGER`: research-only until identity, liquidity, data completeness and Point-Zero evidence gates are satisfied.
- `ADMITTED_EXTERNAL_CHALLENGER`: may enter a future frozen whitelist only through an explicit versioned universe update.

## Publication consequences

1. Any run containing a ticker outside the frozen allowedTicker set must fail `BLOCKED_UNIVERSE_MISMATCH`.
2. Historical portfolio membership does not grandfather an external name into the new universe.
3. External challenger admission must be versioned and reproducible; no one-off narrative exceptions.
4. A newly admitted external entity must receive the same PIT evidence schema, hard gates, expected-return model, risk decomposition, marginal DeltaU analysis and covariance-aware sizing as core entities.
5. The four-session experiment may only use a separately declared whitelist and remains `EXPERIMENT_ONLY`; it cannot alter structural universe authority.

## Current research priority

Before publishing another structural portfolio:

1. Complete homogeneous Point-Zero scoring across all 487 core entities.
2. Expand the 80+ registry when previously unscored names clear the audit threshold.
3. Re-audit unresolved/current-stale 80+ names with fresh valuation and primary-source operating evidence.
4. Decide whether the ten external names above should be formally proposed for admission as a versioned challenger extension. Until then they remain outside the certified core run.
5. Run deterministic selection + full marginal ledger + covariance-aware sizing + 100-rerun reproducibility certification.

## Governance law

`SAME SNAPSHOT + SAME POLICY + SAME FROZEN UNIVERSE = SAME SELECTED NAMES + SAME N + SAME WEIGHTS WITHIN TOLERANCE`.

Any violation is `DETERMINISM_FAILURE`.
