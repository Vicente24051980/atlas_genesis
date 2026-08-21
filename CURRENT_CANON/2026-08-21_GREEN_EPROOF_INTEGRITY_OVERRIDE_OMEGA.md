# GREEN / ECONOMIC PROOF INTEGRITY OVERRIDE Ω

**Status:** ACTIVE · CANONICAL OVERRIDE  
**Effective:** 2026-08-21  
**Issue:** #73  
**Scope:** all ATLAS Ω listed-equity analysis and AI Economic Proof composition

## 1. GREEN is inside the canonical main sequence, but only through verified data

Canonical entrypoint:

`EVIDENCE/SOURCE/QUANT/TEMPORAL INTEGRITY → IDENTITY → GREEN_VERIFIED_CONTINUITY_OMEGA_V1_0 → GREEN PULSE/BREADTH/RELATIVE → PRINCIPAL Ω → all remaining applicable engines`

`GREEN_VERIFIED_CONTINUITY_OMEGA_V1_0` internally requires:

`GREEN_PROVIDER_QUORUM_OMEGA_V1_1 → GREEN_CONTINUITY_OMEGA_V1_4`

Direct promotion of vendor `Performance %`, analyst commentary, news, inferred returns or stale tables into GREEN is forbidden.

## 2. Provider quorum hardening

Each of `1W / 1M / 3M / 1Y / TOTAL-MAX` requires at least **3 CORE providers** from:

- TradingView
- Yahoo Finance historical market data
- Barchart
- Investing.com

Trading 212 user-visible evidence is an **optional broker-side cross-check only**. It never counts toward the required three core providers.

For every horizon, VERIFIED requires:

- exact ticker identity;
- canonical identifier / exchange / currency agreement;
- identical canonical start date across core providers;
- exact `expectedMarketCut` as common regular-session end date;
- split-adjusted, dividend-unadjusted regular-market closes;
- ATLAS recomputation from raw closes;
- unanimous sign agreement;
- cross-provider dispersion <= 0.25 percentage points;
- no conflicting Trading 212 sign when broker evidence is supplied for the same cut.

Any failure => horizon not VERIFIED => complete GREEN vector remains `QUARANTINE`.

Caller overrides may make the quorum stricter but may never reduce the 3-provider minimum or widen the 0.25pp tolerance.

## 3. ROST regression law

ROST is retained as a regression example for the error class exposed on 2026-08-21.

A visible vector such as:

- 1W negative
- 1M negative
- 3M positive
- 1Y positive
- TOTAL/MAX positive

is **GREEN 3/5**, irrespective of strong earnings, guidance upgrades, analyst targets or premarket reaction.

Fundamentals can never rewrite those five price signs.

## 4. Economic Proof is outside GREEN validation

Economic Proof and GREEN are orthogonal engines.

AI Economic Proof validation uses only its own business-evidence requirements, including the canonical T2/T3/T5/T6 proof chain. It does **not** depend on:

- GREEN continuity;
- Price Matrix verification;
- drawdown from Tmax;
- relative strength;
- breadth;
- institutional flow / positioning;
- price response.

Therefore:

`invalid or missing GREEN / Price Matrix` **must not** convert otherwise valid Economic Proof into `UNVERIFIED`.

Market-data failure may make **Equity Monetization** and **Final Opportunity** unverified, while preserving the independently verified Economic Proof state.

## 5. Equity Monetization may consume GREEN; Economic Proof may not

Verified GREEN is allowed as an input only to the market/equity axis:

`Price Matrix + drawdown + GREEN + RS + breadth + flow + price response → Equity Monetization`

It is forbidden as a proof or validation dependency for:

`T2 Revenue Capture + T3 FCF + T5 AI ROIC + T6 Moat/Persistence → Economic Proof`

## 6. Error-prevention laws

1. No synchronized raw-close quorum = no GREEN score.
2. Trading 212 does not satisfy the three-core-provider quorum.
3. Trading 212 conflict on the same cut = quarantine, not majority vote.
4. Different start dates = quarantine even if signs happen to agree.
5. Economic Proof is never zeroed because GREEN or Price Matrix is unavailable.
6. GREEN is never improved because Economic Proof, earnings or analyst revisions are strong.
7. Final Opportunity cannot be verified until its required independent axes pass.
8. Falsifiers Ω remains independent and retains absolute veto for confirmed material structural falsifiers.

## 7. Implementation authority

- `src/atlas/algorithm/green-provider-quorum-omega.ts` — v1.1
- `src/atlas/algorithm/green-verified-continuity-omega.ts` — v1.0 canonical entrypoint
- `src/atlas/algorithm/green-continuity-omega.ts` — v1.4 classifier, called only after verified entrypoint in canonical execution
- `src/atlas/algorithm/ai-economic-proof-equity-monetization-omega.ts` — v1.1 separated validators
- `src/atlas/algorithm/atlas-primary-engine-hierarchy.ts` — v4.7.0
- regression tests: `green-verified-continuity-omega.test.ts` and `ai-economic-proof-equity-monetization-omega.test.ts`

## 8. Supersession

This override supersedes any implementation or documentation that:

- lets unverified percentages enter canonical GREEN directly;
- counts broker screenshot evidence as one of the three required core providers;
- permits different horizon start dates across providers;
- allows a GREEN/Price Matrix validation error to erase valid Economic Proof;
- uses Economic Proof, quality, news or analyst revisions to infer GREEN.
