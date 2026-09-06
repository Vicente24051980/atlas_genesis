# ACTIVIST 13D Ω — Preregistration v0.2

**Date:** 2026-09-06
**Supersedes:** `2026-09-06_ACTIVIST_13D_OMEGA_PREREG_v0_1.md`
**Status:** PREREGISTERED / RETURNS LOCKED

## Purpose
Test whether genuinely external public Schedule 13D activist disclosures contain reproducible post-publication information after conditioning on filer identity, objective, regulatory regime and outcome path.

## Core laws
`13D_FILED != EXTERNAL_ACTIVIST`

`13D_FILED != ACTIVIST_ALPHA`

Schedule 13D is a disclosure form, not an economic identity. Before any Item 4 objective is interpreted as activism, the reporting person's relationship with the issuer must be classified from primary filing evidence.

## Activist Identity Gate Ω
Every 13D public state receives one primary filer-relationship class **before returns**:

- `13D_EXTERNAL_ACTIVIST` — outsider with no issuer management/board/control affiliation identified, using ownership to influence governance, strategy, operations, capital allocation, sale/M&A or control.
- `13D_EXTERNAL_BLOCKHOLDER_NONACTIVIST` — outside owner filing 13D but contemporaneous purpose is investment/ownership without an active influence objective.
- `13D_ISSUER_AFFILIATED_INSIDER` — reporting person is a current officer, director, controlled insider vehicle, or equivalent issuer-management affiliate.
- `13D_FOUNDER_FAMILY_CONTROL_HOLDER` — founder/family/control-person ownership or estate-planning structure associated with issuer control/governance.
- `13D_FORMER_INSIDER_WITH_CONTINUING_TIES` — former officer/director or related vehicle where contractual, equity-plan, strategic, board, covenant or other issuer ties remain relevant.
- `13D_TRANSACTIONAL_RESTRUCTURING` — filing/amendment driven primarily by transfers, distributions, merger consideration, preferred conversion, tender, estate planning or similar ownership mechanics rather than a new activist thesis.
- `13D_RELATIONSHIP_AMBIGUOUS` — relationship cannot be resolved from public evidence; quarantine from clean external-activist base sample.

Only `13D_EXTERNAL_ACTIVIST` enters the clean ACTIVIST 13D base test. Other classes may be analyzed separately but cannot inherit the activist prior.

## Required relationship fields
Add to the frozen schema:

`CURRENT_OFFICER | CURRENT_DIRECTOR | FORMER_OFFICER_DIRECTOR | FOUNDER_FAMILY_LINK | CONTROL_PERSON_LINK | ISSUER_BUSINESS_ADDRESS_OVERLAP | ISSUER_EQUITY_PLAN_SOURCE | ISSUER_TRANSACTION_COUNTERPARTY | SHAREHOLDER_COVENANT | COOPERATION_OR_SETTLEMENT | BOARD_NOMINATION_RIGHT | INFORMATION_RIGHT | OTHER_FORMAL_ISSUER_TIE | FILER_RELATIONSHIP_CLASS | RELATIONSHIP_EVIDENCE_TEXT`

A filer-name mismatch is **not** evidence of independence.

## Primary-source controls that forced v0.2

### Commercial Bancgroup / CBK
A secondary 13D+Form4 cluster screen characterized Robertson Holding Company as an outside activist and paired its 2026-04-27 13D with CFO Philip Metheny's genuine 2026-04-30 open-market purchase.

Primary SEC evidence invalidates the external-activist classification:
- the 13D reporting group includes John Adam Robertson and Aaron A. Robertson;
- Item 2 states both currently serve on Commercial Bancgroup's board;
- the 2026-04-27 filing is an amendment describing distributions of Robertson Holding Company assets to family trusts, with no purchase price paid for the transfers;
- the original 13D likewise identifies the Robertsons as issuer directors.

Therefore:

`CBK_13D -> 13D_FOUNDER_FAMILY_CONTROL_HOLDER / 13D_TRANSACTIONAL_RESTRUCTURING`

not `13D_EXTERNAL_ACTIVIST`.

The later CFO code-P purchase is genuine, but it does not create external-activist + management convergence because the first component fails the external-activist identity gate.

### OceanPal / SVRN
A secondary screen also identified Abra Marinvest and Tuscany Shipping filings followed by Co-CEO Salvatore Ternullo purchases.

