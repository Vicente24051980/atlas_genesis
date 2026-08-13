# RFC-RESEARCH-003 — Financial History + Competitive Moat Matrix + Bull/Bear Adversarial Review Ω

Status: CANONICAL
Date: 2026-08-13
Scope: ATLAS Ω Enterprise equity research

## Purpose
Integrate the useful elements extracted from the reviewed nine-part equity-analysis checklist without duplicating existing ATLAS Ω engines or weakening evidence governance.

## 1. Financial History Ω
Mandatory longitudinal financial evidence layer for company audits.

Minimum default window: 5 fiscal years where available, plus latest reported period/TTM when appropriate.

Required series:
- Revenue and growth
- Net income / normalized earnings trend
- Free cash flow and FCF conversion
- Gross, operating and net margins where economically meaningful
- Gross debt, net debt and liquidity
- ROIC / return on capital, with methodology stated

Rules:
- A single quarter cannot establish structural quality or deterioration by itself.
- Structural conclusions must distinguish trend, cyclicality, accounting effects and one-offs.
- Primary-source evidence is preferred; unverified inputs remain Pending Primary Validation.
- Financial History Ω feeds Financial Quality, Growth, Quality and Valuation; it does not create an independent BUY/SELL signal.

## 2. Competitive Moat Matrix Ω
A standardized competitive-advantage matrix embedded in Moat / Business Quality.

Dimensions:
1. Brand / trust
2. Network effects
3. Switching costs / workflow lock-in
4. Cost advantage / scale economics
5. Proprietary technology, IP, patents or unique know-how

Execution:
- Compare each relevant dimension with named principal competitors.
- Score each applicable dimension 0–10 with evidence and confidence.
- Mark non-applicable dimensions N/A rather than forcing a score.
- Record moat direction: strengthening / stable / weakening.
- Separate observed evidence from interpretation.

The matrix is diagnostic evidence. It does not override the canonical ATLAS Ω scoring weights.

## 3. Bull/Bear Adversarial Review Ω
Mandatory adversarial pass before a material conviction change, new BUY candidate, SELL based on thesis deterioration, or major ranking change.

Procedure:
1. Construct the strongest evidence-based bull case.
2. Construct the strongest evidence-based bear case using the same evidence set and validation rules.
3. Identify disagreements in assumptions, time horizon and causal interpretation.
4. Identify decisive evidence, missing evidence and explicit falsifiers.
5. Bias Control Ω evaluates asymmetric treatment of evidence.
6. Decision Discipline Ω resolves the decision under the canonical rules.

Rules:
- No invented advocacy and no role-play as a substitute for evidence.
- Bull and bear cases must cite equivalent-quality evidence.
- Absence of evidence is not evidence for either side.
- The exercise cannot independently trigger BUY or SELL.

## 4. Existing ATLAS Ω coverage retained
The source checklist's remaining concepts are already covered by existing engines/layers:
- Business model and revenue sources → Business Ω
- Sector trends → Macro Context / Business Ω
- Financial health → Quality / Financial Quality
- Valuation, DCF and relative multiples → Valuation Ω
- Economic, competitive, regulatory and financing risks → Risk Ω
- Growth runway → Growth
- Institutional-quality investment thesis → Decision Discipline / portfolio process
- Earnings review → Evidence Ω + engine-specific updates

No nine new engines are created.

## 5. Explicit exclusions
ATLAS Ω does NOT adopt these as mechanical rules:
- P/E versus sector average as sufficient valuation evidence.
- DCF as a single-point intrinsic-value oracle.
- Generic 'act as Wall Street/hedge fund' prompting as evidence.
- Market reaction to one earnings release as proof of thesis validity.
- Any conclusion lacking source provenance or validation state.

## 6. Engine integration
Pipeline hooks:
- Evidence Ω → supplies validated longitudinal and competitor evidence.
- Business Ω / Quality Ω → consume Financial History Ω.
- Moat → consumes Competitive Moat Matrix Ω.
- Risk Ω → consumes identified moat deterioration and financial-history risks.
- Valuation Ω → uses normalized historical economics and scenario ranges.
- Bias Control Ω → consumes Bull/Bear Adversarial Review Ω.
- Decision Discipline Ω → adjudicates final action; no new module bypasses it.

## 7. Output contract additions
Company audit reports should expose, when material:
- financial_history_5y
- moat_matrix
- moat_direction
- bull_case
- bear_case
- decisive_evidence
- missing_evidence
- falsifiers
- validation_state

## Governance
This RFC extends the existing ATLAS Ω Enterprise architecture. It does not replace canonical scoring, GREEN CONTINUITY Ω, Engine Contract Ω, epistemic-integrity rules, or existing BUY/SELL governance.
