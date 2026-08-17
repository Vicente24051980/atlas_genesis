export type MacroLiquidityState = 'NORMAL' | 'WINDOW_ACTIVE' | 'LIQUIDITY_STRESS' | 'FORCED_UNWIND' | 'EVIDENCE_PENDING';

export type MacroOptionsLiquidityInput = {
  evidenceTraceable: boolean;
  usdJpyStressScore: number;
  japanTreasuryLiquidityRiskScore: number;
  longEndYieldStressScore: number;
  carryTradeUnwindScore: number;
  vixCompressionScore: number;
  dispersionStressScore: number;
  optionsExpiryWindowScore: number;
  dealerGammaFragilityScore: number;
  creditSpreadStressScore: number;
  breadthDeteriorationScore: number;
  crossAssetCorrelationSpikeScore: number;
  cryptoLiquidityStressScore: number;
};

const clamp = (x: number): number => Math.max(0, Math.min(100, x));
const round1 = (x: number): number => Math.round(x * 10) / 10;

export function evaluateMacroOptionsLiquidity(input: MacroOptionsLiquidityInput) {
  const scores = Object.entries(input).filter(([k]) => k.endsWith('Score')).map(([, v]) => v as number);
  if (scores.some((x) => !Number.isFinite(x) || x < 0 || x > 100)) throw new Error('macro_options_liquidity_scores_must_be_between_0_and_100');

  const structuralStressScore = round1(
    clamp(input.usdJpyStressScore) * 0.09 +
    clamp(input.japanTreasuryLiquidityRiskScore) * 0.06 +
    clamp(input.longEndYieldStressScore) * 0.11 +
    clamp(input.carryTradeUnwindScore) * 0.12 +
    clamp(input.vixCompressionScore) * 0.06 +
    clamp(input.dispersionStressScore) * 0.08 +
    clamp(input.optionsExpiryWindowScore) * 0.08 +
    clamp(input.dealerGammaFragilityScore) * 0.10 +
    clamp(input.creditSpreadStressScore) * 0.11 +
    clamp(input.breadthDeteriorationScore) * 0.08 +
    clamp(input.crossAssetCorrelationSpikeScore) * 0.07 +
    clamp(input.cryptoLiquidityStressScore) * 0.04,
  );

  let state: MacroLiquidityState;
  if (!input.evidenceTraceable) state = 'EVIDENCE_PENDING';
  else if (structuralStressScore >= 78 && input.carryTradeUnwindScore >= 70 && input.crossAssetCorrelationSpikeScore >= 65) state = 'FORCED_UNWIND';
  else if (structuralStressScore >= 62 && input.creditSpreadStressScore >= 55 && input.breadthDeteriorationScore >= 55) state = 'LIQUIDITY_STRESS';
  else if (input.optionsExpiryWindowScore >= 65 || input.carryTradeUnwindScore >= 55 || input.longEndYieldStressScore >= 65) state = 'WINDOW_ACTIVE';
  else state = 'NORMAL';

  return {
    structuralStressScore,
    state,
    action: state === 'FORCED_UNWIND' ? 'RAISE_CASH_DISCIPLINE_AND_FORCED_LIQUIDATION_SCAN' : state === 'LIQUIDITY_STRESS' ? 'TIGHTEN_ENTRY_AND_LEVERAGE_GATES' : state === 'WINDOW_ACTIVE' ? 'MONITOR_POST_EVENT_CONFIRMATION' : state === 'EVIDENCE_PENDING' ? 'VERIFY_DATA' : 'NORMAL',
    triggers: [
      ...(input.carryTradeUnwindScore >= 60 ? ['JPY carry unwind risk elevated'] : []),
      ...(input.longEndYieldStressScore >= 65 ? ['Long-end yields threaten duration and financing'] : []),
      ...(input.optionsExpiryWindowScore >= 65 ? ['Options expiry can release or change dealer hedging pressure'] : []),
      ...(input.creditSpreadStressScore >= 60 ? ['Credit is confirming liquidity stress'] : []),
      ...(input.crossAssetCorrelationSpikeScore >= 65 ? ['Cross-asset correlation suggests indiscriminate de-risking'] : []),
    ],
    falsifiers: [
      'yen_stabilizes_without_forced_deleveraging',
      'credit_spreads_remain_contained',
      'breadth_recovers_after_expiry_window',
      'long_end_yields_normalize_without_funding_stress',
      'vix_rise_is_not_confirmed_by_realized_volatility_or_cross_asset_correlation',
    ],
    laws: [
      'OPTIONS_EXPIRY_IS_A_WINDOW_NOT_A_CRASH_PREDICTION',
      'VIX_LEVEL_ALONE_IS_NOT_LIQUIDITY_STRESS',
      'JPY_MOVE_ALONE_IS_NOT_A_CARRY_UNWIND',
      'REQUIRE_CREDIT_BREADTH_OR_CORRELATION_CONFIRMATION_FOR_SYSTEMIC_ESCALATION',
    ],
  } as const;
}

export const MACRO_OPTIONS_LIQUIDITY_OMEGA = {
  id: 'MACRO_OPTIONS_LIQUIDITY_OMEGA_V1',
  name: 'Macro Options Liquidity Ω v1.0',
  components: ['JPY_CARRY', 'LONG_END_YIELDS', 'VIX_DISPERSION', 'OPTIONS_EXPIRY', 'DEALER_GAMMA', 'CREDIT', 'BREADTH', 'CROSS_ASSET_CORRELATION', 'CRYPTO_LIQUIDITY'],
} as const;
