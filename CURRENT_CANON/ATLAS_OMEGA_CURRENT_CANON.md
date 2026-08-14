# ATLAS Ω — CURRENT CANON

Status: Current canonical architecture baseline
Date: 2026-08

## CORE-00

`UO 1.1 RC1 — 30/30 Spec Frozen (Runtime Pending) — FUNCTIONAL FREEZE`

CORE-00 MUST NOT be expanded with new engines or schemas before physical runtime execution.

### Five-engine ingestion pipeline

1. HashEngine — cryptographic integrity (`CORE-HASH-v1` for text; RFC 8785/JCS for JSON).
2. StructuralEngine — contract/type/limit admissibility; `additionalProperties: false`.
3. AuthenticationEngine — provenance/signature verification: VERIFIED, UNVERIFIED -> QUARANTINED, INVALID.
4. ReferenceEngine — derivation graph coherence and DAG enforcement.
5. EpistemicEngine — reasoning, resolution state and epistemic reconciliation.

## Frozen corpus — 30/30

- L0 Happy Path: 10/10.
- L1 Ambiguous: 8/8.
- L2 Conflicting: 8/8.
- L3 Adversarial: 4/4.
  - CASE-027 -> HashEngine.
  - CASE-028 -> AuthenticationEngine / QUARANTINED.
  - CASE-029 -> ReferenceEngine / circular DAG dependency.
  - CASE-030 -> StructuralEngine / malformed schema payload.

## RFC-PEA-001 / RFC-PEV-001

Business Quality Ω and Valuation Ω remain independent of price behavior.

Pre-earnings: PEA Ω + Confidence, Expectations Gap Ω and Earnings Opportunity.
Post-event: Realized Earnings Outcome Ω, Forecast Error Ω, confirmation gates, PEV Ω and signed Gap Retention.
Purchase Priority Ω is an experimental review-order modifier, not an automatic thesis modifier.

Grade F (`Fundamental Deterioration Candidate`) MUST route to `Auditor Ω -> Thesis Falsifier Gate`; it MUST NOT automatically modify the thesis.

### TASK-PEA-001 blind freeze

Pre-event `pea_manifest_locked.json` is cryptographically sealed using RFC 8785 (JCS) + SHA-256 and is immutable/independent from later `earnings_outcome.json` and `pev_report.json` artifacts.

## Money Rotation Ω

MONEY_ROTATION Ω v1.3 is the canonical candidate layer for early capital rotation and historical dislocation detection.

Rules:

- Flow totals must use comparable, additive and non-overlapping flow metrics.
- Price-only momentum is a market sensor, never proof of canonical R3/R4.
- R3 requires multi-signal confirmation; R4 requires persistent comparable flows plus positive reaction to good news after destruction.
- R5 is the handoff to the main ATLAS discovery/scoring stack; R6 is consensus/crowding and must not be chased mechanically.
- Rotation evidence never emits a portfolio order by itself.

### AI Infrastructure Rotation Ω

`AI_INFRASTRUCTURE_ROTATION_OMEGA_v1` is registered under MONEY_ROTATION Ω for AI data-center optics, AI power/grid, industrial networking and defense connectivity beneficiaries.

Canonical rule:

`Excellent business != early rotation opportunity`.

The engine ranks companies by business quality, normalized growth, CAPEX productivity, valuation margin of safety, financial inflection, AI infrastructure purity, cash generation and balance-sheet strength, then penalizes narrative crowding and completed price discovery.

Fujikura/Furukawa application:

- Fujikura may remain a high-quality `BUY_REVIEW`, but maps to `R5_DISCOVERED_BY_ATLAS_MAIN` when the market has already discovered the AI optics story.
- Furukawa Electric can rank higher as `R4_TO_R5_RELATIVE_OPPORTUNITY` when the same AI optics demand is converting losses into profit/guidance acceleration with less mature consensus and better valuation asymmetry.

The engine rejects mixed-thesis rankings and untraceable claims.

## MARKET BOTTOM Ω / STOCK RECOVERY Ω

`CURRENT_CANON/MARKET_BOTTOM_OMEGA.md` is the canonical higher-layer module for detecting probable market/sector bottoms and high-quality single-stock recoveries.

It does **not** modify or expand CORE-00.

Canonical sequence:

`capitulation -> oversold -> divergence -> breadth improvement -> structural break`

MARKET BOTTOM Ω score weights:

- Breadth 25%.
- Capitulation / volume 20%.
- Divergences 20%.
- Price structure 20%.
- Volatility / credit / sentiment 10%.
- Relative leadership 5%.

Operational states: 0–39 RED; 40–59 WATCH; 60–69 STARTER; 70–79 BUY; 80–100 STRONG BOTTOM.

Hard gate: `BottomScore >= 75` without SMA50 recovery or a break of the prior reaction high remains **not confirmed**.

STOCK RECOVERY Ω prefers Quality Ω >=85, drawdown approximately 20–60%, positive FCF, healthy/stable ROIC, intact thesis, BottomScore >=60, positive 1M, improving 3M, SMA50 recovery, lower selling volume on retest and improving relative strength.

