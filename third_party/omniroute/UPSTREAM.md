# OmniRoute upstream snapshot

- Upstream repository: `artzy/OmniRoute`
- Inspected release/default branch: `release/v3.8.49`
- Pinned commit: `45ca8ead4108d36b4f7179cd1606c4cff53d5f5a`
- Package version verified: `3.8.49`
- License: MIT
- Copyright notice: `Copyright (c) 2026 diegosouzapw`
- Integration mode: reference + ATLAS-owned adaptation

## Why the full tree is not committed into ATLAS

The upstream repository is large and contains product UI, desktop/build surfaces, generated/binary-capable artifacts and components that are not part of the ATLAS cognitive kernel. Committing an uncontrolled vendor copy would create update drift and obscure provenance.

Instead ATLAS pins the exact upstream commit and ships `scripts/sync-omniroute-upstream.sh`, which reproduces a full detached checkout under `.vendor/omniroute` on a developer machine. `.vendor/` is intentionally ignored by Git.

## What ATLAS adopts

- Provider/model abstraction as interchangeable compute.
- Multiple routing strategies as a concept.
- Fallback chains and route-specific circuit breaking.
- Awareness of free tiers, quota headroom, latency and reliability.
- OpenAI-compatible/local backends as execution options.
- Evaluation and observability as first-class routing inputs.

## What ATLAS adapts

- Route scoring is governed by ATLAS task evidence and deterministic hard gates.
- Model quality becomes per-task telemetry learned from ATLAS outcomes.
- Quota/free-tier information is treated as runtime evidence, not truth about provider policy.
- Fallback remains subordinate to privacy, local-only, tool/vision/context, and provider exclusion policies.

## What ATLAS rejects

- OmniRoute owning canonical ATLAS memory or provenance.
- Silent credential/key/cookie migration into ATLAS.
- Provider success being treated as epistemic validation.
- Bundling upstream desktop/web UI or build artifacts into the cognitive kernel.
- Any provider-specific assumption becoming a canonical dependency.

## Update procedure

1. Inspect the new upstream release and license before changing the pin.
2. Run the sync script against the proposed commit.
3. Diff the pinned upstream snapshot.
4. Re-audit provider auth, routing, fallback, data retention, telemetry and dependency changes.
5. Update `manifest.json` only through a reviewed ATLAS PR.
6. Re-run Model Intelligence Ω unit tests and any live provider certification separately.

No upstream change is promoted to ATLAS merely because it exists upstream.
