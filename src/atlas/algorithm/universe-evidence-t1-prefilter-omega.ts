export type EvidenceGrade = 'VERIFIED_PRIMARY' | 'VERIFIED_SECONDARY' | 'PROXY' | 'MISSING';

export type T1ReasonCode =
  | 'IDENTITY_NOT_VERIFIED'
  | 'SOLVENCY_EVIDENCE_MISSING'
  | 'SOLVENCY_HARD_FAIL'
  | 'THROUGHPUT_EVIDENCE_MISSING'
  | 'THROUGHPUT_HARD_FAIL'
  | 'CASH_CONVERSION_EVIDENCE_MISSING'
  | 'CASH_CONVERSION_HARD_FAIL'
  | 'REFINANCING_EVIDENCE_MISSING'
  | 'REFINANCING_HARD_FAIL'
  | 'DISCLOSURE_EVIDENCE_MISSING'
  | 'DISCLOSURE_HARD_FAIL'
  | 'THESIS_IDENTITY_MISSING'
  | 'AI_FINANCING_QUALITY_REQUIRED'
  | 'AI_CIRCULAR_DEMAND_REQUIRED'
  | 'POINT_ZERO_PRESERVED';

export type T1State = 'SURVIVOR' | 'EVIDENCE_PENDING' | 'HARD_GATE_FAIL';

export interface EvidenceDatum<T> {
  value: T | null;
  grade: EvidenceGrade;
  sourceId?: string | null;
  asOf?: string | null;
}

export interface T1UniverseEvidence {
  ticker: string;
  economicEntityId: string;
  identityVerified: boolean;
  thesisIdentity?: string | null;
  aiCapexLinked: boolean;

  goingConcernSafe: EvidenceDatum<boolean>;
  positiveEconomicThroughputOrVerifiedInflection: EvidenceDatum<boolean>;
  cashConversionVisible: EvidenceDatum<boolean>;
  refinancingFragilityAcceptable: EvidenceDatum<boolean>;
  accountingDisclosureIntegrityAcceptable: EvidenceDatum<boolean>;

  financingQualityCompleted?: boolean;
  circularDemandCompleted?: boolean;

  // Explicitly present for audit only. They carry zero authority in T1.
  marketCapUsd?: number | null;
  indexMembership?: string[];
  currentHolding?: boolean;
  personalCapitalEur?: number | null;
}

export interface T1Result {
  ticker: string;
  economicEntityId: string;
  state: T1State;
  directScoreContribution: 0;
  pointZeroPreserved: true;
  downstreamFundamentalScoringAuthorized: boolean;
  reasons: T1ReasonCode[];
  evidenceGrades: Record<string, EvidenceGrade>;
}

export const UNIVERSE_EVIDENCE_T1_PREFILTER_OMEGA_V1 = {
  id: 'UNIVERSE_EVIDENCE_T1_PREFILTER_OMEGA_V1',
  status: 'CANONICAL_PREFILTER',
  directScoreContribution: 0 as const,
  invariants: [
    'T0-clean discovery precedes T1.',
    'Every company remains at Point Zero through T1.',
    'Missing evidence is EVIDENCE_PENDING, never an inferred pass or fail.',
    'Market cap, index membership, fame, incumbent status and personal capital have zero authority.',
    'A hard fail requires verified evidence, not proxy or missing evidence.',
    'AI-CAPEX-linked names cannot proceed to fundamental score until Financing Quality and Circular Demand are complete.',
    'T1 has no BUY/SELL, portfolio-membership, sizing or timing authority.',
  ] as const,
} as const;

const VERIFIED = new Set<EvidenceGrade>(['VERIFIED_PRIMARY', 'VERIFIED_SECONDARY']);
const isVerified = (datum: EvidenceDatum<unknown>): boolean => VERIFIED.has(datum.grade);
const isMissingForDecision = (datum: EvidenceDatum<unknown>): boolean =>
  datum.grade === 'MISSING' || datum.grade === 'PROXY' || datum.value === null;

