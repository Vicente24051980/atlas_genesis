# ATLAS Ω — Time in Portfolio Ω

**Status:** `ACTIVE_SUBORDINATE_DIAGNOSTIC`  
**Master authority:** `docs/canon/ATLAS_OMEGA_MASTER_PROMPT_CANONICAL.md`

## Purpose

Time in Portfolio Ω measures structural durability over a 3–6 year horizon. It is an evidence/diagnostic engine only.

It has zero independent authority to admit, retain, protect or expel a company from the clean Point-Zero portfolio.

## Formula

`TiP = 0.20 EarningsDurability + 0.15 ForwardMoat + 0.15 ReinvestmentRunway + 0.15 PerShareEconomics + 0.15 BalanceSheetResilience + 0.10 ValuationSurvivability + 0.05(100-EventDependency) + 0.05(100-CyclicalDependency)`

## States

- `>=85`: GREEN_LONG_DURATION
- `75–84.99`: GREEN
- `65–74.99`: GREEN_WITH_GATES
- `50–64.99`: WATCH
- `<50`: SHORT_DURATION_OR_REJECT

## Canonical boundary

- `TIME_IN_PORTFOLIO != PRICE_GREEN`.
- A high TiP score does not create a portfolio slot.
- A current holding receives no retention advantage from TiP or incumbency.
- Expected Return, risk, Falsifiers, Competition for Capital and whole-portfolio marginal utility govern selection under the MASTER UNIVERSE PROMPT.
- Confirmed structural falsifiers override a favorable TiP diagnostic.
- `OPTIMAL_N` remains fully endogenous with no fixed floor or ceiling.

## Executable implementation

`src/atlas/algorithm/owner-economics-normalization-omega.ts` — `calculateTimeInPortfolioScore()`.

Test coverage: `src/atlas/algorithm/thread-synthesis-omega.test.ts`.

## Final rule

**No intentes justificar la cartera que ya tenemos. Intenta derrotarla.**
