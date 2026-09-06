# ATLAS Ω — TRADER INTELLIGENCE Ω

**Status:** CANONICAL / ACTIVE / RESEARCH-PRIORITY ONLY  
**Effective date:** 2026-09-06  
**Runtime authority:** `RESEARCH_PRIORITY_AND_FALSIFICATION_ONLY`  
**Direct company-score weight:** `0`  
**Portfolio authority:** `NONE`

## Mission
Extract falsifiable, transferable decision rules from historically exceptional traders without transferring their prestige, reputation or isolated successes into ATLAS company scores.

TRADER INTELLIGENCE Ω is not a copy-trading engine. It is an evidence-and-methodology laboratory.

## Universal law — INVESTOR AUTHORITY FIREWALL Ω
`TRADER_IDENTITY != INVESTMENT_EVIDENCE`.

A position, interview, book, filing, public post or famous historical trade may:
- create a research lead;
- create a hypothesis;
- identify a regime, instrument or setup worth testing;
- trigger an adversarial/reverse test.

It may **not**:
- add direct points to company quality, valuation or expected-return scores;
- create BUY/SELL authority;
- change sizing;
- bypass Falsifiers Ω;
- bypass the economic router;
- bypass portfolio concentration rules;
- convert fame into confidence.

## AUTHOR-REMOVAL TEST Ω
Before accepting any trader-derived rule, remove the trader's name.

Question:
> Would ATLAS still regard this rule as useful if the source were anonymous?

If no, classify `PRESTIGE_DEPENDENT` and give it zero methodological authority.

## What counts as a trader signal
A trader signal requires a point-in-time public event with a reconstructible timestamp. Examples:
- regulatory filing;
- official fund letter;
- verified public post/newsletter;
- recorded interview/speech with publication timestamp;
- competition result with documented rules and account class;
- historical fund record from a high-quality source.

Every signal must distinguish:
- `POSITION_DATE` — when the position snapshot refers to;
- `PUBLICATION_TIMESTAMP` — when the market could know it;
- `INSTRUMENT` — shares / put / call / futures / FX / credit / other;
- `DIRECTION` — long / short / hedge / ambiguous;
- `ECONOMIC_EXPOSURE` — only when reconstructible;
- `HEDGE_VISIBILITY` — full / partial / none / unknown;
- `SOURCE_GRADE`;
- `IMPLEMENTABILITY`;
- `DOMAIN_MATCH` — whether the setup belongs to the trader's historically demonstrated domain.

**All public-signal backtests begin at `PUBLICATION_TIMESTAMP`, never at position date.**

## Economic reconstruction gate
`13F NOTIONAL != CAPITAL AT RISK`.

For options, a 13F's reported value is generally the value of the underlying shares represented by the option position, not the premium paid. Without strike, expiry, premium and closing path, do not calculate option P&L.

Required option states:
- `OPTION_FULLY_RECONSTRUCTIBLE`
- `OPTION_DIRECTION_ONLY`
- `OPTION_NOTIONAL_ONLY`
- `OPTION_UNOBSERVABLE_PAYOFF`

## Strategy-domain firewall
Do not treat all traders as interchangeable.

### Quant / statistical
- Jim Simons / Renaissance / Medallion
- Edward O. Thorp / Princeton-Newport

Transferable hypotheses: many weak signals, diversification of independent edges, position sizing, market-neutral construction, model decay, continuous re-estimation.

### Global macro / regime
- George Soros
- Stanley Druckenmiller
- Paul Tudor Jones
- Louis Bacon
- Bruce Kovner

Transferable hypotheses: regime change, liquidity, reflexivity, macro asymmetry, trend confirmation, capital preservation, rapid thesis revision.

### Distressed / contrarian / dislocation
- David Tepper
- Michael Burry

Transferable hypotheses: price-vs-solvency dislocation, balance-sheet survival, forced selling, asymmetric recovery, narrative/fundamental divergence.

