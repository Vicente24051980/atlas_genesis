# CAPITAL INTELLIGENCE EVIDENCE GATES Ω v1.0

**Status:** CANONICAL / ACTIVE / TRANSVERSAL  
**Effective date:** 2026-09-06  
**Parent:** `CURRENT_CANON/CAPITAL_INTELLIGENCE_OMEGA.md`  
**Purpose:** prevent prestige transfer, denominator errors, disclosure-window bias and unvalidated allocator worship.

## 1. PRESTIGE TRANSFER GATE Ω
Family prestige, age of wealth, historical control, institutional brand or famous sponsors are **not evidence of current investment skill**.

`LINEAGE_REPUTATION != MANAGER_ALPHA`
`VEHICLE_BRAND != ATTRIBUTABLE_SKILL`

A manager/vehicle may earn an `ALLOCATOR_SKILL_VALIDATED` state only after attributable, publication-date-based evidence demonstrates persistent benchmark-relative value.

Default state for Lingotto, family offices, holdings and named allocators without such validation: `ALLOCATOR_SKILL_UNPROVEN`.

## 2. CONVICTION DENOMINATOR GATE Ω
Never infer manager conviction from percentage ownership of the target company alone.

Mandatory fields:
- shares held;
- market value at position date;
- target-company ownership %;
- disclosed portfolio gross value where reconstructable;
- position weight in the disclosed portfolio subset;
- estimated total-portfolio weight only if denominator coverage is documented;
- concentration rank within the disclosed subset.

`TARGET_OWNERSHIP_% != PORTFOLIO_WEIGHT`

If total denominator is unavailable, label conviction `DENOMINATOR_INCOMPLETE` and do not describe it as high/low portfolio conviction.

## 3. DISCLOSURE WINDOW BIAS Ω
13F is a jurisdictional disclosure subset, not a complete portfolio.

Mandatory 13F limitations:
- up to 45-day reporting latency after quarter-end;
- only securities on the SEC 13(f) list;
- generally long reportable positions, not a complete net-exposure map;
- excludes many non-US listings, private assets, cash, debt, many derivatives, shorts and hedges;
- filing may reflect positions already changed before publication.

For every position store:
- `POSITION_DATE`;
- `PUBLICATION_DATE`;
- `MAX_DISCLOSURE_LATENCY_DAYS`;
- `DISCLOSURE_TYPE`;
- `COVERAGE_SCOPE`;
- `NET_DIRECTIONALITY_KNOWN` = YES/NO;
- `HEDGE_STATUS` = KNOWN/UNKNOWN.

Backtests and public-followability tests start at `PUBLICATION_DATE`, never at quarter-end.

## 4. DISCLOSURE TYPE GATE Ω
Do not compare disclosure types as if they were equivalent.

- 13F -> periodic US long-equity subset.
- 13D/13G -> beneficial ownership threshold/event disclosure; ownership of target, not necessarily portfolio conviction.
- Form 3/4/5 -> insider ownership/transactions.
- European holding -> annual/interim reports, issuer filings, regulator filings.
- private vehicle/family office -> only the disclosure channels actually applicable.

## 5. CAPITAL INTELLIGENCE SOURCE STATUS
CAPITAL INTELLIGENCE Ω is a **sourcing system**, not a thesis route and not a quality premium.

Allowed effects:
- raise research queue priority;
- trigger reconstruction of position history;
- trigger cross-capital comparison;
- generate a falsifiable allocator hypothesis.

Forbidden effects:
- add points directly to THESIS_SCORE;
- override fundamentals/valuation/risk;
- infer manager skill from family/brand prestige;
- infer real-time flow from stale filings.

## 6. ALLOCATOR SKILL VALIDATION Ω
Before any allocator receives a persistent priority premium, construct a complete-enough event study.

### Universe
All reconstructable **new positions / material increases / material reductions / exits** for the allocator from inception or first reliable disclosure date.

### Event timestamp
Use `PUBLICATION_DATE` as the public information timestamp.

### Horizons
- 6 months
- 12 months
- 24 months

Optional: 1M/3M for decay analysis, but the core test is 6/12/24M.

### Benchmarks
For each event calculate:
- absolute return;
- excess vs broad market;
- excess vs sector benchmark;
- volatility;
- maximum drawdown;
- MFE/MAE;
- hit rate;
- median excess return;
- mean excess return;
- bootstrap confidence intervals where sample allows.

### Null hypothesis
`H0: publicly observable allocator disclosures do not deliver persistent positive excess return after disclosure latency and appropriate benchmark adjustment.`

### Validation states
- `A0_UNTESTED`
- `A1_SAMPLE_INCOMPLETE`
- `A2_NO_POST_PUBLICATION_ALPHA`
- `A3_WEAK_OR_REGIME_DEPENDENT_ALPHA`
- `A4_PERSISTENT_POST_PUBLICATION_ALPHA`
- `A5_REPLICATED_ACROSS_ALLOCATORS / REGIMES`

Only A4/A5 may justify a persistent **research-priority** premium, never a direct BUY premium.

## 7. ATTRIBUTION GATE Ω
If an allocator vehicle is young or team composition changed, separate:
- vehicle age;
- team tenure;
- predecessor track record;
- return attributable to current team;
- return attributable to inherited assets / strategic stakes;
- public-markets sleeve vs private/strategic sleeve.

Do not transfer Exor/Agnelli historical reputation to Lingotto performance without team-level attribution.

## 8. COVERAGE BIAS REPORT
Every allocator report must state:
- what the disclosure system can see;
- what it cannot see;
- whether target ownership or portfolio weight is being discussed;
- whether net directional exposure is known;
- whether publication latency could destroy followability.

## 9. Current canonical status — 2026-09-06
- `CAPITAL INTELLIGENCE Ω` = useful discovery hypothesis.
- `Lingotto allocator skill` = **A0/A1 UNVALIDATED** until the publication-date event study is completed.
- `Investor AB / Exor / PPLI` as listed securities = evaluate under **HCO — HOLDCO/NAV Ω**, not allocator-sourcing score.
- individual companies sourced from filings = evaluate under their business/thesis routes; sourcing remains orthogonal metadata.

## Canonical principle
**Where disclosure exists is not the same as where capital exists. Where a famous allocator appears is not evidence of alpha. Reconstruct the denominator, respect the disclosure window, then test post-publication returns.**