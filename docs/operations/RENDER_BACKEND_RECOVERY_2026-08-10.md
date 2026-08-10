# ATLAS Ω — Render Backend Recovery Log

Date: 2026-08-10
Repository: Vicente24051980/atlas_genesis
Branch deployed/tested: `feat/atlas-terminal-phase1`
Render service: `atlas_genesis`
Public backend base URL: `https://atlas-genesis.onrender.com`

## Incident

Render initially failed deployment because the configured Root Directory was `Backend`, while the repository directory is `backend` (case-sensitive deployment environment).

After correcting the Render Root Directory to `backend`, deployment completed successfully. Render logs confirmed:

- Node.js runtime detected from `backend/package.json`.
- `atlas-omega-backend@0.3.0` started with `node server-v3.mjs`.
- Backend listening on `0.0.0.0:10000` (Render-assigned PORT).
- Build successful.
- Service live.
- Primary URL assigned: `https://atlas-genesis.onrender.com`.

## Root URL NOT_FOUND diagnosis

Opening the bare backend URL returned:

```json
{
  "error": "NOT_FOUND"
}
```

This did **not** mean that Render or the backend was down. The HTTP server had explicit handlers for `/health` and `/v1/...`, but no handler for `/`. Therefore the generic final 404 response was correctly reached for the root path.

## Correction

The backend was updated so `/` returns a machine-readable ATLAS service status instead of `404 NOT_FOUND`.

Expected root response after the updated deployment:

```json
{
  "ok": true,
  "service": "ATLAS Ω Backend",
  "status": "ONLINE",
  "version": "0.3.1"
}
```

The existing API contract remains intact. Relevant endpoints include:

- `GET /health`
- `GET /v1/search?q=NVDA`
- `GET /v1/terminal/NVDA`
- `GET /v1/audit/NVDA`
- `GET /v1/quote/NVDA`
- `GET /v1/history/NVDA?range=1Y`
- `GET /v1/signals/NVDA`
- `GET /v1/edgar/NVDA`
- `GET /v1/discovery`
- `GET /v1/portfolio`

## Mobile/APK implication

The root-path 404 was not itself an APK/API-contract failure because the production mobile client is expected to use `/health` and `/v1/...` endpoints. The root endpoint is now nevertheless explicit to make browser/manual verification unambiguous.

## Render configuration learned

Canonical Render backend settings for this repository:

- Service type: Web Service
- Runtime: Node
- Root Directory: `backend` (lowercase)
- Start command: package start script (`node server-v3.mjs`)
- Host: `0.0.0.0`
- Port: read from `process.env.PORT`
- Auto deploy: branch-dependent; current deployment observed from `feat/atlas-terminal-phase1`

Environment secrets/API keys belong in Render Environment Variables and must never be committed to GitHub. In particular, provider tokens and broker credentials remain server-side.

## Evidence observed during recovery

Render UI/logs showed a successful deployment at approximately 15:06 on 2026-08-09 display time in the supplied screenshots, including `Build successful`, `Your service is live`, and the primary Render URL. A subsequent browser test of `/` showed `NOT_FOUND`, leading to the route-level diagnosis above.

## Operational rule

For future ATLAS Ω deployment incidents, distinguish these layers before changing the APK:

1. Render build/deploy state.
2. Backend process/port health.
3. `/health` API health.
4. Individual `/v1/...` endpoint health.
5. Mobile production API base URL.
6. APK build/install/runtime behavior.

A bare `/` response must not be used alone to conclude that the production API or APK is broken.
