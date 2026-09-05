# INVESTING OBSERVABLE SURFACE Ω v1.0 — CURRENT CANON

**Effective:** 2026-09-05  
**Status:** CANONICAL / ACTIVE / INPUT LAYER  
**Branch:** `main`  
**Parent:** `CURRENT_CANON/2026-09-03_INVESTING_AI_CLONE_OMEGA_V1_3.md`  
**Engine:** `src/atlas/algorithm/investing-observable-surface-omega.ts`

## Mission

Convert user-supplied Investing.com / InvestingPro / ProPicks screenshots and transcriptions into timestamped, auditable observations usable by the reverse-engineering and calibration stack.

This layer does **not** infer proprietary model weights. It only records observable outputs and maps them to canonical ATLAS/Investing Clone factor families where economically justified.

## Evidence-scope firewall

Every observation must be tagged as one of:

- `GENERAL_INVESTING_SURFACE`
- `PROPICKS_SPECIFIC`
- `UNKNOWN`

General Investing.com UI evidence must never be relabelled as a ProPicks feature without direct product-specific evidence.

## Supported observable signals

The v1.0 schema accepts selection lifecycle, realized and benchmark returns, fair value, fair-value gap, risk label, revenue/EPS estimates, analyst rating/target/coverage initiation, screen score, momentum, 52-week high/low state and premarket move.

## Factor mapping

Observable general-surface features may inform existing factor families only:

- Fair Value / gap -> F5 Valuation
- Revenue/EPS estimates and bounded analyst changes -> F6 Expectations Trajectory
- Momentum -> F7 Relative Momentum
- 52-week state / premarket -> F8 Technical Structure & Liquidity
- Risk label -> F9 diagnostic only unless independently reconstructed from primary risk data

No new factor and no extra score are created.

## Longitudinal ProPicks reconstruction

Only `PROPICKS_SPECIFIC` observations are eligible to reconstruct ProPicks entry/exit/retained histories. Where screenshots expose entry date, entry price, exit date, exit price or realized return, these are stored as explicit trade-history observations with evidence IDs.

Partial or promotional history is never sufficient to claim persistent alpha. Full-history requirements remain benchmark construction, costs, turnover, survivorship/selection treatment, drawdown, regime segmentation and out-of-sample validation.

## Governance laws

1. `GENERAL_INVESTING_SURFACE != PROPICKS_FEATURE_PROOF`.
2. `OBSERVABLE_OUTPUT != PROPRIETARY_WEIGHT_DISCOVERY`.
3. No F1-F10 weight change without walk-forward/out-of-sample evidence.
4. No alpha claim from curated examples or incomplete trade history.
5. All observations require ticker, observation timestamp and evidence ID.
6. Invalid records are excluded from summaries and longitudinal reconstruction.

## Current screenshot batch — 2026-09-05

The supplied screenshots expose examples of:

- energy-strategy historical winners and realized returns;
- fair value / fair-value gap and risk labels;
- analyst coverage initiation and price targets;
- popular factor/screen outputs;
- most-undervalued rankings;
- active movers;
- premarket movers;
- 52-week highs and lows.

These observations expand the reverse-engineering data surface but do not alter `INVESTING AI CLONE Ω v1.3` arithmetic or the `60% ATLAS + 40% Clone` integration rule.
