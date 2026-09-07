import {
  publicationIsPitSafe,
  validConfidence,
  type ISO8601,
  type PointInTimeValue,
  type SecuritySnapshot,
} from '../governance/omega-data-integrity';
import {
  selectCapitalBlindPortfolioOmega,
  type CapitalBlindCandidate,
  type CapitalBlindSelectionPolicy,
  type CapitalBlindSelectionResult,
} from './capital-blind-portfolio-selection-omega';

export const POINT_ZERO_REBUILD_ENTRYPOINT_VERSION = '2026-09-07-v1.0.0' as const;

export type PitValidatedSnapshot = SecuritySnapshot & { readonly __pitValidated: true };

export type CandidateProjector = (snapshot: PitValidatedSnapshot, asOfTimestamp: ISO8601) => CapitalBlindCandidate;

export type PointZeroRebuildRequest = {
  asOfTimestamp: ISO8601;
  snapshots: SecuritySnapshot[];
  projectCandidate: CandidateProjector;
  policy?: CapitalBlindSelectionPolicy;
};

export type PointZeroRebuildResult = CapitalBlindSelectionResult & {
  asOfTimestamp: ISO8601;
  snapshotCount: number;
  pitValidatedSnapshotCount: number;
  entrypointVersion: typeof POINT_ZERO_REBUILD_ENTRYPOINT_VERSION;
};

function assertIsoTimestamp(value: string, code: string): number {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) throw new Error(code);
  return parsed;
}

function validatePitValue<T>(value: PointInTimeValue<T>, asOfTimestamp: ISO8601, field: string): void {
  if (!value.source?.trim()) throw new Error(`MISSING_PROVENANCE:${field}`);
  if (!validConfidence(value.confidence)) throw new Error(`INVALID_CONFIDENCE:${field}`);
  if (!publicationIsPitSafe(value.publicationTimestamp, asOfTimestamp)) {
    throw new Error(`PIT_UNSAFE:${field}`);
  }
  if (value.economicPeriodStart) assertIsoTimestamp(value.economicPeriodStart, `INVALID_ECONOMIC_PERIOD_START:${field}`);
  if (value.economicPeriodEnd) assertIsoTimestamp(value.economicPeriodEnd, `INVALID_ECONOMIC_PERIOD_END:${field}`);
}

function validateRecord(
  record: Record<string, PointInTimeValue<number>>,
  asOfTimestamp: ISO8601,
  prefix: string,
): void {
  for (const [key, value] of Object.entries(record)) validatePitValue(value, asOfTimestamp, `${prefix}.${key}`);
}

function validateRevisionRecord(
  record: Record<string, PointInTimeValue<number>[]>,
  asOfTimestamp: ISO8601,
  prefix: string,
): void {
  for (const [key, values] of Object.entries(record)) {
    for (const value of values) validatePitValue(value, asOfTimestamp, `${prefix}.${key}`);
  }
}

export function validateSecuritySnapshotAsOf(snapshot: SecuritySnapshot, asOfTimestamp: ISO8601): PitValidatedSnapshot {
  const asOf = assertIsoTimestamp(asOfTimestamp, 'INVALID_AS_OF_TIMESTAMP');
  const snapshotTime = assertIsoTimestamp(snapshot.timestamp, 'INVALID_SNAPSHOT_TIMESTAMP');
  if (snapshotTime > asOf) throw new Error('PIT_UNSAFE:SNAPSHOT_TIMESTAMP');

  if (!snapshot.identity?.issuerId?.trim()) throw new Error('MISSING_ISSUER_ID');
  if (!snapshot.identity?.securityId?.trim()) throw new Error('MISSING_SECURITY_ID');
  if (!snapshot.identity?.tickerAtTime?.trim()) throw new Error('MISSING_TICKER_AT_TIME');
  if (!snapshot.source?.trim()) throw new Error('MISSING_SNAPSHOT_PROVENANCE');
  if (!validConfidence(snapshot.confidence)) throw new Error('INVALID_SNAPSHOT_CONFIDENCE');

  validateRecord(snapshot.valuation, asOfTimestamp, 'valuation');
  validateRecord(snapshot.fundamentals, asOfTimestamp, 'fundamentals');
  validateRecord(snapshot.estimates, asOfTimestamp, 'estimates');
  validateRevisionRecord(snapshot.revisions, asOfTimestamp, 'revisions');
  snapshot.priceHistory.forEach((v, i) => validatePitValue(v, asOfTimestamp, `priceHistory.${i}`));
  validateRecord(snapshot.volatility, asOfTimestamp, 'volatility');
  validateRecord(snapshot.balanceSheet, asOfTimestamp, 'balanceSheet');
  validateRecord(snapshot.shareCount, asOfTimestamp, 'shareCount');
  validateRecord(snapshot.sbc, asOfTimestamp, 'sbc');

  for (const [index, action] of snapshot.corporateActions.entries()) {
    if (!action.source?.trim()) throw new Error(`MISSING_PROVENANCE:corporateActions.${index}`);
    if (!publicationIsPitSafe(action.publicationTimestamp, asOfTimestamp)) {
      throw new Error(`PIT_UNSAFE:corporateActions.${index}`);
    }
    assertIsoTimestamp(action.effectiveTimestamp, `INVALID_EFFECTIVE_TIMESTAMP:corporateActions.${index}`);
  }

  for (const [field, timestamp] of Object.entries(snapshot.lastUpdatedByField)) {
    const updated = assertIsoTimestamp(timestamp, `INVALID_LAST_UPDATE:${field}`);
    if (updated > asOf) throw new Error(`PIT_UNSAFE:lastUpdatedByField.${field}`);
  }

  return Object.assign(snapshot, { __pitValidated: true as const });
}

export function runCanonicalPointZeroRebuildOmega(request: PointZeroRebuildRequest): PointZeroRebuildResult {
  assertIsoTimestamp(request.asOfTimestamp, 'INVALID_AS_OF_TIMESTAMP');
  if (!Array.isArray(request.snapshots) || request.snapshots.length === 0) throw new Error('NO_SECURITY_SNAPSHOTS');
  if (typeof request.projectCandidate !== 'function') throw new Error('MISSING_CANDIDATE_PROJECTOR');

  const validated = request.snapshots.map(snapshot => validateSecuritySnapshotAsOf(snapshot, request.asOfTimestamp));
  const candidates = validated.map(snapshot => request.projectCandidate(snapshot, request.asOfTimestamp));
  const selection = selectCapitalBlindPortfolioOmega(candidates, request.policy ?? {});

  return {
    ...selection,
    asOfTimestamp: request.asOfTimestamp,
    snapshotCount: request.snapshots.length,
    pitValidatedSnapshotCount: validated.length,
    entrypointVersion: POINT_ZERO_REBUILD_ENTRYPOINT_VERSION,
  };
}
