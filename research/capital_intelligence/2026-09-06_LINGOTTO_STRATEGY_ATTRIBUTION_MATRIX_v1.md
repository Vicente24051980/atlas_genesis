# CAPITAL INTELLIGENCE Ω — Lingotto Strategy Attribution Matrix v1

**Date:** 2026-09-06  
**Status:** RESEARCH / EVIDENCE-GRADED  
**Purpose:** de-mix Lingotto's aggregated 13F into strategy-attribution states without inventing CIO ownership of holdings.

## Core law
`AGGREGATED_13F_HOLDING != STRATEGY_ATTRIBUTION`

A holding is attributed to a Lingotto strategy only when independent public evidence identifies the strategy or its CIO in connection with that investment. Stylistic fit is not enough.

## Evidence tiers
- `A_EXPLICIT_AT_OR_NEAR_EVENT`: strategy/manager explicitly identified contemporaneously or near the investment period.
- `B_EXPLICIT_LATER`: later public evidence identifies the holding as part of the strategy, but does not prove strategy ownership at the original 13F entry date.
- `C_STYLE_MATCH_ONLY`: economically consistent with a strategy, but no independent attribution evidence.
- `U_UNRESOLVED`: no reliable attribution.

## Strategy anchors

### Intersection — Matteo Scolari
Public Exor disclosures identify the 2023 performance of the Concentrated Long / Long-Short strategies led by Matteo Scolari as being driven primarily by **Rolls-Royce, Carvana and Ocado**. Exor's 2024 shareholder reporting further states that the Carvana investment was built at the beginning of 2023 and that Rolls-Royce was Intersection's largest 2023 contributor.

Attribution state:
- Carvana → `A_EXPLICIT_AT_OR_NEAR_EVENT / INTERSECTION`
- Rolls-Royce → `A_EXPLICIT_AT_OR_NEAR_EVENT / INTERSECTION`
- Ocado → `A_EXPLICIT_AT_OR_NEAR_EVENT / INTERSECTION`

These are anchor names for style-cluster validation; they do not authorize attribution of other value/turnaround names by resemblance alone.

### Innovation — James Anderson / Morgan Samet
Lingotto describes Innovation as a concentrated, long-duration, multi-stage growth strategy led by James Anderson. Later strategy-specific public discussion identifies holdings including **Nvidia, TSMC, ASML, ServiceNow, Aurora Innovation, Pony.ai, Recursion and Tempus AI** as Innovation investments.

Attribution state for names overlapping the aggregated 13F:
- Nvidia → `B_EXPLICIT_LATER / INNOVATION`
- ServiceNow → `B_EXPLICIT_LATER / INNOVATION`
- Recursion Pharmaceuticals → `B_EXPLICIT_LATER / INNOVATION`
- TSMC → `B_EXPLICIT_LATER / INNOVATION` when present in later 13Fs
- Aurora Innovation → `B_EXPLICIT_LATER / INNOVATION` when present
- Pony.ai → `B_EXPLICIT_LATER / INNOVATION` when present
- Tempus AI → `B_EXPLICIT_LATER / INNOVATION` when present

Important: these later confirmations **do not prove** that Nvidia, ServiceNow or Recursion were already held specifically inside Innovation at their first aggregated-13F appearance in Q2-2023. For entry-date tests they remain `STRATEGY_AT_ENTRY = UNRESOLVED` unless contemporaneous evidence is found.

## Q2-2023 new-name treatment
The Q2-2023 aggregated Lingotto 13F added names including Enphase, Ginkgo, Intuitive Surgical, Joby, MercadoLibre, Microsoft, Moderna, Nvidia, Recursion, Sea, ServiceNow, Tesla and UBS while the inherited Exor Capital core remained visible.

Current attribution rules:
- Nvidia → `B_EXPLICIT_LATER / INNOVATION`; `AT_ENTRY_UNRESOLVED`
- ServiceNow → `B_EXPLICIT_LATER / INNOVATION`; `AT_ENTRY_UNRESOLVED`
- Recursion → `B_EXPLICIT_LATER / INNOVATION`; `AT_ENTRY_UNRESOLVED`
- Tesla → `C_STYLE_MATCH_ONLY` despite Anderson's historical Tesla association
- MercadoLibre → `C_STYLE_MATCH_ONLY`
- Moderna → `C_STYLE_MATCH_ONLY`
- Joby → `C_STYLE_MATCH_ONLY`
- Intuitive Surgical → `C_STYLE_MATCH_ONLY`
- Microsoft → `C_STYLE_MATCH_ONLY`
- Ginkgo → `C_STYLE_MATCH_ONLY`
- Enphase → `C_STYLE_MATCH_ONLY`
- Sea → `C_STYLE_MATCH_ONLY`
- UBS → `U_UNRESOLVED`

No `C_STYLE_MATCH_ONLY` name may be used in strategy-level alpha or persistence statistics.

## SEC manager-number clarification
The Q2-2023 13F cover page lists three "Other Included Managers":
1. Giovanni Agnelli B.V.
2. Exor N.V.
3. Lingotto Investment Management (UK) Limited

Therefore the `otherManager` numbers in the information table identify legal/reporting-manager relationships, **not Investment Strategy / CIO provenance**. They cannot be used to decompose Intersection vs Innovation.

## Backtest consequence
Run four separate populations:
1. `MANAGER_AGGREGATE_13F`
2. `STRATEGY_A_EXPLICIT`
3. `STRATEGY_B_LATER_CONFIRMED` — descriptive only for original-entry chronology unless attribution date is known
4. `UNATTRIBUTED_REMAINDER`

A strategy-level alpha claim requires contemporaneous or otherwise date-valid attribution. Later identification can support persistence analysis only from the first date at which strategy ownership is independently established.

## Falsifier
If a later primary or strategy-specific disclosure contradicts an attribution, downgrade the row immediately and recompute all strategy-level statistics.

## Sources used
- Exor 2023 Annual Report / shareholder letter: Scolari strategy returns and Rolls-Royce, Carvana, Ocado attribution.
- Exor Investor Day 30-Nov-2023: strategy/CIO architecture and AUM by strategy.
- Lingotto official strategy and Innovation pages: current strategy definitions and CIOs.
- Barron's May-2025 interview with James Anderson and Morgan Samet: Innovation holdings including Nvidia, TSMC, ASML, ServiceNow, Aurora, Pony.ai, Recursion and Tempus AI.
- SEC Q2-2023 13F cover page: other included managers are legal/reporting entities, not strategy labels.
