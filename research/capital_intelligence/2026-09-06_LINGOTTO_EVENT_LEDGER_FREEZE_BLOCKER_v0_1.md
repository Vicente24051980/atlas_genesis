# LINGOTTO EVENT LEDGER Ω — FREEZE BLOCKER v0.1

**Date:** 2026-09-06  
**Branch:** `research/lingotto-holdings-freeze-2026-09-06`  
**State:** `FREEZE_BLOCKED / RETURNS_LOCKED`

## Purpose
Record the exact reasons the complete Lingotto event ledger cannot yet be frozen without violating the anti-hindsight and source-quality rules.

## What is complete
- Primary accession timeline Q2-2023 through Q2-2026 is complete.
- Q3-2025 original and amendment are preserved as separate information states.
- Corporate-action normalization rules are active for NVIDIA, Broadcom, Desktop Metal and Ginkgo Bioworks.
- Instrument identity key is now `CUSIP + CLASS + PUT_CALL`, not CUSIP alone.
- Q3-2025 amendment establishes a material instrument-classification correction: SLB reported amount is split between common shares and CALL exposure in the amended filing.

## Q2-2026 blocking conflict
The Q2-2026 filing is confirmed by accession `0001172661-26-002907`, report date 2026-06-30, filed 2026-07-29, 32 reported lines and approximately $4.665510bn visible 13F value.

However, secondary reconstructions disagree materially on at least one security-level transition:

- Source A reports CVNA Q2-2026 at 9,283,819 shares and classifies the transition as a reduction of approximately 3,456,566 shares versus Q1-2026.
- Source B reports the same Q2-2026 ending share count but labels the QoQ movement as an increase of approximately 6.7m shares.

These two transition claims cannot both be true for the same ordinary-share identity and comparison basis.

### Rule
`SECONDARY_SOURCE_CONFLICT -> EVENT_STATE = QUARANTINED`

No CVNA Q2-2026 event class may be frozen until the primary `infotable.xml` line and the Q1 comparison row are directly reconciled under the canonical identity key.

## Q2-2026 transitions provisionally supported by concordant sources
These are **not yet promoted to PRIMARY VERIFIED** and therefore remain excluded from the frozen sample:

- TEVA ending shares ~20.206m; reported reduction ~7.565m (~27%).
- MOH new visible position ~2.511m shares, ~12.31% of visible 13F book.
- RRC ending shares ~11.045m; reported increase ~3.851m (~53.5%).
- SLB ending shares ~4.391m; reported reduction ~1.015m (~18.8%).
- NG ending shares ~31.532m; reported reduction ~5.311m (~14.4%).
- VAL ending shares ~2.412m; reported reduction ~1.295m (~35%).
- TSM ending shares 308,743; reported increase 31,516 (~11.4%).

These rows may be used only as reconciliation targets, never as return-test observations until primary verification.

## Q4-2024 checkpoint
Q4-2024 primary filing identity is confirmed:
- period end: 2024-12-31
- filing date: 2025-02-04
- accession: `0001172661-25-000491`
- 53 visible lines
- visible 13F value: approximately $3.727561bn

Q4-2024 remains part of the mandatory quarter-by-quarter reconciliation chain and must be security-level normalized before a complete freeze.

## Events already suitable for structural interpretation but not return testing
Examples that survive known corporate-action filters and are useful for sample design:
- HMY: persistent multi-quarter reductions culminating in near-exit.
- PONY: large add, persistence, another large add, then reduction.
- RRC: long persistence regime with later material Q2-2026 reported increase, pending primary Q2 row verification.
- Q3-2025 SLB amendment: instrument reclassification proves that common-share and option rows cannot be collapsed.

## Freeze requirements
The event ledger may move to `FROZEN` only when all are true:
1. every quarter in the study window has a security-level primary matrix;
2. all `CUSIP + CLASS + PUT_CALL` discontinuities are reconciled or explicitly quarantined;
3. every mechanical split/reverse-split is normalized;
4. original/amended filings are preserved as distinct information states;
5. all unresolved secondary-source conflicts are resolved from primary filings;
6. the complete event universe is generated mechanically under the pre-locked thresholds;
7. exclusions and quarantined rows are enumerated before any return data are accessed.

## Current epistemic state
`TIMELINE = COMPLETE`

`HOLDINGS_MATRIX = INCOMPLETE`

`EVENT_LEDGER = NOT_FROZEN`

`RETURNS_ACCESS = LOCKED`

`LINGOTTO_ALPHA = UNTESTED`

## Hard conclusion
The correct action is **not** to force a freeze. The Q2-2026 CVNA contradiction is exactly the kind of data-quality failure the protocol was designed to catch. Until the primary row-level reconciliation is complete, opening returns would reintroduce selection and classification bias.