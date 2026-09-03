export const INVESTING_AI_CLONE_VERSION = '1.3' as const;

export const FACTOR_KEYS = [
  'F1_OPERATING_GROWTH',
  'F2_ECONOMIC_PROFITABILITY',
  'F3_CASH_CONVERSION',
  'F4_FINANCIAL_STRENGTH',
  'F5_VALUATION',
  'F6_EXPECTATIONS_TRAJECTORY',
  'F7_RELATIVE_MOMENTUM',
  'F8_TECHNICAL_LIQUIDITY',
  'F9_MARKET_RISK',
  'F10_NEWS_EVENTS',
] as const;

export type FactorKey = (typeof FACTOR_KEYS)[number];
export type ConfidenceBand = 'HIGH' | 'MEDIUM' | 'LOW';
export type ReliabilityState = 'INSUFFICIENT' | 'PROVISIONAL' | 'ESTABLISHED';
export type DataState = 'COMPLETE' | 'PARTIAL' | 'BLOCKED';

export interface FactorAudit {
  score: number; // 0..100, higher is always better
  coveragePct: number; // valid/applicable metrics for this factor
  dominantEvidence: string;
  evidenceAsOf: string;
}

export type FactorAuditMap = Record<FactorKey, FactorAudit>;

export interface CoverageMetric {
  applicable: boolean;
  available: boolean;
  importance: number;
}

export interface ConfidenceInputs {
  freshness: number;
  sourceQuality: number;
  criticalMetricCompleteness: number;
  crossSourceConsistency: number;
  accountingComparability: number;
  noObsolescingEvent: number;
}

export interface ReliabilityObservation {
  sampleSize: number;
  reliabilityScore?: number;
  intervalLow?: number;
  intervalHigh?: number;
  scoreBand: string;
  horizonDays: 20 | 60 | 120;
  sector?: string;
  regime?: string;
}

export interface CloneAuditInput {
  factors: FactorAuditMap;
  coverageMetrics: CoverageMetric[];
  confidence: ConfidenceInputs;
  criticalVariableMissing?: string | null;
  atlasScore?: number | null;
  hardGate?: { active: boolean; evidence?: string };
}

export interface CloneAuditResult {
  cloneScore: number | null;
  coveragePct: number;
  confidenceScore: number;
  confidenceBand: ConfidenceBand;
  noScoreReason?: string;
  factorContributions: Record<FactorKey, number>;
  horizons: {
    structural: number | null;
    expectations: number | null;
    marketConfirmation: number | null;
    execution: number | null;
    riskOverlay: number | null;
    eventsMateriality: number | null;
  };
  atlasCloneDivergence?: {
    absoluteDifference: number;
    state: 'ALIGNED' | 'MATERIAL' | 'SEVERE';
  };
  hardGate: { active: boolean; evidence?: string };
}

const clamp100 = (value: number): number => Math.max(0, Math.min(100, value));
const avg = (values: number[]): number | null =>
  values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
const round2 = (value: number): number => Math.round(value * 100) / 100;

/**
 * Clone Score contains present evidence only. Coverage, Confidence and Reliability
 * are deliberately excluded from the arithmetic.
 */
export function calculateCloneScore(factors: FactorAuditMap): {
  score: number;
  contributions: Record<FactorKey, number>;
} {
  const contributions = {} as Record<FactorKey, number>;
  let score = 0;
  for (const key of FACTOR_KEYS) {
    const factorScore = clamp100(factors[key].score);
    contributions[key] = round2(factorScore * 0.10);
    score += contributions[key];
  }
  return { score: round2(score), contributions };
}

/** Weighted valid/applicable coverage. N/A metrics leave the denominator. */
export function calculateCoverage(metrics: CoverageMetric[]): number {
  const applicable = metrics.filter((m) => m.applicable && m.importance > 0);
  const denominator = applicable.reduce((sum, m) => sum + m.importance, 0);
  if (!denominator) return 0;
  const numerator = applicable
    .filter((m) => m.available)
    .reduce((sum, m) => sum + m.importance, 0);
  return round2((numerator / denominator) * 100);
}

