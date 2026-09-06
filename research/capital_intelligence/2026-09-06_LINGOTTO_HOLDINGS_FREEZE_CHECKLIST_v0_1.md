# LINGOTTO HOLDINGS FREEZE CHECKLIST Ω v0.1

**Date:** 2026-09-06  
**Status:** ACTIVE / PRE-RETURN FREEZE  
**Parent:** `2026-09-06_LINGOTTO_VISIBLE_BOOK_MATRIX_v0_1.md`

## Objective
Complete the security-level primary 13F matrix before inspecting any post-publication return outcome.

## Non-negotiable order
1. Extract each primary SEC information table for every verified quarter in the Lingotto study window.
2. Preserve the original filing and any amendment as separate information states.
3. Normalize security identity on `CUSIP + CLASS` before ticker mapping.
4. Preserve `PUT_CALL`, discretion and voting fields; do not collapse options into common-share longs.
5. Calculate each filing's visible-book denominator from the filing itself.
6. Diff consecutive quarters only after split/corporate-action normalization.
7. Freeze event classes under the ex-ante rules already specified.
8. Freeze the completed event ledger and record its Git commit SHA.
9. Only after step 8 may price data or 6M/12M/24M return outcomes be joined.

## Study-window accessions
- 2023-06-30 — `0001732768-23-000006`
- 2023-09-30 — `0001732768-23-000007`
- 2023-12-31 — `0001732768-24-000001`
- 2024-03-31 — `0001732768-24-000003`
- 2024-06-30 — `0001732768-24-000005`
- 2024-09-30 — `0001172661-24-004632`
- 2024-12-31 — `0001172661-25-000491`
- 2025-03-31 — `0001172661-25-002046`
- 2025-06-30 — `0001172661-25-003216`
- 2025-09-30 original — `0001172661-25-004702`
- 2025-09-30 amendment — `0001172661-25-004755`
- 2025-12-31 — `0001172661-26-000570`
- 2026-03-31 — `0001172661-26-001922`
- 2026-06-30 — `0001172661-26-002907`

## Required raw fields
`PERIOD_END | PUBLICATION_DATE | ACCESSION | AMENDMENT_STATE | ISSUER | CLASS | CUSIP | VALUE_USD | SHARES_OR_PRINCIPAL | SH_PRN | PUT_CALL | INVESTMENT_DISCRETION | VOTING_SOLE | VOTING_SHARED | VOTING_NONE`

## Required derived fields
`TICKER | VISIBLE_13F_WEIGHT | PREV_SHARES_ADJ | SHARE_QOQ | VALUE_QOQ | CORPORATE_ACTION_STATE | SPLIT_ADJUSTED | EVENT_CLASS | EVENT_MATERIALITY | SECURITY_ID_STATE | NOTES`

## Event classes frozen ex ante
- `NEW_VISIBLE_POSITION`
- `SHARE_ADD_25`
- `SHARE_ADD_50`
- `SHARE_CUT_25`
- `SHARE_CUT_50`
- `VISIBLE_WEIGHT_TOP10`
- `PERSIST_3Q`
- `EXIT_VISIBLE_BOOK`

## Fail-closed rules
- Unresolved CUSIP/ticker mapping => `UNMAPPED`, never guessed.
- Unresolved split/corporate action => no share-change classification until resolved.
- Amendment differences remain explicit.
- Missing filing line => `DATA_GAP`; no interpolation.
- No target-company ownership percentage may substitute for portfolio denominator.
- No long 13F line may be described as net exposure.

## Return firewall
Until the event ledger is frozen, the following are prohibited inputs to event construction:
- subsequent share-price performance;
- known winner/loser narratives;
- analyst target prices;
- current ATLAS portfolio membership;
- allocator reputation.

`RETURNS_ACCESS = LOCKED`

## Completion condition
The holdings stage is complete only when every accession has a parsed primary table, every line has a stable security-identity state, every consecutive-quarter diff is reproducible, and the event ledger is committed before outcome data are opened.
