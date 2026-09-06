# NARRATIVE CAPTURE TEST Ω v1

**Status:** EXECUTED — first comparative pass  
**Date:** 2026-09-06  
**Scope:** Bagratuni vs Mamikonean vs Artsruni vs Siwni vs Kamsarakan

## Frozen question
Does the apparent superior antiquity / prestige / ancestral connectivity of the Bagratuni persist after controlling for source author, patronage, date and documentary survival?

## Rival models
- `H1 HISTORICAL NETWORK` — elevated Bagratuni ancestral depth reflects a historical structure that persists across independent sources.
- `H0 GENEALOGICAL PROGRAM` — elevated Bagratuni depth is materially produced by later dynastic legitimation and source-specific patronage.

## Controls
1. Author-removal test: remove Xorenacʿi entirely.
2. Source-date control: separate 5th-c., 6th–7th-c., and later witnesses.
3. Patronage/source-interest control: tag commissioned or laudatory works.
4. Documentary-survival control: do not equate surviving narrative density with historical prominence.
5. No raw-count scoring yet: current corpus is not normalized enough for pseudo-precision.

## Source-profile findings

### Xorenacʿi
Modern source criticism identifies a strong pro-Bagratuni orientation and systematic downgrading/substitution of rival Mamikonean roles. Therefore Xorenacʿi is a positive control for narrative capture, not an independent validator of Bagratuni remote ancestry.

### Łazar Pʿarpecʿi
Late-5th-century historian raised in the Mamikonean household; Vahan Mamikonean commissioned his History. This is an explicit source-interest flag favoring Mamikonean visibility.

### Epic Histories / Pʿawstos tradition
The surviving work strongly foregrounds Mamikonean activity and may rest partly on a lost family geste. It cannot be treated as neutral evidence of relative dynastic importance.

### Sebeos / Ps.-Sebeos
Provides a comparatively early and important Bagratuni block around Smbat Khosrov Šum, possibly drawing on a lost laudatory biography. Crucially, Smbat's importance is independently supported by church correspondence and a Sasanian seal, so late-antique Bagratuni prominence does not disappear when Xorenacʿi is removed.

## Author-removal result
Removing Xorenacʿi causes the **remote-prestige / deep-ancestry advantage of Bagratuni to collapse materially**. The Orontid/Davidic-style remote genealogical superstructure is not independently sustained as a hard pedigree.

However, Bagratuni **historical prominence in the 6th–7th centuries survives**, especially around Smbat, because there are non-Xorenacʿi sources and external documentary corroboration.

Mamikonean prominence also survives strongly without Xorenacʿi and is in fact better attested in late-5th-century narrative sources, but those sources themselves are source-interested / patron-linked.

## Comparative interpretation
The current evidence supports **source-specific narrative capture**, not yet a claim that the entire surviving Armenian corpus is globally captured by Bagratuni ideology.

- `Bagratuni remote ancestry`: strongly source-sensitive; hard-graph status = NOT DEMONSTRATED.
- `Bagratuni late-antique political prominence`: survives author removal and external corroboration.
- `Mamikonean late-antique prominence`: survives strongly, but principal Armenian witnesses are themselves linked to the family.
- `Artsruni / Siwni / Kamsarakan`: current evidence is insufficiently normalized to rank aggregate ancestral depth without new coding.

## Decision
**NARRATIVE CAPTURE Ω v1 = PARTIAL POSITIVE.**

Positive at the author/program level: Xorenacʿi demonstrably shifts prestige and role attribution toward Bagratuni and against Mamikonean.

Not yet positive at the fully aggregated-corpus level: once Xorenacʿi is removed, Bagratuni remains historically prominent in later Late Antiquity, while Mamikonean remains very prominent in its own source cluster. Therefore the test does not justify a blanket statement that the whole aristocratic network is merely Bagratuni propaganda.

## Hard-graph consequence
1. No remote Bagratuni ancestry claim may gain confidence from Xorenacʿi adjacency.
2. Xorenacʿi-derived prestige must be stored in `CLAIM/TRADITION` space.
3. Mamikonean-promoting sources receive the same patronage-bias treatment; anti-Bagratuni skepticism must not become asymmetric.
4. Cross-author persistence is required before any family-level prestige/depth signal enters the hard graph.
5. Future quantitative work must normalize by source length, number of named persons, date, survival, and patronage before comparing family centrality.

## Next test
Build a coded source-family matrix with one row per source and fields:
`source_id | source_date | patron/interest | family | mentions | explicit_kinships | remote_ancestry_claims | offices | territories | praise/deprecation markers | independent_external_support`

Only after this matrix is complete may ATLAS compute cross-source narrative centrality or prestige asymmetry.
