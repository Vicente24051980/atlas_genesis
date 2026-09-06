# REVERSE BURRY Ω — FALSIFICATION MODULE

**Date:** 2026-09-06  
**Status:** ACTIVE EXPERIMENT / PREREGISTERED  
**Parent:** `CURRENT_CANON/TRADER_INTELLIGENCE_OMEGA.md`  
**Direct portfolio authority:** `NONE`

## Mission
Test whether public Michael Burry signals are more useful when followed, reversed, or ignored in favor of identity-blind ATLAS analysis.

REVERSE BURRY Ω is not an instruction to mechanically trade against Michael Burry.

## Core law
`BURRY_WRONG_ON_ONE_TRADE != BURRY_IS_A_CONTRARY_INDICATOR`.

Likewise:
`BURRY_FAMOUS_SUCCESS != CURRENT_SIGNAL_ALPHA`.

Both propositions require complete point-in-time testing.

## Hypotheses
- `H0`: Burry public signals contain no persistent implementable post-publication alpha.
- `H1_FOLLOW`: following Burry improves risk-adjusted returns.
- `H1_REVERSE`: taking the opposite side improves risk-adjusted returns.
- `H1_ATLAS_BLIND`: removing Burry's identity and using ATLAS economic gates dominates both mechanical strategies.

## Current verified regulatory anchor
Scion Asset Management 13F-HR:
- period of report: `2025-09-30`;
- filing/acceptance timestamp: `2025-11-03 16:33:10 ET`;
- SEC accession: `0001649339-25-000007`;
- eight information-table entries.

The information table disclosed:
- LULU — 100,000 common shares; reported value $17.793m;
- MOH — 125,000 common shares; reported value $23.920m;
- SLM — 480,054 common shares; reported value $13.288m;
- NVDA — put exposure referencing 1,000,000 shares; reported underlying value $186.580m;
- PLTR — put exposure referencing 5,000,000 shares; reported underlying value $912.100m;
- PFE — call exposure referencing 6,000,000 shares; reported underlying value $152.880m;
- HAL — call exposure referencing 2,500,000 shares; reported underlying value $61.500m;
- Bruker preferred — 48,334 shares; reported value $13.137m.

### Critical interpretation
The option values above are 13F-reported underlying values, **not option premiums**. Strike, expiry and premium are not supplied by the information table. Therefore:
- directional-underlying tests are permitted;
- exact option-return replication is not permitted from this filing alone.

## LULU — two distinct public events
### Event RB-001A — regulatory long disclosure
- trader: Michael Burry / Scion;
- security: LULU;
- position date: 2025-09-30;
- public T0: 2025-11-03 16:33:10 ET;
- event: `LONG_DISCLOSED`;
- evidence: SEC 13F;
- FOLLOW: long LULU from next implementable execution point;
- REVERSE: short/avoid LULU using the same T0 convention;
- ATLAS-BLIND: analyze LULU without Burry identity.

### Event RB-001B — persistence / largest-position self-disclosure
On 2026-09-03, Burry wrote publicly on his Substack that Lululemon was the "trickster" in his portfolio and that it was his largest position.

This is **not automatically a new purchase event**. It is a new public persistence/relative-size statement.

Required coding:
- event: `PERSIST_LONG_SELF_DISCLOSURE`;
- exact current shares: `UNKNOWN`;
- exact current portfolio weight: `UNKNOWN`;
- cost basis: `UNKNOWN`;
- no reconstructed "60% below entry" unless independently demonstrated.

The following day, Reuters reported an ~18% fall after weak results, with the stock at its lowest level in eight years. That outcome is a subsequent event, not information that may be used to define RB-001B ex ante.

## NVDA — RB-002
- source: 2025-11-03 Scion 13F;
- position date: 2025-09-30;
- instrument: put;
- reported underlying shares: 1,000,000;
- option payoff state: `OPTION_NOTIONAL_ONLY / OPTION_UNOBSERVABLE_PAYOFF`;
- FOLLOW directional proxy: bearish NVDA;
- REVERSE directional proxy: long NVDA;
- exact option P&L: prohibited absent strike/expiry/premium.

### ATLAS intersection
NVDA is in the current ATLAS experimental 37. Burry's bearish disclosure changes **zero** portfolio score and **zero** sizing. It creates a divergence observation only.

## PLTR — RB-003
Same protocol as NVDA:
- Burry: put/bearish disclosure;
- reverse: long PLTR directional proxy;
- exact option P&L: unavailable from 13F alone;
- ATLAS-BLIND required before any conclusion.

## MOH / SLM / PFE / HAL
All enter the event register as historical/forward-test candidates using the 2025-11-03 T0.

No event receives a verdict from reputation or from one subsequent price move.

## Event-level measurement
For common-stock directional signals:
- next-open / next-close implementability variant;
- 1D;
- 5D;
- 1M;
- 3M;
- 6M;
- 12M;
- 24M for explicit turnaround/value theses.

Measure:
- absolute return;
- S&P 500 excess return;
- sector excess return;
- MAE/MFE;
- max drawdown;
- volatility;
- hit rate;
- estimated costs for short implementation where relevant.

## Reverse-specific safeguards
1. No celebrating a reverse "win" before the predeclared horizon.
2. No converting a Burry long into a short when borrow is unavailable or uneconomic; classify `REVERSE_NOT_IMPLEMENTABLE`.
3. No treating puts as equivalent to naked short stock for payoff analysis.
4. No counting reaffirmations as independent signals.
5. No backfilling Burry's entry price from quarter-end price.
6. No using post-result fundamentals to claim the reverse thesis was known at T0.
7. No cherry-picking LULU while ignoring Burry successes.

## Validation state
Initial: `T1_SAMPLE_INCOMPLETE`.

REVERSE BURRY Ω cannot be promoted until a materially complete, date-bounded public-signal cohort is reconstructed.

## Promotion criteria
`T4_PERSISTENT_OUT_OF_SAMPLE` for REVERSE requires:
- complete or defensibly sampled Burry event cohort;
- predeclared event types;
- point-in-time execution;
- positive median excess return after costs;
- no dependence on one or two spectacular mistakes;
- robustness across sectors/regimes;
- holdout-period survival.

Otherwise the correct conclusion is `NO REVERSE EDGE` or `REGIME_DEPENDENT`.

## Primary sources
- SEC filing index: https://www.sec.gov/Archives/edgar/data/1649339/000164933925000007/0001649339-25-000007-index.html
- SEC information table: https://www.sec.gov/Archives/edgar/data/1649339/000164933925000007/xslForm13F_X02/infotable.xml
- Burry Substack 2026-09-03: https://michaeljburry.substack.com/p/short-thoughts-cassandra-in-flames
- Reuters LULU post-earnings report 2026-09-04: https://www.reuters.com/business/retail-consumer/lululemon-forecast-cut-hits-shares-underscores-challenge-next-ceo-2026-09-04/

## Canonical conclusion today
LULU is evidence that Burry can suffer a severe adverse move. It is **not yet evidence that inverse-Burry is an exploitable factor**.

NVDA provides a clean live divergence case for the ATLAS portfolio, but Burry identity has zero score authority on either side.
