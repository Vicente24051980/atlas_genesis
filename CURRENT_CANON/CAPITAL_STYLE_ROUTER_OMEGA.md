# CAPITAL STYLE ROUTER Ω v1.1

**Status:** CANONICAL / ACTIVE / TRANSVERSAL  
**Effective date:** 2026-09-06  
**Parent:** `CURRENT_CANON/CAPITAL_INTELLIGENCE_OMEGA.md`  
**Authority:** thesis classification + engine routing only. **No autonomous BUY/SELL authority.**

## Mission
Prevent ATLAS from scoring fundamentally different investment theses with one generic model, while preventing the classification itself from deciding the thesis.

`DISCOVERY SOURCE -> PLAUSIBLE ROUTES -> MULTI-ROUTE SENSITIVITY -> STYLE-SPECIFIC GATES -> COMMON ATLAS GATES -> COMPETITION FOR CAPITAL`

## Universal anti-contamination laws
- `SOURCE != THESIS CLASS`.
- `ALLOCATOR-SOURCED != HIGH QUALITY`.
- `DYNASTIC PRESTIGE != MANAGER SKILL`.
- `TARGET OWNERSHIP % != PORTFOLIO WEIGHT`.
- `13F != COMPLETE PORTFOLIO`.
- `13F POSITION_DATE != PUBLICATION_DATE`.
- `LONG DISCLOSURE != UNHEDGED NET LONG`.
- `QUALITY COMPOUNDER != NORMALIZATION / CONTRARIAN`.
- `HOLDCO / NAV != OPERATING COMPANY`.
- `STRATEGIC TURNAROUND != CURRENT QUALITY COMPOUNDER`.
- `ROUTE ASSIGNMENT != THESIS PROOF`.

## PRESTIGE TRANSFER GATE Ω
Reputation, lineage, brand, family continuity, historical wealth or control architecture never transfer investment skill to a current manager or fund.

Manager skill may be scored only from attributable evidence such as:
- independently reconstructable return history;
- benchmark-relative alpha from publication date;
- hit rate / median alpha / drawdown profile;
- persistence across market regimes;
- decision attribution to the actual team/vehicle;
- sufficiently long sample and sample-size disclosure.

Until these are demonstrated, allocator sourcing is `HYPOTHESIS / PRIORITY METADATA`, never a score premium.

## Orthogonal sourcing flags
These describe where an idea came from. They never choose a route and never enter THESIS_SCORE directly.
- `ALLOCATOR_SOURCED`
- `13F_SOURCED`
- `13D_13G_SOURCED`
- `INSIDER_SOURCED`
- `BOARD_SOURCED`
- `PRIVATE_MARKET_SOURCED`
- `CROSS_CAPITAL_SOURCED`
- `DYNASTIC_NETWORK_SOURCED`

## Router states
A candidate must be tested under **at least two plausible routes** when more than one is economically reasonable. PRIMARY_CLASS may be assigned only after sensitivity testing.

### QCO — QUALITY COMPOUNDER Ω
Use when durable operating excellence and reinvestment explain the thesis.

Mandatory: growth durability, margins, FCF/share, ROIC/ROCE, incremental ROIC, balance sheet, moat, reinvestment runway, valuation, concentration/cyclicality.

Falsifiers: structural margin erosion, declining incremental ROIC, moat decay, persistent share loss, leverage deterioration, valuation requiring implausible execution.

### CQO — CYCLICAL QUALITY Ω
Use for high-quality businesses whose economics depend materially on a cycle.

Mandatory:
- explicit cycle window(s);
- through-cycle and mid-cycle earnings/FCF;
- utilization/capacity/inventory/order data;
- supply discipline;
- structural share gains/losses;
- cycle-floor and cycle-peak valuation;
- sensitivity to alternative cycle windows.

**Stationarity gate:** never assume the historic cycle is stationary. Report verdict sensitivity using at least two defensible cycle windows when structural change is plausible.

Falsifiers: permanent capacity oversupply, structural demand destruction, technological substitution, deteriorating cycle-floor economics, balance-sheet stress before recovery.

### NCO — NORMALIZATION / CONTRARIAN Ω
Use only as a hypothesis when current earnings/margins are depressed and a measurable recovery may exist.

Mandatory:
- current earnings;
- normalized earnings range;
- explicit normalization mechanism;
- timeline;
- temporary-vs-structural impairment test;
- balance-sheet runway;
- valuation on current and normalized earnings;
- downside if normalization fails;
- catalyst sequence.

