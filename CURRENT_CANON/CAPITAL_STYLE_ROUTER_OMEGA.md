# CAPITAL STYLE ROUTER Ω v1.0

**Status:** CANONICAL / ACTIVE / TRANSVERSAL  
**Effective date:** 2026-09-04  
**Parent:** `CURRENT_CANON/CAPITAL_INTELLIGENCE_OMEGA.md`  
**Authority:** research classification + engine routing only. **No autonomous BUY/SELL authority.**

## Mission
Prevent ATLAS from scoring fundamentally different investment theses with one generic quality model.

`CAPITAL SIGNAL -> THESIS CLASSIFICATION -> STYLE-SPECIFIC GATES -> ATLAS COMMON GATES -> COMPETITION FOR CAPITAL`

A candidate discovered by CAPITAL INTELLIGENCE Ω must be classified before composite scoring.

## Universal anti-contamination law
- `QUALITY COMPOUNDER != NORMALIZATION / CONTRARIAN`
- `ALLOCATOR / HOLDING != OPERATING COMPANY`
- `STRATEGIC TURNAROUND != CURRENT QUALITY COMPOUNDER`
- `CAPITAL SIGNAL != BUY SIGNAL`
- `BAD CURRENT EARNINGS != BROKEN THESIS` when deterioration is explicitly temporary and normalization is documented.
- `GOOD HISTORICAL QUALITY != ATTRACTIVE CURRENT PRICE`.
- Scores from different thesis classes are **not directly interchangeable** unless normalized through Competition for Capital Ω.

## Router states
Exactly one PRIMARY_CLASS is required. Secondary tags are allowed.

### QCO — QUALITY COMPOUNDER Ω
Use when the thesis depends primarily on durable operating excellence and reinvestment.

Mandatory fields:
- revenue / organic growth durability
- gross and operating margin quality
- FCF and FCF/share
- ROIC / ROCE
- incremental ROIC
- balance sheet
- recurring / aftermarket / installed-base economics
- market share / moat
- valuation and expectation density
- reinvestment runway
- management / capital allocation
- cyclicality and concentration

Primary falsifiers:
- structural margin erosion
- declining incremental ROIC
- moat degradation
- persistent share loss
- leverage deterioration
- valuation requiring implausible execution

Examples for calibration only: Atlas Copco, Nasdaq, TSMC when thesis is operating compounding.

### NCO — NORMALIZATION / CONTRARIAN Ω
Use when current reported earnings or margins are depressed and the thesis depends on a measurable recovery toward normalized economics.

Mandatory fields:
- CURRENT_EARNINGS
- NORMALIZED_EARNINGS_RANGE
- normalization mechanism
- normalization timeline
- historical margin / EPS base
- temporary vs structural impairment test
- balance-sheet runway
- liquidity / refinancing
- regulatory / reimbursement / pricing lag where applicable
- management actions
- valuation on current earnings
- valuation on normalized earnings
- downside if normalization fails
- catalyst sequence

Required state ladder:
`N0_UNPROVEN -> N1_MECHANISM_IDENTIFIED -> N2_EARLY_EVIDENCE -> N3_NORMALIZATION_CONFIRMED -> N4_NORMALIZED`

Primary falsifiers:
- impairment becomes structural
- balance sheet cannot survive the recovery window
- pricing/regulatory response fails
- normalized earnings estimate repeatedly falls
- customer/member loss offsets margin recovery
- thesis requires multiple expansion without earnings recovery

Examples for calibration only: MOH, TEVA, selected distressed-to-compounder cases.

### ALO — ALLOCATOR INTELLIGENCE Ω
Use for listed holdings / capital allocators where the thesis depends substantially on capital allocation quality rather than one operating business.

Mandatory fields:
- NAV / look-through NAV
- discount/premium to NAV
- economic ownership vs voting control
- capital allocation record
- realized and unrealized IRR/TSR where available
- deployment capacity / liquidity
- leverage at holding level
- concentration by asset
- governance / succession
- buybacks / dividends
- acquisitions / disposals
- private/public mix
- manager / subsidiary quality
- sum-of-the-parts sensitivity

Required decomposition:
`HOLDCO_VALUE = LISTED_ASSETS + PRIVATE_ASSETS + MANAGER_VALUE + CASH - HOLDCO_DEBT - TAX/STRUCTURAL_LEAKAGE`

Primary falsifiers:
- persistent value-destructive capital allocation
- governance deterioration
- excessive holdco leverage
- widening discount without catalyst or buyback response
- low-quality asset concentration
- succession / control instability

Examples for calibration only: EXO, INVE-B.ST, PPLI.

### STO — STRATEGIC TURNAROUND Ω
Use when a strategic owner is accumulating or exerting influence while the operating company is undergoing multi-year repair.

