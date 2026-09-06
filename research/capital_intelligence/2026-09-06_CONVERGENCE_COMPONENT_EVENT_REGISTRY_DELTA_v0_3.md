# CONVERGENCE COMPONENT EVENT REGISTRY Ω — Delta v0.3

**Date:** 2026-09-06
**Base:** seed v0.1 + delta v0.2
**Schema:** `2026-09-06_CONVERGENCE_COMPONENT_EVENT_REGISTRY_SCHEMA_v0_1.md`
**Active preregistrations:** INSIDER PURCHASE Ω v0.2; ACTIVIST 13D Ω v0.2; CROSS-SIGNAL CONVERGENCE Ω v0.1
**State:** `PRIMARY_SEC_ACTOR_NETWORK_DELTA / RETURNS LOCKED`

## Purpose
Add primary-source controls discovered while trying to find a genuine `I3_DISTINCT_PUBLIC_CHANNELS` event. This delta deliberately preserves false-positive screens rather than deleting them, so the denominator records how often naive form/name matching fails.

## New component rows

| component_event_id | issuer_name | cik | ticker_at_event | signal_family | event_subtype | actor_id | actor_affiliation_group | source_form | source_accession | publication_timestamp_ET | executable_timestamp_ET | direction | magnitude_raw | magnitude_unit | public_data_complete | family_label_frozen | source_url | notes_no_forward_return |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---:|---|---|---|---|---|
| CE-2026-CBK-S2-001 | Commercial Bancgroup, Inc. | 0001981546 | CBK | S2 | 13D_FOUNDER_FAMILY_CONTROL_HOLDER__TRANSACTIONAL_RESTRUCTURING | ROBERTSON_GROUP | ISSUER:CBK_BOARD_FAMILY_NETWORK | Schedule 13D/A | 0000898432-26-000286 | 2026-04-27 16:37:22 | 2026-04-28 09:30:00 | NA | 8.5 | percent_beneficial_ownership | true | true | https://www.sec.gov/Archives/edgar/data/1981546/000089843226000286/ | Primary filing identifies John Adam Robertson and Aaron A. Robertson as current issuer directors. Amendment reflects distribution/transfers of Robertson Holding Company assets to family trusts. Not `13D_EXTERNAL_ACTIVIST`. |
| CE-2026-CBK-S1-001 | Commercial Bancgroup, Inc. | 0001981546 | CBK | S1 | FORM4_CFO_P_CASH_AT_RISK_CONFIRMED | PHILIP_METHENY | ISSUER:CBK_MANAGEMENT | Form 4 | 0000898432-26-000306 | 2026-05-01 19:27:10 | 2026-05-04 09:30:00 | POSITIVE | 3300 | shares | true | true | https://www.sec.gov/Archives/edgar/data/1981546/000089843226000306/0000898432-26-000306-index.htm | EVP/CFO purchased 3,300 common shares at weighted-average $29.0182. Valid S1 purchase, but no clean activist component exists to pair with it. |
| CE-2026-SVRN-S2-001 | OceanPal Inc. | 0001869467 | SVRN | S2 | 13D_ISSUER_AFFILIATED_INSIDER_CONTROL_NETWORK | ABRA_MARINVEST_ZAFIRAKIS | ISSUER:SVRN_GOVERNANCE_TRANSACTION_NETWORK | Schedule 13D/A | 0000919574-26-000467 | 2026-01-26 16:43:19 | 2026-01-27 09:30:00 | NA | null | null | true | true | https://www.sec.gov/Archives/edgar/data/1869467/000091957426000467/ | Primary filing identifies Ioannis Zafirakis as issuer board/executive-committee member and describes issuer equity awards, preferred securities, vessel/PIPE transactions and shareholder covenants. Not external activism. |
| CE-2026-SVRN-S2-002 | OceanPal Inc. | 0001869467 | SVRN | S2 | 13D_FORMER_INSIDER_WITH_CONTINUING_TIES | TUSCANY_SHIPPING_PALIOU | ISSUER:SVRN_GOVERNANCE_TRANSACTION_NETWORK | Schedule 13D/A | 0000919574-26-000468 | 2026-01-26 16:45:06 | 2026-01-27 09:30:00 | NA | null | null | true | true | https://www.sec.gov/Archives/edgar/data/1869467/000091957426000468/0000919574-26-000468-index.htm | Semiramis Paliou had served as issuer chair/director and retained preferred-stock, PIPE, tender and covenant ties. Filing also describes preferred stock sold to later insider buyer Salvatore Ternullo. |
| CE-2026-SVRN-S1-001 | OceanPal Inc. | 0001869467 | SVRN | S1 | FORM4_COCEO_P_CASH_AT_RISK_CONFIRMED | SALVATORE_TERNULLO | ISSUER:SVRN_MANAGEMENT | Form 4 | 0000919574-26-002252 | 2026-04-16 13:57:50 | 2026-04-16 13:57:50 | POSITIVE | 500 | shares | true | true | https://www.sec.gov/Archives/edgar/data/1869467/000091957426002252/ | Co-CEO/director open-market purchase of 500 shares at $10.78; remarks also reference an earlier 500-share open-market acquisition on 2026-04-13. Valid S1, but proposed 13D legs fail external-activist identity. |
| CE-2026-WGS-S2-001 | GeneDx Holdings Corp. | 0001818331 | WGS | S2 | 13D_ISSUER_AFFILIATED_INSIDER_OWNERSHIP_UPDATE | CASDIN_CORVEX_CMLS_GROUP | ACTOR:WGS_CASDIN_CMLS_NETWORK | Schedule 13D/A | 0000919574-26-003685 | 2026-05-22 17:20:24 | 2026-05-26 09:30:00 | NA | 11.9 | percent_beneficial_ownership | true | true | https://www.sec.gov/Archives/edgar/data/1818331/000091957426003685/0000919574-26-003685-index.htm | Amendment No. 12 expressly names Eli Casdin among reporting persons. Filing states Casdin controls/advises Casdin vehicles, shares discretion over CMLS holdings and holds board-service options/RSUs; amendment updates Items 3/5 and transaction schedules rather than revealing a new external activist objective. |
| CE-2026-WGS-S1-001 | GeneDx Holdings Corp. | 0001818331 | WGS | S1 | FORM4_DIRECTOR_10PCT_AFFILIATED_VEHICLE_PURCHASE | ELI_CASDIN_CASDIN_CAPITAL | ACTOR:WGS_CASDIN_CMLS_NETWORK | Form 4 | 0000919574-26-003907 | 2026-06-08 17:25:13 | 2026-06-09 09:30:00 | POSITIVE | 200000 | shares | true | true | https://www.sec.gov/Archives/edgar/data/1818331/000091957426003907/0000919574-26-003907-index.htm | Casdin Capital / Casdin Partners / Eli Casdin reported open-market purchases beginning 2026-06-04. Eli Casdin is director and 10% owner. Same economic actor/network as the 13D. |

