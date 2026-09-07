# GLOBAL POWER MAP Ω v1.0 — Canonical Ontology

**Date:** 2026-09-07  
**Status:** CANONICAL METHODOLOGY / RESEARCH MODEL  
**Scope:** geopolitical, monetary, compute, capital, energy/materials and physical-connectivity dependency mapping.

> This document freezes the ontology and dependency methodology developed in the 7-Sep-2026 Red Team session. It does **not** convert provisional node-level factual claims into verified facts. Time-sensitive metrics and node assignments require evidence-date/source validation before operational use.

## 1. Core principle

GLOBAL POWER MAP Ω rejects pseudo-precision and scalar wealth rankings. Systemic power is modeled as a directed topology of dependencies, chokepoints, veto capacity, substitutability and replacement latency.

**SYSTEMIC POWER ≠ WEALTH.**

Conceptually:

`SYSTEMIC POWER = CRITICALITY × LOW SUBSTITUTABILITY × REPLACEMENT LATENCY × VETO CAPACITY × DEPENDENCY CENTRALITY`

These terms are analytical dimensions, **not** inputs to a cosmetic 0–100 score.

## 2. Mandatory UNIT TYPE

Every node must declare exactly what kind of unit it represents before comparison.

- `STATE` — territorial sovereign with primary legal/coercive authority.
- `INSTITUTION` — public or multilateral governance body (Fed, PBOC, Treasury/OFAC, BIS, etc.).
- `CORPORATION` — public/private company with a unified chain of command.
- `DYNASTY` — dynastic/family control structure over assets with state-scale relevance.
- `INFRASTRUCTURE_SYSTEM` — transactional or physical network/protocol (SWIFT, CHIPS, Fedwire, DNS/ICANN, etc.).
- `MARKET_STRUCTURE` — oligopolistic configuration of multiple independent competitors whose joint failure can disable a flow; it must not be treated as a single corporation.

## 3. Power layers N1–N5

- **N1 — Sovereignty & Territorial Coercion:** military, nuclear, jurisdictional and sanctions authority.
- **N2 — Hardware, Silicon & Critical Manufacturing:** atomic-scale compute/manufacturing capability and hard technical chokepoints.
- **N3 — Capital Allocation & Balance-Sheet Control:** fiduciary managers, private capital, banks, private-credit sponsors and balance-sheet engineering.
- **N4 — Physical Resources, Energy & Primary Logistics:** molecules, metals, mining, energy, freight and physical commodity flows.
- **N5 — Systemic Monetary & Financial Infrastructure:** central banks, payment/clearing/settlement rails and institutions that sustain convertibility and financial execution.

`UNIT TYPE` and `POWER LAYER` are independent metadata. They must never be conflated.

## 4. Band semantics

Bands describe systemic reach, not wealth or prestige.

- **S — System-Dominant:** can materially reconfigure multiple global systems.
- **A — Global Chokepoint:** failure or denial creates a severe bottleneck with low near-term substitutability.
- **B — Multidomain Power:** decisive influence across at least two major domains or a critical domain with meaningful substitution constraints.
- **C — Sector-Dominant:** exceptional power largely confined to a sector/vector.
- **D — Wealth / Access:** major wealth/network access without comparable direct veto or infrastructure control.

A large market share alone is insufficient for Band A.

## 5. Mandatory ontology splits

Artificial composite nodes must be split when command, ownership or failure modes differ.

- Microsoft and OpenAI are separate `CORPORATION` nodes connected by strategic dependency edges.
- BHP and Rio Tinto are separate corporations.
- Eli Lilly and Novo Nordisk are separate corporations.
- SWIFT, CHIPS and Fedwire are separate `INFRASTRUCTURE_SYSTEM` nodes.
- OFAC / U.S. Treasury and the Federal Reserve are `INSTITUTION` nodes; coercive disconnection authority must not be attributed to the payment rail itself.
- ABCD grain concentration is a `MARKET_STRUCTURE`; Cargill, ADM, Bunge and Louis Dreyfus remain independently auditable entities.

## 6. Calibrations adopted

### ASML
Describe EUV as a **techno-economic bottleneck for industrial leading-edge production**, not as proof that no transistor geometry below a threshold can ever be produced by DUV experimentation. Technical feasibility and commercially viable high-yield volume production are different claims.

### TSMC
Do not label total-foundry revenue share as a `<7nm` share. Store market-share observations with explicit metric, period and source. Leading-edge dominance must be evidenced separately from overall foundry revenue share.

