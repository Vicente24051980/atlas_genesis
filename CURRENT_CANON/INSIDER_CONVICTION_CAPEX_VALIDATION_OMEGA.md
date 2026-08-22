# INSIDER CONVICTION LEADING INDICATOR Ω + AI CAPEX VALIDATION AMENDMENT

**Status:** CANONICAL / ACTIVE / TRANSVERSAL  
**Effective date:** 2026-08-23  
**Authority:** compatible canonical module incorporated by explicit user instruction under ATLAS Ω.  
**Decision role:** leading evidence + research-priority control only. It cannot create a BUY by itself and cannot overwrite Expected Return, Valuation, Competition for Capital, Recommendation Performance Audit, Live Market Validation or Portfolio Construction.

## 1. Mission

ATLAS Ω must distinguish four observations that are often incorrectly merged:

1. insider open-market buying;
2. institutional fund flow;
3. corporate CAPEX / AI investment;
4. economic payback from that CAPEX.

The module converts insider activity into a **leading conviction signal** while preventing it from being mislabelled as institutional flow or Economic Proof. It also adds a mandatory validation layer to AI/CAPEX narratives so that a large spending number cannot be promoted into a positive investment conclusion without owner-economics evidence.

## 2. Constitutional laws

1. **INSIDER BUYING ≠ INSTITUTIONAL FLOW.**
2. **INSIDER BUYING ≠ ECONOMIC PROOF.**
3. **INSIDER BUYING ≠ BUY SIGNAL.**
4. **CORPORATE BUYBACK ≠ INSIDER BUYING.**
5. **OPTION/RSU GRANT ≠ OPEN-MARKET PURCHASE.**
6. **PRICE RISE ≠ INSIDER CONFIRMATION.**
7. **TECH INVESTMENT / GDP ≠ AI INVESTMENT / GDP unless the source explicitly measures AI.**
8. **CAPEX GROWTH ≠ CAPEX PRODUCTIVITY.**
9. **CAPEX ANNOUNCEMENT ≠ DEPLOYMENT ≠ UTILIZATION ≠ REVENUE ≠ FCF ≠ ROIC.**
10. **ASSET-MANAGER OUTLOOK ≠ VERIFIED FLOW.** Fidelity, Goldman, JPMorgan or any external outlook is a source signal, not direct evidence of current capital flow unless actual flow/positioning data are supplied.
11. **SEASONALITY ≠ ENTRY SIGNAL.** Calendar effects may inform context but cannot bypass Expected Return or Entry Timing Ω.
12. **T212 ACCESSIBILITY ≠ FUNDAMENTAL QUALITY.** Any operational candidate surfaced from Japan, emerging markets or another geography must pass the Trading 212 availability gate before becoming executable.

## 3. Insider Conviction Leading Indicator Ω

### Eligible evidence

Only traceable transactions that represent a genuine **open-market purchase by an insider** can create a positive signal. SEC Form 4 or equivalent primary regulatory disclosure is preferred.

Exclude or separately label:

- option exercises without net open-market purchase;
- RSU/stock grants;
- tax withholding transactions;
- gifts/transfers;
- automatic plan activity where economic discretion is absent;
- corporate share repurchases;
- unverified social-media claims.

### Required fields

For each observation record:

- ticker;
- asOfDate;
- evidenceTraceable;
- evidenceIds;
- verifiedOpenMarketPurchase;
- verifiedTransactionCount;
- uniqueInsiderCount;
- insiderRoles;
- purchaseMaterialityScore 0–100;
- postDrawdownContextScore 0–100;
- sectorBreadthScore 0–100;
- offsettingSalesRiskScore 0–100;
- recencyDays;
- notes/falsifiers.

### Score

`Insider Conviction Score Ω =`

- 20% verified open-market nature;
- 15% seniority of insider roles;
- 15% breadth across independent insiders;
- 15% economic materiality of purchases;
- 10% purchase after dislocation/drawdown;
- 10% breadth across the relevant sector/cohort;
- 10% inverse offsetting-sales risk;
- 5% recency.

Role reference scores:

- CEO = 100
- CFO = 95
- COO/PRESIDENT = 85
- EXECUTIVE = 75
- DIRECTOR = 70
- OTHER = 50

Breadth across insiders saturates at five independent insiders. The score must not infer purchase materiality from dollar value alone without context where compensation/holdings information is unavailable.

### Evidence gate

`CONFIRMED` requires:

- evidenceTraceable = true;
- at least one evidence ID;
- at least one verified open-market transaction;
- uniqueInsiderCount >= 1.

Otherwise the state is `DATA_INCOMPLETE` or `NO_QUALIFYING_PURCHASE`.

### States

- `HIGH_CONVICTION_LEADING` — score >= 75
- `CONVICTION_LEADING` — score >= 60
- `WATCH_LEADING` — score >= 45
- `LOW_SIGNAL` — score < 45
- `NO_QUALIFYING_PURCHASE`
- `DATA_INCOMPLETE`

### Allowed actions

- `ELEVATE_AUDIT_PRIORITY`
- `WATCH_ONLY`
- `NO_CHANGE`
- `DATA_REQUIRED`

**There is intentionally no BUY action.**

A strong insider signal may increase audit priority or confidence in an existing hypothesis. It must then compete through Integrity → all applicable engines → Economic Proof → Expected Return → Competition for Capital → Recommendation Performance Audit → Live Market Validation → Ranking Final.

## 4. Institutional-flow firewall

The output must always expose:

`institutionalFlowInference = PROHIBITED_FROM_INSIDER_DATA`

Insider transactions may coexist with institutional selling, passive inflows, CTA de-risking or no measurable fund flow. No causal bridge may be inferred without separate flow evidence.

