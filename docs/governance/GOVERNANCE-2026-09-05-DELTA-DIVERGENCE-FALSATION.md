# Governance Log Ω — Δ Divergence falsation matrix

**Date:** 2026-09-05  
**Issue:** #110  
**Status:** SHADOW_ONLY after adversarial CI; canonical independence not yet demonstrated.

## Problem

`DELTA_DIVERGENCE_OMEGA_V1` accepted `independent: true` as part of canonical eligibility. That flag is declarative and does not prove independence of evaluator lineage, model family, model instance, prompt lineage, reasoning template, evidence snapshot or upstream source dependencies.

The COHR experiment additionally used different evidence per pass, so its observed dispersion mixed reasoning disagreement and information disagreement. It is permanently classified as `Δ_PROXY`, not canonical Δ.

## Δ v1.1 assurance states

- `MEDIBLE`: no blocking or shadow independence finding remains and independence is evidenced by an authority outside the common orchestration domain. Only this state may feed Core Confidence.
- `SHADOW_ONLY`: raw dispersion may be retained diagnostically but `D_Ω` is not canonical and cannot modify Core Confidence.
- `NO_MEDIBLE`: blocking falsation finding or invalid common-evidence preconditions. No canonical or confidence use.

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

CI passed the executable D1–D10 matrix. That proves the firewall implementation behaves as specified; it does not prove the existence of independent evaluators.

## Independence rule

Distinct evaluator IDs are necessary but insufficient. `independent: true` never proves independence by itself.

A lineage envelope and `independenceAttestationId` are also not sufficient when the same orchestrator can mint all of them. An attestation controlled by the same authority as the evaluation is a self-assertion, not external evidence.

Canonical `MEDIBLE` therefore remains unavailable to same-orchestrator multi-pass runs until ATLAS can obtain execution receipts or attestations from genuinely separate authority domains.

A shared model instance is a hard failure. Shared model family, reasoning template or identical upstream provider set are common-mode risks and degrade to SHADOW. Shared prompt lineage is a hard failure.

All evaluators must operate on the same aligned evidence graph and identical frozen evidence snapshot hash. Otherwise observed dispersion mixes `D_razonamiento` and `D_información`.

## Dimension integrity

Per-dimension disagreement requires complete dimension coverage for canonical use. Missing dimensions create cherry-picking risk. A dimension observed in fewer than two-thirds of passes is blocking; any incomplete coverage degrades the overall result to SHADOW_ONLY under v1.1.

## Boundary handling

The normalized statistic `sigma / sqrt(mean*(1-mean))` is mathematically bounded for probabilities in [0,1], but its denominator becomes small close to 0 or 1. Near those boundaries, small absolute dispersion can become disproportionately salient. v1.1 therefore treats mean probability <=2% or >=98% with non-zero sigma as SHADOW_ONLY for normalized divergence; raw sigma/IQR remain descriptive.

## Core Confidence firewall

`calculateHardenedCoreConfidence` accepts only a `MEDIBLE` hardened Δ result. `SHADOW_ONLY`, `Δ_PROXY`, `SHADOW_DISPERSION` and `NO_MEDIBLE` fail closed and return no effective confidence.

## COHR retained historical result

- `Δ_PROXY`
- `D_Ω = NO_MEDIBLE`
- `SHADOW_DISPERSION = 0.149`
- `Conf_Ω = NO_CALCULABLE`
- `DisagreementAxis = QUALITATIVE_HYPOTHESIS`

The former claim that the observed disagreement was a lower bound is revoked. Correlation can compress disagreement, while adversarial role assignment can overgenerate it; the direction of bias is undetermined.

## Governance decision

Δ remains in the Kernel only as a SHADOW diagnostic boundary. It is forbidden from modulating Core Confidence until external independence is demonstrated. Future promotion to `MEDIBLE` requires a new Governance entry identifying the independent execution/attestation authorities and showing that the common-orchestrator threat is actually removed.
