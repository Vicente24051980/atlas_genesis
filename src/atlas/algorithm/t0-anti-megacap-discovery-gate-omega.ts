export type T0MarketCapBucket = 'LT_1B' | '1B_10B' | '10B_100B' | '100B_1T' | 'GT_1T' | 'UNKNOWN';
export type T0DiscoveryMode = 'GENERAL' | 'CHALLENGER' | 'NO_AI';
export type T0DiscoveryProvenance = 'PROSPECTIVE_AUDITABLE' | 'LEGACY_UNKNOWN';
export type T0TriState = true | false | 'UNKNOWN';

export interface T0DiscoveryCandidate {
  ticker: string;
  discoverySource: string;
  sourceUniverseType?: 'BROAD' | 'INDEX_ONLY' | 'CUSTOM';
  candidateRankBeforeScore: number;
  selectionReason: string;
  sizeInfluencedDiscovery: T0TriState;
  discoveryProvenance: T0DiscoveryProvenance;
  marketCapUsd?: number | null;
  analystCoverageInfluencedDiscovery?: boolean;
  brandFamiliarityInfluencedDiscovery?: boolean;
  rawDataAvailabilityInfluencedDiscovery?: boolean;
}

export interface T0AuditRecord {
  ticker: string;
  discoverySource: string;
  sourceUniverseType: 'BROAD' | 'INDEX_ONLY' | 'CUSTOM';
  candidateRankBeforeScore: number;
  marketCapBucketAfterFreeze: T0MarketCapBucket;
  selectionReason: string;
  sizeInfluencedDiscovery: T0TriState;
  discoveryProvenance: T0DiscoveryProvenance;
  discoveryBiasReasons: string[];
}

export type T0State =
  | 'PASS_SIZE_NEUTRAL_DISCOVERY'
  | 'PASS_WITH_COVERAGE_WARNING'
  | 'DISCOVERY_BIAS_DETECTED'
  | 'COVERAGE_INSUFFICIENT'
  | 'EVIDENCE_PENDING'
  | 'LEGACY_PROVENANCE_UNKNOWN';

export type T0RequiredAction = 'PROCEED' | 'REDISCOVER' | 'EXPAND_BUCKET_COVERAGE' | 'COMPLETE_EVIDENCE' | 'NO_RETROACTIVE_CLAIM';

export interface T0Policy {
  policyId: string;
  minimumCandidatesPerBucket: number;
  challengerFirstTrancheMegaShareLimit: number;
}

export const T0_POLICY_V1_1: T0Policy = {
  policyId: 'T0_POLICY_V1_1',
  minimumCandidatesPerBucket: 2,
  challengerFirstTrancheMegaShareLimit: 0.2,
};

export interface T0Result {
  state: T0State;
  mode: T0DiscoveryMode;
  downstreamAuthorized: boolean;
  requiredAction: T0RequiredAction;
  policyId: string;
  directScoreContribution: 0;
  marketCapContribution: 0;
  indexMembershipContribution: 0;
  analystCoverageContribution: 0;
  brandFamiliarityContribution: 0;
  rawDataAvailabilityContribution: 0;
  firstTrancheSize: number;
  firstTrancheMegaShare: number | null;
  bucketCounts: Record<T0MarketCapBucket, number>;
  bucketQuotaMet: boolean | null;
  audit: T0AuditRecord[];
  reasons: string[];
}

export const T0_ANTI_MEGACAP_DISCOVERY_GATE_OMEGA_V1_1 = {
  id: 'T0_ANTI_MEGACAP_DISCOVERY_GATE_OMEGA_V1_1',
  status: 'CANONICAL_FIRST_GATE',
  directScoreContribution: 0 as const,
  policy: T0_POLICY_V1_1,
  invariants: [
    'Every company starts from zero after T0.',
    'Market cap gives neither bonus nor penalty.',
    'Index membership gives neither bonus nor penalty.',
    'Analyst coverage, brand familiarity and raw data availability give no discovery or score bonus.',
    'T0 is prospective. Historical discovery provenance is UNKNOWN when it cannot be reconstructed.',
    'Neutrality is audited by capitalization-bucket quotas, not by pretending the evaluator did not know a famous company was large.',
    'Bucket quotas change discovery coverage only; they never change final score.',
    'A megacap may rank first after T0 if it wins on evidence.',
    'Size-related saturation, runway, liquidity or capacity effects are admissible only through causal economic evidence after discovery.',
    'Index-only discovery universes are DISCOVERY_BIAS_DETECTED before downstream consumption.',
  ] as const,
} as const;

