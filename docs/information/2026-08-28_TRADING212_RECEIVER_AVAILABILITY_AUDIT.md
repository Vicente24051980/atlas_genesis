# TRADING 212 AVAILABILITY AUDIT — AI VALUE MIGRATION RECEIVERS — 2026-08-28

**Status:** VERIFIED WEB AUDIT / OPERATIONAL AVAILABILITY ONLY  
**Purpose:** satisfy the Trading 212 availability gate for newly discovered AI value-receiver candidates. Availability does not imply BUY or portfolio admission.

## Newly discovered candidates verified on Trading 212 Invest

| Ticker | Company | Trading 212 Invest listing | Operational availability |
|---|---|---|---|
| TRI | Thomson Reuters | `TRI.US` / NASDAQ | VERIFIED |
| PLTR | Palantir Technologies | `PLTR.US` / NASDAQ | VERIFIED |
| SNOW | Snowflake | `SNOW.US` / NYSE | VERIFIED |
| SAP | SAP | `SAP.US` / NYSE ADR | VERIFIED |
| ORCL | Oracle | `ORCL.US` / NYSE | VERIFIED |

## Source pages

- https://www.trading212.com/es/trading-instruments/invest/TRI.US
- https://www.trading212.com/es/trading-instruments/invest/PLTR.US
- https://www.trading212.com/es/trading-instruments/invest/SNOW.US
- https://www.trading212.com/es/trading-instruments/invest/SAP.US
- https://www.trading212.com/es/trading-instruments/invest/ORCL.US

## Governance

`TRADING212_AVAILABLE != PORTFOLIO_PASS`

Every name must still pass:

`Economic Proof -> Valuation -> Risk -> Competition for Capital -> Factor Duplication -> Entry Timing -> Decision Safety Gate`.

For the current lower-volatility mandate, availability does not alter the initial preference ordering: TRI is the strongest newly discovered lower-volatility receiver; PLTR/SNOW are higher-volatility discovery candidates; SAP is a balanced system-of-record candidate; ORCL is capex/funding-risk constrained.
