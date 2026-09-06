# ACCELERATION × RELATIVE RANK MIGRATION Ω — V1 Result

**Verdict:** **SURVIVES_STAGE_A**  
**Experiment:** `ARRM_OMEGA_V1_2026-09-06`  
**Authority:** RESEARCH ONLY

## Coverage

- Historical symbols encountered: **663**
- Panel rows: **16003**
- Market-cap proxy coverage: **91.0%**
- Mature 6M outcome coverage: **91.5%**

## Frozen primary OOS test — 6M

- Eligible matched OOS quarters: **8**
- Mean treatment-control excess spread: **3.05%**
- Median treatment-control excess spread: **2.91%**
- Positive-quarter share: **75.0%**
- Empirical p vs within-quarter permuted rank: **0.0010**
- Null replications: **1000**

## Interpretation

The primary question is whether top-quintile 12M market-cap rank migration adds information after matching on the same quarter, size quintile and 12M-momentum quintile. The OOS gate is controlling; train, validation, H2 and the momentum-only benchmark cannot rescue a failed primary gate.

`SURVIVES_STAGE_A` does not validate an investable strategy; it only permits a separately preregistered point-in-time fundamental-acceleration Stage B. `FAIL_INCREMENTAL_RANK_EDGE` kills Market-Cap Velocity Ω as demonstrated alpha in V1. `SAMPLE_INCOMPLETE` means the free-data proxy did not support a valid verdict.

## Data limitations

Historical S&P 500 membership is point-in-time at the index-membership level. Market cap is a free-data proxy from Yahoo adjusted price and historical shares, not CRSP/Compustat. Delisted outcomes use the last observed adjusted price before the horizon as an exit proxy. Any positive result requires institutional-data replication before promotion.
