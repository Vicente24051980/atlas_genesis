# ATLAS Ω — UNIVERSE 650 RAW + NORMALIZATION RULES

Date: 2026-09-06
Status: CANONICAL UNIVERSE INPUT

## Scope
The user-supplied 650-row consolidation (Nasdaq-100 block + S&P 500 expanded/adjusted blocks) is the canonical raw ATLAS selection universe for this run.

## Two-layer representation
1. RAW_UNIVERSE_650: preserve all 650 supplied rows exactly as source membership/input evidence, including duplicate labels and repeated tickers.
2. NORMALIZED_INVESTABLE_UNIVERSE: deduplicate by economic security/ticker before scoring so no issuer receives multiple votes because it appears in more than one source block.

## Normalization law
- Same ticker repeated in multiple blocks => one investable candidate.
- Labels such as "II" are aliases, not separate securities, unless the ticker/security is actually distinct.
- Share classes remain distinct only when economically/tradably distinct (e.g. GOOGL vs GOOG).
- Different listings/ADRs are not merged automatically unless the security identity is proven equivalent for the intended execution venue.
- Corporate actions, ticker changes and acquired/delisted names require identity reconciliation before scoring.
- Duplicate source membership may be stored as metadata but contributes zero extra score.

## Known duplicate examples in the supplied 650 rows
NVDA, AAPL, MSFT, AVGO, MU, AMD, INTC, CSCO, LRCX, AMAT, PANW, ANET, KLAC, CRWD, APH, QCOM, ADBE, INTU, CDNS, SNPS, MCHP, MPWR, ADSK, WDAY, TEAM, DDOG, FTNT, NXPI, ROP, CTSH, WDC, TER, CEG, LIN, ISRG, VRTX, REGN, CME, HWM, TDG, GWW, MOH, BWA, EQT, A, DAY, GL, KVUE, LW, NVR, PTC, RVTY, SW, ZBRA, BAC, BDX, BBY, BLK, BA, BKNG, BSX, COF, CAT, CBOE, SCHW, CVX, CMG, CB, CSCO, C, KO, COP, COST, CSX, CVS, DHR, DE, DELL, DAL, ETN, LLY, EMR, EOG, XOM, FDX, FCX, GD, GE, GILD, GS, HON, HUM, IBM, ITW.

## Portfolio-selection law
Universe -> eligibility -> expected return -> risk -> fragility -> scenarios -> portfolio marginal contribution -> endogenous N -> sizing.

Diversification, sector, geography and source-index membership have zero independent authority. The canonical portfolio objective remains MAX RETURN / LOW VOL at portfolio level.

## Determinism requirement
The same frozen snapshot and same normalized universe must produce the same ranking, N and weights within tolerance. If not: DETERMINISM_FAILURE = TRUE.

## Relationship to 4-session test
The 4-session experimental basket is separate from the strategic portfolio optimizer. TEST may use equal weights to isolate selection skill; PORTFOLIO uses endogenous N and optimized sizing. TEST != PORTFOLIO.
