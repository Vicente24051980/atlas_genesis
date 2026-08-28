# MCR-2026-08-28-BIOHEALTH-RELATIVE-ALPHA

**Status:** ACCEPTED / CANONICAL  
**Effective:** 2026-08-28  
**Scope:** ATLAS Ω v4.0 BioHealth selection and portfolio competition

## Problem

A strong sector rally can make weak or average stocks look like winners. In BioHealth, broad Healthcare, small/mid biotech, large biotech, pharma, medical devices and life-science tools can diverge materially. Comparing every healthcare ticker with the S&P 500 or XLV can therefore create false alpha.

## Decision

Activate `BIOHEALTH RELATIVE ALPHA OMEGA` as a mandatory transverse engine for healthcare candidates.

Canonical module:

`CURRENT_CANON/BIOHEALTH_RELATIVE_ALPHA_OMEGA.md`

Technical implementation:

`src/atlas/algorithm/biohealth-relative-alpha-omega.ts`

## Mandatory changes

1. Every BioHealth ticker receives a correct benchmark before relative-performance scoring.
2. Excess return is evaluated on multiple horizons: 1M, 3M, 6M, YTD and 1Y when data are verified.
3. YTD alone cannot close a decision.
4. Sector beta, M&A activity and index membership cannot substitute for Economic Proof.
5. Clinical-stage names must pass binary-risk, cash-runway and dilution gates.
6. China is modeled both as a licensing source and a competitive threat.
7. Hidden economic concentration between portfolio holdings must be identified.
8. A final BioHealth Composite Ω is forbidden while Expected Return remains unverified.
9. The final competition is against the marginal holding of the full portfolio, not merely against healthcare peers.
10. Extreme subindustry dispersion activates a contrarian radar for high-quality laggards with intact fundamentals and improving Expected Return.

## Core formula

`ALPHA_OMEGA(h) = RETURN_TICKER(h) - RETURN_CORRECT_BENCHMARK(h)`

`BRAS = 20% Relative Alpha + 25% Economic/Clinical Proof + 15% Revisions + 20% Expected Return + 10% Balance Sheet + 10% Portfolio Fit`, with explicit penalties for clinical binary risk, China competition, hidden economic overlap and expectation risk.

## Governance

The module has no autonomous BUY/SELL authority and cannot override Evidence Integrity, Falsifier Veto, Valuation, Expected Return, Portfolio Integrity, concentration limits, Competition for Capital or Decision Safety Gate.

Portfolio changes require a separate audited capital-allocation decision.
