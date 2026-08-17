# ATLAS Ω — Agentic Runtime Ω v2

**Status:** ACTIVE · IMPLEMENTED · MAIN
**Effective:** 2026-08-17
**Extends:** `CURRENT_CANON/AGENTIC_RUNTIME_OMEGA.md` v1.0
**Authority:** subordinate to Constitution ATLAS Ω, CORE-00, Investment Committee Ω and Falsifiers Ω.
**Integrated to main:** PR #55 · squash `e23c9352a40b34a6556a73e2ab41e360afa5d1f0`
**Focused CI:** `Agentic Runtime Omega v2 CI` run `32070044210` · SUCCESS

## Purpose

Turn Agentic Runtime Ω from a receipt/orchestration kernel into an executable evidence-processing system without allowing autonomous narrative generation, self-modification or direct trading.

The v2 runtime executes deterministic specialist workers over structured observations. It does not fabricate missing fundamentals: missing required fields produce `NOT_EVALUATED`, which is fail-closed evidence behavior.

## Runtime pipeline

`EXTERNAL/INTERNAL EVIDENCE CANDIDATES → STRUCTURED OBSERVATIONS → 8 SPECIALIST WORKERS → CONTRADICTION GRAPH → EVIDENCE DIRECTOR SCORE → AGENTIC ORCHESTRATOR → OUTCOME RECEIPT → PREDICTION RECORD → REALIZED SETTLEMENT → CALIBRATION`

Agent Infrastructure Ω (Firecrawl, MarkItDown, APIs, Mem0, n8n) may supply candidates/provenance. Its output remains non-canonical until ATLAS evidence gates accept it. `source_type=memory` is deliberately scored below primary/regulatory/company evidence.

## Eight executable workers

1. `EconomicProofWorker` — Demand → Capture → FCF → ROIC.
2. `ValuationWorker` — expected annualized return versus hurdle.
3. `CapexProductivityWorker` — incremental ROIC versus WACC plus payback.
4. `MoatWorker` — moat score and confirmed erosion.
5. `InstitutionalRotationWorker` — sponsorship/flow context only.
6. `MacroRegimeWorker` — macro regime context only.
7. `FalsifiersWorker` — independent confirmed-falsifier veto.
8. `EvidenceDirectorWorker` — source quality, provenance, freshness, confidence and contradictions.

No worker majority has authority. The existing AgenticOmegaOrchestrator remains the terminal governance layer.

## Structured observation contract

Each `MetricObservation` preserves:

- metric key;
- value;
- source;
- observed_at;
- confidence;
- source_type;
- freshness_days;
- unit;
- explicit polarity (-1/0/+1);
- metadata/materiality.

The worker layer never performs semantic invention to fill absent metrics.

## Contradiction Graph Ω

`ContradictionGraph` is intentionally conservative. It records conflicts only when observations with the same evidence key contain explicitly opposing polarity or incompatible boolean values. It does not infer textual contradiction from wording.

Material contradictions add a stronger penalty inside Evidence Director Ω. The contradiction record preserves keys, sources, values and reason.

## Evidence Director Ω scoring

The deterministic score combines:

- 35% source quality;
- 25% provenance completeness;
- 20% freshness;
- 20% stated confidence;
- contradiction penalties.

Source-quality defaults are transparent and configurable in code. Primary/regulatory sources receive the maximum default weight; memory and unverified evidence receive sharply lower weight.

Default state boundaries:

- `<40` or multiple material contradictions → `REJECT`;
- `<70` or unresolved contradiction → `WATCH`;
- otherwise → `PASS`.

These are runtime evidence-quality defaults, not immutable valuation or portfolio thresholds.

## Deterministic domain defaults

The specialist workers contain explicit configurable defaults so behavior is reproducible. They are not treated as universal investment truths and may be overridden through the per-specialist `policies` packet while remaining subject to canon.

Examples include minimum ROIC, expected-return hurdle, WACC/payback gates, moat score, institutional flow score and macro support score. Missing required structured metrics remain `NOT_EVALUATED` rather than being guessed.

## Replay and recovery

v2 adds `RUN_CONTEXT_SNAPSHOT` to the same append-only SHA-256 ledger used by v1.

`RunRecovery` can:

- inspect historical run state;
- reconstruct unfinalized v2 runs;
- restore already received specialist results;
- verify reconstructed context against the original context hash;
- refuse unsafe recovery for pre-snapshot runs or finalized runs.

No historical event is rewritten.

## Predicted → realized calibration

`CalibrationEngine` adds append-only events:

- `PREDICTION_RECORDED`;
- `PREDICTION_SETTLED`.

Settlement calculates signed error, absolute error, absolute percentage error when defined, and directional hit when a baseline exists. Aggregate calibration reports count, MAE, MAPE and directional accuracy by metric.

This creates a measurement loop without retroactively changing the original prediction.

## API v2

Mounted alongside v1 under `/v1/agentic-omega/v2` capabilities:

- `GET /capabilities`;
- `POST /run-workers`;
- recoverable run start/result/finalize/status/recover routes;
- prediction record/settlement routes;
- calibration summary route.

The v2 API reuses the v1 engine ledger and lock. It does not create a second audit chain.

## Non-negotiable invariants preserved

- Falsifiers Ω absolute independent veto.
- No majority voting.
- FACT provenance rules remain enforced when observations become assertions.
- Missing evidence is not manufactured.
- External evidence is not automatically canonical.
- `READY_FOR_EXECUTION_GATE` is not BUY/SELL.
- Broker execution stays outside the committee.
- Evolution remains proposal-only; no self-modification.
- CORE-00 remains untouched/frozen.

## Validation

Dedicated workflow: `.github/workflows/agentic-runtime-v2.yml`.

GitHub Actions run `32070044210` completed `SUCCESS` on head `dd910fce6011e279fdb36fa5dca7fcb4ae819789`. The focused job ran:

- original `runtime/agentic_omega/test_orchestrator.py` v1 invariants;
- `runtime/agentic_omega/test_v2.py` workers/contradictions/calibration/recovery;
- `api/test_agentic_omega_v2.py` operational API tests.

The local pre-publication v2 runtime suite was 6/6 PASS; GitHub Actions independently completed the combined focused suite successfully.

## Integration record

- Branch: `agent/agentic-runtime-omega-v2`.
- PR #55: merged to `main` on 2026-08-17.
- Squash commit: `e23c9352a40b34a6556a73e2ab41e360afa5d1f0`.
- Focused CI run: `32070044210` = SUCCESS.
- Runtime/API/canon: MAIN.
- Notion mirror: required by `GITHUB_NOTION_SYNC_LAW.md` and synchronized in the same work session.

## Next admissible extensions

- provider adapters that transform governed evidence candidates into structured observations without auto-canonical promotion;
- richer contradiction graphs with explicit evidence IDs and temporal supersession;
- calibration by specialist, horizon and regime;
- durable multi-process locking/storage for the append-only ledger;
- scheduled calibration checkpoints;
- worker-specific source requirements and stronger Falsifiers review-completeness gates.

Any extension weakening provenance, fail-closed behavior, no-majority-vote, independent Falsifiers veto, execution separation or proposal-only evolution is invalid unless explicitly superseded by the owner.
