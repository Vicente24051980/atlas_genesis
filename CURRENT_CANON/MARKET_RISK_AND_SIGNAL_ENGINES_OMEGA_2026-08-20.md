# ATLAS Ω — Market Risk & Signal Engines

**Status:** ACTIVE · Canonical
**Effective:** 2026-08-20

## Purpose
Convert macro, positioning, commodity, insider, IPO and technical observations into independent evidence engines. None may issue BUY alone. GREEN Gate 0 / Pulse / Breadth remain first in discovery; Falsifiers Ω retains veto.

## 1. EXTREME POSITIONING / SENTIMENT Ω

Inputs: BofA Bull & Bear / FMS where licensed or verifiable, institutional cash allocation, equity overweight, CTA/systematic positioning, options positioning, retail sentiment.

Rule: extreme bullish sentiment is a `RISK_MULTIPLIER`, not a mechanical SELL. Require confirmation through price deterioration, GREEN Pulse/Breadth, liquidity or credit before escalation.

States: NORMAL / ELEVATED / EXTREME / EXTREME+CONFIRMED_DETERIORATION.

## 2. LIQUIDITY & LONG-END TRANSMISSION Ω

Chain:
`TREASURY/FED/BOJ ACTION → RESERVES/LIQUIDITY → LONG-END YIELDS → USD/JPY → CREDIT → EQUITY DURATION → GOLD/HARD ASSETS → BREADTH`.

Track Treasury buybacks/TGA, Fed balance sheet/rates, 10Y/30Y yields, term premium, USD, JPY/carry stress, IG/HY spreads and breadth. Directional narrative alone is insufficient.

### Live state — 2026-09-15: RISK-FREE REPRICING

`RISK_FREE_REPRICING = ACTIVE`

The U.S. 10Y trading above 5% while oil remains above $100 and policy expectations reprice higher is a valuation-context state inside this existing engine. It is **not** a new engine and has zero independent capital authority.

Implementation effect:
- raise the hurdle for long-duration equities;
- increase scrutiny of leverage, refinancing, SBC/dilution and far-dated FCF;
- increase scrutiny of CAPEX-heavy models whose economics depend on cheap funding;
- require reverse DCF / Expectations Gap / normalized FCF / FRU for valuation decisions;
- inspect transmission into credit spreads, estimate revisions and realized FCF;
- never convert `10Y > 5%` into an automatic SELL or a fundamental falsifier.

## 3. DERIVATIVES / VOLATILITY REGIME Ω

Track VIX, term structure, index-vs-single-stock dispersion, major expiries, dealer gamma where evidenced, realized volatility and breadth. Calendar expiries are `EVENT_WINDOWS`, never automatic crash predictions.

## 4. COMMODITY MARGIN SHOCK Ω

Purpose: distinguish fundamental commodity-thesis deterioration from leverage/liquidity liquidation.

Chain:
`EXCHANGE MARGIN CHANGE → LEVERAGED POSITION REDUCTION → PRICE SHOCK → OPEN INTEREST/VOLUME → PHYSICAL/FUNDAMENTAL CONFIRMATION → THESIS IMPACT`.

Use for gold, silver, copper and other futures. A margin hike can explain forced deleveraging but cannot alone establish a new fundamental trend.

## 5. HARD-ASSET MONETARY HEDGE Ω

Separate drivers: real yields, nominal yields, USD, central-bank demand, ETF/fund flows, physical demand, geopolitical hedge, fiscal/monetary credibility and positioning. Gold price action is not itself proof of monetary degradation.

## 6. INSIDER CONVICTION Ω

Open-market insider purchases are evidence inputs, not BUY signals. Score: insider seniority, purchase size relative to compensation/ownership, open-market vs award/exercise, clustering, timing after drawdown, valuation, and subsequent fundamental evidence.

Required source: SEC Form 4 or equivalent primary filing before classification as VERIFIED.

## 7. TECHNICAL REGIME / GOLDEN-CROSS Ω

MA50 > MA200 is a trend-state observation only. It cannot be assigned predictive probability from a single historical occurrence. Require GREEN 4/5 or 5/5, positive Pulse, breadth/relative confirmation and no material fundamental falsifier before it can improve execution state.

## 8. IPO SUPPLY / NEW-LISTING Ω

Pipeline:
`S-1/PROSPECTUS → BUSINESS ECONOMICS → CUSTOMER CONCENTRATION → BACKLOG/RPO → CAPACITY/CAPEX → MARGINS/FCF → OFFER VALUATION → FLOAT/LOCKUP → GREEN HISTORY AFTER LISTING → ACTION`.

