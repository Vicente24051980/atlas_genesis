# ATLAS Ω — Greek Contracts Δ / Κ / Γ / Υ Ω v1.0

**Status:** ACTIVE · CANONICAL  
**Effective:** 2026-09-05  
**Issue:** #100  
**Direct Structural ATLAS score weight:** 0  
**Decision authority:** bounded by each contract; Falsifier Veto and Decision Safety Gate remain independent.

## Governance decision

The previously proposed four-contract architecture is approved with four mandatory corrections before canonical activation:

1. **Γ** separates continuous thesis-condition integrity from critical falsifiers and from freshness.
2. **Υ** consumes explicit Expected Return; `Score × Confidence × Vigencia` is prohibited as a return proxy.
3. **Δ** measures both global dispersion and per-dimension disagreement; evaluator independence is fail-closed.
4. **Κ** calibrates by claim type/horizon, adds log loss, and uses adaptive bins until sample depth supports finer calibration curves.

These corrections are now part of the contract definitions, not optional commentary.

---

# Δ — DIVERGENCE Ω

## Single question

**How much do independent evaluations of the same phenomenon disagree?**

Δ does not evaluate the company, choose the winning evaluator, compute the final Core confidence by itself, admit/exclude positions or issue BUY/SELL.

## Preconditions

- at least 3 evaluator passes;
- each pass must be independently executed without seeing the other outputs;
- unique evaluator IDs;
- the same `AlignedEvidenceGraphId` for every pass;
- explicit probability and individual confidence in `[0,1]`.

If independence is doubtful, output is `NO_MEDIBLE`. A low divergence number may never be fabricated from correlated passes.

## Outputs

For probabilities `p_i`:

`D_Ω = population_std({p_i})`

`IQR_Ω = Q75({p_i}) - Q25({p_i})`

Normalized divergence:

`D_norm = D_Ω / sqrt(mean(p) * (1 - mean(p)) + ε)`

Δ also computes dispersion independently by declared dimension (for example moat, valuation, expectations, risk) and surfaces the strongest disagreement axis.

## Invariants

- D_Ω is independent of the sign or level of the mean.
- high mean conviction + high D_Ω is never reported as consensus;
- `canConclude = false` permanently;
- direct structural-score delta = 0.

## Core confidence bridge

Aggregate confidence belongs to **Core Ω**, not Δ.

Versioned policy formula:

`Conf_Ω = mean(c_i) × exp(-k × D_Ω)`

`k` is explicit, policy-versioned and provisional until Κ provides enough calibration evidence. Δ cannot silently own or tune `k`.

---

# Κ — CALIBRATION Ω · Assurance Ω

## Single question

**Do probabilities emitted by the system correspond to observed frequencies?**

Κ judges the emitter, not the company. It cannot change a score, rewrite a thesis or modify methodology directly.

## Pre-registration contract

A computable case requires, before outcome resolution:

- immutable ID;
- sealed timestamp;
- claim type;
- horizon ID;
- explicit probability;
- falsifiable resolution criterion;
- concrete resolution source;
- immutable criterion hash.

If the criterion hash changes at resolution, the case is `INVALIDATED`; it is never retrospectively reinterpreted.

## Outputs

Brier Score:

`BS = (1/N) Σ (p_i - o_i)^2`

Log loss:

`LL = -(1/N) Σ [o_i ln(p_i) + (1-o_i) ln(1-p_i)]`

Brier Skill Score is computed **per claim-type × horizon segment** against the relevant segment base rate:

`BSS_segment = 1 - BS_model,segment / BS_base,segment`

There is no universal global base rate across economically different claims.

## Sample-depth rule

- `< 50` valid resolved cases: `ACCUMULATING`;
- `>= 50`: first `VERDICT_AVAILABLE`, not proof of mature calibration;
- calibration curves use adaptive equal-count bins with a minimum observation count rather than sparse deciles;
- finer deciles are appropriate only after sufficient sample depth.

## Invariants

- Kappa never modifies the underlying model directly;
- no retroactive criterion editing;
- extreme wrong probabilities remain visible through log loss;
- all methodology changes require Governance / Model Learning review.

---

# Γ — VIGENCIA Ω

## Single question

**Are the conditions under which the thesis was issued still in force?**

Γ is not Monitor Ω, not Falsifier Veto, not Ξ and not an execution engine.

## Falsifier writing standard

Every falsifier must have:

- immutable ID;
- sealed timestamp;
- observable metric;
- explicit operator;
- numeric threshold;
- unit;
- window;
- concrete resolution source;
- weight;
- severity (`CRITICAL`, `MAJOR`, `MINOR`);
- `observable = true`;
- `causal = true`;
- `thesisRelevant = true`.

Weights sum to `1.00` for the thesis registry.

A condition can be measurable and still be invalid as a falsifier if it is not causally connected to the thesis. Ambiguous language is therefore blocked structurally rather than interpreted opportunistically.

## Three outputs that must remain separate

