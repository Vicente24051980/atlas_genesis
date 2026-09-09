# REVERSE SCREENER DISCOVERY Ω v1.0

**Status:** SUPERSEDED  
**Effective:** 2026-09-09  
**Superseded:** 2026-09-09 by v1.1.0  
**Reason:** v1.0 used absolute sector-agnostic quality/valuation thresholds, a weak 2-of-5 acceleration rule, valuation OR logic, absolute momentum, subjective catalyst scoring and non-operational risk penalties. Those design choices were replaced by sector-relative gates, Tier A + Tier B acceleration, 2-of-3 valuation, relative-strength momentum, explicit DSE integration and deterministic penalties/vetoes.  
**Historical implementation:** `src/atlas/algorithm/reverse-screener-discovery-omega.ts` prior to commit `4cb732c6402ce0990b6d4b94fb447cf93460ea1b`  
**Superseding canonical document:** `CURRENT_CANON/2026-09-09_REVERSE_SCREENER_DISCOVERY_OMEGA_V1_1.md`  
**Decision authority:** NONE

## Historical purpose

v1.0 reverse-engineered the useful behavior observed in an external AI stock screener and converted it into an auditable ATLAS discovery layer without giving it capital authority.

## Historical placement

`R0 GLOBAL DISCOVERY -> REVERSE SCREENER DISCOVERY Ω -> E1 EVIDENCE -> E2 ASSESSMENT -> E3 GATE -> E4 DECISION -> E5 CONTROL -> E6 ASSURANCE`

## Historical design

Universe: US-listed, market cap >= $1B, traceable evidence.

Acceleration: any 2 of 5 among revenue growth >10%, EPS growth >15%, EBITDA growth >15%, FCF growth >15%, forward EPS revisions >0.

Quality: FCF positive, net debt/EBITDA <3x, operating margin >10%, ROIC >8%.

Valuation: any 1 of Forward P/E <30x OR EV/EBITDA <18x OR FCF yield >4%.

Momentum: price > MA200, 3M return >0%, 6M return >0%.

Score: 25% acceleration + 20% revisions + 15% FCF quality + 15% valuation + 15% momentum + 10% catalyst.

Cycle normalization: commodity/cyclical names with earnings >50% above five-year norm received a 10-point penalty and required normalized earnings before downstream valuation.

## Why v1.0 was superseded

1. Valuation OR logic admitted securities that failed two valuation dimensions.
2. Absolute thresholds ignored sector economics.
3. The 2-of-5 acceleration gate treated high-information and low-information signals as equivalent.
4. Risk penalties lacked deterministic thresholds.
5. Absolute momentum duplicated correlated trend information and ignored sector-relative strength.
6. Catalyst scoring was not reproducible.
7. Snapshot quality ignored direction of ROIC and other ratios.
8. DSE-Ω had no formal interface.

## Audit preservation

This document is intentionally retained. It is historical evidence of the design path and must not be deleted merely because v1.1 supersedes it.

## Historical laws

`DISCOVERY_SCORE != BUY`

`DISCOVERY_SCORE != PORTFOLIO_WEIGHT`

`STRUCTURAL_GROWTH != CYCLICAL_GROWTH`

`CYCLICAL_PEAK_EARNINGS_REQUIRE_NORMALIZATION`

These laws remain directionally valid, but all executable threshold logic is governed by v1.1 or later canon.
