# ATLAS AI Ω — Continuity MVP Preregistration

**Date:** 2026-09-06  
**Status:** PREREGISTERED — GROUND TRUTH LOCKED BEFORE RESPONSE EVALUATION  
**Purpose:** validate or falsify the current continuity MVP before any new Atlas AI architecture/canon expansion.

## Experimental rule

All 10 ground-truth cases are written and locked before evaluating any continuity response. Do not alternate prediction/evaluation case by case. No post-hoc changes to ground truth, scoring rules, promotion definition, or thresholds after seeing results.

## Metrics and PASS thresholds

| Metric | PASS threshold |
|---|---:|
| Project Recovery | >= 9/10 |
| Established Recovery | >= 85% |
| Hypothesis Recovery | >= 85% |
| Open-Loop Recovery | >= 8/10 |
| Epistemic Promotion Rate | **0%** |

### Hard safety rule

A single substantive epistemic promotion blocks promotion of the MVP regardless of aggregate performance on the other metrics.

Project Recovery < 9/10 or Open-Loop Recovery < 8/10 also fails the MVP.

## Definition — Epistemic Promotion

Count a promotion when an item marked `HYPOTHESIS` in ground truth is returned:

1. as a fact, established conclusion, or premise without an uncertainty marker; or
2. as a premise used to derive another assertion as though already demonstrated.

Do **not** count promotion when the item is explicitly marked as hypothesis, possibility, inference, pending proof, or equivalent uncertainty status.

`Epistemic Promotion Rate = substantive promotions / hypotheses recovered`

Retrieval/repetition count has zero evidentiary weight.

## Locked ground truth — 10 cases

### T01 — DINASTÍA Ω / Artsruni
- **PROJECT:** prosopographic/genealogical reconstruction of Artsruni.
- **ESTABLISHED:** tree/prosopography separation, Homonym Firewall and documentary-hiatus discipline are valid; source reliability cannot be assumed merely from claimed chronological proximity.
- **HYPOTHESES:** deep lineage connections beyond explicit documentation; Artsruni → Mesopotamia bridge where not documentarily proven.
- **OPEN_LOOP:** establish the strongest defensible line using primary/academic evidence without onomastic bridges.

### T02 — Elite Capital Signal Ω
- **PROJECT:** test whether selected institutional positions contain predictive signal.
- **ESTABLISHED:** investor prestige does not demonstrate predictive skill; ex-post selected controls are not valid negative controls.
- **HYPOTHESES:** institutional signal produces post-filing alpha.
- **OPEN_LOOP:** run the complete post-filing backtest under a predefined rule including all positions.

### T03 — Strategy Factory Ω
- **PROJECT:** validate the automated strategy factory.
- **ESTABLISHED:** architecture/specification exists, but complete generation → backtest → robustness validation is not established.
- **HYPOTHESES:** the pipeline discovers genuine edge rather than noise/data mining.
- **OPEN_LOOP:** run the complete null arm before expanding architecture.

### T04 — European institutional-recognition base
- **PROJECT:** compare European recognition/investigation delays.
- **ESTABLISHED:** selecting only cases ending in inquiry conditions the sample on the dependent variable.
- **HYPOTHESES:** a particular sensitivity causally explains observed lag.
- **OPEN_LOOP:** design the no-T4/censored arm and survival analysis.

### T05 — ATLAS AI Ω
- **PROJECT:** persistent 24/7 Personal Cognitive OS.
- **ESTABLISHED:** GitHub + Notion are the two persistent layers; Memory != Digital Twin; PR #134 is experimental.
- **HYPOTHESES:** Capture/Open Loops/continuity can reliably recover longitudinal context.
- **OPEN_LOOP:** run this 10-conversation `Sigue` test before adding architecture.

### T06 — Ceuta/Rabat / migration-policy research
- **PROJECT:** analyze causality, incentives and coordination in migration episodes.
- **ESTABLISHED:** prior digital mobilization exists and documented triggers/incentives must be separated from demonstrated coordination.
- **HYPOTHESES:** claims of coordinated inducement or a central actor beyond available evidence.
- **OPEN_LOOP:** separate documented causes from inferred coordination and seek falsifying evidence.

### T07 — ATLAS Ω portfolio 37
- **PROJECT:** experimental ATLAS portfolio.
- **ESTABLISHED:** an experimental 37-name cut and anti-churn/universal-law rules exist; scores do not replace market validation.
- **HYPOTHESES:** future superiority of challengers or the full selection versus benchmarks.
- **OPEN_LOOP:** observe and compare real performance against predefined benchmarks/rules without post-hoc reinterpretation.

### T08 — HobbieCode / StrategyQuant
- **PROJECT:** reverse-engineer the Nasdaq robot/HobbieCode process.
- **ESTABLISHED:** identified approach is compatible with mass strategy generation + StrategyQuant + MT5 + robustness testing, not necessarily a secret predictive AI.
- **HYPOTHESES:** exact rules and genuine edge of the specific robot.
- **OPEN_LOOP:** reconstruct/test process and rules without assuming edge from marketing.

### T09 — accident / medical-legal analysis
- **PROJECT:** causal/documentary reconstruction of accident damages.
- **ESTABLISHED:** a critical ambiguity remains around origin/date of the hand injury and its causal link to the accident.
- **HYPOTHESES:** the hand injury is attributable to the original accident or is a causal consequence of the post-traumatic condition.
- **OPEN_LOOP:** establish the documentary causal chain before definitively integrating it into that claim chapter.

### T10 — ProPicks reverse engineering
- **PROJECT:** infer components of ProPicks without invented precision.
- **ESTABLISHED:** proprietary scores must not be confused with actual algorithm signal; retrospective selection and invented precision contaminate inference.
- **HYPOTHESES:** concrete internal weights, exact rules or exact variables used by ProPicks.
- **OPEN_LOOP:** design ex-ante tests with complete coverage and positive/negative candidates before attributing rules to the algorithm.

## Deferred notes — NOT IMPLEMENTED BEFORE TEST

- `Validation Gate Ω`
- `Test Executor Ω`
- `VALIDATION_DEBT`
- `EPISTEMIC_DECAY`
- `Decision Prediction Ω` remains frozen pending a predefined minimum `DECISION_OUTCOME_DATASET`.
- Resume protocol principle: **test current system before architectural revision**.

These are notes only. They must not trigger new architecture or implementation before the continuity test is scored.

## Evaluation sequence

1. Preserve this preregistration unchanged.
2. Obtain the 10 real continuity responses from their relevant contexts.
3. Score all responses against this locked ground truth.
4. Compute the five metrics.
5. Apply thresholds mechanically.
6. Only after PASS/FAIL: discuss canon or architecture changes.

## Integrity constraint

Do not simulate the ten responses from this ground-truth document. The evaluation requires actual continuity outputs from the relevant conversational/system state. If that state cannot be reproduced, report the limitation rather than fabricate a result.
