# ATLAS Ω — ProPicks Inverse Classifiers Ω v1.0

Status: CANONICAL RESEARCH MODULE
Date: 2026-09-05
Branch: main

## Purpose
Infer observable decision boundaries, not proprietary code. ENTRY and EXIT are separate statistical problems.

## ENTRY_CLASSIFIER Ω
Target: P(new_entry=1 | point-in-time F1..F10, previous OUT state, regime).
Controls: eligible non-selected names, sector/market-cap stratified random controls, and single-factor rankings.

## EXIT_CLASSIFIER Ω
Target: P(exit=1 | point-in-time F1..F10, previous IN state, regime).
Control: incumbent HOLD observations. Exit evidence must not be mixed with entry negatives.

## Laws
1. Point-in-time only. No future fundamentals, prices, revisions, outcomes, or post-selection metadata may enter X.
2. Walk-forward evaluation; no random train/test split across time as primary evidence.
3. Size-blind: personal capital, current user weight, P/L, average price and membership in the user's portfolio are forbidden inputs.
4. Market cap may be used only for stratification/control, never as a familiarity advantage.
5. Evidence classes remain distinct: ProPicks-specific observations are labels/evidence; general Investing surface data are candidate explanatory features only when timestamped pre-decision.
6. n<30 INSUFFICIENT; 30–99 PROVISIONAL; n>=100 ESTABLISHED describes sample sufficiency, not proof that the proprietary algorithm has been recovered.
7. Marketing-selection bias, survivorship, corporate actions and incomplete historical snapshots must remain explicit falsifiers.
8. F1–F10 clone weights are not rewritten from inverse-classifier coefficients. The inverse model is a challenger/research signal until validated out-of-sample.
9. ATLAS Hard Gates retain veto authority.
10. No claim of access to or exact reconstruction of Investing.com's proprietary ProPicks model.

## Integration
Executable: `src/atlas/algorithm/propicks-inverse-classifiers-omega.ts`
Tests: `src/atlas/algorithm/propicks-inverse-classifiers-omega.test.ts`
Evidence: `src/atlas/evidence/investing-observable-surface-seed-2026-09-05.ts` and `src/atlas/evidence/propicks-130-evidence-2026-09-05.ts`.

The current 60% ATLAS + 40% Investing AI Clone contract remains unchanged. Inverse classifiers are diagnostic/challenger evidence until point-in-time walk-forward validation demonstrates incremental predictive value.
