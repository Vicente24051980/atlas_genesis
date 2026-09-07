# GLOBAL POWER MAP Ω v1.0 — Directed Dependency Matrix / SVI / Ablation Specification

**Date:** 2026-09-07
**Status:** CANONICAL RESEARCH SPECIFICATION — NOT YET EMPIRICALLY POPULATED
**Parent canon:** `CURRENT_CANON/2026-09-07_GLOBAL_POWER_MAP_OMEGA_v1_0_CANON_REGISTRATION.md`

> This artifact formalizes the DDM, SVI and perturbation methodology. It does **not** promote illustrative latency values, market shares, monopoly claims or node rankings to verified fact. Those require evidence-backed population and scenario testing.

## 1. Directed edge formalization

Each dependency edge from node A to node B is modeled as a multidimensional directed vector:

`E_(A→B) = <Φ, Bt, Se, Tcrit, Tfull, Cκ>`

Where:

- `Φ` — critical functional flow transferred from A to B: physical, logical, financial, legal or informational.
- `Bt` — buffer time available to B before loss of Φ produces material degradation.
- `Se ∈ [0,1]` — substitution elasticity. `1` means effectively immediate/frictionless substitution; `0` means no useful short/medium-term substitute under the defined scenario.
- `Tcrit` — scenario-specific time to systemic impairment of B.
- `Tfull` — scenario-specific time to rebuild approximately equivalent capacity.
- `Cκ` — coercion asymmetry / blowback parameter. High positive values indicate that A can deny the function to B with relatively low reciprocal damage; values near zero indicate strongly mutual dependence.

These quantities must be stored as evidence-backed ranges when uncertainty is material.

## 2. Systemic Veto Index — research formulation

Candidate formulation:

`SVI_i = Σ_(j≠i) [((1-Se_(i→j))/Bt_(i→j)) × Tfull_i × Cκ_(i→j)]`

Interpretation: systemic veto increases when a node is hard to substitute, downstream buffers are short, equivalent capacity is slow to rebuild and coercive blowback is limited.

### Guardrail

`SVI` is a **research metric**, not an established scientific law and not yet canonical as a validated scalar ranking. Before operational use it requires:

- dimensional normalization;
- treatment of zero/near-zero buffers;
- uncertainty propagation;
- scenario conditioning;
- validation against historical disruptions;
- prevention of double-counting correlated edges;
- explicit treatment of hyperedges and shared suppliers;
- sensitivity testing for `Cκ` and substitution estimates.

Until those tests are complete, `SVI` must be reported as `EXPERIMENTAL`.

## 3. Hidden-node discovery program

The DDM must search below headline corporations for upstream molecular/process chokepoints.

### Compute / materials candidates

- Carl Zeiss SMT — EUV optical subsystem dependencies.
- TRUMPF — laser/source subsystem dependencies for EUV.
- Shin-Etsu Chemical / SUMCO — semiconductor-grade silicon wafer supply.
- JSR / Tokyo Ohka Kogyo and other photoresist/chemical suppliers.
- Advanced packaging / CoWoS-related equipment, substrates and materials.
- HBM supply and packaging dependencies across SK hynix, Samsung, Micron and upstream equipment/material suppliers.

### Energy/grid candidates

- Grain-oriented electrical steel (GOES).
- Large power transformers and specialized transformer components.
- Grid interconnection equipment and high-voltage switchgear.
- Heavy rare-earth separation/refining chains.
- Nuclear fuel-cycle bottlenecks and enrichment/conversion services.

### Financial-plumbing candidates

- DTCC and subsidiaries.
- CLS.
- CHIPS.
- Fedwire.
- LCH / CME Clearing / other central-counterparty infrastructure.
- BNY / State Street / JPMorgan custody and servicing functions.

Every candidate remains `EVIDENCE_PENDING` until its market concentration, functional role, legal control and substitution paths are verified.

## 4. Virtual ablation protocol

For each node or infrastructure system, simulate scenario-specific removal and measure downstream propagation.

Canonical horizons:

