# ATLAS Ω — Earnings Learning Ω v2.2

**State:** CANDIDATE · DIAGNOSTIC_ONLY  
**Issue:** #93

## Purpose
One event-learning surface replaces duplicate scoring across Earnings Flow Confirmation, Expectations Gap / Market Fragility and overlapping event-reaction logic.

## Four independent layers
1. `PRE_EVENT_EXPECTATION_BURDEN`
2. `FUNDAMENTAL_SURPRISE`
3. `POST_EVENT_PRICE_TRUTH`
4. `SECOND_ORDER_READ_THROUGH`

The implementation exposes the layers but deliberately provides **no official aggregate score**. This prevents the same earnings observation from being counted once as a fundamental beat and again as an allegedly independent event/flow signal.

## Price contract
- anchor: last verified trade immediately before release;
- retain AH, D1 open/close, D3, D5, D20;
- benchmark subtraction occurs once per scored horizon;
- AH/open are path diagnostics, not extra additive return observations;
- stale/contradictory tape fails closed.

## Fundamental contract
EPS is secondary. If EPS basis/quality is not verified it cannot inflate the fundamental layer. Revenue, guidance, margin and FCF/share carry the core economic information.

## Legacy status
`earnings_flow_confirmation.py` and the earnings-related portion of `market_fragility.py` remain callable for compatibility, but are `SUPERSEDED_FOR_EARNINGS_SCORING`. Their non-earnings responsibilities remain intact. A caller must not add their earnings-derived values to Earnings Learning v2.2.

## Authority
- learning / diagnosis: YES;
- BUY/SELL: NO;
- portfolio mutation: NO;
- broker execution: NO.

Promotion from CANDIDATE requires focused CI green. Until then the existing runtime remains authoritative.