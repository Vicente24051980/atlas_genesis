# NARRATIVE CAPTURE Ω — Quantitative Protocol v1

**Status:** PREREGISTERED DESIGN — do not tune after seeing results  
**Date:** 2026-09-06

## Objective
Estimate how much apparent family prominence is robust across sources versus produced by source-specific patronage, genre, date, survival and narrative program.

## First-pass families
Bagratuni, Mamikonean, Artsruni, Siwni, Kamsarakan.

## First-pass sources
Movses Xorenac'i, Lazar P'arpec'i, Epic Histories/P'awstos Buzand, Elise, anonymous history traditionally attributed to Sebeos, T'ovma Artsruni.

## Unit of observation
A **source-family cell**, never a raw graph edge.

Each cell records at minimum: source coverage/word-count proxy, distinct persons, raw mentions, explicit kinship, office, territory, patrimonial transfer, positive prestige, negative/degrading claims, remote ancestry, independently corroborated claims, temporality and patronage/bias.

## Frozen primary outcomes
1. **Robust Presence** — distinct persons + office/territory/patrimony claims surviving author-removal.
2. **Prestige Inflation** — prestige + remote ancestry collapsing disproportionately when a patronal source is removed.
3. **Narrative Dependency** — share of family-specific signal attributable to one source.
4. **External Corroboration Rate** — fraction of high-impact claims supported outside the source's narrative program.

## Author-removal design
Compute full family profile, then rerun after removing each source one at a time.

`delta_family_metric(source_removed) = full_metric - leave_one_source_out_metric`

Large source-specific deltas indicate narrative dependency, not automatically falsity.

## Hard gates
- `RAW_NARRATIVE_CENTRALITY_GATE Ω`
- `PATRONAGE_NORMALIZATION_GATE Ω`
- `TEMPORALITY_GATE Ω`
- `INDEPENDENCE_GATE Ω`
- `NO_IMPUTATION Ω`

Search-engine hit counts are forbidden substitutes for corpus counts.

## Required normalization before scoring
Source length/coverage; chronological scope; distinct named persons; patronage/house affinity; genre; temporal distance; survival/transmission quality.

## Interpretation rule
A family can be historically important and narratively inflated simultaneously. This test measures dependence of representation, not truth/falsity of the family.

## Preregistered expectations
- Removing Xorenac'i should reduce Bagratuni remote-prestige/ancestry more than late-antique institutional presence.
- Removing Lazar should reduce Mamikonean positive centrality for 481–485.
- Removing Epic Histories should reduce Mamikonean heroic centrality for the 4th c.
- Removing T'ovma should reduce Artsruni remote-pedigree density more than late-9th-c event density.
- Removing Ps.-Sebeos should reduce the Smbat biography block while externally corroborated Smbat claims survive.

## Stop rule
No headline score until source-family cells have complete provenance and required coverage variables. If complete corpus counts cannot be obtained, publish a qualitative/partial matrix rather than fabricate precision.