// Backward name remains as a compatibility alias; v1.1 is the active specification.
export const T0_ANTI_MEGACAP_DISCOVERY_GATE_OMEGA_V1 = T0_ANTI_MEGACAP_DISCOVERY_GATE_OMEGA_V1_1;

const finiteNonNegative = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;

export function classifyMarketCapBucket(marketCapUsd?: number | null): T0MarketCapBucket {
  if (!finiteNonNegative(marketCapUsd)) return 'UNKNOWN';
  if (marketCapUsd < 1_000_000_000) return 'LT_1B';
  if (marketCapUsd < 10_000_000_000) return '1B_10B';
  if (marketCapUsd < 100_000_000_000) return '10B_100B';
  if (marketCapUsd < 1_000_000_000_000) return '100B_1T';
  return 'GT_1T';
}

function biasReasons(candidate: T0DiscoveryCandidate): string[] {
  const reasons: string[] = [];
  if (candidate.sizeInfluencedDiscovery === true) reasons.push('SIZE_INFLUENCED_DISCOVERY');
  if (candidate.sourceUniverseType === 'INDEX_ONLY') reasons.push('INDEX_ONLY_SOURCE_UNIVERSE');
  if (candidate.analystCoverageInfluencedDiscovery) reasons.push('ANALYST_COVERAGE_INFLUENCED_DISCOVERY');
  if (candidate.brandFamiliarityInfluencedDiscovery) reasons.push('BRAND_FAMILIARITY_INFLUENCED_DISCOVERY');
  if (candidate.rawDataAvailabilityInfluencedDiscovery) reasons.push('RAW_DATA_AVAILABILITY_INFLUENCED_DISCOVERY');
  return reasons;
}

function emptyBuckets(): Record<T0MarketCapBucket, number> {
  return { LT_1B: 0, '1B_10B': 0, '10B_100B': 0, '100B_1T': 0, GT_1T: 0, UNKNOWN: 0 };
}

function countBuckets(audit: readonly T0AuditRecord[]): Record<T0MarketCapBucket, number> {
  const counts = emptyBuckets();
  for (const row of audit) counts[row.marketCapBucketAfterFreeze] += 1;
  return counts;
}

function actionForState(state: T0State): T0RequiredAction {
  if (state === 'DISCOVERY_BIAS_DETECTED') return 'REDISCOVER';
  if (state === 'COVERAGE_INSUFFICIENT') return 'EXPAND_BUCKET_COVERAGE';
  if (state === 'EVIDENCE_PENDING') return 'COMPLETE_EVIDENCE';
  if (state === 'LEGACY_PROVENANCE_UNKNOWN') return 'NO_RETROACTIVE_CLAIM';
  return 'PROCEED';
}

