# MEGACAP RETURN CEILING Ω

Status: ACTIVE CANON
Date: 2026-08-19

## Purpose
Prevent ATLAS from confusing an excellent company, an improved entry price, or a fundamental BUY with a maximum-forward-return opportunity.

## Core separation
ATLAS MUST score these independently:

1. BUSINESS QUALITY Ω — quality, moat, FCF, ROIC/economic proof, durability.
2. ENTRY PRICE Ω — valuation versus history, fundamentals and recent drawdown.
3. EXPECTED RETURN Ω — plausible 3–6Y annualized and cumulative return from today's enterprise/equity value.
4. FORWARD ASYMMETRY Ω — upside distribution versus downside/falsification risk.
5. SIZE / MEGACAP CEILING Ω — mathematical burden imposed by current market capitalization.

A BUY in dimensions 1–2 MUST NOT automatically become a MAX RETURN BUY.

## Megacap gate
Trigger MEGACAP_RETURN_CEILING when market capitalization is already extremely large (default diagnostic threshold: >= $500B; HIGH severity >= $1T).

For triggered companies, ATLAS must explicitly calculate scenario market caps:
- 2x current equity value
- 3x current equity value
- 5x current equity value

These are not price targets. They are feasibility checks.

The engine then asks:
- What revenue, FCF and earnings would support each scenario?
- What terminal multiple is implicitly required?
- Is that scale plausible within 3–6 years?
- Would the resulting market capitalization require an implausibly large share of the relevant profit pool / economy / index?

## Classification
Allowed outputs:

- BUY — MAX RETURN: quality + price + expected return + asymmetry all pass; size does not materially cap upside.
- BUY — COMPOUNDER: attractive business and entry, but current scale lowers plausible multiple-expansion / multibagger potential.
- BUY — DEFENSIVE/QUALITY: attractive preservation/quality characteristics; expected return is secondary.
- HOLD / WATCH / REJECT.

Never label a security MAX RETURN BUY solely because it has fallen substantially from a previous high.

## Drawdown rule
A drawdown is PRICE INFORMATION, not RETURN EVIDENCE.

Example:
Peak $495 -> price $380 = materially improved entry price.
It does NOT prove that $380 offers exceptional 3–6Y expected return.
Expected return must be recomputed from current fundamentals, valuation, growth runway and current market capitalization.

## Canonical calibration case — Broadcom (AVGO), 2026-08-19
Observed user price snapshot: approximately $380 and approximately $1.81T market capitalization.

Fundamental evidence remains exceptional: Broadcom Q2 FY2026 reported $22.187B revenue (+48% YoY), $10.262B FCF (+60% YoY), $10.8B AI semiconductor revenue (+143% YoY), and guided Q3 revenue to approximately $29.4B (+84% YoY) with AI semiconductor revenue expected at approximately $16B (>200% YoY).

ATLAS interpretation:
- BUSINESS QUALITY: PASS / elite.
- ECONOMIC PROOF: PASS.
- AI CAPEX CAPTURE: PASS.
- ENTRY PRICE at ~$380 versus prior ~$495 high: materially improved.
- EXPECTED RETURN: must remain independent.
- MEGACAP RETURN CEILING: HIGH because equity value is already around $1.8T in the supplied snapshot.

Feasibility arithmetic at $1.81T starting market cap:
- 2x = ~$3.62T
- 3x = ~$5.43T
- 5x = ~$9.05T

Therefore AVGO may legitimately be a BUY while NOT being a MAX RETURN BUY.
Canonical classification for this case: BUY — COMPOUNDER / MEGACAP, subject to live valuation and falsifier updates.

## Ranking consequence
When ATLAS is asked for companies with the highest plausible 3–6Y capital multiplication, a megacap can rank below a smaller company even when the megacap has superior Quality Ω.

Quality rank != Expected Return rank.
Price attractiveness != Expected Return rank.
Past drawdown != Forward asymmetry.

## Portfolio consequence
Do not reject megacaps automatically. Their role may be:
- high-confidence compounder,
- portfolio anchor,
- economic-proof benchmark,
- lower-risk participation in a structural theme.

But ATLAS must not let their quality score crowd out smaller companies with stronger evidence-backed Forward Asymmetry Ω when the objective is maximum 3–6Y return.

## Required output fields
For any triggered megacap analysis, display:
- Quality Ω
- Entry Price Ω
- Current market cap
- 2x / 3x / 5x implied market caps
- Expected Return Ω
- Forward Asymmetry Ω
- Megacap Ceiling severity
- Final class: MAX RETURN BUY / COMPOUNDER BUY / QUALITY BUY / HOLD / WATCH / REJECT

## Constitutional rule
PRICE ≠ EVIDENCE.
QUALITY ≠ EXPECTED RETURN.
BUY ≠ MAX RETURN BUY.
