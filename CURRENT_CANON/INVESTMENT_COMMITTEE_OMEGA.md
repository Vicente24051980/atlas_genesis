# ATLAS Ω — Investment Committee Ω

**Status:** ACTIVE · Canonical
**Effective:** 2026-08-17
**Transversal-engine correction:** 2026-08-19
**GREEN Gate-0 / inference-orchestration correction:** 2026-08-20
**GREEN Breadth / concentration correction:** 2026-08-20

## Purpose
Convert ATLAS from prompt-driven analysis into an evidence-driven decision system. Agents do not vote; evidence and vetoes decide.

## Canonical pipeline

`OBJECTIVE → CONTEXT → SPECIALISTS → EVIDENCE → ADVERSARIAL DEBATE → CONTRADICTIONS → DECISION → EXECUTION → MEASUREMENT → LEARNING`

For listed-security discovery and ranking:

`TICKER → GREEN GATE 0 → GREEN PULSE → GREEN BREADTH → RELATIVE GREEN → CROWDING/CONCENTRATION → MONEY ROTATION → ALL REGISTERED ATLAS ENGINES → EVIDENCE PACKET → CONTRADICTIONS → EXPECTED RETURN 3–6Y → FALSIFIERS Ω → INVESTMENT COMMITTEE Ω → ACTION`

Economic chain where relevant:

`REAL-WORLD SIGNAL → VALUE CHAIN → LISTED BENEFICIARIES → DEMAND → CAPTURE → CONVERSION → FCF → ROIC → MOAT → VALUATION → EXPECTED RETURN 3–6Y → FALSIFIERS Ω → ACTION`

## GREEN GATE 0 Ω — first discovery gate

GREEN is the first gate for ticker discovery/ranking. It is calculated mechanically from market-price history before Quality or thematic attractiveness can influence ranking.

Canonical GREEN windows: `1W · 1M · 3M · 1Y · TOTAL`.

- `GREEN 5/5`: five positive windows; PASS priority.
- `GREEN 4/5`: four positive windows; PASS, with the failed horizon explicitly recorded.
- `GREEN <=3/5`: does not enter the primary discovery ranking.
- Emerging/Inflection exception: may continue only as `GREEN_EXCEPTION`; it must never be relabeled as 4/5 or 5/5.

Quality, Money Rotation, CAPEX attractiveness, narrative strength, analyst conviction or thematic fit cannot rescue a failed GREEN Gate 0.

GREEN is a discovery/execution gate, not fundamental evidence and not a final BUY authority. Falsifiers Ω retains the absolute veto.

## GREEN PULSE Ω — recent deterioration detector

To prevent a structurally positive long-horizon GREEN score from hiding recent distribution, calculate a second independent vector:

`1D · 3D · 5D · 7 sessions · 20D`.

A ticker can therefore be `GREEN 5/5` and simultaneously `GREEN_PULSE_BREAK`. Such a state blocks fresh entry/ranking priority until the break repairs; it does not rewrite the long-term GREEN history.

## GREEN BREADTH Ω — participation and concentration gate

GREEN must not be interpreted from the ticker or capitalization-weighted index alone. For every candidate, calculate participation through the hierarchy:

`TICKER → INDUSTRY → SECTOR → BROAD INDEX → EQUAL-WEIGHT / BREADTH`.

Required observations where data are available:

- percentage of relevant constituents above MA20, MA50 and MA200;
- advancing versus declining constituents and breadth thrust/deterioration;
- new highs versus new lows;
- sector/industry participation;
- capitalization-weighted versus equal-weight divergence;
- contribution concentration among the largest constituents;
- persistence across observations rather than a single session.

Canonical states:

- `GREEN_HEALTHY`: GREEN 4/5 or 5/5 + positive Pulse + expanding/healthy breadth + relative confirmation.
- `GREEN_CONCENTRATED`: headline/ticker GREEN remains positive but index strength is carried by a narrow set of constituents or equal-weight/breadth fails to confirm.
- `GREEN_DIVERGENT`: ticker GREEN remains 4/5 or 5/5 while industry/sector relative participation deteriorates materially.
- `GREEN_DETERIORATING`: long-horizon GREEN remains positive but Pulse and breadth are weakening.
- `GREEN_PULSE_BREAK`: acute recent deterioration; fresh-entry priority blocked until repaired.

