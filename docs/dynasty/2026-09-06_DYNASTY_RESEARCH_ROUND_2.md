# ATLAS DYNASTY / PROSOPOGRAPHY Ω — Research Round 2

## New structural findings

### Kamsarakan -> Pahlavuni -> Hetumid / Mkhargrdzeli
- Toumanoff: Kamsarakan is an offshoot of Karen Pahlav.
- After the 8th century the house bore the Pahlavuni surname in memory of that origin.
- After the end of the Bagratid monarchy, Pahlavuni branches moved into Cilicia and are identified by Toumanoff with the Hetumids, princes of Lambrun and kings of Armenia after 1226.
- Another branch is identified with the Zachariads/Mkhargrdzeli in Georgia.
- This must be modeled as branch/dynastic-continuity edges, not automatic father-son continuity unless a specific genealogy is sourced.

### Bagratuni -> Bagrationi
- Toumanoff treats Armenian Bagratuni and Georgian Bagrationi as one broad dynasty.
- The Georgian line is traced by him to Vasak, younger brother of Smbat VII, who went to Georgia after 775.
- Keep this as a historiographically reconstructed branch until the intermediate generation table is ingested source-by-source.

### Post-775 territorial concentration
After the failure of the 774-775 revolt:
- Bagratids gained principalities formerly held by Mamikoneans: Taraun, southern Tayk, Bznunik and later Bagrewand.
- Bagratids later purchased Aršarunik and Shirak (including Ani) from the weakened Kamsarakans.
- Some temporarily controlled territories such as Vaspurakan/Kogovit/Tmorik shifted between major houses.
- Armenia increasingly consolidated around three major formations: Arcrunid/Artsruni south, Siunid east, Bagratid west-central.

### Mamikonean decline is political, not necessarily biological extinction
- The house lost most domains after the 8th-century revolts.
- Musel, head of the house, died at Bagrewand in 775.
- A collateral branch retained part of southern Taraun.
- Garsoian notes descendants of Vardan II on Byzantine territory, including identifications reaching imperial elites.
- Therefore do not equate loss of Armenian landed power with extinction of all biological lines.

### Amatuni continuity / transformation
- Shahpuh Amatuni and son Haman migrated to Byzantine territory in 791 with a large following.
- Other Amatuni later appear as vassals of the Artsruni of Vaspurakan.
- In the 13th-14th centuries the house reappears under the name Vachutean in the Georgian sphere, under Pahlavuni/Mkhargrdzeli suzerainty.
- Model as possible dynastic-name transformation, not surname identity without sourced branch edges.

### Siwni / archive clue
- A Vahan, prince of Siwnik, requested under Khosrow Anoshirvan that the Siwnik archives be administratively transferred from Dvin to Phaitarakan/Atropatene.
- This confirms a high-status Siwni line in the 6th century between the 5th-century Vasak/Babgen block and the 7th-century Gregory block, but does NOT prove descent from Babgen.

## Graph rules reinforced
1. `dynastic_name_change` or `branch_of` must remain separate from `parent_of`.
2. Territorial transfer after war, purchase or inheritance must not imply genealogical transfer.
3. Political extinction of a house name != biological extinction.
4. Later reappearance under a new surname requires a sourced bridge.
5. Claims of royal/ancient descent remain `claims_descent_from` or `historiographically_derived_from` unless a continuous genealogy exists.

## Priority targets
1. Ingest the full Bagratuni table from c.555 to Ashot I.
2. Reconstruct Kamsarakan -> Pahlavuni intermediate generations.
3. Resolve Pahlavuni -> Hetumid and -> Mkhargrdzeli branch tables.
4. Fill Siwni 482 -> Vahan (6th c.) -> Gregory (636) without assuming direct descent.
5. Audit Artsruni 610 -> 8th-century Vahan block.
