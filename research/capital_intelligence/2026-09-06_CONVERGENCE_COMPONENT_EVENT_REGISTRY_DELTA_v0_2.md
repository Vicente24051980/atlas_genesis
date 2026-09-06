# CONVERGENCE COMPONENT EVENT REGISTRY Ω — Delta v0.2

**Date:** 2026-09-06
**Base seed:** `2026-09-06_CONVERGENCE_COMPONENT_EVENT_REGISTRY_SEED_v0_1.md`
**Schema:** `2026-09-06_CONVERGENCE_COMPONENT_EVENT_REGISTRY_SCHEMA_v0_1.md`
**State:** `PRIMARY_SEC_DELTA / RETURNS LOCKED`

## Purpose
Add candidate cross-signal sequences discovered during the targeted I3 audit. These rows are retained even though neither derived pair qualifies as clean I3.

## New component rows

| component_event_id | issuer_name | cik | ticker_at_event | security_id | signal_family | event_subtype | actor_id | actor_affiliation_group | source_form | source_accession | economic_event_date | publication_timestamp_ET | after_regular_close | executable_timestamp_ET | direction | magnitude_raw | magnitude_unit | corporate_action_state | amendment_state | public_data_complete | family_label_frozen | source_url | notes_no_forward_return |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---:|---|---|---|---|---|---|---|
| CE-2026-XPOF-S2-001 | Xponential Fitness, Inc. | 0001802156 | XPOF | NA | S2 | INITIAL_13D_ACTIVIST_CAMPAIGN | VOSS_CAPITAL | ACTOR:VOSS_CAPITAL_COMPLEX | Schedule 13D | 0000921895-26-000615 | 2026-03-04 | 2026-03-04 20:16:45 | true | 2026-03-05 09:30:00 | NA | null | null | NONE | ORIGINAL | true | true | https://www.sec.gov/Archives/edgar/data/1802156/000092189526000615/0000921895-26-000615-index.htm | Initial Voss 13D. Retained as one activist economic actor regardless of multiple affiliated reporting persons. |
| CE-2026-XPOF-S1-001 | Xponential Fitness, Inc. | 0001802156 | XPOF | NA | S1 | FORM4_10PCT_OWNER_PURCHASE_P_AFFILIATED_VEHICLE | VOSS_CAPITAL | ACTOR:VOSS_CAPITAL_COMPLEX | Form 4 | 0002060757-26-000035 | 2026-05-19 | 2026-05-21 19:08:41 | true | 2026-05-22 09:30:00 | POSITIVE | null | shares | NONE | NONE | true | true | https://www.sec.gov/Archives/edgar/data/1802156/000206075726000035/0002060757-26-000035-index-headers.html | Voss Capital and affiliated Voss entities/reporting persons disclosed subsequent purchases. S1 classification is `P_AFFILIATED_VEHICLE_PURCHASE`; not an independent actor from the 13D. |
| CE-2026-LODE-S2-001 | Comstock Inc. | 0001120970 | LODE | 205750409 | S2 | COOPERATION_AGREEMENT_BOARD_CHANGE | MAK_CAPITAL | ACTOR:MAK_CAPITAL_COMPLEX | Schedule 13D | 0000921895-26-000805 | 2026-03-23 | 2026-03-25 16:26:52 | true | 2026-03-26 09:30:00 | NA | 8.1 | percent_beneficial_ownership | NONE | ORIGINAL | true | true | https://www.sec.gov/Archives/edgar/data/1120970/000092189526000805/0000921895-26-000805-index.htm | MAK reported 5,763,729 shares / 8.1%. Item 4 discloses a March 23 Cooperation Agreement with Comstock, board expansion/new appointees, standstill and voting obligations. |
| CE-2026-LODE-S1-001 | Comstock Inc. | 0001120970 | LODE | NA | S1 | FORM4_CEO_OPEN_MARKET_PURCHASE_P | CORRADO_DE_GASPERIS | ISSUER:LODE_MANAGEMENT | Form 4 | 0001437749-26-019466 | 2026-06-03 | 2026-06-03 18:42:33 | true | 2026-06-04 09:30:00 | POSITIVE | 10682 | shares | NONE | NONE | true | true | https://www.sec.gov/Archives/edgar/data/1120970/000143774926019466/0001437749-26-019466-index.htm | CEO/director code-P purchase, 10,682 shares at $3.975. Genuine purchase row with no compensatory remark in filing. |

## Derived pairs

| convergence_event_id | issuer | component_event_ids | component_order | calendar_gap_days | window_class | independence_state | shared_cause_candidate | dependence_rationale | convergence_t0_ET | executable_t0_ET | base_test_eligible | returns_unlock_commit |
|---|---|---|---|---:|---|---|---|---|---|---|---|---|
| CV-XPOF-2026-001 | XPOF | CE-2026-XPOF-S2-001 + CE-2026-XPOF-S1-001 | Voss 13D -> Voss-affiliated Form 4 purchase | 78 | W90 | I1_COMMON_CAUSE_LIKELY | true | Same activist economic group appears in both filings. This is escalation/persistence, not orthogonal convergence. | 2026-05-21 19:08:41 | 2026-05-22 09:30:00 | false | NULL |
| CV-LODE-2026-001 | LODE | CE-2026-LODE-S2-001 + CE-2026-LODE-S1-001 | MAK 13D/cooperation -> issuer CEO purchase | 70 | W90 | I2_DEPENDENCE_UNKNOWN | true | Distinct actors, but the 13D publicly documents a formal Cooperation Agreement between activist and issuer. Independence of the later CEO purchase cannot be established from public evidence. | 2026-06-03 18:42:33 | 2026-06-04 09:30:00 | false | NULL |

## Excluded semantic control
Comstock director Leo M. Drozdoff Form 4 accession `0001437749-26-010884` is **not added as an S1 component** despite Table I code `P`. Filing remarks state that 28,000 shares at $3 represented payment for prior annual director services under issuer equity incentive plans. It is classified `P_COMPENSATORY_OR_SERVICE_PAYMENT` under INSIDER PURCHASE Ω v0.2.

## Delta audit
`NEW_COMPONENT_ROWS = 4`
`NEW_PAIR_ROWS = 2`
`NEW_I3_BASE_ELIGIBLE = 0`
`CUMULATIVE_COMPONENT_ROWS = 14`
`CUMULATIVE_PAIR_ROWS = 6`
`CUMULATIVE_I3_BASE_ELIGIBLE = 0`
`RETURNS_ACCESS = LOCKED`
