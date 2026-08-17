# ATLAS Ω — CAPITAL DESTINATION ENGINE SUITE v1.0

**Effective date:** 2026-08-17  
**Status:** ACTIVE / CANONICAL COMPATIBLE under ATLAS Ω v3.1  
**Parent architecture:** Money Rotation Ω + Global CAPEX Chain Ω + CAPEX Hunters Ω + Capital Funding Quality Ω + Financed Demand Ω

## Mission
ATLAS must not decide in advance that the next capital destination is AI, memory, energy, software, cooling, semiconductors, construction, housing, materials, transport, gold or any other sector.

**Canonical law: FOLLOW THE DOLLAR, NOT THE SECTOR LABEL.**

The system maps where funded economic demand is actually moving and then separates:
1. destination of capital,
2. economic capture,
3. funding robustness,
4. crowding/timing,
5. valuation/implied return,
6. portfolio duplication.

## New canonical engines

### 1. DESTINATION OF MONEY Ω v1.0
Technical: `src/atlas/algorithm/destination-of-money-omega.ts`.

Scores capital destinations using independent channels:
- public fund flows,
- private equity / strategic M&A,
- corporate CAPEX,
- sovereign/fiscal spending,
- credit/project financing,
- orders/backlog/contracts,
- revenue/margin/FCF proof,
- estimate revisions,
- relative-strength confirmation.

Structural destination score is **not** reduced by valuation, crowding or funding fragility. Those remain explicit overlays.

Stages:
`R1_EARLY_SIGNAL → R2_ACCUMULATION → R3_CONFIRMED_RECEIVER → R4_ACCELERATING → R5_CROWDED → R6_DECELERATING_EXIT`.

Destination taxonomy includes:
`MEMORY_STORAGE, SEMICONDUCTOR_EQUIPMENT, COMPUTE_ACCELERATORS, NETWORKING_OPTICS, POWER_GENERATION, GRID_ELECTRIFICATION, COOLING_THERMAL, DATA_CENTER_CONSTRUCTION, BUILDING_MATERIALS, TRANSPORT_LOGISTICS, SOFTWARE, HOME_BUILDERS, DEFENSE_AEROSPACE, HEALTHCARE, FINANCIAL_RAILS_INSURANCE, ENERGY_SECURITY, GOLD_REAL_ASSETS, EMERGING_MARKETS, CONSUMER_DEFENSIVE`.

### 2. MEMORY SCARCITY Ω v1.0
Technical: `src/atlas/algorithm/memory-scarcity-omega.ts`.

Mandatory variables:
`AI_DEMAND_ELASTICITY → HBM/DRAM/NAND_PRICING → CAPACITY_TIGHTNESS → CONTRACT_DURATION/PREPAYMENTS → SERVER_MIX_SHIFT → INVENTORY_HEALTH → FCF_CONVERSION → SUPPLY_RESPONSE_DISCIPLINE`.

Risk overlays: customer concentration, technology substitution, crowding.

States:
`SCARCITY_CONFIRMED / TIGHTENING / BALANCED / NORMALIZING / OVERBUILD_RISK`.

Scarcity is not a permanent moat and never creates an automatic BUY.

### 3. CAPITAL MIGRATION Ω v1.0
Technical: `src/atlas/algorithm/capital-migration-false-ai-omega.ts`.

Tracks sophisticated ownership migration through:
`PE take-private interest + strategic M&A + asset sales/IPO exits + FCF quality + net buybacks + insider/strategic activity + valuation gap + revisions + public-flow confirmation`.

Private capital leading public capital is classified as **early migration**, not confirmed public rotation.

### 4. FALSE AI DISRUPTION Ω v1.0
Technical: `src/atlas/algorithm/capital-migration-false-ai-omega.ts`.

Tests whether an AI-disruption selloff is economically justified.

Mandatory fields:
`recurring revenue quality + switching costs/system-of-record + FCF/share + retention + AI monetization + SBC/share-count discipline + gross-margin resilience + valuation compression + organic growth resilience + actual AI substitution risk`.

A multi-motor convergence with Capital Migration/GCC/Money Rotation raises research priority but **does not overwrite MOTOR_ORIGEN**.

### 5. LIQUIDITY SURVIVAL Ω v1.0
Technical: `src/atlas/algorithm/liquidity-crowding-omega.ts`.

Objective: maximize **Survivable Expected Return**, not theoretical return.

Variables:
`leverage + margin funding resilience + liquidity depth + concentration resilience + factor diversification + collateral stability + maturity/funding match + drawdown tolerance`.

Outputs Thesis Survival Time Ω: `LONG / ADEQUATE / SHORT / VERY_SHORT`.

### 6. CROWDING RISK Ω v1.0
Technical: `src/atlas/algorithm/liquidity-crowding-omega.ts`.

Variables:
`ownership concentration + factor consensus + valuation stretch + momentum extension + derivatives positioning + liquidity fragility`.

Crowding is always a **timing/sizing overlay**, never a fundamental falsifier.

### 7. FORCED LIQUIDATION DISLOCATION Ω v1.0
Technical: `src/atlas/algorithm/liquidity-crowding-omega.ts`.

Detects:
`price shock + abnormal volume + correlation spike + leverage unwind evidence + limited fundamental deterioration + buyer absorption + post-liquidation reversal`.