## Candidate-screen disposition

| screen_id | issuer | apparent pattern | ATLAS disposition | independence_state | base_test_eligible | reason |
|---|---|---|---|---|---|---|
| SCR-CBK-2026-001 | CBK | 13D -> CFO Form4 P | C2_NOT_FORMED | I1_COMMON_CAUSE_LIKELY | false | The 13D is family/board/control ownership and restructuring, not external activism. Different filer names do not create an activist-management pair. |
| SCR-SVRN-2026-001 | SVRN | Abra 13D -> Co-CEO Form4 P | C2_NOT_FORMED | I1_COMMON_CAUSE_LIKELY | false | 13D controller is embedded in issuer board/executive/transaction network. |
| SCR-SVRN-2026-002 | SVRN | Tuscany/Paliou 13D -> Co-CEO Form4 P | C2_NOT_FORMED | I1_COMMON_CAUSE_LIKELY | false | Former chair/director with continuing issuer ties; filing documents transaction links to Ternullo. |
| SCR-WGS-2026-001 | WGS | 13D/A -> director/10% owner Form4 P | SAME_ACTOR_ESCALATION_ONLY | I1_COMMON_CAUSE_LIKELY | false | Eli Casdin is explicitly a reporting person in the 13D and controls the purchasing Casdin entities in the Form 4. Same actor, not convergence. |

## False-positive-screen law
A discovery screen may use form type, issuer and filer-name mismatch to generate candidates, but **candidate generation is not labeling**.

Required sequence:

`FORM_MATCH -> FILER_RELATIONSHIP_CLASS -> ACTOR_NETWORK_RESOLUTION -> ECONOMIC_SUBSTANCE -> I0/I1/I2/I3`

Never:

`13D + FORM4 + DIFFERENT STRING NAME -> I3`

## Cumulative registry audit
Prior cumulative state after delta v0.2:
- component rows: 14
- candidate pair/screen rows: 6
- I3 base eligible: 0

Delta v0.3 adds:
- component rows: 7
- candidate screen dispositions: 4
- I3 base eligible: 0

New cumulative state:
`COMPONENT_ROWS = 21`
`PAIR_OR_SCREEN_ROWS = 10`
`I3_BASE_ELIGIBLE = 0`
`RETURNS_ACCESS = LOCKED`

## Interpretation
The absence of a clean I3 after targeted primary-source search is retained as data. It implies that apparently independent 13D + insider-purchase combinations are substantially rarer after economic-actor and issuer-affiliation resolution than naive form-based screens suggest. No threshold is relaxed.
