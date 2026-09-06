# LINGOTTO Q4-2025 → Q1-2026 PRIMARY DIFF AUDIT Ω

**Status:** PRIMARY SEC / EVENT FREEZE PRE-RETURNS  
**Date:** 2026-09-06

## Purpose
Freeze the Q4-2025 → Q1-2026 visible-13F transition from primary SEC filings before opening any return data.

## Primary filings
- Q4-2025: accession `0001172661-26-000570`, period 2025-12-31, filed 2026-02-10, 39 entries, visible value `$5,738,292,716`.
- Q1-2026: accession `0001172661-26-001922`, period 2026-03-31, filed 2026-05-14, 35 entries, visible value `$5,064,156,767`.

`13F_VISIBLE_BOOK != TOTAL_PORTFOLIO` and changes in reported value are not treated as changes in shares.

## Frozen material common-share events
Matched by CUSIP/class. Thresholds were already locked ex ante.

| Security | Q4-2025 shares | Q1-2026 shares | QoQ | Frozen event |
|---|---:|---:|---:|---|
| Cloudflare | 175,635 | 300,023 | +70.8% | `SHARE_ADD_50` |
| Harmony Gold | 4,897,286 | 161,787 | -96.7% | `SHARE_CUT_50` |
| Microsoft | 88,837 | 12,517 | -85.9% | `SHARE_CUT_50` |
| Moderna | 498,693 | 763,907 | +53.2% | `SHARE_ADD_50` |
| Rocket Companies | 299,900 | 178,219 | -40.6% | `SHARE_CUT_25` |
| ServiceNow | 285,325 | 389,886 | +36.6% | `SHARE_ADD_25` |
| Sibanye Stillwater | 28,430,409 | 19,575,936 | -31.1% | `SHARE_CUT_25` |
| SLB common | 4,158,163 | 5,406,567 | +30.0% | `SHARE_ADD_25` |

## Option state kept separate
SLB call:
- Q4-2025: `1,801,770`
- Q1-2026: `410,000`
- QoQ: `-77.2%`
- frozen state: `OPTION_CUT_50`; never merged into common-share conviction.

## Large but sub-threshold changes retained as none
These are useful negative controls because they prevent narrative promotion after returns are seen:
- Aurora Innovation: `8,153,945 → 9,722,567`, about `+19.2%` → none.
- Duolingo: `33,563 → 40,045`, about `+19.3%` → none.
- Joby Aviation: `3,138,240 → 3,743,218`, about `+19.3%` → none.
- MercadoLibre: `20,152 → 24,040`, about `+19.3%` → none.
- NVIDIA: `514,967 → 614,357`, about `+19.3%` → none.
- PONY AI: `4,107,512 → 3,324,068`, about `-19.1%` → none.
- Recursion: `4,931,057 → 5,881,738`, about `+19.3%` → none.
- VanEck Junior Gold Miners: `2,602,894 → 1,990,572`, about `-23.5%` → none.

## New visible-position candidates in Q1-2026
Absent from Q4-2025 table and present in Q1-2026:
- Blue Owl Capital — `239,234` shares.
- KKR — `26,624` shares; treat as a **re-entry candidate**, because KKR existed in earlier Lingotto filings.
- Nebius Group — `128,945` shares.

States remain `NEW_VISIBLE_POSITION_CANDIDATE` / `REENTRY_CANDIDATE` until the immediately preceding identity diff and corporate-action checks are formally closed.

## Exit candidates from Q4-2025
Present in Q4-2025 and absent from Q1-2026:
- CRH
- Energy Fuels
- Ginkgo Bioworks
- Hyatt Hotels
- Primo Brands
- Sunrun
- Vertiv

State: `EXIT_CANDIDATE`, pending corporate-action/security-identity review. No exit alpha may be calculated yet.

## Continuity observations
- API Group is unchanged at `307,200` shares.
- Alibaba is unchanged at `17,100`.
- Amazon is unchanged at `42,410`.
- First Majestic is effectively flat (`10,046,918 → 10,016,055`).
- Range Resources is effectively flat (`7,216,694 → 7,193,719`).
- TSM ADR is effectively flat (`274,878 → 277,227`).
- Teva is slightly lower (`28,422,768 → 27,770,857`).
- Valaris is effectively flat (`3,719,176 → 3,706,866`).
- VEON is effectively flat (`6,060,852 → 6,042,061`).

## Methodological result
This transition contains simultaneous aggressive cuts, aggressive adds, option reduction, re-entry candidates and several near-20% changes that deliberately fail the frozen 25% event gate. That is exactly why event labels must be frozen before returns.

## Anti-hindsight lock
No price, return, alpha, MFE, MAE, sector performance or later winner/loser information was used in this classification.

`LINGOTTO_SKILL_STATE = A2_TIMELINE_COMPLETE_HOLDINGS_EXTRACTION_IN_PROGRESS`

No alpha claim authorized.