# BIOHEALTH RELATIVE ALPHA OMEGA

**Status:** CANONICAL / ACTIVE / TRANSVERSAL  
**Effective:** 2026-08-28  
**Parent:** ATLAS Ω v4.0  
**Scope:** Healthcare / Biotech / Pharma / Diagnostics / Life-Science Tools / Medical Devices

## Purpose

Prevent ATLAS from confusing sector beta with stock-specific alpha during strong healthcare rotations. Every BioHealth candidate must be judged against the economically correct benchmark, then passed through Economic Proof, Expected Return, risk and Competition for Capital.

## Core law

`ABSOLUTE RETURN != ALPHA`

For every BioHealth ticker:

`ALPHA_OMEGA(h) = RETURN_TICKER(h) - RETURN_CORRECT_BENCHMARK(h)`

where `h` must include, when verified data exist:

`1M / 3M / 6M / YTD / 1Y`

YTD alone is insufficient for a final decision.

## Benchmark Assignment Gate

ATLAS must assign the benchmark before scoring relative performance.

Default mapping:

- Small/mid biotech / clinical biotech -> `XBI`
- Large/commercial biotech -> `IBB`
- Pharma -> `XPH` plus `XLV` as broad-health cross-check
- Medical devices -> `IHI`
- Life-science tools / diagnostics -> closest verified tools/equipment/diagnostics benchmark; if unavailable, use `XLV` only as fallback and mark `BENCHMARK_IMPERFECT`
- Broad healthcare conglomerate -> `XLV`

The benchmark may be changed when company economics clearly differ from the default category, but the reason must be recorded.

`WRONG_BENCHMARK = INVALID_RELATIVE_ALPHA`

## Relative Alpha states

- `RA0_UNVERIFIED` — market data or benchmark assignment incomplete
- `RA1_LAGGING` — persistent negative excess return with no fundamental offset
- `RA2_BETA_ONLY` — absolute return positive but mostly explained by benchmark
- `RA3_EMERGING_ALPHA` — positive excess return with improving fundamentals
- `RA4_CONFIRMED_ALPHA` — persistent multi-horizon alpha + Economic Proof
- `RA5_ALPHA_WITH_EXPECTATION_RISK` — strong alpha and fundamentals, but valuation/crowding/expectations materially elevated

Price alpha is never fundamental evidence by itself.

## BioHealth Economic Proof Gate

A candidate must be classified by business type before scoring:

### A. Compounder / monetized innovation
Examples of required evidence:
- revenue growth
- product/royalty growth
- gross/operating margin progression
- EPS/FCF growth
- guidance revisions
- recurring/commercial durability

### B. Growth with proof
Require commercial revenue or validated recurring diagnostic/service economics plus TAM expansion and cash conversion trajectory.

### C. Clinical convexity
Require probability-adjusted pipeline value, phase, endpoint quality, regulatory path, cash runway, dilution risk and catalyst map. A rally or index inclusion cannot substitute for clinical evidence.

### D. Platform optionality
Require platform validation, repeatability across programs, external validation/partners and balance-sheet endurance.

### E. High-beta experimental / Moonshot
Cannot compete for equal capital against monetized compounders. Position sizing, if ever allowed, must reflect binary clinical and financing risk.

## Rally Maturity Gate

BioHealth regime must be tracked independently from broad Healthcare.

Required regime fields:

`XBI_RELATIVE -> IBB_RELATIVE -> XPH_RELATIVE -> XLV_RELATIVE -> IHI_RELATIVE -> BREADTH -> FUND_FLOWS -> M&A -> EARNINGS_REVISIONS -> DISCOUNT_RATE -> REGULATORY_RISK`

Regime states:

- `B0_DORMANT`
- `B1_EARLY_ROTATION`
- `B2_BROADENING`
- `B3_WINNING`
- `B4_MATURE_WINNING`
- `B5_EUPHORIA_TERMINAL`
- `B6_DETERIORATING`

A mature rally does not require selling. It raises the hurdle for Expected Return and penalizes chasing.

## M&A / Patent Cliff Gate

M&A activity is a sector support variable, not a takeover assumption for an individual ticker.

Track:

`PATENT_CLIFF_NEED -> STRATEGIC_BUYER_COUNT -> ASSET_SCARCITY -> LICENSING_ACTIVITY -> TRANSACTION_PREMIA -> TARGET_FIT`

Never assign takeover probability without evidence. `M&A_PUT` can support regime score but cannot create BUY authority.

## Clinical Binary Risk Gate

For clinical-stage or indication-dependent names record:

`PHASE -> PRIMARY_ENDPOINT -> EFFECT_SIZE -> SAFETY -> REGULATORY_PATH -> MANUFACTURING -> CASH_RUNWAY -> DILUTION -> NEXT_CATALYST -> FAILURE_IMPACT`

