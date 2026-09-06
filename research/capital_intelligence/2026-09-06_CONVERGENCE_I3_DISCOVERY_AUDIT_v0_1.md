# CROSS-SIGNAL CONVERGENCE Ω — I3 Discovery Audit v0.1

**Date:** 2026-09-06
**Parent:** `2026-09-06_CROSS_SIGNAL_CONVERGENCE_OMEGA_PREREG_v0_1.md`
**Status:** PRIMARY-SOURCE DISCOVERY AUDIT / NO RETURNS
**Objective:** locate the first defensible `I3_DISTINCT_PUBLIC_CHANNELS` pair without relaxing the frozen Independence Gate.

## Result
`CLEAN_I3_FOUND = NO`

This is a valid research result. The inspected candidates repeatedly show affiliation, same-actor repetition, common-cause risk, or transaction-semantic failure. The gate is therefore retained unchanged.

## Candidate audit

### 1. Neuronetics / STIM — Jorey Chernett 13D + subsequent Form 4 purchases
**Decision:** `I1_COMMON_CAUSE_LIKELY / BASE_TEST_INELIGIBLE`.

Reason: the activist 13D filer and subsequent 10% owner Form 4 buyer are the same economic actor, Jorey Chernett. A second SEC form does not create a second independent information channel.

Registry implication: retain the sequence as an escalation/intensification feature, not independent convergence.

### 2. Xponential Fitness / XPOF — Voss Capital 13D + subsequent Form 4 purchases
**13D:** accession `0000921895-26-000615`, accepted 2026-03-04 20:16:45 ET.

**Subsequent Form 4:** accession `0002060757-26-000035`, accepted 2026-05-21 19:08:41 ET, with Voss Capital / affiliated Voss vehicles and Travis Cocke as reporting persons; purchases occurred beginning 2026-05-19.

**Decision:** `I1_COMMON_CAUSE_LIKELY / BASE_TEST_INELIGIBLE`.

Reason: the 13D actor and later Form 4 actor are the same Voss economic group. This is position escalation by one activist, not cross-channel confirmation.

### 3. Comstock / LODE — MAK Capital 13D + subsequent CEO open-market purchase
**MAK 13D:** accession `0000921895-26-000805`, accepted 2026-03-25 16:26:52 ET. Event date 2026-03-23. MAK reported 5,763,729 shares / 8.1%.

Item 4 states that MAK and Comstock entered a **Cooperation Agreement** on 2026-03-23. The company expanded the board and appointed three new directors, while MAK accepted standstill and voting obligations. The filing also reserved potential future discussion of capital allocation, ownership structure, sale of the company, board structure and operations.

**CEO Form 4:** Corrado De Gasperis, accession `0001437749-26-019466`, accepted 2026-06-03 18:42:33 ET. Code `P`, 10,682 common shares at $3.975. He was CEO and director.

**Candidate pair:** 13D public state -> CEO cash purchase roughly 70 calendar days later, within W90.

**Decision:** `I2_DEPENDENCE_UNKNOWN / BASE_TEST_INELIGIBLE`.

Reason: the actors are formally distinct, but a documented activist-issuer Cooperation Agreement existed before the CEO purchase. The evidence does not establish that the later CEO purchase is informationally independent of the activist relationship or of the issuer's contemporaneous governance/capital-allocation process. The correct label is uncertainty, not assumed independence.

This is the closest I3 candidate found in the targeted discovery pass, and it **still fails the clean base gate**.

### 4. Comstock / LODE — Leo Drozdoff Form 4 transaction-code trap
**Form 4:** accession `0001437749-26-010884`, accepted 2026-04-01 16:15:31 ET. Table I reports code `P`, 28,000 shares at $3.00.

The filing remarks state that the common-stock payment was granted for annual director services under Comstock equity incentive plans and represented accrued compensation for prior services.

**Decision:** `NOT_AN_ELIGIBLE_S1_BASE_PURCHASE`.

This forces the universal insider rule:

`CODE_P = NECESSARY_BUT_NOT_SUFFICIENT`

`FORM4_TABLE_CODE -> FOOTNOTE/REMARKS_ECONOMIC_SUBSTANCE -> S1_CLASSIFICATION`

The event is classified `P_COMPENSATORY_OR_SERVICE_PAYMENT`, not `P_CASH_AT_RISK_CONFIRMED`.

## Methodological consequences

### TRANSACTION CODE GATE Ω
The Form 4 code alone is insufficient. Every candidate `P` event requires footnote/remarks review before base-sample admission. Compensation/services/equity-plan substance is excluded even when Table I uses `P`.

### SAME-ACTOR LAW
`13D + FORM4` from the same activist/10% owner is one actor expressed through two disclosure channels. It may measure escalation, but it cannot be counted as I3 convergence.

### COOPERATION-AGREEMENT LAW
A formal activist-issuer cooperation, settlement, board nomination agreement, information right or similar relationship blocks automatic I3 classification for later issuer-insider/corporate actions. Unless independence is affirmatively supported, classify `I2_DEPENDENCE_UNKNOWN` or `I1_COMMON_CAUSE_LIKELY` depending on evidence.

### ABSENCE IS DATA
Failure to locate an I3 event in a targeted pass is not grounds to lower the threshold. It estimates how rare clean orthogonal public convergence may be relative to naive multi-signal counts.

## Current audit counts
- candidate structures inspected: `STIM`, `XPOF`, `LODE`
- clean I3 pairs: `0`
- I1 same/common-actor cases: `>=2`
- I2 formal-dependence-risk cases: `1`
- transaction-code false-positive controls: `1`

## Return firewall
No forward price, alpha, MFE/MAE, hit/miss or outcome field was consulted or written into this audit.

`RETURNS_ACCESS = LOCKED`
