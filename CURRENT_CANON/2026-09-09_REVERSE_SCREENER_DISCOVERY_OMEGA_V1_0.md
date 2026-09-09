# REVERSE SCREENER DISCOVERY Ω v1.0

**Status:** ACTIVE · CANONICAL RESEARCH DISCOVERY  
**Effective:** 2026-09-09  
**Implementation:** `src/atlas/algorithm/reverse-screener-discovery-omega.ts`  
**Tests:** `src/atlas/algorithm/reverse-screener-discovery-omega.test.ts`  
**Registry:** `src/atlas/algorithm/reverse-screener-discovery-omega.registry.ts`  
**Decision authority:** NONE

## Purpose

Reverse-engineer the useful behavior observed in an external AI stock screener and convert it into an auditable ATLAS discovery layer without importing the screener's opaque ranking logic or allowing it to create capital decisions.

The module exists to find names showing a combination of fundamental acceleration, valuation sanity, cash-flow quality and price confirmation. It is a discovery engine only.

## Placement

`R0 GLOBAL DISCOVERY -> REVERSE SCREENER DISCOVERY Ω -> E1 EVIDENCE -> E2 ASSESSMENT -> E3 GATE -> E4 DECISION -> E5 CONTROL -> E6 ASSURANCE`

It does not replace Point Zero, Capital-Blind selection, Valuation Ω, Expected Return Ω, Momentum Ω, Replacement Firewall or Competition for Capital.

## Universe gate

- US-listed research universe.
- Market capitalization >= $1B.
- Evidence must be traceable with at least two non-empty evidence IDs.

## Fundamental acceleration gate

A candidate must satisfy at least **2 of 5**:

1. Revenue growth > 10%.
2. EPS growth > 15%.
3. EBITDA growth > 15%.
4. FCF growth > 15%.
5. Forward EPS revisions > 0%.

This intentionally uses a bounded OR-structure instead of requiring every growth metric simultaneously. It captures different economic transmission paths while preventing a single optical metric from qualifying a company alone.

## Quality gate

All required:

- FCF positive.
- Net debt / EBITDA < 3x when applicable.
- Operating margin > 10%.
- ROIC > 8%.

Momentum cannot repair a failed quality gate.

## Valuation gate

At least one must hold:

- Forward P/E < 30x; or
- EV/EBITDA < 18x; or
- FCF yield > 4%.

A low multiple cannot repair failed Economic Proof.

## Momentum gate

All required:

- Price above 200-day moving average.
- 3-month total return > 0%.
- 6-month total return > 0%.

Momentum is confirmation, not causal business evidence.

## Ranking score

For names that pass the gates:

`SCORE = 25% Fundamental Acceleration + 20% Forward Earnings Revisions + 15% FCF Quality + 15% Valuation + 15% Price Momentum + 10% Catalyst`

Catalyst bonuses may include:

- guidance raised;
- margins expanding;
- revenue accelerating;
- new identifiable catalyst.

Risk flags subtract bounded penalties but remain visible independently.

## Regime classification

Every surviving candidate should be classified before final comparison:

- `STRUCTURAL_GROWTH`
- `TECH_SUPERCYCLE`
- `CYCLICAL`
- `EVENT_DRIVEN`
- `UNCLASSIFIED`

ATLAS must not compare raw P/E across incompatible regimes as if they represented identical economics.

## Cycle Normalization Gate

If a company is commodity-sensitive or classified `CYCLICAL`, and current earnings are more than 50% above the five-year normalized level:

`CYCLE_NORMALIZATION_REQUIRED`

Effects:

- apply a 10-point discovery penalty;
- prohibit extrapolation of spot earnings into Expected Return;
- require normalized/mid-cycle earnings before valuation;
- preserve the company in discovery if all other gates pass.

This protects against false cheapness in tankers, energy, miners and other peak-cycle businesses.

## Risk flags

The implementation records:

- `ONE_OFF_EARNINGS_RISK`
- `BINARY_BIOTECH_RISK`
- `LEVERAGE_RISK`
- `CUSTOMER_CONCENTRATION_RISK`
- `REGULATORY_RISK`
- `CYCLE_NORMALIZATION_REQUIRED`
- `EVIDENCE_PENDING`

Risk flags do not disappear inside a composite score.

## Calibration sample — 2026-09-09

The reverse-engineering exercise originated from an external screener result set containing:

`MU, ASND, NVDA, QLYS, IMO, INSW, TTE, AUGO, EXEL, CRC, CNQ, MGY, SGHC`

Observed regime split:

- Structural growth: ASND, SGHC, QLYS.
- Technology supercycle: MU, NVDA.
- Cyclical: MGY, INSW, AUGO, CNQ, IMO, TTE, CRC.
- Event-driven: EXEL.

These names are calibration observations only. Their presence in this document does not authorize ownership, sizing, replacement or retention.

## Constitutional laws

`DISCOVERY_SCORE != BUY`

`DISCOVERY_SCORE != PORTFOLIO_WEIGHT`

`STRUCTURAL_GROWTH != CYCLICAL_GROWTH`

`CYCLICAL_PEAK_EARNINGS_REQUIRE_NORMALIZATION`

`TWO_OF_FIVE_ACCELERATION_GATE_REQUIRED`

`MOMENTUM_CANNOT_REPAIR_FAILED_QUALITY`

`CHEAP_MULTIPLE_CANNOT_REPAIR_FAILED_ECONOMIC_PROOF`

`REGIME_CLASSIFICATION_PRECEDES_FINAL_COMPARISON`

## Governance

This implementation does **not** alter the Six-Engine architecture, existing canonical weights, AI exposure ceiling, portfolio N, Replacement Firewall or any current holding.

Any future change to thresholds or weights requires a documented calibration sample and Model Learning & Governance review. Until then, v1.0 remains a research-discovery layer with zero direct capital authority.
