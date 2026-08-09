# ATLAS Ω — Preservation Manifest

**Date:** 2026-08-09  
**Repository:** `Vicente24051980/atlas_genesis`  
**Status:** ACTIVE / DO NOT DELETE  
**Purpose:** preserve the accumulated intellectual work developed across the long-running ATLAS Ω conversations and convert it into durable, versioned project knowledge.

## Preservation rule

This repository must preserve two layers separately:

1. **Historical archive** — what was discussed, proposed, rejected, corrected, superseded, tested or used as an intermediate snapshot.
2. **Canonical state** — only the currently valid Constitution / RFC / Portfolio / Watchlist / algorithm definitions explicitly promoted to canon.

Historical material must never be silently deleted merely because a newer rule supersedes it. Superseded material is evidence of the evolution of ATLAS Ω and belongs in the audit trail.

## Critical distinction

A conversation summary is not a replacement for the source history. The existing file `docs/conversations/2026-08-09-atlas-omega-thread-archive.md` is a preservation layer built from the conversation material available to ChatGPT on 2026-08-09. It must be retained.

This recovery bundle adds structured records so that months of work are not compressed into a single document.

## Canon architecture to respect

ATLAS Ω is modularized. The Constitution contains general governing rules and must not contain company names. Portfolio and Watchlist are independent, versioned state documents. RFCs are independent specifications. Historical decisions belong in an audit/decision archive.

Expected logical layers:

- Constitution Ω
- RFC-000 Core Specification
- RFCs / engines / skills
- Portfolio snapshots
- Watchlist snapshots
- Decision Journal
- Research archive
- Digital Twin / Biblioteca Atlas / Escuela Atlas
- Audit / superseded material

## Information categories preserved from the long-running thread

- ATLAS Ω operating philosophy and evidence hierarchy.
- Investment discovery and screening workflow.
- Business Quality Ω.
- Growth Ω.
- CAPEX Productivity Ω.
- Valuation Ω / RFC-VAL-001.
- Risk Ω and falsifiers.
- Catalysts Ω.
- Portfolio evolution and historical snapshots.
- Watchlist evolution and candidate research.
- Earnings anticipation and post-earnings validation systems.
- Learning Loop / calibration architecture.
- Daily readings and Universal Laws Atlas.
- Digital Twin architecture.
- Atlas Puro, Psicológico, Financiero, Salud, Hombre XXI, Espiritual and Conspiraciones.
- Atlas Conspiraciones epistemic separation: facts / evidence / hypotheses / interpretations.
- Atlas OS / Android / API / SQLite / Drizzle / EAS architecture and release gates.
- CORE-00 and E2E-001 integration decisions.
- Errors, corrections and anti-hallucination lessons from portfolio reconciliation and market-data workflows.

## Non-destructive rule

When a later conversation changes a prior rule:

- do not erase the old material;
- mark it `SUPERSEDED`;
- link the newer canonical source;
- preserve dates and rationale where known.

## Data-integrity rule

Never promote an uncertain remembered item into current canon merely because it appears in an old conversation summary. Historical snapshots and current state must be explicitly distinguished.

## Recovery limitation

ChatGPT does not expose a guaranteed byte-for-byte export of every historical message from every prior conversation through the GitHub connector. Therefore this repository can contain all information currently recoverable from the active conversation/context, but a complete forensic transcript of every message from many months requires the source conversation exports or other source files if portions are no longer present in accessible context.

This limitation must never be hidden. The goal is maximum preservation without inventing missing history.

## Current action

The 2026-08-09 recovery bundle records the information currently recoverable and establishes a durable structure for continued ingestion. Future recovered material should be appended, not substituted.
