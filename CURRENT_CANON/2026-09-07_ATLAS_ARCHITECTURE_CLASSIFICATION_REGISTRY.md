# ATLAS Ω — ARCHITECTURE CLASSIFICATION REGISTRY

**Date:** 2026-09-07  
**Status:** `CURRENT / CANONICAL GOVERNANCE REGISTRY`  
**Authority:** human-ratified consolidation D-1…D-7

## Default-deny rule

A named ATLAS object has **zero architectural authority by default**.

A suffix such as `Ω`, `ENGINE`, `CANONICAL`, `FROZEN`, `GATE`, `LAW`, `RADAR`, `SCORE`, `FIREWALL`, `LEDGER` or `PROTOCOL` does not confer authority.

Every object must resolve to exactly one class:

- `CANONICAL_ENGINE`
- `RESEARCH_FAMILY`
- `SHADOW_SIGNAL`
- `HARD_GATE`
- `STRESS_TEST`
- `EVALUATION_TEST`
- `HYPOTHESIS_GENERATOR`
- `DOCUMENTATION_ONLY`
- `REDUNDANT`
- `REJECT`
- `UNCLASSIFIED_PENDING_REVIEW`

`UNCLASSIFIED_PENDING_REVIEW` has zero score, ranking, membership, execution and canon-write authority.

## The only canonical engines

| ID | Engine | Unique responsibility |
|---|---|---|
| E1 | EVIDENCE Ω | what is known, provenance, PIT, identity, semantic alignment |
| E2 | ASSESSMENT Ω | what valid aligned evidence supports |
| E3 | GATE Ω | binding boolean/conditional vetoes with evidence |
| E4 | DECISION Ω | capital/action state and opportunity cost |
| E5 | CONTROL Ω | permissions, governance, policy, revocation, persistence, shutdown |
| E6 | ASSURANCE Ω | independent evaluation, harness, frozen tests, auditability |

`R0 RESEARCH Ω` is a substrate, not an engine.

## Host-engine rule

Legacy modules may remain executable, but they must be interpreted as **functions hosted by E1–E6**, never as seventh/eighth/etc. engines.

Examples:

- ingestion / source hierarchy / PIT / provider quorum / identity resolution → `E1`
- business quality / valuation / expected return / expectation gap / owner economics / revision signals → `E2`
- Hard Gates / Falsifiers / Replacement Firewall / approval preconditions → `E3`
- portfolio utility / allocation / sizing / entry timing / action states → `E4` (selection clean vs execution downstream remains separated)
- Policy Engine / Governance / Capability Registry / permissions / scheduling / shutdown / security → `E5`
- backtests / Quality Gate / negative controls / Economic Archaeology / calibration harness → `E6`

## Ratified research taxonomy

- `P-I DÓNDE VA EL CAPITAL`
- `P-II QUIÉN CAPTURA EL VALOR`
- `P-III CÓMO SE TRANSMITE EL RÉGIMEN`

Economic Archaeology = E6 method.
World Lab / Real-World Intelligence = `RESEARCH_FAMILY / LIQUID / P2`, zero decision authority until measurable capability exists.

## Explicit reclassifications

- `Λ Learning Ω` → `HYPOTHESIS_GENERATOR`; no persistence/canon write/promotion authority.
- `Productivity Capture Gate Ω` → `SHADOW_SIGNAL`; canonical semantic name should be `PRODUCTIVITY CAPTURE SIGNAL Ω` when touched next.
- `Breadth Rotation Ω` → `SHADOW_SIGNAL / DISCOVERY_ONLY`; direct score weight = `0%`.
- `Strategic Criticality` → separate reported assessment axis; never a Point-Zero scale bonus.
- `Vicente Model` → protected data object under E5 permissions; not an engine and not a research family.
- `Economic Archaeology` → E6 validation method; not an independent engine.

## Gate unification

There is one gate mechanism: E3.

Every gate rule has at minimum:

`RULE_ID | VERSION | INPUT_EVIDENCE | PASS/FAIL/CONDITIONAL | CONSEQUENCE | OWNER | EFFECTIVE_FROM | SUPERSEDES`

A gate is never a number and never adds points.

## Research/signal/score separation

`RESEARCH → SIGNAL → SCORE → GATE → PORTFOLIO_SELECTION → EXECUTION`

Forbidden leaks:

1. Research changing score without a promoted versioned signal.
2. Gate becoming a bonus/partial score.
3. Stress test presented as forecast or ranking input.
4. Synthetic/simulated case counted as real evidence.

## Synthetic evaluation namespace

Synthetic cases must use `SIM-*`. Real resolved cases may use `AI-*` or a successor real-case namespace. Aggregates used for Quality Gate must declare their namespace and MUST NOT mix synthetic and real cases.

The historical thread that used `AI-2026-0001…` for simulated examples remains provenance, but those identifiers have **zero real-case count authority**.

## Logical-object exclusivity

For each logical object, exactly one authority may be `CURRENT/FROZEN`.

Current known authorities:

- architecture → this registry + ratification document + kernel registry v4.0.0
- financial selection prompt → `docs/canon/ATLAS_OMEGA_MASTER_PROMPT_CANONICAL.md`
- selection universe → `ATLAS_CORE_650_RAW_490_UNIQUE_487_ENTITY_2026-09-06`
- operational portfolio snapshot → `CURRENT_CANON/2026-09-06_ATLAS_CURRENT_OPERATIONAL_PORTFOLIO_27.md`
- research watchlist/queue → `CURRENT_CANON/WATCHLIST_OMEGA.md`, explicitly non-selection authority
- official investment horizon → `3–6 years`

All incompatible predecessors are `HISTORICAL/SUPERSEDED` even if their original text still contains decorative words such as current/canonical/frozen/sealed.

## Expansion test

Before adding any new named component:

1. State `UNIQUE_CAPABILITY` in measurable terms.
2. Prove E1–E6 cannot represent it cleanly.
3. State measurable value, complexity cost and failure modes.
4. State `DELETE_IF_FAILED` criterion.
5. Assign permissions explicitly.
6. Add independent tests before promotion.

If step 2 fails: `DO_NOT_ADD`.

## Point Zero rule

No object survives because effort was invested in it.
