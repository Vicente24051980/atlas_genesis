export type FinancingQualityState =
  | 'ELITE_SELF_FUNDED'
  | 'RESILIENT'
  | 'FRAGILE'
  | 'HARD_FAIL'
  | 'EVIDENCE_PENDING';

export type CapexFinancingQualityInput = {
  ticker: string;
  evidenceTraceable: boolean;
  evidenceIds: readonly string[];

  // Funding mix must sum to 1.0 (±1%).
  internalFundingShare: number;
  debtFundingShare: number;
  equityFundingShare: number;

  // Incremental economics for the CAPEX program.
  incrementalCapex: number;
  incrementalFcf: number;
  marginalCostOfCapitalPct: number;
  projectIrrPct?: number;

  // Balance-sheet resilience.
  netDebtToEbitda: number;
  interestCoverage: number;

  // Duration / contractual quality.
  debtMaturityYears: number;
  assetLifeYears: number;
  counterpartyQualityScore: number;
  timeToCashYears: number;

  // Required ATLAS stress. Defaults: +100 bp long rate, +75 bp credit spread.
  longRateShockBp?: number;
  creditSpreadShockBp?: number;
};

export type CapexFinancingQualityResult = {
  ticker: string;
  evidenceGate: 'CONFIRMED' | 'PROVISIONAL' | 'BLOCKED';
  financingBurdenRatio: number;
  stressedCostOfCapitalPct: number;
  stressedFinancingBurdenRatio: number;
  fundingSourceScore: number;
  durationMatchScore: number;
  leverageScore: number;
  coverageScore: number;
  timeToCashScore: number;
  stressResilienceScore: number;
  financingQualityScore: number;
  hardGatePass: boolean;
  state: FinancingQualityState;
  reasons: string[];
  falsifiers: string[];
};

const clamp = (x: number): number => Math.max(0, Math.min(100, x));
const round1 = (x: number): number => Math.round(x * 10) / 10;
const round3 = (x: number): number => Math.round(x * 1000) / 1000;

function requireFiniteNonNegative(name: string, x: number): void {
  if (!Number.isFinite(x) || x < 0) throw new Error(`${name}_must_be_finite_and_non_negative`);
}

function requireShare(name: string, x: number): void {
  if (!Number.isFinite(x) || x < 0 || x > 1) throw new Error(`${name}_must_be_between_0_and_1`);
}

function requireScore(name: string, x: number): void {
  if (!Number.isFinite(x) || x < 0 || x > 100) throw new Error(`${name}_must_be_between_0_and_100`);
}

function inverseLinear(value: number, best: number, worst: number): number {
  if (value <= best) return 100;
  if (value >= worst) return 0;
  return round1(100 * (worst - value) / (worst - best));
}

function linear(value: number, worst: number, best: number): number {
  if (value <= worst) return 0;
  if (value >= best) return 100;
  return round1(100 * (value - worst) / (best - worst));
}

