# ATLAS Ω — Δ Divergence Falsation Ω v1.1

**Date:** 2026-09-05  
**Status:** CANDIDATE pending CI and merge.

Δ measures disagreement. It does not decide truth, quality, valuation, admission, allocation or execution.

## Canonical eligibility

`independent: true` is not evidence of independence.

A canonical Δ result now requires an auditable lineage envelope per pass:
- evaluator ID;
- model family;
- model instance;
- prompt lineage;
- reasoning template;
- aligned evidence graph;
- frozen evidence snapshot hash;
- upstream provider IDs;
- independence attestation ID.

## States

- `MEDIBLE`: canonical divergence may be computed and may feed Core Confidence.
- `SHADOW_ONLY`: descriptive raw dispersion only; cannot feed Core Confidence.
- `NO_MEDIBLE`: no canonical divergence.

## Hard failures

- fewer than three passes;
- declarative independence without attestation;
- duplicate evaluator;
- shared model instance;
- shared prompt lineage;
- evidence graph mismatch;
- evidence snapshot mismatch;
- numerical near-duplicate pass;
- severe dimension undercoverage;
- invalid lineage.

## Shadow degradations

- shared model family;
- shared reasoning template;
- identical upstream provider sets;
- incomplete dimension coverage;
- non-zero divergence with mean probability at <=2% or >=98%, where normalized divergence is boundary-sensitive.

## Core Confidence firewall

Only hardened `MEDIBLE` Δ can enter Core Confidence. `SHADOW_ONLY`, `Δ_PROXY`, `SHADOW_DISPERSION` and `NO_MEDIBLE` return no effective confidence.

## Falsation matrix

D1–D10 are executable tests, not narrative checks. The contract remains candidate until CI demonstrates that each attack fails closed as specified.
