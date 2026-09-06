# NARRATIVE CAPTURE Ω — Quantitative Protocol v1

**Status:** PREREGISTERED DESIGN — do not tune after seeing results  
**Date:** 2026-09-06

## Objective
Estimate how much family prominence is robust across sources versus produced by source-specific patronage, genre, date, survival and narrative program.

## First-pass universe
Families: Bagratuni, Mamikonean, Artsruni, Siwni, Kamsarakan. Sources: Xorenac'i, Lazar, Epic Histories/P'awstos, Elise, Ps.-Sebeos, T'ovma Artsruni.

## Unit
A **source-family cell**, never a raw graph edge.

Required fields: source coverage/word-count proxy, distinct persons, raw mentions, explicit kinship, office, territory, patrimonial transfer, positive prestige, negative/degrading claims, remote ancestry, independent corroboration, temporality, patronage/bias.

## Frozen outcomes
1. Robust Presence.
2. Prestige Inflation.
3. Narrative Dependency.
4. External Corroboration Rate.

## Leave-one-author-out
Recompute every family profile after removing one source at a time. Large deltas indicate narrative dependency, not automatic falsity.

## Hard gates
`RAW_NARRATIVE_CENTRALITY_GATE Ω`; `PATRONAGE_NORMALIZATION_GATE Ω`; `TEMPORALITY_GATE Ω`; `INDEPENDENCE_GATE Ω`; `NO_IMPUTATION Ω`.

Search-engine hit counts are forbidden substitutes for corpus counts.

## Preregistered expectations
- Removing Xorenac'i reduces Bagratuni remote-prestige/ancestry more than late-antique institutional presence.
- Removing Lazar reduces Mamikonean positive centrality for 481–485.
- Removing Epic Histories reduces Mamikonean heroic centrality for the 4th c.
- Removing T'ovma reduces Artsruni remote-pedigree density more than late-9th-c event density.
- Removing Ps.-Sebeos reduces the Smbat biography block while externally corroborated Smbat claims survive.

## Stop rule
No headline score until cells have complete provenance and required coverage variables. If corpus counts are incomplete, publish a qualitative/partial matrix rather than fabricate precision.
