# FACTOR OWNERSHIP LEDGER Ω v0.1

Purpose: prevent score inflation from multiple engines observing the same economic fact.

## Constitutional rule
A factor has exactly one canonical direct-score owner. Other modules may contribute evidence, confidence, provenance, falsifiers, or diagnostics, but may not add a second direct score for the same factor.

## Initial ownership map

| FACTOR | CANONICAL OWNER | OTHER ALLOWED CONTRIBUTORS | DIRECT-SCORE RULE |
|---|---|---|---|
| VALUATION | Valuation / Expectation Gap authority | CAPEX-chain, price forensics | owner only |
| FCF | Fundamental Quality authority | CAPEX-chain, FTC, labor-productivity research | owner only |
| ROIC / incremental returns on capital | Fundamental Quality authority | CAPEX-chain | owner only |
| BALANCE_SHEET / LEVERAGE | Fundamental Quality authority | Macro/Credit research | owner only |
| MARGINS / CONVERSION | Fundamental Quality authority | CAPEX-chain | owner only |
| BACKLOG_QUALITY | Capital Transmission authority | Fundamental evidence | owner only |
| CAPEX_BOTTLENECK / BOTTLENECK_CAPTURE | Capital Transmission authority | Bottleneck half-life research | owner only |
| CAPITAL_FLOW_STAGE | Capital Transmission authority | Follow the Capital research | owner only |
| EARNINGS_REVISIONS / CONSENSUS_CHANGE | Expectation Gap authority | Fundamental evidence | owner only |
| MOMENTUM / PRICE_TAPE | Technical/Price authority | price-move forensics | owner only |
| MACRO_RISK | Macro Transmission authority | political/regulatory/debt regional research | owner only |
| CREDIT_RISK | Macro/Credit authority | Fundamental balance-sheet evidence | owner only |
| CUSTOMER_CONCENTRATION | Fundamental Quality authority | customer-migration research | owner only |
| CUSTOMER_MIGRATION / SHARE_CAPTURE | Customer Migration research until validated | Fundamental/commercial evidence | DIRECT_SCORE_WEIGHT=0 until promotion |
| TECHNOLOGY_STAGE | Technology Stage research until validated | economic archaeology / physical-AI research | DIRECT_SCORE_WEIGHT=0 until promotion |

## Evidence aggregation
Multiple independent observations of one factor may increase `CONFIDENCE` or reduce uncertainty. They must not be transformed into multiple additive score contributions unless a preregistered model proves the variables are distinct, non-overlapping predictive features and assigns explicit ownership.

## Ambiguity firewall
If a new module cannot state which existing factor it measures, it remains SHADOW. If it measures an existing factor, it is an evidence producer by default. If it claims a new factor, promotion requires definition, PIT availability, non-overlap test, OOS incremental-value test and an Authority Registry update.

## Required promotion record
- factor definition
- canonical owner
- PIT timestamp semantics
- overlap/correlation diagnostics
- incremental OOS result
- score transformation
- weight and cap
- falsifiers
- rollback condition
- authority-registry evidence