/**
 * Current-analysis confidence. This is not statistical confidence in Reliability.
 * Inputs are 0..100 and weights are frozen in v1.3.
 */
export function calculateConfidence(input: ConfidenceInputs): number {
  const score =
    clamp100(input.freshness) * 0.25 +
    clamp100(input.sourceQuality) * 0.25 +
    clamp100(input.criticalMetricCompleteness) * 0.20 +
    clamp100(input.crossSourceConsistency) * 0.15 +
    clamp100(input.accountingComparability) * 0.10 +
    clamp100(input.noObsolescingEvent) * 0.05;
  return round2(score);
}

export function confidenceBand(score: number): ConfidenceBand {
  if (score >= 80) return 'HIGH';
  if (score >= 60) return 'MEDIUM';
  return 'LOW';
}

export function reliabilityState(sampleSize: number): ReliabilityState {
  if (sampleSize < 30) return 'INSUFFICIENT';
  if (sampleSize < 100) return 'PROVISIONAL';
  return 'ESTABLISHED';
}

export function canPublishReliability(observation: ReliabilityObservation): boolean {
  return reliabilityState(observation.sampleSize) !== 'INSUFFICIENT';
}

export function divergenceState(diff: number): 'ALIGNED' | 'MATERIAL' | 'SEVERE' {
  if (diff >= 20) return 'SEVERE';
  if (diff >= 10) return 'MATERIAL';
  return 'ALIGNED';
}

export function auditInvestingAiClone(input: CloneAuditInput): CloneAuditResult {
  const coveragePct = calculateCoverage(input.coverageMetrics);
  const confidenceScore = calculateConfidence(input.confidence);
  const band = confidenceBand(confidenceScore);
  const hardGate = input.hardGate ?? { active: false };

  if (input.criticalVariableMissing) {
    return {
      cloneScore: null,
      coveragePct,
      confidenceScore,
      confidenceBand: band,
      noScoreReason: `Critical variable missing: ${input.criticalVariableMissing}`,
      factorContributions: Object.fromEntries(FACTOR_KEYS.map((k) => [k, 0])) as Record<FactorKey, number>,
      horizons: {
        structural: null,
        expectations: null,
        marketConfirmation: null,
        execution: null,
        riskOverlay: null,
        eventsMateriality: null,
      },
      hardGate,
    };
  }

  const { score, contributions } = calculateCloneScore(input.factors);
  const f = input.factors;
  const structural = avg([
    f.F1_OPERATING_GROWTH.score,
    f.F2_ECONOMIC_PROFITABILITY.score,
    f.F3_CASH_CONVERSION.score,
    f.F4_FINANCIAL_STRENGTH.score,
    f.F5_VALUATION.score,
  ]);

  const result: CloneAuditResult = {
    cloneScore: score,
    coveragePct,
    confidenceScore,
    confidenceBand: band,
    factorContributions: contributions,
    horizons: {
      structural: structural == null ? null : round2(structural),
      expectations: round2(clamp100(f.F6_EXPECTATIONS_TRAJECTORY.score)),
      marketConfirmation: round2(clamp100(f.F7_RELATIVE_MOMENTUM.score)),
      execution: round2(clamp100(f.F8_TECHNICAL_LIQUIDITY.score)),
      riskOverlay: round2(clamp100(f.F9_MARKET_RISK.score)),
      eventsMateriality: round2(clamp100(f.F10_NEWS_EVENTS.score)),
    },
    hardGate,
  };

  if (typeof input.atlasScore === 'number') {
    const diff = round2(Math.abs(clamp100(input.atlasScore) - score));
    result.atlasCloneDivergence = { absoluteDifference: diff, state: divergenceState(diff) };
  }

  return result;
}

/**
 * Canonical integration rule. Reliability does not alter the nominal 40% in v1.3.
 * ATLAS hard gates remain outside the weighted score and retain veto authority.
 */
export function atlasCloneComposite(atlasScore: number, cloneScore: number): number {
  return round2(clamp100(atlasScore) * 0.60 + clamp100(cloneScore) * 0.40);
}
