# COMPUTE DISPLACEMENT CAPTURE Ω

**Status:** CANONICAL / ACTIVE / TRANSVERSAL  
**Effective:** 2026-09-05  
**Parent:** `CURRENT_CANON/AI_VALUE_MIGRATION_RECEIVER_GATE_OMEGA.md`  
**Implementation:** `src/atlas/algorithm/compute-displacement-capture-omega.ts`

## Purpose

Measure who captures the profit pool when AI compute fragments from merchant accelerators toward custom XPUs/ASICs. ATLAS must not equate custom-silicon share loss with equivalent economic loss if the displaced vendor captures fabric, networking, CPU, memory architecture, packaging or rack-scale economics.

## Core metric — Compute Displacement Capture Ratio Ω

`CDCR = surrounding economics captured / displaced compute economics`

Surrounding economics include only verified attributable economics from fabric/interconnect, networking, CPU, memory architecture, packaging and rack-scale infrastructure.

Interpretation:
- `CDCR > 1`: NET_VALUE_CAPTURE
- `CDCR = 1`: FULL_RECOVERY
- `0 < CDCR < 1`: PARTIAL_RECOVERY
- `CDCR = 0`: VALUE_LEAKAGE
- insufficient verified economics: UNVERIFIED

## Mandatory companion variables

1. **Fabric Attach Rate Ω** — share of relevant custom accelerators attached to the evaluated fabric/ecosystem.
2. **Open-Fabric Migration Ω** — migration toward open/alternative fabrics such as UALink/UEC where this weakens proprietary toll economics.
3. **Lost-Die Recovery Ω** — fraction of displaced compute economics recovered elsewhere in the stack.

## Evidence law

Partnership announcements, standards membership, warrants, convertible investments, design announcements and stock-price response do not prove economic capture. Shipments, attributable revenue/royalties, margins and ultimately FCF/ROIC evidence are required to advance economic proof.

## Current evidence snapshot — 2026-09-05

NVIDIA + MediaTek: NVIDIA disclosed a $3.5B investment in MediaTek convertible bonds and MediaTek adoption of NVLink Fusion for custom XPUs. This verifies ecosystem strategy/adoption, not shipments, royalties or margin capture. Therefore CDCR remains UNVERIFIED pending attributable economics.

Google + Marvell: Marvell issued Google a warrant dated 2026-08-18 for up to 58,970,907 shares at $206.58. The warrant is associated with commercial arrangements and vesting conditions; ATLAS must not treat the warrant ceiling as a purchase commitment or realized custom-silicon revenue.

## Portfolio use

This module feeds AI Value Migration Ω and relative-value/challenger analysis for NVDA, AVGO, MRVL and other custom-silicon/fabric participants. It cannot bypass Hard Gates, Expected Return, valuation, Chain Budget or portfolio selection. It adds an economic topology dimension: who gets paid when the compute die changes.

## Falsifiers

- UALink/UEC or another fabric materially reduces proprietary attach economics.
- Custom XPU adoption grows while surrounding NVIDIA economics fail to offset displaced accelerator economics.
- Reported fabric/networking growth lacks attributable margin or FCF conversion.
- Customers vertically integrate enough of networking/interconnect/rack architecture to remove the toll layer.
- Evidence shows custom silicon primarily cannibalizes incumbent economics rather than expanding the total profit pool.
