# Routing policy invariants

1. Hard requirements define the feasible set; scoring only ranks inside it.
2. Fallback never widens the feasible set.
3. Provider/model availability is an observation, not a permanent fact.
4. Credentials are runtime secrets and never routing metadata.
5. A transport success is not truth; verification may reject it and continue fallback.
6. Learning consumes verified outcomes and produces new telemetry snapshots.
7. No routing decision grants autonomous action authority.
8. No external router owns ATLAS canonical memory, provenance or policy.
