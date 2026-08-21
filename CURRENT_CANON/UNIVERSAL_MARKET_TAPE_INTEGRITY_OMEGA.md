# UNIVERSAL MARKET TAPE INTEGRITY Ω

**Status:** ACTIVE CANON  
**Effective date:** 2026-08-21  
**Implementation:** `src/atlas/algorithm/universal-market-tape-integrity-omega.ts`  
**Trigger:** audit found that Motor 13 had a strong P0/P3 gate, but other market-data consumers could still accept stale or contradictory price/return observations.

## Purpose

Create one upstream, fail-closed gate for every ATLAS consumer of market tape. No downstream engine may independently self-certify price, historical return, relative strength, momentum, drawdown, GREEN continuity, price response or Equity Monetization.

## Constitutional invariant

`RAW MARKET OBSERVATIONS -> UNIVERSAL MARKET TAPE INTEGRITY Ω -> VERIFIED MARKET TAPE -> DOWNSTREAM ENGINES`

No bypass is canonical.

## Covered consumers

At minimum the gate governs:

- current price / P0;
- Historical Return windows;
- Expected Return P0;
- AI Equity Monetization;
- Price Matrix;
- GREEN / continuity inputs derived from market prices;
- relative strength;
- momentum;
- drawdown / Tmax proximity;
- price response to news;
- sector / subsector tape inputs used by rotation engines;
- market heatmaps and rankings when they use price or return data.

A fundamental engine may remain valid when market tape fails if its inputs are genuinely independent of price. Market-tape failure must not contaminate Economic Proof, but it must block any market-dependent score or conclusion.

## Identity gate

Every canonical observation must bind exactly to:

1. ticker;
2. primary listing;
3. currency;
4. quotation unit;
5. observation date;
6. observation type (`OFFICIAL_CLOSE` or `INTRADAY_SNAPSHOT`);
7. timestamp for intraday observations;
8. source/evidence ID;
9. capture timestamp;
10. corporate-action reconciliation status.

Ticker aliases, ADRs, local shares, GBp/GBP, CAD/USD or pre/post split scales may never be silently merged.

## Freshness before prestige

During premarket, regular session or after-hours, stale data cannot defeat a fresher coherent observation merely because its provider has a higher nominal source rank.

Default open-session freshness threshold: **20 minutes** unless the caller explicitly sets a stricter threshold.

For a completed session, an `OFFICIAL_CLOSE` must bind to the requested market date. An earlier close is not the current session.

## Source hierarchy

Canonical source priority after freshness and identity gates:

1. exchange official;
2. broker live;
3. regulated feed;
4. real-time market-data vendor;
5. timestamped user capture;
6. direct web aggregator with explicit observation metadata.

`SECONDARY_RESEARCH` and `SEARCH_SNIPPET` may corroborate context but can never be the sole canonical market-tape source.

A user capture is admissible because it is direct observed evidence, but only when ticker/listing, quotation, timestamp and corporate-action status are explicit or reconciled.

## Conflict gate

Two fresh, coherent canonical observations that materially disagree do not trigger source cherry-picking.

They trigger:

`FAIL_CONFLICT -> NO CANONICAL MARKET OUTPUT`

Default tolerances:

- price conflict: **0.75%**;
- historical-return conflict: **1.0 percentage point**.

The caller may set tighter tolerances. A looser tolerance requires an explicit reason and must never be used to conceal a known contradiction.

## Return-window integrity

Historical windows are separate observations:

`1D != 1W != 1M != 3M != 6M != YTD != 1Y != 3Y != 5Y`

No window may be substituted for another.

`PRICE_RETURN != TOTAL_RETURN`

A price-return figure cannot answer a total-return request without an explicit dividend/distribution bridge. A provider-supplied return and a calculated return must expose provenance; a calculated return fails if its underlying prices are not verified.

## Coherence gate

Price and return-window observations used together must be temporally coherent. Default intraday coherence window: **5 minutes**.

This prevents a current price from being combined with a stale 1M/3M/1Y snapshot from another moment or another listing.

## Downstream rebinding

A PASS result exposes its selected ticker, listing, currency and quotation unit. Every downstream consumer must re-bind that identity to its own input before scoring.

A PASS result for ticker A can never certify ticker B.

## Fail-closed states

- `FAIL_MISSING`
- `FAIL_STALE`
- `FAIL_CONFLICT`
- `FAIL_IDENTITY`
- `FAIL_CORPORATE_ACTION`

Any of these means:

`MARKET-DEPENDENT SCORE = UNVERIFIED / BLOCKED`

No placeholder, inherited number, remembered number, search snippet, prior-session value or convenient alternative source may fill the gap silently.

## Integration with Motor 13

Motor 13 still applies its stricter target-side integrity law:

`P0 FAIL -> P0 DELETE + P3 DELETE + CAGR DELETE + RANK DELETE`

The new ordering is:

`UNIVERSAL MARKET TAPE PASS -> VERIFIED P0 -> CONTEMPORARY FUNDAMENTALS -> BEAR/BASE/BULL P3 -> EXPECTED TERMINAL VALUE -> CAGR -> FALSIFIER GATE -> RANK`

The old local `priceMatrixVerified=true` style flag can no longer self-certify data.

## Integration with AI Equity Monetization

`priceMatrixVerified=true` is necessary only as a compatibility flag. It is not sufficient.

Equity Monetization requires:

`UNIVERSAL MARKET TAPE PASS + SAME TICKER + SAME AS-OF DATE`

If the tape fails, Economic Proof may remain valid, but Equity Monetization and Final Opportunity become unverified.

## Regression fixtures — 21 Aug 2026

The implementation contains regression tests based on the observed SPGI and ACN discrepancy that triggered this hardening:

- SPGI capture: current ~$430.05; 1D -0.50%; 1W +1.74%; 1M -0.29%; 3M +3.44%; 1Y -22.72%.
- ACN capture: current ~$183.33; 1D +1.09%; 1W +2.71%; 1M +30.15%; 3M +3.07%.

These are regression fixtures, not permanent market facts. Their purpose is to ensure windows cannot be reversed, mixed or silently replaced.

## Invariants

**FRESHNESS BEFORE PRESTIGE.**  
**IDENTITY BEFORE SCORE.**  
**CONFLICT -> FAIL CLOSED.**  
**SEARCH SNIPPET != CANONICAL TAPE.**  
**1M != 3M.**  
**PRICE RETURN != TOTAL RETURN.**  
**PASS FOR A != PASS FOR B.**  
**MARKET DATA FAILURE DOES NOT ERASE FUNDAMENTAL PROOF.**  
**NO MARKET-DEPENDENT ENGINE MAY SELF-CERTIFY ITS OWN INPUT DATA.**
