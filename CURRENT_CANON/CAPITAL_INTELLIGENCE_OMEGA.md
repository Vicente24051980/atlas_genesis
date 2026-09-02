# CAPITAL INTELLIGENCE Ω / DYNASTIC ALLOCATOR TRACKER

**Status:** CANONICAL SENSOR  
**Effective date:** 2026-09-02  
**Role:** discovery / challenger sensor only. **Never an autonomous BUY engine.**

## Mission
Transform public and legal capital-allocation disclosures into falsifiable ATLAS signals. Track whether selected allocators, family offices, holdings and professional capital brokers identify companies, sectors or value-chain bottlenecks before those theses become consensus.

## Epistemic rule
Do **not** attribute anticipation to inside information without documentary evidence. Test legal explanations first: sector specialization, management access, due diligence, private-market deal flow, board exposure, operating-company feedback, pilots, proprietary research, long horizon, valuation discipline, network density and superior selection.

## Core entities — initial priority
1. Lingotto / Exor / John Elkann
2. Progeny 3 / Jon Hemingway / Lauren Offenbecher
3. Investor AB / Wallenberg sphere
4. Mousse Partners / Arthur Heilbronn / Paul Yun
5. Peugeot Invest / Edouard Peugeot / TowerBrook
6. Power / Desmarais / Sagard
7. Rothschild & Co / Five Arrows

Discovery is open-ended. Add new allocators when evidence shows decision authority, material capital, observable filings, recurring coinvestment, private-direct investing, board centrality or cross-family brokerage.

## Source hierarchy
A — regulatory filing (13F, 13D/G, Form 4, issuer filing)  
B — official IR / annual report / official transaction release  
C — Reuters / Bloomberg / FT / WSJ or equivalent  
D — reputable specialist / database  
E — inference

Only **A/B** may create an ATLAS operational research flag. C may trigger investigation. D/E never create a BUY.

## Mandatory dates
For every observable position record:
- `POSITION_DATE`
- `PUBLICATION_DATE`

**All public-signal backtests start at PUBLICATION_DATE.** Never use quarter-end as the date ATLAS could have known the information.

## Official events
### NEW CONVICTION Ω
New position with material portfolio weight or company ownership.

### POSITION ACCELERATION Ω
Material quarter-on-quarter increase in shares or economic exposure. Default research trigger: `>=50%`, adjusted for splits and corporate actions.

### PERSISTENT ACCUMULATION Ω
Repeated additions across `>=3` reporting periods.

### CONVICTION TRAJECTORY Ω
Track real capital conviction through `shares-adjusted + weight + value + price effect`, not portfolio weight alone.

### TOE-HOLD → VALIDATE → SCALE Ω
Small initial position followed by a large increase after one or more validation periods.

### PERSISTENCE AFTER DRAWDOWN Ω
Allocator adds after a material public drawdown instead of abandoning the thesis.

### CROSS-CAPITAL Ω
Two or more independent active capital networks converge on the same company, value chain or theme.

### THEME BEFORE TICKER Ω
Several investments express the same structural thesis even when the tickers differ.

### PRIVATE → PUBLIC Ω
Private investment is translated into listed suppliers, competitors, customers, infrastructure and bottlenecks. This is a derived research signal, not proof that the allocator owns those public equities.

### CAPITAL EXIT Ω
Material reduction or full exit. Default research trigger: `>50%` reduction.

## Signal-quality framework
`CAPITAL SIGNAL QUALITY = Materiality + Freshness + Persistence + Independent Convergence + Decision Authority + Source Quality + Historical Lead-Time Value`

Suggested weights:
- Materiality 25
- Freshness 15
- Persistence 15
- Convergence 15
- Decision authority 10
- Source quality 10
- Historical lead-time value 10

States:
- `85–100` 🔥 CAPITAL PRIORITY
- `70–84` 🟢 STRONG SIGNAL
- `55–69` 🟡 WATCH
- `<55` ⚪ ARCHIVE

## INFORMATION ADVANTAGE EXPLAINER Ω
When a signal later produces alpha, classify plausible mechanism:
- BOARD / governance access
- PRIVATE-MARKET exposure
- MANAGEMENT access
- INDUSTRY specialization
- OPERATING-company feedback
- PILOT / customer data
- DEAL-FLOW / sourcing network
- EXPERT network / due diligence
- LONG-HORIZON advantage
- VALUATION / contrarian discipline
- CAPITAL-STRUCTURE advantage
- LUCK / unresolved

This module must distinguish **SMART PROCESS**, **STRUCTURAL ACCESS**, **LUCK** and **UNKNOWN**.