Clinical holds, futility stops, safety signals and regulatory reversals must be separated from sector beta.

## China Competition / Licensing Gate

For therapeutics and platforms exposed to global competition, evaluate:

`CHINA_PIPELINE_DENSITY -> TARGET_OVERLAP -> DIFFERENTIATION -> COST_ADVANTAGE -> OUT_LICENSING -> GLOBAL_RIGHTS -> TIME_TO_MARKET -> PEAK_SALES_AT_RISK`

Chinese innovation can be both a positive licensing supply source and a competitive threat. Do not score it directionally without company-specific evidence.

## Hidden Economic Concentration Gate

Different tickers may represent the same economic exposure.

Mandatory examples include:
- drug developer + delivery/royalty platform sharing the same product economics
- diagnostics + therapeutic revenue tied to the same disease adoption curve
- multiple companies dependent on the same target, payer policy or regulatory pathway

For every BioHealth pair in the portfolio calculate/assess:

`SHARED_PRODUCT -> SHARED_PARTNER -> SHARED_INDICATION -> SHARED_PAYER -> SHARED_REGULATORY -> SHARED_REVENUE_DRIVER`

Economic overlap must reduce diversification credit even when sector labels differ.

## Expected Return Gate

No BioHealth Composite Ω can be final until Expected Return is closed.

Minimum required inputs:

`CURRENT_PRICE -> NORMALIZED_EARNINGS/FCF_OR_rNPV -> REVENUE/EPS_REVISIONS -> VALUATION -> TERMINAL_ASSUMPTIONS -> DILUTION -> LEVERAGE -> CATALYSTS -> DOWNSIDE -> EXPECTED_CAGR_3_6Y`

For royalty / delivery companies additionally require:

`ROYALTY_DURATION -> PATENT_LIFE -> PARTNER_CONCENTRATION -> PRODUCT_CONCENTRATION -> DEBT -> BUYBACKS -> REINVESTMENT`

For mature profitable biotech additionally require:

`FRANCHISE_DURABILITY -> PIPELINE_REPLACEMENT -> PATENT_EXPIRY -> FORWARD_MULTIPLE -> NET_CASH/DEBT`

`FUNDAMENTAL_SCORE_HIGH != EXPECTED_RETURN_HIGH`

## BioHealth Competition for Capital

Selection hierarchy:

1. Correct benchmark assignment
2. Relative Alpha multi-horizon
3. Economic Proof / clinical proof appropriate to business model
4. Revisions and earnings/FCF trajectory
5. Valuation and Expected Return
6. Balance sheet / dilution / leverage
7. Hidden economic concentration
8. Portfolio volatility contribution
9. Competition against non-healthcare alternatives

A ticker must beat the marginal portfolio holding, not merely its healthcare peers.

## Contrarian Dispersion Radar

When dispersion between BioHealth subindustries becomes extreme, ATLAS must search lagging groups for:

`FUNDAMENTALS_INTACT + REVISIONS_STABLE_OR_UP + MATERIAL_DERATING + QUALITY_HIGH + EXPECTED_RETURN_IMPROVING`

This is especially relevant to devices/tools/diagnostics when biotech/pharma have materially rerated.

Do not buy laggards solely because they lag.

## Required Score

BioHealth Relative Alpha Score (`BRAS`, 0-100):

- Multi-horizon Relative Alpha: 20%
- Economic Proof / Clinical Quality: 25%
- Revenue/EPS/FCF Revisions: 15%
- Expected Return / Valuation: 20%
- Balance Sheet / Dilution / Leverage: 10%
- Portfolio Fit / Economic Independence: 10%

`BRAS = 0.20*RA + 0.25*EP + 0.15*REV + 0.20*ER + 0.10*BS + 0.10*PF`

Hard rule: if Expected Return is `UNVERIFIED`, BRAS is provisional and cannot be called final Composite Ω.

## Authority limits

This module has no autonomous BUY/SELL authority.

It cannot override:
- Evidence Integrity Ω
- Falsifier Veto
- Valuation
- Expected Return
- Portfolio Integrity
- concentration limits
- Decision Safety Gate
- Competition for Capital

Default incomplete state:

`WATCH / CHALLENGER / DISPLACEMENT_CANDIDATE / NO_PORTFOLIO_CHANGE`

## Required output

`TICKER -> BUSINESS_TYPE -> BENCHMARK -> RA_1M/3M/6M/YTD/1Y -> RA_STATE -> ECONOMIC_PROOF -> REVISIONS -> CLINICAL_RISK -> CHINA_GATE -> BALANCE_SHEET -> HIDDEN_OVERLAP -> EXPECTED_CAGR -> BRAS -> PORTFOLIO_VOL_IMPACT -> COMPETITION_FOR_CAPITAL -> ACTION`
