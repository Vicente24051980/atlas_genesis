# Information / Attention Power Ω — Runtime

Executable implementation of the canonical research spec stored in `atlas-knowledge-base/02_CONOCIMIENTO/Dinastia/ELITE_NETWORK_OMEGA/`.

## Purpose
Maintain an append-only time series of digital concentration by layer and compute:
- CR1 / CR3 / CR5 / CR10
- HHI and Effective Number of Actors
- LayerPower Ω
- GIPCI Ω with uncertainty
- Vertical Recurrence Score Ω (VRS)
- System Capture Ω (SC3/5/10/20)
- concentration drift over time

## Canonical rules
1. Concentration != coordination.
2. Structural control != behavioural causality.
3. Missing data != zero.
4. Global/Western and China stacks stay separate until market-boundary comparability is demonstrated.
5. Every observation is dated and append-only. Historical rows are never silently overwritten.
6. A VRS is invalid with fewer than 3 E3+ independent layers.
7. A GIPCI is canonically valid only with >=6 valid layers and >=70% E3+ evidence mass.
8. Proxy metrics (referral traffic, normalized MAU, identified-service share) must remain labelled PROXY.

## Data layout
`snapshots/YYYY-MM-DD.json` contains a dated normalized observation set. Add a new file for each material refresh.

## Refresh protocol
A monthly GitHub Action opens a refresh issue. The researcher then:
1. checks primary/authoritative sources for every layer;
2. records new shares, source date, evidence level and residual share;
3. creates a new snapshot instead of editing the previous one;
4. runs engine/tests;
5. compares current vs previous with `concentrationDrift`;
6. publishes only material changes to Notion;
7. preserves `GLOBAL_UNIFIED_GIPCI = NO_CALCULABLE` unless comparability gates are satisfied.

## Material-change gate
Escalate for review when any of these occurs:
- |ΔHHI| >= 250 in a layer;
- |ΔCR3| >= 5 percentage points;
- a top-3 actor changes;
- a new chokepoint becomes E3+;
- an actor gains/loses an independent layer in VRS;
- GIPCI moves >=3 points;
- evidence quality drops below the canonical validity threshold.

## Baseline
The initial 2026-09-05 snapshot is a reproducible seed, not an immutable truth. Any later primary source that contradicts it supersedes the current measurement while preserving the old historical record.
