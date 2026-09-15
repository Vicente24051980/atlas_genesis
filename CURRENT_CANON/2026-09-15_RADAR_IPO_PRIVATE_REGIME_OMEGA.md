# ATLAS Ω — Radar IPO / Private + Risk-Free Repricing

**STATUS:** RATIFIED_BY_HUMAN / ACTIVE_CANONICAL_R0_CONTROL  
**DATE:** 2026-09-15  
**SCOPE:** R0 discovery / research order / IPO lifecycle / macro valuation context  
**CAPITAL_AUTHORITY:** NONE  
**ANALYSIS != EXECUTION:** mandatory  

## 1. Governance

This patch implements existing ATLAS Financiero Ω v3.3 responsibilities. It does **not** create a new scoring engine, does not alter Nine-Score / E1-E6 / FRU-MATH / sizing / timing / Replacement Firewall, and does not authorize a portfolio trade.

Research priority is not investment score. Private-company valuation is not a Point Zero entry valuation. Confidential filing is not public audited evidence.

## 2. Active macro context — REGIME-2026-09-15

`RISK-FREE REPRICING = ACTIVE`

Verified market state on 2026-09-15:
- U.S. 10Y Treasury yield traded above 5%, its highest level since 2007.
- Oil remained above $100/bbl amid Middle East disruption.
- Markets assigned a high probability to near-term Fed tightening after persistent inflation.
- Equities weakened, but Reuters found no evidence of broad systemic panic.

Implementation effect:
- increase valuation hurdle for long-duration equities;
- increase scrutiny of leverage, refinancing, SBC/dilution and far-dated FCF;
- increase scrutiny of CAPEX-heavy business models whose economics depend on cheap funding;
- require reverse DCF / Expectations Gap / normalized FCF / FRU rather than static multiple narratives;
- **never** convert `10Y > 5%` into an automatic SELL.

This is a state inside existing `LIQUIDITY & LONG-END TRANSMISSION Ω`, not a new engine.

## 3. AI CAPEX slowdown watch

`AI_CAPEX_SLOWDOWN_WATCH = ACTIVE / HIGH`

Reuters reports that investors are now explicitly repricing the risk that AI spending slows after safety/regulatory warnings. This is a candidate trigger, not a falsifier by itself.

Escalation requires economic evidence such as:
- hyperscaler cancellation or material deferral of funded projects;
- order/backlog/RPO deterioration;
- utilization deterioration;
- negative estimate revisions tied to real demand;
- normalized FCF / ROIC deterioration across the physical AI stack.

Statements, political rhetoric, safety debate or a one-day semiconductor drawdown alone do not falsify AI Capex Conversion.

## 4. IPO lifecycle states

Use the existing implementation:

`F0_PRIVATE_DISCOVERY -> F1_CONFIDENTIAL_FILING_REPORTED -> F2_PUBLIC_S1_AVAILABLE -> F3_PRICED -> F4_LISTED_PRICE_DISCOVERY -> F5_LOCKUP_SUPPLY_DISCOVERY -> F6_NORMALIZED_PUBLIC_COMPANY`

F0/F1 allowed action: `RESEARCH_ONLY / WAIT_FOR_PUBLIC_FILING`.

No pre-IPO company can receive an entry verdict from private estimates alone.

## 5. Radar — IPO / pre-IPO 2026–27

### Anthropic — PRIORITY MAX

- Lifecycle: `F1_CONFIDENTIAL_FILING_REPORTED`.
- State: `PRE_IPO_MAX_PRIORITY`.
- Function: enterprise cognitive infrastructure / agents / coding.
- Reuters reports Anthropic confidentially filed for a U.S. IPO in June 2026 and remains in active late-2026 IPO preparation.
- Reuters reported annualized revenue run rate above $65B by mid-2026.
- Financial Times reported positive adjusted operating income for a second consecutive quarter, excluding SBC, and gross margin above 80% before revenue sharing and training costs.
- Reported ~$2T valuation discussion is **expectation evidence**, not an accepted entry valuation.

Mandatory F2 audit when the prospectus is public:
`audited revenue quality -> customer concentration -> gross margin bridge -> inference economics -> training economics -> OCF -> normalized FCF -> SBC/dilution -> compute commitments/recourse -> governance -> offer valuation -> float/lock-up -> reverse DCF -> FRU -> Point Zero`.

No automatic IPO buy.

### Altera — PRIORITY HIGH

- Lifecycle: `F1_CONFIDENTIAL_FILING_REPORTED`.
- Reuters confirmed the confidential U.S. IPO filing on 2026-09-15.
- Silver Lake owns 51%; Intel retains 49% following the 2025 standalone transaction.
- Function: programmable compute / FPGA / networking / inference complement.
- Management has projected mid-20% revenue growth for 2026.

Gate: public S-1, audited segment economics, hyperscaler/customer concentration, gross margin, FCF, capital intensity, governance, offer valuation and supply structure.

## 6. Private Watch

### Agility Robotics — 12M CANDIDATE / PRIORITY HIGH

Primary company evidence on 2026-09-15:
- Digit 5 unveiled.
- >65,000 real-world operating hours reported for Digit 4.
- >$300M multi-year Digit 5 orders reported, subject to contractual milestones.
- early access expected H1 2027; general availability expected by end-2027.

