export type T0MarketCapBucket = 'MICRO' | 'SMALL' | 'MID' | 'LARGE' | 'MEGA' | 'UNKNOWN';

export type T0DiscoveryMode = 'GENERAL' | 'CHALLENGER' | 'NO_AI';

export interface T0DiscoveryCandidate {
  ticker: string;
  discoverySource: string;
  candidateRankBeforeSize: number;
  selectionReason: string;
  enteredBeforeSizeKnown: boolean;
  sizeInfluencedDiscovery: boolean;
  marketCapUsd?: number | null;
  indexMembershipKnownAtDiscovery?: boolean;
  analystCoverageInfluencedDiscovery?: boolean;
  brandFamiliarityInfluencedDiscovery?: boolean;
  rawDataAvailabilityInfluencedDiscovery?: boolean;
}

export interface T0AuditRecord {
  ticker: string;
  discoverySource: string;
  candidateRankBeforeSize: number;
  marketCapBucketAfterFreeze: T0MarketCapBucket;
  enteredBeforeSizeKnown: boolean;
  selectionReason: string;
  sizeInfluencedDiscovery: boolean;
  discoveryBiasReasons: string[];
}

export type T0State =
  | 'PASS_SIZE_NEUTRAL_DISCOVERY'
  | 'PASS_WITH_COVERAGE_WARNING'
  | 'DISCOVERY_BIAS_DETECTED'
  | 'COVERAGE_INSUFFICIENT'
  | 'EVIDENCE_PENDING';

export type T0RequiredAction = 'PROCEED' | 'REDISCOVER' | 'EXPAND_BUCKET_COVERAGE' | 'COMPLETE_EVIDENCE';

export interface T0Result {
  state: T0State;
  mode: T0DiscoveryMode;
  downstreamAuthorized: boolean;
  requiredAction: T0RequiredAction;
  directScoreContribution: 0;
  marketCapContribution: 0;
  indexMembershipContribution: 0;
  analystCoverageContribution: 0;
  brandFamiliarityContribution: 0;
  rawDataAvailabilityContribution: 0;
  firstTrancheSize: number;
  firstTrancheMegaShare: number | null;
  bucketCounts: Record<T0MarketCapBucket, number>;
  audit: T0AuditRecord[];
  reasons: string[];
}

export const T0_ANTI_MEGACAP_DISCOVERY_GATE_OMEGA_V1 = {
  id: 'T0_ANTI_MEGACAP_DISCOVERY_GATE_OMEGA_V1',
  status: 'CANONICAL_FIRST_GATE',
  directScoreContribution: 0 as const,
  challengerFirstTrancheMegaCapLimit: 0.2,
  minimumCoveredBucketsForBroadDiscovery: 3,
  invariants: [
    'Every company starts from zero after T0.',
    'Market cap gives neither bonus nor penalty.',
    'Index membership gives neither bonus nor penalty.',
    'Analyst coverage, brand familiarity and raw data availability give no discovery or score bonus.',
    'Capitalization buckets are assigned only after discovery priority is frozen.',
    'Bucket balancing changes discovery coverage only; it never changes final score.',
    'A megacap may rank first after T0 if it wins on evidence.',
    'Size-related saturation, runway, liquidity or capacity effects are admissible only through causal economic evidence after discovery.',
    'DISCOVERY_BIAS_DETECTED, COVERAGE_INSUFFICIENT and EVIDENCE_PENDING cannot authorize downstream analysis.',
  ] as const,
} as const;

const finiteNonNegative = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;

export function classifyMarketCapBucket(marketCapUsd?: number | null): T0MarketCapBucket {
  if (!finiteNonNegative(marketCapUsd)) return 'UNKNOWN';
  if (marketCapUsd < 300_000_000) return 'MICRO';
  if (marketCapUsd < 2_000_000_000) return 'SMALL';
  if (marketCapUsd < 10_000_000_000) return 'MID';
  if (marketCapUsd < 200_000_000_000) return 'LARGE';
  return 'MEGA';
}

