# ATLAS Ω — 80+ UNIVERSE AUDIT PROTOCOL

**Date:** 2026-09-06  
**Status:** ACTIVE / PREREGISTERED AUDIT  
**Universe:** `ATLAS_CORE_650_RAW_490_UNIQUE_487_ENTITY_2026-09-06`

## Objective
Audit every canonical ATLAS economic entity whose fresh Point-Zero screening score is **>=80/100**. The purpose is to turn the high-score tail of the 487-entity universe into a durable, source-backed research registry rather than repeatedly rediscovering the same companies in separate chats.

## Critical rule
`OLD_SCORE != CURRENT_VERIFIED_SCORE`.

Historical ATLAS scores, portfolio membership, fame, market cap, guru ownership and previous conviction do not qualify a company for the 80+ registry. Eligibility requires a fresh score produced under one frozen Decision Frame and the current canonical scoring rules.

## Stage 0 — full-universe screening
1. Start all 487 canonical entities at Point Zero.
2. Apply T0 Anti-Megacap Discovery Gate and current hard gates.
3. Score all entities under one frozen scoring version and one data cutoff.
4. Preserve every score, including <80, for denominator and reproducibility.
5. Create the audit cohort only after the complete screening is frozen.

`AUDIT_COHORT = { entity | fresh_ATLAS_score >= 80 }`

No manual additions to the 80+ cohort.

## Stage 1 — evidence audit for every 80+ entity
Each entity receives an individual audit record containing:
- canonical entity and ticker(s);
- fresh ATLAS score and score version;
- data cutoff and audit timestamp;
- business-quality evidence;
- revenue / EPS / FCF trajectory;
- margins and per-share economics;
- balance-sheet and financing quality;
- ROIC / capital efficiency where economically meaningful;
- backlog / ARR / installed base / volumes as sector-appropriate;
- valuation and implied 3–6Y expected return;
- revisions / expectation gap;
- moat and disruption risk;
- permanent-loss risk;
- tail risk;
- structural volatility risk;
- factor exposures and correlated-risk cluster;
- catalysts;
- explicit falsifiers;
- strongest competitor for capital;
- bull / base / bear thesis;
- source provenance and evidence grade;
- UNKNOWN fields explicitly preserved.

## Stage 2 — score challenge
The audit must try to **lower** the score, not defend it.

For every 80+ entity ask:
1. Which input is most likely overstated?
2. Which evidence is stale, secondary or non-point-in-time?
3. Is growth cyclical being mistaken for structural growth?
4. Is valuation relying on heroic terminal assumptions?
5. Is FCF distorted by SBC, working capital, customer financing, capitalized costs or acquisitions?
6. Is balance-sheet risk hidden by adjusted metrics?
7. Does AI / infrastructure / defense / healthcare narrative contaminate the score?
8. Does the thesis survive removal of company fame and investor authority?
9. What evidence would force score <80?
10. Which lower-scored company could beat it in Competition for Capital Ω?

## Audit outcomes
- `A80_VERIFIED` — audited score remains >=80 with adequate evidence.
- `A80_DOWNGRADED` — audit pushes score below 80.
- `A80_PROVISIONAL` — >=80 plausible but material evidence is UNKNOWN/incomplete.
- `A80_FALSIFIED` — hard contradiction/falsifier invalidates the thesis.
- `A80_STALE` — evidence cutoff no longer sufficient.

Only `A80_VERIFIED` is eligible for the durable verified 80+ set.

## Evidence standard
Prefer primary sources: filings, earnings releases, investor presentations, regulatory disclosures and official company materials. Secondary reporting may corroborate but should not silently replace missing primary evidence.

Every quantitative claim must carry source date and provenance. Conflicting definitions must be reconciled rather than averaged.

## Portfolio firewall
`SCORE >= 80 != PORTFOLIO_ENTRY`.

The 80+ registry is a research-quality universe, not the portfolio. After verification, companies still compete through valuation, expected return, risk, portfolio-level marginal utility, Competition for Capital Ω and Falsifiers Ω.

No minimum or maximum number of 80+ names is imposed.

## Persistence architecture
### GitHub
- `research/universe_audit/80_plus/index.csv` — machine-readable registry.
- `research/universe_audit/80_plus/<TICKER>_AUDIT.md` — one evidence audit per entity.
- `research/universe_audit/80_plus/score_snapshot_<DATE>.csv` — complete 487-entity score denominator.
- `research/universe_audit/80_plus/changelog.md` — upgrades, downgrades and evidence refreshes.

### Notion
A mirrored 80+ audit registry under Atlas Financiero Ω with one row/page per audited entity and fields for score, status, cutoff, confidence, expected return, risk, falsifier, strongest challenger and GitHub provenance.

## Data-quality gates
Before publication:
- entity/ticker deduplication verified;
- score version identical across cohort;
- same cutoff convention;
- no missing score components silently imputed;
- no duplicate evidence counted twice;
- no 13F/guru signal converted into company score;
- no current holding or P/L input;
- UNKNOWN materially reduces confidence;
- complete 487 denominator retained.

## Re-audit triggers
Re-audit an A80 entity when any occurs:
- earnings / material filing;
- guidance change;
- major acquisition/divestiture;
- capital raise / leverage regime change;
- valuation move large enough to change expected return materially;
- hard falsifier event;
- canonical scoring-model change.

## Required final outputs
1. complete 487 score snapshot;
2. count and distribution of >=80 entities;
3. verified 80+ ranking;
4. downgraded/falsified list with reasons;
5. top Competition-for-Capital duels;
6. factor concentration map of the 80+ cohort;
7. portfolio frontier separately from the 80+ research registry.

## Canonical principle
> **80 points buys an audit, not a portfolio slot.**
