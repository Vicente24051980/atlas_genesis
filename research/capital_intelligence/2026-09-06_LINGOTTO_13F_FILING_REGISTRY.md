# CAPITAL INTELLIGENCE Ω — Lingotto / Exor 13F filing registry

**Status:** BUILDING / PRIMARY-SEC  
**Date:** 2026-09-06  
**CIK:** `0001732768`  
**Purpose:** establish the complete point-in-time disclosure population before any alpha test.

## Critical correction

The 13F history attached to CIK `0001732768` does **not** begin in Q2-2023. The SEC archive contains a 13F-HR accepted on **2018-03-14 10:36:33** for the period ended **2017-12-31**, filed by **Exor Investments (UK) LLP** under the same CIK and Form 13F file number `028-18685`.

Therefore:

- `FIRST_13F_FOUND = 2017-12-31 report / 2018-03-14 publication`
- `LEGAL_CIK_CONTINUITY = TRUE`
- `SAME_INVESTMENT_PROCESS = UNPROVEN`
- pre-Lingotto filings must not be pooled mechanically with the Lingotto era.

## Required regime fields

Every filing/event row must carry:

- `MANAGER_NAME_AT_FILING`
- `LEGAL_CIK_CONTINUITY`
- `SKILL_REGIME`
- `POOLING_ALLOWED`

Initial regimes:

1. `EXOR_INVESTMENTS_UK`
2. `EXOR_CAPITAL`
3. `LINGOTTO`

`POOLING_ALLOWED = FALSE` until a stability test shows that pooling does not manufacture the result.

## SEC archive discovery registry

The SEC CIK directory currently exposes the following 13F-era accession timestamps. Entries not yet individually opened are retained as `DIRECTORY_DISCOVERED` and are **not** assigned a report date by inference.

