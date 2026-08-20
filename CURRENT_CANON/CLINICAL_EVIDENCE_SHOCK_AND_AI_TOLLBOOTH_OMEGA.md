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

## Developer Activity Leading Indicator Ω

### Objective
Detect early developer demand before it appears in reported revenue, without allowing developer activity to substitute for financial evidence.

Developer Activity Leading Indicator Ω is a subordinate discovery module inside AI Tollbooth Ω. It identifies probable future AI workloads by observing developer behavior, SDK/API adoption and project formation. It can raise watchlist priority, audit urgency and evidence confidence, but it cannot by itself promote a ticker to BUY, T3, T4 or Economic Proof.

### Causal chain
package downloads → SDK/API usage → project creation → workloads → consumption → Atlas/Voyage revenue.

### Constitutional rule
Developer activity is a leading indicator, never Economic Proof. It remains FACT/HYPOTHESIS evidence until it is reconciled with company-specific revenue, gross margin, FCF conversion, customer expansion or disclosed consumption metrics.

### Signal ladder
D0 NOISE: mentions, demos, tutorials, one-off GitHub stars, social hype or unverified screenshots.
D1 PACKAGE INTEREST: npm/PyPI/Maven/SDK downloads, GitHub stars/forks, docs traffic or search interest from a verifiable source.
D2 SDK/API ADOPTION: active API keys, SDK imports, repo templates, integration guides, ecosystem plugins or partner connectors showing repeated developer use.
D3 PROJECT FORMATION: new apps, production pilots, customer case studies, integrations, marketplace listings or enterprise deployments built on the tool.
D4 WORKLOAD/CONSUMPTION LINKAGE: usage telemetry, calls, tokens, queries, vector indexes, reranking jobs, seats, agents, storage, throughput or consumption metrics tied to monetizable units.
D5 REVENUE RECONCILIATION: management disclosures, segment revenue, ARR/NRR, attach rate, cohort expansion, gross-margin behavior or FCF evidence confirming that developer activity became paid economic output.

### Core variables (0–100 unless stated)
- Source Quality: official registry, company disclosure, cloud marketplace, third-party telemetry, repository analytics or estimated scrape.
- Signal Freshness: trend acceleration over 7D/30D/90D and whether the signal is current enough to matter.
- Adoption Velocity: growth in downloads, API usage, SDK imports, repo integrations, docs queries or active projects.
- Conversion Proximity: distance from raw developer activity to a monetizable workload.
- Workload Specificity: whether the activity maps to a paid unit such as query, token, rerank, vector index, seat, API call, storage or transaction.
- Customer Quality: enterprise, regulated, production and repeat users score above hobbyist or trial users.
- Revenue Reconciliation: alignment with Atlas/Voyage revenue, ARR, NRR, attach rate, consumption, gross margin and FCF.
- Manipulation Risk: bot downloads, CI noise, version churn, dependency duplication, free-tier abuse, tutorials or campaign-driven spikes.
- Alternative Explanation Risk: open-source trend, migration tooling, academic experimentation, hackathons or non-production experimentation.

Developer Activity Score = 0.15 Source Quality + 0.15 Signal Freshness + 0.15 Adoption Velocity + 0.15 Conversion Proximity + 0.10 Workload Specificity + 0.10 Customer Quality + 0.15 Revenue Reconciliation - 0.10 Manipulation Risk - 0.05 Alternative Explanation Risk.

### Gate permissions
- D0-D1 can only create DISCOVERY or WATCHLIST evidence.
- D2 can raise AI Tollbooth audit priority, but cannot satisfy T2 revenue linkage.
- D3 can support T1/T2 hypotheses if customer/project evidence is verified.
- D4 can support T2 revenue linkage only when monetizable units are observable.
- D5 is required before the signal can contribute to T3 margin/FCF proof or T4 durable control point.

### Mandatory reconciliation
Every Developer Activity finding must be reconciled against:
1. reported revenue growth and segment mix;
2. usage-based or subscription revenue mechanism;
3. gross margin and FCF behavior;
4. customer additions, expansion, retention or NRR;
5. management commentary and risk factors;
6. valuation and expectations already priced in.

