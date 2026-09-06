# CAPITAL INTELLIGENCE Ω — Exor Capital → Lingotto deep transition audit

**Date:** 2026-09-06  
**Status:** PRIMARY + OFFICIAL-SOURCE RESEARCH / NO SKILL INFERENCE  
**Scope:** organizational transition, 13F continuity/discontinuity, strategy-mixture risk, and implications for backtest design.

## Executive finding
The 2023 transition is neither a clean break nor a pure rename.

Official Exor material shows that the reorganization was announced on 2022-11-01 after the PartnerRe sale. The planned Lingotto platform was to encompass at least two existing alternative investment strategies: Matteo Scolari public markets and Nikhil Srinivasan private markets, with Enrico Vellano as CEO. Lingotto was officially launched in May 2023.

The 13F evidence is consistent with this staged transition:
- 2022Q4: Exor Capital LLP, 18 entries, visible value $1.333bn.
- 2023Q1: Exor Capital LLP remains filer.
- 2023Q2: Lingotto Investment Management LLP becomes filer, same CIK / same 13F file number.
- Q1→Q2 2023: all 20 long securities visible in Q1 survive into Q2; 13 new long securities are added.

Therefore:
`NAME_CHANGE != CLEAN_PROCESS_BREAK`
`LEGAL_CONTINUITY != SKILL_CONTINUITY`
`BOOK_CONTINUITY + STRATEGY_EXPANSION = OBSERVED`

## Q1→Q2 2023 transition structure
The Q1 2023 long book contains 20 visible securities. Q2 contains 33, and the prior 20 are all still represented.

### Inherited visible core retained into first Lingotto filing
ARK Fintech Innovation ETF; Cameco; Carlyle; Carvana; Desktop Metal; Fathom Digital Manufacturing; Gatos Silver; Harmony Gold; KraneShares CSI China Internet; NexGen Energy; NovaGold; Paramount Global; Range Resources; Schlumberger; Skillsoft; Teva; Valaris; VanEck Junior Gold Miners; VEON; Weatherford.

### New visible securities in 2023Q2
Enphase Energy; Ginkgo Bioworks; Intuitive Surgical; Joby Aviation; MercadoLibre; Microsoft; Moderna; Nvidia; Recursion Pharmaceuticals; Sea; ServiceNow; Tesla; UBS.

This pattern is not consistent with a total liquidation/reconstitution at the moment of the Lingotto launch. It is consistent with an inherited core plus new sleeves or strategy capacity.

## Strategy-mixture bias Ω
Lingotto is explicitly organized as a multi-strategy platform with distinct CIO-led strategies. Public official descriptions identify:
- Intersection: concentrated public equity / long-only and long-short, fundamental bottom-up.
- Horizon: private/opportunistic.
- Innovation: multi-stage growth / public + private, concentrated long-term.
- Mosaic: cross-asset private markets.

The SEC 13F is filed at manager level, not as a clean strategy-level decomposition. Therefore a position-level event in the aggregated 13F cannot be assumed to originate from a single CIO or process.

Mandatory rule:
`AGGREGATED_13F_EVENT -> STRATEGY_ORIGIN = UNRESOLVED` unless an independent source identifies the sleeve.

Do not infer that a Q2-2023 new technology/growth name necessarily belongs to Innovation merely because the economic style fits. That is a plausible classification hypothesis, not sourced attribution.

## Backtest redesign
A single pooled Lingotto alpha test risks measuring changing strategy mix rather than manager skill.

Required model hierarchy:
1. `MANAGER_AGGREGATE_TEST` — the public 13F as actually observable to a copier.
2. `INHERITED_CORE_COHORT` — securities already present before formal Lingotto launch.
3. `POST_LAUNCH_NEW_COHORT` — securities first appearing after formal launch.
4. `STYLE_CLUSTER_TEST` — unsupervised/descriptive clusters by sector/factor/style, without assigning CIO identity.
5. `NAMED_STRATEGY_TEST` — only when public documentation independently identifies strategy ownership.

No pooling across these cohorts should occur before robustness tests.

## Change-point hypothesis
Define candidate structural breaks ex ante:
- T1 = 2022-11-01 reorganization announcement.
- T2 = 2023-05 official Lingotto launch.
- T3 = 2023Q2 first 13F filed under Lingotto name.

Test for discontinuity in:
- number of visible long lines;
- concentration / HHI;
- sector and factor composition;
- one-way share turnover;
- new-name rate and exit rate;
- median position age (censoring-aware);
- long/short/option instrument mix where observable.

Do not choose the break after seeing the strongest statistic.

## Prestige Transfer Gate implication
Exor/Lingotto official material states long-term ambition, differentiated talent and willingness to accept concentration, illiquidity and volatility. These are process claims, not evidence of alpha.

`PRESTIGE_TRANSFER_GATE = ACTIVE`
`OFFICIAL_PROCESS_CLAIM != VALIDATED_SKILL`

## State after this audit
- `LEGAL_CIK_CONTINUITY = TRUE`
- `ORGANIZATIONAL_REORGANIZATION = PRIMARY_CONFIRMED`
- `FORMAL_LINGOTTO_LAUNCH = MAY_2023`
- `Q1_TO_Q2_2023_INHERITED_LONG_SURVIVAL = 20/20`
- `Q2_2023_NEW_LONG_NAMES = 13`
- `CLEAN_BREAK_HYPOTHESIS = REJECTED_DESCRIPTIVELY`
- `MULTI_STRATEGY_MIXTURE = PRIMARY_CONFIRMED`
- `STRATEGY_LEVEL_ATTRIBUTION_FROM_13F = PROHIBITED_WITHOUT_EXTERNAL_IDENTIFICATION`
- `LINGOTTO_SKILL = A1_SAMPLE_INCOMPLETE`

## Next required work
1. Complete Q3/Q4-2023 and 2024 snapshots with the same cohort tags.
2. Build `INHERITED_CORE vs POST_LAUNCH_NEW` survival/turnover tables.
3. Run formal change-point statistics on concentration, breadth and turnover.
4. Reconcile all amendments/corporate actions before returns.
5. Only then join post-publication prices and sector/factor benchmarks.
