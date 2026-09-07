export const OMEGA_DATA_CONTRACT_VERSION = '2026-09-07-v1.0.0' as const;
export type ISO8601 = string;

export type PointInTimeValue<T> = {
  value: T;
  economicPeriodStart?: ISO8601;
  economicPeriodEnd?: ISO8601;
  publicationTimestamp: ISO8601;
  source: string;
  confidence: number;
};

export type SecurityIdentity = {
  issuerId: string;
  securityId: string;
  tickerAtTime: string;
  shareClass?: string;
  exchange?: string;
  cusip?: string;
  isin?: string;
};

export type CorporateAction = {
  type: 'SPLIT' | 'REVERSE_SPLIT' | 'SPIN_OFF' | 'MERGER' | 'TICKER_CHANGE' | 'SHARE_CLASS_CONVERSION' | 'RIGHTS' | 'SPECIAL_DIVIDEND' | 'ADR_RATIO_CHANGE' | 'DELISTING';
  effectiveTimestamp: ISO8601;
  publicationTimestamp: ISO8601;
  source: string;
};

export interface SecuritySnapshot {
  schemaVersion: typeof OMEGA_DATA_CONTRACT_VERSION;
  identity: SecurityIdentity;
  timestamp: ISO8601;
  reportingCurrency: string;
  securityCurrency: string;
  portfolioBaseCurrency: string;
  source: string;
  valuation: Record<string, PointInTimeValue<number>>;
  fundamentals: Record<string, PointInTimeValue<number>>;
  estimates: Record<string, PointInTimeValue<number>>;
  revisions: Record<string, PointInTimeValue<number>[]>;
  priceHistory: PointInTimeValue<number>[];
  volatility: Record<string, PointInTimeValue<number>>;
  balanceSheet: Record<string, PointInTimeValue<number>>;
  shareCount: Record<string, PointInTimeValue<number>>;
  sbc: Record<string, PointInTimeValue<number>>;
  corporateActions: CorporateAction[];
  confidence: number;
  missingFields: string[];
  lastUpdatedByField: Record<string, ISO8601>;
}

export function validConfidence(x: number): boolean {
  return Number.isFinite(x) && x >= 0 && x <= 1;
}

export function availableAsOf<T>(values: PointInTimeValue<T>[], asOfTimestamp: ISO8601): PointInTimeValue<T>[] {
  const asOf = Date.parse(asOfTimestamp);
  if (!Number.isFinite(asOf)) throw new Error('INVALID_AS_OF_TIMESTAMP');
  return values.filter(v => {
    const published = Date.parse(v.publicationTimestamp);
    return Number.isFinite(published) && published <= asOf;
  });
}

export function originalAvailableValue<T>(values: PointInTimeValue<T>[], asOfTimestamp: ISO8601): PointInTimeValue<T> | null {
  return availableAsOf(values, asOfTimestamp).sort((a, b) => Date.parse(a.publicationTimestamp) - Date.parse(b.publicationTimestamp))[0] ?? null;
}

export function latestAvailableValue<T>(values: PointInTimeValue<T>[], asOfTimestamp: ISO8601): PointInTimeValue<T> | null {
  return availableAsOf(values, asOfTimestamp).sort((a, b) => Date.parse(b.publicationTimestamp) - Date.parse(a.publicationTimestamp))[0] ?? null;
}

export function publicationIsPitSafe(publicationTimestamp: ISO8601, asOfTimestamp: ISO8601): boolean {
  const publication = Date.parse(publicationTimestamp);
  const asOf = Date.parse(asOfTimestamp);
  return Number.isFinite(publication) && Number.isFinite(asOf) && publication <= asOf;
}

export function freshnessAgeMs(lastUpdate: ISO8601, asOfTimestamp: ISO8601): number {
  const last = Date.parse(lastUpdate);
  const asOf = Date.parse(asOfTimestamp);
  if (!Number.isFinite(last) || !Number.isFinite(asOf)) throw new Error('INVALID_TIMESTAMP');
  return asOf - last;
}

export function convertLocalReturnToBase(localReturn: number, fxStart: number, fxEnd: number): number {
  if (![localReturn, fxStart, fxEnd].every(Number.isFinite) || fxStart <= 0 || fxEnd <= 0) throw new Error('INVALID_FX_INPUT');
  return (1 + localReturn) * (fxEnd / fxStart) - 1;
}

export function propagatedConfidence(values: number[]): number {
  if (values.length === 0 || values.some(v => !validConfidence(v))) return 0;
  return values.reduce((product, v) => product * v, 1) ** (1 / values.length);
}

export type UncertainEstimate = { mean: number; standardDeviation: number; confidence: number };

export function conservativeEstimate(x: UncertainEstimate, z = 1): number {
  if (![x.mean, x.standardDeviation, z].every(Number.isFinite) || x.standardDeviation < 0 || !validConfidence(x.confidence)) throw new Error('INVALID_UNCERTAIN_ESTIMATE');
  return x.mean - z * x.standardDeviation;
}