Primary SEC evidence again shows issuer-connected ownership networks:
- Abra's controlling person Ioannis Zafirakis is described as an OceanPal board and executive-committee member;
- the filing describes issuer equity awards, vessel transactions involving a Zafirakis-controlled entity, shareholder covenants and repeated transactions with the issuer;
- the Tuscany/Paliou filing states Semiramis Paliou had been the issuer's chair/director until October 2025 and describes continuing preferred-stock, PIPE, tender and shareholder-covenant relationships;
- Item 6 of the Tuscany/Paliou filing states certain preferred stock had been sold to Salvatore Ternullo, the later insider buyer.

Therefore these filings are not clean external activist channels. They are issuer-affiliated/continuing-tie ownership states and fail the ACTIVIST 13D base identity gate.

## Actor-Network Gate Ω
`DIFFERENT_FILERS != INDEPENDENT_ACTORS`

Before cross-signal use, check current/former board roles, management roles, family/control links, fund affiliation, contractual cooperation, shareholder covenants, issuer transactions, nominee rights and other formal relationships.

A pair can become `I3_DISTINCT_PUBLIC_CHANNELS` only after economic-actor independence, not merely string-name independence, is affirmatively supported.

## Timestamp law
Backtest clock starts at `PUBLICATION_TIMESTAMP` of the first filing that publicly establishes both eligible filer identity and tested objective. Never use the 5% crossing date as a tradable timestamp.

## Regulatory regime split
- `R0_PRE_2024-02-05`: historic initial 13D filing window up to 10 days after triggering event.
- `R1_POST_2024-02-05`: initial 13D filing deadline 5 business days.
Regimes are estimated separately before pooled inference.

## Frozen identity/event fields
`ISSUER_CIK | TICKER | FILER | FILER_TYPE | FILER_RELATIONSHIP_CLASS | ACCESSION | INITIAL_OR_AMENDMENT | PUBLICATION_TIMESTAMP | BENEFICIAL_OWNERSHIP_PCT | ITEM4_TEXT | OBJECTIVE_CLASS | SOURCE_OF_FUNDS | CURRENT_OFFICER | CURRENT_DIRECTOR | FORMER_OFFICER_DIRECTOR | FOUNDER_FAMILY_LINK | CONTROL_PERSON_LINK | ISSUER_TRANSACTION_COUNTERPARTY | SHAREHOLDER_COVENANT | COOPERATION_OR_SETTLEMENT | BOARD_SEAT_STATE | NOMINATION_STATE | SALE_PROCESS_STATE | MNA_PROPOSAL_STATE | CAPITAL_ALLOCATION_DEMAND | GOVERNANCE_DEMAND | OPERATIONAL_DEMAND | EXIT_STATE | REGULATORY_REGIME | RELATIONSHIP_EVIDENCE_TEXT`

## Item 4 objective taxonomy
For eligible external filers, mutually non-exclusive raw tags plus one primary class:
- `INVESTMENT_ONLY`
- `GOVERNANCE_ENGAGEMENT`
- `BOARD_SEAT_OR_NOMINATION`
- `OPERATIONAL_CHANGE`
- `CAPITAL_ALLOCATION_CHANGE`
- `STRATEGIC_REVIEW_OR_SALE`
- `MNA_OR_CONTROL_PROPOSAL`
- `BLOCK_EXIT_OR_DISTRIBUTION`
- `OTHER`

Identity classification precedes objective classification. An issuer director asking for strategic change is not relabeled an external activist simply because Item 4 sounds activist.

## Outcome law
Outcome cannot redefine entry eligibility ex post. Outcomes are recorded only for conditional analysis:
`NO_OBSERVED_OUTCOME | PARTIAL_CONCESSION | BOARD_GAIN | STRATEGIC_CHANGE | SALE/MERGER | CAPITAL_RETURN | ACTIVIST_EXIT | FAILED_CAMPAIGN | OPEN`

## Falsifiers
- Post-publication alpha disappears under the 5-day regime.
- Apparent alpha is announcement-gap capture unavailable to a public follower.
- Results are concentrated in later-acquired targets.
- Investment-only external 13D performs similarly to explicit external activism.
- Results disappear after sector/size/value/momentum controls.
- A few activist franchises explain the sample.
- Results materially weaken once issuer-affiliated/founder/control/transactional 13Ds are removed.

## Versioning law
v0.1 is preserved. v0.2 is a preregistration repair made while `RETURNS_ACCESS = LOCKED`, triggered by primary-source falsification of external-activist labels during convergence-registry population. No outcome data motivated the change.

## State
`ACTIVIST_13D_STATE = A0_UNTESTED`
`ACTIVIST_13D_PREREG = v0.2`
`RETURNS_ACCESS = LOCKED`
