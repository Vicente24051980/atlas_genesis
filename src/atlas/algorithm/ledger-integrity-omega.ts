import { createHash } from 'node:crypto';

export const LEDGER_INTEGRITY_OMEGA_VERSION = '2026-09-05-v1.0.0' as const;

export type ThresholdOperator = 'LT' | 'LTE' | 'GT' | 'GTE';
export type GammaLedgerSeverity = 'NORMAL' | 'CRITICAL';

export interface GammaV12Falsifier {
  falsifierId: string;
  ticker: string;
  metric: string;
  operator: ThresholdOperator;
  baseline: number;
  baselineSource: string;
  baselinePeriodEnd: string;
  baselineIsLatestPublishedPeriod: boolean;
  amber: number;
  red: number;
  window: string;
  weight: number;
  severity: GammaLedgerSeverity;
  sealedAt: string;
  sourceVersion: string;
}

export type GammaIngestionCode =
  | 'ACCEPT'
  | 'THRESHOLD_ALREADY_BREACHED'
  | 'BASELINE_NON_STANDARD'
  | 'INVALID_THRESHOLD_ORDER'
  | 'INVALID_DEFINITION';

export interface GammaIngestionResult {
  accepted: boolean;
  code: GammaIngestionCode;
  sealedPayloadHash: string | null;
  reasons: string[];
}

const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const validIso = (value: string): boolean => Number.isFinite(Date.parse(value));

function isAmberBreached(operator: ThresholdOperator, baseline: number, amber: number): boolean {
  if (operator === 'LT') return baseline < amber;
  if (operator === 'LTE') return baseline <= amber;
  if (operator === 'GT') return baseline > amber;
  return baseline >= amber;
}

function thresholdsOrdered(operator: ThresholdOperator, amber: number, red: number): boolean {
  // For falling metrics, RED must be beyond AMBER on the downside. For rising-risk metrics, the reverse.
  return operator === 'LT' || operator === 'LTE' ? red < amber : red > amber;
}

function normalizeForCanonicalJson(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalizeForCanonicalJson);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, item]) => [key, normalizeForCanonicalJson(item)]),
    );
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('Non-finite number cannot be canonically serialized.');
    return Number(value.toString());
  }
  return value;
}

export function canonicalJson(value: unknown): string {
  return JSON.stringify(normalizeForCanonicalJson(value));
}

export function sha256Canonical(value: unknown): string {
  return createHash('sha256').update(canonicalJson(value), 'utf8').digest('hex');
}

export function gammaSealPayload(definition: GammaV12Falsifier): Record<string, unknown> {
  return {
    amber: definition.amber,
    baseline: definition.baseline,
    baselinePeriodEnd: definition.baselinePeriodEnd,
    baselineSource: definition.baselineSource,
    falsifierId: definition.falsifierId,
    metric: definition.metric,
    operator: definition.operator,
    red: definition.red,
    sealedAt: definition.sealedAt,
    severity: definition.severity,
    sourceVersion: definition.sourceVersion,
    ticker: definition.ticker,
    weight: definition.weight,
    window: definition.window,
  };
}

export function validateGammaV12Ingestion(definition: GammaV12Falsifier): GammaIngestionResult {
  const requiredStrings = [definition.falsifierId, definition.ticker, definition.metric, definition.baselineSource,
    definition.window, definition.sourceVersion];
  const structurallyValid = requiredStrings.every((x) => x.trim().length > 0)
    && finite(definition.baseline) && finite(definition.amber) && finite(definition.red) && finite(definition.weight)
    && definition.weight > 0 && definition.weight <= 1
    && validIso(definition.baselinePeriodEnd) && validIso(definition.sealedAt);
  if (!structurallyValid) {
    return { accepted: false, code: 'INVALID_DEFINITION', sealedPayloadHash: null, reasons: ['Definition is incomplete or non-finite.'] };
  }
  if (!definition.baselineIsLatestPublishedPeriod) {
    return { accepted: false, code: 'BASELINE_NON_STANDARD', sealedPayloadHash: null,
      reasons: ['Baseline must be the latest published period available at seal time.'] };
  }
  if (!thresholdsOrdered(definition.operator, definition.amber, definition.red)) {
    return { accepted: false, code: 'INVALID_THRESHOLD_ORDER', sealedPayloadHash: null,
      reasons: ['RED must represent more severe deterioration than AMBER for the selected operator.'] };
  }
  if (isAmberBreached(definition.operator, definition.baseline, definition.amber)) {
    return { accepted: false, code: 'THRESHOLD_ALREADY_BREACHED', sealedPayloadHash: null,
      reasons: ['Baseline already crosses AMBER at seal time; Γ may not manufacture historical deterioration.'] };
  }
  return { accepted: true, code: 'ACCEPT', sealedPayloadHash: sha256Canonical(gammaSealPayload(definition)), reasons: [] };
}