No pre-IPO/new listing can receive fabricated GREEN 4/5 or 5/5 without sufficient trading history. It remains `GREEN_INSUFFICIENT_HISTORY` and may only enter WATCH/DISCOVERY until evidence accumulates.

### IPO lifecycle implementation

Use the existing Future IPO Gate lifecycle:

`F0_PRIVATE_DISCOVERY → F1_CONFIDENTIAL_FILING_REPORTED → F2_PUBLIC_S1_AVAILABLE → F3_PRICED → F4_LISTED_PRICE_DISCOVERY → F5_LOCKUP_SUPPLY_DISCOVERY → F6_NORMALIZED_PUBLIC_COMPANY`.

Rules:
- F0/F1 = research only; allowed action is `WAIT_FOR_PUBLIC_FILING`.
- Confidential filing != public audited evidence.
- Private valuation != Point Zero.
- At F2, audit audited revenue quality, concentration, gross margin, OCF/FCF, CAPEX/compute commitments, funding recourse, governance, related parties and dilution.
- At F3/F4, add offer valuation, reverse DCF / FRU, float and early price discovery.
- At F5, test lock-up/supply distortion before normalized entry review.
- No IPO prestige, growth rate or TAM can bypass the evidence and valuation gates.

Current operating radar dated 2026-09-15 is maintained in `CURRENT_CANON/2026-09-15_RADAR_IPO_PRIVATE_REGIME_OMEGA.md`.

## 9. GRID / TRANSFORMER BOTTLENECK Ω

For electrical-equipment candidates such as transformer/switchgear manufacturers:
`AI/DC LOAD + GRID REPLACEMENT → ORDERS → BACKLOG → LEAD TIMES → PRICE/MIX → CAPACITY EXPANSION → ACCEPTANCE/SHIPMENTS → MARGIN → FCF → ROIC`.

Customer concentration, cyclicality, capacity additions, working capital and valuation are mandatory counterweights. Datacenter exposure is not itself Economic Proof.

## 10. EVENT-CALENDAR RISK Ω

Macro releases, earnings, option expiries, regulatory decisions and trade-policy deadlines become timestamped event windows. They modify execution risk and scenario probabilities, never fundamental quality automatically.

## 11. CONCENTRATION / INDEX FRAGILITY Ω

Track cap-weight vs equal-weight performance, top-10 contribution, breadth, sector participation and earnings contribution. High index concentration raises fragility but is not itself a timing signal.

## 12. CRYPTO TREASURY / REFLEXIVITY Ω

Chain:
`CRYPTO PRICE → CORPORATE NAV/COLLATERAL → CAPITAL-MARKET ACCESS → FORCED SALES/DILUTION → MINER ECONOMICS → CREDIT/LIQUIDITY → SECOND-ROUND PRICE EFFECTS`.

Stress scenarios must use verified balance-sheet holdings, debt maturities, covenants/convertibles and mining cost curves. Public commentary by an investor is hypothesis/evidence input, not proof.

## 13. AI CAPEX SLOWDOWN WATCH — existing-engine routing

`AI_CAPEX_SLOWDOWN_WATCH = ACTIVE / HIGH` as of 2026-09-15.

This is **not** a new decision engine. It is a research watch routed through existing AI Capex Conversion / Economic Proof, liquidity, valuation and falsifier layers.

Escalation requires economic evidence such as:
- hyperscaler cancellation or material deferral of funded projects;
- order/backlog/RPO deterioration;
- utilization deterioration;
- negative estimate revisions tied to real demand;
- normalized FCF / ROIC deterioration across the physical AI stack.

Safety statements, political rhetoric, regulatory debate or a one-day semiconductor drawdown alone are narrative/event evidence, not an AI CAPEX falsifier.

## Investable-universe constraint — China

For the current human-defined universe, China-only securities are `NON_INVESTABLE_EVIDENCE_ONLY`.

Chinese production, demand, pricing, supply-chain, policy and competitive data may still be used when material to an investable company elsewhere. Do not surface China-only securities as portfolio candidates or spend scarce research capacity ranking them for purchase unless the human explicitly changes the universe constraint.

## Governance

All engines output FACT/HYPOTHESIS/INTERPRETATION/NOISE, provenance, freshness and confidence. They feed the Investment Committee independently. No averaging can override a hard falsifier. A valid output may be `NO SIGNAL`, `INSUFFICIENT DATA`, `WATCH`, or `NO PORTFOLIO CHANGE`.

Additional invariants:
- `ANALYSIS != EXECUTION`
- `RESEARCH_PRIORITY != INVESTMENT_SCORE`
- `MACRO_REPRICING != FUNDAMENTAL_FALSIFIER`
- `AI_SAFETY_NARRATIVE != AI_CAPEX_DETERIORATION`
- `F0/F1 != BUY`
