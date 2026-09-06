# LINGOTTO PROCESS REGIME + STRATEGY ATTRIBUTION AUDIT Ω

**Status:** CANONICAL RESEARCH CONTROL / PRE-RETURNS  
**Date:** 2026-09-06

## Why this audit exists
The same SEC filer CIK (`0001732768`) spans multiple legal names and, more importantly, multiple investment-process regimes. A single CIK must not be treated as proof of one continuous strategy or one continuous portfolio manager.

Canonical rule:

`SAME_CIK != SAME_INVESTMENT_PROCESS`

## Primary-source chronology
### 2015–2017 — Matteo Scolari public-equities activity begins
- Lingotto's official profile states Matteo Scolari joined Exor in 2015 and founded the strategy later called **Intersection** the following year.
- Exor's 2021 Annual Report states that **March 2022 marked the 5th anniversary of its public equities investment activity steered by Matteo Scolari and his team**, implying a live investment track-record inception around March 2017.
- Therefore distinguish `STRATEGY_FORMATION` from `TRACK_RECORD_INCEPTION`:
  - strategy formation/design: ~2016;
  - reported live public-equities track record: ~March 2017.

### 2017–2022 — Exor / PartnerRe public-equities regime
Exor states that Matteo's team managed public-equity funds using capital from Exor and PartnerRe.

Reported manager-level performance (Exor primary disclosure; gross, not independently replicated here):
- four years since inception, reported in the 2020 shareholder letter: cumulative gross return `174.4% USD`, `28.5% annualized`, no down years attributed to hedging; MSCI World Total Return comparator `64.3%`, `13.1% annualized`;
- five-year anniversary, reported in 2021 Annual Report: cumulative gross return `207.1% USD`, `24.7% annualized`, no down years; comparator `81.5%`, `12.5% annualized`;
- 2022 Annual Report: cumulative gross return `191.9% USD`, `19.3% annualized`, no down years; comparator `68.8%`, `9.0% annualized`.

Evidence state:
`MANAGER_REPORTED_TRACK_RECORD = PRIMARY_SOURCE / GROSS / NOT_INDEPENDENTLY_REPLICATED`

This is evidence about Scolari/team skill. It is **not** evidence inherited from the Agnelli lineage and does not pass the post-publication replication test by itself.

### 2018 onward — SEC 13F visibility
The same filer appears in SEC 13F history under former names including `Exor Investments (UK) LLP` and `Exor Capital LLP`.

Historical 13F composition aligns with themes explicitly attributed by Exor to Matteo's public-equity activity:
- 2019-09-30 visible book: Cameco, Harmony Gold, New Gold, NovaGold, Sibanye Stillwater, VEON;
- 2020-03-31 visible book adds Range Resources and Schlumberger while retaining uranium/PGM/gold positions.

Exor later described uranium, PGMs, gold miners and oil services as major Scolari themes. This alignment is supporting evidence that the filer captured at least part of Matteo's public-equity activity, but **does not prove every security row in every filing belongs to Intersection**.

### 2022 reorganization
On 2022-11-01 Exor announced that, after the PartnerRe sale, investment activities previously managed on behalf of PartnerRe would be reorganized under the name **Lingotto**, encompassing:
- Matteo Scolari's public-market strategy;
- Nikhil Srinivasan's private-market strategy.

At that time Lingotto had around €2bn AUM contributed approximately equally by Covéa and Exor.

### May 2023 — official Lingotto establishment
Exor's current Lingotto page states Lingotto was **established in May 2023**. SEC Q2-2023 is the first verified filing in the current study window under the Lingotto name.

This is a legal/organizational launch point, not the beginning of Scolari's live investment record.

## Critical second problem — the 13F becomes multi-strategy
Current Lingotto is not a single-strategy manager.

Exor 2025 Annual Report identifies at least four strategies:
- Intersection — Matteo Scolari;
- Horizon — Nikhil Srinivasan;
- Innovation — James Anderson;
- Mosaic — Pam Chan.

