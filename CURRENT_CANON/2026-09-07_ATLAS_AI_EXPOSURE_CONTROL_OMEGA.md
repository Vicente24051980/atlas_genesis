# ATLAS Ω — AI EXPOSURE CONTROL Ω

**Status:** `ACTIVE_CANONICAL_CONTROL`  
**Effective:** `2026-09-07`  
**Authority layer:** `E4 DECISION Ω / E5 CONTROL Ω`  
**Selection authority:** none; subordinate to `docs/canon/ATLAS_OMEGA_MASTER_PROMPT_CANONICAL.md`

## 1. Canonical policy

`AI_CORE_BASE_CEILING = 30%`

ATLAS uses **30% of portfolio weight as the default operational ceiling for AI_CORE exposure**.

This is a portfolio sizing / correlated-risk control. It is **not**:

- an AI quota;
- an anti-AI quota;
- a sector-diversification target;
- a direct ranking penalty;
- a reason to exclude a superior Point Zero candidate;
- an automatic SELL trigger.

`AI_CORE_BASE_CEILING ≠ SELECTION_QUOTA`

## 2. AI_CORE definition

A position enters `AI_CORE` only when verified evidence supports that **more than 50% of revenue, gross-profit generation, or the economically dominant investment thesis is directly dependent on AI compute / AI infrastructure demand**.

When the classification cannot be verified, mark it `AI_CLASSIFICATION_UNKNOWN`; do not invent a percentage.

Broader AI sensitivity — data-center construction, grid/power, diversified semiconductors, connectors, industrial equipment, hyperscalers or other mixed-demand businesses — remains reported separately as `AI_TIER2_SENSITIVITY` unless it meets the AI_CORE test.

`AI_TIER2_SENSITIVITY` does not automatically consume the 30% AI_CORE budget, but its correlated downside must still be modeled in portfolio utility and hidden-concentration analysis.

## 3. Conditional override above 30%

ATLAS may exceed 30% only under explicit status:

`AI_MOMENTUM_OVERRIDE = ACTIVE`

The override is permitted when all of the following are satisfied:

1. **Momentum / Tape-RS:** persistent positive relative strength and trend evidence; not a single-session move.
2. **Fundamentals:** no material deterioration in revenue quality, FCF/share, margins, balance sheet or competitive position.
3. **Revisions / Economic Proof:** earnings or cash-flow revisions and underlying demand evidence remain supportive.
4. **Valuation / Expected Return:** the incremental AI exposure still passes valuation and 3–6Y Expected Return competition for capital.
5. **Expectation Gap:** the opportunity is not rejected merely because price momentum is strong, but expectations saturation and implied growth must be measured explicitly.
6. **Correlated-risk stress:** portfolio-level AI / semiconductor / data-center downside remains acceptable under bull/base/bear and hidden-factor concentration analysis.
7. **Human approval:** any deliberate sizing action that takes AI_CORE above 30% requires explicit human authorization.

Momentum is therefore a **necessary activation signal for the exception, never sufficient evidence by itself**.

## 4. Behaviour around the threshold

- `AI_CORE <= 30%`: normal portfolio competition and sizing rules apply.
- `AI_CORE > 30%` with all override conditions satisfied: allowed and must be reported as `AI_OVER_30_JUSTIFIED`.
- `AI_CORE > 30%` because market appreciation caused passive drift: trigger `AI_OVER_30_REVIEW`; do not auto-sell.
- `AI_CORE > 30%` without a valid override: no new AI_CORE buying until E4/E5 review; existing holdings are not automatically liquidated.
- If momentum or fundamentals deteriorate while above 30%: trigger `AI_OVERRIDE_DEACTIVATION_REVIEW`; rebalance only if portfolio utility / risk evidence supports it.

There is **no arbitrary higher fixed cap** introduced by this policy. Any exposure above 30% must be justified continuously by the override evidence and portfolio-level risk utility.

## 5. Required output

Every canonical portfolio output must report:

- `AI_CORE_WEIGHT`
- `AI_CORE_MEMBERS`
- `AI_TIER2_SENSITIVITY`
- `AI_BASE_CEILING = 30%`
- `AI_MOMENTUM_OVERRIDE = ACTIVE | INACTIVE | UNKNOWN`
- `AI_OVERRIDE_EVIDENCE`
- `AI_CORRELATED_RISK`
- `AI_REBALANCE_STATUS`

## 6. Point Zero compatibility

During clean reconstruction, companies are ranked without an automatic penalty for belonging to AI_CORE. The 30% control is applied at portfolio construction / sizing and correlated-risk evaluation, after economic evidence and Competition for Capital have been assessed.

If the best opportunities genuinely cluster in AI, ATLAS may select them. The portfolio may exceed 30% only through the conditional override above.

`CONCENTRATION_MEASUREMENT + CONDITIONAL_CONTROL ≠ AESTHETIC_DIVERSIFICATION`

## 7. Supersession

This policy supersedes all prior **14%, 20%, 25% or other fixed AI hard-cap language** wherever those values were used as binding current portfolio policy.

Historical documents retain provenance but have no authority to reinstate an older cap.
