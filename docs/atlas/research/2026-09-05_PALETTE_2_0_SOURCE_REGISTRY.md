# ATLAS Ω — Palette 2.0 Source Registry

**Date:** 2026-09-05  
**Status:** RESEARCH SOURCE REGISTRY / NON-CANONICAL  
**Scope:** Investigation-source discovery and provenance support only.

## Sources copied from the Palette 2.0 announcement

### Palette 2.0
Graph-based investigation platform. Use as a discovery and case-linking layer; do not treat graph edges as proof without independent corroboration.

### Pipl
Identity-resolution / people-search source that can connect fragmented identifiers such as names, emails and phone numbers and surface related public/commercial records.

**ATLAS use:** entity disambiguation only when lawful, relevant and proportionate. Do not use for intrusive profiling of private individuals. Any material claim requires corroboration from primary or otherwise authoritative sources.

### YC World
Corporate/government data source covering ownership, sanctions and high-risk-jurisdiction connections across many countries.

**ATLAS use:** priority discovery source for corporate ownership/control, sanctions exposure and cross-jurisdiction entity mapping. Ownership/control claims must be verified against company registries, filings, sanctions lists, court records or other authoritative evidence.

### Darkside Search
Repository/search layer over compromised or dark-web records.

**ATLAS use:** defensive exposure checking and provenance-led research only where authorized and lawful. Never use compromised credentials, access tokens, passwords or leaked access material to obtain access to systems or accounts.

## Evidence law

Palette/Pipl/YC World/Darkside are discovery sources, not self-authenticating proof. Every consequential relationship must be assigned provenance and corroborated before being promoted to CONFIRMED.

Suggested evidence states:
- DISCOVERED
- CORROBORATED
- CONFIRMED
- DISPUTED
- REJECTED

## Governance constraints already present in ATLAS

The repository Constitution requires legal sources and rejects personal-data/surveillance OSINT that violates terms, with manual review for intelligence collection. This registry does not override those constraints.

## Preferred research workflow

`ENTITY → DISCOVERY SOURCE → CORPORATE/LEGAL PRIMARY RECORD → SECOND INDEPENDENT SOURCE → GRAPH EDGE WITH PROVENANCE`

For corporate-network work, prefer `YC World → official registry/filing → sanctions/court/news corroboration`.

For identity resolution, use Pipl only to disambiguate an already relevant entity and then verify with authoritative records.

For Darkside, use only defensive exposure checks and never operationalize leaked credentials or unauthorized access.

## GitHub discovery note

A search of the current indexed `atlas_genesis` default branch did not return existing exact references to `Palette`, `Pipl`, `Darkside`, or `YC World` before this registry was created. GitHub-wide public code search does contain Pipl references in third-party OSINT projects, but those are not ATLAS canon and are not adopted by reference.
