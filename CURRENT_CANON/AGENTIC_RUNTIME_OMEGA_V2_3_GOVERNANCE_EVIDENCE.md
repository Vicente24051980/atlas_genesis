# ATLAS Ω — Agentic Runtime Ω v2.3 Governance Evidence

**Status:** ACTIVE · IMPLEMENTED · MAIN
**Effective:** 2026-08-17
**Extends:** Agentic Runtime Ω v2.2 Evidence Bridge.
**Integrated to main:** PR #58 · squash `6b151558f36642e2b4e6b83da52948ae71a1d58d`
**Focused CI:** `Agentic Runtime Omega v2 CI` run `32071267219` · SUCCESS

## Purpose

Materialize two remaining governance requirements as executable evidence rather than narrative assumptions:

1. model/tool capabilities must be tied to an exact route fingerprint and fail closed when unknown, failed or stale;
2. GitHub + Notion dual persistence must produce an auditable receipt based on concrete identifiers, not intention.

## Capability Evidence Ω

`RouteDescriptor` fingerprints provider, base URL, model, non-credential headers/beta controls and route options. Authorization/API-key credential values are excluded from persisted route identity. Credential rotation therefore does not invalidate an otherwise identical route, while model/beta/options changes create a distinct fingerprint.

Evidence states are `confirmed`, `asserted`, `unprobeable` and `failed`. Only confirmed/asserted are trusted; asserted requires `owner_ack`. Unknown/unprobeable/failed evidence fails closed. Records may carry `valid_until`; stale evidence fails when `require_fresh=true`.

Checks support boolean-true and numeric `at_least` authorization and are scoped to the exact route fingerprint.

## Dual-Persistence Receipt Ω

`DualPersistenceRegistry` records append-only receipts containing change ID, GitHub commit SHA/path, Notion page ID/URL and timestamp/detail.

Mechanical state:

- both concrete IDs → `COMPLETE`;
- GitHub only → `GITHUB_ONLY`;
- Notion only → `NOTION_ONLY`;
- neither → `INCOMPLETE`.

`require_complete(change_id)` fails unless the latest receipt is COMPLETE. The registry never claims connector writes from intention alone.

## Durable concurrency

Capability and persistence registries share `DurableAgenticLedger`. Read paths refresh durable state before selecting the latest event so another process's completed write is not hidden by a stale in-memory view.

## API

Protected router: `api/agentic_governance.py` under `/v1/agentic-omega/v2/governance`.

Endpoints:

- `GET /capabilities`;
- `POST /capability-evidence`;
- `POST /capability-check`;
- `POST /sync-receipts`;
- `GET /sync-receipts/{change_id}`.

Governance write endpoints use `ATLAS_AGENT_CONTROL_TOKEN`. Safe route responses contain no credential header values.

## Security invariants

- credential values are never persisted in capability route identity;
- write endpoints require agent control authorization;
- unknown capability never authorizes;
- stale capability does not authorize when freshness is required;
- owner assertion requires explicit owner acknowledgement;
- one-destination persistence cannot be reported as COMPLETE.

## Validation

GitHub Actions `Agentic Runtime Omega v2 CI` run `32071267219` completed `SUCCESS` on head `390667093b3a046af212d28b873a38275d20dc52`. The accumulated suite reran v1/v2/v2.1/v2.2 invariants and added route fingerprint, capability freshness/status/source, secret non-persistence, dual-persistence and governance API tests.

## Integration record

- Branch: `agent/agentic-runtime-omega-v2-governance-receipts`.
- PR #58: merged to `main` on 2026-08-17.
- Squash commit: `6b151558f36642e2b4e6b83da52948ae71a1d58d`.
- Focused CI run: `32071267219` = SUCCESS.
- Governance runtime/API: MAIN.
- GitHub + Notion dual persistence: completed in the same work session.

## Invariants preserved

No majority voting. Falsifiers Ω absolute veto. External evidence remains candidate-only until admitted. Missing evidence is not positive evidence. `READY_FOR_EXECUTION_GATE` remains separate from BUY/SELL and broker execution. Evolution remains proposal-only. CORE-00 remains frozen.

## Active architecture after v2.3

`Agent Infrastructure Ω → EvidenceEnvelope candidates → Evidence Bridge v2.2 → typed observations → v2.1 hardened workers/evidence/recovery → Contradiction Graph → Evidence Director → Falsifiers Ω → OutcomeReceipt → separate execution gate → forecast settlement/calibration`

Cross-cutting governance:

`Capability Evidence Ω exact-route fail-closed checks + DurableAgenticLedger + Dual-Persistence Receipt Ω`.
