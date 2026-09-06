# SOURCE × FAMILY MATRIX Ω v1

**Status:** CANONICAL WORKING MATRIX — DINASTÍA HISTÓRICA Ω v2  
**Date:** 2026-09-06

## Purpose
Normalize narrative dependence before any graph-centrality or prestige score is computed. This matrix treats medieval Armenian historians as situated producers of evidence, not neutral sensors.

## Core rule
`named_in_source ≠ independent_corroboration` and `narrative_prominence ≠ historical_prominence`.

Every source must be profiled across:
- declared / critical date;
- distance from events;
- patronage or commissioning context;
- literary genre;
- favored / degraded houses;
- known embedded sub-sources;
- external corroboration;
- survival / manuscript risk.

## Source profiles

| Source / author | Date / status | Patronage / embedded bias | Favored / focal house(s) | Main evidentiary risk | External control |
|---|---|---|---|---|---|
| Movsēs Xorenacʿi | disputed dating; not safely treated as contemporary with all claimed events | pro-Bagratuni court-genealogical program; documented anti-Mamikonean distortions | Bagratuni | prestigious remote ancestry, narrative substitution, chronology | independent chronicles, inscriptions, sigillography, non-Armenian sources |
| Łazar Pʿarpecʿi | late 5th c.; near-contemporary for 481–484 | raised by Mamikonean princess; Vahan Mamikonean commissioned the History; work functions as encomium | Mamikonean | patron-driven selection and praise | compare Ełišē, Persian/Byzantine evidence, prosopography |
| Ełišē | literary date/tradition debated; work shaped as hagiographical history | Vardan-centered martyr narrative | Mamikonean / Vardan | hagiographic motivation, biblical and martyr-act modeling | compare Łazar, Persian administrative/religious evidence |
| Pʿawstos Buzand / Epic Histories | likely c. 470 for final composition | heroic Mamikonean-centered epic structures | Mamikonean | epic typology, oral-formulaic material, retrospective moralization | compare other Armenian and external late-antique sources |
| Ps.-Sebeos | 7th c. compilation; anonymous attribution problem | includes an apparently laudatory biography of Smbat Bagratuni | Bagratuni / Smbat | embedded panegyric, chronology imperfections, conflation risk | seal, Book of Letters, Khuzistan/Seert chronicles, Persian context |
| Tʿovma Artsruni | 9th–10th c.; dynastic historian | internal Artsruni memory and legitimation | Artsruni | retrospective genealogy and house-centered recovery of lost past | compare earlier Armenian sources and independent documentary evidence |

## Family × source qualitative matrix

Legend: `++` strongly favored / centered; `+` favorable or dense; `0` neutral/mixed; `-` degraded/adversarial; `?` insufficiently normalized.

| Source | Bagratuni | Mamikonean | Artsruni | Siwni | Kamsarakan |
|---|---:|---:|---:|---:|---:|
| Xorenacʿi | ++ | - | ? | ? | ? |
| Łazar | 0/+ | ++ | + | + | + |
| Ełišē | 0 | ++ | + | 0/- | + |
| Pʿawstos | 0 | ++ | -/mixed | mixed | ? |
| Ps.-Sebeos | ++ for Smbat block | +/mixed | + | + | ? |
| Tʿovma Artsruni | 0 | mixed | ++ | mixed | mixed |

## Current inference
1. There is clear **author-level narrative capture**.
2. Bagratuni remote prestige is especially sensitive to inclusion of Xorenacʿi.
3. Mamikonean prominence is not a clean control because Łazar and Pʿawstos are themselves strongly house-centered.
4. Bagratuni prominence in the VI–VII c. is not reducible to Xorenacʿi because Smbat is independently controlled by sigillographic and epistolary evidence.
5. Therefore the current corpus does **not** support a single global 'Bagratuni propaganda explains everything' model.
6. Any aggregate centrality/prestige score must be normalized by source, date, patronage, text length/coverage, number of named persons, and external corroboration.

## Required normalization before scoring
For each source-family cell collect:
- `mentions_raw`
- `distinct_persons`
- `kinship_claims`
- `prestige_claims`
- `remote_origin_claims`
- `office_claims`
- `territory_claims`
- `negative_claims`
- `text_words_or_sections`
- `external_corroboration_count`
- `source_bias_profile`

Then compute only source-normalized metrics. No global score may be computed directly from raw counts.

## Hard CI rule
`RAW_NARRATIVE_CENTRALITY_GATE Ω`: CI must fail if any pipeline promotes a family based on raw mention counts or raw graph degree without source normalization.

## Next test
Build the first quantified dataset for five houses across Xorenacʿi, Łazar, Ełišē, Pʿawstos, Ps.-Sebeos and Tʿovma Artsruni, then rerun Narrative Capture with author-removal and source-weight sensitivity analysis.
