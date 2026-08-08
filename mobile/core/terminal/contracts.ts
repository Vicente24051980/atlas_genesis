export type EvidenceValidationState = 'VERIFIED_FACT' | 'PENDING_PRIMARY_VALIDATION' | 'DISCARDED';
export type ThesisState = 'INTACT' | 'WATCH' | 'UNDER_REVIEW' | 'FALSIFIED';
export type SignalSeverity = 'NORMAL' | 'WATCH' | 'ELEVATED' | 'CRITICAL';
export type MarketSession = 'PREMARKET' | 'REGULAR' | 'AFTER_HOURS' | 'CLOSED' | 'UNKNOWN';

export type CanonicalSecurity = {
  canonicalTicker: string;
  companyName: string;
  exchange?: string;
  mic?: string;
  isin?: string;
  country?: string;
  sector?: string;
  industry?: string;
  currency?: string;
};

export type MarketQuote = {
  provider: string;
  session: MarketSession;
  price: number | null;
  changePct: number | null;
  marketCap?: number | null;
  volume?: number | null;
  observedAt: string;
  raw?: unknown;
};

export interface MarketDataProvider {
  readonly providerId: string;
  resolveSecurity(ticker: string): Promise<CanonicalSecurity>;
  getQuote(security: CanonicalSecurity): Promise<MarketQuote>;
}

export type EngineName =
  | 'SCREENER'
  | 'BUSINESS_QUALITY'
  | 'GROWTH'
  | 'VALUATION'
  | 'RISK'
  | 'MOMENTUM'
  | 'OPPORTUNITY'
  | 'CAPITAL_ALLOCATION'
  | 'CONVICTION'
  | 'FLOW'
  | 'WAVE'
  | 'DOWNSIDE_ALERT'
  | 'THESIS_IMPACT';

export type EngineResultContract = {
  engine: EngineName;
  score: number | null;
  state: string;
  algorithmVersion: string;
  inputs: Record<string, unknown>;
  explanation: Record<string, unknown>;
  evidenceRefs: string[];
};

export type AuditRequest = {
  security: CanonicalSecurity;
  requestedAt: string;
};

export type AuditResult = {
  algorithmVersion: string;
  status: 'PASS' | 'QUARANTINED' | 'REJECTED';
  inputs: Record<string, unknown>;
  results: EngineResultContract[];
  explanation: Record<string, unknown>;
};

export interface AtlasAuditEngine {
  run(request: AuditRequest): Promise<AuditResult>;
}

/**
 * Boundary rule: providers are sensors. They may populate market/fundamental inputs,
 * but they cannot mutate Evidence, Thesis or Conviction directly.
 */
export const TERMINAL_INVARIANTS = Object.freeze({
  marketDataIsSensor: true,
  evidenceIsSourceOfTruth: true,
  aiIsNeverEvidence: true,
  priceCannotMutateThesisDirectly: true,
  immutableAuditHistory: true,
});
