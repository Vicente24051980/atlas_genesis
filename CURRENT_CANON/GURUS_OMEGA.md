# ATLAS Ω — GURÚS Ω

Status: ACTIVE
Date: 2026-08-18

## Mandate
GURÚS Ω is an independent evidence engine. It detects convergence and divergence among proven investors without allowing authority, fame, or 13F ownership to overwrite ATLAS Principal Ω, Economic Proof Ω, Valuation Ω, Money Rotation Ω, Defensive Regime Ω, or Falsifiers Ω.

## Core rule
A guru holding a security is evidence of institutional conviction, never a BUY signal.

13F data are delayed snapshots and incomplete: foreign holdings, cash, shorts and some derivatives may be absent. Every observation must carry an as-of date and filing/source date.

## Manager universe
Primary/eligible set may include Berkshire Hathaway/Warren Buffett, Appaloosa/David Tepper, Duquesne/Stanley Druckenmiller, Pershing Square/Bill Ackman, Fundsmith/Terry Smith, TCI/Chris Hohn, Baupost/Seth Klarman, Himalaya/Li Lu, Mohnish Pabrai, Aquamarine/Guy Spier, Akre Capital, Polen, Scion/Michael Burry, Soros Fund Management, Lone Pine, Viking, Coatue and Tiger Global.

Manager inclusion does not imply equal skill or equal weight. Track record, strategy, disclosure completeness and relevance to the security must be recorded separately.

## Position states
- NEW — initiated in the latest reporting period.
- ADD — increased.
- HOLD — materially maintained.
- TRIM — reduced.
- EXIT — fully exited.
- UNKNOWN — insufficient comparable evidence.

## Evidence schema
For every manager/security observation record:
1. manager/fund
2. ticker/security
3. reporting period / as-of date
4. filing/publication date
5. position state
6. shares/value when available
7. portfolio weight when meaningful
8. prior-period comparable
9. source quality
10. limitations (13F delay, options, foreign security, incomplete portfolio, etc.)

## Engine pipeline
Manager Evidence → Normalize Securities → Q/Q Position Delta → Conviction/Persistence → Cross-Manager Convergence → Divergence Map → ATLAS Fundamental Validation → Current Valuation → Regime Fit → Opening/Execution Gate.

## Independent outputs
GURÚS Ω produces only:
- CONVERGENCE HIGH / MEDIUM / LOW
- ACCUMULATION
- PERSISTENT HOLD
- DIVERGENCE
- DISTRIBUTION
- INSUFFICIENT EVIDENCE

It never emits an autonomous portfolio BUY.

## Convergence logic
Raw holder count is insufficient. Weight evidence by:
- NEW/ADD > HOLD > TRIM/EXIT for positive conviction.
- persistence across quarters.
- manager track-record/relevance.
- size/weight relative to that manager's disclosed portfolio.
- independence of managers and strategies.
- freshness and primary-source quality.

A ticker held by five managers who are trimming is not equivalent to a ticker held by three managers with two material ADD/NEW actions.

## Contradictions
Contradictions are preserved, not averaged away. Example: one manager adding a semiconductor while another exits it must appear as DIVERGENCE and be routed to Adversarial Debate Ω.

No majority voting. Falsifiers Ω retains absolute independent veto.

## Separation from ATLAS engines
GURÚS Ω must never overwrite:
- Principal Ω
- Good Companies Cheap Ω
- Historical Dislocation/Burry Ω
- Money Rotation Ω
- AI CAPEX Payback Ω
- CAPEX Hunters Ω
- Defensive Regime Ω
- Valuation / Implied Return Ω
- Falsifiers Ω

## Current Q2-2026 research seed
Candidate convergence set to verify from primary/current filings before scoring: GOOGL/GOOG, AMZN, TSM, META, V, MA, CB, MCO, ICE, VST.

Candidate disagreement examples requiring explicit preservation: MU and semiconductor exposures where manager actions conflict.

No seed ticker is pre-approved for purchase.

## Pre-NVIDIA portfolio integration — 18 Aug 2026
Current portfolio starts from zero positions. Target before NVIDIA results on 2026-08-26: approximately 15 positions, selected after the US opening gate rather than copied from guru portfolios.

GURÚS Ω is one input to the execution decision:
Quality + Economic Proof + Valuation/Implied Return + Regime Fit + Guru Convergence + Opening Strength − Factor Concentration, subject to Falsifiers Ω veto.

Structural guru conviction cannot override a tactical WAIT around a binary/systemic event. Semiconductors may score highly in GURÚS Ω and still remain WAIT before the NVIDIA checkpoint.

## Opening Gate
For the planned 15-position portfolio, evaluate 15–20 minutes after US open:
- gap and opening range
- VWAP
- relative strength vs sector/index
- volume/participation
- Treasury 10Y/30Y
- Brent/energy shock
- VIX/volatility regime
- breadth
- cross-position factor correlation
- imminent event risk

Avoid chasing vertical gaps and avoid buying a famous holding solely because a manager owned it at quarter-end.

## Canonical principle
GURÚS Ω answers: “Where is independently skilled capital converging, accumulating, diverging or exiting?”
ATLAS then answers separately: “Is the business economically proven, attractively valued, suitable for the current regime, and executable now?”
