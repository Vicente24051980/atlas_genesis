# NEOCLOUD CUSTOMER ACCEPTANCE GATE Ω v1.0

**Status:** CANON ACTIVE  
**Effective date:** 2026-08-20  
**Scope:** neocloud / AI infrastructure deployments with material customer commissioning or acceptance before production billing  
**Authority:** specialized evidence gate under ATLAS Ω; amends AI Demand & Monetization Proof Ω and Global CAPEX Chain Ω without replacing their independent authority.

## Mission

Prevent ATLAS from treating a signed AI-infrastructure contract, financed GPU order or physically installed cluster as equivalent to realized economic proof.

For neoclouds and analogous AI infrastructure providers, the canonical proof chain is:

**Contract → Capacity / Financing → Hardware Ready → Deployment / Commissioning → Customer Acceptance → Revenue Recognition → Gross Margin → OCF / FCF → ROIC**

## Core law

**CONTRACT != DEPLOYMENT != CUSTOMER ACCEPTANCE != REVENUE != OWNER ECONOMICS.**

A cluster can exist physically and still fail contractual acceptance, SLA validation, production readiness or customer hand-off. Therefore deployment alone cannot promote a neocloud from E2 to E3 Economic Proof.

## Applicability

Run this gate when any material AI/cloud contract requires or economically depends on customer acceptance, commissioning, go-live validation, SLA validation, milestone sign-off or an equivalent hand-off before recurring production billing.

If a contract has no literal formal-acceptance clause, ATLAS must require an equivalent externally traceable production-acceptance event before treating deployment as economically live.

## Evidence ladder

- `N0_CONTRACTED` — signed or otherwise traceable commercial commitment.
- `N1_CAPACITY_SECURED` — credible power/datacenter/financing capacity allocated to the contract.
- `N2_HARDWARE_READY` — required compute/network/storage hardware available or delivered.
- `N3_DEPLOYED` — cluster installed/commissioned but customer acceptance is not yet evidenced.
- `N4_CUSTOMER_ACCEPTED` — customer has formally accepted the deployment or equivalent production hand-off is traceably evidenced.
- `N5_REVENUE_RECOGNIZED` — recognized revenue from the accepted deployment is evidenced.
- `N6_MARGIN_PROVEN` — recognized deployment revenue converts to credible gross/contribution margin.
- `N7_CASH_RETURN_PROVEN` — multi-period cash conversion and FCF/ROIC are evidenced.
- `NX_EXECUTION_REVIEW` — rejection, material dispute, SLA failure, acceptance delay, renegotiation, cancellation or failed conversion requires extraordinary review.

## Economic Proof mapping

- `N0` through `N4` remain **maximum E2_ORDERS_CONTRACTS**. Customer acceptance is stronger execution evidence than deployment, but it is not revenue.
- `N5` without credible margin is not sufficient for full E3 promotion.
- `N5 + N6` can support **E3_REVENUE_MARGIN** when evidence is traceable and attributable to the accepted deployment.
- `N7` can support **E4_FCF_ROIC_MULTI_PERIOD** only when cash conversion/ROIC is demonstrated across multiple periods.

## Acceptance Gate outcomes

- `PASS` — formal/equivalent customer acceptance is traceably evidenced and no material rejection/dispute is active.
- `PENDING` — deployment exists but acceptance is still pending.
- `NOT_EVIDENCED` — management implies acceptance/go-live but ATLAS lacks adequate traceable evidence.
- `FAIL` — rejection, dispute, SLA failure, material acceptance delay or other execution break is evidenced.

## Required inputs

1. contract ID / evidence reference;
2. customer/counterparty identity where public, otherwise concentration flag;
3. contract value and duration where disclosed;
4. take-or-pay / minimum commitment terms where disclosed;
5. capacity allocated (MW / racks / GPUs) where disclosed;
6. hardware generation and delivery status;
7. deployment / commissioning evidence;
8. customer acceptance or equivalent production hand-off evidence;
9. SLA / performance test status when material;
10. escrow / milestone release status when material;
11. recognized revenue attributable to the deployment;
12. gross/contribution margin evidence;
13. OCF/FCF and incremental ROIC evidence;
14. dilution / financing burden and customer concentration;
15. evidence provenance and dates.

## Escrow rule

Escrow release after customer acceptance is strong execution evidence, but **ESCROW RELEASE != REVENUE RECOGNITION** and cannot independently promote Economic Proof beyond E2.

## Take-or-pay rule

Take-or-pay improves contracted-demand quality but does not bypass Deployment, Customer Acceptance, Revenue Recognition, Margin or Cash Return gates.

## Falsifiers / downgrade triggers

- customer rejects the cluster or delays acceptance materially;
- SLA/performance validation fails;
- accepted capacity is materially below contracted capacity;
- acceptance is followed by weak or absent revenue recognition;
- revenue appears but gross/contribution margin is structurally poor;
- contract is renegotiated, cancelled or minimum commitment weakens;
- financing/dilution rises faster than economically accepted capacity;
- hardware obsolescence shortens payback before cash recovery;
- customer concentration or counterparty credit risk becomes structurally dangerous;
- deployed capacity remains idle outside contractual minimums.

## Cross-engine integration

- **AI Demand & Monetization Proof Ω:** acceptance is an execution bridge between contracted demand and realized monetization.
- **Global CAPEX Chain Ω:** neocloud E2 evidence must preserve stage granularity; physical deployment alone does not become E3.
- **AI CAPEX Payback Ω:** consumes only accepted/realized utilization and economic outputs, not headline TCV.
- **AI Financial Fragility Ω:** separately audits debt, convertibles, leases, purchase commitments, dilution and contingent obligations.
- **Successor Detection Ω / Wave Detection Ω:** may raise research priority after N4, but cannot upgrade Economic Proof ahead of N5/N6.
- **Falsifiers Ω:** retains independent absolute veto on confirmed structural failure.

## Standard output

`Entity → contract → capacity → hardware → deployment → acceptance status → acceptance evidence → revenue attributable → margin → cash conversion → proof stage N0-N7/NX → Economic Proof ceiling → confidence → falsifiers`

## Canonical example principle

A signed $950M five-year AI cloud agreement is not equivalent to a deployed cluster. A deployed cluster is not equivalent to a customer-accepted cluster. A customer-accepted cluster is not equivalent to recognized profitable revenue. ATLAS must preserve every step.

## Final law

**No neocloud may be promoted from contracted/deployed promise to monetization proof without crossing Customer Acceptance Gate and then demonstrating realized revenue plus margin.**
