# ATLAS Ω — MAX RETURN / LOW VOL PORTFOLIO LAW

Date: 2026-09-06
Status: ACTIVE_CANONICAL / INVIOLABLE
Precedence: this law supersedes any prior ATLAS portfolio rule that grants independent authority to sector balance, geographic balance, style balance, diversification aesthetics, causal-driver coverage or minimum-cardinality diversification.

## Law

ATLAS portfolio construction has one constitutional objective:

**Maximize expected return subject to low modeled volatility, low permanent-loss risk, low tail risk and low fragility.**

Sector, geography, market-cap bucket, style, index resemblance and visual/aesthetic balance have zero independent portfolio-membership authority.

## Consequences

- No sector quotas.
- No geographic quotas.
- No style quotas.
- No requirement to hold a missing sector or causal driver.
- No minimum portfolio size justified by diversification.
- No rejection merely because many winners share one sector or driver.
- No admission of a weaker security merely to make the portfolio look diversified.
- No replacement merely to reduce a sector count.

If the best return/risk set is concentrated, ATLAS must permit concentration.

## Diversification semantics

Diversification is not an objective. It is an instrument.

It may affect a decision only when independent evidence shows that a combination of assets reduces portfolio risk enough to improve whole-portfolio return/risk utility after accounting for any expected-return dilution.

Causal Redundancy Ω and driver coverage remain diagnostic/stress fields with zero standalone scoring authority.

Financing Correlation Ω remains admissible because shared financing can create common fragility; that is a risk mechanism, not an aesthetic diversification rule.

## Enforced implementation

Canonical engine: `src/atlas/algorithm/endogenous-portfolio-engine-v2.ts` version `2026-09-06-v2.1.0`.

Enforcement:
- `alphaDiversification = 0` canonically;
- `rhoCausalRedundancy = 0` canonically;
- non-zero overrides fail closed;
- non-empty `requiredStructuralDrivers` fails closed;
- missing-driver exception removed from endogenous-N selection;
- default cardinality search floor changed from 20 to 1;
- default search ceiling is 50 as a computational bound, not a target;
- risk weights revised to Permanent Loss 40% / Tail Risk 20% / Volatility 40% as a versioned operating policy;
- Replacement Firewall evaluates only whole-portfolio return/risk utility improvement plus hysteresis.

## Anti-beauty rule

**A portfolio is never improved merely by looking more diversified.**

A portfolio with 15 financials and 15 healthcare companies is valid if those securities dominate expected-return/risk utility. A portfolio with one security from every sector is invalid if weaker names were admitted to satisfy sector coverage.

## Separation from prediction

Historical Sharpe, Sortino, Calmar, CAGR, volatility and drawdown are evidence inputs, not guarantees of future return. LONA/quantitative backtests may inform risk-efficiency diagnostics but cannot by themselves bypass ATLAS Hard Gates, Falsifier Veto, forward Expected Return, valuation, financing quality or evidence integrity.
