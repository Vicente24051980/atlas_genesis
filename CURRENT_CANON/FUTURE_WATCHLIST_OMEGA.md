# ATLAS Ω — FUTURE WATCHLIST Ω

**Status:** CANONICAL / ACTIVE  
**Effective date:** 2026-08-17  
**Universe:** listed Future / watchlist candidates only  
**Portfolio effect:** NONE by itself

## 1. Canonical scope

This file defines the canonical **Future / Watchlist** universe supplied by the user on 17-Aug-2026.

The raw list contains **71 unique identifiers**. A strict portfolio↔watchlist exclusion is mandatory. The active ATLAS 36 portfolio currently contains 19 of those names, so the strict Future universe contains **52 candidates** after normalization.

**Law:** `ACTIVE_PORTFOLIO ∩ FUTURE_WATCHLIST = ∅`.

The separate private-company research on OpenAI / Anthropic / SpaceX is not this Future universe and must not overwrite it.

## 2. Portfolio overlaps removed — 19

`EXENS.PA, ARGX, ADYEN, PLMR, RBRK, IOT, CRDO, NXT, FTAI, SE, NU, WISE, HALO, WST, AXON, TJX, AEM, GEV, LNG`

These names remain auditable through the active portfolio pipeline but are excluded from Future Watchlist while held.

## 3. Identifier normalization

- `EXENS` → canonical market identifier `EXENS.PA`.
- `BITF` → **KEEL**. Bitfarms reorganized/redomiciled in 2026 into Keel Infrastructure Corp.; Future uses the current listed identifier.
- `NVT` = **nVent Electric**, not Navitas Semiconductor.
- `TERA` = `TICKER_AMBIGUOUS / DATA_FAIL` until the intended issuer is verified. Do not silently normalize to WULF or another company.
- `CHCI` = Comstock Holding Companies; category mismatch versus miner→HPC thesis.
- `CCOI` = Cogent Communications; reclassify to digital connectivity/fiber rather than miner→HPC.
- `AIIA` = AI Infrastructure Acquisition Corp.; blank-check/SPAC shell, not an operating AI-infrastructure company.
- `BTBT` = Bit Digital; reclassify to digital assets / WhiteFiber holding exposure rather than a clean direct miner→HPC operating peer.

## 4. Strict Future 52 by bucket

### Future Leaders / Growth — 9
`NBIS, FIX, MTSI, CRS, MTZ, GLNG, ON, FN, UBER`

### Power / Grid / AI Infrastructure — 9
`VRT, ETN, NVT, HUBB, BE, FCEL, NEE, DLR, EQIX`

### Power-to-AI / Miner → HPC / Neocloud — 18
`CORZ, APLD, IREN, KEEL, HUT, MARA, CIFR, RIOT, CLSK, BTBT, TERA, WYFI, CRWV, AIB, FUFU, CHCI, CCOI, AIIA`

### Energy / LNG — 7
`BKR, WMB, EQT, EXE, AR, RRC, CRK`

### Europe / Defense / Industrials — 3
`RHM.DE, HAG.DE, ATCO-A.ST`

### Hard Assets — 2
`FNV, NEM`

### Financial Plumbing / Insurance — 2
`CBOE, NDAQ`

### Discovery / verification — 2
`FRVO, KODK`

## 5. Current qualitative gate — 52/52

### ADVANCE — 20
`FIX, MTSI, CRS, UBER, VRT, ETN, NVT, HUBB, NEE, EQIX, BKR, WMB, EQT, AR, RRC, ATCO-A.ST, FNV, NEM, CBOE, NDAQ`

### ADVANCE_CONDITIONAL — 19
`NBIS, MTZ, GLNG, ON, BE, DLR, CORZ, APLD, IREN, HUT, CIFR, RIOT, CLSK, WYFI, CRWV, EXE, CRK, RHM.DE, HAG.DE`