## Backtest protocol
For every event calculate from `PUBLICATION_DATE`:
- 1D / 5D / 1M / 3M / 6M / 12M / 24M
- absolute return
- excess return vs S&P 500
- excess return vs Nasdaq-100
- excess return vs sector benchmark
- MFE
- MAE
- max drawdown
- volatility
- hit rate
- median alpha
- mean alpha
- approximate information ratio

No look-ahead bias. No survivorship bias where avoidable. Include delisted names when possible.

## Current historical case studies
### CASE 001 — CCJ / Cameco
Working finding: Exor predecessor disclosed Cameco in Q4-2017; Progeny independently built uranium exposure from 2018 onward. Classify as `CROSS-CAPITAL EARLY CONVERGENCE Ω` and `THEME BEFORE TICKER Ω`. Audit exact filing/publication dates and post-publication alpha before using in statistical summaries.

### CASE 002 — APG / APi Group
Progeny pattern: small initial position followed by major scale-up and multi-year persistence. Classify `TOE-HOLD → VALIDATE → SCALE Ω`.

### CASE 003 — IBKR
Progeny pattern: persistent accumulation into a core position. Correct all share histories for stock splits before scoring acceleration.

### CASE 004 — TSM
Lingotto pattern: initial smaller position followed by repeated additions and weight expansion. Classify `PERSISTENT ACCUMULATION Ω`.

### CASE 005 — NBIS
Working pattern: first public signal underperformed initially; later addition after drawdown performed much better. Classify `PERSISTENCE AFTER DRAWDOWN Ω`; keep provisional until exact price and filing timestamps are audited.

## LIVE 2026 — RRC / MOH deep-dive
### RRC — Range Resources
Current interpretation: **high-quality live capital signal**.

Observed working facts to audit from primary filings:
- Lingotto has held RRC for years and materially increased exposure in Q2-2026.
- Reported Q2 increase: approximately `+53.5%` shares.
- Kopernik independently increased RRC materially in the same quarter, creating a `CROSS-CAPITAL Ω` candidate.
- Thesis cluster: low-cost Marcellus gas, LNG, U.S. gas strategic value, power/data-center demand, long inventory, capital returns.

ATLAS provisional scores:
- Capital Intelligence: 97/100
- Convergence: 100/100
- Fundamentals: 91/100
- Valuation: 87/100
- Risk-adjusted return: 90/100
- Entry: 82/100
- Composite working score: **92/100 🔥**

Interpretation: `PERSISTENCE + POSITION ACCELERATION + CROSS-CAPITAL`. RRC is currently the cleaner of the two live Lingotto signals because allocator conviction is accompanied by stronger current fundamentals and independent convergence.

### MOH — Molina Healthcare
Current interpretation: **very high allocator conviction, but thesis still requires fundamental normalization**.

Observed working facts to audit from primary filings:
- Lingotto opened a very large new Q2-2026 position.
- Working estimate: ~2.51M shares, ~$574M, ~12.3% of Lingotto's disclosed 13F and ~4.8% of MOH.
- Thesis appears consistent with an earnings-normalization / Medicaid-rate-lag turnaround rather than current-earnings cheapness.
- Baupost appears to maintain exposure; Kopernik reportedly exited, creating meaningful smart-money disagreement rather than convergence.

ATLAS provisional scores:
- Capital Intelligence: 98/100
- Convergence: 72/100
- Current fundamentals: 58/100
- Normalization potential: 96/100
- Valuation on normalized EPS: 86/100
- Valuation on current EPS: 45/100
- Composite working score: **78/100 🟢/🟡**

Interpretation: `NEW CONVICTION Ω` / `EARNINGS NORMALIZATION TRADE Ω`. High upside if margins normalize; materially higher thesis risk than RRC.

## Experimental portfolios
### CAPITAL SNIPER Ω — HISTORICAL / VALIDATED CORE
Research-only portfolio. Not part of the official ATLAS holdings.
- CCJ
- IBKR
- APG
- TSM
- CVNA
- TEVA
- RRC

### CAPITAL SNIPER Ω — LIVE 2026 WATCH
Research-only forward-test universe:
- MOH
- RRC
- TSM
- NBIS
- CCJ
- IBKR
- APG
- TIC
- SSNC
- CLBT
- AROC

Weights and membership may change **only under explicit signal rules**, never because of hindsight or discretionary narrative repair.

## ATLAS integration gate
`CAPITAL INTELLIGENCE Ω = SENSOR → CHALLENGER / RESEARCH FLAG`

Then candidate must still pass applicable ATLAS engines:
- fundamentals
- quality
- growth
- return
- FCF
- valuation
- GREEN Ω
- momentum
- risk
- Expectations Saturation Ω
- AI concentration / portfolio concentration
- Entry Timing Ω
- forward EPS / revenue
- balance sheet
- management
- geopolitical risk
- Competition for Capital Ω

**No allocator, family office, billionaire, 13F or coinvestor network can override these gates.**
