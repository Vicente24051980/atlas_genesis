# ATLAS Ω — R0 GLOBAL INFLECTION RADAR Ω v1.1

STATUS = RATIFIED_BY_HUMAN / ACTIVE_CANONICAL_R0_CONTROL
DATE = 2026-09-13
LOCATION = R0 DISCOVERY
FUNCTION = DISCOVERY / ADMISSION / RECALL CONTROL
CAPITAL_AUTHORITY = NONE
E2_SCORE = 0
FRU_MATH_WEIGHT = 0
E4_SCORE = 0
OVERRIDE_SCOPE = R0_ADMISSION_CONTROL_ONLY

## 1. GOVERNANCE

DISCOVERY_AUDIT and MISS_LOG implement an existing v3.3 discovery-control obligation. They do not create a new engine and do not alter E1-E6, Nine-Score, FRU-MATH, sizing, timing, Replacement Firewall, or capital authority.

The genuinely new formalization is ADMIT-WATCH plus explicit admission-capacity control. Discovery != Selection != Sizing != Timing.

## 2. GIR-1 — CONTRACTED INFLECTION

Admission requires primary-source evidence of a material economic change in one or more of:
- funded backlog
- awarded/contracted bookings
- contractual RPO
- contractual ARR
- firm awarded contracts

Hard gates:
- EVIDENCE_QUALITY: primary source required; otherwise FAIL.
- CONTRACTUALITY: funded/awarded/contracted = PASS; pipeline/TAM/intention = FAIL.

R0-GIR creates no synthetic score. After both gates pass, research priority is lexicographic and may use SIGNAL / REVENUE_TTM only as an ordering variable. It contributes zero points downstream.

## 3. GIR-2 — PRICE / OBSERVABLE DIVERGENCE

R0 may admit a candidate after a material price/valuation dislocation when a cheap negative screen finds no observable deterioration sufficient to explain it in the following fixed published variables:
- revenue
- ARR/RPO where applicable
- FCF
- net debt
- share count

R0 MUST NOT declare Economic Proof intact. Full Economic Proof belongs to E1/E2.

Output: ADMIT-WATCH -> E1/E2, RESEARCH-QUEUE, or REJECT. Never SELECT, BUY, REPLACE, or portfolio weight.

## 4. ADMIT-WATCH RECORD

Every ADMIT-WATCH MUST contain:
- SIGNAL_DATE
- PRIMARY_EVIDENCE
- TRIGGER_TYPE
- TRIGGER_VALUE
- MONITOR_VARIABLES
- PROMOTION_GATE
- FALSIFIERS
- CAPITAL_EVENTS
- SHARE_COUNT
- NET_DEBT
- ADMISSION_DATE
- EXPIRY_DATE
- STATUS

CAPITAL_EVENTS is mandatory because business inflection does not imply per-share inflection.

## 5. CAPITAL EVENT INTERRUPT

Any material equity offering, ASR, convertible, warrant event, material SBC change, stock-funded acquisition, or material debt issuance while a name is on WATCH triggers:

WATCH_REASSESSMENT_REQUIRED

It does not automatically REJECT or PROMOTE. Reassessment must update, where applicable:
- fully diluted share count
- net debt
- enterprise value
- contractual signal per diluted share

FRU-MATH must use the updated per-share economics.

## 6. EXPIRY AND READMISSION

If CURRENT_DATE > EXPIRY_DATE and PROMOTION_GATE has not been passed:
STATUS = REJECT / EXPIRED

Readmission requires NEW_INDEPENDENT_TRIGGER. Repetition of the old trigger is insufficient.

## 7. CAPACITY CONTROL

R0 must control both flow and stock:
- MAX_NEW_WATCHES_PER_QUARTER
- MAX_LIVE_WATCHES

No numerical hard cap is invented until E1 monitoring capacity and standard expiry horizon are evidenced. Once ratified, the budget MUST NOT be recalibrated from outcome noise before 8 completed quarters, except to correct a demonstrated technical or capacity defect.

## 8. DISCOVERY_AUDIT

Recall must be measured against a predefined investable sample and objective confirmation criteria fixed before examining outcomes.

RECALL_H = confirmed names with prior GIR detection / all confirmed names in the predefined eligible sample.

PRECISION_H = WATCH names confirmed within horizon H / WATCH names whose H horizon has completed.

Live/censored WATCH names are excluded from both success and failure counts until their horizon closes.

No retrospective cherry-picking of winners is permitted.

## 9. MISS_LOG

MISS_LOG MUST NOT estimate hypothetical lost return.

Required fields:
- PRIMARY_SIGNAL_DATE
- ATLAS_DETECTION_DATE
- DETECTION_LAG_DAYS
- ELIGIBLE_AT_SIGNAL
- CORRECT_EX_ANTE_STATE
- MISS_CAUSE

