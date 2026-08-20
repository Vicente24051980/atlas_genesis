export type SizeBucket = 'MOSQUITO' | 'PERIQUITO' | 'ELEFANTE' | 'DINOSAURIO' | 'UNKNOWN';

export type ReturnRankingVerdict =
  | 'RANK_ELIGIBLE'
  | 'EVIDENCE_PENDING'
  | 'FALSIFIER_VETO';

export interface SizeNeutralReturnInput {
  ticker: string;
  evidenceTraceable: boolean;
  evidenceIds: string[];

  // Ten universal 0..100 blocks. Every security starts at zero.
  economicProof: number;
  cashEfficiency: number;
  growthAcceleration: number;
  expectedReturnValuation: number;
  consensusRevisions: number;
  moneyRotation: number;
  momentumBreadth: number;
  dislocationAsymmetry: number;
  specialistEngineCapture: number;
  riskDurability: number;

  // Economic saturation only. This is NOT a market-cap penalty.
  growthSaturationPenalty?: number;

  // Absolute veto remains independent from the score.
  falsifierVeto?: boolean;
  falsifierReasons?: string[];

  // Metadata used only AFTER the score is frozen.
  marketCapUsd?: number | null;
}

export interface SizeNeutralReturnResult {
  ticker: string;
  score: number;
  businessScore: number;
  opportunityScore: number;
  growthAccelerationAdjusted: number;
  scoreFrozen: true;
  verdict: ReturnRankingVerdict;
  eligibleForRanking: boolean;
  sizeBucket: SizeBucket;
  sizeWasUsedInScore: false;
  falsifierVeto: boolean;
  reasons: string[];
  blocks: Readonly<Record<string, number>>;
}

const FORBIDDEN_SCORE_PROXIES = new Set([
  'marketCapScore',
  'marketCapBonus',
  'marketCapPenalty',
  'qualityScore',
  'qualityLabelScore',
  'fameScore',
  'brandScore',
  'analystCountScore',
  'indexWeightScore',
  'liquidityScore',
  'absoluteFcfScore',
  'absoluteVolumeScore',
]);