export function gammaWeightsHash(definitions: readonly GammaV12Falsifier[]): string {
  const rows = definitions.map((x) => ({ falsifierId: x.falsifierId, weight: x.weight })).sort((a, b) => a.falsifierId.localeCompare(b.falsifierId));
  return sha256Canonical(rows);
}

export function verifyGammaWeights(definitions: readonly GammaV12Falsifier[], sealedWeightsHash: string): 'WEIGHTS_OK' | 'WEIGHTS_TAMPERED' {
  return gammaWeightsHash(definitions) === sealedWeightsHash ? 'WEIGHTS_OK' : 'WEIGHTS_TAMPERED';
}

export interface HashChainEvent {
  seq: number;
  stream: 'GAMMA' | 'KAPPA';
  eventType: string;
  aggregateId: string;
  payload: Record<string, unknown>;
  sealedAt: string;
  prevHash: string;
  recordHash: string;
}

export function expectedRecordHash(event: Omit<HashChainEvent, 'recordHash'>): string {
  return sha256Canonical({
    aggregateId: event.aggregateId,
    eventType: event.eventType,
    payload: event.payload,
    prevHash: event.prevHash,
    sealedAt: event.sealedAt,
    seq: event.seq,
    stream: event.stream,
  });
}

export function verifyHashChain(events: readonly HashChainEvent[], genesisHash = 'GENESIS'): 'LEDGER_OK' | 'LEDGER_TAMPERED' {
  const ordered = [...events].sort((a, b) => a.seq - b.seq);
  let previous = genesisHash;
  for (const event of ordered) {
    if (event.prevHash !== previous) return 'LEDGER_TAMPERED';
    const { recordHash, ...withoutHash } = event;
    if (recordHash !== expectedRecordHash(withoutHash)) return 'LEDGER_TAMPERED';
    previous = recordHash;
  }
  return 'LEDGER_OK';
}

export type KappaEventType = 'CASE_SEALED' | 'CASE_RESOLVED' | 'CASE_INVALIDATED' | 'CASE_REISSUED';

export interface KappaCaseSealedPayload {
  caseId: string;
  ticker: string;
  claim: string;
  claimType: string;
  probability: number;
  horizonEnd: string;
  horizonClass: string;
  resolutionCriteria: string;
  resolutionSource: string;
  emitterVersion: string;
  replacesCaseId?: string | null;
}

export function validateKappaCase(payload: KappaCaseSealedPayload): string[] {
  const reasons: string[] = [];
  if (!payload.caseId.trim() || !payload.ticker.trim() || !payload.claim.trim() || !payload.claimType.trim()) reasons.push('Missing identity/claim fields.');
  if (!(payload.probability > 0 && payload.probability < 1)) reasons.push('Probability must be strictly between 0 and 1.');
  if (!validIso(payload.horizonEnd)) reasons.push('Invalid horizon end date.');
  if (!payload.horizonClass.trim() || !payload.resolutionCriteria.trim() || !payload.resolutionSource.trim() || !payload.emitterVersion.trim()) reasons.push('Missing immutable calibration metadata.');
  return reasons;
}

export interface OmegaNEPolicy {
  policyId: string;
  maxEquityWeight: number;
  escalationAfterConsecutiveQuarters: number;
}

export const OMEGA_NE_POLICY_V1: OmegaNEPolicy = {
  policyId: 'OMEGA_NE_V1_2026-09-05',
  maxEquityWeight: 0.02,
  escalationAfterConsecutiveQuarters: 2,
};

export function applyOmegaNE(vOmegaState: 'MEDIBLE' | 'NO_EVALUABLE', consecutiveOpaqueQuarters: number, policy = OMEGA_NE_POLICY_V1) {
  if (vOmegaState === 'MEDIBLE') return { qualityPenalty: 0 as const, hardMaxWeight: null, excludeVOmegaFromUtility: false, escalateToXi: false };
  return {
    qualityPenalty: 0 as const,
    hardMaxWeight: policy.maxEquityWeight,
    excludeVOmegaFromUtility: true,
    escalateToXi: consecutiveOpaqueQuarters >= policy.escalationAfterConsecutiveQuarters,
  };
}

export type EntityIdentityState = 'VERIFIED' | 'ENTITY_IDENTITY_NOT_VERIFIED';
export function gammaEligibility(identity: EntityIdentityState, evidenceEvaluable: boolean): 'ELIGIBLE' | 'NO_EVALUABLE' | 'BLOCKED_IDENTITY' {
  if (identity !== 'VERIFIED') return 'BLOCKED_IDENTITY';
  return evidenceEvaluable ? 'ELIGIBLE' : 'NO_EVALUABLE';
}