### Equity trading / catalysts
- Steven Cohen / SAC / Point72

Transferable hypotheses: catalyst decomposition, fast information updating, position-level risk, kill/resize discipline. Historical performance evidence must be separated from legal/regulatory contamination in the SAC period.

### Systematic trend
- Richard Dennis / Turtle experiment

Transferable hypotheses: explicit entry/exit rules, trend persistence, volatility sizing, reproducibility.

### Growth momentum / equities
- Mark Minervini

Transferable hypotheses: earnings/price leadership, relative strength, trend structure, loss containment, selection discipline. Competition results are not equivalent to a decades-long audited fund record.

### Commodities / FX discretionary
- Michael Marcus
- Bill Lipschutz

Transferable hypotheses: asymmetric opportunity selection, risk budgeting, macro/price synthesis, survival after error.

## Evidence tiers for historical records
### TIER A — strong quantitative historical record
May enter the methodology research set, still with zero direct company-score authority.

1. **Jim Simons / Medallion** — Institutional Investor reports ~66% annualized before fees and ~39% after fees from 1988–2021.
2. **Stanley Druckenmiller / Duquesne** — Institutional Investor reports roughly 30% annualized for many years with no losing year over the fund's long run before closure to outside capital.
3. **Edward Thorp / Princeton-Newport** — CFA Research Foundation records 15.1% annualized net vs 10.2% S&P 500 over 1969–1988, with no losing years and a monthly-data Sharpe approaching 3.
4. **David Tepper / Appaloosa** — Institutional Investor reports >28% gross annualized and roughly 23–25% net since 1993 through the cited 2023 period.
5. **Michael Burry / Scion 2000–2008** — Michael Lewis/Vanity Fair reports +489.34% net from 1-Nov-2000 to 30-Jun-2008 vs just over +2% for the S&P 500.

### TIER B — strong but period/source-definition-sensitive
- George Soros / Quantum — long-run historical reporting commonly places returns around 30% annualized; exact windows and manager attribution must be period-specific.
- Paul Tudor Jones — Forbes historically reported ~24% estimated annual returns and ~125% net in 1987; exact long-window figures require source-period labeling.
- Louis Bacon / Moore Global — Institutional Investor reported ~31% annualized after fees from inception in 1990 through the cited 2000 profile, with strong risk-adjusted results in the 1995–1999 subperiod.
- Steven Cohen / SAC — Bloomberg reported ~30% average annual returns 1992–2013; performance cannot be treated as a clean methodology sample without explicit legal/regulatory caveat.

### TIER C — competition / profile / partially reconstructed evidence
- Mark Minervini — documented U.S. Investing Championship wins: +155% in 1997 and +334.8% in the $1m+ stock division in 2021.
- Richard Dennis / Turtles — documented systematic training experiment and significant returns; exact complete cohort backtest must be rebuilt before quantitative weighting.
- Michael Marcus — profile evidence of extraordinary compounding; not equivalent to an institutional audited fund series.
- Bill Lipschutz / Bruce Kovner and others — research candidates pending a clean, date-bounded record.

**No trader moves to a higher tier because of reputation. Only evidence quality does.**

## Validation ladder — TRADER METHOD SKILL Ω
- `T0_UNTESTED`
- `T1_SAMPLE_INCOMPLETE`
- `T2_NO_POST_PUBLICATION_ALPHA`
- `T3_WEAK_OR_REGIME_DEPENDENT`
- `T4_PERSISTENT_OUT_OF_SAMPLE`
- `T5_REPLICATED`

Only T4/T5 may justify a persistent **research-priority** uplift. Even T5 contributes `0` direct company-quality/valuation score.

## Three simultaneous tests for every public signal
1. **FOLLOW** — take the same directional hypothesis.
2. **REVERSE** — test the opposite directional hypothesis.
3. **ATLAS-BLIND** — remove trader identity and run the security/setup through normal ATLAS economic gates.

