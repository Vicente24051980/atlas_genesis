# ATLAS Ω — Ρ Counterparty Exposure + AI Demand Provenance Hard Gates Ω v1.0

Date: 2026-09-05
Governance issue: #116
Status: CANDIDATE_CANONICAL_PENDING_PR_MERGE

## Ratification
Ρ was previously PENDING_RATIFICATION. The user subsequently gave an explicit instruction to finish all outstanding ATLAS tasks, including the list item requiring Ρ ratification. This issue records that authorization rather than silently treating the earlier draft as canonical.

## Ρ — Counterparty Exposure Ω
Single question: **to which counterparties is the portfolio economically exposed across multiple positions through declared non-ordinary-sales relationships?**

Ρ aggregates filings-backed guarantees, credit support, financing, material customer concentration, commitments and cross-exposures. It never estimates undisclosed exposure.

It keeps these economic kinds separate:
- RECOGNIZED
- DRAWN
- MAXIMUM_FACILITY
- CONTINGENT
- NO_CUANTIFICADA

They are never added into one fake notional. NO_CUANTIFICADA only increases record/position counts.

Ρ cannot BUY/SELL, set weights, admit/exclude, or change structural score.

## AI demand-provenance pre-score architecture
For companies materially linked to AI CAPEX:

T0 Anti-Megacap Discovery Gate Ω
→ T1 Fundamental Hard Gates
→ T2 Financing Quality Gate Ω
→ T3 Circular Demand Gate Ω
→ T4 Quality-Adjusted Backlog Ω
→ T5 Capital Risk Transfer Advantage Ω
→ ATLAS Fundamental Score
→ Expectation Gap Ω
→ CAPEX Asymmetry / P0 Adjusted Ω
→ Entry Timing Ω

The purpose is to prevent announced CAPEX, gross backlog, funded customer demand and economically independent end-demand from being treated as equivalent.

## Financing Quality Gate Ω
The gate asks where the money that created the order originated. Ten checks cover buyer/vendor independence, external cash-flow repayment, balance-sheet support, debt sustainability, lease dependence, vendor funding, guarantees/backstops, concentration, termination/prepayment protection and vendor-retained residual risk.

Unknown funding provenance is EVIDENCE_PENDING; it is never presumed organic.

## Circular Demand Gate Ω
ODQ = 100 - (C + V + G + L + R)

Maximum haircuts:
- C Circular capital: 25
- V Vendor financing: 20
- G Guarantees/backstops: 20
- L Lease/off-balance dependence: 15
- R Reflexive revenue/customer funding: 20

A haircut requires a **material economic nexus between support/financing and the demand being evaluated**. Mere equity ownership or commercial proximity does not earn a haircut.

Categories:
- 90–100 ORGANIC / PASS_HIGH_QUALITY
- 75–89 FINANCED BUT INDEPENDENT
- 60–74 SUPPORTED
- 40–59 REFLEXIVE
- <40 CIRCULARITY CRITICAL

Circularity is a demand-quality classification, not a fraud allegation.

## Quality-Adjusted Backlog Ω
`Backlog_Q = Backlog_reported × (ODQ/100) × CQ × FP`

CQ = Contract Quality in [0,1].
FP = Funding Probability in [0,1].

Example: 100 × 0.65 × 0.80 × 0.90 = 46.8.

Raw backlog may remain an accounting/disclosure fact, but AI-CAPEX economic proof must not bypass the adjusted-backlog layer where these gates are applicable.

## Capital Risk Transfer Advantage Ω
`CRTA = FCF captured / own capital at risk`

Invalid/zero denominator returns NO_CALCULABLE, not infinity.

For integrators/order quality:
- `OCQ = Cash collected / AI revenue`
- `WCI = (ΔAR + ΔInventory - ΔAP) / ΔRevenue`

Invalid denominators return NO_CALCULABLE.

## Canonical distinction
**Business Quality Ω != Marginal Demand Quality Ω.**
A high-quality supplier can have supported/reflexive marginal demand; that does not mechanically lower its structural business quality. The demand provenance modifies how much backlog/revenue evidence ATLAS capitalizes and how much funding/counterparty risk is carried forward.

## AI CAPEX PAYBACK opening rule
> Follow the money backwards. El backlog sólo vale tanto como el flujo de caja independiente que existe al final de la cadena para pagarlo.

## Boundaries
T0 remains upstream of all gates.
Falsifier Veto remains independent.
Decision Safety remains independent.
Ρ has zero decision/allocation authority.
No unavailable counterparty amount, ODQ component, CQ, FP, CRTA, OCQ or WCI may be inferred/backfilled merely to complete a score.