### Output contract extension
Each AI Tollbooth run may include developer_activity_leading_indicator with: observed_signal, source_quality, time_window, adoption_velocity, signal_ladder_state, conversion_proximity, workload_specificity, revenue_reconciliation, manipulation_risk, alternative_explanation_risk, developer_activity_score, confidence, allowed_gate_contribution, forbidden_inferences, next_evidence_required.

### MongoDB / Voyage calibration — 20-Aug-2026
For MongoDB, npm/package downloads, SDK/API adoption, Voyage API usage, Vector Search integrations and RAG/agent project formation may raise AI Tollbooth priority. They do not prove Atlas/Voyage economic output until reconciled with Atlas growth, Voyage consumption, attach rate, enterprise workloads, gross margin and FCF conversion.

## Integration
- Global CAPEX Chain Ω identifies physical and digital beneficiaries.
- AI CAPEX PAYBACK Ω tests whether buyers earn adequate returns.
- AI Demand Monetization Proof Ω verifies end-demand monetization.
- AI Tollbooth Ω isolates recurring usage-layer capture.
- Developer Activity Leading Indicator Ω detects early usage-layer demand but cannot replace revenue, margin or FCF proof.
- Money Rotation Ω separately tests whether capital is entering the ticker now.
- Implied Return Ω/valuation determines whether expected return remains attractive.

## Stripe/OpenRouter calibration — reinforced 20-Aug-2026
Use the reported strategic combination only as evidence that routing + metering + billing + payments may constitute a valuable AI control point. It is not proof of durable economics and neither Stripe nor OpenRouter is a public-equity candidate for ATLAS.

Mandatory inference discipline:
- Acquisition/strategic interest = INDUSTRY SIGNAL, not Economic Proof.
- Purchase price/strategic narrative cannot promote a listed analogue through T2/T3/T4 gates.
- Search listed beneficiaries/analogues independently and require company-specific usage linkage, revenue attribution, margin/FCF conversion and control-point durability.
- Explicitly test whether routing becomes commoditized, model providers internalize it, hyperscalers bundle it, or take rates compress.

New control-point map for discovery:
MODEL → ROUTING → OBSERVABILITY/SECURITY → METERING → BILLING → PAYMENTS → WORKFLOW.
For every listed candidate, identify exactly where it sits, who pays it, the unit of monetization, incremental capital required, gross-margin behavior and bypass risk.

## Agent-enabled marketplace weak signal
Voice/AI agents can reduce coordination cost in marketplaces where supplier response latency historically prevented liquidity. Treat this as Discovery Ω evidence only until a listed company demonstrates measurable transaction growth, take-rate economics and FCF conversion attributable to agent automation. Do not create BUY candidates from startup examples alone.

# III. Shared Red-Team Gates
Reject/downgrade when any applies materially: evidence source unverified; endpoint/economic metric is surrogate without demonstrated translation; effect already fully priced; financing/dilution overwhelms economic gain; adverse safety/regulatory signal; revenue attribution to AI is unsupported; gross-margin deterioration offsets usage; customer/model concentration; hyperscaler bundling; open-source commoditization; take-rate compression; accounting proxy mistaken for cash economics; developer activity lacks conversion to paid workloads; package/download spikes are polluted by bots, CI, tutorials, free-tier experimentation or dependency churn.

# IV. Machine-readable output contract
Each run returns: ticker, timestamp, engine, FACTS[], HYPOTHESES[], INTERPRETATIONS[], NOISE[], evidence_grade, score, confidence, economic_delta, valuation_delta, flow_confirmation, repricing_state, falsifiers[], next_catalysts[], verdict, evidence_sources[], developer_activity_leading_indicator.

# V. Canonical principle
NEW EVIDENCE → ECONOMIC DELTA → VALUATION DELTA → OBSERVED REPRICING. Never reverse the causal chain by treating PRICE → THESIS as proof.

# VI. Developer activity principle
DEVELOPER ACTIVITY → POSSIBLE FUTURE WORKLOADS → POSSIBLE CONSUMPTION → POSSIBLE REVENUE. Never reverse the chain by treating PACKAGE DOWNLOADS or SDK USAGE as revenue, margin, FCF or durable moat proof.