export function evaluateT0DiscoveryGate(
  candidates: readonly T0DiscoveryCandidate[],
  mode: T0DiscoveryMode = 'GENERAL',
  firstTrancheSize = Math.min(20, candidates.length),
  policy: T0Policy = T0_POLICY_V1_1,
): T0Result {
  const reasons: string[] = [];
  if (!Array.isArray(candidates) || candidates.length === 0 || firstTrancheSize <= 0) {
    return {
      state: 'EVIDENCE_PENDING', mode, downstreamAuthorized: false, requiredAction: 'COMPLETE_EVIDENCE', policyId: policy.policyId,
      directScoreContribution: 0, marketCapContribution: 0, indexMembershipContribution: 0, analystCoverageContribution: 0,
      brandFamiliarityContribution: 0, rawDataAvailabilityContribution: 0, firstTrancheSize: 0, firstTrancheMegaShare: null,
      bucketCounts: emptyBuckets(), bucketQuotaMet: null, audit: [], reasons: ['NO_DISCOVERY_CANDIDATES'],
    };
  }

  const ordered = [...candidates].sort((a, b) => a.candidateRankBeforeScore - b.candidateRankBeforeScore);
  const audit: T0AuditRecord[] = ordered.map((candidate) => ({
    ticker: candidate.ticker,
    discoverySource: candidate.discoverySource,
    sourceUniverseType: candidate.sourceUniverseType ?? 'CUSTOM',
    candidateRankBeforeScore: candidate.candidateRankBeforeScore,
    marketCapBucketAfterFreeze: classifyMarketCapBucket(candidate.marketCapUsd),
    selectionReason: candidate.selectionReason,
    sizeInfluencedDiscovery: candidate.sizeInfluencedDiscovery,
    discoveryProvenance: candidate.discoveryProvenance,
    discoveryBiasReasons: biasReasons(candidate),
  }));

  const allLegacyUnknown = audit.every((row) => row.discoveryProvenance === 'LEGACY_UNKNOWN');
  if (allLegacyUnknown) {
    return {
      state: 'LEGACY_PROVENANCE_UNKNOWN', mode, downstreamAuthorized: true, requiredAction: 'NO_RETROACTIVE_CLAIM', policyId: policy.policyId,
      directScoreContribution: 0, marketCapContribution: 0, indexMembershipContribution: 0, analystCoverageContribution: 0,
      brandFamiliarityContribution: 0, rawDataAvailabilityContribution: 0, firstTrancheSize: Math.min(firstTrancheSize, audit.length),
      firstTrancheMegaShare: null, bucketCounts: countBuckets(audit), bucketQuotaMet: null, audit,
      reasons: ['Historical discovery provenance cannot be reconstructed. T0 makes no retroactive claim of size-neutral discovery.'],
    };
  }

  const explicitBias = audit.some((row) => row.discoveryBiasReasons.length > 0);
  const tranche = audit.slice(0, Math.min(firstTrancheSize, audit.length));
  const knownSizeRows = tranche.filter((row) => row.marketCapBucketAfterFreeze !== 'UNKNOWN');
  const megaCount = knownSizeRows.filter((row) => row.marketCapBucketAfterFreeze === 'GT_1T').length;
  const megaShare = knownSizeRows.length ? megaCount / knownSizeRows.length : null;
  const bucketCounts = countBuckets(tranche);
  const knownBuckets: Exclude<T0MarketCapBucket, 'UNKNOWN'>[] = ['LT_1B','1B_10B','10B_100B','100B_1T','GT_1T'];
  const quotaApplicable = tranche.length >= policy.minimumCandidatesPerBucket * knownBuckets.length;
  const quotaMet = quotaApplicable
    ? knownBuckets.every((bucket) => bucketCounts[bucket] >= policy.minimumCandidatesPerBucket)
    : null;
  const challengerMode = mode === 'CHALLENGER' || mode === 'NO_AI';
  const megaLimitBreached = challengerMode && megaShare != null && megaShare > policy.challengerFirstTrancheMegaShareLimit;
  const unknownSize = bucketCounts.UNKNOWN > 0;

  if (explicitBias) reasons.push('UPSTREAM_DISCOVERY_BIAS_PRESENT');
  if (megaLimitBreached) reasons.push('FIRST_TRANCHE_GT_1T_SHARE_ABOVE_POLICY_LIMIT');
  if (quotaApplicable && quotaMet === false) reasons.push('BUCKET_QUOTA_NOT_MET');
  if (unknownSize) reasons.push('MARKET_CAP_BUCKET_UNKNOWN_AFTER_SCORE_FREEZE');

  let state: T0State = 'PASS_SIZE_NEUTRAL_DISCOVERY';
  if (explicitBias || megaLimitBreached) state = 'DISCOVERY_BIAS_DETECTED';
  else if (unknownSize && challengerMode) state = 'EVIDENCE_PENDING';
  else if (quotaApplicable && quotaMet === false) state = 'COVERAGE_INSUFFICIENT';
  else if (reasons.length) state = 'PASS_WITH_COVERAGE_WARNING';

  return {
    state,
    mode,
    downstreamAuthorized: state === 'PASS_SIZE_NEUTRAL_DISCOVERY' || state === 'PASS_WITH_COVERAGE_WARNING',
    requiredAction: actionForState(state),
    policyId: policy.policyId,
    directScoreContribution: 0,
    marketCapContribution: 0,
    indexMembershipContribution: 0,
    analystCoverageContribution: 0,
    brandFamiliarityContribution: 0,
    rawDataAvailabilityContribution: 0,
    firstTrancheSize: tranche.length,
    firstTrancheMegaShare: megaShare,
    bucketCounts,
    bucketQuotaMet: quotaMet,
    audit,
    reasons,
  };
}

export interface T0PostGateEvidenceScore { ticker: string; evidenceScore: number; }
export function rankAfterT0(scores: readonly T0PostGateEvidenceScore[]): T0PostGateEvidenceScore[] {
  return [...scores].filter((row) => Number.isFinite(row.evidenceScore))
    .sort((a, b) => b.evidenceScore - a.evidenceScore || a.ticker.localeCompare(b.ticker));
}
