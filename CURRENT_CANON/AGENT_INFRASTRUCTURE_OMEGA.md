# ATLAS Ω — AGENT INFRASTRUCTURE Ω

**Status:** ACTIVE
**Date:** 2026-08-17

## Objective
Add an agent/data automation layer around ATLAS Ω without replacing its constitutional evidence architecture or investment gates.

## Authority boundary
GitHub remains the canonical source of truth. External memory, automation, extraction and coding agents are infrastructure only. They cannot override CONSTITUTION, CURRENT_CANON, Investment Committee Ω, Evidence Director Ω or Falsifiers Ω.

## Approved stack

### Tier 1 — integrate
1. **Mem0** — operational agent memory and retrieval. Never canonical authority. Its memory semantics are governed by `SEMANTIC_TEMPORAL_MEMORY_OMEGA.md`.
2. **n8n** — workflow/event orchestration and scheduled automation.
3. **Firecrawl** — web ingestion/extraction into structured evidence candidates.
4. **MarkItDown** — document normalization (PDF/Office/HTML/etc.) into Markdown/text for evidence processing.
5. **OpenHands** — software-engineering agent operating through branch/test/PR/review gates.

### Tier 2 — optional
6. **OfficeCLI** — document/spreadsheet/presentation output and manipulation.
7. **Ollama** — local inference for low-risk extraction/classification workloads where infrastructure permits.

### Excluded from ATLAS core
- **Dify** — orchestration overlap.
- **Langflow** — orchestration overlap.
- **ComfyUI** — keep separate as media/visual infrastructure, not Investment Committee infrastructure.

## Canonical architecture

```text
Sources / APIs / documents
        |
        +--> Firecrawl (web)
        +--> MarkItDown (documents)
        |
        v
Evidence Director Ω
        |
FACT / HYPOTHESIS / INTERPRETATION / NOISE
        |
        v
Investment Committee Ω
  Economic Proof
  Valuation / Implied Return
  CAPEX Productivity
  Moat
  Institutional Rotation
  Macro / Regime
  Falsifiers / Red Team
        |
        v
Decision / Execution / Measurement / Learning
```

Cross-cutting infrastructure:

```text
n8n  -> schedules/events/workflows
Mem0 -> operational retrieval memory governed by Semantic Temporal Memory Ω
GitHub -> CANON / immutable audit trail
```

Memory lane:

```text
Input -> candidate fact extraction -> atomic normalization -> provenance
      -> conflict/temporal resolution -> Mem0 adapter -> semantic/temporal retrieval
      -> ATLAS/Gemelo Digital Ω
      -> canonical promotion only through GitHub governance
```

Engineering lane:

```text
Issue -> OpenHands -> branch -> implementation -> tests -> PR -> review gate -> merge
```

## Non-negotiable gates
- No external tool can directly create a BUY/HOLD/WATCH/REJECT decision without passing ATLAS evidence gates.
- Falsifiers Ω retains absolute independent veto.
- Mem0 output is context, never FACT merely because it was remembered.
- Mem0 must not treat transcript history as canonical memory; durable memory is fact-centric, typed, temporal, provenance-aware and contradiction-aware.
- Current-state retrieval must respect effective dates, ACTIVE/SUPERSEDED status and authority before semantic similarity.
- Firecrawl/MarkItDown output is raw evidence candidate until provenance and evidence class are established.
- n8n automates execution flow, not investment judgment.
- OpenHands must not push autonomous production changes directly to protected canon; use branch + tests + review/PR.
- Secrets/API keys must be environment secrets and must never be committed to GitHub.

## Initial implementation sequence
1. Define adapters/interfaces for memory, web ingestion, document ingestion and workflow events.
2. Implement `SEMANTIC_TEMPORAL_MEMORY_OMEGA.md`: typed atomic facts, temporal state, provenance, confidence, conflict resolution and supersession chains.
3. Add provenance envelope for every ingested evidence object.
4. Connect ingestion to Evidence Director Ω classification.
5. Add n8n-compatible webhook/job boundaries without embedding investment logic in n8n.
6. Add Mem0 behind an adapter so it can be replaced without changing ATLAS core.
7. Establish OpenHands engineering sandbox and PR gate.
8. Add OfficeCLI/Ollama only after Tier-1 integration is stable.

## Evidence envelope
Every external observation should preserve at minimum:

```json
{
  "source": "...",
  "source_type": "web|document|api|memory",
  "retrieved_at": "ISO-8601",
  "content_hash": "...",
  "classification": "FACT|HYPOTHESIS|INTERPRETATION|NOISE|UNCLASSIFIED",
  "confidence": null,
  "canonical": false
}
```

Only ATLAS evidence processing may promote an observation beyond UNCLASSIFIED. `canonical` remains false unless explicitly persisted through the canonical governance process.

## Memory governance reference
`CURRENT_CANON/SEMANTIC_TEMPORAL_MEMORY_OMEGA.md` is the canonical contract for operational memory. In case of ambiguity, its memory-specific gates apply subject to the higher authority boundary above.

## Success condition
The stack is successful only if it increases evidence throughput, reproducibility and software delivery while preserving ATLAS Ω separation of concerns, provenance, falsification and auditability.
