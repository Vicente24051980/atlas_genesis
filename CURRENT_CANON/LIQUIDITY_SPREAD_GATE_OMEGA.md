# LIQUIDITY / SPREAD GATE Ω v1.1

**Status:** CANONICAL / EXECUTION GUARDRAIL
**Effective date:** 2026-08-25
**Scope:** public-equity MARKET and LIMIT orders where quote/execution friction can materially distort entry price. STOP trigger-time liquidity requires a separate future contract.

## Purpose

ATLAS Ω must separate **investment quality** from **execution quality**.

A ticker can pass Economic Proof Ω, valuation and Entry Timing Ω while the actual market order remains unacceptable because the executable ask/bid is materially worse than the displayed last-trade price.

Canonical chain:

`Selection / Thesis -> Entry Timing Ω -> Liquidity / Spread Gate Ω -> Order Type -> Execution -> Post-Trade Slippage Audit`

## Laws

- **FUNDAMENTAL PASS != EXECUTION PASS.**
- **LAST TRADE != EXECUTABLE ASK/BID.**
- **FX COST != SPREAD/SLIPPAGE.** Measure them separately.
- Liquidity / Spread Gate Ω can block an order but cannot rewrite Economic Proof, valuation, thesis quality or Equity Monetization.
- Illiquid LSE/AIM/small-cap/OTC names require explicit price protection when the spread budget is breached.
- A market order is never rescued by conviction.
- A correctly protected limit order may restore execution eligibility without changing the parent thesis.
- Timing/order ticker and quote ticker must match after normalization.
- Pre-trade quote evidence must include a source, timezone-aware timestamp and valid bid/ask snapshot no more than 30 seconds old.
- Invalid, non-finite or incoherent budget overrides fail closed.
- Protected limit placement does not assert an immediate fill when the limit is not marketable at the current bid/ask.
- Post-trade slippage beyond budget is logged as an execution breach and becomes calibration evidence.

## Default execution budget v1.1

Initial conservative calibration, overridable by ticker/venue-specific evidence:

- `maxQuotedSpreadPct = 1.00%`
- `maxReferencePremiumPct = 0.75%`
- `maxExecutionSlippagePct = 0.75%`
- `severeQuotedSpreadPct = 2.00%`
- `maxQuoteAgeSeconds = 30`

These are execution guardrails, not valuation thresholds. They may be tightened after empirical calibration.

## States

- `PASS` — market execution allowed.
- `PASS_LIMIT_PROTECTED` — spread can be wide, but limit placement caps execution inside budget; immediate execution is reported separately.
- `LIMIT_ONLY` — market order blocked; only price-protected limit may proceed.
- `WAIT_SPREAD` — current quote/limit structure is not acceptable.
- `EVIDENCE_REQUIRED` — executable quote evidence is insufficient.
- `EXECUTION_BREACH` — post-trade slippage exceeded the configured budget.

## Entry Timing integration

Canonical wrapper: `Execution-Safe Entry Timing Ω`.

If Entry Timing Ω returns `BUY_NOW`, `BUY_THE_DIP`, `STARTER_NOW_DISLOCATION` or `STARTER_CONFIRMATION`, execution still requires Liquidity / Spread Gate Ω to pass.

If timing passes but liquidity fails:

`Entry Timing PASS + Liquidity FAIL -> WAIT_SPREAD`

The ticker stays in the same fundamental/watchlist state; only current execution is blocked.

If timing and liquidity evidence identify different tickers:

`Ticker mismatch -> EVIDENCE_PENDING / NO EXECUTION`

## ATYM calibration — 21-ago-2026

User-observed Trading 212 calibration:

- displayed ATYM price: approximately `939.5 p`
- resulting average purchase price: approximately `964.5 p`
- execution premium versus displayed price: approximately `+2.66%`

Interpretation:

- This is an execution-price calibration example, not proof that FX caused the gap.
- The screenshot does not by itself prove the exact contemporaneous bid/ask, so ATLAS must not invent it.
- A `+2.66%` post-trade premium exceeds the default `0.75%` execution-slippage budget and is therefore `EXECUTION_BREACH`.
- For similar low-liquidity names, ATLAS must default to a protected LIMIT order or `WAIT_SPREAD`, not a market order.

## Implementation

- `src/atlas/algorithm/liquidity-spread-gate-omega.ts`
- `src/atlas/algorithm/execution-safe-entry-timing-omega.ts`
- `src/atlas/algorithm/liquidity-spread-gate-omega.test.ts`
- `src/atlas/algorithm/atlas-primary-engine-hierarchy.ts`
- `api/execution_safety_gate.py`
- `api/trading212_v2.py`
- `api/main.py`
- `api/test_liquidity_spread_gate.py`
- `.github/workflows/liquidity-spread-gate-ci.yml`

The legacy and v2 Trading 212 MARKET endpoints now require liquidity evidence. The v2 LIMIT endpoint applies the same protected-limit contract. Order audit receipts retain the gate result.

## Final law

**A good company bought through a bad execution is still a bad execution. ATLAS must protect expected return before the order reaches the market.**
