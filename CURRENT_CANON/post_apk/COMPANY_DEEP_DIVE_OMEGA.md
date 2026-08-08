# Company Deep Dive Ω — Post-APK Specification

Status: Formalized / Post-APK / Non-blocking
Core impact: NONE

This capability is intentionally deferred until the first Android APK is functional. It must not block CORE-00 runtime completion, SQLite initialization, minimal mobile CRUD, typecheck, or EAS APK build.

## Six integrated views

1. Business & Competitive Position — Business Quality Ω
   - Moat
   - Capital Allocation
   - ROIC
   - structural competitive advantages

2. Financial Statements & FCF
   - FCF quality
   - net-income-to-cash conversion
   - leverage and debt calendar
   - operating margins

3. Valuation — Valuation Ω
   - intrinsic value
   - discounted cash-flow model
   - historical multiples
   - margin of safety

4. Industry & Competitive Dynamics
   - TAM
   - sector trends
   - barriers to entry
   - positioning versus peers

5. Risk Scenarios & Falsifiers — Thesis Falsifier Gate
   - explicit thesis-invalidating events
   - margin degradation
   - share loss
   - regulatory change
   - bear/base/bull scenarios where applicable

6. Technical Structure & Momentum — Tactical Context Only
   - support/resistance
   - trend structure
   - relative momentum
   - possible breakout/breakdown areas

## Constitutional decoupling rule

Price action, support/resistance, momentum, or relative strength MUST NEVER modify Business Quality Ω or independently confirm/falsify the fundamental thesis. View 6 is tactical context only and may affect review/entry priority, not intrinsic business quality.

## Epistemic ingestion governance

`Primary Data -> CORE-00 -> Validated Evidence -> Analysis / AI`

AI != Evidence. AI may process and interpret evidence already admitted by the Core, but it cannot promote an unsupported assertion to verified fact by itself.

## Mobile target

Future destination: company-detail flow in the Android app (Company Screen / Deep Dive section). No UI implementation is authorized before the first functional APK milestone unless separately reprioritized.