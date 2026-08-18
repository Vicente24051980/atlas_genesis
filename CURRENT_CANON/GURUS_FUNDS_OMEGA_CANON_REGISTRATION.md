# ATLAS Ω — GURUS & FUNDS Ω — Canon Registration

**Status:** CANONICAL  
**Version:** 1.0.0  
**Effective date:** 2026-08-18  
**Engine:** `src/atlas/gurus-funds/engine.ts`  
**Algorithm registration:** `src/atlas/algorithm/gurus-funds-omega.ts`

## Mission

Detect high-information capital allocation by differentiated elite investors and funds before converting any signal into an ATLAS investment decision.

The engine is a **discovery and evidence-routing engine**. It does not copy portfolios and it cannot issue BUY/SELL orders.

## Mandatory separation

GURUS & FUNDS Ω remains logically independent from:

- Principal Ω
- Good Companies Cheap / Quality at a Discount Ω
- Historical Dislocation / Burry Ω
- Money Rotation Ω
- Institutional Capital Rotation Ω
- CAPEX Hunters / specialized thematic engines

A signal from one engine cannot overwrite the conclusion of another.

## Canonical manager universe v1.0

1. Berkshire Hathaway / Warren Buffett
2. Thiel Macro / Peter Thiel
3. Duquesne Family Office / Stanley Druckenmiller
4. Appaloosa / David Tepper
5. Pershing Square / Bill Ackman
6. Baupost / Seth Klarman
7. Scion / Michael Burry
8. Himalaya Capital / Li Lu
9. Dalal Street / Mohnish Pabrai
10. Aquamarine / Guy Spier
11. Akre Capital / Chuck Akre
12. TCI / Chris Hohn
13. Fundsmith / Terry Smith
14. Soros Fund Management
15. Oaktree / Howard Marks

Additional institutions may be observed, but multi-strategy/high-turnover funds are downweighted unless position size, persistence and evidence make the signal exceptional.

## Required observation fields

For each manager/ticker observation:

- manager
- investment style
- action: NEW / INCREASE / HOLD / REDUCE / EXIT / UNKNOWN
- portfolio weight when verifiable
- quarterly position change when verifiable
- holding persistence when verifiable
- source quality
- filing/source age
- traceable evidence ID

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

- `WEAK_SIGNAL`
- `NEUTRAL`
- `DISCOVERY`
- `ACCUMULATION`
- `SMART_MONEY_CONVERGENCE`
- `STRONG_GURU_CONVICTION`

## Named outputs

- `GURU_CONVICTION_OMEGA`
- `SMART_MONEY_CONVERGENCE_OMEGA`
- `NEW_POSITION_OMEGA`
- `ACCUMULATION_OMEGA`
- `DISTRIBUTION_OMEGA`
- `CONTRARIAN_OMEGA`

## Non-negotiable evidence rules

1. **Guru signal ≠ BUY.**
2. **13F is delayed and incomplete.** Options, shorts, non-US holdings, cash and other economic exposures may be absent or only partially represented.
3. **Concentration matters more than raw holder count.**
4. **Cross-style convergence matters more than correlated manager count.**
5. **Divergence remains visible.** A reducer cannot be averaged away merely because more managers are buyers.
6. **Estimated purchase price ≠ exact cost basis.**
7. **No portfolio order is emitted by this engine.**
8. Every candidate must subsequently pass:
   - Economic Proof
   - Quality Ω
   - Valuation / Expected Return
   - Falsifiers Ω
9. Falsifiers Ω retains independent absolute veto.

## Canonical downstream flow

`13F / manager evidence → GURUS & FUNDS Ω → contradictions/divergence → Economic Proof → Quality Ω → Valuation/Expected Return → Falsifiers Ω → Decision`

Valid final outputs include `NO OPPORTUNITY` and `NO PORTFOLIO CHANGE`.

## First production snapshot

The first Q2-2026 production snapshot is registered separately at:

`reports/gurus-funds/2026-08-18_GURUS_FUNDS_OMEGA_Q2_2026.md`

The snapshot is a discovery ranking, not an investment recommendation.
