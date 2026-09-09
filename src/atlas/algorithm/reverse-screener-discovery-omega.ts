export const REVERSE_SCREENER_DISCOVERY_OMEGA_VERSION = '2026-09-09-v1.0.0' as const;

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

export type ReverseScreenerRegime =
  | 'STRUCTURAL_GROWTH'
  | 'TECH_SUPERCYCLE'
  | 'CYCLICAL'
  | 'EVENT_DRIVEN'
  | 'UNCLASSIFIED';

export interface ReverseScreenerInput {
  ticker: string;
  marketCapUsdBn: number;
  revenueGrowthPct: number;
  epsGrowthPct: number;
  ebitdaGrowthPct: number;
  fcfGrowthPct: number;
  forwardEpsRevisionPct: number;
  fcfPositive: boolean;
  netDebtToEbitda: number | null;
  operatingMarginPct: number;
  roicPct: number;
  forwardPe: number | null;
  evToEbitda: number | null;
  fcfYieldPct: number | null;
  priceAboveMa200: boolean;
  return3mPct: number;
  return6mPct: number;
  guidanceRaised?: boolean;
  marginsExpanding?: boolean;
  revenueAccelerating?: boolean;
  newCatalyst?: boolean;
  commoditySensitive?: boolean;
  oneOffEarningsRisk?: boolean;
  binaryBiotechRisk?: boolean;
  leverageRisk?: boolean;
  customerConcentrationRisk?: boolean;
  regulatoryRisk?: boolean;
  earningsVsFiveYearNormPct?: number | null;
  regime?: ReverseScreenerRegime;
  evidenceTraceable: boolean;
  evidenceIds: string[];
}

export interface ReverseScreenerResult {
  ticker: string;
  passed: boolean;
  score: number;
  regime: ReverseScreenerRegime;
  gates: {
    universe: boolean;
    acceleration: boolean;
    quality: boolean;
    valuation: boolean;
    momentum: boolean;
  };
  cycleNormalizationRequired: boolean;
  warnings: string[];
  capitalDecisionAuthority: 'NONE';
}

function growthHits(input: ReverseScreenerInput): number {
  return [
    input.revenueGrowthPct > 10,
    input.epsGrowthPct > 15,
    input.ebitdaGrowthPct > 15,
    input.fcfGrowthPct > 15,
    input.forwardEpsRevisionPct > 0,
  ].filter(Boolean).length;
}

function valuationPasses(input: ReverseScreenerInput): boolean {
  return (
    (input.forwardPe != null && input.forwardPe > 0 && input.forwardPe < 30) ||
    (input.evToEbitda != null && input.evToEbitda > 0 && input.evToEbitda < 18) ||
    (input.fcfYieldPct != null && input.fcfYieldPct > 4)
  );
}

function evidencePasses(input: ReverseScreenerInput): boolean {
  return input.evidenceTraceable && input.evidenceIds.filter((x) => x.trim().length > 0).length >= 2;
}

export function evaluateReverseScreenerDiscovery(input: ReverseScreenerInput): ReverseScreenerResult {
  const universe = input.marketCapUsdBn >= 1;
  const acceleration = growthHits(input) >= 2;
  const quality =
    input.fcfPositive &&
    (input.netDebtToEbitda == null || input.netDebtToEbitda < 3) &&
    input.operatingMarginPct > 10 &&
    input.roicPct > 8;
  const valuation = valuationPasses(input);
  const momentum = input.priceAboveMa200 && input.return3mPct > 0 && input.return6mPct > 0;

  const cycleNormalizationRequired =
    (input.commoditySensitive === true || input.regime === 'CYCLICAL') &&
    (input.earningsVsFiveYearNormPct ?? 0) > 50;

  const warnings: string[] = [];
  if (!evidencePasses(input)) warnings.push('EVIDENCE_PENDING');
  if (cycleNormalizationRequired) warnings.push('CYCLE_NORMALIZATION_REQUIRED');
  if (input.oneOffEarningsRisk) warnings.push('ONE_OFF_EARNINGS_RISK');
  if (input.binaryBiotechRisk) warnings.push('BINARY_BIOTECH_RISK');
  if (input.leverageRisk) warnings.push('LEVERAGE_RISK');
  if (input.customerConcentrationRisk) warnings.push('CUSTOMER_CONCENTRATION_RISK');
  if (input.regulatoryRisk) warnings.push('REGULATORY_RISK');

  const accelerationScore = clamp(
    Math.max(input.revenueGrowthPct, input.epsGrowthPct, input.ebitdaGrowthPct, input.fcfGrowthPct, 0),
  );
  const revisionsScore = clamp(50 + input.forwardEpsRevisionPct * 5);
  const fcfQualityScore = input.fcfPositive ? clamp(60 + Math.max(0, input.fcfYieldPct ?? 0) * 5) : 0;
  const valuationScore = valuation ? 75 : 25;
  const momentumScore = clamp(50 + Math.max(0, input.return3mPct) + Math.max(0, input.return6mPct) / 2);
  const catalystScore = clamp(
    25 +
      (input.guidanceRaised ? 20 : 0) +
      (input.marginsExpanding ? 15 : 0) +
      (input.revenueAccelerating ? 20 : 0) +
      (input.newCatalyst ? 20 : 0),
  );

  let score =
    accelerationScore * 0.25 +
    revisionsScore * 0.20 +
    fcfQualityScore * 0.15 +
    valuationScore * 0.15 +
    momentumScore * 0.15 +
    catalystScore * 0.10;

  const penaltyCount = [
    input.oneOffEarningsRisk,
    input.binaryBiotechRisk,
    input.leverageRisk,
    input.customerConcentrationRisk,
    input.regulatoryRisk,
  ].filter(Boolean).length;
  score -= penaltyCount * 4;
  if (cycleNormalizationRequired) score -= 10;
  score = clamp(score);

  const passed =
    evidencePasses(input) &&
    universe &&
    acceleration &&
    quality &&
    valuation &&
    momentum;

  return {
    ticker: input.ticker,
    passed,
    score,
    regime: input.regime ?? 'UNCLASSIFIED',
    gates: { universe, acceleration, quality, valuation, momentum },
    cycleNormalizationRequired,
    warnings,
    capitalDecisionAuthority: 'NONE',
  };
}

export function rankReverseScreenerDiscovery(inputs: ReverseScreenerInput[]): ReverseScreenerResult[] {
  return inputs
    .map(evaluateReverseScreenerDiscovery)
    .filter((x) => x.passed)
    .sort((a, b) => b.score - a.score);
}

export const REVERSE_SCREENER_DISCOVERY_OMEGA_LAWS = [
  'DISCOVERY_SCORE != BUY',
  'DISCOVERY_SCORE != PORTFOLIO_WEIGHT',
  'STRUCTURAL_GROWTH != CYCLICAL_GROWTH',
  'CYCLICAL_PEAK_EARNINGS_REQUIRE_NORMALIZATION',
  'TWO_OF_FIVE_ACCELERATION_GATE_REQUIRED',
  'MOMENTUM_CANNOT_REPAIR_FAILED_QUALITY',
  'CHEAP_MULTIPLE_CANNOT_REPAIR_FAILED_ECONOMIC_PROOF',
  'REGIME_CLASSIFICATION_PRECEDES_FINAL_COMPARISON',
] as const;