DETECTION_LAG_DAYS = ATLAS_DETECTION_DATE - PRIMARY_SIGNAL_DATE.
If the historical ATLAS awareness date cannot be documented, ATLAS_DETECTION_DATE = INDETERMINATE.

## 10. FEIM VALIDATION CASE

FEIM is retained as a governance validation case, not as proof of hypothetical foregone profit.

Documented sequence supplied and independently checked during design:
- 2026-07-15: funded-backlog inflection and forward operating targets -> correct ex-ante R0 state: ADMIT-WATCH, not SELECT.
- 2026-07-23 and 2026-07-27: additional contracted evidence -> WATCH reinforcement.
- 2026-07-28: public equity-offering event -> CAPITAL_EVENT_INTERRUPT / WATCH_REASSESSMENT_REQUIRED. Effective dilution remains evidence-dependent and must not be invented.
- 2026-09-10: operating confirmation -> promotion gate reassessment, while cash conversion/per-share economics remain subject to E1/E2/FRU evidence.

## 11. INVARIANTS

- R0_GIR != BUY
- R0_GIR != SELECT
- R0_GIR != PORTFOLIO_WEIGHT
- R0_GIR_SCORE = NONE
- PRIMARY_EVIDENCE_REQUIRED_FOR_GIR1
- CONTRACTUALITY_IS_BINARY_GATE
- PIPELINE_AND_TAM_ARE_NOT_CONTRACTED_INFLECTION
- ECONOMIC_PROOF_IS_NOT_DECLARED_BY_R0
- CAPITAL_EVENTS_MUST_UPDATE_PER_SHARE_ECONOMICS
- EXPIRED_WATCH_REQUIRES_NEW_INDEPENDENT_TRIGGER_FOR_READMISSION
- DISCOVERY_AUDIT_MUST_USE_PREDEFINED_SAMPLE
- NO_HYPOTHETICAL_LOST_RETURN_IN_MISS_LOG
- NO_BUDGET_RECALIBRATION_FROM_OUTCOME_NOISE_BEFORE_8_QUARTERS

## 12. PURPOSE

R0-GIR does not predict winners. It ensures that material, observable economic changes reach the evidence and assessment system early enough to be evaluated. Its objective is discovery recall with bounded research capacity while preserving all downstream evidence, scoring, FRU, sizing, timing, and human capital-decision gates.

## 13. OPERATING RADAR ROUTING — 2026-09-15

The live IPO / private / macro radar is maintained in `CURRENT_CANON/2026-09-15_RADAR_IPO_PRIVATE_REGIME_OMEGA.md` and is subordinate to this R0 governance where applicable.

Routing rules:
- `IPO_2026_2027`: use the existing Future IPO Gate lifecycle F0-F6. A confidential filing is a research-state transition, not GIR-1 Economic Proof and not a BUY signal.
- `PRIVATE_WATCH`: may be ordered by research priority, but private funding valuation, famous investors, technical claims or TAM do not satisfy GIR-1 contractuality by themselves.
- `MACRO`: regime observations such as `RISK_FREE_REPRICING` modify valuation context only; they do not create R0 admission points or capital authority.
- `EVIDENCE_ONLY`: non-investable universes may inform demand, supply-chain or competitive evidence but are excluded from candidate admission unless the human explicitly expands the investable universe.

Current priority routing:
- Anthropic: `F1_CONFIDENTIAL_FILING_REPORTED / PRIORITY MAX / WAIT_FOR_PUBLIC_FILING`.
- Altera: `F1_CONFIDENTIAL_FILING_REPORTED / PRIORITY HIGH / WAIT_FOR_PUBLIC_FILING`.
- Agility Robotics: `F0_PRIVATE_DISCOVERY / 12M_CANDIDATE / PRIORITY HIGH`; reported orders and operating hours increase research priority but remain subject to independent unit-economic and commercialization gates.
- Temporal: `F0_PRIVATE_DISCOVERY / PRIORITY HIGH`.
- Euclyd and Exein: `F0_PRIVATE_DISCOVERY / PRIORITY MEDIUM-HIGH`.
- OpenAI: `F0_PRIVATE_DISCOVERY`; 2026 IPO window off, 2027+ unconfirmed.
- China-only securities: `NON_INVESTABLE_EVIDENCE_ONLY`.

Additional invariants:
- `RESEARCH_PRIORITY != INVESTMENT_SCORE`
- `PRIVATE_VALUATION != POINT_ZERO`
- `CONFIDENTIAL_FILING != PUBLIC_AUDITED_EVIDENCE`
- `ANALYSIS != EXECUTION`