Canonical cross-check:

`QUALITY Ω × MARKET BOTTOM Ω × STOCK RECOVERY Ω × GREEN CONTINUITY Ω × ENTRY TIMING Ω`

Master recovery rule: the preferred recovery BUY is not the lowest-RSI stock; it is the highest-quality company whose price stops falling before its sector while the business never broke.

## MARKET TOP RISK Ω — INVIOLABLE LAW

`CURRENT_CANON/MARKET_TOP_RISK_OMEGA.md` is the canonical higher-layer risk-regime engine. It does **not** modify or expand CORE-00.

Canonical sequence:

`complacency -> positioning extreme -> breadth deterioration -> volatility divergence -> bond/credit stress -> structural price break`

### Inviolable rule

**No market-top, sentiment, seasonality, VIX, bond-yield or positioning signal may emit an automatic portfolio SELL by itself.**

Corrections are not thesis falsifiers. Tactical correction risk must be separated from structural deterioration.

Operational regimes:

- GREEN — BULL REGIME.
- YELLOW — COMPLACENCY WATCH.
- ORANGE — CORRECTION RISK; tighten ENTRY TIMING Ω / NO-CHASE.
- RED — STRUCTURAL RISK; requires independent confirmation from macro/credit AND market internals/price and triggers mandatory portfolio/falsifier audit, never indiscriminate liquidation.

Primary macro falsifier: Treasury/rates and credit stress in combination with breadth and structural price deterioration. `10Y > 4%` or any single absolute yield threshold is not sufficient by itself.

AI CAPEX rule: `Hyperscaler monetizes spare capacity != semiconductor demand collapse`. Semiconductor-demand deterioration requires multi-company confirmation through utilization, backlog/cancellations, CAPEX revisions, pricing and orders.

Canonical cross-check:

`MARKET TOP RISK Ω × MARKET BOTTOM Ω × MONEY ROTATION Ω × GREEN CONTINUITY Ω × ENTRY TIMING Ω × AI CAPEX PAYBACK Ω × QUALITY Ω`

## MACRO REGIME GOLD–BTC Ω

`CURRENT_CANON/MACRO_REGIME_GOLD_BTC_OMEGA.md` is the canonical higher-layer macro regime sensor for gold, Bitcoin, rates, dollar, credit, oil and breadth.

It classifies four regimes:

- `BROAD_LIQUIDITY_RISK_ON`
- `FLIGHT_TO_SAFETY`
- `INFLATION_GEOPOLITICAL_HEDGE`
- `MONETARY_UNCERTAINTY_MIXED`

It computes Gold Strength, Bitcoin Liquidity, Monetary Ease and Risk Transmission scores, then converts the active regime into a per-stock MacroImpact score for the canonical PORTFOLIO_35.

Allowed actions are limited to ENTRY TIMING / NO_CHASE calibration, research prioritization, dislocation handoff and tactical sizing review. Gold/BTC divergence alone can never emit an automatic BUY or SELL or modify the fixed portfolio composition.

Cross-engine flow:

`MACRO REGIME GOLD–BTC Ω -> MONEY ROTATION Ω -> HISTORICAL DISLOCATION Ω -> MARKET TOP RISK Ω -> ENTRY TIMING Ω`

Initialization on 2026-08-14: `YELLOW / MONETARY_UNCERTAINTY_MIXED` pending multi-session confirmation from credit and breadth.

## Epistemic governance

`Information Received != Admissible Evidence`.

### Simón ATLAS

Information is not filtered according to whether it confirms an existing narrative. Admission depends on evidence standards. Contradictory evidence is not degraded for being inconvenient; it raises review priority and activates falsifier evaluation.

Master axiom: "No elijas qué creer. Elige qué estándares debe superar algo antes de merecer ser creído."

### Law Ω017 — Incentives

"Las estructuras producen comportamientos más persistentemente que las intenciones."

Sequence: Ω015 Accumulation -> Ω016 Direction -> Ω017 Incentives.

Universal audit question: "¿Qué comportamiento recompensa realmente este sistema?"

## E2E-001 — higher layer

E2E-001 does NOT modify CORE-00 and does NOT create a sixth Core engine.

Flow:

`Transcript/Input -> UO 1.1 + CORE-00 Harness -> Orchestrator -> Epistemic Classification Skill -> Facts | Evidence | Hypotheses | Interpretations -> Biblioteca Atlas | Atlas Conspiraciones | Gemelo Digital -> Certified Output`

Interpretations are preserved with attribution and are not promoted to canonical evidence merely by being retained. ATLAS must be capable of preserving an idea without having to believe it.

Anti-intention rule:

`Observed conduct -> incentive structure -> motivation hypothesis -> additional evidence required`.

Gemelo Digital causal matrix:

`Demonstrated Values under conflict/cost -> Incentives -> Decisions -> Habits -> Results`.

## Next technical milestone

**Runtime Initialization**: physical materialization on disk, recalculation of real runtime hashes and execution of the frozen 30-case suite.

## Governance rule

Older Atlas documents remain historical inputs unless explicitly reconciled with this current canon. No legacy document may silently override this baseline.
