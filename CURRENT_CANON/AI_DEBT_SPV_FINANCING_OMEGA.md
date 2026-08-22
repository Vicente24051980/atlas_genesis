# AI Debt / SPV Financing Ω v1.0

**Status:** ACTIVE / SPECIALIST RISK & FUNDING MODULE  
**Effective date:** 2026-08-22  
**Authority:** compatible canonical module under ATLAS Ω ENTERPRISE v3.1; subordinate to Evidence Integrity Ω and Primary Source Gate Ω.

## Mission

Detect when AI infrastructure growth is increasingly financed through debt, leases, project finance, guarantees, vendor financing, structured vehicles or special-purpose vehicles, and determine whether the incremental funding structure preserves or degrades owner economics.

## Core chain

**AI CAPEX → funding source → recourse / guarantees → cost of capital → maturities / refinancing → deployment → utilization → revenue → margin → OCF → FCF/share → incremental ROIC → payback → fragility.**

## Constitutional laws

1. **AI DEMAND ≠ FUNDING QUALITY.**
2. **CAPEX GROWTH ≠ CAPEX PRODUCTIVITY.**
3. **SPV ≠ OFF-BALANCE-SHEET RISK TRANSFER unless contractual recourse is verified.**
4. **DEBT ISSUANCE ≠ FINANCIAL FRAGILITY by itself.**
5. **CDS MOVE ≠ FUNDAMENTAL DETERIORATION without primary/market evidence and context.**
6. **SELL-SIDE / MEDIA CLAIM ≠ ECONOMIC PROOF.** All numeric funding claims pass Primary Source Gate Ω.
7. **REAL DEMAND CAN COEXIST WITH BAD CAPITAL ALLOCATION.**
8. This module cannot issue BUY/SELL orders by itself.

## Required fields

For each issuer/project:

- issuer / sponsor / borrower
- funding amount and currency
- instrument type
- SPV / project vehicle identity
- on-balance-sheet vs vehicle-level debt
- recourse to parent
- guarantees / keepwell / purchase commitments
- collateral
- tenor and maturity wall
- fixed/floating rate
- weighted cost of debt where verifiable
- lease obligations
- vendor financing
- customer prepayments / take-or-pay
- related-party exposure
- refinancing dependency
- capex funded / capacity created
- utilization assumptions
- revenue linkage
- OCF/FCF linkage
- incremental ROIC / payback
- CDS / bond spread evidence if verified
- evidence IDs and dates
- falsifiers

## Funding states

- `AF0_SELF_FUNDED`: internally funded; minimal external dependency.
- `AF1_AUGMENTED`: external funding improves scale without material dependence.
- `AF2_STRUCTURED_DEPENDENT`: growth materially depends on structured/external funding.
- `AF3_REFINANCING_SENSITIVE`: economics depend materially on rollover / spread / rate conditions.
- `AF4_REFLEXIVE_FRAGILITY`: funding stress can reduce deployment, demand, revenue and collateral values in a feedback loop.

These states are descriptive, not automatic investment verdicts.

## Primary Source Gate Ω

Before a funding claim can move beyond `DISCOVERY_SIGNAL`, verify against one or more of:

- SEC filings / prospectus / indenture / 8-K / 10-Q / 10-K
- issuer IR presentation or earnings call
- lender / arranger documentation when public
- rated bond documentation / credit-agency publication
- exchange / regulator filing

Reuters or other high-quality journalism may support discovery and event verification, but contractual recourse, debt amount, maturities and guarantees should be traced to primary documentation whenever available.

## CDS / credit-spread discipline

CDS or bond-spread claims require:

**instrument identity → timestamp → maturity → spread level → prior comparable level → peer/market move → issuer-specific catalyst → evidence source.**

Absent that chain, status remains `VERIFY`; never feed an unverified statement such as “Big Tech CDS are surging” directly into AI Financial Fragility Ω.

## Integration

- **AI CAPEX Payback Ω:** tests whether funded capacity earns adequate returns.
- **AI Financial Fragility Ω:** consumes AF states and refinancing/recourse risk.
- **AI Credit Transmission Ω:** tests whether funding stress propagates into suppliers, hyperscalers or market liquidity.
- **Capital Funding Quality Ω / Financed Demand Ω:** owns funding sustainability and demand interdependence.
- **Global CAPEX Chain Ω:** maps suppliers receiving the funded spend.
- **Expected Return Ω:** remains independent and uses verified owner economics only.

## Broadcom / SPV calibration case — 22 Aug 2026

Media reporting that Broadcom-related AI infrastructure financing may involve very large debt/SPV structures enters ATLAS as `VERIFIED_DISCOVERY_SIGNAL` only to the extent independently verified. Contractual recourse, guarantees, exact debt stack and owner economics remain `PRIMARY_SOURCE_REQUIRED` before affecting fragility scores.

## Final law

**Funding scale is not a moat. ATLAS must trace who ultimately bears the obligation and whether the funded asset earns more than its true all-in cost of capital.**
