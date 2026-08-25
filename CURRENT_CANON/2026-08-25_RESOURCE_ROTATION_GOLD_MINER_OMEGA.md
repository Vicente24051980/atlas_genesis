# ATLAS Ω — Resource Rotation & Gold Miner Economics Canon

Date: 2026-08-25
Status: CANONICAL / executable runtime added

## Purpose
Prevent ATLAS from treating all mining equities as one factor and from converting commodity strength into an automatic equity or portfolio signal.

## Canonical laws

- MINING != SINGLE FACTOR
- GOLD BULLION != GOLD MINERS
- GOLD EQUITIES != COPPER EQUITIES
- COMMODITY STRENGTH != EQUITY MONETIZATION
- GREEN PULSE != GREEN CONTINUITY
- 100%-BASIS PRODUCTION != ATTRIBUTABLE ECONOMICS
- EXPLORATION RESULT != RESERVE
- CURRENT FCF != NORMALIZED FCF
- BUYBACK != NET SHARE COUNT REDUCTION
- BUSINESS QUALITY != EXPECTED RETURN != ENTRY TIMING

## C1 resource decomposition
C1 must be decomposed at minimum into:

1. Gold
2. Copper
3. Diversified mining
4. Uranium
5. Rare earths

A winning Gold branch cannot by itself label all of C1 as GANANDO. C1 requires broad confirmation across branches. A branch may show positive commodity confirmation while its equities remain DETERIORANDO or PERDIENDO.

## Market-state engine
Each branch is evaluated independently with:

- median 1D return = Pulse
- median 5D and 1M return = continuity context
- 5D relative strength versus the relevant benchmark
- positive breadth
- persistence days
- commodity confirmation as corroboration only

A commodity price cannot promote an equity branch to GANANDO without equity breadth + RS + persistence.

## Gold miner owner-economics gate
A gold producer must be evaluated with attributable economics, not headline 100%-basis production.

Required inputs include:

- gold price
- AISC
- 100%-basis production
- attributable ownership
- normalized vs current FCF yield
- leverage
- jurisdiction
- execution
- reserve quality
- exploration quality
- ramp-up evidence
- dilution overhang
- gross buyback yield
- 1D / 5D / 1M market validation and RS

Outputs separate:

- Fundamental Score
- Expected Return Score
- Market Validation Score
- Entry Timing Score
- attributable production
- spot margin
- FCF normalization gap
- dilution/buyback warning
- challenger status

The runtime never authorizes a portfolio action by itself. Competition for Capital, valuation, replacement hurdle and portfolio finalizer remain downstream mandatory gates.

## B2Gold audit application
B2Gold (BTO.TO / BTG) is treated as a Gold Mining challenger, not bullion and not a generic C1 proxy.

Current audit interpretation:

- Economic Proof: strong
- Gold leverage: strong
- Goose / Back River optionality: strong
- Goose execution: not fully de-risked
- Fekola / Mali: jurisdiction discount required
- Current FCF: below normalized forward potential
- Convertible dilution: must be netted against buybacks in per-share economics
- Market Validation: strong
- Entry Timing: weaker after a large 1M move

Therefore B2Gold can qualify as a challenger without becoming an automatic BUY or a reason to relabel all Mining as GANANDO.

## Layer-flow consequence
ATLAS AI Layer Flow Confirmation Ω must explicitly state branch divergence inside C1 when present. Example:

Gold Mining = GANANDO / MEJORANDO
Copper Equities = DETERIORANDO
=> C1 = DIVERGENT / not broadly GANANDO

This prevents gold strength from being misread as copper/electrification flow or as upstream AI CAPEX transmission.

## Runtime
Implemented in:

- `runtime/agentic_omega/resource_rotation.py`
- `runtime/agentic_omega/test_resource_rotation.py`
- exports in `runtime/agentic_omega/__init__.py`