Primary null:
`H0: trader identity adds no implementable post-publication information after benchmark, regime, factor and risk controls.`

Alternatives:
- `H1-FOLLOW`: following adds repeatable risk-adjusted alpha.
- `H1-REVERSE`: reversing adds repeatable risk-adjusted alpha.
- `H1-ATLAS`: blind ATLAS filtering dominates both.

## Required controls
- point-in-time timestamps;
- publication latency;
- broad-market benchmark;
- sector/style benchmark;
- factor exposure where possible;
- volatility and drawdown;
- transaction costs/slippage;
- survivorship/delisting treatment;
- multiple-testing control;
- regime segmentation;
- same-trader overlapping-position dependence;
- option payoff observability;
- source independence;
- ex-ante thresholds;
- out-of-sample holdout.

## Primary horizons
Public equity/share signals:
- 1D / 5D diagnostics;
- 1M / 3M diagnostics;
- 6M / 12M primary;
- 24M for slower value/turnaround theses.

Macro, options and futures require instrument-appropriate horizons and cannot be forced into the equity template.

## Outputs
TRADER INTELLIGENCE Ω may output only:
- `RESEARCH_LEAD`
- `METHOD_HYPOTHESIS`
- `FOLLOW_TEST`
- `REVERSE_TEST`
- `ATLAS_BLIND_TEST`
- `DIVERGENCE`
- `REGIME_SIGNAL_CANDIDATE`
- `INSUFFICIENT_EVIDENCE`

It may not output portfolio orders.

## Relationship to existing ATLAS modules
- `GURÚS Ω` becomes a sourcing/convergence sensor under this authority firewall.
- `CAPITAL INTELLIGENCE Ω` remains allocator/disclosure sourcing with its own A0–A5 validation ladder.
- `Historical Dislocation/Burry Ω` is an economic dislocation engine, not an authority-transfer engine.
- `REVERSE BURRY Ω` is a special falsification branch of TRADER INTELLIGENCE Ω.
- `Competition for Capital Ω`, Valuation Ω and Falsifiers Ω remain independent.

## Canonical rule
> The best trader in history is not a BUY signal. The only thing ATLAS is allowed to inherit is a rule that survives evidence, anonymization, point-in-time testing and falsification.

## Source register — initial
- Institutional Investor, Renaissance/Medallion record: https://www.institutionalinvestor.com/article/2e0uykr3vn5booz0smrcw/hedge-funds/renaissances-2024-rebirth
- Institutional Investor, Druckenmiller: https://www.institutionalinvestor.com/article/2btgburh7ac9eno4khpmo/portfolio/druckenmiller-hangs-it-up
- CFA Research Foundation, Thorp/Princeton-Newport: https://www.cfainstitute.org/sites/default/files/-/media/documents/book/rf-publication/2003/rf-v2003-n3-3924-pdf.pdf
- Institutional Investor, Tepper/Appaloosa: https://www.institutionalinvestor.com/article/2d0quhk4ghsahyyia26m8/corner-office/the-23nd-annual-ranking-of-the-highest-earning-hedge-fund-managers
- Vanity Fair / Michael Lewis, Burry/Scion: https://www.vanityfair.com/news/2010/04/wall-street-excerpt-201004
- Institutional Investor, Louis Bacon: https://www.institutionalinvestor.com/article/2btfwnx5ikgbazvsrg074/portfolio/louis-bacon-macro-macro-man
- Forbes, Paul Tudor Jones historical record: https://www.forbes.com/forbes/2008/1006/246.html
- Bloomberg, SAC/Cohen historical profile: https://www.bloomberg.com/news/articles/2018-02-01/steve-cohen-needs-to-prove-himself-to-wall-street-all-over-again
- U.S. Investing Championship / Minervini result carried by PR Newswire: https://www.prnewswire.com/news-releases/stock-trader-wins-us-investing-championship-a-second-time--breaks-record-301466652.html
