# RFC — INSTITUTIONAL CAPITAL ROTATION Ω v1.0

**Status:** CANONICAL  
**Date:** 2026-08-15  
**Engine ID:** `INSTITUTIONAL_CAPITAL_ROTATION_OMEGA_V1_0`  
**Scope:** sectors, subsectors, factors, regions and ticker beneficiaries  
**Relationship:** sibling/complementary engine to `MONEY_ROTATION_OMEGA`; neither may overwrite the other.

## 1. Mission

Detect where institutional capital is genuinely migrating before the move becomes consensus. The engine must distinguish actual capital-flow evidence from price, market-cap change, narrative and ordinary momentum.

The engine searches for the sequence:

`macro/catalyst → macro assets → ETF/sector → breadth → persistent volume → leaders → revisions/fundamentals → fund/positioning confirmation`.

It also searches for the inverse sequence when capital is leaving.

## 2. Non-negotiable laws

1. `MARKET_CAP_CHANGE ≠ CAPITAL_FLOW`.
2. Price and volume are sensors, not proof of institutional flow.
3. `CONFIRMED_RECEIVER` requires real fund/ETF flow evidence or an independent institutional-positioning signal.
4. No single data source may independently generate a portfolio order.
5. Conflicting evidence caps state until reconciled.
6. Sector/subsector/region is evaluated before beneficiary ticker selection.
7. The engine never overwrites Principal Ω, Money Rotation Ω, Good Companies Cheap Ω, Historical Dislocation Ω or specialized engines.
8. Outputs are research states and handoffs; final portfolio action remains behind Decision Safety Gate Ω.

## 3. Institutional Flow Score Ω

Score range: **0–100**.

- Real ETF/fund flows or comparable capital-flow evidence: **25%**
- Breadth: **15%**
- Relative strength 1D/5D/20D: **15%**
- Persistent abnormal volume: **15%**
- Accumulation/distribution of leaders: **10%**
- Options/positioning: **5%**
- EPS revisions / new fundamentals: **10%**
- Macro-regime compatibility: **5%**

All component values must be finite and within 0–100.

## 4. States

- **0–39:** `NO_FLOW`
- **40–54:** `NEUTRAL`
- **55–64:** `EARLY_ROTATION`
- **65–74:** `INSTITUTIONAL_ACCUMULATION_PROBABLE`
- **75–84:** `CONFIRMED_RECEIVER`
- **85–100:** `STRONG_CAPITAL_ROTATION`

### Evidence caps

A numerical score cannot by itself establish the final state.

- No traceable evidence: state cannot exceed `NEUTRAL`.
- Unreconciled conflicts: state cannot exceed `EARLY_ROTATION`.
- No real-flow or independent-positioning evidence: state cannot exceed `INSTITUTIONAL_ACCUMULATION_PROBABLE`.
- `STRONG_CAPITAL_ROTATION` additionally requires at least four independent confirmation dimensions.

## 5. Capital Flow Divergence Ω

Early-warning condition:

- price = flat/down,
- breadth = improving,
- flows/positioning = improving.

This is a research escalation, not a BUY.

Purpose: detect accumulation before obvious price breakout.

## 6. Distribution Warning Ω

Condition:

- price = still rising,
- breadth = deteriorating,
- flows/positioning = deteriorating.

Result: `AVOID_CHASING` / distribution investigation.

Purpose: identify a sector or factor whose headline index is still strong while underlying sponsorship is weakening.

## 7. Daily operating protocol

For each sector/subsector/factor/region:

1. Normalize evidence to a common as-of cut.
2. Validate that any flow number is actually a flow metric.
3. Score the eight dimensions.
4. Apply evidence caps.
5. Detect Capital Flow Divergence Ω and Distribution Warning Ω.
6. Compare with prior day/3D/weekly state.
7. Record score delta and state transition.
8. Identify 3–5 liquid ticker beneficiaries only after the group signal exists.
9. Hand off tickers to Principal Ω / Money Rotation Ω / specialized engine as appropriate.
10. Never emit automatic portfolio BUY/SELL.

## 8. Temporal confirmation

- **Daily:** early warning and state update.
- **3-session persistence:** early confirmation of rotation continuity.
- **Weekly:** validate against published ETF/fund-flow and positioning data.
- **Monthly:** regime persistence and earnings-revision trend.
- **Quarterly:** 13F/ownership is retrospective confirmation only, never the sole anticipatory source.

## 9. Lead/Lag measurement

Every state transition must preserve:

- detection date,
- first independent flow confirmation date,
- first price breakout/relative-strength confirmation date,
- weekly validation date,
- latency in days.

This allows ATLAS to determine whether the engine anticipates rotation or merely follows it.

## 10. Interface / Engine Contract Ω

The implementation is deterministic, pure and idempotent. Core public functions:

- `calculateInstitutionalFlowScore`
- `classifyInstitutionalFlowState`
- `detectCapitalFlowDivergence`
- `detectDistributionWarning`
- `assessInstitutionalRotation`

Canonical implementation:

- `src/atlas/institutional-rotation/engine.ts`
- `src/atlas/algorithm/institutional-capital-rotation-omega.ts`
- tests: `src/atlas/institutional-rotation/engine.test.ts`

## 11. Integration with Money Rotation Ω

`MONEY_ROTATION_OMEGA` answers: **what lifecycle/dislocation phase is this asset or theme in?**

`INSTITUTIONAL_CAPITAL_ROTATION_OMEGA` answers: **is independently evidenced institutional capital actually migrating into or out of this sector/subsector/factor/region now?**

A theme may be attractive in one engine and unconfirmed in the other. Outputs are never merged by overwriting. They coexist in the Decision Log Ω.

## 12. Persistence law

Every daily report generated by the institutional-rotation routine must be saved to both GitHub and Notion. GitHub + Notion is the completion condition.
