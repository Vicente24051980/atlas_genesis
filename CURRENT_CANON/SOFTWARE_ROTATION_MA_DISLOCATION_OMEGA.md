# SOFTWARE ROTATION & M&A DISLOCATION Ω

Status: CURRENT_CANON higher-layer opportunity engine
Effective date: 2026-08-14
Scope: Atlas Financiero Ω / Money Rotation Ω / Historical Dislocation Ω / Entry Timing Ω / Valuation Ω
CORE-00 impact: NONE. This module does not modify the frozen Core engines.

## Mission

Detect when listed software companies with intact fundamentals are being de-rated faster than their business quality deteriorates, and distinguish that from genuine structural impairment. Use M&A activity as valuation evidence and market-clearing information, never as an automatic BUY signal.

Canonical flow:

`SOFTWARE FUNDAMENTALS + VALUATION COMPRESSION + M&A READ-THROUGH + BREADTH/FLOWS -> SOFTWARE ROTATION & M&A DISLOCATION Ω -> HISTORICAL DISLOCATION Ω -> ENTRY TIMING Ω`

## Universe

Primary large/mid-cap software and software-adjacent names with recurring revenue, positive or improving FCF and sufficient liquidity. Initial radar includes WDAY, ADBE, HUBS, PTC, GTLB, PCOR, PATH, SNOW, MDB, TEAM, NOW, CRM and comparable names discovered dynamically.

## Required inputs

### Fundamental quality
- Revenue growth and 2-quarter trend.
- Subscription/product/cloud growth.
- cRPO/RPO/backlog growth where applicable.
- NRR/DBNRR when disclosed.
- Gross margin and operating margin trend.
- FCF margin and FCF/share trend.
- SBC as % of revenue and dilution.
- Net cash/debt and interest burden.
- Guidance revisions.

### Valuation / dislocation
- Drawdown from 52-week and cycle high.
- EV/Sales, EV/FCF, P/FCF and forward earnings vs own 3Y/5Y history.
- Growth-adjusted valuation relative to peer set.
- Multiple compression decomposition: fundamentals vs rerating.

### Rotation / market confirmation
- Relative strength software vs semiconductors/hardware and broad market.
- Equal-weight software breadth.
- ETF/fund flows when comparable and non-overlapping.
- Up/down volume and gap retention after earnings.
- Positive reaction to good news after prolonged de-rating.

### M&A evidence
- Confirmed transaction.
- Publicly reported talks from high-quality sources.
- Board/strategic review disclosure.
- Activist/strategic interest.
- Private-equity/software transaction multiples.
- Peer M&A read-through.

Rumor-only social media chatter receives zero M&A confirmation score.

## Scores

Normalize each component to 0-100.

### Software Fundamental Integrity Score — SFIS

`SFIS = 0.20*RevenueTrend + 0.15*RecurringRevenue + 0.15*RPO_NRR + 0.15*FCFTrend + 0.10*MarginTrend + 0.10*BalanceSheet + 0.10*Guidance + 0.05*DilutionDiscipline`

Hard warning: SFIS < 65 cannot qualify as a high-quality dislocation.

### Valuation Dislocation Score — VDS

`VDS = 0.25*Drawdown + 0.25*OwnHistoryDiscount + 0.20*PeerRelativeDiscount + 0.15*FCFYieldImprovement + 0.15*PriceFundamentalDivergence`

A large drawdown without fundamental integrity does not score as attractive dislocation.

### M&A Read-Through Score — MARS

`MARS = 0.35*DealCredibility + 0.25*ImpliedMultipleSupport + 0.20*StrategicFit + 0.10*SponsorCapacity + 0.10*PeerReadThrough`

Rules:
- Confirmed signed deal: max DealCredibility.
- Multiple independent high-quality reports of talks: medium-high.
- Single analyst speculation: low.
- Social rumor: zero.

### Software Rotation Confirmation Score — SRCS

`SRCS = 0.25*Breadth + 0.20*RelativeStrength + 0.20*ComparableFlows + 0.15*EarningsRevisionBreadth + 0.10*GapRetention + 0.10*CreditBackdrop`

No single-day ETF move can produce R4/R5.

### Composite Opportunity Score — SOS

`SOS = 0.35*SFIS + 0.30*VDS + 0.15*MARS + 0.20*SRCS`

