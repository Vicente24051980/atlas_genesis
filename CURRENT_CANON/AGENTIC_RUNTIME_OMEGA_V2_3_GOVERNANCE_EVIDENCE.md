# ATLAS Ω — Agentic Runtime Ω v2.3 Governance Evidence

**Status:** IMPLEMENTED · MERGE CANDIDATE
**Effective:** 2026-08-17
**Extends:** Agentic Runtime Ω v2.2 Evidence Bridge.

## Purpose

Materialize two remaining governance requirements as executable evidence rather than narrative assumptions:

1. model/tool capabilities must be tied to an exact route fingerprint and fail closed when unknown, failed or stale;
2. GitHub + Notion dual persistence must produce an auditable receipt based on concrete identifiers, not intention.

## Capability Evidence Ω

`RouteDescriptor` fingerprints:

- provider;
- base URL;
- model;
- non-credential headers/beta controls;
- route options.

Credential headers such as Authorization/API keys are excluded from both the fingerprint inputs persisted as evidence and the safe route identity returned by the API. Rotating a credential therefore does not invalidate an otherwise identical capability route; changing model, beta/routing headers or options creates a distinct fingerprint.

### Evidence statuses

- `confirmed` — provider metadata, local health or a probe supplied evidence;
- `asserted` — explicit owner acknowledgement;
- `unprobeable` — capability could not be established;
- `failed` — capability evidence attempt failed.

Only `confirmed` and `asserted` are trusted states. An asserted record requires source `owner_ack`. Unknown/unprobeable/failed records fail closed.

### Freshness

Capability records may include `valid_until`. When `require_fresh=true`, expired or unparsable validity fails closed. Freshness policy remains explicit at the check call site.

### Exact-route authorization

Checks support:

- boolean capability must be true;
- numeric capability must meet an `at_least` threshold.

An otherwise identical record under a different route fingerprint cannot authorize the new route.

## Dual-Persistence Receipt Ω

`DualPersistenceRegistry` records append-only receipts with:

- `change_id`;
- GitHub commit SHA;
- optional GitHub path;
- Notion page ID;
- optional Notion URL;
- timestamp/detail.

State is computed mechanically:

- both concrete IDs → `COMPLETE`;
- GitHub only → `GITHUB_ONLY`;
- Notion only → `NOTION_ONLY`;
- neither → `INCOMPLETE`.

`require_complete(change_id)` fails unless the latest receipt is `COMPLETE`.

The registry does not execute connector writes itself and therefore cannot claim synchronization from requested/intended operations.

## Durable concurrency

Capability and persistence registries share the existing `DurableAgenticLedger`. Read paths call `refresh()` when supported before selecting the latest event, preventing another process's completed write from remaining invisible because of a stale in-memory view.

## API

New protected router: `api/agentic_governance.py` under `/v1/agentic-omega/v2/governance`.

Endpoints:

- `GET /capabilities`;
- `POST /capability-evidence`;
- `POST /capability-check`;
- `POST /sync-receipts`;
- `GET /sync-receipts/{change_id}`.

Governance write endpoints use the existing `ATLAS_AGENT_CONTROL_TOKEN` gate. Capability checks and receipt reads return safe non-secret route/receipt evidence.

## Security invariants

- credential values are never persisted in capability route identity;
- write endpoints require the agent control token;
- unknown capability never authorizes;
- stale capability does not authorize when fresh evidence is required;
- owner assertion requires explicit `owner_ack` source;
- GitHub-only persistence cannot be reported as COMPLETE;
- Notion-only persistence cannot be reported as COMPLETE.

## Tests

Focused tests cover:

1. credential rotation keeps the same route fingerprint;
2. model/beta change creates a different route fingerprint;
3. unknown and failed capability evidence fails closed;
4. confirmed numeric capability is route-scoped;
5. asserted evidence requires owner acknowledgement;
6. stale capability fails a fresh check;
7. credential values are absent from persisted capability events;
8. dual persistence remains incomplete with one/no destination;
9. a later complete receipt upgrades prior partial state;
10. governance write endpoints reject an invalid control token;
11. API capability check is fail-closed on a different route;
12. API dual-persistence COMPLETE requires both concrete identifiers.

The existing Agentic Runtime v2 CI workflow is extended again so this phase cannot regress any v1/v2/v2.1/v2.2 invariant.

## Invariants preserved

No majority voting. Falsifiers Ω absolute veto. External evidence remains candidate-only until admitted. Missing evidence is not positive evidence. READY_FOR_EXECUTION_GATE remains separate from BUY/SELL and broker execution. Evolution remains proposal-only. CORE-00 remains frozen.
