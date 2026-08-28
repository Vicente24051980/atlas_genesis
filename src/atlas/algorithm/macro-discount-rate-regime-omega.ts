export type DiscountRateRegime =
  | 'DR0_BENIGN'
  | 'DR1_NEUTRAL'
  | 'DR2_NEUTRAL_DEFENSIVE'
  | 'DR3_DURATION_COMPRESSION'
  | 'DR4_SYSTEMIC_RISK_OFF';

export type LongEndState = 'CALM' | 'ELEVATED' | 'STRESS' | 'PANIC';

export type MacroDiscountRateInput = {
  asOf: string;
  evidenceIds: readonly string[];
  ust2yScore: number;
  ust10yScore: number;
  ust30yScore: number;
  inflationPersistence: number;
  dxyPressure: number;
  creditStress: number;
  liquidityStress: number;
  breadthDeterioration: number;
  earningsRevisionDeterioration: number;
  energyPassThrough: number;
  japanRepatriationEvidence: number;
  aiEconomicProof: number;
  aiEquityMonetizationStress: number;
  persistentRegularCloses: number;
};

export type MacroDiscountRateResult = {
  regime: DiscountRateRegime;
  longEndState: LongEndState;
  policyRepricing: number;
  systemicStress: number;
  portfolioAction: 'NO_SELL_NO_CHASE' | 'REOPTIMIZE_REVIEW' | 'DEFENSIVE_REVIEW';
  reasons: readonly string[];
};

const clamp = (n: number) => Math.max(0, Math.min(100, n));
const avg = (...xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

export function assessMacroDiscountRateRegime(input: MacroDiscountRateInput): MacroDiscountRateResult {
  const reasons: string[] = [];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.asOf) || input.evidenceIds.length < 2) {
    return {
      regime: 'DR1_NEUTRAL',
      longEndState: 'ELEVATED',
      policyRepricing: 0,
      systemicStress: 0,
      portfolioAction: 'NO_SELL_NO_CHASE',
      reasons: ['insufficient_verified_evidence'],
    };
  }

  const policyRepricing = clamp(avg(input.ust2yScore, input.inflationPersistence, input.dxyPressure));
  const longEndScore = clamp(avg(input.ust10yScore, input.ust30yScore));
  const systemicStress = clamp(avg(
    longEndScore,
    input.creditStress,
    input.liquidityStress,
    input.breadthDeterioration,
    input.earningsRevisionDeterioration,
  ));

  let longEndState: LongEndState = 'CALM';
  if (longEndScore >= 80 && input.liquidityStress >= 70 && input.creditStress >= 70) longEndState = 'PANIC';
  else if (longEndScore >= 70) longEndState = 'STRESS';
  else if (longEndScore >= 50) longEndState = 'ELEVATED';

  const persistenceSatisfied = input.persistentRegularCloses >= 3;
  const multiChannelStress = [
    input.inflationPersistence,
    input.breadthDeterioration,
    input.creditStress,
    input.liquidityStress,
    input.earningsRevisionDeterioration,
  ].filter((x) => x >= 65).length >= 3;

  let regime: DiscountRateRegime = 'DR1_NEUTRAL';
  let portfolioAction: MacroDiscountRateResult['portfolioAction'] = 'NO_SELL_NO_CHASE';

  if (longEndState === 'PANIC' && multiChannelStress && persistenceSatisfied) {
    regime = 'DR4_SYSTEMIC_RISK_OFF';
    portfolioAction = 'DEFENSIVE_REVIEW';
    reasons.push('long_end_panic_with_credit_liquidity_confirmation');
  } else if (persistenceSatisfied && multiChannelStress && longEndScore >= 60) {
    regime = 'DR3_DURATION_COMPRESSION';
    portfolioAction = 'REOPTIMIZE_REVIEW';
    reasons.push('persistent_multichannel_duration_compression');
  } else if (policyRepricing >= 60 || input.inflationPersistence >= 65 || input.aiEquityMonetizationStress >= 60) {
    regime = 'DR2_NEUTRAL_DEFENSIVE';
    reasons.push('policy_repricing_or_sticky_inflation_requires_higher_entry_hurdle');
  }

  if (input.aiEconomicProof >= 70 && input.aiEquityMonetizationStress >= 60) {
    reasons.push('ai_economic_proof_intact_but_equity_monetization_under_pressure');
  }
  if (input.energyPassThrough >= 65) reasons.push('refined_product_pass_through_risk_elevated');
  if (input.japanRepatriationEvidence >= 60) reasons.push('japan_repatriation_watch_not_current_flow_proof');
  if (!persistenceSatisfied && regime === 'DR2_NEUTRAL_DEFENSIVE') reasons.push('one_or_two_sessions_cannot_escalate_to_duration_compression');

  return { regime, longEndState, policyRepricing, systemicStress, portfolioAction, reasons };
}

export const MACRO_DISCOUNT_RATE_GUARDRAILS = [
  'Higher yields are not an automatic sell signal.',
  'A front-end policy-rate shock is distinct from long-end panic.',
  'Treasury liquidity-support buybacks are not QE.',
  'Past TIC reductions do not prove current Japanese Treasury selling.',
  'AI Economic Proof can remain intact while Equity Monetization deteriorates.',
  'DR2 raises entry hurdles; DR3 triggers re-optimization review; neither implies automatic liquidation.',
] as const;
