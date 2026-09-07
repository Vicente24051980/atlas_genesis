# ASTRA_MASTER_AUDIT Ω — Point Zero Selector Remediation

Date: 2026-09-07
Status: PROPOSED / PR-BOUND / NOT CANONICAL UNTIL MERGED
Scope: clean portfolio membership selection only

## Trigger

During the adversarial repository audit, Astra identified a concrete contradiction between the ratified Point Zero law and `capital-blind-portfolio-selection-omega.ts`.

The selector automatically reduced marginal utility when two candidates shared `causalDrivers`. It also accepted `causalDiversificationBenefitPct` as an additive utility benefit. Both mechanisms allowed narrative/driver variety to change membership without a measured correlated-risk estimate.

## Finding F1 — shared causal labels were selection authority

Previous behavior:

`shared causalDrivers -> automatic redundancy penalty -> lower marginal utility`

This is not admissible under Point Zero.

Canonical distinction:

`shared label != measured correlated risk`

Causal-driver labels may remain diagnostics and research routing metadata. They cannot by themselves create a bonus, penalty, sector quota, factor quota or portfolio membership preference.

## Finding F2 — causal-diversification bonus was also selection authority

`causalDiversificationBenefitPct` was summed directly into candidate base utility.

That is the positive-sign version of the same constitutional error: diversity of narrative/driver exposure cannot receive standalone selection utility.

The field is retained only for compatibility/provenance and is ignored by clean selection.

## Finding F3 — generic pairwise redundancy penalty was under-specified

`pairwiseRedundancyPenaltyPct` could alter ranking without requiring provenance, methodology, covariance, common-shock evidence or any other demonstrated risk basis.

The v2.1 remediation fails closed when a caller attempts to supply this legacy policy field.

Real correlated risk remains required by canon, but must be represented through validated risk inputs / portfolio risk machinery with evidence and unit semantics. It must not be inferred from labels.

## Finding F4 — false OPTIMAL_N semantics in the greedy helper

The Capital-Blind helper is a deterministic greedy marginal heuristic. It does not prove the global combinatorial optimum of the whole-portfolio objective.

Previous output exposed:

`optimalN = selected.length`

The remediation changes semantics to:

- `selectedN` = cardinality returned by this heuristic run;
- `optimalN = null`;
- `selectionMode = GREEDY_MARGINAL_HEURISTIC`;
- `globalOptimalityProven = false`.

This is consistent with the existing structural blocker ledger, which already records global optimality as open by design for the broader deterministic local-search engine.

## Code changes

1. `src/atlas/algorithm/capital-blind-portfolio-selection-omega.ts`
   - version `2026-09-07-v2.1.0`;
   - removes automatic causal-driver overlap penalty;
   - removes causal-diversification benefit from base utility;
   - rejects generic pairwise redundancy policy authority;
   - adds explicit heuristic/global-optimality disclosure;
   - preserves personal-state invariance and hard gates.

2. `src/atlas/algorithm/capital-blind-portfolio-selection-omega.test.ts`
   - regression test: identical causal labels cannot reduce marginal contribution;
   - regression test: large causal-diversification benefit cannot improve marginal contribution;
   - regression test: generic pairwise redundancy policy fails closed;
   - regression test: helper cannot publish `OPTIMAL_N`.

3. `src/atlas/algorithm/portfolio-selection-canon-omega.ts`
   - separates endogenous cardinality objective from global-optimality claim;
   - prohibits automatic causal-label bonus/penalty;
   - requires measured/provenanced correlated risk;
   - reserves `OPTIMAL_N` terminology for certified global optimality.

4. `src/atlas/algorithm/portfolio-selection-canon-omega.test.ts`
   - locks the new constitutional invariants.

## Non-goals

This remediation does NOT:

- claim global portfolio optimality;
- close the structural PIT matrix blocker;
- close risk-unit semantics;
- supply covariance-aware sizing;
- alter the current operational 27;
- alter `OPTIMAL_N` of any historical snapshot;
- merge PR #160 or waive its real-Notion smoke requirement;
- merge PR #169 or promote its guardrails without CI/review.

## Acceptance gate

Do not merge on prose.

Require the existing `Capital-Blind Portfolio Selection Omega CI` workflow to pass the focused tests on the PR head. Any downstream TypeScript/API consumer failure must be treated as evidence of an undocumented authority dependency and fixed explicitly rather than hidden with compatibility shims that restore the prohibited behavior.
