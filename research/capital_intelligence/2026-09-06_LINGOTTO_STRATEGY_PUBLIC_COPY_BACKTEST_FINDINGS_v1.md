# CAPITAL INTELLIGENCE Ω — Lingotto strategy-level public-copy backtest v1

**Date:** 2026-09-06  
**Status:** PILOT / EVIDENCE-GRADED / NO SKILL CLAIM  
**Purpose:** test whether publicly attributable strategy baskets retained information after the attribution itself became public.

## Anti-hindsight execution law
A security enters a strategy-level copy basket only after strategy attribution is publicly observable. Same-day close is prohibited. Execution is the first full market close after publication.

- Intersection attribution source date: 2024-04-12 (Exor 2023 Annual Report). First full subsequent trading close: 2024-04-15.
- Innovation attribution source date: 2025-05-23 (James Anderson / Morgan Samet interview identifying holdings). 2025-05-26 was a US market holiday; first full subsequent trading close: 2025-05-27.

This test therefore does **not** backdate returns to the original investment date.

## Intersection — explicit strategy anchors
Basket: Carvana, Rolls-Royce, Ocado. These are explicitly attributable to Matteo Scolari / Intersection in Exor reporting.

From first tradable close after public attribution to 2026-09-04:

| Security | Raw return | Broad benchmark | Benchmark return | Excess |
|---|---:|---|---:|---:|
| Carvana | +433.93% | SPY | +52.68% | +381.25 pp |
| Rolls-Royce | +266.13% | FTSE 100 | +35.97% | +230.15 pp |
| Ocado | -40.55% | FTSE 100 | +35.97% | -76.52 pp |

Equal-weight arithmetic return: **+219.84%**.  
Median constituent return: **+266.13%**.  
Positive constituents: **2/3**.  
Benchmark-beating constituents: **2/3**.

Interpretation: there is a very large post-publication signal in this tiny explicit basket, but it is not evidence of a general allocator effect. The result is based on only three names and two extreme winners. It should be treated as `STRATEGY_SIGNAL_CANDIDATE`, not validated alpha.

## Innovation — later-confirmed strategy basket
Basket: Nvidia, TSMC, ASML, ServiceNow, Aurora Innovation, Pony.ai, Recursion Pharmaceuticals, Tempus AI. Public strategy identification is later than many original entries, so this test starts only when the attribution itself is independently public.

From 2025-05-27 to 2026-09-04:

- Equal-weight arithmetic return: **+25.08%**.
- QQQ return: **+37.94%**.
- Equal-weight excess vs QQQ: **-12.86 pp**.
- Median constituent return: **+0.60%**.
- Positive constituents: **4/8**.
- QQQ-beating constituents: **3/8**.

The three semiconductor names dominate the result: ASML +126.60%, TSMC +116.97%, Nvidia +70.00%. ServiceNow, Pony.ai, Recursion and Tempus were negative over the window; Aurora was only slightly positive. Consequently the aggregate raw return masks weak breadth.

Interpretation: `INNOVATION_PUBLIC_COPY_ALPHA = NOT_DEMONSTRATED` in this pilot. The basket earned a positive raw return but lagged QQQ on an equal-weight basis, and the median constituent was approximately flat. This does not mean the Innovation strategy itself lacked alpha: the public basket is incomplete, public attribution is late, position weights are unknown, private holdings are omitted, and exits/additions after the disclosure are not represented.

## Critical contrast
`INTERSECTION_EXPLICIT` and `INNOVATION_LATER_CONFIRMED` behave very differently after becoming publicly identifiable. This falsifies the useful null that all Lingotto-attributed names can be treated as one homogeneous capital-intelligence signal.

Therefore:

`LINGOTTO_AGGREGATE_SIGNAL != STRATEGY_SIGNAL`

and

`STRATEGY_IDENTITY != ALPHA`

## Aggregate-13F comparator status
A clean manager-aggregate comparator is **not yet computed** because the repository does not yet contain a fully normalized, corporate-action/amendment-reconciled 2024-2025 aggregate event ledger. Constructing an aggregate result from raw filings now would violate the same controls already imposed elsewhere in CAPITAL INTELLIGENCE Ω.

State: `MANAGER_AGGREGATE_COMPARATOR = BLOCKED_PENDING_NORMALIZED_2024_2025_LEDGER`.

Do not replace this with an approximate or cherry-picked aggregate basket.

## Promotion gates
Intersection may move from pilot to candidate only after:
1. expanding the explicit-attribution population beyond the three 2023 anchors;
2. applying sector/local benchmarks and total-return treatment consistently;
3. testing multiple public attribution/events rather than one publication date;
4. verifying that results survive equal-weighting, winsorization and leave-one-out tests.

Innovation requires date-valid strategy disclosures at multiple dates plus position-weight or ranking information before any skill or copy-alpha claim.

## Current states
- `INTERSECTION_PUBLIC_COPY = STRATEGY_SIGNAL_CANDIDATE / VERY_SMALL_N`
- `INNOVATION_PUBLIC_COPY = NO_ALPHA_DEMONSTRATED_V1`
- `LINGOTTO_MANAGER_AGGREGATE = UNTESTED_CLEAN_COMPARATOR`
- `CAPITAL_INTELLIGENCE_DIRECT_SCORE_CONTRIBUTION = 0`
