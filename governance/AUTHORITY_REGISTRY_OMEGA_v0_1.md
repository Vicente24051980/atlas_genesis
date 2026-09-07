# AUTHORITY REGISTRY Ω v0.1

Purpose: distinguish existence, validation, merge state, runtime binding and canonical authority. This registry is governance metadata; it does not grant authority by declaration.

## Allowed lifecycle
`DECLARED -> CODE_PRESENT -> TESTED -> CI_GREEN -> MERGED -> RUNTIME_BOUND -> CANONICAL_AUTHORITY`

Backward transitions are allowed on regression. Forward promotion requires evidence. `UNKNOWN` is preferred over inference.

## Required fields
- COMPONENT
- STATUS
- OWNER
- RUNTIME_AUTHORITY
- SELECTION_AUTHORITY
- DIRECT_SCORE_WEIGHT
- CAN_WRITE_CANON
- ACTIVATION_GATE
- EVIDENCE
- LAST_VERIFIED_UTC

## Initial reconciled registry — 2026-09-07

| COMPONENT | STATUS | OWNER | RUNTIME_AUTHORITY | SELECTION_AUTHORITY | DIRECT_SCORE_WEIGHT | CAN_WRITE_CANON | ACTIVATION_GATE | EVIDENCE |
|---|---|---|---|---|---:|---|---|---|
| Live Continuity Binding / PR #160 | TESTED_PARTIAL_CI | ATLAS control plane | false | false | 0 | false | real-Notion preregistered cases PASS + epistemic promotion 0 + merge + runtime binding | PR #160; continuity-mvp green; real-notion gate blocked because NOTION_API_KEY absent |
| Master Audit Guardrails / PR #169 | CODE_PRESENT_UNMERGED | ATLAS control plane | false | false | 0 | false | focused CI green + review + merge + runtime binding | PR #169 draft |
| Point Zero selector correction / PR #172 | MERGED_RUNTIME_BINDING_UNVERIFIED | ATLAS financial control plane | false | false | 0 | false | verify active selection path/runtime binding; then promote authority explicitly | PR #172 merged at 971fc4f98e3ee815bbca50968735e5e852e9b621 |
| Follow the Capital Ω | SHADOW | research | false | false | 0 | false | PIT historical OOS incremental-value validation | preregistration rule |
| New research modules (default) | SHADOW | research | false | false | 0 | false | explicit promotion record with OOS evidence | constitutional default |
| Vicente Model prediction | RESTRICTED_RESEARCH | Vicente Model | false | false | 0 | false | calibrated predictive baseline; representation-integrity enforcement | CAN_MODEL != CAN_REPRESENT |
| OpenClaw runtime | EXTERNAL_UNTRUSTED | external runtime | false | false | 0 | false | Exit Test + authority review; no identity/memory/canon dependency | coupling unknown |

## Permission invariants
- WRITE != PERSIST
- EXECUTE != DELEGATE
- WRITE != MODIFY_CANON
- CAN_PREDICT_VICENTE != CAN_REPRESENT_VICENTE
- CAPABILITY != AUTHORITY
- MERGED != RUNTIME_BOUND
- DIRECTORY_MEMBERSHIP != ACTIVE_AUTHORITY

## Fail-closed rule
If status, owner, authority, score weight or activation gate is missing or ambiguous, the component has no runtime authority, no selection authority, no canon-write permission, and direct score weight 0 until reconciled.
