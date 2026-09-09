# REVERSE SCREENER DISCOVERY Ω v1.1

**Status:** ACTIVE · CANONICAL RESEARCH DISCOVERY  
**Effective:** 2026-09-09  
**Implementation:** `src/atlas/algorithm/reverse-screener-discovery-omega.ts`  
**Implementation commit:** `4cb732c6402ce0990b6d4b94fb447cf93460ea1b`  
**Tests:** `src/atlas/algorithm/reverse-screener-discovery-omega.test.ts`  
**Registry:** `src/atlas/algorithm/reverse-screener-discovery-omega.registry.ts`  
**Decision authority:** NONE  
**Operational status:** LOGIC DEFINED · DATA PIPELINE NOT YET OPERATIONAL

## Purpose

This module is the reproducible gate that reduces the US-listed >$2B universe to a smaller set of candidates worthy of Watchlist Ω, Ficha Ω and full ATLAS audit. It is not a portfolio selector and cannot authorize entry, replacement, sizing or retention.

Canonical chain:

`SCREENER -> DSE-Ω SENSOR -> WATCHLIST Ω -> FICHA Ω + ATLAS AUDIT -> CARTERA Ω`

Within Six-Engine architecture:

`R0 GLOBAL DISCOVERY -> REVERSE SCREENER DISCOVERY Ω -> E1 -> E2 -> E3 -> E4 -> E5 -> E6`

## Why v1.1 replaced v1.0

v1.0 was useful as a reverse-engineering prototype but had six structural defects:

1. Valuation used an OR gate: one cheap metric could repair two expensive ones.
2. Quality and valuation thresholds were absolute rather than sector-relative.
3. The 2-of-5 acceleration rule treated all signals as equally informative.
4. Penalties were partly subjective and therefore non-reproducible.
5. Momentum used correlated absolute returns and ignored relative strength.
6. Catalyst was scored despite lacking deterministic reproducibility.

v1.1 changes the architecture rather than merely tuning thresholds.

## STEP 1 — Universe

All required:

- US-listed.
- Market capitalization >= $2B.
- Exclude pre-revenue biotech.
- Exclude SPACs.
- Exclude micro-cap financials.
- Evidence traceable with >=2 non-empty evidence IDs.

Rationale: the screener is intended to produce an institutionally tradable auditable universe. Binary pre-revenue biotech is event-risk research, not a quality-growth screener input.

## STEP 2 — Fundamental acceleration, hierarchical

Tier A:

- Revenue growth >10%.
- EPS growth >15%.
- EBITDA growth >15%.

Tier B:

- FCF growth >15%.
- Forward EPS revisions >0%.

Pass rule:

`AT LEAST 1 TIER A + AT LEAST 1 TIER B`

Bonus inside acceleration score when all three Tier A conditions hold simultaneously.

Rationale: a minimal analyst revision is not informationally equivalent to double-digit revenue growth. v1.1 requires both an operating acceleration signal and a confirming cash/forward signal.

## STEP 3 — Quality, sector-relative

All required:

- FCF >0.
- Net Debt/EBITDA sector percentile <40 when applicable.
- Operating Margin sector percentile >40.
- ROIC > estimated WACC.
- Net Debt/EBITDA >4x is a hard veto.

Directional quality is also recorded:

`ROIC two years ago < ROIC one year ago < ROIC current`

Failure of the two-year improvement condition creates `ROIC_TREND_NOT_IMPROVING_2Y`; it is directional context and ranking information, while the hard gate remains ROIC > WACC plus the other quality constraints.

Rationale: a 10% operating margin means different things in software and retail. The system compares companies to the economics of their sector rather than imposing a universal margin cutoff.

## STEP 4 — Valuation, confirmation required

At least **2 of 3**:

- Forward P/E sector percentile <50.
- EV/EBITDA sector percentile <50.
- FCF Yield >4%.

Rationale: one attractive metric cannot repair two unattractive valuation dimensions. Sector-relative percentiles avoid treating a P/E of 28x as identically expensive across utilities and structural compounders.