### BlackRock / Vanguard / fiduciaries
AUM is client/fiduciary capital, not the manager's proprietary wealth. Analyze stewardship, custody/risk infrastructure, flow aggregation and governance separately from ownership and sovereign coercion.

### Apple / Foxconn
Model supplier diversification explicitly. Avoid “absolute dependence” claims when Luxshare, Pegatron, Tata Electronics or other manufacturing alternatives are material.

### SpaceX
Model Western launch dominance through cadence, marginal cost, available volume and substitution latency. Do not claim that NATO states literally have no alternative launch providers.

### Physical commodity traders
High traded volume is not automatically a unique chokepoint because commodities and contracts can be fungible and rerouted. Vitol is therefore analytically distinguishable from an ASML-type fixed-capital chokepoint.

## 7. Pentagonal interdependence architecture

The former three-node framing is replaced by five coupled systems:

1. **SOVEREIGN POWER** — coercion, sanctions, subsidies, military protection.
2. **MONETARY SYSTEM** — currency, central-bank liquidity, clearing and settlement.
3. **COMPUTE STACK** — lithography → foundry → memory/packaging → accelerators → hyperscalers.
4. **ENERGY & MATERIALS** — oil, gas, nuclear, electricity, copper and critical minerals.
5. **PHYSICAL CONNECTIVITY** — subsea cables, orbital connectivity, shipping routes, ports and datacenters.

Dependency is circular rather than hierarchical: sovereign power requires compute; compute requires energy/materials and connectivity; capex and trade require monetary rails; monetary authority ultimately rests on legal/institutional sovereignty.

## 8. Directed Dependency Matrix — edge schema

Each directed dependency edge must contain:

```text
SOURCE_NODE
TARGET_NODE
DEPENDENCY_TYPE
CRITICAL_INPUT
SUBSTITUTABILITY
BUFFER
FAILURE_LATENCY
REPLACEMENT_LATENCY
GEOGRAPHIC_CONCENTRATION
LEGAL_CONTROL
PHYSICAL_CONTROL
CONFIDENCE
EVIDENCE_DATE
EVIDENCE_SOURCE
SCENARIO
```

Example topology:

```text
ASML
  ↓ lithography
TSMC
  ↓ advanced wafers
NVIDIA
  ↓ accelerators/platform
Hyperscalers
  ↓ compute demand
Datacenters
  ↓ electricity
Grid / Gas / Nuclear
```

The reverse and upstream dependencies must also be represented: TSMC→ASML; ASML→Zeiss/Trumpf/supplier network; TSMC→chemicals/power/water; hyperscalers→GPU/ASIC/HBM; HBM→SK hynix/Samsung/Micron; AI infrastructure→private credit/private capital/sovereign capital.

## 9. Failure-latency model

The original 24h / 30d / 2y stress windows remain useful scenario checkpoints, but no node receives one unsupported deterministic latency.

For every scenario record:

- **T0 — Time to observable disruption:** first externally observable impairment.
- **Tcrit — Time to systemic impairment:** point at which dependent systems materially fail.
- **Tsub — Time to functional substitution:** time for alternatives to restore a useful fraction of the lost function.
- **Tfull — Time to rebuild equivalent capacity:** time to recreate approximately equivalent capability/capacity.

All four should be stored as evidence-backed ranges when uncertainty is material.

### Scenario discipline

`TSMC outage`, `Taiwan blockade`, `loss of CoWoS`, `loss of technical workforce`, and `simultaneous ASML supply denial` are different scenarios and must not share one replacement-latency number.

Likewise, payment-system disruption must distinguish messaging, clearing, settlement and legal sanctions authority.

## 10. Evidence discipline

Every time-sensitive assertion must carry:

- metric definition;
- observation date/period;
- source;
- confidence;
- distinction between `FACT`, `DERIVED FACT`, `INFERENCE`, `HYPOTHESIS`, and `UNKNOWN`.

Market share, AUM/AUC, satellite counts, daily payment volumes and leadership/corporate-control claims must not become permanent canon without dated evidence.

## 11. Current methodological conclusion

The ontology is considered **closed for v1.0**. The next research artifact is the `Directed Dependency Matrix`, followed by scenario stress tests across 24-hour, 30-day and multi-year horizons.

The purpose is not to produce a prettier Top 50. It is to determine which nodes retain real veto power after substitution paths, buffers, legal authority and rebuild time are modeled explicitly.
