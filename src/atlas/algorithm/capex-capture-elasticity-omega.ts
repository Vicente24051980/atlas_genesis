export type CapexCaptureElasticityInput = {
  ticker: string;
  evidenceTraceable: boolean;
  evidenceIds: readonly string[];
  customerFundingPoolCapexGrowthPct: number;
  companyRevenueGrowthPct: number;
  companyGrossProfitGrowthPct: number;
  companyFcfGrowthPct: number;
  ownCapexGrowthPct: number;
  dilutionGrowthPct: number;
};

const round2 = (x: number): number => Math.round(x * 100) / 100;
const safeRatio = (num: number, den: number): number | null => Math.abs(den) < 1 ? null : round2(num / den);

export function evaluateCapexCaptureElasticity(input: CapexCaptureElasticityInput) {
  const nums = [input.customerFundingPoolCapexGrowthPct, input.companyRevenueGrowthPct, input.companyGrossProfitGrowthPct, input.companyFcfGrowthPct, input.ownCapexGrowthPct, input.dilutionGrowthPct];
  if (nums.some((x) => !Number.isFinite(x))) throw new Error('capex_capture_elasticity_requires_finite_values');

  const revenueElasticity = safeRatio(input.companyRevenueGrowthPct, input.customerFundingPoolCapexGrowthPct);
  const grossProfitElasticity = safeRatio(input.companyGrossProfitGrowthPct, input.customerFundingPoolCapexGrowthPct);
  const fcfElasticity = safeRatio(input.companyFcfGrowthPct, input.customerFundingPoolCapexGrowthPct);
  const ownCapexBurden = round2(input.ownCapexGrowthPct - input.companyRevenueGrowthPct);
  const perShareLeakage = round2(Math.max(0, input.dilutionGrowthPct));

  const evidenceGate = input.evidenceTraceable && input.evidenceIds.length >= 3 ? 'CONFIRMED' : input.evidenceTraceable && input.evidenceIds.length ? 'PROVISIONAL' : 'BLOCKED';
  let state: 'ELASTIC_CAPTOR' | 'GOOD_CAPTOR' | 'CAPITAL_INTENSIVE_CAPTOR' | 'NEGATIVE_CAPTURE' | 'EVIDENCE_PENDING';
  if (evidenceGate === 'BLOCKED') state = 'EVIDENCE_PENDING';
  else if ((fcfElasticity ?? -99) >= 1.0 && ownCapexBurden <= 0 && perShareLeakage <= 2) state = 'ELASTIC_CAPTOR';
  else if ((grossProfitElasticity ?? -99) >= 0.6 && ownCapexBurden <= 20) state = 'GOOD_CAPTOR';
  else if (input.companyRevenueGrowthPct > 0 && input.ownCapexGrowthPct > input.companyRevenueGrowthPct + 20) state = 'CAPITAL_INTENSIVE_CAPTOR';
  else state = 'NEGATIVE_CAPTURE';

  return {
    ticker: input.ticker,
    evidenceGate,
    revenueElasticity,
    grossProfitElasticity,
    fcfElasticity,
    ownCapexBurden,
    perShareLeakage,
    state,
    interpretation: 'Higher elasticity is preferred only when margin/FCF and per-share economics confirm it; correlation with customer CAPEX is not causation.',
    falsifiers: ['customer_capex_proxy_is_not_economically_linked_to_company_revenue', 'fcf_growth_is_working_capital_or_one_off_driven', 'own_capex_or_dilution_rises_faster_than_capture', 'funding_pool_capex_decelerates', 'gross_profit_elasticity_turns_negative'],
  } as const;
}

export const CAPEX_CAPTURE_ELASTICITY_OMEGA = {
  id: 'CAPEX_CAPTURE_ELASTICITY_OMEGA_V1',
  name: 'CAPEX Capture Elasticity Ω v1.0',
  role: 'measure_incremental_company_economic_capture_per_unit_of_customer_funding_pool_capex',
  rules: ['USE_FUNDING_POOL_NOT_SINGLE_CUSTOMER_WHEN_POSSIBLE', 'FCF_ELASTICITY_OUTRANKS_REVENUE_ELASTICITY', 'OWN_CAPEX_AND_DILUTION_ARE_MANDATORY_LEAKAGE_CHECKS', 'NO_CAUSAL_CLAIM_WITHOUT_EVIDENCE_TRACE'],
} as const;
