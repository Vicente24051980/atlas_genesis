# Security and privacy boundary

ATLAS Model Intelligence Ω stores routing metadata, not provider credentials.

## Forbidden in this module

- API keys, OAuth refresh tokens, cookies, session exports or browser profiles.
- Silent credential discovery/import from OmniRoute or any provider.
- Canonical personal memory copied from an execution backend.
- Raw provider output promoted to canonical evidence without downstream verification.
- Provider-specific auth logic embedded in scoring or policy code.

## Required for future adapters

- Secrets supplied at execution time through the surrounding runtime/secret store.
- Explicit outbound-provider identity for every request.
- Logs redact credentials and sensitive request payloads by default.
- Provider catalog/free-tier claims carry observation time and source.
- Live adapters are certified independently from this deterministic routing kernel.