| Accession | SEC timestamp | Report date | Form/state | Verification |
|---|---|---|---|---|
| 0001732768-18-000002 | 2018-03-14 10:36:33 | 2017-12-31 | 13F-HR | PRIMARY VERIFIED; Exor Investments (UK) LLP |
| 0001732768-18-000003 | 2018-04-16 15:40:46 | TO_VERIFY | candidate quarterly filing | DIRECTORY_DISCOVERED |
| 0001732768-18-000005 | 2018-07-23 15:11:17 | TO_VERIFY | candidate quarterly filing | DIRECTORY_DISCOVERED |
| 0001732768-18-000006 | 2018-10-05 08:03:56 | TO_VERIFY | candidate quarterly filing | DIRECTORY_DISCOVERED |
| 0001732768-19-000002 | 2019-02-05 10:20:20 | TO_VERIFY | candidate quarterly filing | DIRECTORY_DISCOVERED |
| 0001732768-19-000004 | 2019-05-09 13:38:52 | TO_VERIFY | candidate quarterly filing | DIRECTORY_DISCOVERED |
| 0001732768-19-000005 | 2019-07-08 09:15:46 | TO_VERIFY | candidate quarterly filing | DIRECTORY_DISCOVERED |
| 0001732768-19-000006 | 2019-10-24 07:11:02 | TO_VERIFY | candidate quarterly filing | DIRECTORY_DISCOVERED |
| 0001732768-20-000002 | 2020-01-22 09:47:39 | TO_VERIFY | candidate quarterly filing | DIRECTORY_DISCOVERED |
| 0001732768-20-000003 | 2020-04-28 13:06:55 | TO_VERIFY | candidate quarterly filing | DIRECTORY_DISCOVERED |
| 0001732768-20-000004 | 2020-07-22 08:32:56 | TO_VERIFY | candidate quarterly filing | DIRECTORY_DISCOVERED |
| 0001732768-20-000005 | 2020-10-29 07:08:40 | TO_VERIFY | candidate quarterly filing | DIRECTORY_DISCOVERED |
| 0001732768-21-000001 | 2021-01-20 12:23:54 | TO_VERIFY | candidate quarterly filing | DIRECTORY_DISCOVERED |
| 0001732768-21-000003 | 2021-04-29 09:07:25 | TO_VERIFY | candidate quarterly filing | DIRECTORY_DISCOVERED |
| 0001732768-21-000004 | 2021-07-29 15:08:01 | TO_VERIFY | candidate quarterly filing | DIRECTORY_DISCOVERED |
| 0001732768-21-000005 | 2021-11-01 15:41:49 | TO_VERIFY | candidate quarterly filing | DIRECTORY_DISCOVERED |
| 0001732768-22-000001 | 2022-01-18 09:51:36 | TO_VERIFY | candidate quarterly filing | DIRECTORY_DISCOVERED |
| 0001732768-22-000002 | 2022-05-03 12:28:30 | TO_VERIFY | candidate quarterly filing | DIRECTORY_DISCOVERED |
| 0001732768-22-000003 | 2022-08-12 11:59:35 | TO_VERIFY | candidate quarterly filing | DIRECTORY_DISCOVERED |
| 0001732768-22-000004 | 2022-11-07 09:45:49 | TO_VERIFY | candidate quarterly filing | DIRECTORY_DISCOVERED |
| 0001732768-23-000001 | 2023-02-14 16:21:32 | TO_RECONCILE | original/amendment cluster | DIRECTORY_DISCOVERED |
| 0001732768-23-000002 | 2023-02-15 06:16:21 | TO_RECONCILE | original/amendment cluster | DIRECTORY_DISCOVERED |
| 0001732768-23-000003 | 2023-02-17 09:53:47 | TO_RECONCILE | filing cluster | DIRECTORY_DISCOVERED |
| 0001732768-23-000005 | 2023-05-15 06:41:49 | 2023-03-31 | 13F-HR | PRIMARY VERIFIED; Exor Capital LLP |
| 0001732768-23-000006 | 2023-08-11 16:08:39 | 2023-06-30 | 13F-HR | PRIMARY VERIFIED; Lingotto Investment Management LLP |
| 0001732768-23-000007 | 2023-11-13 12:02:51 | 2023-09-30 | 13F-HR | PRIMARY VERIFIED |
| 0001732768-24-000001 | 2024-02-13 11:47:52 | 2023-12-31 | 13F-HR | PRIMARY VERIFIED |
| 0001732768-24-000003 | 2024-05-15 14:09:27 | 2024-03-31 | 13F-HR | PRIMARY VERIFIED |
| 0001732768-24-000005 | 2024-08-12 09:25:46 | 2024-06-30 | 13F-HR | PRIMARY VERIFIED |
| 0001172661-24-004632 | 2024-11-13 15:23:15 | 2024-09-30 | 13F-HR | PRIMARY VERIFIED |
| 0001172661-25-000491 | 2025-02-04 16:50:22 | 2024-12-31 | 13F-HR | PRIMARY VERIFIED |
| 0001172661-25-002046 | 2025-05-15 10:23:28 | 2025-03-31 | 13F-HR | PRIMARY VERIFIED |
| 0001172661-25-003216 | 2025-08-13 17:19:05 | 2025-06-30 | 13F-HR | PRIMARY VERIFIED |
| 0001172661-25-004702 | 2025-11-12 10:45:03 | 2025-09-30 | 13F-HR | ORIGINAL; must reconcile |
| 0001172661-25-004755 | 2025-11-13 14:00:26 | 2025-09-30 | 13F-HR/A | PRIMARY VERIFIED; Amendment 1 adds new holdings entries; final snapshot must merge original + amendment |
| 0001172661-26-000570 | 2026-02-10 14:11:23 | 2025-12-31 | 13F-HR | PRIMARY VERIFIED |
| 0001172661-26-001922 | 2026-05-14 11:57:44 | 2026-03-31 | 13F-HR | PRIMARY VERIFIED; 35 entries; visible value $5,064,156,767 |
| 0001172661-26-002907 | 2026-07-29 11:58:33 | 2026-06-30 | 13F-HR | PRIMARY VERIFIED; 32 entries; visible value $4,665,510,258 |

## Amendment rule

The Q3-2025 amendment explicitly states `adds new holdings entries`. It is not an independent alpha event. The economic snapshot for 2025-09-30 must be reconstructed as the corrected filing state before quarter-to-quarter comparison.

## Immediate implication

The validation program now has two distinct questions:

1. Does the **Lingotto regime** retain post-publication alpha?
2. Does the longer **same-CIK Exor→Lingotto history** contain stable evidence that survives regime segmentation?

Question 2 cannot be answered by legal continuity alone.

## Next data block

The first normalized event ledger is `2026Q1→2026Q2`, because both filings and full information tables have been primary-verified and the quarter contains NEW / INCREASE / DECREASE / EXIT / UNCHANGED cases. Corporate actions are corrected before event classification.