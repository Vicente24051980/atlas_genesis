# ATLAS Ω — Agentic Runtime Ω · Production Status

**Effective:** 2026-08-17
**Runtime code:** COMPLETE · ACTIVE IN `main`
**Current runtime level:** v2.3 Governance Evidence
**Production deployment:** `EXTERNAL_RENDER_AUTH_BLOCKED`

## Executive state

The Agentic Runtime Ω implementation is complete in GitHub and mirrored in Notion. The production code path, deployment contract and live certification workflow are implemented and validated by CI.

The remaining production gate is external to the repository: this environment has no authenticated Render control-plane path. Production MUST NOT be described as `LIVE CERTIFIED` until the live workflow observes the required ATLAS surfaces on the same Render host.

## Completed implementation chain

- v1 · PR #52 · orchestration kernel, eight independent specialists, no-majority-vote, absolute Falsifiers Ω veto.
- v2 · PR #55 · deterministic workers, Contradiction Graph Ω, Evidence Director scoring, recovery and calibration.
- v2.1 · PR #56 · Red Team completion gate, critical provenance, temporal supersession, DurableAgenticLedger.
- v2.2 · PR #57 · candidate-only EvidenceEnvelope bridge; no prose extraction or auto-canonical promotion.
- v2.3 · PR #58 · exact-route Capability Evidence Ω and GitHub↔Notion Dual-Persistence Receipt Ω.
- deployment rescue · PR #60 · production Blueprint aligned to `atlas-genesis`, `api.app:app`, strict Mobile+Agentic live certification.
- Render API rescue · PR #61 · deploy hook/API-key/service-discovery deployment path installed.

## Deployment evidence

### Repository / CI

- PR #60 squash: `9ac6f7d3d7ed54a71a35f5befa5c108bb503f3f5`.
- Deployment-contract + cumulative Agentic CI: run `32073603662` = `SUCCESS`.
- PR #61 squash: `071d98167e04566dea52beda566605253c6279a8`.
- Render API rescue cumulative CI: run `32074786948` = `SUCCESS`.

The deployment contract proves that `api.app:app` exposes the required Mobile v2 and Agentic v1/v2.1/v2.2/v2.3 routes and that the Render Blueprint leaves Trading 212 live execution disabled.

### Live Render probe

Run `32073648477` performed 60 attempts against each known Render hostname:

- `atlas-genesis.onrender.com`;
- `atlas-genesis-api.onrender.com`.

At every attempt both required surfaces returned HTTP `404`:

- `/v1/mobile/health`;
- `/v1/agentic-omega/v2/governance/capabilities`.

Therefore the live service had not loaded the current ATLAS application after the GitHub merge.

### Render authentication evidence

The subsequent production workflow explicitly inspected its GitHub Actions secret environment and reported:

- `RENDER_DEPLOY_HOOK_URL`: absent;
- `RENDER_API_KEY`: absent;
- `RENDER_SERVICE_ID`: absent.

No Render connector/plugin is available in the current execution environment. No reusable Render credential was found in the available ATLAS project context.

This means there is no authenticated mechanism available here to mutate the external Render service.

## Automatic recovery already installed

The production workflow now supports, in order:

1. `RENDER_DEPLOY_HOOK_URL` → trigger the configured Render deploy hook;
2. `RENDER_API_KEY` + optional `RENDER_SERVICE_ID` → call Render API;
3. if service ID is absent, discover `atlas-genesis` / `atlas-genesis-api` by service name;
4. deploy the exact GitHub `GITHUB_SHA`;
5. refuse production certification until one host exposes both Mobile v2 and Agentic Governance v2.3;
6. certify Agentic v1, v2.1, v2.2, v2.3, portfolio and broker safety surfaces.

No credential value is printed or committed.

## Production certification gate

Change this status to `LIVE CERTIFIED` only after `ATLAS Mobile + Agentic Live Backend Smoke` completes `SUCCESS` for a `main` commit and confirms:

- `/v1/mobile/health` → `atlas-mobile-v2`;
- `/v1/agentic-omega/health` → durable Agentic runtime;
- `/v1/agentic-omega/v2/capabilities` → hardened v2.1 controls;
- `/v1/agentic-omega/v2/evidence-capabilities` → v2.2 candidate-only bridge;
- `/v1/agentic-omega/v2/governance/capabilities` → `2.3-governance-evidence`;
- portfolio surface is coherent;
- broker secrets are not exposed;
- broker live execution remains locked/demo unless separately and explicitly authorized.

## Required external prerequisite

Any ONE of these establishes the missing authenticated control path:

- GitHub Actions secret `RENDER_DEPLOY_HOOK_URL`; or
- GitHub Actions secret `RENDER_API_KEY` (service ID is optional because the workflow can discover it); or
- restore a functioning Render auto-deploy/Blueprint connection from this repository's `main` branch.

Until that external prerequisite exists, repository work is complete but production remains fail-closed and uncertified.
