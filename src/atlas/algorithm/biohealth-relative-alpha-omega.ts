export type BioHealthBusinessType =
  | 'SMALL_MID_BIOTECH'
  | 'LARGE_COMMERCIAL_BIOTECH'
  | 'PHARMA'
  | 'MEDICAL_DEVICES'
  | 'LIFE_SCIENCE_TOOLS_DIAGNOSTICS'
  | 'BROAD_HEALTHCARE'
  | 'ROYALTY_DELIVERY_PLATFORM'
  | 'OTHER';

export type BioHealthBenchmark = 'XBI' | 'IBB' | 'XPH' | 'IHI' | 'XLV' | 'CUSTOM_VERIFIED';

export type RelativeAlphaState =
  | 'RA0_UNVERIFIED'
  | 'RA1_LAGGING'
  | 'RA2_BETA_ONLY'
  | 'RA3_EMERGING_ALPHA'
  | 'RA4_CONFIRMED_ALPHA'
  | 'RA5_ALPHA_WITH_EXPECTATION_RISK';

export type BioHealthCapitalState =
  | 'KEEP'
  | 'CHALLENGER'
  | 'DISPLACEMENT_CANDIDATE'
  | 'DEEP_DIVE'
  | 'WATCH'
  | 'REJECT_UNVERIFIED';

export type HorizonReturn = {
  tickerPct: number | null;
  benchmarkPct: number | null;
};

export type BioHealthRelativeAlphaInput = {
  ticker: string;
  asOf: string;
  businessType: BioHealthBusinessType;
  benchmark: BioHealthBenchmark;
  benchmarkReason?: string;
  evidenceIds: readonly string[];

  returns: {
    m1: HorizonReturn;
    m3: HorizonReturn;
    m6: HorizonReturn;
    ytd: HorizonReturn;
    y1: HorizonReturn;
  };

  economicProof: number;
  revisions: number;
  expectedReturn: number | null;
  balanceSheet: number;
  portfolioFit: number;
  expectationRisk: number;

  clinicalBinaryRisk: number;
  chinaCompetitionRisk: number;
  hiddenEconomicOverlap: number;
};

export type BioHealthRelativeAlphaResult = {
  ticker: string;
  benchmark: BioHealthBenchmark;
  excessReturns: Record<'m1' | 'm3' | 'm6' | 'ytd' | 'y1', number | null>;
  relativeAlphaScore: number;
  relativeAlphaState: RelativeAlphaState;
  bras: number | null;
  finalCompositeAllowed: boolean;
  capitalState: BioHealthCapitalState;
  reasons: readonly string[];
};

const round = (n: number): number => Math.round(n * 100) / 100;
const clamp = (n: number): number => Math.max(0, Math.min(100, n));

export function defaultBioHealthBenchmark(type: BioHealthBusinessType): BioHealthBenchmark {
  switch (type) {
    case 'SMALL_MID_BIOTECH': return 'XBI';
    case 'LARGE_COMMERCIAL_BIOTECH': return 'IBB';
    case 'PHARMA': return 'XPH';
    case 'MEDICAL_DEVICES': return 'IHI';
    case 'LIFE_SCIENCE_TOOLS_DIAGNOSTICS': return 'XLV';
    case 'BROAD_HEALTHCARE': return 'XLV';
    case 'ROYALTY_DELIVERY_PLATFORM': return 'XBI';
    default: return 'CUSTOM_VERIFIED';
  }
}

function excess(h: HorizonReturn): number | null {
  if (h.tickerPct === null || h.benchmarkPct === null) return null;
  if (!Number.isFinite(h.tickerPct) || !Number.isFinite(h.benchmarkPct)) return null;
  return round(h.tickerPct - h.benchmarkPct);
}

function scoreExcessReturn(value: number): number {
  // Maps -25pp to 0, 0pp to 50 and +25pp to 100, capped.
  return clamp(50 + value * 2);
}

export function validateBioHealthInput(input: BioHealthRelativeAlphaInput): readonly string[] {
  const violations: string[] = [];
  if (!input.ticker.trim()) violations.push('missing_ticker');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.asOf)) violations.push('invalid_as_of');
  if (input.evidenceIds.length < 2) violations.push('requires_at_least_two_traceable_evidence_ids');

  const scores: Array<[string, number]> = [
    ['economicProof', input.economicProof],
    ['revisions', input.revisions],
    ['balanceSheet', input.balanceSheet],
    ['portfolioFit', input.portfolioFit],
    ['expectationRisk', input.expectationRisk],
    ['clinicalBinaryRisk', input.clinicalBinaryRisk],
    ['chinaCompetitionRisk', input.chinaCompetitionRisk],
    ['hiddenEconomicOverlap', input.hiddenEconomicOverlap],
  ];

  for (const [name, value] of scores) {
    if (!Number.isFinite(value) || value < 0 || value > 100) violations.push(`score_out_of_range:${name}`);
  }

  if (input.expectedReturn !== null && (!Number.isFinite(input.expectedReturn) || input.expectedReturn < 0 || input.expectedReturn > 100)) {
    violations.push('score_out_of_range:expectedReturn');
  }

  const expectedDefault = defaultBioHealthBenchmark(input.businessType);
  if (input.benchmark !== expectedDefault && input.benchmark !== 'CUSTOM_VERIFIED' && !input.benchmarkReason?.trim()) {
    violations.push('non_default_benchmark_requires_reason');
  }

  return violations;
}

