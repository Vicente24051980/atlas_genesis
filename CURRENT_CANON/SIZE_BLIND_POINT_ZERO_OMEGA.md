# SIZE-BLIND POINT ZERO Ω v1.0

**Status:** ACTIVE / UNIVERSAL DISCOVERY MODULE  
**Effective date:** 2026-09-04  
**Authority:** compatible with ATLAS Ω ENTERPRISE, Principal Ω, Investing AI Clone Ω, CAPEX Hunters Ω and P0 Adjusted Ω. It does not override Hard Gates, Replacement Firewall, valuation discipline, portfolio construction or broker safety.

## Mission

Turn the ATLAS rule **“every company starts from zero”** into an executable cross-sector discovery engine.

The module searches for companies where:

**fundamental acceleration + improving per-share economics + valuation runway + durable catalyst + financial quality**

coexist before the market fully capitalizes the future trajectory.

The engine must work identically for a $3B company and a $3T company when their economic inputs are identical.

> **NO MEGACAP BIAS. NO SMALL-CAP BIAS. SIZE IS METADATA, NOT QUALITY.**

## Why this module exists

A mature leadership regime can broaden into smaller and mid-sized companies when earnings acceleration migrates outside the largest index constituents. That regime can create discovery opportunities, but “small cap” is never itself an investment thesis.

A company qualifies because its economics improve faster than expectations, not because it belongs to a capitalization bucket.

Likewise, a megacap is not penalized for size. If FCF/share or EPS/share outruns the stock price and the opportunity remains economically attractive, the company can still rank highly.

## Point-Zero modes

- **P0_IPO:** newly public company where the public market has not fully observed the economic trajectory.
- **P0_RESET:** older company undergoing a genuine economic/technology/business-model reset.
- **P0_SPIN:** newly independent asset whose economics were previously hidden inside a parent.
- **P0_EARLY_PUBLIC:** already public company entering a structural acceleration phase.
- **MATURE:** mature company retained as a control; maturity itself is not a penalty.

## Market-cap buckets

ATLAS records market cap for implementation, liquidity and research routing only:

- `XS_LT_2B`
- `S_2_10B`
- `M_10_50B`
- `L_50_200B`
- `XL_GE_200B`

**Market-cap score contribution = 0.**

A smaller company may receive the discovery label `SMALL_MID_SPRINTER`, but the label cannot alter the numeric opportunity score.

---

# BREADTH ROTATION Ω v1.0

## Mission

Measure whether market leadership is genuinely broadening from large/mega caps toward smaller and mid-sized companies because of earnings, valuation, revisions and relative strength — not merely because of a short-covering or low-quality speculative bounce.

## Inputs

1. Small/mid forward EPS growth.
2. Large/mega forward EPS growth.
3. Small/mid forward P/E.
4. Large/mega forward P/E.
5. Small/mid 6-month relative strength vs large/mega universe.
6. Positive earnings-revision breadth.

## Formula

`EPS_GROWTH_SPREAD_PP = SMALL_MID_FORWARD_EPS_GROWTH - LARGE_MEGA_FORWARD_EPS_GROWTH`

Calibration:

`EPS_GROWTH_SPREAD_SCORE = linear(-10pp → 0, +30pp → 100)`

`VALUATION_DISCOUNT_PCT = (LARGE_MEGA_PE - SMALL_MID_PE) / LARGE_MEGA_PE`

`VALUATION_DISCOUNT_SCORE = linear(0% → 0, 35% → 100)`

`RELATIVE_STRENGTH_SCORE = linear(-10pp → 0, +20pp → 100)`

`REVISION_BREADTH_SCORE = POSITIVE_REVISION_BREADTH_PCT`

Master formula:

`BREADTH_ROTATION_SCORE =`

- 35% EPS growth spread
- 25% valuation discount
- 20% six-month relative strength
- 20% positive revision breadth

States:

- **75–100 BROADENING_CONFIRMED**
- **60–74.9 BROADENING**
- **40–59.9 MIXED**
- **<40 NARROWING**

### Constitutional limit

Breadth contributes only **5%** to a company’s Universal P0 score.

Therefore:

> **A strong small-cap regime cannot rescue a weak company.**

---

# UNIVERSAL P0 FUNDAMENTAL INFLECTION Ω

The fundamental inflection subscore is:

`FUNDAMENTAL_INFLECTION =`

- 25% revenue acceleration
- 35% EPS/FCF acceleration
- 20% margin inflection
- 20% per-share economic quality

EPS/FCF receives the largest weight because ATLAS cares about shareholder economics, not only reported top-line growth.

## Per-share law

When comparing stock-price growth with fundamentals, use the strongest available per-share metric:

1. FCF/share
2. EPS/share
3. gross profit/share
4. revenue/share

Aggregate revenue growth cannot offset material dilution.

---

# EXPECTATIONS DEBT Ω — UNIVERSAL APPLICATION

This module reuses the same logic established in CAPEX Asymmetry / P0 Adjusted Ω.

## Excess Rerating

`EXCESS_RERATING_PP = PRICE_CAGR_3Y - FUNDAMENTAL_PER_SHARE_CAGR_3Y`

`EXCESS_RERATING_DEBT = clamp(max(0, EXCESS_RERATING_PP) / 40pp * 100)`

If per-share fundamentals grow as fast as or faster than the stock price, Excess Rerating Debt is **0**.

Therefore:

> **A stock is never penalized merely because it rose a lot.**

## Multiple Expansion Debt

Using exactly the same valuation metric at both dates:

`MULTIPLE_EXPANSION_DEBT = clamp(log2(CURRENT_MULTIPLE / START_MULTIPLE) * 100)`

when the multiple expanded; otherwise 0.