A 5/5 score must never be presented as sufficient evidence of current momentum when Pulse/Breadth contradict it. The dashboard/ranker must display the contradiction explicitly.

## RELATIVE GREEN Ω

Measure relative strength independently versus the appropriate sector/industry benchmark and broad benchmark (S&P 500 / Nasdaq / relevant home-market index). Absolute GREEN and relative GREEN must not be conflated.

## CROWDING / CONCENTRATION Ω

Before Money Rotation can classify a destination as durable, test whether observed performance is concentrated in a small number of securities, event-driven, short-covering, option-driven or otherwise non-broad.

A capitalization-weighted index advance with weak equal-weight participation cannot be classified as broad institutional accumulation without additional evidence.

Low index volatility is not equivalent to low underlying risk. Where available, cross-check VIX/index volatility against single-stock dispersion, breadth, concentration and positioning.

## Flow persistence rule

One exceptional session is not `FLOW_CONFIRMED`. Money Rotation Ω requires persistence/breadth/relative confirmation across multiple observations. A one-day surge is recorded as impulse, not institutional-flow proof.

Canonical flow validation chain:

`PRICE IMPULSE → GREEN PULSE → BREADTH → RELATIVE STRENGTH → PERSISTENCE → CROWDING CHECK → FLOW_CONFIRMED / NOT_CONFIRMED`.

## Universal ticker / all-engine sweep

Every ticker that passes the applicable discovery gate, or is explicitly submitted for deep analysis, must be processed by all registered engines before the final recommendation is issued. Explicitly submitted tickers may be audited despite GREEN failure, but the failed gate remains visible and cannot be overwritten.

There is no style/sector preclassification that allows ATLAS to route a ticker only through “defensive”, “growth”, “AI”, “value” or another preferred path. Engines remain independent and may return positive, negative, `NO_SIGNAL`, `NOT_APPLICABLE`, `INSUFFICIENT_DATA` or equivalent explicit states.

The sweep includes Economic Proof Ω; Quality / Financial Quality / Growth Ω; Valuation / Implied Return Ω; CAPEX Productivity Ω; Moat Ω; GREEN CONTINUITY Ω; GREEN Pulse Ω; GREEN Breadth Ω; Relative GREEN Ω; Crowding/Concentration Ω; Money Rotation Ω / Institutional Rotation Ω; Defensive Ω; Macro / Regime Ω; Recovery / Successor / Good Companies Cheap / Historical Dislocation and other specialized engines; GURUS & FUNDS Ω; Falsifiers Ω / Red Team; and Evidence Director Ω.

The purpose is not to average every score. It is to preserve independent evidence and expose contradictions before decision.

## Committee — independent agents

1. **Economic Proof Ω** — validates Demand → Capture → Conversion → FCF → ROIC. No narrative substitute.
2. **Valuation / Implied Return Ω** — estimates forward 3–6Y return independently of business quality.
3. **CAPEX Productivity Ω** — audits incremental economic output per incremental capital deployed and payback.
4. **Moat Ω** — tests durability, switching costs, network effects, IP, scale, distribution and erosion.
5. **Institutional Rotation Ω** — measures abnormal flows, positioning, breadth and sponsorship; flow is a signal, never fundamental proof.
6. **Macro / Regime Ω** — evaluates rates, liquidity, credit, FX, commodities and regime sensitivity without overriding company evidence.
7. **Falsifiers Ω / Red Team** — adversarially attempts to invalidate the thesis. Independent absolute veto.
8. **Evidence Director Ω** — source hierarchy, provenance, contradictions, missing evidence and confidence.

## AI INFERENCE ORCHESTRATION / HETEROGENEOUS COMPUTE Ω

Purpose: detect economic toll collectors as AI inference shifts from homogeneous accelerator fleets toward workload-specific heterogeneous compute and agentic orchestration.

Canonical chain:

`AGENTIC WORKLOAD → ORCHESTRATION/ROUTING → PREFILL/CONTEXT ENGINE → DECODE/LOW-LATENCY ENGINE → API DISTRIBUTION → UTILIZATION → REVENUE → GROSS MARGIN → FCF → ROIC`

Required variables:

- workload heterogeneity and latency sensitivity;
- tokens/query and agentic-loop intensity;
- API/platform distribution reach;
- contracted MW and commissioned/accepted MW;
- hardware availability and supply-chain constraints;
- utilization/ramp evidence;
- revenue linkage and RPO/backlog conversion;
- gross-margin trajectory;
- operating/FCF conversion;
- customer concentration and counterparty quality;
- interoperability versus lock-in;
- performance-per-watt / performance-per-dollar where independently evidenced;
- dilution, financing and CAPEX intensity;
- competitive response from GPU/ASIC/cloud incumbents.

A partnership announcement is `DEMAND/DISTRIBUTION EVIDENCE`, not Economic Proof. Promotion requires measurable workload utilization and revenue/margin conversion.

For neocloud/inference infrastructure retain the acceptance chain:

`CONTRACT → CAPACITY/FINANCING → HARDWARE → DEPLOYMENT/COMMISSIONING → CUSTOMER ACCEPTANCE → REVENUE RECOGNITION → GROSS MARGIN → OCF/FCF → ROIC`.

## Cerebras / CBRS watch protocol — 2026-08-20

Callosum integration is treated as a new distribution/orchestration node for heterogeneous agentic inference, pending primary-source confirmation of commercial economics. It increases audit priority but does not itself create BUY.

CBRS must be tested through GREEN Gate 0 and GREEN Pulse before ranking. Fundamental audit then requires: contracted versus accepted MW; RPO/backlog conversion; cloud utilization; customer concentration; core gross-margin progression; operating loss/FCF path; manufacturing scale; supply commitments; and evidence that ultra-low-latency inference produces durable pricing/cost advantage.

Cross-check ecosystem beneficiaries/counterparties where material: AMD, AWS/AMZN, TSMC, Flex/FLEX, Sanmina/SANM and application/security customers. These links are evidence inputs, not automatic recommendations.

## Defensive Ω — transversal, not a default bias

Defensive Ω must run on every audited ticker and return degree of defensiveness/regime resilience. Its output is a characteristic, not a default veto or automatic preference.

## Non-negotiable governance

### No majority voting
A 7–1 bullish committee does not produce BUY. Evidence gates determine state.

### No single-engine recommendation authority
GREEN controls discovery/ranking eligibility but cannot by itself issue BUY/HOLD/SELL. No individual engine may convert its local output directly into final portfolio recommendation. Falsifiers Ω retains its confirmed material absolute veto.

### E-Proof and valuation are orthogonal
Operational excellence does not imply an attractive security price.

### Regime is context, not identity
Macro / Regime Ω affects execution risk, discount rates, sizing and probability distributions without redefining company identity.

### Epistemic ledger
Every material assertion is tagged FACT / HYPOTHESIS / INTERPRETATION / NOISE with source, date, freshness and confidence where available.

### Null opportunity is valid
ATLAS may conclude NO OPPORTUNITY / NO PORTFOLIO CHANGE.

## Decision gates

- **BUY:** GREEN/execution gate permits entry + thesis valid + sufficient Economic Proof + moat acceptable + expected return clears hurdle + no active veto.
- **HOLD:** thesis valid but incremental purchase does not clear hurdle or sizing constraints.
- **WATCH:** evidence incomplete, valuation insufficient, catalyst not validated, setup not mature, GREEN/Pulse/Breadth not ready, or material contradictions remain unresolved.
- **REJECT:** confirmed falsifier, structurally inadequate economics, or expected return decisively inadequate.
- **NO OPPORTUNITY:** evidence does not justify portfolio action.

## Engine ledger requirement

Persist ticker/canonical identifier; as-of timestamp/market cut; GREEN 5-window vector; GREEN Pulse vector; GREEN Breadth state and raw breadth inputs; relative GREEN; crowding/concentration state; each engine/version; local state/score; provenance/freshness; epistemic tags; contradictions; Falsifiers state; final committee recommendation; and execution state separately.

A `BUY + NO_CHASE` remains valid: BUY is fundamental; NO_CHASE is execution.

## Evidence Director Ω protocol

For every deep research run: define falsifiable question; prioritize primary sources; separate epistemic classes; collect evidence for and against; expose contradictions; list missing/NO VERIFICADO tests; score source quality/freshness/confidence; pass the same evidence packet to registered engines; record null outputs; run Red Team after positive case; issue action only after hard gates.

## Continuous learning loop

Preserve contemporaneous evidence packets and forecasts. At checkpoints compare predicted versus realized Demand, Capture, FCF, ROIC, margins, valuation, price-continuity, breadth, relative strength and catalysts. Update calibration; never rewrite historical evidence retroactively.
