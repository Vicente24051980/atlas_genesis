# INSIDER PURCHASE Ω — Preregistration v0.2

**Date:** 2026-09-06
**Supersedes:** `2026-09-06_INSIDER_PURCHASE_OMEGA_PREREG_v0_1.md`
**Status:** PREREGISTERED / RETURNS LOCKED

## Purpose
Test whether publicly disclosed insider purchases contain reproducible post-publication information without cherry-picking winners or misclassifying compensatory transactions as discretionary insider conviction.

## Core laws
`FORM4_EVENT != BUY_SIGNAL`

`CODE_P = NECESSARY_BUT_NOT_SUFFICIENT`

A transaction enters the base S1 sample only when both the SEC transaction code and the filing's economic substance support a genuine insider purchase with capital at risk.

## Eligible base event
All conditions are required:
1. SEC Form 4 publicly filed.
2. Transaction code `P` in common equity or economically equivalent ordinary shares.
3. Filing text, footnotes and remarks do not show that the transaction is compensation, a grant, services payment, automatic acquisition, tax settlement, exercise/conversion, issuer-directed transfer, or another non-discretionary/compensatory mechanism.
4. The transaction represents an economically genuine acquisition for consideration by the reporting person or a clearly identified beneficial-owner vehicle.
5. Source accession and public timestamp are pinned before outcomes are opened.

## Transaction Code Gate Ω
A code-P row is classified into one of the following **before returns**:
- `P_CASH_AT_RISK_CONFIRMED` — genuine open-market/private purchase for consideration; eligible for base S1.
- `P_ECONOMIC_SUBSTANCE_AMBIGUOUS` — code P but footnotes/consideration mechanics do not establish a clean discretionary purchase; quarantine.
- `P_COMPENSATORY_OR_SERVICE_PAYMENT` — compensation/services/equity-plan substance; excluded from base S1 even if Table I uses code P.
- `P_AFFILIATED_VEHICLE_PURCHASE` — genuine purchase by a 10% owner/fund/vehicle; eligible only in the 10% owner stratum and subject to affiliation/de-duplication rules.

### Primary-source control case that forced v0.2
Comstock Inc. director Leo M. Drozdoff filed a Form 4 accepted 2026-04-01 showing code `P`, 28,000 shares at $3.00. The filing remarks state that the common stock payment was granted for annual director services under issuer equity incentive plans and represented accrued compensation for prior services. Therefore:

`TABLE_I_CODE_P -> P_COMPENSATORY_OR_SERVICE_PAYMENT -> BASE_S1_EXCLUDED`

This case proves that transaction-code filtering alone is insufficient.

## Excluded base events
- gifts;
- grants/awards;
- option exercises/conversions unless studied in a separate family;
- automatic vesting;
- tax withholding;
- compensation paid in shares;
- services payments in shares;
- issuer-directed or plan-driven acquisitions without evidence of discretionary capital at risk;
- dispositions/sales;
- ambiguous P-coded transactions until economic substance is resolved.

## Timestamp law
Backtest clock starts at `PUBLICATION_TIMESTAMP`, never transaction date.
If the filing is accepted after the regular market close, record first executable regular-session timestamp separately.

## Frozen fields
`ISSUER_CIK | TICKER | INSIDER_NAME | ROLE | OWNER_TYPE | TRANSACTION_DATE | PUBLICATION_TIMESTAMP | EXECUTABLE_TIMESTAMP | CODE | ECONOMIC_PURCHASE_CLASS | SHARES | PRICE | VALUE | CONSIDERATION_TYPE | DIRECT_INDIRECT | POST_TXN_HOLDINGS | OWNERSHIP_DELTA_PCT | PURCHASE_VALUE_TO_PRIOR_HOLDING_VALUE | TEN_B5_1_FLAG | FOOTNOTE_REVIEWED | CLUSTER_ID | ACTOR_AFFILIATION_GROUP | MARKET_CAP | SECTOR | OPTIONS_LIQUIDITY_BUCKET | SOURCE_ACCESSION`

## Pre-registered strata
- CEO
- CFO
- founder/chair
- other officer
- director
- 10% owner / external blockholder
- single purchase vs multi-insider cluster
- purchase-value / pre-existing holding-value buckets
- options-liquidity buckets
- micro/small/mid/large-cap buckets

No stratum receives a priori points.

## Cluster definition
A cluster is a company-level window with >=2 **distinct insider economic actors** making eligible `P_CASH_AT_RISK_CONFIRMED` purchases within 30 calendar days. Sensitivity grid: 15/30/60 days, fully disclosed.

Multiple reporting persons belonging to the same controlled fund/vehicle complex count as one economic actor unless independence is documented.

## Independence interaction
For CROSS-SIGNAL CONVERGENCE Ω, an insider purchase from the same activist, fund, affiliated vehicle or issuer-management information system does not become an independent confirmation merely because it appears on a different SEC form.

## Falsifiers
- Alpha disappears when using publication timestamp instead of transaction date.
- Alpha is explained by size/value/momentum/sector exposures.
- Results vanish after excluding overlapping clustered events.
- Results are confined to illiquid microcaps.
- Results disappear in the high-options-liquidity stratum.
- Results depend on a handful of extreme winners.
- Results materially weaken after `P_COMPENSATORY_OR_SERVICE_PAYMENT` and ambiguous-P rows are removed.

## Outputs after freeze
1M / 3M / 6M / 12M absolute and benchmark-adjusted returns; median/mean; hit rate; MFE/MAE; drawdown; bootstrap CI; equal-event and issuer-clustered inference.

## Versioning law
v0.1 is retained as an immutable methodological predecessor. v0.2 was created **before forward returns were unlocked**, in response to a primary-source classification failure discovered during registry population. This is an admissible preregistration repair, not an outcome-driven threshold change.

## State
`INSIDER_PURCHASE_STATE = A0_UNTESTED`
`INSIDER_PURCHASE_PREREG = v0.2`
`RETURNS_ACCESS = LOCKED`
