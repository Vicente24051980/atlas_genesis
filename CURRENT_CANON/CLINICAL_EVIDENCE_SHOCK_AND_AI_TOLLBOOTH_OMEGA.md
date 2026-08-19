# ATLAS Ω — Clinical Evidence Shock Ω + AI Tollbooth Ω

Status: ACTIVE CANON
Effective: 2026-08-20
Scope: transversal specialist engines; no automatic BUY authority.

## Constitutional rules
- FACT / HYPOTHESIS / INTERPRETATION / NOISE separation is mandatory.
- Price action is evidence of repricing/flow, never proof of the underlying thesis.
- No majority voting. Falsifiers Ω remains independently capable of veto.
- These engines emit evidence, scores and candidates into the Investment Committee Ω; they do not overwrite Principal Ω, Money Rotation Ω, Global CAPEX Chain Ω, AI CAPEX PAYBACK Ω or valuation.
- Every analyzed ticker continues through all applicable ATLAS Ω engines.

# I. Clinical Evidence Shock Ω

## Objective
Detect when new clinical/regulatory evidence changes the probability-weighted economic value of a drug/platform faster than consensus has incorporated it.

## Pipeline
Event → evidence quality → clinical magnitude → probability-of-success delta → addressable population → commercial capture → partner economics → valuation delta → market repricing → flow persistence → falsifiers → decision.

## Event hierarchy
CES0 noise/preclinical; CES1 early clinical signal; CES2 material Phase 2; CES3 pivotal/Phase 3 evidence; CES4 regulatory decision/label-changing evidence.

## Core variables (0–100 unless stated)
- Evidence Quality: trial phase, randomization/control, endpoint hierarchy, statistical robustness, sample size.
- Clinical Magnitude: effect size, absolute benefit, durability, safety and unmet need.
- Regulatory Delta: change in estimated approval probability.
- Economic Delta: probability-adjusted peak sales/royalties/profit/FCF change versus pre-event expectations.
- Surprise: distance from prior consensus.
- Flow Confirmation: abnormal volume, relative strength, breadth, institutional persistence.
- Exhaustion Risk: gap size, intraday extension, options/short-covering contribution and liquidity.

Clinical Shock Score = 0.25 Evidence Quality + 0.20 Clinical Magnitude + 0.15 Regulatory Delta + 0.20 Economic Delta + 0.10 Surprise + 0.10 Flow Confirmation.

## Mandatory outputs
EVENT_CONFIRMED / EVENT_UNCONFIRMED; CES0–CES4; Shock Score; probability delta; economic delta range; repricing already captured; 1D/3D/5D persistence; falsifiers; EVENT-BUY / WATCH / HOLD / AVOID / EXIT-RISK.

## Trading discipline
A positive clinical event is not automatically a long-term BUY. Separate:
1. Event trade: capture evidence-driven repricing.
2. Investment thesis: normalized probability-weighted value after repricing.
3. Overnight risk: explicitly score binary follow-up, data-detail, regulatory and financing risk.
Profit-taking before overnight exposure is valid risk management and must not be retrospectively marked as an error merely because price later rises.

## Calibration case — MRNA/MRK, Aug-2026
Treat the reported pivotal personalized-cancer-vaccine result as a calibration event, not as permanent proof. Re-score when full effect sizes, survival data, safety, regulatory feedback, label scope or economics change. Never infer missing data from share-price movement.

# II. AI Tollbooth Ω

## Objective
Find companies that monetize AI activity repeatedly while carrying materially less capital intensity than the infrastructure whose usage they meter, route, secure, orchestrate, transact or bill.

## Economic chain
Power → datacenter → compute → memory/network → model → routing/orchestration → observability/security → metering → billing/payments → enterprise workflow/application.

Question: not only 'who gets paid to build AI CAPEX?' but 'who gets paid each time that installed AI capacity is used?'

## Tollbooth tests
1. Usage linkage: revenue scales with AI transactions/tokens/workloads/seats/agents.
2. Take-rate durability: measurable fee/spread/subscription or monetization mechanism.
3. Capital-lightness: incremental revenue does not require proportional owned compute/CAPEX.
4. Switching cost/control point: routing, billing, identity, data, workflow or developer integration creates persistence.
5. Multi-model neutrality: benefit is not dependent on one winning model where possible.
6. Gross-margin/FCF conversion: usage growth must become economic proof.
7. Pricing power: unit economics survive model/compute price compression.
8. Disintermediation risk: hyperscalers/model vendors can bypass the layer.

AI Tollbooth Score = 0.20 Usage Linkage + 0.15 Take-rate Durability + 0.15 Capital-lightness + 0.15 Control Point + 0.10 Neutrality + 0.15 FCF Conversion + 0.10 Pricing Power - Disintermediation Penalty.

## Evidence gates
T0 narrative only; T1 usage evidence; T2 revenue linkage; T3 margin/FCF proof; T4 durable control point with repeatable economics.
No candidate reaches BUY from T0/T1 alone.

## Integration
- Global CAPEX Chain Ω identifies physical and digital beneficiaries.
- AI CAPEX PAYBACK Ω tests whether buyers earn adequate returns.
- AI Demand Monetization Proof Ω verifies end-demand monetization.
- AI Tollbooth Ω isolates recurring usage-layer capture.
- Money Rotation Ω separately tests whether capital is entering the ticker now.
- Implied Return Ω/valuation determines whether expected return remains attractive.

## Stripe/OpenRouter calibration
Use the announced transaction only as evidence that routing + metering + billing may constitute a strategic AI control point. Stripe/OpenRouter itself is not a public-equity candidate. The engine must search listed analogues/beneficiaries and demand company-specific economic proof; acquisition price or strategic narrative alone is insufficient.

# III. Shared Red-Team Gates
Reject/downgrade when any applies materially: evidence source unverified; endpoint/economic metric is surrogate without demonstrated translation; effect already fully priced; financing/dilution overwhelms economic gain; adverse safety/regulatory signal; revenue attribution to AI is unsupported; gross-margin deterioration offsets usage; customer/model concentration; hyperscaler bundling; open-source commoditization; take-rate compression; accounting proxy mistaken for cash economics.

# IV. Machine-readable output contract
Each run returns: ticker, timestamp, engine, FACTS[], HYPOTHESES[], INTERPRETATIONS[], NOISE[], evidence_grade, score, confidence, economic_delta, valuation_delta, flow_confirmation, repricing_state, falsifiers[], next_catalysts[], verdict, evidence_sources[].

# V. Canonical principle
NEW EVIDENCE → ECONOMIC DELTA → VALUATION DELTA → OBSERVED REPRICING. Never reverse the causal chain by treating PRICE → THESIS as proof.
