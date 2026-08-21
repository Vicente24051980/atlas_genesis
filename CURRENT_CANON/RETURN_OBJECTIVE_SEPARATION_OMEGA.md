# RETURN OBJECTIVE SEPARATION Ω

**Status:** ACTIVE CANON  
**Effective date:** 2026-08-21  
**Authority:** explicit user correction after Europe return-ranking audit  
**Implementation:** `src/atlas/algorithm/return-objective-separation-omega.ts`

## Purpose

Prevent ATLAS Ω from answering a request for **return** with a ranking that is actually dominated by company quality, moat, Economic Proof, prestige or a multi-factor opportunity composite.

The trigger for this amendment was a European-equity ranking in which ASML/ASMI rose to the top because quality and Economic Proof contaminated what the user had requested as a return ranking.

## Constitutional separation

ATLAS now has four explicitly separate ranking objectives:

1. **HISTORICAL RETURN** — what has already delivered the highest verified market return over a specified past window.
2. **EXPECTED RETURN** — what offers the highest evidence-backed forward expected CAGR from the current price.
3. **BUSINESS QUALITY** — what has the strongest business, moat, economics and durability.
4. **COMPOSITE OPPORTUNITY** — a multi-engine opportunity view combining return, revisions, flows, momentum, specialist engines, risk and business evidence.

These outputs may be displayed side by side, but **must never be silently substituted for one another**.

## Pure-return law

When the user asks for:

- `más retorno`;
- `máximo retorno`;
- `por retorno`;
- `retorno esperado`;
- `retorno futuro`;
- `Expected Return`;
- `CAGR`;

ATLAS routes to **EXPECTED RETURN** unless the request explicitly anchors the metric to a historical period.

When the user explicitly asks for YTD, a named past year, 1Y/3Y/5Y performance, `ha subido`, historical performance or another backward-looking window, ATLAS routes to **HISTORICAL RETURN**.

## EXPECTED RETURN ranking rule

The ordering variable is:

**probability-weighted forward CAGR from current price.**

The calculation uses scenario total returns over a common horizon, converts them into an expected terminal value and annualizes that expected terminal value.

### What may affect ranking order

- current price;
- scenario terminal values / valuation outputs;
- scenario probabilities;
- explicit dilution or per-share effects embedded in the valuation path;
- horizon normalization.

### What may NOT add ranking points

- generic company quality;
- moat score;
- fame;
- market capitalization;
- analyst coverage;
- absolute FCF dollars;
- index membership;
- GREEN continuity;
- Economic Proof score itself;
- Money Rotation score;
- momentum score.

Those variables may be displayed as diagnostics or used by their own engines, but they do not mathematically lift a ticker above another ticker in a pure Expected Return ordering.

## Economic Proof = survival gate, not return bonus

For EXPECTED RETURN candidates:

- **5/5 PASS** → eligible;
- **4/5 PASS** → eligible only if the sole FAIL is non-material and does not invalidate the thesis;
- **3/5 or lower** → excluded from the confirmed Expected Return ranking;
- **material FAIL at 4/5** → excluded;
- **Falsifiers Ω** → absolute veto.

This preserves the user's canonical Economic Proof approval rule while preventing quality from overpowering the requested return objective.

A 4/5 company with 35% evidence-backed expected CAGR ranks above a 5/5 company with 20% expected CAGR, provided neither has a material falsifier.

## HISTORICAL RETURN ranking rule

Historical Return is ordered by the verified total market return for the requested window.

Business quality, Economic Proof, moat and expected future return do not alter that historical ordering.

A separate warning may state that a historical winner is expensive, low quality or unlikely to repeat, but ATLAS may not rewrite the historical leaderboard because of that warning.

## BUSINESS QUALITY ranking rule

Business Quality remains a separate surface for:

- Economic Proof;
- FCF conversion;
- incremental ROIC;
- moat;
- durability;
- balance-sheet quality;
- structural growth quality.

**BEST COMPANY ≠ HIGHEST EXPECTED RETURN.**

## COMPOSITE OPPORTUNITY rule

`SIZE_NEUTRAL_RETURN_RANKING_OMEGA_V1` remains useful as a broad opportunity composite, but its 10-block 0–1000 result is now explicitly classified as **COMPOSITE OPPORTUNITY**, not a pure-return ranking.

It may answer questions such as:

- `mejores oportunidades`;
- `ranking ATLAS completo`;
- `mejor combinación de calidad, retorno, flujo y riesgo`.

It may **not** be presented as the answer to a pure `por retorno` request.

## Required output labeling

Any ranked table must expose its objective in the heading or metadata:

- `HISTORICAL RETURN — <window>`;
- `EXPECTED RETURN — <horizon>`;
- `BUSINESS QUALITY`;
- `COMPOSITE OPPORTUNITY`.

If more than one surface is shown, each column/rank must retain its own label.

## Intent examples

- `Tickers europeos con más retorno` → **EXPECTED RETURN**.
- `Tickers europeos que más han subido en 2026` → **HISTORICAL RETURN**.
- `Cuáles son las mejores empresas europeas` → **BUSINESS QUALITY** unless the rest of the request specifies another objective.
- `Mejores oportunidades europeas ATLAS` → **COMPOSITE OPPORTUNITY**.

## Anti-contamination invariant

**RETURN REQUEST → RETURN METRIC.**  
**QUALITY = FILTER / SEPARATE DIAGNOSTIC, NOT RETURN BONUS.**  
**HISTORICAL ≠ FORWARD.**  
**COMPOSITE ≠ PURE RETURN.**  
**FALSIFIERS Ω REMAINS ABSOLUTE.**