M&A cannot contribute more than 15% of the composite score.

## Operational states

- R1 — NOISE: isolated price move/rumor; insufficient fundamental support.
- R2 — WATCH: valuation compression or M&A read-through present, but no rotation confirmation.
- R3 — DISLOCATION CANDIDATE: SFIS >=75 and VDS >=60, with at least one independent confirmation from FCF/earnings or market breadth.
- R4 — CONFIRMED SOFTWARE ROTATION / DISLOCATION: SFIS >=80, VDS >=60 and SRCS >=60 for >=3 regular sessions or with independent flow + breadth confirmation.
- R5 — ATLAS HANDOFF: R4 plus company-specific earnings/FCF confirmation and acceptable Entry Timing Ω. R5 is research/BUY-review handoff, not an automatic order.

## M&A special handling

### Target under active talks
If a stock gaps on takeover reports:
- classify `EVENT_DRIVEN / NO_CHASE` until terms are signed or price normalizes;
- do not buy solely for expected takeout;
- calculate standalone value separately from deal probability;
- if talks fail, reassess the entire gap as potentially reversible.

### Peer read-through
A credible software take-private can increase MARS for comparable peers if:
- peer fundamentals are intact;
- valuation multiples are similarly compressed;
- strategic or sponsor economics are plausible;
- no company-specific deterioration overrides the read-through.

M&A peer read-through never upgrades Conviction Ω by itself.

## Falsifiers

A candidate is downgraded or rejected when two or more occur:
- revenue/subscription growth decelerates materially for two quarters;
- RPO/cRPO or NRR deterioration inconsistent with temporary timing;
- FCF/share falls while SBC/dilution rises materially;
- guidance cut without a clearly temporary cause;
- net retention/customer growth breaks structurally;
- gross/operating margin deterioration contradicts operating leverage thesis;
- debt/credit stress rises materially;
- positive earnings repeatedly fail to retain gaps while breadth/flows weaken.

## Current initialization — 2026-08-14

Sector state: `R3 -> R4 CANDIDATE / SELECTIVE SOFTWARE RECOVERY`.

Evidence pattern:
- reported Workday/Silver Lake discussions create credible M&A read-through but remain event-driven until signed;
- WDAY fundamental FCF expansion supports standalone quality;
- ADBE and HUBS receive peer valuation read-through only, not automatic thesis upgrades;
- SNOW shows strong growth but has already re-rated substantially, so Entry Timing = NO_CHASE;
- MDB and TEAM remain higher-convexity watch names requiring stricter valuation/fundamental confirmation;
- NOW remains quality core software, not a dislocation by default.

Initial radar priority:
1. ADBE — high quality + valuation dislocation candidate.
2. HUBS — high growth + M&A optionality, valuation sensitive.
3. PTC — industrial software diversification.
4. GTLB — higher-growth/higher-risk.
5. PCOR — long runway, lower quality confidence.
6. PATH — turnaround/speculative.
7. WDAY — EVENT_DRIVEN / NO_CHASE while takeover talks remain unresolved.

## Cross-engine integration

`SOFTWARE ROTATION & M&A DISLOCATION Ω × QUALITY Ω × VALUATION Ω × MONEY ROTATION Ω × HISTORICAL DISLOCATION Ω × GREEN CONTINUITY Ω × ENTRY TIMING Ω`

If AI-related software fears are the cause of de-rating, cross-check with AI CAPEX PAYBACK Ω and company-specific AI monetization evidence. Software price weakness is not itself proof of AI disruption.

## Actions allowed

- promote names to Historical Dislocation Ω research;
- tighten/relax Entry Timing Ω based on gap retention and breadth;
- rank software candidates by quality-adjusted expected return;
- flag M&A-supported valuation floors as hypotheses;
- compare standalone value vs transaction-implied value.

## Actions forbidden

- BUY because an analyst names a company as an M&A candidate;
- BUY a takeover target after a large gap solely on deal probability;
- declare Hardware -> Software regime from one session;
- treat price targets as intrinsic value;
- override company-specific falsifiers with sector rotation.

## Governance

This is a higher-layer opportunity engine. It cannot modify portfolio composition automatically. Any portfolio constituent change requires explicit user decision or a separately validated thesis/falsifier process.
