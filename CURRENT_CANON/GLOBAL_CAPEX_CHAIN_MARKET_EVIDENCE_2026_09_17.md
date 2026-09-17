# Global CAPEX Chain Ω — Market Evidence Addendum — 2026-09-17

**Status:** IMPLEMENTED / CANON-COMPATIBLE ADDENDUM  
**Scope:** `PRICE_PATH / FUNDAMENTAL_PATH`, `CHAIN_BREADTH_CONFIRMATION`, `MEDIA_LAG`, `CAPITAL_COMPETITION_FEEDBACK`  
**Decision authority:** NONE  
**Scoring:** NONE for this addendum

## Constitutional separation

`PRICE_PATH ≠ FUNDAMENTAL_PATH`

Price, breadth, relative strength, media timing and financing conditions may describe market behavior or risk context. They do not become fundamental evidence merely because they are broad or persistent.

Hard invariants:

- `PRICE_IS_NOT_FUNDAMENTAL_EVIDENCE`
- `PRICE_PATH_CANNOT_CONFIRM_FUNDAMENTAL_BOTTOM`
- `PRICE_PATH_AND_FUNDAMENTAL_PATH_HAVE_NO_DECISION_AUTHORITY`
- `MEDIA_LAG_IS_DISCOVERY_ONLY`
- `CAPITAL_COMPETITION_FEEDBACK_IS_RISK_CONTEXT_ONLY`

## PRICE_PATH

Contains:

- individual price path;
- benchmark-relative return;
- chain breadth confirmation;
- persistence after the open;
- media lag;
- capital competition feedback.

`fundamentalAuthority = NONE`.

## FUNDAMENTAL_PATH

Economic transmission remains separate:

`demand → backlog/usage → revenue → margins → FCF → ROIC`

The implementation tracks demand, backlog/usage, revenue, margins, FCF and ROIC independently from price behavior.

`pricePathAuthority = NONE`.

## CHAIN_BREADTH_CONFIRMATION

States:

- `INSUFFICIENT_EVIDENCE`
- `NOT_CONFIRMED`
- `PROVISIONAL_MULTI_LAYER`
- `CONFIRMED_MULTI_LAYER`

### Rules

1. One ticker = one vote. Magnitude is not a weight.
2. Normalize versus the benchmark:
   `EXCESS_RETURN = ticker_return - benchmark_return`.
3. Require participation across multiple independent tickers and multiple causal layers.
4. `IDIOSYNCRATIC` catalysts are reported but cannot vote to confirm chain breadth.
5. Premarket and after-hours breadth can be provisional, but RTH is required for confirmation when `requireRthForConfirmation = true`.
6. A GNRC-like extreme move cannot dominate the detector.
7. Chain breadth can never confirm a fundamental bottom.

### Premarket rule

If structural breadth exists before the regular session:

`CHAIN_BREADTH = PROVISIONAL_MULTI_LAYER`

and:

`RTH_REVALIDATION = REQUIRED`.

Only equivalent participation in regular trading hours may promote the state to:

`CONFIRMED_MULTI_LAYER`.

## Idiosyncratic-catalyst correction

The initial draft declared `catalystScope` but did not use it in confirmation logic. The implemented version closes that gap:

- idiosyncratic names remain visible in `participatingTickers`;
- they are listed in `idiosyncraticTickers`;
- they are excluded from `confirmationTickers` and from layer-confirmation votes.

Therefore multiple unrelated company-specific jumps cannot manufacture a chain signal.

## MEDIA_LAG

States:

- `NOT_ASSESSED`
- `PRICE_LEADS_MEDIA`
- `SYNCHRONOUS`
- `MEDIA_LEADS_PRICE`
- `CONFLICTING`

Authority is `DISCOVERY_ONLY` and `canAlterEconomicProof = false`.

## CAPITAL_COMPETITION_FEEDBACK Ω

This is a risk-context observation attached to `PRICE_PATH`, not an independent engine and not a BUY/SELL signal.

Canonical causal reference:

`AI CAPEX up → external financing/bond supply up → competition for capital up → marginal yield/credit pressure → discount rate up → long-duration multiple pressure`.

Observed fields include:

- external financing pressure;
- bond-supply pressure;
- credit-spread pressure;
- long-end yield pressure;
- self-funding adequacy.

Hard rule: AI financing cannot be assumed to be the sole or primary cause of long-end yields. Fiscal supply, inflation, oil/geopolitics and term premium remain independent drivers.

`canConfirmFundamentalBreak = false`.

## 14:03 premarket calibration

```text
AI_PHYSICAL_CHAIN
PRICE_PATH:
    CHAIN_BREADTH = PROVISIONAL_MULTI_LAYER
    MULTI_LAYER = TRUE
    OUTLIER_DOMINANCE = BLOCKED
    GNRC_IDIOSYNCRATIC_CATALYST = CONTROLLED
    BENCHMARK_NORMALIZATION = REQUIRED
    RTH_REVALIDATION = REQUIRED

FUNDAMENTAL_PATH:
    FUNDAMENTAL_BOTTOM = UNCONFIRMED
    AI_CAPEX_BREAK = NOT_ESTABLISHED

DECISION_AUTHORITY:
    NONE
```

## Implementation

- `src/atlas/algorithm/global-capex-chain-omega.ts`
- `src/atlas/algorithm/global-capex-chain-market-evidence.test.ts`

Implementation commit: `2e913e120031366afa85b104828b94f71b2d9f1d`  
Tests commit: `b3ab088914519ee88314a437f179831b91e54dd8`

## Tests

The addendum is covered for:

1. multi-layer premarket breadth → provisional;
2. equivalent RTH breadth → confirmed;
3. idiosyncratic GNRC-style jump → no chain confirmation;
4. market-wide rally matching the benchmark → no AI-CAPEX-specific confirmation;
5. integrated price/fundamental evidence → decision authority remains NONE.

## Final law

**PRICE ≠ FUNDAMENTAL EVIDENCE.**

Chain breadth can describe how broadly the market is repricing an economic chain. It cannot, by itself, demonstrate a fundamental bottom, an AI-CAPEX break, or economic value creation.
