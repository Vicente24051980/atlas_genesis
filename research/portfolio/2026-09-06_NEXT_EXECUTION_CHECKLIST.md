# ATLAS Ω — Next Execution Checklist

Date: 2026-09-06
Status: ACTIVE_EXECUTION_CHECKLIST

Order matters. Do not skip forward to a new portfolio list.

1. Freeze structural universe authority: use either core 487 or explicit core+VRT 488. Current target for research: 488.
2. Build homogeneous PIT 488 matrix under `2026-09-06_PIT_488_COMPLETENESS_CONTRACT.md`.
3. Resolve structural risk-unit semantics under `2026-09-06_STRUCTURAL_SIZING_RISK_UNIT_PREREG.md`.
4. Validate hard gates/falsifiers using the same cutoff.
5. Run endogenous selection from Point Zero; persist full frontier and marginal ledger.
6. Repeat order-perturbed run 100 times; require identical portfolio hash/N.
7. Develop sizing research arms only after risk units are frozen.
8. Walk-forward/OOS test sizing versus equal weight, inverse vol and min variance.
9. Activate `STRUCTURAL_SIZING_AUTHORITY.canonicalReady` only after preregistered validation passes.
10. Re-run selection + sizing on one frozen snapshot.
11. Publish only if state is `CANONICAL_READY`; retain `globalOptimalityProven=false` unless a real global proof exists.
12. Compare resulting portfolio to current 27 only after selection; overlap is an audit output, never an input.

Execution principle:
`MEASURE FIRST -> FREEZE INPUTS -> RUN -> FALSIFY -> RE-RUN -> ONLY THEN PUBLISH`.