export function computeExcessReturns(input: BioHealthRelativeAlphaInput): BioHealthRelativeAlphaResult['excessReturns'] {
  return {
    m1: excess(input.returns.m1),
    m3: excess(input.returns.m3),
    m6: excess(input.returns.m6),
    ytd: excess(input.returns.ytd),
    y1: excess(input.returns.y1),
  };
}

export function scoreRelativeAlpha(input: BioHealthRelativeAlphaInput): number {
  const ex = computeExcessReturns(input);
  const weighted: Array<[number | null, number]> = [
    [ex.m1, 0.10],
    [ex.m3, 0.20],
    [ex.m6, 0.25],
    [ex.ytd, 0.25],
    [ex.y1, 0.20],
  ];

  const available = weighted.filter(([v]) => v !== null) as Array<[number, number]>;
  if (available.length < 3) return 0;

  const weightSum = available.reduce((sum, [, w]) => sum + w, 0);
  return round(available.reduce((sum, [v, w]) => sum + scoreExcessReturn(v) * (w / weightSum), 0));
}

export function classifyRelativeAlpha(input: BioHealthRelativeAlphaInput): RelativeAlphaState {
  const violations = validateBioHealthInput(input);
  const ex = computeExcessReturns(input);
  const available = Object.values(ex).filter((v): v is number => v !== null);
  if (violations.length > 0 || available.length < 3) return 'RA0_UNVERIFIED';

  const score = scoreRelativeAlpha(input);
  const positiveCount = available.filter((v) => v > 0).length;

  if (score >= 70 && positiveCount >= 3 && input.economicProof >= 70 && input.expectationRisk >= 70) {
    return 'RA5_ALPHA_WITH_EXPECTATION_RISK';
  }
  if (score >= 70 && positiveCount >= 3 && input.economicProof >= 70) return 'RA4_CONFIRMED_ALPHA';
  if (score >= 58 && positiveCount >= 3 && input.economicProof >= 60) return 'RA3_EMERGING_ALPHA';
  if (score >= 45) return 'RA2_BETA_ONLY';
  return 'RA1_LAGGING';
}

export function assessBioHealthRelativeAlpha(input: BioHealthRelativeAlphaInput): BioHealthRelativeAlphaResult {
  const violations = validateBioHealthInput(input);
  const excessReturns = computeExcessReturns(input);
  const relativeAlphaScore = violations.length === 0 ? scoreRelativeAlpha(input) : 0;
  const relativeAlphaState = classifyRelativeAlpha(input);
  const expectedReturnVerified = input.expectedReturn !== null;
  const finalCompositeAllowed = violations.length === 0 && expectedReturnVerified;

  const riskPenalty = clamp(
    input.clinicalBinaryRisk * 0.35 +
    input.chinaCompetitionRisk * 0.20 +
    input.hiddenEconomicOverlap * 0.25 +
    input.expectationRisk * 0.20,
  );

  const bras = finalCompositeAllowed
    ? round(clamp(
        relativeAlphaScore * 0.20 +
        input.economicProof * 0.25 +
        input.revisions * 0.15 +
        (input.expectedReturn as number) * 0.20 +
        input.balanceSheet * 0.10 +
        input.portfolioFit * 0.10 -
        riskPenalty * 0.15,
      ))
    : null;

  const reasons: string[] = [...violations];
  if (!expectedReturnVerified) reasons.push('expected_return_unverified_composite_provisional');
  if (relativeAlphaState === 'RA2_BETA_ONLY') reasons.push('absolute_return_not_distinct_from_sector_beta');
  if (relativeAlphaState === 'RA4_CONFIRMED_ALPHA') reasons.push('multi_horizon_alpha_with_economic_proof');
  if (relativeAlphaState === 'RA5_ALPHA_WITH_EXPECTATION_RISK') reasons.push('alpha_confirmed_but_expectation_risk_elevated');
  if (input.hiddenEconomicOverlap >= 60) reasons.push('hidden_economic_concentration_high');
  if (input.clinicalBinaryRisk >= 70) reasons.push('clinical_binary_risk_high');

  let capitalState: BioHealthCapitalState = 'WATCH';
  if (violations.length > 0) capitalState = 'REJECT_UNVERIFIED';
  else if (!expectedReturnVerified) capitalState = 'DEEP_DIVE';
  else if ((bras ?? 0) >= 78 && ['RA4_CONFIRMED_ALPHA', 'RA5_ALPHA_WITH_EXPECTATION_RISK'].includes(relativeAlphaState)) capitalState = 'CHALLENGER';
  else if ((bras ?? 0) >= 70) capitalState = 'KEEP';
  else if ((bras ?? 0) >= 58) capitalState = 'DISPLACEMENT_CANDIDATE';

  return {
    ticker: input.ticker,
    benchmark: input.benchmark,
    excessReturns,
    relativeAlphaScore,
    relativeAlphaState,
    bras,
    finalCompositeAllowed,
    capitalState,
    reasons,
  };
}

export const BIOHEALTH_GUARDRAILS = [
  'Absolute return is not alpha.',
  'Wrong benchmark invalidates relative-alpha inference.',
  'YTD alone cannot close a BioHealth decision.',
  'Sector M&A does not imply takeover probability for an individual ticker.',
  'Clinical beta does not neutralize binary clinical risk.',
  'High fundamental quality does not imply high expected return at the current price.',
  'Two healthcare tickers can share the same underlying economic exposure.',
  'Expected Return must be verified before BRAS can be treated as final Composite Omega.',
  'BioHealth candidates must beat the marginal portfolio holding, not only healthcare peers.',
] as const;