- `H1 = 24 hours` — liquidity, settlement, grid, communications, real-time operations.
- `H2 = 30 days` — inventories, working capital, logistics, commodity flows, refining.
- `H3 = 1–12 months` — production, assembly, maintenance and replacement-cycle constraints.
- `H4 = 1–5+ years` — fixed-capital rebuild, tacit knowledge, specialized materials, fabs, advanced manufacturing.

For every ablation, record:

```text
NODE
SCENARIO
DIRECT_DEPENDENTS
SECOND_ORDER_DEPENDENTS
T0_RANGE
TCRIT_RANGE
TSUB_RANGE
TFULL_RANGE
FUNCTIONAL_LOSS
SUBSTITUTION_PATHS
BLOWBACK
LEGAL_RESPONSE
GEOPOLITICAL_RESPONSE
EVIDENCE
CONFIDENCE
RESULT_STATE
```

`RESULT_STATE ∈ {FACT_SUPPORTED, DERIVED, MODEL_OUTPUT, HYPOTHESIS, UNKNOWN}`.

## 5. Illustrative scenarios — status discipline

The following are useful stress-test templates but are **not** factual conclusions until independently populated:

- fiduciary-manager failure (e.g. BlackRock/Vanguard operational failure or intervention);
- dollar settlement disruption (Fedwire/CHIPS/OFAC separately, not as one actor);
- Taiwan leading-edge foundry outage/blockade;
- EUV supply-chain loss affecting ASML/Zeiss/TRUMPF;
- shipping-network outage;
- commodity-trader insolvency or credit-line freeze;
- grid-transformer bottleneck;
- heavy rare-earth separation denial.

Illustrative numerical claims such as `4–7 years`, `10–15 years`, `30–40% GDP contraction`, or fixed percentages of global flows must remain `HYPOTHESIS / MODEL INPUT` until sourced and validated.

## 6. Coercion vs physical absorption

The model explicitly distinguishes:

- `DESTRUCTION_POWER` — ability to destroy, sanction, occupy or disable a node;
- `ABSORPTION_POWER` — ability to reproduce and operate the node's function after coercive takeover.

A sovereign may possess high destruction power but low absorption power where tacit knowledge, distributed suppliers, calibration, workforce cooperation, software support, proprietary tooling or foreign inputs are indispensable.

This distinction is canonical for v1.0.

## 7. Provisional concentric topology — NOT FINAL RANKING

A working hypothesis for testing is:

- **Circle 0 — Sovereign/coercive core:** United States and China as system-scale sovereign nodes.
- **Circle 1 — hard physical/knowledge chokepoints:** leading-edge lithography/foundry/materials chains.
- **Circle 2 — critical flow/settlement infrastructure:** monetary rails, energy systems, logistics and connectivity.
- **Circle 3 — bridge nodes:** actors spanning multiple power layers.
- **Circle 4 — high-volume but more substitutable operators:** fiduciary managers, traders and other large-scale intermediaries.

This topology is a **research hypothesis**. The DDM/ablation results may promote, demote, split or remove any node.

## 8. Required next implementation

1. Build the node registry with stable IDs and `UNIT_TYPE` / `POWER_LAYER` metadata.
2. Build the edge registry using the canonical directed-edge schema.
3. Populate a first verified tranche of 50–100 edges across compute, payments, energy/grid, shipping and sovereign-control layers.
4. Attach dated evidence and epistemic state to every edge.
5. Run sensitivity tests for `Se`, `Bt`, `Cκ`, and latency vectors.
6. Backtest against historical disruptions where possible.
7. Execute virtual ablation by horizon.
8. Only then derive a provisional systemic hierarchy.

## 9. Current state

- `ONTOLOGY`: CANONICAL / FROZEN v1.0
- `DDM MATHEMATICAL FORMALIZATION`: SPECIFIED
- `SVI`: EXPERIMENTAL / UNVALIDATED
- `HIDDEN NODE CANDIDATES`: RESEARCH QUEUE
- `ABLATION ENGINE`: SPECIFIED / NOT IMPLEMENTED
- `EMPIRICAL EDGE POPULATION`: PENDING
- `FINAL GLOBAL POWER HIERARCHY`: NOT ESTABLISHED

The governing principle remains:

**Systemic power is the asymmetry of dependencies that cannot be compensated within the adversary's survival horizon.**
