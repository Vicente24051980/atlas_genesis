# PUBLIC CAPITAL SIGNALS Ω — preregistration v0.1
Date: 2026-09-06
Status: RESEARCH ONLY / ALL SIGNALS UNVALIDATED

## Purpose
Expand CAPITAL INTELLIGENCE Ω beyond allocator 13F copying. Every public signal starts at zero and earns status only through point-in-time backtesting.

## Universal laws
1. PUBLICATION-TIME LAW: event time is the first timestamp at which the information was public and usable.
2. NO PRESTIGE TRANSFER: famous insider, activist, family, fund or allocator receives no automatic quality prior.
3. NO HINDSIGHT: event definitions and exclusions are frozen before returns are opened.
4. NEGATIVES INCLUDED: failed purchases, reductions, abandoned campaigns and non-events remain in the sample.
5. INDEPENDENCE GATE: correlated manifestations of one underlying event cannot be counted as multiple independent confirmations.
6. LEGAL-PUBLIC-DATA ONLY: no attempt to infer or exploit material non-public information.
7. SIGNAL != ALPHA != BUY. Discovery priority is distinct from economic-route underwriting and portfolio action.

## Signal families
### S1 — INSIDER PURCHASE Ω
Source: SEC Forms 3/4/5.
Candidate event: open-market purchase transaction code P.
Fields: issuer, CIK, insider identity, role, transaction date, filing timestamp, shares, price, dollar value, direct/indirect ownership, post-trade ownership, 10b5-1 flag/footnotes.
Ex ante variants to test separately: CEO; CFO; director; >1 insider within fixed window; purchase value relative to prior beneficial ownership.
Do not pool sales with purchases. Exclude awards/exercises/conversions from the purchase signal.

### S2 — ACTIVIST / BLOCKHOLDER Ω
Source: Schedule 13D/13D-A; 13G maintained as a separate passive/blockholder family.
Fields: filer, issuer, filing timestamp, ownership %, Item 4 purpose, amendments, board/observer rights, strategic alternatives, sale/M&A objective, capital-allocation demand, governance demand, settlement/outcome.
Never assign alpha from activist reputation before allocator-specific validation.

### S3 — CAPITAL ALLOCATION EXECUTION Ω
Source: 10-Q/10-K/8-K and issuer repurchase tables.
Announcement alone = no positive event.
Candidate events require executed repurchases and measurement of diluted share-count change; distinguish gross repurchase spend from net share shrinkage after SBC/issuance.
Fields: authorization, actual purchases, average paid price where disclosed, diluted shares, SBC/issuance, debt/FCF context.

### S4 — ALLOCATOR OWNERSHIP Ω
Source: 13F/13F-HR-A and other ownership filings.
Keep existing Lingotto rules: corporate-action normalization, CUSIP+class+put_call identity, amendment semantics, publication-date returns, visible-book denominator only.
Allocator receives a reliability weight only after its own out-of-sample validation.

### S5 — INDEPENDENT CONSENSUS Ω
Candidate event: two or more independently validated public actors change exposure to the same issuer inside a preregistered window.
Required: independence check, publication timestamps, no double-counting affiliated managers, no same-source derivative repetition.
Consensus count alone has no score.

### S6 — POSITION ESCALATION / PERSISTENCE Ω
Sequences tested separately: NEW→ADD25; NEW→ADD50; ADD25→ADD25; PERSIST3Q; CUT25; CUT50; EXIT.
Corporate actions normalized first. Visible weight and raw/economic share change remain separate.

### S7 — CROSS-SIGNAL CONVERGENCE Ω
Examples to test only after individual-family validation: public insider purchase + public 13D; allocator accumulation + executed net buyback; activist + improving fundamental evidence.
Convergence can graduate only if incremental information survives conditional tests versus its strongest component alone.

## Mandatory confounder registry
- stock splits/reverse splits, mergers/exchanges and CUSIP changes
- options vs common stock
- 10b5-1 plans and transaction-code semantics
- insider grants/exercises/tax withholding
- passive 13G vs activist 13D
- filing amendments
- repurchase authorization vs execution
- SBC offsetting buybacks
- sector/momentum/size/value exposures
- overlapping events and repeated observations
- survivorship, look-ahead and delisting bias

## Backtest contract
For each family freeze: universe; eligibility; event definition; publication timestamp; exclusion rules; benchmark; horizons; transaction-cost assumption; overlap treatment; minimum sample; primary statistic; falsifier.
Base horizons: 1M, 3M, 6M, 12M, 24M where history permits. Report market- and sector-adjusted returns, median and mean, hit rate, MAE/MFE, drawdown, confidence intervals and regime splits. Long-horizon inference must correct for overlapping observations.

## Validation states
A0_UNTESTED
A1_DATASET_INCOMPLETE
A2_TESTABLE_FROZEN
A3_NO_ROBUST_ALPHA
A4_WEAK_OR_REGIME_DEPENDENT
A5_PERSISTENT_POST_PUBLICATION_ALPHA
A6_OUT_OF_SAMPLE_REPLICATED

Only A5/A6 can receive persistent research priority. None generates an automatic BUY.

## Initial research priority
P1: Form 4 open-market purchases.
P1: initial Schedule 13D + Item 4 taxonomy.
P1: executed repurchases / net diluted-share shrinkage.
P2: allocator consensus after allocator-specific validation.
P2: escalation/persistence sequences.
P3: cross-signal convergence after component tests.

## Evidence rationale frozen before testing
Academic evidence motivates testing but is not treated as proof for ATLAS. Prior literature reports information content in insider purchases and sizeable announcement reactions around initial 13D filings; takeover outcomes explain an important part of activist long-run performance. A 2025 study reports abnormal insider buying before hedge-fund 13D filings, which is precisely why ATLAS will only use signals after public disclosure and will not attempt to infer pre-disclosure activity.

## Current state
PUBLIC_CAPITAL_SIGNALS_STATE = A0_UNTESTED
RETURNS_ACCESS = LOCKED until each family dataset/event definition is independently frozen.
