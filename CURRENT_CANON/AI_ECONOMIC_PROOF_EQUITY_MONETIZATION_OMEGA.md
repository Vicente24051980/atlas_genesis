# AI Economic Proof × Equity Monetization Ω

**Canonical date:** 2026-08-21  
**Status:** ACTIVE / CANONICAL  
**Implementation:** `src/atlas/algorithm/ai-economic-proof-equity-monetization-omega.ts` v1.1  
**Integrity override:** `CURRENT_CANON/2026-08-21_GREEN_EPROOF_INTEGRITY_OVERRIDE_OMEGA.md`

## Purpose

ATLAS Ω answers two different questions independently:

1. **AI Economic Proof Ω** — does the business actually capture AI value?
2. **AI Equity Monetization Ω** — is the stock market currently rewarding that value?

These axes are orthogonal. Market-data weakness or missing GREEN can never erase otherwise valid Economic Proof; strong economics can never be used to pretend the stock is already a market winner.

## Economic Proof Ω — business evidence only

Economic Proof uses the canonical AI proof chain:

- **T2 Revenue Capture**
- **T3 Free Cash Flow**
- **T5 AI ROIC**
- **T6 Moat / Persistence**

`CAPEX announced != revenue != FCF != ROIC` remains mandatory.

Economic Proof validation is independent from:

- GREEN Continuity;
- Price Matrix verification;
- drawdown from Tmax;
- relative strength;
- breadth;
- institutional flow / positioning;
- price response.

If those market inputs are missing or invalid, valid Economic Proof remains valid.

## Equity Monetization Ω — market evidence only

The market axis may consume:

- verified Price Matrix;
- drawdown from verified Tmax;
- **verified GREEN Continuity**;
- relative strength;
- breadth support;
- flow / positioning;
- price response to evidence.

GREEN is allowed here because this is a market-behavior axis. It is forbidden as an Economic Proof validation dependency.

## Clean winner / CONFIRMED RECEIVER gate

A clean winner requires all of the following:

- Price Matrix verified;
- drawdown from Tmax >= -5%;
- GREEN Continuity >= 4/5;
- relative strength >= 70;
- flow / positioning >= 65;
- price response >= 65.

A company may have strong Economic Proof while failing this gate.

## Independent validation law

The implementation exposes separate validators:

- `validateAiEconomicProofInput()` — business proof only;
- `validateAiEquityMonetizationInput()` — market axis only;
- `validateAiOpportunityInputs()` — valuation/capital-efficiency/risk composition only.

The backward-compatible aggregate validator exists only for full-composition checks and **must not be used to score Economic Proof**.

Therefore:

- `Price Matrix UNVERIFIED` => Equity Monetization UNVERIFIED, Economic Proof preserved if its own evidence passes.
- `GREEN invalid/unavailable` => Equity Monetization UNVERIFIED, Economic Proof preserved if its own evidence passes.
- Invalid business proof => Economic Proof UNVERIFIED independently of market strength.

## Final Opportunity

`finalOpportunityVerified = true` only when Economic Proof, Equity Monetization and the opportunity inputs all pass their own validation.

If Equity Monetization is unverified but Economic Proof is valid:

- Economic Proof score/state are preserved;
- Equity Monetization is `UNVERIFIED`;
- Final Opportunity is not verified and its score is not promoted;
- default decision is `MONITOR`, not a false fundamental `REJECT`.

## Canonical divergence

The core phenomenon remains:

`Economic Proof UP + Equity Monetization DOWN = PROOF_UP_MONETIZATION_DOWN`

Default decision: `WATCH_FOR_REMONETIZATION`, never automatic BUY.

## Terminology law

**Winner** is an equity word.

Recognized revenue, backlog, FCF, ROIC, capacity growth or pricing power can establish economic capture, but do not create a market winner by themselves.

Likewise, relative strength or smaller drawdown does not establish Economic Proof.

## Integrity rules

1. Evidence > narrative.
2. Price != fundamental evidence.
3. Trigger != falsifier.
4. GREEN belongs to market behavior, not Economic Proof.
5. Relative strength != clean winner.
6. Smaller drawdown != capital inflow.
7. Economic capturer != equity winner.
8. Equity Monetization failure cannot erase valid Economic Proof.
9. Economic Proof cannot repair a failed GREEN window.
10. No UNVERIFIED market axis may be silently promoted into a verified Final Opportunity score.
11. Falsifiers Ω remains independent and retains absolute veto for confirmed material structural falsifiers.

## Regression requirement

The test suite must preserve at least these invariants:

- valid Economic Proof remains `PROVEN_STRONG` when Price Matrix is unverified;
- invalid GREEN cannot make valid Economic Proof `UNVERIFIED`;
- a true clean winner still requires the complete market gate;
- `PROOF_UP_MONETIZATION_DOWN` remains possible and distinct.

Implementation regression authority: `src/atlas/algorithm/ai-economic-proof-equity-monetization-omega.test.ts`.
