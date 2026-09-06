# LINGOTTO CORPORATE ACTION REGISTRY Ω v0.1

**Date:** 2026-09-06  
**Status:** ACTIVE / PRIMARY-SOURCE VERIFIED EXCEPTIONS

## Purpose
Prevent split-driven share-count changes from being misclassified as allocator adds/cuts in the Lingotto 13F event ledger.

## Verified exceptions

| Security | Filing observation | Corporate action | Normalization rule | State |
|---|---|---|---|---|
| NVIDIA (CUSIP 67066G104) | Q1-2024: 57,866 shares; Q2-2024: 578,660 shares | NVIDIA 10-for-1 forward split effective 2024-06-07; split-adjusted trading 2024-06-10 | Divide Q2 shares by 10 for pre/post economic-share comparison, or multiply prior shares by 10 before QoQ diff | VERIFIED — NOT AN ADD |
| Broadcom (CUSIP 11135F101) | Q2-2024: 5,000 shares; Q3-2024: 50,000 shares | Broadcom 10-for-1 forward split effective 2024-07-12; split-adjusted trading 2024-07-15 | Divide Q3 shares by 10, or multiply prior shares by 10 before QoQ diff | VERIFIED — NOT AN ADD |
| Desktop Metal | Q1-2024 CUSIP 25058X105 / 828,177 shares; Q2-2024 CUSIP 25058X303 / 82,817 shares | 1-for-10 reverse split effective 2024-06-10; split-adjusted trading 2024-06-11 | Treat CUSIP transition as same economic security after verified 1:10 normalization; do not classify apparent ~90% share drop as CUT | VERIFIED — NOT A CUT |
| Ginkgo Bioworks | Q2-2024 CUSIP 37611X100 / 10,011,301 shares; Q3-2024 CUSIP 37611X209 / 250,282 shares | 1-for-40 reverse split effective 2024-08-19 | Treat CUSIP transition as same economic security after verified 1:40 normalization; 10,011,301 / 40 ≈ 250,282.5 | VERIFIED — NOT A CUT absent residual difference after fractional-share treatment |

## Evidence anchors
- NVIDIA investor materials: ten-for-one split; effective split date 2024-06-07; post-split trading 2024-06-10.
- Broadcom investor materials: ten-for-one split; effective 2024-07-12; post-split trading 2024-07-15.
- Desktop Metal Form 8-K: board approved 1-for-10 reverse split; effective 2024-06-10; every 10 old shares reclassified into one new share.
- Ginkgo Bioworks Form 8-K: amended charter effective 2024-08-19 implementing 1-for-40 reverse split.

## Hard rule
`RAW_SHARE_QOQ` is never an event signal when `CORPORATE_ACTION_STATE != NONE`.

Derived sequence:
`RAW_SHARES -> CORPORATE_ACTION_NORMALIZATION -> ECONOMIC_SHARES_COMPARABLE -> SHARE_QOQ -> EVENT_CLASS`

If normalization leaves a residual change, classify only the residual after documenting rounding/fractional-share effects.

## Status impact
The first 2024 extraction pass already demonstrates why a CUSIP-only or raw-share-count diff is unsafe. The event ledger remains locked until this registry is applied across every security with a CUSIP/class discontinuity or mechanically scaled share count.