A doubling of a comparable multiple maps to 100 debt.

## Expectations Debt

When comparable multiple history exists:

`EXPECTATIONS_DEBT = 65% EXCESS_RERATING_DEBT + 35% MULTIPLE_EXPANSION_DEBT`

Without comparable multiple history:

`EXPECTATIONS_DEBT = EXCESS_RERATING_DEBT`

## Valuation Opportunity

Absolute valuation and expectations debt remain separate because low valuation can be a value trap.

`VALUATION_OPPORTUNITY =`

- 60% `(100 - EXPECTATIONS_DEBT)`
- 40% `ABSOLUTE_VALUATION_SCORE`

---

# SIZE-BLIND P0 MASTER FORMULA

## Core Opportunity

`CORE_OPPORTUNITY =`

- **30% Fundamental Inflection**
- **20% Valuation Opportunity**
- **12% Capital Efficiency**
- **10% Balance-Sheet Quality**
- **8% Catalyst Durability**
- **7% Earnings Revisions**
- **5% Breadth Regime**
- **3% Relative Momentum**
- **5% Liquidity Quality**
- **0% Market Cap**

## Risk Penalty

`RISK_PENALTY =`

- 12% Value-Trap Risk
- 8% Drawdown Risk
- 8% Dilution Risk

## Final score

`SIZE_BLIND_P0_SCORE = clamp(CORE_OPPORTUNITY - RISK_PENALTY)`

---

# FAIL-CLOSED CAPS

A mathematically attractive cheap stock must not game the engine.

- Value-Trap Risk >=80 → score capped at 64.9 and `VALUE_TRAP_RISK`.
- Balance-Sheet Quality <30 → score capped at 59.9 and `FUNDING_RISK`.
- Liquidity Quality <25 → score capped at 59.9 and `ILLIQUID_RISK`.
- Dilution Risk >=80 → score capped at 69.9.
- Expectations Debt >=85 → score capped at 69.9.

These caps are deliberately asymmetric: severe fragility can veto elite status, while strong market breadth cannot create elite status.

---

# STATES

After evidence and hard-risk checks:

- **>=82 P0_ELITE**, with Expectations Debt <=45.
- **>=72 P0_STRONG**.
- **>=62 P1_EARLY**.
- **>=52 WATCH**.
- **<52 NO_EDGE**.

Separate failure states:

- `VALUE_TRAP_RISK`
- `FUNDING_RISK`
- `ILLIQUID_RISK`
- `EVIDENCE_PENDING`

## Evidence Gate

At least **four traceable evidence records** are required for a confirmed ranking.

External newsletters, AI-generated lists, social posts and model outputs are discovery inputs only. They do not become canonical facts without evidence validation.

---

# SPRINTER LABEL

A company can receive `SMALL_MID_SPRINTER` when:

- market cap < $50B;
- Size-Blind P0 Score >=72;
- Breadth Regime Score >=60.

This is a routing label for research priority only.

The same company with identical economics at a mega-cap market value receives exactly the same numeric score and may be labeled `SIZE_BLIND_P0` instead.

> **LABEL ≠ SCORE. SIZE ≠ QUALITY.**

---

# Anti-error laws

- **SMALL CAP ≠ CHEAP.**
- **MEGACAP ≠ EXPENSIVE.**
- **LOW P/E ≠ VALUE.**
- **HIGH P/E ≠ OVERVALUED without expectations/fundamental analysis.**
- **PRICE RUN-UP ≠ EXPECTATIONS DEBT if per-share economics caught up.**
- **REVENUE GROWTH ≠ SHAREHOLDER GROWTH if dilution absorbs it.**
- **ONE EARNINGS BEAT ≠ STRUCTURAL INFLECTION.**
- **ONE-OFF GEOPOLITICAL WINDFALL ≠ DURABLE CATALYST.**
- **BREADTH RALLY ≠ COMPANY QUALITY.**
- **DISCOVERY WINNER ≠ AUTOMATIC BUY.**

---

# Falsifiers

The P0 thesis must be downgraded when any of these become true:

- fundamental acceleration reverses before cash flow confirms;
- EPS/FCF acceleration is accounting-driven or one-off;
- revenue does not translate to per-share economics;
- cheap valuation is explained by structural deterioration;
- balance-sheet/refinancing risk increases materially;
- dilution offsets operating growth;
- catalyst proves temporary or mean-reverting;
- earnings revisions weaken while breadth leadership reverses;
- stock price outruns per-share fundamentals and comparable multiples expand materially.

---

# Mandatory output per ticker

`Ticker | P0 Mode | Market-Cap Bucket | Fundamental Inflection | Price CAGR 3Y | Fundamental/share CAGR 3Y | Excess Rerating | Multiple Debt | Expectations Debt | Valuation Opportunity | Capital Efficiency | Balance | Catalyst | Revisions | Breadth | Momentum | Liquidity | Value-Trap Risk | Drawdown Risk | Dilution Risk | Size-Blind P0 Score | Evidence Gate | State | Action | Discovery Tag`

---

# Integration

Implementation:

- `src/atlas/algorithm/size-blind-point-zero-omega.ts`

Tests:

- `src/atlas/algorithm/size-blind-point-zero-omega.test.ts`

Related engines:

- `CAPEX_ASYMMETRY_OMEGA_V1`
- `CAPEX_HUNTERS_OMEGA_V1`
- `CAPEX_CAPTURE_ELASTICITY_OMEGA_V1`
- Principal Ω / Replacement Firewall / Falsifiers Ω retain independent authority.

## Final law

> **Do not ask whether the next winner is a small cap or a megacap. Ask where per-share economics are entering a new acceleration phase before expectations have fully caught up.**
