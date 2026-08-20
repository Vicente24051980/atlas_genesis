# ATLAS Ω — Render Private Services Architecture Gate — 2026-08-20

Status: DESIGN APPROVED / MIGRATION NOT YET EXECUTED

## Decision
Adopt private-service boundaries for internal ATLAS components when the deployment topology supports them, but DO NOT convert the public mobile/API ingress itself into a private service.

Current public contract remains the internet-facing API used by the mobile client and smoke tests. Existing production drift must be resolved before introducing topology changes.

## Target topology
PUBLIC EDGE/API → PRIVATE ANALYSIS SERVICES → PRIVATE MEMORY/KNOWLEDGE SERVICE → DATA STORES/PROVIDERS.

Candidate private components:
- memory retrieval/write service;
- graph/vector orchestration;
- background evidence processing;
- broker-control/execution internals where external callbacks are not required;
- internal scoring/engine workers.

Remain public only when externally required:
- mobile/API ingress;
- explicitly required webhook/callback endpoints;
- health endpoint required by deployment platform.

## Security invariants
- No provider, broker, memory or database secrets in APK/public Expo variables/Git.
- Public ingress authenticates/authorizes before invoking sensitive private services.
- Private services must not gain a public URL merely for convenience.
- Network privacy does not replace application authentication, authorization, audit logging or least privilege.

## Performance rationale
Co-locating internal services on Render private networking can reduce internet hops and expose fewer components publicly. Do not split a monolith into microservices unless the security/isolation/operational benefit exceeds added deployment, observability and failure-mode complexity.

## Migration gate
R0 current Render production drift resolved and mobile-v2 smoke PASS.
R1 identify internal-only components and required outbound/inbound dependencies.
R2 define auth, service identity, timeout/retry and health contracts.
R3 move one low-risk internal component first (recommended: memory/knowledge service).
R4 run latency, availability and failure-injection comparison against baseline.
R5 only then consider broker-control or additional engine workers.

## Memory service contract
If Mem0 or another memory provider is adopted, wrap it behind an ATLAS-owned interface so vendor choice is replaceable. Required operations: remember, retrieve, supersede, expire/revalidate, graph-edge read/write and provenance inspection. USER and AGENT namespaces remain logically isolated regardless of vendor.

## Non-decision
The Render onboarding email is a useful architecture signal, not evidence that ATLAS should immediately become a microservice system. Current priority remains production-contract correctness and evidence integrity.
