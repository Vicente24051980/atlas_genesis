# ATLAS Ω — Agent Infrastructure Secret Contract

Required encrypted runtime secrets:

- `FIRECRAWL_API_KEY`
- `MEM0_API_KEY`
- `ATLAS_N8N_SECRET`
- `ATLAS_AGENT_CONTROL_TOKEN`

## Rules

1. Never commit values to the repository, `.env` files, examples, logs, issues, PRs or artifacts.
2. GitHub Actions consumes these values only through `${{ secrets.NAME }}`.
3. Production runtimes (for example Render) require the same relevant variables in their own encrypted environment/secret store; GitHub Actions secrets do not automatically become production environment variables.
4. `ATLAS_N8N_SECRET` must be shared only between the ATLAS backend and the authorized n8n workflow endpoint.
5. `ATLAS_AGENT_CONTROL_TOKEN` is independent and must not reuse the n8n secret.
6. Rotate any credential suspected to have been exposed.
7. Provider ingestion remains non-canonical until Evidence Director Ω classification and provenance gates pass.
8. Falsifiers Ω retains independent absolute veto.

## GitHub gate

`.github/workflows/agent-infrastructure-secrets-check.yml` verifies presence of all four GitHub Actions secrets without printing their values. A missing secret fails the gate explicitly.

## Deployment state semantics

- `CODE_READY`: adapters/workflows reference secret names correctly.
- `GITHUB_SECRETS_READY`: all four encrypted repository secrets exist and the secrets gate passes.
- `RUNTIME_READY`: production runtime has the required encrypted variables.
- `LIVE_CERTIFIED`: provider connectivity and ATLAS governance integration tests pass against the live runtime.

Do not report `LIVE_CERTIFIED` merely because code has merged.