export function evaluateCapexFinancingQuality(input: CapexFinancingQualityInput): CapexFinancingQualityResult {
  requireShare('internal_funding_share', input.internalFundingShare);
  requireShare('debt_funding_share', input.debtFundingShare);
  requireShare('equity_funding_share', input.equityFundingShare);
  const fundingSum = input.internalFundingShare + input.debtFundingShare + input.equityFundingShare;
  if (Math.abs(fundingSum - 1) > 0.01) throw new Error('funding_mix_must_sum_to_one');

  [
    ['incremental_capex', input.incrementalCapex],
    ['incremental_fcf', input.incrementalFcf],
    ['marginal_cost_of_capital_pct', input.marginalCostOfCapitalPct],
    ['net_debt_to_ebitda', input.netDebtToEbitda],
    ['interest_coverage', input.interestCoverage],
    ['debt_maturity_years', input.debtMaturityYears],
    ['asset_life_years', input.assetLifeYears],
    ['time_to_cash_years', input.timeToCashYears],
  ].forEach(([name, value]) => requireFiniteNonNegative(name as string, value as number));
  requireScore('counterparty_quality_score', input.counterpartyQualityScore);
  if (input.projectIrrPct != null) requireFiniteNonNegative('project_irr_pct', input.projectIrrPct);
  if (input.incrementalCapex <= 0) throw new Error('incremental_capex_must_be_positive');
  if (input.assetLifeYears <= 0) throw new Error('asset_life_years_must_be_positive');

  const longRateShockBp = input.longRateShockBp ?? 100;
  const creditSpreadShockBp = input.creditSpreadShockBp ?? 75;
  requireFiniteNonNegative('long_rate_shock_bp', longRateShockBp);
  requireFiniteNonNegative('credit_spread_shock_bp', creditSpreadShockBp);

  // Funding source: own FCF is best; debt is acceptable but rate-sensitive;
  // equity is most dilutive. This is deliberately independent of market cap.
  const fundingSourceScore = round1(
    input.internalFundingShare * 100 + input.debtFundingShare * 55 + input.equityFundingShare * 30,
  );

  // Debt maturity covering >=60% of asset life gets full credit. <=10% is zero.
  const maturityRatio = input.debtMaturityYears / input.assetLifeYears;
  const durationMatchScore = linear(maturityRatio, 0.10, 0.60);

  // Conservative balance-sheet mappings. Negative leverage is represented by 0 input.
  const leverageScore = inverseLinear(input.netDebtToEbitda, 1.0, 5.0);
  const coverageScore = linear(input.interestCoverage, 1.5, 8.0);
  const timeToCashScore = inverseLinear(input.timeToCashYears, 1.0, 7.0);

  const baseCost = input.marginalCostOfCapitalPct / 100;
  const stressedCostOfCapitalPct = round1(
    input.marginalCostOfCapitalPct + (longRateShockBp + creditSpreadShockBp) / 100,
  );
  const stressedCost = stressedCostOfCapitalPct / 100;
  const fcfDenominator = Math.max(input.incrementalFcf, input.incrementalCapex * 0.01);

  const financingBurdenRatio = round3((input.incrementalCapex * baseCost) / fcfDenominator);
  const stressedFinancingBurdenRatio = round3((input.incrementalCapex * stressedCost) / fcfDenominator);

  // <=15% of incremental FCF consumed by annualized capital cost is excellent;
  // >=75% is economically fragile.
  const stressResilienceScore = inverseLinear(stressedFinancingBurdenRatio, 0.15, 0.75);

  const financingQualityScore = round1(clamp(
    fundingSourceScore * 0.22 +
      durationMatchScore * 0.13 +
      leverageScore * 0.18 +
      coverageScore * 0.17 +
      input.counterpartyQualityScore * 0.12 +
      timeToCashScore * 0.08 +
      stressResilienceScore * 0.10,
  ));

  const evidenceGate: CapexFinancingQualityResult['evidenceGate'] =
    input.evidenceTraceable && input.evidenceIds.length >= 3
      ? 'CONFIRMED'
      : input.evidenceTraceable && input.evidenceIds.length > 0
        ? 'PROVISIONAL'
        : 'BLOCKED';

  const irrFailsStress = input.projectIrrPct != null && input.projectIrrPct <= stressedCostOfCapitalPct;
  const hardGatePass =
    evidenceGate === 'CONFIRMED' &&
    input.interestCoverage >= 1.5 &&
    input.netDebtToEbitda <= 5 &&
    stressedFinancingBurdenRatio < 0.75 &&
    !irrFailsStress;

  const reasons: string[] = [];
  const falsifiers = [
    'long_end_yields_or_credit_spreads_rise_beyond_stress_case',
    'project_irr_falls_to_or_below_stressed_cost_of_capital',
    'interest_coverage_falls_below_1_5x',
    'net_debt_to_ebitda_exceeds_5x',
    'refinancing_maturity_arrives_before_asset_cash_generation',
    'counterparty_credit_quality_deteriorates_or_contract_is_cancelled',
    'time_to_cash_slips_materially',
    'equity_dilution_becomes_primary_funding_source',
  ];

  let state: FinancingQualityState;
  if (evidenceGate !== 'CONFIRMED') {
    state = 'EVIDENCE_PENDING';
    reasons.push('Financing-quality ranking requires at least three traceable evidence records.');
  } else if (!hardGatePass) {
    state = 'HARD_FAIL';
    reasons.push('CAPEX program fails at least one mandatory financing-survivability condition.');
  } else if (financingQualityScore >= 85 && input.internalFundingShare >= 0.60) {
    state = 'ELITE_SELF_FUNDED';
    reasons.push('CAPEX is predominantly self-funded with strong balance-sheet and long-rate resilience.');
  } else if (financingQualityScore >= 70) {
    state = 'RESILIENT';
    reasons.push('CAPEX financing remains resilient under the mandatory long-rate and credit-spread shock.');
  } else {
    state = 'FRAGILE';
    reasons.push('Hard Gate passes, but financing quality leaves limited margin for execution or rates to worsen.');
  }

  if (irrFailsStress) reasons.push('Project IRR does not clear the stressed marginal cost of capital.');
  if (input.debtFundingShare >= 0.60) reasons.push('Debt funds at least 60% of incremental CAPEX; refinancing sensitivity is material.');
  if (input.timeToCashYears >= 5) reasons.push('Long time-to-cash increases exposure to rate, permitting and execution shocks.');
  if (input.counterpartyQualityScore >= 85) reasons.push('High-quality counterparties materially support financing durability.');

  return {
    ticker: input.ticker,
    evidenceGate,
    financingBurdenRatio,
    stressedCostOfCapitalPct,
    stressedFinancingBurdenRatio,
    fundingSourceScore,
    durationMatchScore,
    leverageScore,
    coverageScore,
    timeToCashScore,
    stressResilienceScore,
    financingQualityScore,
    hardGatePass,
    state,
    reasons,
    falsifiers,
  };
}

