# Agentic Runtime Ω v2 implementation map

- `workers.py`: eight deterministic specialist workers plus Contradiction Graph Ω and Evidence Director scoring.
- `recovery.py`: append-only run context snapshots and safe reconstruction of interrupted runs.
- `calibration.py`: prediction ledger and predicted→realized calibration.
- `api/agentic_omega_v2.py`: operational v2 endpoints sharing the v1 ledger/lock.

External Agent Infrastructure Ω observations remain evidence candidates; this runtime does not auto-promote them to canonical facts or trade instructions.