## STEP 5 — Relative momentum

All required:

- Price > MA200.
- RS vs sector 3M >0 percentage points.
- RS vs sector 6M >-5 percentage points.

Rationale: positive absolute return is weak evidence if the company materially underperforms its own sector. MA200 remains the trend gate; sector-relative strength becomes the confirmation layer.

## STEP 6 — DSE-Ω dynamic sensor

When:

`DSE_Z >= 2.0` within the recent 20-session observation window,

set:

`DSE_DECOUPLING_ACTIVE_P3_P5_REVIEW`

DSE is a dynamic market sensor, not business-quality evidence. It can raise attention priority but cannot repair failed universe, acceleration, quality, valuation or momentum gates.

## STEP 7 — Deterministic penalties and vetoes

- Customer concentration >30% revenue: -15 points.
- GAAP/non-GAAP gap >25%: -10 points.
- Regulatory revenue >50%: -20 points.
- Net Debt/EBITDA >4x: hard veto.
- Material litigation pending: manual-review flag only.
- Cyclical/commodity-sensitive earnings >50% above five-year normalized level: `CYCLE_NORMALIZATION_REQUIRED` and -10 discovery points.

Catalyst is not a score term. Non-reproducible catalyst information may trigger manual review but cannot add automatic points.

## STEP 8 — Ranking

For candidates that pass all hard gates:

`25% Fundamental Acceleration`

`20% Quality Trend`

`15% FCF Quality`

`15% Sector-Relative Valuation`

`15% Sector-Relative Momentum`

`10% DSE Signal`

Risk penalties remain visible and are never hidden inside the aggregate score.

## Regime classification

Every candidate remains tagged as one of:

- `STRUCTURAL_GROWTH`
- `TECH_SUPERCYCLE`
- `CYCLICAL`
- `EVENT_DRIVEN`
- `UNCLASSIFIED`

Raw P/E comparisons across incompatible regimes are prohibited. Cyclical peak earnings require normalized/mid-cycle economics before downstream Expected Return.

# DATA PIPELINE SPECIFICATION

The executable decision logic exists. The production data pipeline does not yet exist. The four required components below define the intended operating contract but must not be described as operational until a primary data source and scheduled ingestion are implemented.

## Component A — Sector percentiles

### Classification standard

Preferred taxonomy: **GICS 11 sectors**.

### Reference universe

US-listed companies with market capitalization >=$2B, not merely S&P 500 constituents.

Rationale: S&P 500-only percentiles introduce survival and quality-selection bias.

### Metrics

- Operating Margin.
- Net Debt/EBITDA.
- Forward P/E.
- EV/EBITDA.

### Minimum sample

Proposed rule, not yet operational:

- n >=15: sector percentile valid.
- n <15: use documented sector-median + absolute fallback rule.

The fallback formula remains OPEN-02 and must not be silently inferred.

### Refresh

Target frequency: quarterly. Exact trigger remains OPEN-05.

## Component B — WACC

Preferred production design: company-level approximation.

Inputs:

- risk-free rate: 10Y US Treasury;
- beta: rolling 252 trading-day regression vs SPY;
- ERP: explicit global assumption, updated on a documented schedule;
- cost of debt: interest expense / gross debt where economically valid;
- tax rate: normalized effective rate, preferably 3-year average;
- capital weights: market equity + debt.

Required quality flag:

`WACC_ESTIMATE_QUALITY = HIGH | MEDIUM | LOW`

Unusual capital structures, convertibles, hybrids, economically material leases or missing debt-cost inputs should prevent false precision and may produce LOW quality.

## Component C — Sector relative strength

Initial proxy mapping:

- Information Technology -> XLK
- Health Care -> XLV
- Financials -> XLF
- Consumer Discretionary -> XLY
- Consumer Staples -> XLP
- Industrials -> XLI
- Energy -> XLE
- Utilities -> XLU
- Real Estate -> XLRE
- Materials -> XLB
- Communication Services -> XLC

Calculation:

`RS_3M = stock adjusted return over 63 trading days - sector proxy adjusted return over 63 trading days`

`RS_6M = stock adjusted return over 126 trading days - sector proxy adjusted return over 126 trading days`

Target refresh: daily EOD.

Known limitation: capitalization-weighted ETFs can be dominated by megacaps, especially XLK and XLC. Equal-weighted sector return or median constituent return is a candidate improvement, not yet canonical.

## Component D — DSE_Z

Model:

`r_i = alpha + beta_s*r_sector + beta_m*r_market + epsilon`

Rolling OLS target window: 60 trading days, minimum 40 valid observations.

`DSE_Z_t = epsilon_t / sigma(epsilon)_60d`

Inputs:

- stock adjusted daily return;
- sector proxy daily return;
- SPY daily return.

Operational rules:

- insufficient history: `DSE_INSUFFICIENT_HISTORY`;
- halted/non-trading dates: remove from regression window, never impute zero return;
- low-liquidity/unstable beta cases require a quality flag;
- beta may be recalculated weekly while residual/DSE_Z is updated daily if this is validated as operationally equivalent enough for discovery.

# OPEN DECISIONS — EXPLICITLY UNRESOLVED

## OPEN-01 — Multi-sector classification

For companies whose economic activity spans sectors, decide whether to use official GICS classification only or an ATLAS economic classification overlay. No implicit override is allowed.

## OPEN-02 — Percentile fallback when sector n <15

The proposed median + absolute threshold fallback needs a precise formula and tests before activation.

## OPEN-03 — ERP assumption for WACC

The actual ERP value and refresh schedule must be documented. A change to ERP can move the entire universe's ROIC-vs-WACC gate simultaneously.

## OPEN-04 — Primary financial-data source

No single production source is currently canonical. Until one provider/API contract is selected, the screener is reproducible in logic but not operationally reproducible end-to-end.

Candidate source classes include SEC/XBRL plus market-data enrichment, commercial fundamentals datasets, or an institutional database. Source quality, point-in-time behavior, survivorship handling and restatement policy must be tested before adoption.

## OPEN-05 — Sector percentile refresh trigger

Quarterly is the target cadence. The exact trigger remains unresolved: fixed calendar versus post-earnings-season completion by sector.

# State declaration

`DECISION LOGIC = IMPLEMENTED`

`TESTS = SYNCHRONIZED TO V1.1`

`REGISTRY = SYNCHRONIZED TO V1.1`

`DATA PIPELINE = NOT YET OPERATIONAL`

`PERCENTILE ENGINE = SPECIFIED, NOT IMPLEMENTED`

`WACC ENGINE = SPECIFIED, NOT IMPLEMENTED`

`RS ENGINE = SPECIFIED, NOT IMPLEMENTED`

`DSE DATA PIPELINE = SPECIFIED, NOT IMPLEMENTED HERE`

# Constitutional laws

`SCREENER_GENERATES_CANDIDATES_NOT_CAPITAL_DECISIONS`

`DISCOVERY_SCORE != BUY`

`DISCOVERY_SCORE != PORTFOLIO_WEIGHT`

`ACCELERATION_REQUIRES_TIER_A_AND_TIER_B`

`VALUATION_REQUIRES_TWO_OF_THREE`

`SECTOR_RELATIVE_THRESHOLDS_PRECEDE_RAW_ABSOLUTE_THRESHOLDS`

`MOMENTUM_IS_RELATIVE_TO_SECTOR`

`ROIC_LEVEL_REQUIRES_DIRECTIONAL_CONTEXT`

`DSE_IS_DYNAMIC_SENSOR_NOT_BUSINESS_EVIDENCE`

`CATALYST_IS_MANUAL_ATTENTION_NOT_SCORE`

`NET_DEBT_EBITDA_GT_4_IS_VETO`

`CYCLICAL_PEAK_EARNINGS_REQUIRE_NORMALIZATION`

`UNDEFINED_DATA_PIPELINE_CANNOT_BE_CALLED_OPERATIONAL`
