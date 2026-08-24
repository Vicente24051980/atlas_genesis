# ATLAS Ω — Time in Portfolio Ω · Canon 24-ago-2026

**Status:** ACTIVE CANONICAL ADDENDUM.

## Purpose
Separate a stock that deserves to remain in a 3–6 year portfolio from a stock that is merely attractive today. Time in Portfolio Ω is not a BUY/SELL engine and never overrides Expected Return, Falsifier Veto or Competition for Capital.

## Formula
`TiP = 0.20 EarningsDurability + 0.15 ForwardMoat + 0.15 ReinvestmentRunway + 0.15 PerShareEconomics + 0.15 BalanceSheetResilience + 0.10 ValuationSurvivability + 0.05(100-EventDependency) + 0.05(100-CyclicalDependency)`

## States
- `>=85`: GREEN_LONG_DURATION
- `75–84.99`: GREEN
- `65–74.99`: GREEN_WITH_GATES
- `50–64.99`: WATCH
- `<50`: SHORT_DURATION_OR_REJECT

## Rules
- **TIME IN PORTFOLIO != PRICE GREEN.** This engine is structural duration; canonical GREEN Verified Continuity remains the price-continuity engine with its own provider quorum.
- A high TiP score does not create a portfolio slot. Expected Return and Marginal Portfolio Contribution still decide.
- A high-quality defensive may score highly on TiP while ranking below a faster compounder on Expected Return.
- Cyclicals can remain investible but normally require normalization and may receive `GREEN_WITH_GATES` rather than long-duration status.
- Event-dependent, pre-proof or highly diluted names cannot be promoted to long-duration status by narrative alone.
- Confirmed structural falsifiers override TiP.

## Executable implementation
`src/atlas/algorithm/owner-economics-normalization-omega.ts` — `calculateTimeInPortfolioScore()`.
Test coverage: `src/atlas/algorithm/thread-synthesis-omega.test.ts`.

## Portfolio interpretation
The engine answers: **How naturally can this company remain in the portfolio without requiring a favorable commodity cycle, one earnings event, one regulatory outcome or constant multiple expansion?**
