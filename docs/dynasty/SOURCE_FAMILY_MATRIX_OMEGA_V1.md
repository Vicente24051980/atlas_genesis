# SOURCE × FAMILY MATRIX Ω v1

**Status:** CANONICAL WORKING MATRIX — DINASTÍA HISTÓRICA Ω v2  
**Date:** 2026-09-06

## Purpose
Normalize narrative dependence before any graph-centrality or prestige score is computed. Medieval Armenian historians are situated producers of evidence, not neutral sensors.

## Core rule
`named_in_source ≠ independent_corroboration` and `narrative_prominence ≠ historical_prominence`.

## Source profiles
| Source / author | Date / status | Patronage / embedded bias | Focal house(s) | Main evidentiary risk | External control |
|---|---|---|---|---|---|
| Movsēs Xorenacʿi | disputed dating | pro-Bagratuni program; anti-Mamikonean distortions | Bagratuni | remote prestige, substitution, chronology | independent chronicles, inscriptions, sigillography, non-Armenian sources |
| Łazar Pʿarpecʿi | late 5th c. | raised in Mamikonean milieu; commissioned by Vahan | Mamikonean | patron selection/praise | compare Ełišē and external evidence |
| Ełišē | formation/date debated | Vardan-centred martyr narrative | Mamikonean / Vardan | hagiographic modelling | compare Łazar and Persian evidence |
| Pʿawstos / Epic Histories | late-5th final composition | heroic Mamikonean epic structures | Mamikonean | epic typology/retrospective moralization | compare other late-antique sources |
| Ps.-Sebeos | 7th c. | laudatory Smbat Bagratuni source-block | Bagratuni / Smbat | embedded panegyric | seal, letters, Persian/non-Armenian context |
| Tʿovma Artsruni | 9th–10th c. | explicit Artsruni dynastic memory/legitimation | Artsruni | retrospective genealogy | earlier sources/documentary controls |

## Family × source qualitative matrix
Legend: `++` strongly centered; `+` favorable/dense; `0` neutral/mixed; `-` degraded; `?` insufficiently normalized.

| Source | Bagratuni | Mamikonean | Artsruni | Siwni | Kamsarakan |
|---|---:|---:|---:|---:|---:|
| Xorenacʿi | ++ | - | ? | ? | ? |
| Łazar | 0/+ | ++ | + | + | + |
| Ełišē | 0 | ++ | + | 0/- | + |
| Pʿawstos | 0 | ++ | -/mixed | mixed | ? |
| Ps.-Sebeos | ++ for Smbat block | +/mixed | + | + | ? |
| Tʿovma Artsruni | 0 | mixed | ++ | mixed | mixed |

## Current inference
1. Clear author-level narrative capture exists.
2. Bagratuni remote prestige is especially sensitive to Xorenacʿi.
3. Mamikonean prominence is not a neutral control because Łazar/Pʿawstos are house-centered.
4. Bagratuni VI–VII c. prominence is not reducible to Xorenacʿi because Smbat has independent controls.
5. The corpus does not support a single global 'Bagratuni propaganda explains everything' model.
6. Aggregate scores require normalization for source/date/patronage/coverage/distinct persons/external corroboration.

## Required normalization before scoring
Per source-family cell collect `mentions_raw`, `distinct_persons`, `kinship_claims`, `prestige_claims`, `remote_origin_claims`, `office_claims`, `territory_claims`, `negative_claims`, `text_words_or_sections`, `external_corroboration_count`, `source_bias_profile`.

## Hard CI rule
`RAW_NARRATIVE_CENTRALITY_GATE Ω`: no family may be promoted from raw mentions or raw graph degree without source normalization.
