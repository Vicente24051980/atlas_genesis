# Governance Log Ω — Δ Divergence falsation matrix

**Date:** 2026-09-05  
**Issue:** #110  
**Status:** CANDIDATE pending adversarial CI.

## Problem

`DELTA_DIVERGENCE_OMEGA_V1` currently accepts `independent: true` as part of its canonical eligibility test. That flag is declarative. It does not prove independence of evaluator lineage, model family, model instance, prompt lineage, reasoning template, evidence snapshot or upstream source dependencies.

Therefore the existing contract can understate common-mode error and can manufacture apparent consensus from multiple personas or wrappers around one underlying reasoning source.

## Δ v1.1 assurance states

- `MEDIBLE`: no blocking or shadow independence finding remains. Only this state may feed Core Confidence.
- `SHADOW_ONLY`: raw dispersion may be retained diagnostically but `D_Ω` is not canonical and cannot modify Core Confidence.
- `NO_MEDIBLE`: blocking falsation finding. No canonical or confidence use.

## Falsation attacks

1. D1 — declarative independence without auditable attestation.
2. D2 — duplicate evaluator or shared model instance.
3. D3 — shared model family.
4. D4 — shared prompt lineage or reasoning template.
5. D5 — common upstream provider set.
6. D6 — graph alignment without identical frozen evidence snapshot.
7. D7 — numerical near-duplicate passes.
8. D8 — selective dimension omission / cherry-picking.
9. D9 — normalized divergence near Bernoulli boundaries.
10. D10 — fewer than three passes.

## Independence rule

Distinct evaluator IDs are necessary but insufficient. Canonical independence requires traceable lineage separation. `independent: true` never proves independence by itself.

A shared model instance is a hard failure. A shared model family is SHADOW because separate instances/prompts can still provide useful sensitivity analysis but not strongest independence evidence. Shared prompt lineage is a hard common-mode failure. Shared reasoning templates or identical upstream provider sets are SHADOW common-mode risks.

All evaluators must operate on the same aligned evidence graph and the same frozen evidence snapshot hash. Otherwise disagreement may measure changing evidence rather than evaluator disagreement.

## Dimension integrity

Per-dimension disagreement requires complete dimension coverage for canonical use. Missing dimensions create cherry-picking risk. A dimension observed in fewer than two-thirds of passes is a blocking integrity failure; any incomplete coverage degrades the overall result to SHADOW_ONLY under v1.1.

## Boundary handling

The normalized statistic `sigma / sqrt(mean*(1-mean))` is mathematically bounded for probabilities in [0,1], but its denominator becomes small close to 0 or 1. Near those boundaries, small absolute dispersion can become disproportionately salient. v1.1 therefore treats mean probability <=2% or >=98% with non-zero sigma as SHADOW_ONLY for normalized divergence; raw sigma/IQR remain descriptive.

## Core Confidence firewall

`calculateHardenedCoreConfidence` accepts only a `MEDIBLE` hardened Δ result. `SHADOW_ONLY`, proxy dispersion and `NO_MEDIBLE` fail closed and return no effective confidence.

## Governance decision rule

Δ remains Kernel-canonical only if the adversarial CI passes and the hardened wrapper becomes the required boundary before Core Confidence. If the tests expose a contradiction that cannot be resolved without unverifiable assumptions, Δ must be degraded to SHADOW rather than preserved by exception.
