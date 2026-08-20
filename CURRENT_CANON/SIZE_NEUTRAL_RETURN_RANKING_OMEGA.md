# SIZE-NEUTRAL RETURN RANKING Ω

**Status:** ACTIVE CANON  
**Effective date:** 2026-08-20  
**Authority:** explicit user instruction  
**Implementation:** `src/atlas/algorithm/size-neutral-return-ranking-omega.ts`

## Purpose

Remove hidden mega/hyper-cap and generic-quality bias from ATLAS Ω return rankings without penalizing large companies merely for being large.

ATLAS must rank a dinosaur, elephant, parakeet and mosquito on the same evidence-backed return surface. If a mega/hyper-cap wins after neutralization, it wins legitimately. If a smaller company wins, it must win on economics and expected return rather than on a small-cap preference.

## Constitutional law

**MARKET CAP = 0 BONUS / 0 PENALTY.**  
**GENERIC QUALITY LABEL = 0 BONUS.**  
**EVERY TICKER STARTS AT 0/1000.**  
**FALSIFIERS Ω = ABSOLUTE VETO.**

No ticker receives baseline points because it is famous, liquid, institutionally owned, heavily covered, included in a major index, historically excellent or already known to ATLAS.

## Universal 0–1000 surface

Each company receives ten independent blocks of 0–100 points:

1. **Economic Proof Ω** — verified conversion of demand into revenue/margins/economic output.
2. **Cash Efficiency Ω** — normalized FCF margin, FCF/share growth, FCF yield and incremental ROIC rather than absolute dollars.
3. **Growth Acceleration Ω** — percentage growth, acceleration/deceleration and operating leverage.
4. **Expected Return / Valuation Ω** — forward return supported by valuation and economics, independent from prestige.
5. **Consensus Dynamics / Revisions Ω** — evidence-backed estimate revisions and expectation change.
6. **Money Rotation Ω** — relative/abnormal flow evidence, never raw market-cap or absolute-volume advantage.
7. **Momentum / Breadth Ω** — relative strength, abnormal/relative volume and persistence versus own history/peers.
8. **Historical Dislocation / Forward Asymmetry Ω** — evidence-backed upside/downside asymmetry and No-Chase discipline.
9. **Specialist Engine Capture Ω** — applicable CAPEX, Successor, Robotics, AI Tollbooth, Clinical, Wave, Developer Activity and other specialist outputs integrated without style preselection.
10. **Risk / Durability Ω** — balance-sheet, funding, concentration, governance, regulatory, cyclicality and durability evidence.

Raw total = sum of the ten blocks. There are no baseline points. Range = **0–1000**.

## Forbidden size/prestige proxies

These variables may exist as metadata or research context but MUST NOT add points directly:

- market capitalization;
- generic `Quality` label or generic quality score;
- absolute FCF dollars;
- absolute traded volume;
- analyst count / research coverage;
- index weight / index membership;
- fame / brand notoriety;
- liquidity as a prestige proxy;
- institutional ownership merely because it is large.

If an implementation accepts a direct score contribution from one of these proxies, it violates this canon.

## Required normalization

Use economic ratios/rates rather than size-dependent absolutes whenever possible:

- FCF → FCF margin, FCF/share growth, FCF yield;
- ROIC → level + incremental ROIC;
- revenue → percentage growth + acceleration;
- buybacks → net buyback yield / per-share effect;
- volume → relative/abnormal volume versus own history;
- flows → verified fund/ETF/positioning evidence or normalized proxies, with `MARKET_CAP_CHANGE ≠ CAPITAL_FLOW` preserved;
- backlog/RPO → growth, conversion quality and economics, not absolute backlog prestige.

## Business Score vs Opportunity Score

ATLAS MUST expose two diagnostics while keeping the final 0–1000 score neutral:

- **Business Score:** current economic proof, cash efficiency, growth economics and durability.
- **Opportunity Score:** expected return/valuation, revisions, money rotation, momentum/breadth, dislocation/asymmetry and specialist capture.

A great company can have a lower Opportunity Score. A less mature company can have a higher Opportunity Score only if evidence supports the return asymmetry.

**BEST COMPANY ≠ BEST INVESTMENT NOW.**

## Growth Saturation Ω

Growth Saturation Ω replaces any mechanical market-cap ceiling as a ranking penalty.

It asks whether current economics make the growth embedded in valuation increasingly difficult to sustain. It may penalize the **Growth Acceleration** block only when supported by evidence such as:

- slowing percentage growth from an enlarged revenue base;
- TAM penetration approaching a credible limit;
- declining incremental ROIC;
- deteriorating unit economics;
- margin pressure required to sustain growth;
- implausible revenue/FCF scale implied by current valuation and expected return.

**Size alone is never sufficient evidence of saturation.** A $5T company and a $5B company with identical normalized economics receive identical ranking points.

## Discovery / Successor Ω integration

To avoid incumbent bias, discovery prioritizes evidence of acceleration rather than current scale:

- revenue acceleration;
- EPS/FCF revisions;
- incremental ROIC;
- operating leverage;
- TAM capture;
- new markets/products;
- orders/backlog/RPO quality and conversion;
- sponsorship/flow acceleration;
- evidence that a new bottleneck/control point is emerging.

This enables future leaders to compete before they become mega-caps.

## Size classification — post-score only

Only after the 0–1000 score is frozen may ATLAS reveal market capitalization and attach a diagnostic label:

- **MOSQUITO:** < $10B
- **PERIQUITO:** $10B–<$100B
- **ELEFANTE:** $100B–<$1T
- **DINOSAURIO:** >= $1T

These buckets never alter the score or eligibility.

## Bias audit

Required sequence:

`EVIDENCE → normalized economics → all applicable engines → 0–1000 score → FREEZE → reveal market cap → size-distribution audit`

ATLAS should inspect whether the highest ranks are persistently concentrated in one size bucket. Concentration is not automatically an error. If mega-caps dominate, ATLAS must be able to show that the result comes from expected return/economic evidence rather than residual size proxies.

## Evidence gate

A high score with incomplete traceability remains diagnostic. Confirmed ranking eligibility requires traceable evidence. AI output is never evidence.

## Falsifiers Ω

Falsifiers remain an independent absolute veto. A company may retain a high diagnostic 0–1000 score while being ineligible for BUY/ranking action because a falsifier is active. The score must not erase the veto and the veto must not erase diagnostic information.

## Relationship to MEGACAP RETURN CEILING Ω

This canon **supersedes the mechanical size-penalty / market-cap-ceiling ranking rule** in `MEGACAP_RETURN_CEILING_OMEGA.md`.

Scenario market-cap arithmetic (2x/3x/5x) may remain as a **diagnostic valuation feasibility check**, but it cannot deduct points merely because the starting market capitalization is large. Any negative scoring consequence must enter through Expected Return, Growth Saturation, valuation, incremental economics or risk with traceable evidence.

## Canonical objective

ATLAS does not ask:

> Which company is the biggest, safest or most famous?

ATLAS asks:

> Where does one unit of capital receive the strongest evidence-backed combination of future growth, FCF/ROIC conversion, revisions, capital sponsorship, valuation and catalysts after risk and falsifiers?

**Dinosaurio vs elefante vs periquito vs mosquito is an audit label, not an investment preference.**
