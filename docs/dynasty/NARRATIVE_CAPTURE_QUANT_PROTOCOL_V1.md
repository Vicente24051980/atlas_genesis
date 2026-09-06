# NARRATIVE CAPTURE Ω — Quantitative Protocol v1

**Status:** PREREGISTERED DESIGN — do not tune after seeing results  
**Date:** 2026-09-06

## Objective
Estimate how much apparent family prominence is robust across sources versus produced by source-specific patronage, genre, date, survival and narrative program.

## Families in first pass
- Bagratuni
- Mamikonean
- Artsruni
- Siwni
- Kamsarakan

## Sources in first pass
- Movses Xorenac'i
- Lazar P'arpec'i
- Epic Histories / P'awstos Buzand
- Elise
- Anonymous history traditionally attributed to Sebeos
- T'ovma Artsruni

## Unit of observation
A **source-family cell**, never a raw graph edge.

Each cell records at minimum:
- source_id
- family_id
- source_word_count_or_coverage_proxy
- distinct_persons_named
- raw_mentions
- explicit_kinship_claims
- office_claims
- territory_claims
- patrimonial_transfer_claims
- positive_prestige_claims
- negative/degrading_claims
- remote_ancestry_claims
- independently_corroborated_claims
- source_temporality
- patronage/bias flags

## Frozen primary outcomes
1. **Robust Presence** — distinct persons + office/territory/patrimony claims surviving author-removal.
2. **Prestige Inflation** — positive prestige + remote ancestry that collapses disproportionately when a patronal source is removed.
3. **Narrative Dependency** — share of family-specific claims attributable to one source.
4. **External Corroboration Rate** — fraction of high-impact claims supported outside the source's own narrative program.

## Author-removal design
Compute the family profile on the full six-source set, then rerun after removing each source one at a time.

Key diagnostic:
`delta_family_metric(source_removed) = full_metric - leave_one_source_out_metric`

Large source-specific deltas indicate narrative dependency, not automatically historical falsity.

## Hard gates
- `RAW_NARRATIVE_CENTRALITY_GATE Ω`: raw mention counts, raw degree and raw graph centrality cannot be interpreted historically without normalization.
- `PATRONAGE_NORMALIZATION_GATE Ω`: prestige and remote ancestry claims from a patronal/dynastic source must be separated from independently corroborated control claims.
- `TEMPORALITY_GATE Ω`: contemporary-event evidence and remote retrospective genealogy cannot share one undifferentiated weight.
- `INDEPENDENCE_GATE Ω`: secondary repetitions sharing one evidentiary root count as one dependency.
- `NO_IMPUTATION Ω`: missing corpus counts stay missing; do not estimate from search-engine hit counts.

## Required normalization before scoring
At minimum normalize for:
- source length/coverage;
- chronological scope;
- number of distinct named persons;
- patronage/house affinity;
- genre (chronicle, epic, martyr narrative, dynastic history);
- temporal distance to event;
- survival/transmission quality where known.

## Interpretation rule
A family can be historically important and narratively inflated at the same time. The test estimates dependence of *representation*, not truth/falsity of the family itself.

## Pre-registered expectations
- Removing Xorenac'i should materially reduce Bagratuni remote-prestige/ancestry metrics more than Bagratuni late-antique institutional presence.
- Removing Lazar should materially reduce Mamikonean positive narrative centrality for 481-485.
- Removing Epic Histories should materially reduce Mamikonean heroic centrality for the 4th century.
- Removing T'ovma should materially reduce Artsruni remote pedigree density more than late-9th-century Artsruni event density.
- Removing Ps.-Sebeos should reduce the Smbat Bagratuni biographical block, but externally corroborated Smbat claims should survive.

## Stop rule
Do not calculate a headline score until the source-family cells have complete provenance and at least the required coverage variables. If complete corpus counts cannot be obtained, publish a qualitative/partial matrix rather than fabricate pseudo-precision.