The same annual report explicitly attributes:
- **Intersection:** precious-metals mining, Carvana, Paramount-Skydance, and increased Schlumberger exposure;
- **Innovation:** Tempus AI and Aurora Innovation among public positions/contributors/detractors.

Yet Tempus and Aurora also appear in Lingotto's SEC 13F under the same reporting manager.

Therefore:

`LINGOTTO_13F != INTERSECTION_PORTFOLIO`

and

`LINGOTTO_13F = MULTI_STRATEGY_VISIBLE_BOOK` unless strategy attribution is independently documented.

## STRATEGY ATTRIBUTION GATE Ω
For every 13F row, store:

`MANAGER = Lingotto`
`STRATEGY = {INTERSECTION | INNOVATION | HORIZON | MOSAIC | UNKNOWN}`
`STRATEGY_ATTRIBUTION_SOURCE`
`STRATEGY_ATTRIBUTION_CONFIDENCE`

Rules:
1. `STRATEGY=INTERSECTION` only when a primary or strong secondary source explicitly attributes the security/theme to Scolari/Intersection.
2. `STRATEGY=INNOVATION` only when explicitly attributed to James Anderson/Innovation.
3. Never infer strategy from style alone (e.g. mining → Intersection, AI → Innovation) without evidence.
4. `UNKNOWN` is the default.
5. Manager-level backtests may include UNKNOWN rows; strategy-level backtests may not.

## Process regimes for backtesting
### REGIME S0 — Scolari/Exor public-equities regime
Approximate live track-record inception: `2017-03`.

SEC-visible subset begins later and must be dated from first verified filing under CIK 0001732768.

Interpretation:
- primarily testable as `SCOLARI_PUBLIC_EQUITIES_VISIBLE_BOOK` only where attribution chain remains defensible;
- still incomplete because 13F omits non-US securities, shorts and other exposures.

### REGIME L1 — Lingotto manager-level multi-strategy regime
Start: `2023-05` official establishment / Q2-2023 first verified current-window Lingotto filing.

Interpretation:
- test `LINGOTTO_MANAGER_PUBLIC_DISCLOSURE_SIGNAL`;
- do not label the whole 13F as Scolari/Intersection;
- split by documented strategy where possible.

## Required separate hypotheses
### H-SCOLARI
Publicly observable securities attributable to Scolari/Intersection retain post-publication alpha after disclosure latency.

### H-LINGOTTO
The aggregate multi-strategy Lingotto public-disclosure book retains post-publication alpha after disclosure latency.

These hypotheses must never be pooled silently.

## Prestige Transfer Gate status
The prior concern that Lingotto skill was being inherited from Agnelli prestige is now partly resolved:
- lineage prestige remains irrelevant to skill;
- there is manager-specific primary evidence of Scolari public-equity performance;
- however that evidence is gross, manager-reported and not sufficient for replication.

State:
`PRESTIGE_TRANSFER = BLOCKED`
`SCOLARI_SKILL_EVIDENCE = PRIMARY_SELF_REPORTED_GROSS`
`POST_PUBLICATION_ALPHA = UNTESTED`

## Consequence for current CAPITAL INTELLIGENCE Ω
Capital Intelligence remains a sourcing hypothesis, not a buy signal.

The backtest must now produce at least two scorecards:
1. `SCOLARI / INTERSECTION` — only strategy-attributable events;
2. `LINGOTTO AGGREGATE` — all manager-visible events.

If aggregate Lingotto works but Intersection does not, the edge cannot be credited to Scolari.
If Intersection works but aggregate Lingotto does not, the manager-level signal is diluted by strategy mixing.
If neither works post-publication, CAPITAL INTELLIGENCE Ω must be degraded regardless of reported internal performance.

## Current state
`PROCESS_REGIME_STATE = PARTIALLY_RESOLVED`
`STRATEGY_ATTRIBUTION_STATE = OPEN`
`RETURNS_GATE = LOCKED`
