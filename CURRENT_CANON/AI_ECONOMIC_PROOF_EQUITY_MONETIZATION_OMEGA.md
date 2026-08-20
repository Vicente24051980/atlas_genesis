# AI Economic Proof × Equity Monetization Ω

**Canonical date:** 2026-08-20  
**Status:** ACTIVE / CANONICAL  
**Implementation:** `src/atlas/algorithm/ai-economic-proof-equity-monetization-omega.ts`

## Purpose

ATLAS Ω must answer two different questions independently:

1. **AI Economic Proof Ω** — Does the business actually capture AI value?
2. **AI Equity Monetization Ω** — Is the stock market currently rewarding that value?

These axes are orthogonal. Price weakness cannot erase verified economics, and strong economics cannot be used to pretend that a stock is already a market winner.

## Terminology law — WINNER is an equity word

Within this module, **winner** is reserved for a stock that passes the market confirmation gate. A company with strong T2/T3/T5/T6 but weak price action is an **economic capturer / monetizer**, not a winner.

Therefore:

- recognized AI revenue does not make a stock a winner;
- backlog, take-or-pay agreements, capacity expansion or pricing power do not make a stock a winner;
- positive FCF does not make a stock a winner;
- being the least damaged stock does not make a stock a winner;
- only verified Equity Monetization can create a `CONFIRMED_RECEIVER`.

This terminology prevents the phrase **"economic winner"** from obscuring the actual user question: **who is making money for the shareholder in the market now?**

## Economic Proof Ω

The engine scores the business through the canonical AI proof chain:

- **T2 Revenue Capture** — AI-linked demand reaches recognized revenue or contract economics with traceable evidence.
- **T3 Free Cash Flow** — revenue translates into cash economics rather than only accounting growth.
- **T5 AI ROIC** — incremental AI investment demonstrates acceptable return on invested capital.
- **T6 Moat / Persistence** — the capture mechanism is durable rather than a one-quarter shortage or narrative spike.

`CAPEX announced != revenue != FCF != ROIC` remains mandatory.

Economic Proof can identify **capturers**, **monetizers**, **high-quality economics** or **durable tollbooths**. It does not assign the word winner.

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

A stock at -8%, -20% or -40% from Tmax may have excellent economics, but it is **not winning for the shareholder now** under this gate.

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

> **0/20 winners, 0/20 clean winners and 0/20 CONFIRMED RECEIVERS. There are different degrees of loss, not current leadership.**

This does **not** imply that 0/20 have AI Economic Proof. It means that, under the shareholder/equity definition of winning, nobody in the verified cohort is winning now.

## No preselected T2 winners

The existence of contracts, backlog or strong segment growth in names such as `MU`, `GLW` or `GNRC` may raise audit priority, but it does **not** authorize a privileged T2 starting set or a provisional winner label.

T2 must be run across the full applicable cohort under the same evidence standard. The output may say `DIRECT`, `SEGMENT_PROXY`, `ATTRIBUTED_GROWTH` or `NOT_SEPARATELY_DISCLOSED`; none of these labels implies a market winner.

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
6. **Economic capturer != equity winner.**
7. **No UNVERIFIED row may enter the final Price Matrix.**
8. A current lack of CONFIRMED RECEIVERS does not authorize lowering the receiver threshold.
9. The engine may identify a latent opportunity, but cannot place orders.

## Canonical formulation

Do not say:

> "There are relative winners inside the repricing."

Do not say:

> "MU / GLW / GNRC are winners because they monetize AI."

Use:

> **"There are different degrees of loss. Some companies may be capturing AI economics, but 0/20 are winning for the shareholder in the verified cohort. A company becomes a CONFIRMED RECEIVER only when price continuity, RS, flow, price response and proximity to Tmax confirm it."**
