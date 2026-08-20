# AI Economic Proof × Equity Monetization Ω

**Canonical date:** 2026-08-20  
**Status:** ACTIVE / CANONICAL  
**Implementation:** `src/atlas/algorithm/ai-economic-proof-equity-monetization-omega.ts`

## Purpose

ATLAS Ω must answer two different questions independently:

1. **AI Economic Proof Ω** — Does the business actually capture AI value?
2. **AI Equity Monetization Ω** — Is the stock market currently rewarding that value?

These axes are orthogonal. Price weakness cannot erase verified economics, and strong economics cannot be used to pretend that a stock is already a market winner.

## Economic Proof Ω

The engine scores the business through the canonical AI proof chain:

- **T2 Revenue Capture** — AI-linked demand reaches recognized revenue or contract economics with traceable evidence.
- **T3 Free Cash Flow** — revenue translates into cash economics rather than only accounting growth.
- **T5 AI ROIC** — incremental AI investment demonstrates acceptable return on invested capital.
- **T6 Moat / Persistence** — the capture mechanism is durable rather than a one-quarter shortage or narrative spike.

`CAPEX announced != revenue != FCF != ROIC` remains mandatory.

## Equity Monetization Ω

The market axis is built from:

- verified Price Matrix;
- drawdown from verified Tmax;
- Green Continuity;
- relative strength;
- breadth support;
- flow / positioning;
- response of price to evidence.

The engine explicitly forbids the statement **"least damaged = winner"**.

## Clean winner / CONFIRMED RECEIVER gate

A clean winner requires all of the following:

- Price Matrix verified;
- drawdown from Tmax **>= -5%**;
- Green Continuity **>= 4/5**;
- relative strength **>= 70**;
- flow / positioning **>= 65**;
- price response **>= 65**.

A stock at -8%, -20% or -40% from Tmax may still be economically attractive, but it is not a clean bursatile winner under this gate.

## Canonical divergence

The central phenomenon to detect is:

> **Economic Proof ↑ while Equity Monetization ↓**

This state is classified as `PROOF_UP_MONETIZATION_DOWN`.

Its decision is normally `WATCH_FOR_REMONETIZATION`, not automatic BUY. The opportunity becomes stronger only if valuation / expected return / capital efficiency are favorable and the market axis begins to repair.

## 20-name calibration snapshot — 20 Aug 2026

The verified calibration supplied to the engine contains:

`ETN, NVDA, APH, PWR, HUBB, GEV, VST, CMI, CEG, FIX, PRY.MI, LITE, MU, CAT, COHR, GNRC, VRT, MTZ, POWL, GLW`.

All 20 are below their period Tmax. The median drawdown is **-19.58%**. The least damaged are `ETN, NVDA, APH, PWR`; the most damaged are `GLW, POWL, MTZ, VRT`.

Canonical interpretation:

> **0/20 clean winners and 0/20 CONFIRMED RECEIVERS. There are different degrees of loss, not current price leadership.**

This does **not** imply that 0/20 have AI Economic Proof. It means the equity layer has not yet confirmed a clean winner in the cohort.

## Decision law

- `Economic Proof UP + Equity Monetization UP` → candidate `BUY_REVIEW` if valuation and risk also pass.
- `Economic Proof UP + Equity Monetization DOWN` → `WATCH_FOR_REMONETIZATION`.
- `Economic Proof DOWN + Equity Monetization UP` → `AVOID_CHASING` / red-team review.
- `Economic Proof DOWN + Equity Monetization DOWN` → weak / reject unless a separate recovery engine proves an inflection.

## Integrity rules

1. **Evidence > narrative.**
2. **Price != evidence.**
3. **Trigger != falsifier.**
4. **Relative strength != clean winner.**
5. **Smaller drawdown != capital inflow.**
6. **No UNVERIFIED row may enter the final Price Matrix.**
7. A current lack of CONFIRMED RECEIVERS does not authorize lowering the receiver threshold.
8. The engine may identify a latent opportunity, but cannot place orders.

## Canonical formulation

Do not say:

> "There are relative winners inside the repricing."

Use:

> **"There are different degrees of loss. A company can show Economic Proof ↑ while Equity Monetization ↓, but it is not a CONFIRMED RECEIVER until price continuity, RS, flow and proximity to Tmax confirm it."**
