export type MetricAccountingBasis =
  | 'GAAP'
  | 'NON_GAAP'
  | 'IFRS'
  | 'STATUTORY'
  | 'ADJUSTED'
  | 'MANAGEMENT_DEFINED'
  | 'CONSENSUS_NORMALIZED'
  | 'NOT_APPLICABLE'
  | 'OTHER'
  | 'UNKNOWN';

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
  availableAt?: string;
  decisionAsOf: string;
  source?: MetricEvidenceSource;
};

export type MetricEvidenceBlockReason =
  | 'METRIC_VALUE_MISSING'
  | 'SOURCE_MISSING'
  | 'AVAILABLE_AT_MISSING'
  | 'INVALID_AVAILABLE_AT'
  | 'INVALID_DECISION_AS_OF'
  | 'INVALID_OBSERVED_AT'
  | 'INVALID_PERIOD_END'
  | 'LOOK_AHEAD_BLOCKED'
  | 'ACCOUNTING_BASIS_AMBIGUOUS';

export type MetricEvidenceIntegrityResult = {
  status: 'ACCEPTED' | 'BLOCKED';
  reasons: MetricEvidenceBlockReason[];
  resolvedAccountingBasis?: MetricAccountingBasis;
};

export const METRIC_EVIDENCE_INTEGRITY_OMEGA = {
  version: '2026-09-19-v3.4-extension-r2',
  parentAuthority: 'PROMPT_MAESTRO_ATLAS_OMEGA_V3_4_SIMPLIFIED_CORE',
  role: 'TRANSVERSAL_EVIDENCE_GUARDRAIL',
  canonicalTuple: ['METRIC_VALUE', 'ACCOUNTING_BASIS', 'SOURCE', 'AVAILABLE_AT'],
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

function normalizeMetricName(metricName: string): string {
  return metricName.trim().toUpperCase().replace(/[_-]+/g, ' ');
}

function inferExplicitBasis(metricName: string): MetricAccountingBasis | undefined {
  const normalized = normalizeMetricName(metricName);
  if (/\bNON\s+GAAP\b/.test(normalized)) return 'NON_GAAP';
  if (/\bADJUSTED\b/.test(normalized)) return 'ADJUSTED';
  if (/\bIFRS\b/.test(normalized)) return 'IFRS';
  if (/\bGAAP\b/.test(normalized)) return 'GAAP';
  if (/\bSTATUTORY\b/.test(normalized)) return 'STATUTORY';
  return undefined;
}

function isAccountingSensitive(metricName: string): boolean {
  const normalized = normalizeMetricName(metricName);
  return /(^|\s)(EPS|EARNINGS PER SHARE|REVENUE|NET INCOME|OPERATING INCOME|EBITDA|EBIT|GROSS PROFIT|OPERATING CASH FLOW|OCF|FREE CASH FLOW|FCF|MARGIN|ROIC|ROE)(\s|$)/.test(normalized);
}

function metricValueMissing(value: unknown): boolean {
  return value === null || value === undefined || value === '';
}

export function validateMetricEvidenceIntegrity(
  input: MetricEvidenceInput,
): MetricEvidenceIntegrityResult {
  const reasons: MetricEvidenceBlockReason[] = [];

  if (metricValueMissing(input.value)) reasons.push('METRIC_VALUE_MISSING');
  if (!input.source?.sourceId?.trim()) reasons.push('SOURCE_MISSING');
  if (!input.availableAt?.trim()) reasons.push('AVAILABLE_AT_MISSING');

  const availableAt = parseInstant(input.availableAt);
  const decisionAsOf = parseInstant(input.decisionAsOf);
  const observedAt = parseInstant(input.observedAt);
  const periodEnd = parseInstant(input.periodEnd);

  if (input.availableAt?.trim() && availableAt === null) reasons.push('INVALID_AVAILABLE_AT');
  if (decisionAsOf === null) reasons.push('INVALID_DECISION_AS_OF');
  if (input.observedAt !== undefined && observedAt === null) reasons.push('INVALID_OBSERVED_AT');
  if (input.periodEnd !== undefined && periodEnd === null) reasons.push('INVALID_PERIOD_END');

  if (availableAt !== null && decisionAsOf !== null && availableAt > decisionAsOf) {
    reasons.push('LOOK_AHEAD_BLOCKED');
  }

  // observedAt is retrieval/observation time and may legitimately be later than
  // availableAt. If original public availability cannot be independently
  // verified, adapters must conservatively set availableAt = observedAt.
  // periodEnd may also be later than availableAt for forward estimates, so it
  // is validated syntactically here but is not treated as a PIT contradiction.

  const resolvedAccountingBasis = input.accountingBasis ?? inferExplicitBasis(input.metricName);

  if (
    isAccountingSensitive(input.metricName) &&
    (resolvedAccountingBasis === undefined || resolvedAccountingBasis === 'UNKNOWN')
  ) {
    reasons.push('ACCOUNTING_BASIS_AMBIGUOUS');
  }

  return {
    status: reasons.length === 0 ? 'ACCEPTED' : 'BLOCKED',
    reasons: Array.from(new Set(reasons)),
    ...(resolvedAccountingBasis ? { resolvedAccountingBasis } : {}),
  };
}
