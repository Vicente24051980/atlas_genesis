# RFC — LEADERSHIP BIAS CONTROL Ω v1.0

## Problem

ATLAS can become over-anchored to incumbent mega-cap winners because they dominate indices, analyst coverage, liquidity, institutional ownership and available data. That creates a systematic selection bias: the same globally famous names repeatedly win screens even when their forward runway is slowing and newer consolidated challengers offer superior expected return after risk.

The opposite error is equally dangerous: removing elite leaders merely because they are large, then replacing them with speculative momentum names.

## Objective

Create a canonical bias-control layer that preserves proven leaders when their forward economics remain elite while forcing every review to surface and compare consolidated challengers, emerging leaders and adjacent beneficiaries receiving capital.

## Design

### Forward Asymmetry Score Ω

Eight dimensions, 0–100:

1. Forward growth runway — 20%
2. Incremental ROIC and FCF conversion — 15%
3. Earnings revision trend — 10%
4. Institutional sponsorship — 10%
5. Valuation asymmetry — 15%
6. Competitive position — 10%
7. Consolidation/execution proof — 10%
8. Balance sheet/risk — 10%

### Incumbent Maturity Penalty Ω

Five forward-looking penalties:

1. TAM / size saturation — 25%
2. Multiple compression risk — 20%
3. Growth deceleration — 25%
4. CAPEX payback risk — 15%
5. Crowding/consensus saturation — 15%

Market capitalization itself is not a penalty or a positive factor.

### Comparison rule

Adjusted incumbent score = incumbent forward score − maturity penalty.

A challenger can compete for replacement only if:

- Quality gate passes;
- Risk gate passes;
- forward asymmetry advantage is material (default >= 8 points);
- portfolio risk architecture is preserved or improved.

Positive but non-material advantage routes to STARTER_CHALLENGER rather than full replacement.

## Required discovery behavior

Each major portfolio function must include a comparison set containing:

- proven incumbent;
- consolidated challenger;
- emerging leader/discovery option when admissible;
- adjacent beneficiary if capital is migrating along the value chain.

The engine must therefore prevent discovery from collapsing into the same 8–10 mega-cap names.

## Relationship with other engines

This engine is a Bias Control / comparison-universe engine, not an independent BUY/SELL engine.

It interacts with:

- Global Discovery Ω — expands comparison candidates;
- Business Quality Ω — quality gate;
- Growth Ω — forward runway;
- CAPEX Productivity Ω — incremental returns;
- Institutional Capital Rotation Ω — sponsorship/context;
- Money Rotation Ω — capital rotation lifecycle;
- Valuation Ω — asymmetry normalization;
- Risk Ω — downside/gates;
- Entry Timing Ω — starter/no-chase execution;
- Decision Safety Gate Ω — final authority.

## Anti-bias invariants

- Size != quality evidence.
- Fame != moat evidence.
- Historical winner != future winner.
- Recent price strength != institutional flow.
- Smaller company != superior expected return automatically.
- Challenger promotion requires evidence and gates.
- Mega-cap retention requires forward economics, not legacy status.

## Portfolio architecture implication

The desired portfolio is not “mega-cap” or “small-cap.” It is **best of each house**:

- elite proven compounders where runway remains strong;
- consolidated challengers with superior forward asymmetry;
- a bounded discovery/tactical sleeve for exceptional emerging opportunities.

This creates controlled exploration without sacrificing the quality core.
