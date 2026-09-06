# ATLAS Strategy Factory Ω — Null Arm Execution

**Run:** `ATLAS_STRATEGY_FACTORY_NULL_ARM_2026-09-06`  
**Candidate grammar:** 32 frozen rules  
**Null replications:** 500  
**Costs:** 2.0 bps one-way per exposure change  

## Real-data winner

- Winner: `MOM_120`
- Train Sharpe: 0.874
- Validation Sharpe: 0.419
- Validation excess total return vs QQQ: -48.51%
- Sealed OOS Sharpe: 1.176
- Sealed OOS excess total return vs QQQ: -78.65%

## Null calibration

- Null winners passing validation gates: 10.00%
- Null winners also passing sealed OOS gates: 2.00%
- Empirical p (validation Sharpe): 0.7385
- Empirical p (sealed OOS Sharpe): 0.0978
- Factory calibration: **NULL_FALSE_POSITIVE_RATE_ACCEPTABLE**
- Edge state: **NO_EDGE_DETECTED_VS_NULL**

## Interpretation rule

The null arm is a control on the *search process*. If randomized signal/return alignment survives the same gates too often, the factory is not calibrated even if the real-data equity curve looks attractive. `NO_EDGE_DETECTED_VS_NULL` is a valid result and blocks promotion.

## Limitations

- This is a finite frozen grammar, not the future 100k-candidate production search.
- Circular-shift null breaks signal/return alignment while preserving the observed return path shape.
- QQQ-only evidence cannot validate cross-asset or single-stock strategy families.
- Passing this harness would justify further shadow research only, never broker execution.
