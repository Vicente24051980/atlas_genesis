# ATLAS Ω — CANONICAL UNIVERSE · 2026-09-06

**Status:** CANONICAL / ACTIVE  
**Authority:** Universe definition only; no constituent receives score, priority or portfolio weight merely for being present.

## Source of truth
The user-defined ATLAS research universe is the 650-row Nasdaq-100 + S&P-500-expanded/adjusted compilation supplied by the user and preserved verbatim as ticker rows in:

- `data/t0-universe-user-seed-2026-09-05.txt`

That raw file contains exactly **650 ticker rows**. Duplicates are intentional because the source compilation contains repeated securities/classes across blocks.

## Normalized scoring universe
For discovery, scoring, ranking, duels and portfolio construction ATLAS must use the deterministic ticker-normalized universe:

- `data/atlas-universe-normalized-2026-09-06.txt`

**UNIQUE_TICKERS = 490**

Normalization rule: first occurrence wins; exact ticker identity is preserved. `GOOG` and `GOOGL` remain distinct share classes. `BRK.B` and `BF.B` remain exact ticker identities. Repeated rows such as NVDA, CEG, ISRG, EQT, SO, etc. collapse to one candidate each.

## Inviolable anti-bias law
`RAW_ROW_FREQUENCY_AUTHORITY = 0`

A ticker appearing in Nasdaq-100 and again in the expanded S&P block receives **no bonus whatsoever**. Duplicate frequency cannot affect Company Score, Expected Return, confidence, ranking, portfolio inclusion, sizing, challenger priority or duel outcome.

Every normalized ticker starts from zero under the First Universal Law and must earn its position through the active ATLAS MAIN stack.

## Relationship to portfolio
`UNIVERSE != PORTFOLIO`

The 490 normalized tickers are the eligible discovery/competition set. The current portfolio is selected independently under MAX RETURN / LOW VOL, Replacement Firewall and the Single Portfolio Authority. Sector/geography/style quotas have zero independent authority.

## Scope warning
“Nasdaq-100 + S&P 500 expanded/adjusted” describes the user-defined ATLAS research universe. It is not a claim that all 490 normalized names are current official constituents of those indices on 2026-09-06.

## Precedence
For future ATLAS queries:
1. Universe membership comes from this canon + the two data files above.
2. Scoring uses the normalized 490 only.
3. Raw 650 is retained solely for provenance/reproducibility.
4. No silent addition/removal is allowed. A universe change requires an explicit dated update.
