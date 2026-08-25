# ATLAS Ω — AI Infrastructure Control & Credit Quality Ω

Date: 2026-08-25
Status: CANONICAL / FAIL-CLOSED

## Purpose

Extend AI Circular Financing Gate Ω and AI Infrastructure Credit Fragility Ω without duplicating them. Track the migration from cloud GPU rental to full-facility leases and self-controlled infrastructure, while separating physical deployment from organic demand quality and owner economics.

## Canonical chain

Cloud rental -> full-facility lease -> self-controlled infrastructure -> financing -> operating capacity -> utilization -> external revenue -> debt service -> FCF -> ROIC.

No earlier stage may be promoted automatically into a later stage.

## Required dimensions

- contracted capacity GW
- operating capacity GW
- utilization
- organic revenue coverage
- debt-service coverage
- vendor guarantees / project commitments
- supplier exclusivity
- governance/execution warning

## Canonical laws

1. EXECUTIVE DEPARTURE != CAPEX CANCELLATION.
2. ANNOUNCED GW != OPERATING GW != CONTRACTED REVENUE.
3. FINANCING CAPACITY != ORGANIC END DEMAND.
4. VENDOR GUARANTEE != CUSTOMER ECONOMIC PROOF.
5. GPU COLLATERAL != PERMANENT COLLATERAL VALUE.
6. COMPUTE ASSET VALUE != DEBT SERVICE CAPACITY.
7. SELF-CONTROLLED INFRASTRUCTURE != OWNER ECONOMICS.
8. PHYSICAL DEMAND UP may coexist with DEMAND QUALITY DOWN.

## Portfolio governance

This gate never emits BUY by itself. A GREEN/GREEN_STRONG physical deployment result still requires Economic Proof, valuation, Competition for Capital, falsifiers and portfolio finalization. A RED credit-fragility result cannot be neutralized by announced capacity or supplier exclusivity.

## Current interpretation template

For large AI infrastructure programs, ATLAS may simultaneously classify:

- Physical Demand: GREEN_STRONG
- Supplier Economic Capture: GREEN/GREEN_STRONG
- Organic Demand Quality: AMBER
- Credit Fragility: AMBER/RED
- Governance/Execution: independent warning flag

This is not a contradiction; it is the required decomposition.

## Runtime

- `runtime/agentic_omega/infrastructure_control.py`
- `runtime/agentic_omega/test_infrastructure_control.py`
- exported from `runtime/agentic_omega/__init__.py`
