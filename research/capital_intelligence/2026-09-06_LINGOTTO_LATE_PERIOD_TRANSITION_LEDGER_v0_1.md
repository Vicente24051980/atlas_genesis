# LINGOTTO LATE-PERIOD TRANSITION LEDGER Ω v0.1

**Date:** 2026-09-06  
**Status:** PRIMARY-SEC VERIFIED / PARTIAL TRANSITION LEDGER / RETURNS LOCKED  
**Window covered here:** Q3-2024 through Q1-2026, with Q3-2025 original/amendment preserved separately.

## Hard constraint
This file records disclosure-state transitions only. It does not contain subsequent returns and may not be used to optimize event thresholds.

`RETURNS_ACCESS = LOCKED`

## Amendment finding — Q3-2025 SLB instrument reclassification

Q3-2025 original filing (`0001172661-25-004702`, 2025-11-12) reported SLB as a single common-stock line of **5,950,941** shares/units.

Q3-2025 amendment (`0001172661-25-004755`, 2025-11-13) split that exposure into:
- common shares: **4,149,171**
- call: **1,801,770**

The arithmetic identity is exact:
`4,149,171 + 1,801,770 = 5,950,941`.

Therefore the amendment is an instrument-classification correction, not an economic 30%+ common-share sale followed by a simultaneous option creation. The base information-state ledger must preserve both public states and mark the original filing as `INSTRUMENT_CLASSIFICATION_AMENDED`.

This validates AMENDMENT LAW Ω and proves that collapsing put/call into ordinary holdings creates false allocator events.

## Verified trajectories

### Range Resources — RRC / CUSIP 75281A109
| Quarter | Shares | QoQ raw change | Preliminary event state |
|---|---:|---:|---|
| Q3-2024 | 6,698,796 | — | anchor |
| Q1-2025 | 7,022,737 | +4.84% vs Q3-2024/Q4 transition context incomplete here | no ADD25 |
| Q2-2025 | 7,161,614 | +1.98% | no ADD25 |
| Q3-2025 | 7,200,474 | +0.54% | no ADD25 |
| Q4-2025 | 7,216,694 | +0.23% | no ADD25 |
| Q1-2026 | 7,193,719 | -0.32% | no CUT25 |

Interpretation allowed: persistent visible position with low incremental turnover over this subwindow. Forbidden: infer net exposure, total-portfolio conviction or alpha.

### Harmony Gold — HMY ADR / CUSIP 413216300
| Quarter | Shares | QoQ raw change | Preliminary event state |
|---|---:|---:|---|
| Q3-2024 | 20,892,214 | — | anchor |
| Q1-2025 | 21,153,214 | +1.25% | no ADD25 |
| Q2-2025 | 18,209,275 | -13.92% | no CUT25 |
| Q3-2025 | 11,334,733 | -37.75% | CUT25 candidate |
| Q4-2025 | 4,897,286 | -56.82% | CUT50 candidate |
| Q1-2026 | 161,787 | -96.70% | CUT50 / near-exit candidate |

This is a mandatory negative-direction trajectory for the later backtest. It prevents a one-sided sample composed only of accumulation events.

### Pony AI — PONY ADS / CUSIP 732908108
| Quarter | Shares | QoQ raw change | Preliminary event state |
|---|---:|---:|---|
| Q1-2025 | 1,529,892 | — | visible anchor |
| Q2-2025 | 2,379,892 | +55.56% | ADD50 candidate |
| Q3-2025 | 2,379,892 | 0.00% | persistence |
| Q4-2025 | 4,107,512 | +72.59% | ADD50 candidate |
| Q1-2026 | 3,324,068 | -19.07% | below CUT25 threshold |

PONY remains a mandatory anti-cherry-picking control. No outcome interpretation is authorized before event freeze.

### NovaGold — NG / CUSIP 66987E206
| Quarter | Shares |
|---|---:|
| Q1-2025 | 21,722,889 |
| Q2-2025 | 34,902,954 |
| Q3-2025 | 35,111,968 |
| Q4-2025 | 35,196,788 |
| Q1-2026 | 36,842,013 |

Q1->Q2-2025 is a material increase and must be tested for corporate-action contamination before event promotion. Subsequent quarters show persistence / smaller additions.

### ServiceNow — NOW / CUSIP 81762P102
| Quarter | Shares |
|---|---:|
| Q1-2025 | 36,104 |
| Q2-2025 | not captured in this partial excerpt |
| Q3-2025 | 46,104 |
| Q4-2025 | 285,325 |
| Q1-2026 | 389,886 |

The large late-2025 change is a corporate-action/redenomination candidate until split/security-identity checks are complete. Do not classify from raw counts.

## Options must remain separate
Verified option lines in this window include:
- Alphabet call (Q1-2025)
- iShares 20+ Year Treasury Bond ETF call (Q2/Q3-2025)
- SLB call after Q3-2025 amendment and in Q4-2025

`PUT_CALL != null` rows are never merged with common-share rows for share-change event classification.

## Current event-freeze state
- primary filing dates/accessions: COMPLETE for study timeline
- primary late-period holdings extraction: materially advanced through Q1-2026
- Q3-2025 original/amendment diff: VERIFIED
- corporate-action normalization: OPEN
- full CUSIP/class continuity map: OPEN
- Q2-2026 security-level extraction: OPEN
- event ledger: NOT FROZEN
- returns: LOCKED

## Next deterministic step
1. close Q4-2024 and Q2-2026 security-level tables;
2. build one row per `quarter + CUSIP + class + put_call`;
3. reconcile issuer/CUSIP transitions and corporate actions;
4. calculate adjusted QoQ share changes;
5. freeze event labels by commit hash;
6. only then unlock post-publication return data.