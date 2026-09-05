# ATLAS Ω — CAPEX Financing Quality Ω v1.0

Effective date: 2026-09-05
Status: ACTIVE / CANONICAL
Authority: HARD OVERLAY

## Mission

Add financing survivability to capital-intensive AI and infrastructure analysis. Strong demand, backlog or strategic relevance cannot by themselves compensate for weak project economics, excessive leverage or poor refinancing durability.

## Core formula

Financing Burden = (Incremental CAPEX × Marginal Cost of Capital) / Incremental FCF

Financing Quality = 22% Funding Source + 13% Duration Match + 18% Leverage + 17% Interest Coverage + 12% Counterparty Quality + 8% Time-to-Cash + 10% Stress Resilience

## Mandatory stress

Default LONG-RATE SHOCK Ω:
- long rate +100 bp
- credit spread +75 bp

When project IRR is available, it must remain above stressed marginal cost of capital.

## Mandatory checks

- funding source: internal FCF vs debt vs equity
- debt maturity relative to asset life
- net debt / EBITDA
- interest coverage
- counterparty quality
- time-to-cash
- stressed financing burden

Confirmed candidates do not pass the overlay when interest coverage is below 1.5x, net debt / EBITDA is above 5.0x, stressed financing burden reaches 75% of incremental FCF, or project IRR does not clear stressed capital cost when IRR is available.

## Evidence law

At least three traceable evidence records are required for confirmed status. Management narrative alone cannot create a confirmed positive signal.

## Backlog law

Backlog is not equivalent to revenue, FCF or shareholder return. Audit duration, customer concentration, cancellation rights, funding dependency, permitting, power availability, construction delay and conversion to per-share economics.

## Size-Blind law

Market capitalization, current portfolio weight, invested euros, P/L, cost basis and current holding status are not inputs.

## Canonical order

T0 Size-Blind → Hard Gates → CAPEX Asymmetry / P0 Adjusted → CAPEX Financing Quality Hard Overlay → Expected Return / Portfolio Selection → Sizing → Timing

A high CAPEX Asymmetry score cannot override a failed financing overlay.

## Implementation

Engine: `src/atlas/algorithm/capex-financing-quality-omega.ts`
Tests: `src/atlas/algorithm/capex-financing-quality-omega.test.ts`

Direct-to-main implementation authorized by explicit user instruction on 2026-09-05.
