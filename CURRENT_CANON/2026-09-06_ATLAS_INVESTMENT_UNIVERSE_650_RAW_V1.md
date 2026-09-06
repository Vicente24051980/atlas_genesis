# ATLAS Ω — INVESTMENT UNIVERSE 650 · RAW CANON v1

Date: 2026-09-06
Status: CANONICAL INPUT UNIVERSE / RAW
Authority: ATLAS MAIN Ω
Objective: MAX RETURN / LOW VOL

## Canonical declaration

The user-supplied 650-line consolidation (Nasdaq-100 block + expanded/adjusted S&P 500 blocks) is registered as the ATLAS investment screening universe.

IMPORTANT: `650` is the number of supplied rows, NOT 650 unique issuers/tickers. The source contains duplicates, repeated share classes, legacy/stale constituents and adjusted/additional rows. Therefore ATLAS must preserve the raw universe for provenance while deriving a normalized investable universe before scoring.

## Universe blocks

- Rows 1–100: Nasdaq-100 supplied universe.
- Rows 101–450: first expanded S&P block.
- Rows 451–650: remaining/additional/adjusted S&P block.

## Mandatory normalization layer

Before any ranking or portfolio optimization:

`RAW_650 -> symbol normalization -> duplicate detection -> issuer/share-class mapping -> listing/status verification -> investability gate -> SNAPSHOT_UNIVERSE`

Rules:
1. Never treat duplicate rows as independent candidates.
2. Preserve economically distinct share classes where relevant (e.g. GOOGL/GOOG), but map them to the same issuer/factor exposure.
3. Mark obvious duplicate aliases / II rows as duplicates rather than additional companies.
4. Verify current ticker/listing/index status at the scoring snapshot; the raw list is provenance, not a claim of current index membership.
5. Non-US challengers already admitted elsewhere by ATLAS (e.g. TSM, SK Hynix, Tokyo Electron, Hon Hai, Hitachi, Mitsubishi Heavy, Keyence) are not deleted by this US-core universe. They belong to the broader ATLAS GLOBAL CHALLENGER layer and compete under identical rules when included in a run.
6. No sector, geography, index membership, prestige, incumbent status or diversification target grants score or portfolio authority.
7. Every eligible security starts from zero and is evaluated under the same objective and falsifiers.

## Portfolio interface

The normalized universe feeds:

`Universe -> eligibility -> expected return -> risk -> fragility -> scenarios -> portfolio marginal contribution -> endogenous N -> sizing`

For candidate j:
`ΔU_add(j) = U(P + j) - U(P)`

For replacement i -> j:
`ΔU_swap(i->j) = U(P - i + j) - U(P)`

The portfolio selector must be deterministic for a locked snapshot. Same universe + same inputs + same objective + same algorithm must yield the same tickers and weights or fail with `DETERMINISM_FAILURE`.

## Objective lock

Strategic portfolio objective remains MAX RETURN / LOW VOL under PORTFOLIO > TICKER. Risk decomposition remains 40% permanent-loss risk + 20% tail risk + 40% volatility unless superseded by a later explicit canon revision.

`N` is endogenous. There is no requirement to hold 25, 29, 31, 35, 37, or any other aesthetically chosen count.

## Raw-source integrity note

The exact 650-row enumeration is preserved in the originating ATLAS conversation/source record. This registry establishes its authority and normalization requirements. A machine-readable normalized security master should be generated as a separate artifact so corrections do not mutate raw provenance.

## Next required artifact

`data/universe/atlas_universe_security_master.csv`

Recommended columns:
`raw_row, raw_block, raw_name, raw_ticker, canonical_issuer, canonical_ticker, share_class, exchange, country, duplicate_group, duplicate_flag, current_listing_status, investable_flag, source_snapshot_date, notes`

No ticker may enter optimization merely because it appears in the raw 650 list.