Classification: `F0_PRIVATE_DISCOVERY / 12M_CANDIDATE`.

Promotion still requires independent operating and economic proof: productive autonomy, intervention rate, uptime, cost/hour, renewals, recognized revenue, service economics and FCF path.

### Temporal — PRIVATE WATCH / PRIORITY HIGH

- $550M Series E at $12.55B valuation announced.
- Company-reported annualized revenue run rate >$250M, >200% YoY growth and >4,300 paying customers.
- Function: durable execution / orchestration infrastructure for agents and critical workflows.

Counterweight: valuation is roughly 50x current annualized revenue before audited economics. Require retention, gross margin, FCF, customer concentration, agentic-demand durability and any future IPO filing.

### Euclyd — PRIVATE WATCH / PRIORITY MEDIUM-HIGH

- >€200M Series A announced 2026-09-15.
- Samsung is a co-lead investor; former ASML CEO Peter Wennink joins as chairman.
- Function: inference silicon / memory-bandwidth / power-efficiency architecture.

Funding quality and team pedigree are **not** Economic Proof. Require independent silicon benchmarks, tape-out/foundry evidence, deployments, cost/token, revenue and margins.

### Exein — PRIVATE WATCH / PRIORITY MEDIUM-HIGH

- $270M funding at $1.7B valuation announced 2026-09-15.
- Function: embedded / Physical-AI cybersecurity for robots, drones, vehicles and connected machines.

Require audited ARR/revenue, retention, margins, customer concentration and independent verification of deployment scale before promotion.

### OpenAI — PRIVATE WATCH / 2026 IPO OFF

Reuters reported Sam Altman said OpenAI will not pursue an IPO in 2026.

State:
- 2026 IPO window: `CLOSED_BY_COMPANY_STATEMENT`.
- 2027+ timetable: `UNCONFIRMED`.
- Strategic relevance remains HIGH because of multimodal/agent/hardware optionality, but it does not occupy a confirmed 2026 IPO slot.

## 7. China universe rule

`CHINA_ONLY_SECURITIES = NON_INVESTABLE_EVIDENCE_ONLY`

For the current user investment universe:
- do not surface China-only securities as portfolio candidates;
- do not spend research capacity ranking Chinese equities for purchase;
- Chinese production, demand, pricing, supply-chain, policy and competitive data may be used when material to an investable company elsewhere;
- this constraint changes only by explicit human instruction.

## 8. Research-order table

| Entity / state | Lane | Priority | Lifecycle | Capital authority | Next gate |
|---|---|---|---|---|---|
| Anthropic | IPO / pre-IPO | MAX | F1 | NONE | Public S-1 + full Point Zero |
| Altera | IPO / pre-IPO | HIGH | F1 | NONE | Public S-1 |
| Agility Robotics | Private / robotics | HIGH | F0 | NONE | Independent unit economics + commercialization |
| OpenAI | Private | HIGH | F0 | NONE | Verified 2027+ filing/timetable |
| Temporal | Private / agent infra | HIGH | F0 | NONE | Audited economics / filing |
| Euclyd | Private / semis | MEDIUM-HIGH | F0 | NONE | Independent silicon + commercial proof |
| Exein | Private / physical cyber | MEDIUM-HIGH | F0 | NONE | Audited ARR/revenue + retention/margins |
| Risk-Free Repricing | Macro context | MAX | N/A | NONE | Persistence + transmission |
| AI CAPEX slowdown | Macro/economic watch | HIGH | N/A | NONE | Real cancellations/orders/RPO/FCF |
| China-only securities | Evidence only | MEDIUM | N/A | NONE | Explicit human universe change only |

## 9. Sources / provenance

High-confidence public sources used for this patch:
- Reuters, 2026-09-15: global bond yields / U.S. 10Y above 5%.
- Reuters, 2026-09-15: Wall Street / oil / Treasury / AI anxiety.
- Reuters, 2026-09-15: Altera confidential U.S. IPO filing.
- Reuters, 2026-09-11 and 2026-08-18: Anthropic IPO preparation / pre-IPO financing / reported revenue run rate.
- Financial Times, 2026-09-14: Anthropic adjusted operating profitability and gross-margin disclosures to investors.
- Agility Robotics, 2026-09-15: Digit 5 launch, operating hours, conditional multi-year orders and deployment timetable.
- Temporal funding announcement, 2026-09-14: Series E, valuation and company-reported operating metrics.
- Euclyd, 2026-09-15: Series A and chairman/investor disclosure.
- Exein, 2026-09-15: financing/valuation disclosure.
- Reuters, 2026-09-12: OpenAI 2026 IPO statement.

Newsletter claims remain secondary until reconciled with these or stronger primary/public evidence.

## 10. Invariants

- `RESEARCH_PRIORITY != INVESTMENT_SCORE`
- `PRIVATE_VALUATION != POINT_ZERO`
- `F0/F1 != BUY`
- `CONFIDENTIAL_FILING != PUBLIC_AUDITED_EVIDENCE`
- `MACRO_REPRICING != FUNDAMENTAL_FALSIFIER`
- `AI_SAFETY_NARRATIVE != AI_CAPEX_DETERIORATION`
- `CHINA_ONLY != INVESTABLE_UNIVERSE`
- `ANALYSIS != EXECUTION`