function biasReasons(candidate: T0DiscoveryCandidate): string[] {
  const reasons: string[] = [];
  if (candidate.sizeInfluencedDiscovery) reasons.push('SIZE_INFLUENCED_DISCOVERY');
  if (candidate.indexMembershipKnownAtDiscovery === true) reasons.push('INDEX_MEMBERSHIP_AVAILABLE_AT_DISCOVERY');
  if (candidate.analystCoverageInfluencedDiscovery) reasons.push('ANALYST_COVERAGE_INFLUENCED_DISCOVERY');
  if (candidate.brandFamiliarityInfluencedDiscovery) reasons.push('BRAND_FAMILIARITY_INFLUENCED_DISCOVERY');
  if (candidate.rawDataAvailabilityInfluencedDiscovery) reasons.push('RAW_DATA_AVAILABILITY_INFLUENCED_DISCOVERY');
  if (!candidate.enteredBeforeSizeKnown) reasons.push('SIZE_KNOWN_BEFORE_DISCOVERY_FREEZE');
  return reasons;
}

function countBuckets(audit: T0AuditRecord[]): Record<T0MarketCapBucket, number> {
  const counts: Record<T0MarketCapBucket, number> = {
    MICRO: 0,
    SMALL: 0,
    MID: 0,
    LARGE: 0,
    MEGA: 0,
    UNKNOWN: 0,
  };
  for (const row of audit) counts[row.marketCapBucketAfterFreeze] += 1;
  return counts;
}

function actionForState(state: T0State): T0RequiredAction {
  if (state === 'DISCOVERY_BIAS_DETECTED') return 'REDISCOVER';
  if (state === 'COVERAGE_INSUFFICIENT') return 'EXPAND_BUCKET_COVERAGE';
  if (state === 'EVIDENCE_PENDING') return 'COMPLETE_EVIDENCE';
  return 'PROCEED';
}

