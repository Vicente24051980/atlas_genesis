export type HomebuilderState = 'HIGH_ASYMMETRY' | 'QUALITY_VALUE' | 'WATCH' | 'RATE_TRAP' | 'EVIDENCE_PENDING';
export type BuffettQualityState = 'BUFFETT_ELITE' | 'BUFFETT_PASS' | 'BUFFETT_WATCH' | 'NO_PASS' | 'EVIDENCE_PENDING';

const clamp = (x: number): number => Math.max(0, Math.min(100, x));
const round1 = (x: number): number => Math.round(x * 10) / 10;
const validate = (scores: readonly number[], err: string): void => { if (scores.some((x) => !Number.isFinite(x) || x < 0 || x > 100)) throw new Error(err); };

export type HomebuilderInput = {
  ticker: string;
  evidenceTraceable: boolean;
  ordersBacklogScore: number;
  cancellationTrendScore: number;
  grossMarginResilienceScore: number;
  incentiveDisciplineScore: number;
  landCapitalEfficiencyScore: number;
  balanceSheetScore: number;
  fcfScore: number;
  structuralHousingShortageScore: number;
  mortgageRateConvexityScore: number;
  valuationScore: number;
};

export function evaluateHomebuilderAsymmetry(input: HomebuilderInput) {
  const scores = [input.ordersBacklogScore, input.cancellationTrendScore, input.grossMarginResilienceScore, input.incentiveDisciplineScore, input.landCapitalEfficiencyScore, input.balanceSheetScore, input.fcfScore, input.structuralHousingShortageScore, input.mortgageRateConvexityScore, input.valuationScore];
  validate(scores, 'homebuilder_scores_must_be_between_0_and_100');
  const score = round1(
    input.ordersBacklogScore * 0.12 + input.cancellationTrendScore * 0.08 + input.grossMarginResilienceScore * 0.10 + input.incentiveDisciplineScore * 0.08 + input.landCapitalEfficiencyScore * 0.12 + input.balanceSheetScore * 0.12 + input.fcfScore * 0.12 + input.structuralHousingShortageScore * 0.08 + input.mortgageRateConvexityScore * 0.08 + input.valuationScore * 0.10,
  );
  let state: HomebuilderState;
  if (!input.evidenceTraceable) state = 'EVIDENCE_PENDING';
  else if (score >= 80 && input.balanceSheetScore >= 70) state = 'HIGH_ASYMMETRY';
  else if (score >= 68) state = 'QUALITY_VALUE';
  else if (input.mortgageRateConvexityScore >= 75 && input.balanceSheetScore < 50) state = 'RATE_TRAP';
  else state = 'WATCH';
  return { ticker: input.ticker, score, state, action: state === 'HIGH_ASYMMETRY' ? 'ADVANCE_GCC_OR_PRINCIPAL' : state === 'QUALITY_VALUE' ? 'ADVANCE_RESEARCH' : 'WATCH', falsifiers: ['orders_and_backlog_break', 'incentives_rise_faster_than_volume', 'gross_margin_compresses_structurally', 'land_inventory_or_debt_grows_faster_than_sales', 'mortgage_rates_remain_high_without_affordability_offset'] } as const;
}

export type BuffettQualityInput = {
  ticker: string;
  evidenceTraceable: boolean;
  understandableBusinessScore: number;
  durableMoatScore: number;
  managementCapitalAllocationScore: number;
  roicWithoutExcessLeverageScore: number;
  fcfConsistencyScore: number;
  marginOfSafetyScore: number;
};

export function evaluateBuffettQuality(input: BuffettQualityInput) {
  const scores = [input.understandableBusinessScore, input.durableMoatScore, input.managementCapitalAllocationScore, input.roicWithoutExcessLeverageScore, input.fcfConsistencyScore, input.marginOfSafetyScore];
  validate(scores, 'buffett_quality_scores_must_be_between_0_and_100');
  const qualityScore = round1(
    input.understandableBusinessScore * 0.12 +
      input.durableMoatScore * 0.22 +
      input.managementCapitalAllocationScore * 0.16 +
      input.roicWithoutExcessLeverageScore * 0.20 +
      input.fcfConsistencyScore * 0.18 +
      input.marginOfSafetyScore * 0.12,
  );
  let state: BuffettQualityState;
  if (!input.evidenceTraceable) state = 'EVIDENCE_PENDING';
  else if (qualityScore >= 88 && input.marginOfSafetyScore >= 60) state = 'BUFFETT_ELITE';
  else if (qualityScore >= 75) state = 'BUFFETT_PASS';
  else if (qualityScore >= 60) state = 'BUFFETT_WATCH';
  else state = 'NO_PASS';
  return { ticker: input.ticker, qualityScore, state, action: state === 'BUFFETT_ELITE' || state === 'BUFFETT_PASS' ? 'ADVANCE_RESEARCH' : 'NO_AUTOMATIC_BUY', rules: ['NO_POINTS_FOR_AI_NARRATIVE', 'NO_POINTS_FOR_MOMENTUM', 'NO_POINTS_FOR_MONEY_ROTATION', 'PRICE_AND_QUALITY_REMAIN_SEPARATE_UNTIL_MARGIN_OF_SAFETY_GATE'] } as const;
}

export const HOME_BUILDERS_ASYMMETRY_OMEGA = { id: 'HOME_BUILDERS_ASYMMETRY_OMEGA_V1', name: 'Home Builders Asymmetry Ω v1.0' } as const;
export const BUFFETT_QUALITY_AUDIT_OMEGA = { id: 'BUFFETT_QUALITY_AUDIT_OMEGA_V1', name: 'Buffett Quality Audit Ω v1.0' } as const;