function gradeMap(e: T1UniverseEvidence): Record<string, EvidenceGrade> {
  return {
    goingConcernSafe: e.goingConcernSafe.grade,
    positiveEconomicThroughputOrVerifiedInflection: e.positiveEconomicThroughputOrVerifiedInflection.grade,
    cashConversionVisible: e.cashConversionVisible.grade,
    refinancingFragilityAcceptable: e.refinancingFragilityAcceptable.grade,
    accountingDisclosureIntegrityAcceptable: e.accountingDisclosureIntegrityAcceptable.grade,
  };
}

export function evaluateT1UniverseEvidence(e: T1UniverseEvidence): T1Result {
  const reasons: T1ReasonCode[] = ['POINT_ZERO_PRESERVED'];
  const hardFails: T1ReasonCode[] = [];
  const pending: T1ReasonCode[] = [];

  if (!e.identityVerified || !e.economicEntityId.trim()) pending.push('IDENTITY_NOT_VERIFIED');
  if (!e.thesisIdentity?.trim()) pending.push('THESIS_IDENTITY_MISSING');

  const checks: Array<{
    datum: EvidenceDatum<boolean>;
    pending: T1ReasonCode;
    fail: T1ReasonCode;
  }> = [
    { datum: e.goingConcernSafe, pending: 'SOLVENCY_EVIDENCE_MISSING', fail: 'SOLVENCY_HARD_FAIL' },
    {
      datum: e.positiveEconomicThroughputOrVerifiedInflection,
      pending: 'THROUGHPUT_EVIDENCE_MISSING',
      fail: 'THROUGHPUT_HARD_FAIL',
    },
    { datum: e.cashConversionVisible, pending: 'CASH_CONVERSION_EVIDENCE_MISSING', fail: 'CASH_CONVERSION_HARD_FAIL' },
    { datum: e.refinancingFragilityAcceptable, pending: 'REFINANCING_EVIDENCE_MISSING', fail: 'REFINANCING_HARD_FAIL' },
    {
      datum: e.accountingDisclosureIntegrityAcceptable,
      pending: 'DISCLOSURE_EVIDENCE_MISSING',
      fail: 'DISCLOSURE_HARD_FAIL',
    },
  ];

  for (const check of checks) {
    if (isMissingForDecision(check.datum)) {
      pending.push(check.pending);
      continue;
    }
    if (isVerified(check.datum) && check.datum.value === false) hardFails.push(check.fail);
  }

  if (e.aiCapexLinked) {
    if (!e.financingQualityCompleted) pending.push('AI_FINANCING_QUALITY_REQUIRED');
    if (!e.circularDemandCompleted) pending.push('AI_CIRCULAR_DEMAND_REQUIRED');
  }

  if (hardFails.length > 0) {
    return {
      ticker: e.ticker,
      economicEntityId: e.economicEntityId,
      state: 'HARD_GATE_FAIL',
      directScoreContribution: 0,
      pointZeroPreserved: true,
      downstreamFundamentalScoringAuthorized: false,
      reasons: [...reasons, ...hardFails, ...pending],
      evidenceGrades: gradeMap(e),
    };
  }

  if (pending.length > 0) {
    return {
      ticker: e.ticker,
      economicEntityId: e.economicEntityId,
      state: 'EVIDENCE_PENDING',
      directScoreContribution: 0,
      pointZeroPreserved: true,
      downstreamFundamentalScoringAuthorized: false,
      reasons: [...reasons, ...pending],
      evidenceGrades: gradeMap(e),
    };
  }

  return {
    ticker: e.ticker,
    economicEntityId: e.economicEntityId,
    state: 'SURVIVOR',
    directScoreContribution: 0,
    pointZeroPreserved: true,
    downstreamFundamentalScoringAuthorized: true,
    reasons,
    evidenceGrades: gradeMap(e),
  };
}

export interface T1BatchSummary {
  total: number;
  survivors: number;
  evidencePending: number;
  hardGateFails: number;
  results: T1Result[];
}

export function evaluateT1Batch(rows: readonly T1UniverseEvidence[]): T1BatchSummary {
  const results = rows.map(evaluateT1UniverseEvidence);
  return {
    total: results.length,
    survivors: results.filter((x) => x.state === 'SURVIVOR').length,
    evidencePending: results.filter((x) => x.state === 'EVIDENCE_PENDING').length,
    hardGateFails: results.filter((x) => x.state === 'HARD_GATE_FAIL').length,
    results,
  };
}
