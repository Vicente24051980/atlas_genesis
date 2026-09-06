# ATLAS Ω — BLIND REBUILD RETRIEVAL GUARDRAIL

Phase-1 retrieval should prioritize company evidence and canonical engine definitions while excluding portfolio-state documents from retrieved context.

Portfolio-state files may remain stored for provenance/execution but should be tagged or path-separated so a retrieval system can exclude them during clean selection.

Recommended semantic separation:

- `EVIDENCE/RESEARCH/ENGINES` → allowed Phase 1;
- `CURRENT_OPERATIONAL_PORTFOLIO/HISTORICAL_PORTFOLIOS/EXECUTION` → withheld until Phase 2.
