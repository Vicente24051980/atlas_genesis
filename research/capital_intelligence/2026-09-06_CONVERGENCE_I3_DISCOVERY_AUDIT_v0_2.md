# CROSS-SIGNAL CONVERGENCE Ω — I3 Discovery Audit v0.2

**Date:** 2026-09-06
**Supersedes:** `2026-09-06_CONVERGENCE_I3_DISCOVERY_AUDIT_v0_1.md`
**Status:** PRIMARY-SOURCE IDENTITY AUDIT / NO RETURNS

## Executive result
`CLEAN_I3_FOUND = NO`

A secondary cross-source screen reported two distinct 2026 examples of Schedule 13D followed by a non-self-filed insider code-P purchase within 90 days: Commercial Bancgroup (CBK) and OceanPal (SVRN). Primary SEC review shows that **neither is a clean external-activist + independent-management channel under ATLAS**.

This audit therefore tightens, rather than relaxes, the convergence framework.

## New law
`FILER_NAME_MISMATCH != ECONOMIC_ACTOR_INDEPENDENCE`

`SCHEDULE_13D != EXTERNAL_ACTIVIST`

A name mismatch is only a discovery heuristic. Independence requires actor-network and issuer-affiliation review.

---

## Candidate A — Commercial Bancgroup / CBK

### Secondary pattern
- Schedule 13D state public 2026-04-27.
- CFO Philip J. Metheny purchased 3,300 shares on 2026-04-30.
- Three-day event gap appears superficially ideal for `13D + INSIDER_P` convergence.

### Primary SEC facts
**13D accession:** `0000898432-26-000286`, accepted `2026-04-27 16:37:22 ET`.

Primary filing evidence:
- the reporting group includes Robertson Holding Company, John Adam Robertson, Aaron A. Robertson and family trusts;
- Item 2 states John Adam Robertson and Aaron A. Robertson currently serve on Commercial Bancgroup's board of directors;
- Item 4 states the amendment reflects March 2026 transfers/distribution of Robertson Holding Company assets to family trusts and that no purchase price was paid specifically for those transfers;
- the original 2025 Schedule 13D also identified the Robertsons as issuer directors and described the holding as pre-IPO ownership.

**Form 4 accession:** `0000898432-26-000306`, accepted `2026-05-01 19:27:10 ET`.
- CFO Philip J. Metheny genuinely purchased 3,300 common shares at weighted-average $29.0182 on 2026-04-30.
- The purchase row is a valid `P_CASH_AT_RISK_CONFIRMED` candidate; the filing separately references existing RSUs, which do not change the cash-purchase classification.

### ATLAS classification
13D relationship:
`13D_FOUNDER_FAMILY_CONTROL_HOLDER + 13D_TRANSACTIONAL_RESTRUCTURING`

Not:
`13D_EXTERNAL_ACTIVIST`

Derived convergence:
`C2_ACTIVIST13D_PLUS_INSIDER = NOT_FORMED`

The insider purchase is valid S1, but the first component fails the external-activist identity gate. No I3 pair exists.

---

## Candidate B — OceanPal / SVRN

### Secondary pattern
Two simultaneous 13D/A filers were paired with Co-CEO/director Salvatore J. Ternullo's April 2026 open-market purchases.

### Primary SEC facts — Abra Marinvest / Ioannis Zafirakis
**13D/A accession:** `0000919574-26-000467`, accepted `2026-01-26 16:43:19 ET`.

The filing states:
- Ioannis Zafirakis is an OceanPal board member and member of the Executive Committee;
- the reporting persons' securities derive in part from issuer equity awards, preferred securities and strategic/asset transactions;
- a Zafirakis-controlled entity had sold a vessel to the issuer for consideration including preferred shares;
- shareholder covenants and direct issuer tender/purchase transactions are disclosed;
- Item 4 explicitly recognizes Zafirakis's influence over corporate activities.

Classification:
`13D_ISSUER_AFFILIATED_INSIDER / CONTROL_NETWORK`

### Primary SEC facts — Tuscany / Semiramis Paliou
**13D/A accession:** `0000919574-26-000468`, accepted `2026-01-26 16:45:06 ET`.

The filing states:
- Semiramis Paliou had served as OceanPal chair/director/executive-committee participant until October 2025;
- continuing preferred-stock, PIPE, tender and shareholder-covenant relationships remained;
- Item 6 states preferred stock had been sold to Salvatore Ternullo, the later Co-CEO insider buyer.

Classification:
`13D_FORMER_INSIDER_WITH_CONTINUING_TIES`

### Insider purchase
Salvatore J. Ternullo, Co-CEO and director, made genuine open-market purchases in April 2026. The 2026-04-16 Form 4 (accession `0000919574-26-002252`, accepted `2026-04-16 13:57:50 ET`) reports 500 shares at $10.78; filing remarks identify it as an open-market purchase and note another 500 shares previously acquired on 2026-04-13.

### ATLAS classification
The insider purchase is valid S1, but neither 13D channel is a clean external activist. The relevant actors are embedded in the issuer's governance/transaction network.

Therefore:
`C2_ACTIVIST13D_PLUS_INSIDER = NOT_FORMED`

not I3.

---

## Comparison with the secondary screen
The external screen used a practical rule: Schedule 13D + same-issuer Form 4 code P within 90 days + different filer names. That is useful for candidate generation but insufficient for ATLAS causal/independence labeling.

ATLAS adds two mandatory gates:
1. `ACTIVIST_IDENTITY_GATE` — is the 13D filer actually external to issuer management/control networks?
2. `ACTOR_NETWORK_GATE` — are the two public signals economically independent after board, family, contractual, transactional and affiliation ties are checked?

Under these gates, both externally proposed clean examples are downgraded before returns are opened.

## Discovery implications
- Clean external-activist + independent-management buying appears even rarer than simple database name matching suggests.
- A 13D feed cannot be used as an activist feed without filer-relationship classification.
- Form-type convergence is not economic convergence.
- Family/control ownership, former insiders, strategic counterparties and issuer-affiliated vehicles are mandatory exclusion/stratification categories.

## Cumulative targeted audit
Inspected high-priority structures now include STIM, XPOF, LODE, CBK and SVRN.

- `I3_BASE_ELIGIBLE = 0`
- same-actor/common-cause cases: multiple
- formal-dependence/issuer-cooperation case: LODE
- invalid external-activist labels: CBK, SVRN
- Form4 code-P semantic false-positive control: LODE/Drozdoff

## Return firewall
No forward outcomes or post-event returns were used to classify any candidate.

`RETURNS_ACCESS = LOCKED`
