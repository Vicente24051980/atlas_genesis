# ATLAS DYNASTY / PROSOPOGRAPHY Ω

**Status:** IMPLEMENTED — canonical candidate on feature branch  
**Scope:** genealogy, surnames, dynasties, aristocratic houses, people, holdings, companies, corporate groups, funds, foundations, banks, territories, titles, events and sources.

## 1. Core law

ATLAS MUST separate:

1. **Genealogical graph** — only explicit or defensible kinship edges.
2. **Prosopographical graph** — people/entities coexisting in the same house, period, territory or institution without implying kinship.
3. **Economic-control graph** — ownership, control, board, holding-company and group relationships.
4. **Claim/tradition graph** — asserted descent or affiliation that is not independently demonstrated.

No list of members, succession of office, common surname, common title, common company group, repeated personal name, territorial continuity or political alliance may be converted automatically into a parent/child or ownership edge.

## 2. Universal entity types

- `person`
- `surname`
- `family`
- `dynasty`
- `branch`
- `company`
- `holding`
- `corporate_group`
- `fund`
- `foundation`
- `bank`
- `institution`
- `territory`
- `title`
- `event`
- `source`

This makes the same engine usable for:

- ancient/medieval lineages;
- a modern surname/family network;
- family offices;
- holding structures;
- companies and subsidiaries;
- corporate groups;
- directors and beneficial owners;
- foundations, funds and banks;
- political or territorial offices.

## 3. Relationship classes

### Genealogical
`parent_of`, `child_of`, `sibling_of`, `spouse_of`, `grandparent_of`, `maternal_line_of`, `paternal_line_of`, `adopted_by`.

### Dynastic / prosopographical
`member_of`, `head_of`, `branch_of`, `successor_of`, `predecessor_of`, `claims_descent_from`, `historiographically_derived_from`, `same_tohm_as`, `associated_with`, `allied_with`.

### Economic / institutional
`owns`, `controls`, `holds_stake_in`, `subsidiary_of`, `parent_company_of`, `managed_by`, `founded_by`, `director_of`, `executive_of`, `beneficiary_of`, `trustee_of`, `member_of_group`, `brand_of`.

### Geographic / political
`rules`, `holds_title`, `based_in`, `controls_territory`, `served_under`, `participated_in`.

## 4. Evidence ladder Ω

- `A1` — explicit relationship in a contemporary or near-contemporary primary source.
- `A2` — explicit relationship in a later source and independently corroborated.
- `B1` — explicit relationship in a later dynastic/historical tradition, not independently corroborated.
- `B2` — modern prosopographical/historiographical reconstruction.
- `C` — membership/association only; no genealogical or control relationship may be inferred.
- `X` — rejected/contradicted identification.

Every edge MUST carry:

- `evidence_grade`
- `relation_basis`
- `source_ids`
- `date_min` / `date_max` when known
- `confidence`
- `status`
- `notes`

## 5. Homonym law

Repeated names are separate entities by default. ATLAS MUST NOT merge them unless identity is supported.

Examples already enforced:

- Meruzhan/Mehuzhan Artsruni of c. 363 != Merhuzhan Artsruni of the 5th century by default.
- Sahak son of Vahan != Sahak son of Gagik.
- Hamazasp son of Vahan != Hamazasp son of Gagik.
- Shavasp son of Vache != later Shavasp brother of Vasak unless evidence proves identity.
- Nershapuh != Mershapuh until textual criticism resolves identity.

Recommended internal IDs include house + name + chronological anchor, e.g. `ART-NER-0451`.

## 6. Current historical families in scope

### Orontid / Eruanduni
Dynastic continuity is historically meaningful, but the sequence is incomplete. The Sophene line must not be converted into a complete father-to-son chain. Artsruni/Bagratuni descent from the Orontids remains a historiographical reconstruction unless a specific edge is independently demonstrated.

### Artsruni
Secure/structured blocks presently include:

- Vache -> Shavasp (explicit tradition/source block)
- Mehuzhan -> unnamed intermediate -> Vasak -> Alan (later dynastic tradition)
- Vasak sibling-of Shavasp (later dynastic tradition)
- Aghan sibling-of Merhuzhan (explicit 5th-century relation)
- Sahak -> Vasak, d. 610/611 (explicit)
- Vahan -> Sahak, Hamazasp, Gagik (8th-century block)
- Gagik -> Hamazasp, Sahak (8th-century block)

Unresolved:

- Mithrobuzanes -> late antique Artsruni
- Shavasp -> Mehuzhan
- Nershapuh/Mershapuh generation -> Sahak/Vasak c. 600

### Mamikonean
Strong 5th-century block:

- Hmayeak sibling-of Vardan
- Hmayeak -> Vahan, Vasak, Artashes, Vard
- Vahan sibling-of Vasak/Artashes/Vard

The higher Hamazasp/Sahakanoysh connection is retained below A1 until the exact primary passage is audited.

### Kamsarakan
Strong block:

- Arshawir -> Nerseh
- Arshawir -> Hrahat
- Nerseh sibling-of Hrahat

Gazavon II -> Arshawir II -> Narses remains a useful reconstructed backbone, with the exact grade set per source.

### Siwni
Known nodes and kinships must be kept separate from succession:

- Vasak -> Babik and Amirnerseh where explicitly attested
- Babgen sibling-of Bakur where explicitly attested
- Babgen appears as prince in the later 5th century
- later Vahan prince of Siwnik MUST NOT be made Babgen's son without evidence

### Rshtuni
- Theodoros -> Vard
- political visibility fades after Vard; dynastic-name extinction must not be confused with biological extinction.

### Bagratuni
Clean VI–VII chain:

- Smbat `Khosrov Shum` -> Varaz-Tirots
- Varaz-Tirots -> Smbat (eldest son, where explicit in Sebeos)

Earlier Orontid derivation remains `B2` unless a specific genealogical edge is demonstrated.

### Gregorid
Male line ends with Sahak the Great; patrimonial transmission into the Mamikonean house through his daughter must be represented as marriage/inheritance, not as a surname merge.

## 7. Economic / surname extension

The graph is deliberately not restricted to ancient houses. A modern surname or family may link to:

`Person -> Surname -> Family/Branch -> Holding -> Corporate Group -> Company -> Subsidiary`

with parallel edges for:

- direct ownership;
- indirect ownership;
- voting control;
- board membership;
- executive role;
- beneficial interest;
- foundation/fund links;
- historical predecessor entities.

A shared surname NEVER proves common descent. A company name containing a surname NEVER proves family control. A group brand NEVER proves legal parenthood. These require sourced edges.

## 8. Canonical data files

- `schemas/dynasty_graph.schema.json` — machine contract.
- `data/dynasty/entities.jsonl` — nodes.
- `data/dynasty/relations.jsonl` — sourced edges.
- `scripts/validate_dynasty_graph.py` — structural validator.

Future ingestion SHOULD append evidence rather than silently overwriting disputed identities.

## 9. Merge rule

Two entities can be merged only when:

1. identity is explicit in a high-quality source; or
2. multiple independent attributes converge (name variant, office, territory, chronology, kinship) and no contradiction exists.

Otherwise use `possible_same_as` with `B2` or lower.

## 10. Objective

Build a single auditable graph capable of answering:

- Who is demonstrably related to whom?
- Which people merely belong to the same house/group?
- Which branch held which territory/title?
- Which modern family/surname controls or owns which holding/company/group?
- What is primary evidence vs later tradition vs modern reconstruction?
- Where is the exact documentary break in a lineage?

**ATLAS rule:** an explicit documentary gap is a valid conclusion. It must never be filled for aesthetic continuity.
