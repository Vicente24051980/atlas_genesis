# ATLAS Ω MOBILE TERMINAL UI

Status: ACTIVE CANON
Version: v2.1
Date: 2026-08-22

## Objective

ATLAS Ω Mobile is a dense professional investment terminal. The Portfolio First cockpit is the visual source of truth for every workspace. Consumer-style rounded blue cards are deprecated.

OpenTerminalUI remains the UX reference for terminal-shell behavior: persistent navigation, GO/command search, compact information density and responsive mobile/desktop framing. The implementation is original React Native code governed by ATLAS evidence and execution rules.

## One terminal language — inviolable

Every route must use the same terminal system:

- background `#050708` family;
- square/near-square 1px evidence panels;
- muted steel text and ATLAS green accents;
- monospace codes/statuses;
- persistent ATLAS header, GO Bar, global index tape, function navigation and bottom navigation;
- no isolated legacy consumer-finance visual system.

AUDIT and Security Hub MUST share the same `TickerAuditTerminal` surface so their data contract and engine rendering cannot diverge.

## Portfolio-first rule

The first useful surface is the Trading 212 portfolio when read access is available.

Trading 212 credentials remain server-side. Only the encrypted ATLAS broker-control session may reside on device. The portfolio and dedicated PORT workspace are read surfaces. Missing broker/session data renders `BROKER GATE` or `LOCAL SESSION GATE`; it is never fabricated.

The user's Trading 212 API credential is intended to be read-only at source. Mobile code must not treat broker availability as execution authority.

## Session Continuity Ω

`CURRENT_CANON/SESSION_CONTINUITY_OMEGA.md` is mandatory terminal behavior. On startup the Cockpit must expose `RESUME LAST SESSION` and restore the latest certified workspace manifest: portfolio/watchlist references, incomplete audits, complete engine ledgers, evidence/provenance references, contradictions, falsifiers, Decision Log, catalysts/tasks and workspace state.

Resume never means silently refreshing or fabricating evidence. `MEMORY != EVIDENCE`, `SESSION STATE != CURRENT MARKET DATA`, and `RESUME != RECOMPUTE`. Stale/missing/corrupt components render explicit gates and any current investment decision must revalidate required evidence.

## Global index tape

The world-index tape remains persistent terminal chrome. Primary contract: FinancialData.Net `index-quotes`, proxied through `/v1/mobile/indices`. Missing quotes remain `MISSING`; ETFs/futures are not silently substituted.

## Canonical workspaces

HOME / Cockpit · MKT / Markets · PORT / Portfolio · AUD / Auditar · WL / Watchlist · RES / Resultados · OPP / Opportunities · Ω / ATLAS · SCR / Screener · RSR / Research · CAL / Catalysts · NEWS / News · ORD / Orders · RSK / Risk · SEC / Security Hub · T212 / Broker Ω · SYS / System.

All workspaces inherit the same terminal shell and visual grammar.

## AUD / full audit contract

AUD is ticker-first and displays a complete engine ledger, not a provider-coverage checklist.

Mandatory display order:

1. Evidence/Data Integrity and ticker identity are prerequisites.
2. `GREEN Continuity Ω` is the first analytical engine.
3. `GREEN Pulse / Breadth / Relative Green Ω` follows.
4. Every other registered applicable ATLAS engine remains visible.
5. Contradictions Ω is explicit.
6. Falsifiers Ω remains independently visible and veto-capable.
7. Evidence Director Ω is explicit.
8. Investment Committee Ω alone emits the final recommendation.

A registered engine may return `PASS`, `STRONG`, `MIXED`, `WATCH`, `FAIL`, `NO_SIGNAL`, `NOT_APPLICABLE`, `INSUFFICIENT_DATA`, `QUARANTINE` or `PARTIAL`. An engine must never disappear merely because evidence is unavailable.

The audit UI must render the engine name, state, optional real score, detail, evidence and provenance when supplied.

## GREEN FIRST without opportunity blindness

GREEN is first because continuity matters; it is not an automatic reject gate.

- 5/5: maximum continuity.
- 4/5: strong continuity.
- 3/5: valid opportunity state when the rest of the audit is strong.
- 0–2/5: weak continuity, but the full audit still runs.

GREEN provider verification follows the canonical multi-provider quorum. A missing quorum renders `QUARANTINE`; the UI must never invent 0/5 or 5/5.

## Final recommendation

The decision banner supports `BUY`, `HOLD`, `WATCH`, `REJECT`, `NO_OPPORTUNITY`, `PENDING`.

The action/execution line is separate from the recommendation. No specialist engine, screener, provider rating or price move can directly emit the final recommendation. Only Investment Committee Ω can. When critical evidence is unresolved, canonical behavior is `PENDING` + `NO BUY · DATA GATE`.

## Falsifiers Ω

Falsifiers Ω preserves independent veto. Absence of detected negative evidence is not equivalent to `0 falsifiers`; if the adversarial sweep has not run, the state is `INSUFFICIENT_DATA`.

## Result Journal

Saved audit snapshots preserve ticker/timestamp, provider/provenance, company identity/observed metrics, Investment Committee recommendation/action/execution/confidence, complete engine snapshot, contradictions and note/reason. Historical snapshots are immutable observations; later prices or audits do not rewrite them.

## Data rendering rule

Professional-looking UI must never be populated with fabricated values. Missing or uncertified inputs render explicit states such as `DATA GATE`, `BROKER GATE`, `ENGINE GATE`, `INSUFFICIENT_DATA`, `QUARANTINE` or `NOT_APPLICABLE`.

Firecrawl is an acquisition/interaction layer, never an independent evidence source. TradingView/Yahoo/Barchart/Investing remain distinct underlying providers even if Firecrawl transports the observations.

## Security rule

Provider secrets remain server-side and must not be embedded in the APK. CI scans the built Android bundle for direct Trading 212 endpoints, FinancialData.Net direct endpoints and Firecrawl key-like strings. Trading 212 execution is fail-closed. Read access and investment recommendation are separate from broker execution authority.

## Implementation v2.1

The terminal contract includes shared `TickerAuditTerminal`, full registered-engine ledger with GREEN first, contradictions/provenance, Investment Committee decision banner, result journal, terminal-style PORT/SYS, backend audit contract, fail-safe gates, Android smoke/security checks, plus Session Continuity Ω with a versioned workspace manifest and `RESUME LAST SESSION` Cockpit state.

Release rule: implementation is not considered certified until it passes CI on the feature PR and independently passes the full mobile CI again after merge to `main`.