A confirmed technical liquidation is routed to Historical Dislocation/Burry Ω and Principal Ω re-check. It is not automatically bought.

### 8. MACRO OPTIONS LIQUIDITY Ω v1.0
Technical: `src/atlas/algorithm/macro-options-liquidity-omega.ts`.

Combines:
`JPY carry + Japan USD liquidity risk + long-end Treasury yields + VIX compression + dispersion + options expiry + dealer gamma + credit spreads + breadth + cross-asset correlation + crypto liquidity stress`.

States:
`NORMAL / WINDOW_ACTIVE / LIQUIDITY_STRESS / FORCED_UNWIND`.

Hard laws:
- Options expiry is a vulnerability window, not a crash prediction.
- VIX alone is not liquidity stress.
- JPY movement alone is not a carry unwind.
- Systemic escalation requires credit/breadth/correlation confirmation.

### 9. HOME BUILDERS ASYMMETRY Ω v1.0
Technical: `src/atlas/algorithm/homebuilders-buffett-quality-omega.ts`.

Variables:
`orders/backlog + cancellation trend + gross-margin resilience + incentive discipline + land capital efficiency + balance sheet + FCF + structural housing shortage + mortgage-rate convexity + valuation`.

The engine distinguishes a real rate-sensitive asymmetry from a leveraged rate trap.

### 10. BUFFETT QUALITY AUDIT Ω v1.0
Technical: `src/atlas/algorithm/homebuilders-buffett-quality-omega.ts`.

Independent six-gate audit:
`understandable business + durable moat + management/capital allocation + ROIC without excess leverage + FCF consistency + margin of safety`.

No points for AI narrative, momentum or Money Rotation.

### 11. CAPEX CAPTURE ELASTICITY Ω v1.0
Technical: `src/atlas/algorithm/capex-capture-elasticity-omega.ts`.

Measures how much revenue/gross profit/FCF a company captures per unit of growth in its relevant customer funding-pool CAPEX, while checking leakage through its own CAPEX and dilution.

Mandatory principle:
**FCF elasticity outranks revenue elasticity.**

## Existing modules that absorb thread ideas instead of creating duplicate engines

### SpaceX / post-IPO supply shock
No separate SpaceX motor. It belongs to **Future IPO Gate Ω**, especially `F5_LOCKUP_SUPPLY_DISCOVERY`, float/secondary supply and index-inclusion mechanics.

### Retail earnings / Fed minutes / CPI / PMIs event calendar
No separate macro-calendar motor. These are inputs to **Event Pricing Ω + Money Rotation Ω + Macro Options Liquidity Ω**.

### BTC / ETH / XRP video technical levels
No buy engine is created from video levels. Technical levels belong to **Speculative Liquidity Canary Ω / Macro Regime GOLD–BTC Ω / Entry Timing Ω** and must be verified against live data before use.

### CAPEX payer vs CAPEX catcher
Retained under **Global CAPEX Chain Ω + CAPEX Hunters Ω + AI CAPEX Payback Ω + CAPEX Capture Elasticity Ω**.

### Cooling, building materials, transport, bricks
These are explicit Destination of Money Ω categories or subchains. They are not assumed winners. They must earn R3/R4 status through funding + orders/backlog + FCF evidence.

## Destination discovery pipeline

`Capital source → destination pool → funded project/contract → physical bottleneck → orders/backlog → revenue/margin → FCF/ROIC → capture elasticity → crowding → valuation/implied return → funding-pool deduplication → portfolio decision`.

Capital sources are tracked separately:
- public equity/fund flows,
- private equity/strategic buyers,
- hyperscaler/corporate CAPEX,
- sovereign/fiscal CAPEX,
- bank/credit/project finance,
- customer prepayments/vendor finance,
- household/consumer demand.

## Anti-error laws
- PRICE ≠ FUNDAMENTAL EVIDENCE.
- MARKET CAP CHANGE ≠ CAPITAL FLOW.
- RELATIVE STRENGTH ≠ VERIFIED FUND FLOW.
- PRIVATE EQUITY INTEREST ≠ PUBLIC MARKET INFLOW.
- CAPEX ANNOUNCEMENT ≠ REALIZED DEMAND.
- BACKLOG ≠ REVENUE ≠ FCF.
- SCARCITY ≠ PERMANENT MOAT.
- BEST CAPEX CAPTOR ≠ BEST STOCK AT CURRENT PRICE.
- A TECHNICAL LIQUIDATION ≠ FUNDAMENTAL BREAK.
- CROWDING ≠ THESIS FALSIFIER.
- MULTIPLE TICKERS CAN BE ONE FUNDING POOL.
- DIFFERENT SECTORS CAN SHARE THE SAME FUNDING POOL.
- ENGINE CONVERGENCE ≠ AUTOMATIC BUY.

## Testing
`src/atlas/algorithm/capital-destination-suite-omega.test.ts` covers destination proof gates, memory scarcity/crowding separation, software migration/false-disruption convergence, leverage survival, forced-liquidation dislocations, options-expiry windows, homebuilder asymmetry, Buffett audit and CAPEX capture elasticity.

Tests are authored but are not declared passing unless an actual repository test runner is executed successfully.
