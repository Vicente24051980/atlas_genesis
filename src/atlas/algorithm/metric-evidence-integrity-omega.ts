export type MetricAccountingBasis =
  | 'GAAP'
  | 'NON_GAAP'
  | 'IFRS'
  | 'STATUTORY'
  | 'ADJUSTED'
  | 'OTHER';

export type MetricEvidenceSource = {
  sourceId: string;
  sourceType?: string;
  uri?: string;
  publisher?: string;
};

export type MetricEvidenceInput = {
  metricName: string;
  value: unknown;
  periodEnd?: string;
  accountingBasis?: MetricAccountingBasis;
  observedAt?: string;
  availableAt: string;
  decisionAsOf: string;
  source?: MetricEvidenceSource;
};

export type MetricEvidenceBlockReason =
  | 'SOURCE_MISSING'
  | 'INVALID_AVAILABLE_AT'
  | 'INVALID_DECISION_AS_OF'
  | 'INVALID_OBSERVED_AT'
  | 'INVALID_PERIOD_END'
  | 'LOOK_AHEAD_BLOCKED'
  | 'TEMPORAL_INCONSISTENCY'
  | 'EPS_ACCOUNTING_BASIS_AMBIGUOUS';

export type MetricEvidenceIntegrityResult = {
  status: 'ACCEPTED' | 'BLOCKED';
  reasons: MetricEvidenceBlockReason[];
  resolvedAccountingBasis?: MetricAccountingBasis;
};

export const METRIC_EVIDENCE_INTEGRITY_OMEGA = {
  version: '2026-09-19-v3.4-extension',
  parentAuthority: 'PROMPT_MAESTRO_ATLAS_OMEGA_V3_4_SIMPLIFIED_CORE',
  role: 'TRANSVERSAL_EVIDENCE_GUARDRAIL',
  directScoreWeight: 0,
  buySellAuthority: false,
  createsEngine: false,
  createsGate: false,
  failClosed: true,
} as const;

function parseInstant(value: string | undefined): number | null {
  if (!value?.trim()) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isEpsMetric(metricName: string): boolean {
  const normalized = metricName.trim().toUpperCase().replace(/[_-]+/g, ' ');
  return /(^|\s)EPS($|\s)/.test(normalized) || normalized.includes('EARNINGS PER SHARE');
}

function inferExplicitBasis(metricName: string): MetricAccountingBasis | undefined {
  const normalized = metricName.trim().toUpperCase().replace(/[_-]+/g, ' ');
  if (/\bNON\s+GAAP\b/.test(normalized)) return 'NON_GAAP';
  if (/\bADJUSTED\b/.test(normalized)) return 'ADJUSTED';
  if (/\bIFRS\b/.test(normalized)) return 'IFRS';
  if (/\bGAAP\b/.test(normalized)) return 'GAAP';
  if (/\bSTATUTORY\b/.test(normalized)) return 'STATUTORY';
  return undefined;
}

export function validateMetricEvidenceIntegrity(
  input: MetricEvidenceInput,
): MetricEvidenceIntegrityResult {
  const reasons: MetricEvidenceBlockReason[] = [];

  if (!input.source?.sourceId?.trim()) {
    reasons.push('SOURCE_MISSING');
  }

  const availableAt = parseInstant(input.availableAt);
  const decisionAsOf = parseInstant(input.decisionAsOf);
  const observedAt = parseInstant(input.observedAt);
  const periodEnd = parseInstant(input.periodEnd);

  if (availableAt === null) reasons.push('INVALID_AVAILABLE_AT');
  if (decisionAsOf === null) reasons.push('INVALID_DECISION_AS_OF');
  if (input.observedAt !== undefined && observedAt === null) reasons.push('INVALID_OBSERVED_AT');
  if (input.periodEnd !== undefined && periodEnd === null) reasons.push('INVALID_PERIOD_END');

  if (availableAt !== null && decisionAsOf !== null && availableAt > decisionAsOf) {
    reasons.push('LOOK_AHEAD_BLOCKED');
  }

  if (observedAt !== null && availableAt !== null && observedAt > availableAt) {
    reasons.push('TEMPORAL_INCONSISTENCY');
  }

  if (periodEnd !== null && availableAt !== null && periodEnd > availableAt) {
    reasons.push('TEMPORAL_INCONSISTENCY');
  }

  const resolvedAccountingBasis = input.accountingBasis ?? inferExplicitBasis(input.metricName);

  if (isEpsMetric(input.metricName) && resolvedAccountingBasis === undefined) {
    reasons.push('EPS_ACCOUNTING_BASIS_AMBIGUOUS');
  }

  return {
    status: reasons.length === 0 ? 'ACCEPTED' : 'BLOCKED',
    reasons: Array.from(new Set(reasons)),
    ...(resolvedAccountingBasis ? { resolvedAccountingBasis } : {}),
  };
}
