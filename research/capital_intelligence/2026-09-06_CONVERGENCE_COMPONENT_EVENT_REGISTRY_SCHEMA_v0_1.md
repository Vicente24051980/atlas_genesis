# CONVERGENCE COMPONENT EVENT REGISTRY — Schema v0.1

**Date:** 2026-09-06  
**Parent protocol:** `2026-09-06_CROSS_SIGNAL_CONVERGENCE_OMEGA_PREREG_v0_1.md`  
**State:** `SCHEMA_FROZEN / DATA_NOT_POPULATED`  
**Forward returns:** PROHIBITED in this registry.

## Row grain
One row = one **public component event** for one issuer. A convergence event is constructed only after component rows are independently captured and labeled.

## Required columns
| field | type | rule |
|---|---|---|
| `component_event_id` | string | immutable unique ID |
| `issuer_name` | string | point-in-time issuer name |
| `cik` | string | SEC CIK when applicable |
| `ticker_at_event` | string | ticker at public event time |
| `security_id` | string | CUSIP/other stable ID where available |
| `signal_family` | enum | S1..S6 only |
| `event_subtype` | string | frozen subtype from family preregistration |
| `actor_id` | string | insider/filer/allocator/issuer economic actor |
| `actor_affiliation_group` | string/null | common-control group used for de-duplication |
| `source_form` | string | Form 4, 13D, 13F, 10-Q, etc. |
| `source_accession` | string | primary filing accession when applicable |
| `source_url` | string | primary public source |
| `economic_event_date` | date/null | transaction/period date; never used as t0 |
| `publication_timestamp` | datetime | first verified public timestamp |
| `after_regular_close` | bool | determines executable t0 |
| `executable_timestamp` | datetime | first executable regular-session timestamp |
| `direction` | enum | POSITIVE/NEGATIVE/NEUTRAL/NA according to family definition, not return |
| `magnitude_raw` | number/null | family-native magnitude |
| `magnitude_unit` | string/null | USD, shares, %, etc. |
| `corporate_action_state` | enum | NONE/ADJUSTED/OPEN |
| `amendment_state` | enum | NONE/ORIGINAL/AMENDED/ADDITIVE/CORRECTIVE |
| `public_data_complete` | bool | false blocks convergence construction |
| `family_label_frozen` | bool | must be true before pairing |
| `notes_no_forward_return` | string | evidence notes only; no post-event performance |

## Pair/set construction table
A second table is derived only from eligible component rows.

Required fields:
- `convergence_event_id`
- `issuer/cik`
- `component_event_ids[]`
- `component_families[]`
- `actor_ids[]`
- `actor_affiliation_groups[]`
- `earliest_component_public_ts`
- `latest_component_public_ts`
- `convergence_t0 = latest_component_public_ts`
- `executable_t0`
- `component_order`
- `calendar_gap_days`
- `window_class` = W30/W90/W180
- `independence_state` = I0/I1/I2/I3; I4 prohibited in discovery
- `shared_cause_candidate`
- `shared_cause_evidence`
- `dependence_rationale`
- `base_test_eligible` = true only for I3 and complete public data
- `strongest_component_rule_id`
- `overlap_cluster_id`
- `M&A_outcome_flag` initially UNKNOWN until outcome phase
- `returns_unlock_commit` initially NULL

## Labeling order
1. Capture primary-source component event.
2. Freeze family subtype and public timestamp.
3. Resolve affiliations/common control.
4. Resolve corporate actions/amendments.
5. Generate candidate pairs within W180.
6. Assign I0/I1/I2/I3 **without forward-return access**.
7. Freeze registry by commit.
8. Only then create a separate outcomes/returns dataset.

## Dependence questions
For every pair answer before assigning I3:
1. Is one event mechanically derived from the other?
2. Is one actor affiliated with or controlled by the other?
3. Is there evidence one actor knew of the other event before public disclosure?
4. Is the second observation an outcome/implementation of the first campaign?
5. Are both labels features of the same filing/economic action?
6. Would removing the underlying corporate event remove both signals simultaneously?

Any YES to 1, 2, 4 or 5 normally prevents I3. YES/UNKNOWN to 3 requires I1/I2 unless evidence supports independence. Question 6 is diagnostic for common cause.

## Hard validation checks
- no missing `publication_timestamp` for eligible events;
- no pair with identical `component_event_id` twice;
- no same affiliation group counted as independent consensus;
- no I0/I1/I2 event marked `base_test_eligible=true`;
- no convergence t0 earlier than any component timestamp;
- no outcome/return field in component registry;
- no I4 assignment before out-of-sample replication.

## Current state
`REGISTRY_SCHEMA = FROZEN_V0_1`
`REGISTRY_DATA = EMPTY`
`RETURNS_ACCESS = LOCKED`