function clamp100(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/**
 * Runtime guard against reintroducing megacap/quality bias through hidden proxies.
 * Market cap itself is allowed only as post-score metadata.
 */
export function assertNoSizeOrPrestigeScoreProxy(input: SizeNeutralReturnInput): void {
  for (const key of Object.keys(input as unknown as Record<string, unknown>)) {
    if (FORBIDDEN_SCORE_PROXIES.has(key)) {
      throw new Error(`SIZE_NEUTRALITY_VIOLATION:${key}`);
    }
  }
}

/**
 * Size labels are diagnostic metadata. They are assigned only after the score is frozen.
 */
export function classifySizeAfterScoring(marketCapUsd?: number | null): SizeBucket {
  if (marketCapUsd == null || !Number.isFinite(marketCapUsd) || marketCapUsd < 0) return 'UNKNOWN';
  if (marketCapUsd >= 1_000_000_000_000) return 'DINOSAURIO';
  if (marketCapUsd >= 100_000_000_000) return 'ELEFANTE';
  if (marketCapUsd >= 10_000_000_000) return 'PERIQUITO';
  return 'MOSQUITO';
}

/**
 * Size-Neutral Return Ranking Ω
 *
 * Constitutional invariants:
 * - score starts at 0, never at a quality/fame baseline;
 * - market cap gives 0 bonus and 0 penalty;
 * - absolute FCF/volume, analyst coverage and index weight never score directly;
 * - normalized economics and expected return do score;
 * - Growth Saturation Ω is an economics penalty, not a size penalty;
 * - Falsifiers Ω remains an absolute veto independent from diagnostic score.
 */
export function evaluateSizeNeutralReturn(
  input: SizeNeutralReturnInput,
): SizeNeutralReturnResult {
  assertNoSizeOrPrestigeScoreProxy(input);

  const growthSaturationPenalty = clamp100(input.growthSaturationPenalty ?? 0);
  const growthAccelerationAdjusted = Math.max(
    0,
    clamp100(input.growthAcceleration) - growthSaturationPenalty,
  );

  const blocks = Object.freeze({
    economicProof: clamp100(input.economicProof),
    cashEfficiency: clamp100(input.cashEfficiency),
    growthAcceleration: growthAccelerationAdjusted,
    expectedReturnValuation: clamp100(input.expectedReturnValuation),
    consensusRevisions: clamp100(input.consensusRevisions),
    moneyRotation: clamp100(input.moneyRotation),
    momentumBreadth: clamp100(input.momentumBreadth),
    dislocationAsymmetry: clamp100(input.dislocationAsymmetry),
    specialistEngineCapture: clamp100(input.specialistEngineCapture),
    riskDurability: clamp100(input.riskDurability),
  });

  // 10 independent 0..100 blocks => 0..1000. No baseline points exist.
  const score = Math.round(Object.values(blocks).reduce((sum, value) => sum + value, 0));

  // Business and opportunity are diagnostics, not additive bonuses.
  const businessScore = Math.round(mean([
    blocks.economicProof,
    blocks.cashEfficiency,
    blocks.growthAcceleration,
    blocks.riskDurability,
  ]));
  const opportunityScore = Math.round(mean([
    blocks.expectedReturnValuation,
    blocks.consensusRevisions,
    blocks.moneyRotation,
    blocks.momentumBreadth,
    blocks.dislocationAsymmetry,
    blocks.specialistEngineCapture,
  ]));

  // Score is frozen before market-cap metadata is inspected.
  const scoreFrozen = true as const;
  const sizeBucket = classifySizeAfterScoring(input.marketCapUsd);

  const falsifierVeto = input.falsifierVeto === true;
  const evidenceOk = input.evidenceTraceable && input.evidenceIds.length >= 2;
  const verdict: ReturnRankingVerdict = falsifierVeto
    ? 'FALSIFIER_VETO'
    : evidenceOk
      ? 'RANK_ELIGIBLE'
      : 'EVIDENCE_PENDING';

  const reasons: string[] = [
    'All securities start at 0/1000; there is no size, fame, index-membership or generic-quality baseline.',
    'Market capitalization is assigned only as a post-score diagnostic bucket.',
    'Final ranking targets evidence-backed expected return adjusted for risk, not company prestige.',
  ];

  if (growthSaturationPenalty > 0) {
    reasons.push(
      `Growth Saturation Ω reduced the growth-acceleration block by ${growthSaturationPenalty} points based on economics, not size.`,
    );
  }

  if (!evidenceOk) {
    reasons.push('Traceable evidence gate is incomplete; score remains diagnostic and cannot rank as confirmed.');
  }

  if (falsifierVeto) {
    reasons.push('Falsifiers Ω veto is absolute and overrides ranking eligibility without erasing the diagnostic score.');
    for (const reason of input.falsifierReasons ?? []) reasons.push(`FALSIFIER: ${reason}`);
  }

  return {
    ticker: input.ticker,
    score,
    businessScore,
    opportunityScore,
    growthAccelerationAdjusted,
    scoreFrozen,
    verdict,
    eligibleForRanking: verdict === 'RANK_ELIGIBLE',
    sizeBucket,
    sizeWasUsedInScore: false,
    falsifierVeto,
    reasons,
    blocks,
  };
}

export interface SizeNeutralityAudit {
  total: number;
  bySize: Record<SizeBucket, number>;
  meanScoreBySize: Partial<Record<SizeBucket, number>>;
  neutralityInvariant: true;
  note: string;
}

/**
 * Post-ranking audit only. It NEVER changes a score.
 * Used to detect residual concentration by size after all scores are frozen.
 */
export function auditFrozenRankingBySize(
  results: SizeNeutralReturnResult[],
): SizeNeutralityAudit {
  const buckets: SizeBucket[] = ['MOSQUITO', 'PERIQUITO', 'ELEFANTE', 'DINOSAURIO', 'UNKNOWN'];
  const bySize = Object.fromEntries(buckets.map((bucket) => [bucket, 0])) as Record<SizeBucket, number>;
  const scores = new Map<SizeBucket, number[]>();

  for (const result of results) {
    bySize[result.sizeBucket] += 1;
    const values = scores.get(result.sizeBucket) ?? [];
    values.push(result.score);
    scores.set(result.sizeBucket, values);
  }

  const meanScoreBySize: Partial<Record<SizeBucket, number>> = {};
  for (const [bucket, values] of scores.entries()) {
    meanScoreBySize[bucket] = Math.round(mean(values));
  }

  return {
    total: results.length,
    bySize,
    meanScoreBySize,
    neutralityInvariant: true,
    note: 'Size distribution is observed only after scoring. No bucket receives a bonus, penalty or exclusion.',
  };
}
