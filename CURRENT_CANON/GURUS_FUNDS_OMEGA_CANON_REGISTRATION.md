# ATLAS Ω — GURUS & FUNDS Ω — Canon Registration

**Status:** CANONICAL  
**Version:** 1.1.0  
**Effective date:** 2026-08-18  
**Engine:** `src/atlas/gurus-funds/engine.ts`  
**Algorithm registration:** `src/atlas/algorithm/gurus-funds-omega.ts`

## Mission

Detect high-information capital allocation by differentiated elite investors and funds before converting any signal into an ATLAS investment decision.

The engine is a **discovery and evidence-routing engine**. It does not copy portfolios and it cannot issue BUY/SELL orders.

## Mandatory separation

GURUS & FUNDS Ω remains logically independent from Principal Ω, Good Companies Cheap / Quality at a Discount Ω, Historical Dislocation / Burry Ω, Money Rotation Ω, Institutional Capital Rotation Ω and CAPEX Hunters / specialized thematic engines. A signal from one engine cannot overwrite the conclusion of another.

## Canonical manager universe v1.0

Berkshire Hathaway / Warren Buffett; Thiel Macro / Peter Thiel; Duquesne Family Office / Stanley Druckenmiller; Appaloosa / David Tepper; Pershing Square / Bill Ackman; Baupost / Seth Klarman; Scion / Michael Burry; Himalaya Capital / Li Lu; Dalal Street / Mohnish Pabrai; Aquamarine / Guy Spier; Akre Capital / Chuck Akre; TCI / Chris Hohn; Fundsmith / Terry Smith; Soros Fund Management; Oaktree / Howard Marks.

Additional institutions may be observed, but multi-strategy/high-turnover funds are downweighted unless position size, persistence and evidence make the signal exceptional.

## Required observation fields

For each manager/ticker observation: manager; investment style; action NEW / INCREASE / HOLD / REDUCE / EXIT / UNKNOWN; portfolio weight when verifiable; quarterly position change when verifiable; holding persistence when verifiable; source quality; filing/source age; traceable evidence ID.

No exact cost basis may be inferred from a 13F. Entry ranges, when estimated, must be labelled estimates.

## Guru Signal Ω score

| Factor | Weight |
|---|---:|
| Conviction / concentration | 25% |
| New position / accumulation | 20% |
| Independent cross-style convergence | 15% |
| Persistence | 10% |
| Exceptionality vs normal manager behavior | 10% |
| Contrarian opportunity | 10% |
| Evidence quality + freshness | 10% |

## States

`WEAK_SIGNAL`, `NEUTRAL`, `DISCOVERY`, `ACCUMULATION`, `SMART_MONEY_CONVERGENCE`, `STRONG_GURU_CONVICTION`.

## Named outputs

`GURU_CONVICTION_OMEGA`, `SMART_MONEY_CONVERGENCE_OMEGA`, `NEW_POSITION_OMEGA`, `ACCUMULATION_OMEGA`, `DISTRIBUTION_OMEGA`, `CONTRARIAN_OMEGA`.

## Non-negotiable evidence rules

1. **Guru signal ≠ BUY.**
2. **13F is delayed and incomplete.** It is historical manager evidence, never evidence of current market flow.
3. **GURU BUY ≠ MONEY ROTATION TODAY.** A Q2 filing cannot be used to claim that capital is entering a ticker today.
4. Concentration matters more than raw holder count.
5. Cross-style convergence matters more than correlated manager count.
6. Divergence remains visible. A reducer cannot be averaged away merely because more managers are buyers.
7. Estimated purchase price ≠ exact cost basis.
8. No portfolio order is emitted by this engine.
9. Every candidate must subsequently pass Economic Proof, Quality Ω, Valuation / Expected Return and Falsifiers Ω.
10. Falsifiers Ω retains independent absolute veto.

## PRESENT ECONOMIC PROOF GATE Ω — v1.1

Before a guru-discovered candidate can challenge an existing portfolio position, ATLAS must value what is demonstrably present before what is forecast.

Mandatory chain:

`realized revenue → realized operating profit/EPS → realized OCF → realized FCF → realized ROIC/capital efficiency → balance-sheet resilience at current rates → valuation on present/normalized economics → future growth`

Rules:

- TAM, 2028/2030 revenue, narrative CAGR and distant terminal assumptions cannot compensate for weak present economics.
- High long-duration yields increase the penalty applied to businesses whose valuation depends disproportionately on distant cash flows.
- A company may be excellent and still fail because **Future Already Paid Ω** is excessive.
- Accounting gains, mark-to-market investment gains and other non-operating items must be normalized before using headline P/E as evidence of cheapness.
- `NO OPPORTUNITY` remains valid.

## CURRENT FLOW / RELATIVE STRENGTH GATE Ω — v1.1

For any question involving **what to buy now, current rotation, today's winners, defensive positioning or immediate portfolio replacement**, the mandatory routing is:

`Market regime → sectors → industries → ticker flow/volume → relative strength → breadth → intraday/close persistence → Economic Proof → valuation → Falsifiers → decision`

Fundamental quality cannot create a Money Rotation signal. There must be observable current-flow evidence.

For long-horizon discovery without immediate execution intent, GURUS & FUNDS Ω remains independent and can surface candidates without current-flow confirmation, but it still cannot emit BUY.

## CHALLENGER-ONLY PORTFOLIO RULE Ω — v1.1

When an existing portfolio has demonstrated broad relative strength, guru discoveries are treated as **challengers**, not automatic replacements.

A challenger may displace an incumbent only when it shows a material combined advantage in:

1. current-flow/relative-strength evidence appropriate to the execution horizon;
2. present Economic Proof and cash conversion;
3. valuation on normalized current economics;
4. balance-sheet/rate resilience;
5. falsifier risk.

A thematic connection, famous manager purchase or superior long-run story is insufficient.

Canonical defensive control basket registered on 2026-08-18 for challenger comparison: `LLY, GE, MPC, XOM, KO, AMGN, JNJ, MUV2.DE, CVX, COP, MA, BRK.B, LIN`. This is a snapshot/control basket, not a permanent constitutional portfolio.

Initial Q2-2026 challenger research set from current guru evidence: `CME, ICE, ADP, RMD, BKNG, SPGI, ALC, ENSG`. These are research candidates only.

## Volatility / market-infrastructure hypothesis

In regimes with elevated volatility across rates, energy, FX and equities, exchange/clearing infrastructure such as CME and ICE may warrant priority research because monetization can arise from risk-management activity rather than a directional equity-market forecast. This remains a hypothesis until volume, revenue, margins, FCF and valuation evidence confirm it.

## Canonical downstream flow v1.1

For discovery:
`13F / manager evidence → GURUS & FUNDS Ω → contradictions/divergence → Present Economic Proof → Quality Ω → Valuation/Expected Return → Future Already Paid Ω → Falsifiers Ω → Decision`

For immediate execution/current rotation:
`Market → sector → industry → observable flow/volume → relative strength → persistence → candidate → Present Economic Proof → valuation → Future Already Paid Ω → Falsifiers Ω → incumbent-vs-challenger decision`

Valid final outputs include `NO OPPORTUNITY` and `NO PORTFOLIO CHANGE`.

## First production snapshot

The first Q2-2026 production snapshot remains registered separately at `reports/gurus-funds/2026-08-18_GURUS_FUNDS_OMEGA_Q2_2026.md`. The snapshot is a discovery ranking, not an investment recommendation.
