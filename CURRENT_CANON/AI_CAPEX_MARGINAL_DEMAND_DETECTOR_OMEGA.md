# AI CAPEX MARGINAL DEMAND DETECTOR Ω v1.0

**Status:** CANONICAL CONTROL MODULE / ACTIVE  
**Effective date:** 2026-09-14  
**Implementation:** `src/atlas/algorithm/ai-capex-marginal-demand-detector-omega.ts`  
**Placement:** E5 Control / E6 Assurance  
**Direct structural-score weight:** 0  
**Primary-engine status:** NOT A NEW PRIMARY ENGINE

## Mission

Detect whether the **marginal demand impulse** behind AI infrastructure is deteriorating before absolute backlog, recognized revenue and FCF necessarily roll over.

The detector exists because supplier accounting contains lags:

`prior CAPEX budget -> order / contract -> backlog/RPO stock -> delivery -> revenue -> margin -> OCF/FCF`

Therefore:

`record backlog != proof of fresh CAPEX acceleration`.

A company can report record backlog and strong revenue while the rate of new demand formation is already weakening.

## Canonical distinction

ATLAS must keep these states separate:

1. **Price/trade regime break** — market leadership is persistently broken.
2. **Marginal demand deterioration** — fresh buyer/order/pipeline evidence weakens.
3. **Fundamental break** — deterioration reaches revenue guidance, margins, utilization and/or FCF.

A state may precede the next one by multiple quarters.

## Market sensor gate

A `PRICE_REGIME_BREAK` requires all three:

- at least **8 weeks** of persistent deterioration;
- at least **3 economically distinct chain layers** broken;
- at least **60% negative relative-strength breadth** across the observed canonical chain.

Eligible chain layers include:

- semiconductors / accelerators / memory;
- networking / optics / connectivity;
- servers / systems;
- power / cooling / electrical equipment;
- EPC / grid / deployment.

A single session cannot satisfy the persistence gate.

Price remains a sensor only. It cannot by itself confirm fundamental failure.

## Independent marginal-demand categories

### 1. BUYER_FORWARD_CAPEX

Observe forward allocator behaviour:

- hyperscaler CAPEX guidance revisions;
- new data-center capacity commitments;
- purchase/lease commitments;
- project phasing or delays;
- financing constraints on new projects;
- explicit deferrals or cancellations.

### 2. SUPPLIER_ORDER_FLOW

Observe fresh flow into the supplier pipeline:

- new orders growth;
- book-to-bill;
- bookings/RPO additions;
- bookings growth relative to recognized revenue growth.

Multiple order metrics belong to one category and may not be double-counted as independent confirmations.

### 3. PIPELINE_VELOCITY

Observe change in the backlog pipeline rather than its absolute size:

- sequential backlog growth;
- net backlog additions after deliveries;
- cancellations / deferrals / pushouts;
- lead-time compression;
- capacity-reservation release.

## Backlog Lag Mask Ω

`BACKLOG_LAG_MASK_WARNING` exists when:

- the market-regime-break gate is satisfied;
- absolute backlog still appears strong; and
- at least **two independent marginal-demand categories** deteriorate.

Interpretation:

Historical contracted demand may be masking a weaker current CAPEX/order impulse.

**Canonical law:** absolute backlog can never veto deterioration in fresh-flow evidence.

## State machine

### `CLEAR`
No persistent price-regime break and no material marginal-flow warning.

### `PRICE_REGIME_BREAK`
Persistent broad market deterioration across the linked AI-CAPEX chain; fundamentals not yet sufficient to declare marginal-demand break.

Allowed action: `RF2_OPEN` / review only.

### `MARGINAL_FLOW_WARNING`
One or two marginal-flow/downstream warning channels exist, but full independent-category confirmation is incomplete.

Allowed action: `RF2_OPEN` / evidence collection.

### `BACKLOG_LAG_MASK_WARNING`
Persistent market break + strong absolute backlog + at least two independent marginal-demand categories deteriorating.

Allowed action: `RF2_OPEN` and fresh-flow audit.

### `MARGINAL_DEMAND_DETERIORATING`
All three independent marginal-demand categories deteriorate:

`BUYER_FORWARD_CAPEX + SUPPLIER_ORDER_FLOW + PIPELINE_VELOCITY`.

Do **not** wait for backlog/revenue collapse before opening thesis review.

Allowed action: `RF2_OPEN`; no automatic sale.

### `FUNDAMENTAL_BREAK_CONFIRMED`
Marginal-demand deterioration is established and at least two downstream confirmation channels deteriorate:

- revenue guidance;
- margin conversion;
- FCF;
- utilization.

Allowed action: thesis audit + incumbent/challenger comparison. Still no automatic sale.

### `DATA_INSUFFICIENT`
Traceable evidence is absent. Fail closed.

## Evidence hierarchy

For marginal demand, prefer:

`forward buyer CAPEX -> new orders / book-to-bill -> pipeline velocity / cancellations -> absolute backlog -> recognized revenue -> margin -> FCF`.

This ordering is about **timing of demand detection**, not economic importance. FCF remains superior for owner economics; fresh orders are superior for detecting a turning marginal impulse.

## Anti-double-count law

Multiple suppliers funded by the same hyperscaler CAPEX pool are not independent demand rivers.

Likewise:

- new orders + book-to-bill + bookings/revenue = one `SUPPLIER_ORDER_FLOW` category;
- backlog velocity + cancellations + lead times = one `PIPELINE_VELOCITY` category;
- revenue + margin + FCF are downstream confirmations, not three independent upstream demand pools.

## Integration

This detector feeds, but does not replace:

- **AI CAPEX Payback Ω** — economic conversion/payback;
- **Global CAPEX Chain Ω** — funding-pool and receiver mapping;
- **CAPEX Hunters Ω** — structural receiver discovery;
- **NEXT-GEN SEMIS Ω** — price/fundamental migration analysis;
- **Falsifiers / thesis review** — deterioration routing.

It cannot overwrite Structural ATLAS, valuation, Expected Return or Falsifier Veto.

## Mandatory constraints

1. Price = signal; evidence decides.
2. Absolute backlog is lagging visibility, not fresh-demand proof.
3. Record backlog can coexist with marginal-demand deterioration.
4. Missing disclosure = UNKNOWN, never inferred deterioration.
5. Same funding pool cannot be counted repeatedly.
6. No state creates an automatic BUY or SELL.
7. A threshold may open `RF2` review but cannot execute capital.
8. Fundamental failure requires downstream confirmation, not price alone.
9. Every input must be point-in-time and provenance-bound.
10. Any threshold revision must be versioned.

## Current application — 2026-09-14

The module is introduced because persistent weakness since June has appeared across semiconductors and linked AI-infrastructure beneficiaries such as power/electrical/deployment names, while absolute backlog remains capable of reflecting previously contracted demand.

**No company or chain is automatically classified here without a complete point-in-time evidence packet.** The current observation motivates the detector; it does not pre-fill its fundamental result.

## Canonical principle

> **Backlog is a stock of prior commitments. Marginal demand is the flow of new economic commitment. ATLAS must detect the flow before waiting for the stock to empty.**