### Event / optionality / watch / data-quality states — 13
- `FN` → **PENDING_EVENT** — Q4/FY26 result gate; do not pre-judge the event.
- `FCEL` → **NO_PASS_CURRENT** — weak current economic proof; optionality cannot substitute for economics.
- `KEEL` → **OPTIONALITY_ONLY** — HPC transformation still early; current earnings proof weak.
- `MARA` → **WATCH** — HPC/data-center proof less mature than leading transition peers.
- `BTBT` → **RECLASSIFY_WATCH** — digital assets + WhiteFiber holding exposure; not a clean direct HPC peer.
- `TERA` → **DATA_FAIL / TICKER_AMBIGUOUS**.
- `AIB` → **WATCH_HIGH_RISK** — very early AI/data-center development and external-capital dependence.
- `FUFU` → **WATCHLIST_PRIORITARIA / EARNINGS_INFLECTION** — explicitly not a confirmed BUY.
- `CHCI` → **CATEGORY_MISMATCH**.
- `CCOI` → **RECLASSIFY_WATCH / DIGITAL_CONNECTIVITY**.
- `AIIA` → **NO_PASS_OPERATING_SHELL**.
- `FRVO` → **OPTIONALITY_ONLY / PROJECT_EXECUTION**.
- `KODK` → **DISCOVERY_ONLY / DATA_RECOVERY_REQUIRED**.

No numeric Successor score is assigned unless the relevant weights and data are fully defined and reproducible.

## 6. Mandatory Future pipeline

Every Future candidate must be processed independently through:

`Evidence Integrity → Source Authenticity → Quantitative Integrity → ticker/corporate-action normalization → Principal Ω → Successor Detection Ω → Forward Asymmetry Ω → Global CAPEX Chain Ω → CAPEX Payback Ω when relevant → Capital Funding Quality Ω → Financed Demand Ω → Fragility Ω → Credit Transmission Ω → Hidden Concentration Ω → Valuation/Reverse Expectations → Entry Timing Ω → Falsifiers`.

A PASS in a specialized engine does not overwrite Principal Ω.

## 7. Power-to-AI special rule

Miner→HPC / neocloud candidates must not be scored as a single homogeneous group. Split the chain into:

1. **Contracted AI/HPC operators** — evidence of signed lease/managed-cloud demand.
2. **Power/site developers** — land/interconnect/power value before compute economics.
3. **Bitcoin-to-HPC transition** — legacy mining economics plus new AI execution.
4. **Neocloud / GPU cloud** — utilization, customer concentration, GPU financing and supplier/customer overlap.
5. **Holding/digital-asset structures** — optionality without direct operating comparability.
6. **Shell / ticker mismatch / category mismatch** — blocked from economic ranking until fixed.

Mandatory side gates: `CFQ_STATE + FD_STATE + CONTRACT_QUALITY + PROJECT_FINANCE_RECOURSE + CUSTOMER_CONCENTRATION + CAPEX_TO_COMMISSIONED_CAPACITY + CASH_COLLECTION`.

## 8. FUFU priority rule

FUFU remains explicitly:

**`WATCHLIST_PRIORITARIA / EARNINGS_INFLECTION / NO_CONFIRMED_BUY`**.

Promotion requires a verified inflection in operating economics — revenue quality, mining/cloud gross economics, EBITDA/OCF/FCF, customer retention and funding quality — not merely an earnings headline or share-price reaction.

## 9. Governance

- Portfolio and Future lists are mutually exclusive at every canonical snapshot.
- If a Future name enters portfolio, it is automatically removed from Future on the next reconciliation.
- If a portfolio name exits, it does not automatically return to Future; it must pass a fresh Future gate.
- Corporate actions and ticker changes update identity without fabricating performance discontinuities.
- `DATA_FAIL ≠ NO_BUY` and `CATEGORY_MISMATCH ≠ BUSINESS_FAILURE`.

## 10. Research reference

Full 52-name audit: `docs/atlas/research/2026-08-17_FUTURE_52_DEEP_AUDIT_V311_CFQ_FD.md`.
