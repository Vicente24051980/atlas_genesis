# Recovered ATLAS Ω Canon and Architecture — 2026-08-09

> Recovery record. This document preserves the currently recoverable governing architecture from the long-running ATLAS Ω work. It is not a substitute for older source messages and does not erase superseded versions.

## Governing investment principles

- Evidence > narrative.
- Price is not thesis evidence.
- AI output is never evidence by itself.
- Primary sources have priority.
- Thesis changes only when evidence changes.
- Do not sell from fear or ordinary volatility.
- Sell only after a confirmed structural falsifier.
- Investment horizon: approximately 3–6 years.
- Capital allocation should optimize quality + valuation rather than quality alone.

## Source hierarchy

### Level 1 — primary
SEC filings, Investor Relations, conference calls, 10-K, 10-Q, 8-K, official company presentations and equivalent primary disclosures.

### Level 2 — high-quality secondary
Reuters, Bloomberg, AP, AFP and similarly rigorous wire services.

### Level 3 — analytical platforms
InvestingPro, Trading212 AI, WarrenAI, MultiVersial and comparable derived-analysis platforms.

### Level 4 — hypothesis generation
YouTube, pundits, analysts, social media and commentary. These can generate research questions but do not independently change conviction.

## Canonical analysis chain

Global Discovery → Market Filters → Business Quality Ω → Growth Ω → CAPEX Productivity Ω → Valuation Ω → Risk Ω → Catalysts Ω → Final Score Ω.

For a specific company/news event:

News → Results → Guidance → Moat → Quality → Growth → Financial Quality → Valuation → Conviction → Action.

## Discovery sequencing rule

Discovery must be unbiased and ticker-first.

1. Start from a broad global universe without narrative, preferred-sector, portfolio, watchlist or ATLAS-quality bias.
2. Only after discovery apply market filters such as Day > 0, 3M > 0, 1Y > 0, liquidity, size or other screen-specific conditions.
3. Only after market filtering apply ATLAS business-quality and later analytical layers.

Historical lesson: failing to do broad independent discovery created coverage bias and caused strong candidates to be missed.

## Six-pillar investment score used in the thread

- Quality Ω — 25%
- Growth Ω — 20%
- Moat Ω — 15%
- Financial Quality Ω — 15%
- Management Ω — 10%
- Valuation Ω — 15%

### Financial Quality Ω
Includes ROIC, FCF, balance sheet, margins and capital allocation.

### Management Ω
Includes CEO/executive execution, capital allocation, buybacks, insider alignment and guidance credibility.

### Valuation Ω / RFC-VAL-001
Includes forward P/E relative to history/peers, PEG, EV/EBITDA, EV/FCF, FCF yield, DCF/fair value, margin of safety, implied market expectations and sector comparison.

Permanent valuation lesson: an excellent company is not automatically the best investment at any price. Valuation changes purchase priority without itself invalidating a thesis.

## Business Quality Ω — recovered canonical principles

Business quality is the demonstrated ability to create economic value per share over long periods through durable competitive advantages, high returns on capital, consistent cash generation and disciplined capital allocation.

Hard requirements include profitability, positive FCF, a strong balance sheet, sufficient liquidity, adequate market capitalization, acceptable governance and absence of a structural falsifier.

Recovered 100-point framework:

- Moat — 25
- Capital Allocation — 20
- Cash Generation — 15
- Financial Strength — 15
- Sustainable Growth — 10
- Business Durability — 10
- Valuation — 5

## CAPEX PRODUCTIVITY Ω v1.0

Mission: measure whether incremental capital invested creates or destroys economic value per share, separating productive CAPEX, not-yet-monetized CAPEX, diminishing returns, unsustainable financing and accounting growth without per-share value creation.

Score 0–100:

- ROIC and trend — 20
- CAPEX → FCF conversion — 20
- Asset productivity — 15
- Capital intensity — 15
- Financing quality — 10
- Dilution — 10
- Incremental return — 10

Recovered warning signals include:

- CAPEX > +25% while ROIC falls.
- CAPEX > +25% while FCF/share falls.
- FCF/CAPEX falls for two fiscal years.

## Structural falsifiers

- Permanent moat deterioration.
- ROIC destruction.
- Structural FCF deterioration.
- Loss of competitive advantage.
- Fraud.
- Persistent capital-allocation failure.
- Structural regulatory change that breaks the economics of the thesis.

## Decision outputs

- Buy
- Hold
- Reduce
- Sell

A certified decision should surface conviction, quality, growth, moat, financial quality, management, valuation, risks and thesis falsifiers.

## CORE / E2E architecture recovered from project work

CORE-00 remains frozen under UO 1.1 RC1 and is not reopened by higher-layer integration work.

E2E-001 canonical higher-layer flow:

Transcript/Input → Parser/UO 1.1 → Validation Harness Ω (PASS | QUARANTINED | REJECT) → Orchestrator → Epistemic Classification Skill → routing into Facts / Evidence / Hypotheses / Interpretations → Biblioteca Atlas / Atlas Conspiraciones / Gemelo Digital → Certified Output.

The Epistemic Classification Skill is a higher-layer skill, not a new Core engine.

## Atlas OS / mobile implementation context

Recovered architectural decisions include Android as the target platform, Expo + EAS build workflows, SQLite + Drizzle ORM, EAS Update, DataBundle Ω, FrozenPayload, Clock, FailFast/ContinueOnError, RFC-CORE-002 schema work and functional Android release gates. These belong to engineering canon/history rather than investment canon and should remain separately versioned.
