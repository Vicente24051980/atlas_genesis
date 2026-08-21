# GREEN FIRST ENGINE + FULL AUDIT Ω

**Status:** ACTIVE · CANONICAL OVERRIDE  
**Effective:** 2026-08-21  
**Scope:** all listed-equity ticker analysis in ATLAS Ω

## User directive

GREEN CONTINUITY Ω is the **first analytical motor** for every listed ticker, after evidence/source/quantitative/temporal integrity and ticker identity normalization.

This ordering is mandatory.

It does **not** mean that a ticker stops being audited when it is below GREEN 4/5.

## Canonical sequence

`INPUT → EVIDENCE/SOURCE/QUANT/TEMPORAL INTEGRITY → GLOBAL DISCOVERY/IDENTITY → GREEN CONTINUITY Ω → GREEN PULSE/BREADTH/RELATIVE GREEN → ALL OTHER APPLICABLE ATLAS ENGINES → CONTRADICTIONS → EXPECTED RETURN → FALSIFIERS Ω → INVESTMENT COMMITTEE Ω → ACTION`

## GREEN continuity vector

GREEN CONTINUITY Ω uses exactly five windows:

`1W → 1M → 3M → 1Y → TOTAL/MAX`

`1D` is **not** one of the five continuity windows. It belongs to GREEN Pulse / short-horizon market behaviour and runs immediately after GREEN CONTINUITY Ω.

GREEN 5/5 requires:

`1W > 0 AND 1M > 0 AND 3M > 0 AND 1Y > 0 AND TOTAL/MAX > 0`

## GREEN interpretation

- `GREEN 5/5` = strongest continuity class.
- `GREEN 4/5` = strong continuity; failed horizon must be explicit.
- `GREEN 3/5` = **opportunity-eligible with caution**. It may reach BUY/HOLD/Watch ranking if the remaining ATLAS engines are strong and no material falsifier invalidates the thesis.
- `GREEN 0–2/5` = poor continuity; **full audit continues** and exceptional opportunities may still surface, but GREEN contributes negative evidence.
- `QUARANTINE / INSUFFICIENT_HISTORY` = data-quality state; other engines continue where their own evidence is sufficient.

**5/5, 4/5 and 3/5 are all valid GREEN classes for opportunity discovery.** Their difference is confidence in price continuity, not permission or prohibition to invest.

ATLAS must never discard a ticker solely because it is GREEN 3/5 when Economic Proof, Quality, Growth, CAPEX Productivity, Moat, Valuation/Expected Return, Money/Institutional Rotation, Risk and specialized engines collectively produce a strong evidence packet.

GREEN is an independent market-behaviour signal. It cannot overwrite stronger verified fundamental evidence, and stronger fundamentals cannot rewrite the observed GREEN vector.

## Calibration 2026-08-21 — synchronized provenance gate

A GREEN classification is forbidden unless all five windows carry a complete provenance packet and use the **same synchronized regular-market end date**.

Every horizon must record ticker/canonical identifier, exchange, currency, start date, end date, regular-market close, corporate-action adjustment policy, source, capturedAt/asOf and calculation method.

The engine must receive an explicit `expectedMarketCut`. If any window is stale, has a different end date, lacks provenance, or cannot prove alignment to that expected regular-session cut, the result is `QUARANTINE` and is excluded from GREEN ranking/promotion.

A generic performance table whose temporal cut cannot be reconciled with the requested session **must never be substituted** for the current GREEN vector. Screenshots or first-party/market-data observations may be used as evidence only for the windows they actually show; they do not silently verify unobserved horizons.

Calibration case: ETN on 2026-08-21 exposed a stale/misaligned external-performance substitution. The observed user evidence established at least `1W < 0`; therefore a 5/5 classification was impossible. The correct system response, absent verified 1M/3M/1Y/TOTAL data on the same cut, is `QUARANTINE`, not an inferred 5/5.

Implementation authority: `src/atlas/algorithm/green-continuity-omega.ts` v1.4.

## Provider Quorum Ω — mandatory verification layer

GREEN is verified from **3 independent providers minimum**, using a preferred four-provider pool:

1. TradingView
2. Yahoo Finance historical market data
3. Barchart
4. Investing.com

ATLAS does **not** trust each provider's displayed `Performance %` label as the canonical return because vendors may use different formulas. Instead, each eligible provider must supply the raw regular-session historical closes needed for the requested horizon and ATLAS recomputes the return under one normalized policy.

Canonical price policy for GREEN: **split-adjusted, dividend-unadjusted regular-market close**. The purpose is to measure price continuity, not total shareholder return.

Per horizon, VERIFIED requires all of the following:

- at least 3 eligible independent providers;
- identical ticker identity / exchange mapping;
- exact same `expectedMarketCut`;
- same corporate-action normalization;
- all providers agree on the sign (>0 or ≤0);
- cross-provider numerical dispersion ≤ `0.25 percentage points` after normalization.

If even one eligible provider disagrees on the sign, or the numerical dispersion exceeds tolerance, that horizon is not VERIFIED and the full GREEN vector remains `QUARANTINE` until reconciled. A simple 2-vs-1 majority is not enough when the minority source implies the opposite GREEN state.

`Trading 212` may be used as an **additional broker-side cross-check** when the user supplies visible T212 evidence. It is not assumed to be programmatically accessible from ATLAS and is not required to reach the 3-provider quorum.

Implementation authority: `src/atlas/algorithm/green-provider-quorum-omega.ts` v1.0.

## Non-negotiable laws

1. **GREEN RUNS FIRST.**
2. **GREEN DOES NOT STOP THE AUDIT.**
3. **GREEN 5/5, 4/5 AND 3/5 ARE OPPORTUNITY-ELIGIBLE CLASSES.**
4. **GREEN 3/5 REQUIRES STRONGER CONFIRMATION FROM THE OTHER ENGINES; IT IS NOT A REJECTION.**
5. **GREEN 0–2/5 STILL CONTINUES THROUGH ALL APPLICABLE ENGINES.**
6. **PRICE CONTINUITY ≠ FUNDAMENTAL EVIDENCE.**
7. **GREEN ≠ VERIFIED CAPITAL FLOW.**
8. **GREEN ≠ AUTOMATIC BUY/SELL.**
9. **Falsifiers Ω retains the independent absolute veto for confirmed material structural falsifiers.**
10. **Final recommendation belongs to Investment Committee Ω after the complete evidence packet.**
11. **NO VERIFIED SYNCHRONIZED CUT = NO GREEN SCORE; QUARANTINE.**
12. **NO 3-PROVIDER QUORUM PER HORIZON = NO VERIFIED GREEN.**

## Supersession

This 2026-08-21 override supersedes any earlier language that:

- placed GREEN after Principal Ω, Successor Detection Ω, Quality or another analytical motor;
- terminated or rejected a ticker solely because GREEN was below 4/5;
- excluded GREEN 3/5 from the opportunity set despite strong cross-engine evidence;
- allowed another engine to rewrite the observed GREEN vector;
- treated GREEN itself as fundamental proof or real institutional flow;
- allowed stale or temporally unreconciled external performance data to generate a GREEN classification;
- allowed a single data provider to certify GREEN.

Historical documents remain preserved as historical records, but this file controls current sequencing where conflict exists.