export const CAPEX_FINANCING_QUALITY_OMEGA = {
  id: 'CAPEX_FINANCING_QUALITY_OMEGA_V1',
  name: 'CAPEX Financing Quality Ω v1.0',
  effectiveDate: '2026-09-05',
  authority: 'HARD_OVERLAY',
  mandatoryStress: {
    longRateShockBp: 100,
    creditSpreadShockBp: 75,
  },
  formulas: {
    financingBurden: '(INCREMENTAL_CAPEX × MARGINAL_COST_OF_CAPITAL) / INCREMENTAL_FCF',
    financingQuality: '22% FUNDING_SOURCE + 13% DURATION_MATCH + 18% LEVERAGE + 17% COVERAGE + 12% COUNTERPARTY + 8% TIME_TO_CASH + 10% STRESS_RESILIENCE',
  },
  constitutionalRules: [
    'AI_DEMAND_DOES_NOT_OVERRIDE_FINANCING_SURVIVABILITY',
    'LONG_RATE_AND_CREDIT_SPREAD_STRESS_IS_MANDATORY',
    'PROJECT_IRR_MUST_CLEAR_STRESSED_COST_OF_CAPITAL_WHEN_IRR_IS_AVAILABLE',
    'BACKLOG_IS_NOT_REVENUE_FCF_OR_SHAREHOLDER_RETURN',
    'CAPEX_FUNDED_BY_OTHERS_IS_STRUCTURALLY_PREFERRED_CETERIS_PARIBUS',
    'MARKET_CAP_IS_NOT_AN_INPUT',
    'MISSING_EVIDENCE_CANNOT_CREATE_A_POSITIVE_SCORE',
  ],
} as const;
