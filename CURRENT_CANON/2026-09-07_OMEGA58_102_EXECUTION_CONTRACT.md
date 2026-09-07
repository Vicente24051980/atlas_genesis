# ATLAS Ω — Ω58–Ω102 EXECUTION CONTRACT

Status: SHADOW-GOVERNANCE until executable tests pass.
Date: 2026-09-07.

This annex is an implementation specification, not scoring authority.

## Laws

1. Runtime authority is proven by execution/import paths, never inferred from filenames.
2. Point Zero selection is capital-blind. Current holdings, invested capital, cost basis, P/L and current weights have zero selection authority.
3. OPTIMAL_N is never a caller preference. A heuristic may return SELECTED_N but must not claim global OPTIMAL_N without a global-search proof.
4. Narrative-only variables have zero score authority unless definition, scale, observable, provenance, timestamp, reproducibility and falsifier are recorded.
5. Every backtest must be point-in-time safe. Economic period and publication timestamp are distinct. Information is usable only when publication_timestamp <= AS_OF_TIMESTAMP.
6. Restatements never overwrite the value actually available at the historical decision time.
7. Security identity is issuer/instrument based; ticker alone is insufficient.
8. Corporate actions and FX normalization are centralized concerns, not ad-hoc engine rules.
9. Company risk and knowledge uncertainty are distinct.
10. Expected return must expose uncertainty and, where possible, decompose fundamental compounding, capital return and multiple effect.
11. Portfolio selection must be challenged by dominance, Pareto, alternative-search, local-swap, seed and perturbation tests before optimality language is permitted.
12. Theoretical Point Zero selection precedes turnover/cost/tax implementation analysis.
13. Replacement requires economically material net improvement after costs; mathematical epsilon is insufficient.
14. Decisions, predictions and corrections are append-only. Silent retrospective rewrites are forbidden.

## Fail-closed statuses

ACTIVE_CONFIRMED · DEAD_CODE · GHOST_ACTIVE · DUPLICATE_IMPLEMENTATION · VERSION_CONFLICT · ORPHAN_TEST · ORPHAN_DOC · CAPITAL_BLIND_VIOLATION · NARRATIVE_ONLY · PIT_UNSAFE · SEARCH_UNSTABLE · DOMINATED_SECURITY · BLOCKED_BY_DATA.

## Evidence standard

A checkbox, document or filename is not evidence of implementation. Each Ω control is COMPLETE only when linked to executable code/tests or to an append-only machine-readable registry. Data-dependent controls remain BLOCKED_BY_DATA until suitable point-in-time data exists.
