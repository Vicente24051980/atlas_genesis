# ATLAS Ω — Universe RAW 650

Date: 2026-09-06
Status: CANONICAL SOURCE / TRACEABILITY

This file preserves the user's supplied 650-entry Nasdaq 100 + expanded/adjusted S&P 500 universe exactly at the logical level of source membership. It is not the effective selector universe because the source contains repeated tickers across index blocks and duplicate adjusted entries.

## Canonical interpretation

- RAW source rows: 650
- Effective unique tickers after deterministic ticker deduplication: 490
- Deduplication key: normalized ticker symbol
- Duplicate source rows retain provenance but have zero additional selection weight.
- A ticker appearing in Nasdaq and S&P is one security, not two candidates.
- The effective selector universe is maintained in `CURRENT_CANON/universe/2026-09-06_ATLAS_UNIVERSE_MASTER_490.md`.

## Source blocks

1. Nasdaq 100 supplied list: rows 1–100.
2. S&P 500 expanded/adjusted supplied list: rows 101–650.

The complete row-level transcription is preserved in the conversation source; this canonical file defines its interpretation and binds it to the deduplicated master universe.