### 1. Continuous condition integrity

Only non-critical falsifiers enter continuous `V_Ω`:

`V_Ω = 1 - activated_noncritical_weight / total_noncritical_weight`

### 2. Critical falsifiers

Critical activation is emitted separately as `criticalActivated[]`.

A critical failure is never diluted into an average. Γ itself still does not issue a veto; the result is consumed by the independent Falsifier Veto / Decision Engine.

### 3. Freshness

Freshness is independent from V_Ω. Absence of a detected falsifier does not prove recent re-verification.

The v1 diagnostic may use an explicit policy half-life:

`Freshness = exp(-ln(2) × evidenceAgeDays / halfLifeDays)`

The half-life is policy data and may not be hidden inside Γ.

## Missing observations

A non-observed falsifier is `NOT_EVALUATED`, never `NOT_ACTIVATED`.

If any registered falsifier lacks a current evaluation, Γ returns `VIGENCIA_EVIDENCE_PENDING` and does not publish an optimistic continuous V_Ω.

---

# Υ — ALLOCATION Ω

## Single question

**Among positions already admitted by Ξ, how much capital should each receive under explicit policy constraints?**

Υ cannot decide what enters or exits the admitted set.

## Required position inputs

- admission state: `ACTIVE_ADMITTED` or `ADMITTED_RESERVE`;
- explicit Expected Return;
- effective confidence;
- optional V_Ω when currently measurable;
- tail-risk input;
- transaction-cost estimate;
- current weight;
- fractional thematic exposures in `[0,1]`;
- Structural Score may travel only as trace metadata.

## Prohibition

The following construction is forbidden:

`Expected Return proxy = Structural Score × Confidence × V_Ω`

Structural quality and expected return are different economic quantities.

## Risk-adjusted return signal

v1 uses explicit Expected Return and separately subtracts policy-weighted uncertainty/tail/cost terms. V_Ω may modulate the explicitly supplied Expected Return, but it never creates one from Structural Score.

Turnover enters as an incremental allocation friction against moving away from the existing position.

## Hard constraints

- maximum position weight;
- minimum weight for `ACTIVE_ADMITTED`;
- `ADMITTED_RESERVE` may receive zero without being excluded;
- thematic caps are hard constraints;
- no score may override a hard cap;
- Υ never relaxes a cap to force full investment.

## Fractional thematic exposure

A company is not forced into a binary IA / no-IA bucket.

For theme `T`:

`PortfolioExposure_T = Σ weight_i × themeExposure_i,T`

Thus a company with `AIExposure = 0.25` contributes only one quarter of its portfolio weight to the IA cap.

## Constraint failure

If no fully invested feasible vector exists under the declared hard constraints, Υ emits `CONSTRAINT_INFEASIBLE`.

It does not silently change the theme definition, relax the cap, exclude a position or rewrite admission state.

---

# Pipeline placement

```text
Φ₁ → Φ₂a → Φ₂b → Φ₂c ×N ──→ Δ ──→ Core Confidence Ω
                                │
Monitor Ω ─────────────────────→ Γ
                                │
Assurance Ω / resolved ledger ─→ Κ
                                │
                                ▼
                                Ξ  (admission / exclusion authority)
                                │
                                ▼
                                Υ  (weights only)
                                │
                             Execute Ω
```

Κ feeds calibration evidence into governance/Core policy review; it does not rewrite Core automatically.

Γ and model-distribution `DRIFT_GUARD_OMEGA_V1` are orthogonal:

- Γ = thesis-condition validity;
- Drift Guard = statistical/model distribution drift (PSI, KS, Wasserstein, RankIC/Brier degradation).

Neither replaces the other.

# Interaction with prior Quant AI Ω layer

- `AGENT_DISAGREEMENT_CONFIDENCE_OMEGA_V1` becomes an implementation precursor; **Δ is the canonical contract boundary** for evaluator divergence.
- `PORTFOLIO_RISK_UTILITY_RESEARCH_OMEGA_V1` remains research support; **Υ is the canonical allocation boundary**.
- `DRIFT_GUARD_OMEGA_V1` remains active for model drift and is not relabeled as thesis vigencia.
- `MODEL_LEARNING_GOVERNANCE_OMEGA_V1` remains promotion/recalibration authority.

# Decision / Governance Log entry

**2026-09-05 — Decision #100**

Approved: canonical activation of Δ / Κ / Γ / Υ with the four corrections enumerated above. The user instruction `Hazlo` following explicit review of those corrections constitutes approval to implement and register them. Any later change to formulas, k, lambdas, freshness half-life, allocation constraints or calibration gates requires a new versioned governance entry.

# Technical implementation

- `src/atlas/algorithm/greek-contracts-omega.ts`
- `src/atlas/algorithm/greek-contracts-omega.test.ts`
- `src/atlas/algorithm/atlas-primary-engine-hierarchy.ts`
- `.github/workflows/greek-contracts-omega-ci.yml`
