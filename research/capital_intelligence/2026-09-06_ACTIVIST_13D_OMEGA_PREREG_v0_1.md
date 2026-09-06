# ACTIVIST 13D Ω — Preregistration v0.1

**Date:** 2026-09-06
**Status:** PREREGISTERED / RETURNS LOCKED

## Purpose
Test whether public Schedule 13D disclosures contain reproducible post-publication information after conditioning on the activist objective, regulatory regime and outcome path.

## Core law
`13D_FILED != ACTIVIST_ALPHA`.
The sample must distinguish passive/investment-purpose 13D filings from control-oriented or governance-oriented engagements.

## Timestamp law
Backtest clock starts at `PUBLICATION_TIMESTAMP` of the initial 13D or amendment that first reveals the tested objective. Never use the 5% crossing date as a tradable timestamp.

## Regulatory regime split
- `R0_PRE_2024-02-05`: historic initial 13D filing window up to 10 days after triggering event.
- `R1_POST_2024-02-05`: initial 13D filing deadline 5 business days.
Regimes are estimated separately before any pooled result.

## Frozen identity fields
`ISSUER_CIK | TICKER | FILER | FILER_TYPE | ACCESSION | INITIAL_OR_AMENDMENT | PUBLICATION_TIMESTAMP | BENEFICIAL_OWNERSHIP_PCT | ITEM4_TEXT | OBJECTIVE_CLASS | SOURCE_OF_FUNDS | BOARD_SEAT_STATE | NOMINATION_STATE | SALE_PROCESS_STATE | MNA_PROPOSAL_STATE | CAPITAL_ALLOCATION_DEMAND | GOVERNANCE_DEMAND | OPERATIONAL_DEMAND | EXIT_STATE | REGULATORY_REGIME`

## Item 4 objective taxonomy
Mutually non-exclusive raw tags, plus one primary class:
- `INVESTMENT_ONLY`
- `GOVERNANCE_ENGAGEMENT`
- `BOARD_SEAT_OR_NOMINATION`
- `OPERATIONAL_CHANGE`
- `CAPITAL_ALLOCATION_CHANGE`
- `STRATEGIC_REVIEW_OR_SALE`
- `MNA_OR_CONTROL_PROPOSAL`
- `BLOCK_EXIT_OR_DISTRIBUTION`
- `OTHER`

Primary class must be assigned from contemporaneous Item 4 text before returns are opened.

## Outcome law
Outcome is not allowed to redefine entry eligibility ex post. Outcomes are recorded only for conditional analysis:
`NO_OBSERVED_OUTCOME | PARTIAL_CONCESSION | BOARD_GAIN | STRATEGIC_CHANGE | SALE/MERGER | CAPITAL_RETURN | ACTIVIST_EXIT | FAILED_CAMPAIGN | OPEN`

## Pre-registered tests
- Initial 13D vs 13D/A objective escalation.
- Governance/board vs strategic sale/M&A vs investment-only.
- Activists with prior validated track record vs unvalidated filers, where track record is measured only from prior public campaigns.
- Pre- vs post-Feb-2024 disclosure regime.
- Outcome-conditioned analysis reported separately and never used to define the tradable sample.

## Falsifiers
- Post-publication alpha disappears under the 5-day regime.
- Apparent alpha is entirely announcement-gap capture unavailable to a public follower.
- Results are concentrated in later-acquired targets.
- Investment-only 13D performs similarly to explicit activism, implying Item 4 taxonomy adds no information.
- Results disappear after sector/size/value/momentum controls.
- A few activist franchises explain the entire sample.

## Outputs after freeze
1D/5D announcement response for description only, plus 1M/3M/6M/12M tradable post-publication returns; sector and broad-market excess; median/mean; hit rate; MFE/MAE; campaign-clustered inference.

## Literature priors — not ATLAS validation
Prior international evidence finds that activist engagements achieving outcomes have materially stronger abnormal returns than engagements without outcomes. The 2024 SEC regime change shortens the initial 13D disclosure window from 10 days to 5 business days, requiring explicit regime control in any historical test.

## State
`ACTIVIST_13D_STATE = A0_UNTESTED`
`RETURNS_ACCESS = LOCKED`