export function evaluateT0DiscoveryGate(
  candidates: T0DiscoveryCandidate[],
  mode: T0DiscoveryMode = 'GENERAL',
  firstTrancheSize = Math.min(20, candidates.length),
): T0Result {
  const reasons: string[] = [];

  if (!Array.isArray(candidates) || candidates.length === 0 || firstTrancheSize <= 0) {
    return {
      state: 'EVIDENCE_PENDING',
      mode,
      downstreamAuthorized: false,
      requiredAction: 'COMPLETE_EVIDENCE',
      directScoreContribution: 0,
      marketCapContribution: 0,
      indexMembershipContribution: 0,
      analystCoverageContribution: 0,
      brandFamiliarityContribution: 0,
      rawDataAvailabilityContribution: 0,
      firstTrancheSize: 0,
      firstTrancheMegaShare: null,
      bucketCounts: { MICRO: 0, SMALL: 0, MID: 0, LARGE: 0, MEGA: 0, UNKNOWN: 0 },
      audit: [],
      reasons: ['NO_DISCOVERY_CANDIDATES'],
    };
  }

  const ordered = [...candidates].sort((a, b) => a.candidateRankBeforeSize - b.candidateRankBeforeSize);
  const audit: T0AuditRecord[] = ordered.map((candidate) => ({
    ticker: candidate.ticker,
    discoverySource: candidate.discoverySource,
    candidateRankBeforeSize: candidate.candidateRankBeforeSize,
    marketCapBucketAfterFreeze: classifyMarketCapBucket(candidate.marketCapUsd),
    enteredBeforeSizeKnown: candidate.enteredBeforeSizeKnown,
    selectionReason: candidate.selectionReason,
    sizeInfluencedDiscovery: candidate.sizeInfluencedDiscovery,
    discoveryBiasReasons: biasReasons(candidate),
  }));

  const explicitBias = audit.some((row) => row.discoveryBiasReasons.some((reason) =>
    reason !== 'INDEX_MEMBERSHIP_AVAILABLE_AT_DISCOVERY'
  ));

  const tranche = audit.slice(0, Math.min(firstTrancheSize, audit.length));
  const megaKnown = tranche.filter((row) => row.marketCapBucketAfterFreeze === 'MEGA').length;
  const knownSize = tranche.filter((row) => row.marketCapBucketAfterFreeze !== 'UNKNOWN').length;
  const unknownSize = tranche.length - knownSize;
  const megaShare = knownSize > 0 ? megaKnown / knownSize : null;

  const bucketCounts = countBuckets(audit);
  const representedBuckets = (Object.entries(bucketCounts) as [T0MarketCapBucket, number][])
    .filter(([bucket, count]) => bucket !== 'UNKNOWN' && count > 0)
    .map(([bucket]) => bucket);

  const challengerMode = mode === 'CHALLENGER' || mode === 'NO_AI';
  const megaCapLimitBreached = challengerMode
    && megaShare !== null
    && megaShare > T0_ANTI_MEGACAP_DISCOVERY_GATE_OMEGA_V1.challengerFirstTrancheMegaCapLimit;
  const broadCoverageExpected = audit.length >= 6;
  const coverageInsufficient = broadCoverageExpected
    && representedBuckets.length < T0_ANTI_MEGACAP_DISCOVERY_GATE_OMEGA_V1.minimumCoveredBucketsForBroadDiscovery;
  const challengerSizeEvidenceIncomplete = challengerMode && unknownSize > 0;

  if (explicitBias) reasons.push('UPSTREAM_DISCOVERY_BIAS_PRESENT');
  if (megaCapLimitBreached) reasons.push('FIRST_TRANCHE_MEGACAP_SHARE_ABOVE_20_PERCENT');
  if (coverageInsufficient) reasons.push('INSUFFICIENT_CAPITALIZATION_BUCKET_COVERAGE');
  if (unknownSize > 0) reasons.push('SOME_MARKET_CAP_BUCKETS_UNKNOWN_AFTER_FREEZE');
  if (challengerSizeEvidenceIncomplete) reasons.push('CHALLENGER_MEGA_SHARE_NOT_FULLY_AUDITABLE');

  let state: T0State = 'PASS_SIZE_NEUTRAL_DISCOVERY';
  if (explicitBias || megaCapLimitBreached) state = 'DISCOVERY_BIAS_DETECTED';
  else if (challengerSizeEvidenceIncomplete) state = 'EVIDENCE_PENDING';
  else if (challengerMode && coverageInsufficient) state = 'COVERAGE_INSUFFICIENT';
  else if (reasons.length > 0) state = 'PASS_WITH_COVERAGE_WARNING';

  const downstreamAuthorized = state === 'PASS_SIZE_NEUTRAL_DISCOVERY' || state === 'PASS_WITH_COVERAGE_WARNING';

  return {
    state,
    mode,
    downstreamAuthorized,
    requiredAction: actionForState(state),
    directScoreContribution: 0,
    marketCapContribution: 0,
    indexMembershipContribution: 0,
    analystCoverageContribution: 0,
    brandFamiliarityContribution: 0,
    rawDataAvailabilityContribution: 0,
    firstTrancheSize: tranche.length,
    firstTrancheMegaShare: megaShare,
    bucketCounts,
    audit,
    reasons,
  };
}

export interface T0PostGateEvidenceScore {
  ticker: string;
  evidenceScore: number;
}

export function rankAfterT0(scores: T0PostGateEvidenceScore[]): T0PostGateEvidenceScore[] {
  return [...scores]
    .filter((row) => Number.isFinite(row.evidenceScore))
    .sort((a, b) => b.evidenceScore - a.evidenceScore || a.ticker.localeCompare(b.ticker));
}