Mandatory fields:
- strategic owner identity and economic stake
- ownership trajectory and dates
- governance rights / board rights / ownership ceiling
- operating repair plan
- revenue and margin inflection
- FCF normalization
- restructuring costs
- litigation / regulatory overhang
- balance sheet
- competitive position after repair
- valuation versus repaired earnings
- strategic-owner action falsifiers

Required state ladder:
`S0_STAKE_ONLY -> S1_REPAIR_PLAN -> S2_OPERATING_INFLECTION -> S3_FCF_CONFIRMATION -> S4_COMPOUNDER_TRANSITION`

Primary falsifiers:
- owner reduces materially without alternative explanation
- repair milestones missed repeatedly
- FCF fails to follow accounting improvement
- regulatory/product liability worsens
- repaired economics remain below cost of capital

Example for calibration only: Philips / Exor.

## Secondary tags
May coexist with PRIMARY_CLASS:
- `CAPITAL_CONVICTION`
- `CROSS_CAPITAL`
- `TOE_HOLD_VALIDATE_SCALE`
- `PERSISTENCE_AFTER_DRAWDOWN`
- `CONTROL_LEVERAGE`
- `FAMILY_CAPITAL_SWITCHBOARD`
- `DISTRESS_TO_COMPOUNDER`
- `HARD_ASSET_SCARCITY`
- `AI_RESILIENT_PHYSICAL_ASSET`
- `PRIVATE_TO_PUBLIC_TRANSLATION`

Secondary tags never select the scoring model by themselves.

## Common ATLAS gates after style-specific analysis
Every class still passes:
- Evidence Integrity Ω
- Source Authenticity Ω
- Quantitative Integrity Ω
- Temporal Normalization Ω
- Valuation / reverse valuation
- GREEN Ω
- balance sheet / liquidity
- management / governance
- risk / geopolitical risk
- Expectations Saturation Ω
- Entry Timing Ω
- Competition for Capital Ω
- portfolio concentration / chain budget
- Replacement Firewall where applicable

## Score discipline
ATLAS must output two separate numbers when CAPITAL INTELLIGENCE is involved:
1. `CAPITAL_SIGNAL_SCORE` — strength of allocator / ownership evidence.
2. `THESIS_SCORE` — score produced by the applicable style engine.

Optional third number:
3. `FINAL_COMPETITION_SCORE` — only after common gates and portfolio context.

Forbidden:
- averaging CAPITAL_SIGNAL_SCORE directly into company quality.
- giving a turnaround a low final score merely because current margins are intentionally at trough without testing normalization.
- giving a holdco a high score merely because its underlying listed assets are high quality without discount, leverage and allocation analysis.
- giving a compounder a high score without valuation.

## Decision matrix
- High capital signal + high thesis score -> PRIORITY RESEARCH / possible challenger.
- High capital signal + weak thesis score -> WATCH / learn allocator thesis; no buy.
- Weak capital signal + high thesis score -> standard ATLAS candidate; no capital-intelligence premium.
- High capital signal + DATA_FAIL -> EVIDENCE_PENDING, never forced score.

## Current calibration set — 2026-09-04
- `ATCO-B.ST` -> PRIMARY_CLASS `QCO`
- `INVE-B.ST` -> PRIMARY_CLASS `ALO`
- `EXO` -> PRIMARY_CLASS `ALO`
- `MOH` -> PRIMARY_CLASS `NCO`
- `TEVA` -> PRIMARY_CLASS `NCO`
- `PHG/PHIA` -> PRIMARY_CLASS `STO` with secondary `CAPITAL_CONVICTION`
- `PPLI` -> PRIMARY_CLASS `ALO` with secondary `CONTROL_LEVERAGE`

These mappings are calibration examples, not permanent labels; a company may migrate classes only when the thesis itself changes and the change is documented.

## Migration rules
- `NCO -> QCO` only after N3/N4 normalization plus durable reinvestment evidence.
- `STO -> QCO` only after S3/S4 and repaired economics prove durable.
- `ALO` remains ALO while holdco/allocator economics dominate valuation.
- Class migration must be logged with date, evidence and falsifier change.

## Output schema
For every CAPITAL INTELLIGENCE candidate:

`TICKER | POSITION_DATE | PUBLICATION_DATE | CAPITAL_SIGNAL | PRIMARY_CLASS | SECONDARY_TAGS | STYLE_STATE | CAPITAL_SIGNAL_SCORE | THESIS_SCORE | VALUATION_STATE | COMMON_GATES | FALSIFIERS | FINAL_STATUS`

## Canonical principle
**Follow the capital to discover. Use the correct thesis engine to judge. Use ATLAS common gates to decide.**