Accepted institutional-flow evidence remains independently sourced: fund/ETF flows, disclosed positioning with known lag, verified systematic positioning, options/block activity when properly attributable, breadth/volume as corroboration but never as sole proof.

## 5. AI CAPEX Validation Amendment Ω

For EDD-0 allocators/payers, the canonical chain is:

`CAPEX → installed capacity → utilization → pricing/monetization → incremental revenue → incremental margin → OCF → FCF/share → incremental ROIC → payback`.

For EDD-1 to EDD-5 suppliers:

`customer CAPEX → order/contract → backlog → deployment/acceptance where applicable → recognized revenue → margin → OCF/FCF → incremental ROIC`.

### Mandatory spending-label integrity

Every macro spending statistic must carry a scope field:

- `AI_SPECIFIC`
- `IT_TECH_BROAD`
- `DATA_CENTER_BROAD`
- `SEMICONDUCTOR_BROAD`
- `OTHER`
- `SCOPE_UNVERIFIED`

A broad IT/software/hardware statistic cannot be relabelled `AI_SPECIFIC` without source evidence. Example rule: a figure such as technology investment equalling a percentage of GDP remains `IT_TECH_BROAD` unless the underlying source explicitly isolates AI.

### Payback states

- `P0_SPENDING_ONLY`
- `P1_CAPACITY_DEPLOYED`
- `P2_UTILIZATION_VISIBLE`
- `P3_REVENUE_LINKAGE`
- `P4_MARGIN_CASH_CONVERSION`
- `P5_INCREMENTAL_ROIC_PAYBACK`

`P0/P1` are leading activity evidence, not owner-economic proof. Stronger Economic Proof requires visible economics.

### CAPEX risk symmetry

ATLAS must report both sides simultaneously:

**Supplier opportunity:** CAPEX growth can create orders, backlog, revenue and operating leverage.

**Allocator risk:** CAPEX growth without proportional utilization, FCF/share and incremental ROIC can destroy owner economics even while supplier demand remains strong.

Therefore:

`AI_CAPEX_UP` may strengthen Global CAPEX Chain Ω for suppliers while simultaneously weakening AI CAPEX Payback Ω for the allocator.

## 6. External outlook / Fidelity handling

External allocation outlooks can modify research priority only after source verification. They may support thematic hypotheses such as Japan, selected emerging markets, grid/power, AI infrastructure or commodities, but they do not establish current institutional flow by themselves.

Required classification:

- `OUTLOOK_SIGNAL`
- `VERIFIED_FLOW`
- `POSITION_DISCLOSURE_LAGGED`
- `PRICE_ONLY`
- `UNVERIFIED_NARRATIVE`

Only `VERIFIED_FLOW` may enter Institutional Capital Rotation Ω as direct flow evidence.

## 7. Integration

- **Institutional Capital Rotation Ω:** must never consume insider buying as fund-flow evidence.
- **Global CAPEX Chain Ω:** consumes validated spending scope and supplier transmission evidence.
- **AI CAPEX Payback Ω:** owns allocator payback and incremental ROIC.
- **AI Demand & Monetization Proof Ω:** validates utilization/revenue linkage.
- **Entry Timing Ω:** seasonality and insider signals can inform context but cannot override valuation/ER.
- **Recommendation Performance Audit Ω:** historical uses of insider signals must be audited for Recommendation Alpha and Selection Alpha before any future weight recalibration.
- **Model Learning & Governance Ω:** no change in score weights from a handful of recent insider cases; Recalibration Gate remains mandatory.
- **Trading 212 Accessibility Gate Ω:** mandatory before any externally sourced geographic candidate becomes operational.

## 8. Required output

For a ticker where insider data are available:

`PRICE INTEGRITY → INSIDER EVIDENCE GATE → INSIDER CONVICTION SCORE → STATE → ACTION → INSTITUTIONAL FLOW INFERENCE (always separate) → ECONOMIC PROOF → EXPECTED RETURN → LIVE MARKET VALIDATION → VERDICT`.

For macro/AI CAPEX evidence:

`SPENDING SCOPE → CAPEX DELTA → DEPLOYMENT → UTILIZATION → REVENUE LINKAGE → FCF/ROIC → SUPPLIER CAPTURE → ALLOCATOR PAYBACK → FALSIFIERS`.

## 9. Falsifiers / downgrades

Insider signal is weakened or invalidated by:

1. transactions later shown not to be discretionary open-market purchases;
2. material insider selling overwhelming purchases;
3. purchase size immaterial relative to insider holdings/compensation when that evidence exists;
4. no breadth beyond one small purchase;
5. deterioration in fundamentals after the purchase;
6. Expected Return collapsing because valuation expands;
7. Recommendation Performance Audit showing repeated negative Selection Alpha for this signal class.

AI CAPEX thesis is weakened by:

1. deployment delays;
2. utilization below plan;
3. price/mix deterioration;
4. revenue failing to scale with installed capacity;
5. OCF/FCF lagging CAPEX persistently;
6. incremental ROIC below cost of capital;
7. debt/lease/SPV financing fragility rising;
8. supplier backlog failing to convert to accepted revenue and cash.

## Final laws

**INSIDER CONVICTION IS A LEADING INDICATOR, NEVER ECONOMIC PROOF.**

**INSIDER BUYING CANNOT BE USED TO CLAIM INSTITUTIONAL ACCUMULATION.**

**CAPEX INTENSITY CAN BE BULLISH FOR THE SUPPLIER AND BEARISH FOR THE PAYER AT THE SAME TIME.**

**THE NEXT DOLLAR OF AI CAPEX MATTERS ONLY IF ATLAS CAN TRACE WHO RECEIVES IT AND WHO EARNS AN ADEQUATE RETURN ON IT.**
