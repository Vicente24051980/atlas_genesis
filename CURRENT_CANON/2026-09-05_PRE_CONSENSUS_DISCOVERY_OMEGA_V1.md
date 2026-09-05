# ATLAS Ω — Pre-Consensus Discovery Ω v1.0

Date: 2026-09-05
Status: ACTIVE_SHADOW_OOS_REQUIRED once merged.
Parent governance: Open-Source Quant AI Ω v1 + Statistical Backtest Firewall Ω + Model Learning Governance Ω.

## Mission

Find improving businesses before broad market recognition without confusing obscurity with value. The engine is a research-priority layer, not a structural score engine and not a trade-authority layer.

## External ideas absorbed

- Assay-style trajectory: measure direction of ROIC, margins, FCF, leverage, per-share economics and growth acceleration rather than static quality alone.
- Stocksera-style attention: separate analyst/news/search/social attention from business quality.
- Alternate-alpha discipline: no signal promotion without out-of-sample validation, multiple-testing control and cost-aware evidence.
- Quantamental feature-challenger pattern: external features challenge ATLAS; reputation does not grant authority.
- Institutional-recognition gap: distinguish ATLAS conviction from institutional ownership/coverage saturation.

These are idea-level inspirations. ATLAS owns the implementation and governance. External repository outputs are never canonical facts or automatic recommendations.

## Constitutional boundaries

1. T0 Anti-Megacap Discovery Gate remains upstream and cannot be bypassed.
2. Market cap, fame, index membership and current personal capital contribute zero to this engine.
3. Attention cannot rescue a failed Quality Gate, Expected Return Gate or Falsifier Veto.
4. Low attention is never alpha by itself.
5. Direct ATLAS structural-score delta is exactly 0 in v1.0.
6. The shadow score may prioritize research only.
7. Capital-Blind Portfolio Selection and endogenous N retain sole portfolio-membership authority.
8. Promotion requires Statistical Backtest Firewall + Model Learning Governance approval using point-in-time, survivorship-safe, look-ahead-safe, walk-forward out-of-sample evidence.

## Components

### Fundamental Trajectory Ω

Tracks direction across seven dimensions:
- ROIC delta
- gross-margin delta
- FCF-margin delta
- net-debt/EBITDA delta
- diluted-share-count delta
- revenue-growth acceleration
- EPS-growth acceleration

Debt reduction and share-count reduction are improvements. Leverage growth and dilution are deterioration.

### Attention Gap Ω

Attention level is built from normalized percentiles of analyst coverage, news attention, search attention and social attention. Attention Gap = 100 - Attention Level.

### Institutional Recognition Gap Ω

Institutional Recognition is independently normalized. Institutional Recognition Gap = 100 - Institutional Recognition.

### Recognition Velocity Ω

Measures whether attention, coverage and institutional recognition are beginning to accelerate. It is diagnostic and cannot establish investability.

### Pre-Consensus composite

Shadow research score weights:
- 30% Fundamental Trajectory
- 20% Expectation Gap
- 15% Catalyst Evidence
- 15% Valuation Opportunity
- 10% Attention Gap
- 5% Institutional Recognition Gap
- 5% Recognition Velocity

The design intentionally gives 80% of the shadow score to business/economic evidence and only 20% to recognition variables.

## States

- PRE_CONSENSUS_CANDIDATE: improving economics + meaningful expectation gap + low recognition after all hard gates pass.
- EARLY_RECOGNITION: valid candidate where recognition is already building.
- CONSENSUS_SATURATED: analyst/institutional recognition is already high; no obscurity premium is inferred.
- FUNDAMENTALS_INSUFFICIENT: quality/ER/falsifier boundary blocks research priority regardless of attention.
- EVIDENCE_PENDING: fail-closed when required point-in-time evidence is missing or malformed.

## Falsifiers

The hypothesis is rejected or kept in SHADOW if any of the following holds:
- pre-consensus labels do not produce positive net OOS alpha after realistic costs;
- RankIC/ICIR fails the existing Statistical Backtest Firewall;
- effect disappears after neutralizing size, sector, value, quality and momentum;
- signal is dominated by survivorship, look-ahead or stale-attention data;
- low-attention companies systematically underperform once fundamental quality is controlled;
- recognition variables are redundant and add no incremental predictive information.

## Acceptance criterion

The engine is considered better than the prior ATLAS state only when it demonstrates incremental out-of-sample information or measurably improves research lead-time without degrading portfolio risk/return. Until then it remains ACTIVE_SHADOW_OOS_REQUIRED.