**Loss-route falsifier gate:** before NCO can score above WATCH, state the observation that would distinguish cyclical trough / temporary impairment from secular deterioration. If no discriminating observation exists, NCO is `ROUTE_NOT_PROVEN`.

State ladder: `N0_UNPROVEN -> N1_MECHANISM_IDENTIFIED -> N2_EARLY_EVIDENCE -> N3_NORMALIZATION_CONFIRMED -> N4_NORMALIZED`.

### STO — STRATEGIC TURNAROUND Ω
Use when an operating company is under multi-year strategic repair, regardless of whether a strategic owner is involved.

Mandatory: repair plan, operating milestones, revenue/margin inflection, FCF confirmation, restructuring costs, regulatory/litigation overhang, balance sheet, repaired ROIC, valuation versus repaired economics.

State ladder: `S0_TURNAROUND_HYPOTHESIS -> S1_REPAIR_PLAN -> S2_OPERATING_INFLECTION -> S3_FCF_CONFIRMATION -> S4_COMPOUNDER_TRANSITION`.

### HCO — HOLDCO / NAV Ω
Use for listed holdings / capital allocators whose equity thesis depends on look-through asset value and allocation economics.

Mandatory:
- NAV / look-through NAV;
- discount/premium to NAV;
- listed/private asset quality;
- holdco debt and structural leakage;
- tax/fiscal leakage;
- capital allocation record;
- buybacks/dividends;
- deployment capacity;
- concentration;
- governance/succession;
- catalyst or mechanism for NAV/share compounding and/or discount closure.

Required decomposition:
`HOLDCO_VALUE = LISTED_ASSETS + PRIVATE_ASSETS + MANAGER_VALUE + CASH - HOLDCO_DEBT - TAX/STRUCTURAL_LEAKAGE`

Examples for calibration only: EXO, INVE-B.ST, PPLI, GBL.

## MULTI-ROUTE SENSITIVITY GATE Ω
For each ticker with route ambiguity:
1. identify at least two plausible routes;
2. score each independently with no shared conclusion;
3. record `VERDICT_BY_ROUTE`;
4. calculate whether final status changes materially;
5. if route choice changes the verdict, mark `ROUTE_SENSITIVE` and reduce confidence;
6. assign PRIMARY_CLASS only when evidence, not taxonomy, dominates the outcome.

Example: TEVA may be tested as NCO and QCO. If NCO says BUY-like and QCO says FAIL, ATLAS must report route sensitivity rather than silently choosing NCO.

## Common ATLAS gates
Every class still passes Evidence Integrity, Source Authenticity, Quantitative Integrity, Temporal Normalization, valuation/reverse valuation, GREEN Ω, balance sheet/liquidity, management/governance, risk, Expectations Saturation Ω, Entry Timing Ω, Competition for Capital Ω, concentration/chain budget and Replacement Firewall where applicable.

## Score discipline
Outputs must separate:
1. `SOURCE_PRIORITY_SCORE` — optional research-priority metadata only; never added to quality.
2. `THESIS_SCORE_BY_ROUTE` — one score per tested route.
3. `ROUTE_ROBUSTNESS` — confidence that verdict survives plausible route choice.
4. `FINAL_COMPETITION_SCORE` — only after common gates and portfolio context.

Forbidden:
- averaging allocator reputation into company quality;
- treating target-company ownership % as manager portfolio weight;
- treating 13F as complete or net exposure;
- assuming NCO normalization before the temporary-vs-structural test;
- using one historical cycle window for CQO when structural regime change is plausible;
- comparing HCO directly to an operating company before normalizing through Competition for Capital.

## Calibration set
- `ATCO-B.ST` -> QCO / CQO sensitivity where cycle matters.
- `ASML`, `MU`, `SK Hynix`, `Tokyo Electron` -> CQO/QCO sensitivity.
- `MOH`, `TEVA` -> NCO + at least one alternative route test.
- `PHG/PHIA` -> STO + QCO sensitivity once repair is advanced.
- `EXO`, `INVE-B.ST`, `PPLI`, `GBL` -> HCO.

## Output schema
`TICKER | SOURCING_FLAGS | PLAUSIBLE_ROUTES | THESIS_SCORE_BY_ROUTE | ROUTE_ROBUSTNESS | PRIMARY_CLASS | STYLE_STATE | VALUATION_STATE | COMMON_GATES | FALSIFIERS | FINAL_STATUS`

## Canonical principle
**Use capital networks to discover, never to confer skill. Test the thesis under competing plausible routes. Let evidence select the route, not the route select the evidence.**