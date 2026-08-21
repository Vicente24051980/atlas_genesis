import type { GreenContinuityWindow } from './green-continuity-omega';

export type GreenProvider =
  | 'TRADINGVIEW'
  | 'YAHOO_FINANCE'
  | 'BARCHART'
  | 'INVESTING_COM'
  | 'TRADING212_USER_EVIDENCE';

export type GreenProviderObservation = {
  provider: GreenProvider;
  ticker: string;
  canonicalIdentifier: string;
  exchange: string;
  currency: string;
  window: GreenContinuityWindow;
  startDate: string;
  endDate: string;
  startRegularClose: number;
  endRegularClose: number;
  /** Provider-reported or previously computed return. Raw-close observations are always recomputed by ATLAS. */
  returnPct: number;
  corporateActionPolicy: 'SPLIT_ADJUSTED_DIVIDEND_UNADJUSTED';
  capturedAt: string;
  sourceRef: string;
  rawCloseDerived: boolean;
};

export type GreenProviderWindowConsensus = {
  window: GreenContinuityWindow;
  eligibleProviders: GreenProvider[];
  observations: GreenProviderObservation[];
  providerCount: number;
  coreProviderCount: number;
  brokerCrossCheckCount: number;
  signConsensus: boolean;
  consensusPositive: boolean | null;
  maxReturnDispersionPp: number | null;
  numericalConsensus: boolean;
  identityConsensus: boolean;
  startDateConsensus: boolean;
  brokerSignConflict: boolean;
  verified: boolean;
  reasons: string[];
};

export type GreenProviderQuorumInput = {
  ticker: string;
  expectedMarketCut: string;
  observations: GreenProviderObservation[];
  /** Canonical minimum is 3 core providers. Callers may make this stricter, never looser. */
  minimumProviders?: number;
  /** Canonical maximum is 0.25pp. Callers may make this stricter, never looser. */
  maxDispersionPp?: number;
};

export type GreenProviderQuorumResult = {
  ticker: string;
  engineId: typeof GREEN_PROVIDER_QUORUM_OMEGA.id;
  verified: boolean;
  allFiveVerified: boolean;
  windows: Record<GreenContinuityWindow, GreenProviderWindowConsensus>;
  providersUsed: GreenProvider[];
  reasons: string[];
};

export const GREEN_PROVIDER_QUORUM_OMEGA = {
  id: 'GREEN_PROVIDER_QUORUM_OMEGA_V1_1',
  name: 'GREEN Provider Quorum Ω v1.1',
  status: 'canonical',
  coreProviders: ['TRADINGVIEW', 'YAHOO_FINANCE', 'BARCHART', 'INVESTING_COM'] as const,
  optionalBrokerEvidence: 'TRADING212_USER_EVIDENCE' as const,
  minimumProviders: 3,
  maxDispersionPp: 0.25,
  normalizedReturnPolicy: 'SPLIT_ADJUSTED_DIVIDEND_UNADJUSTED',
  method: 'ATLAS recomputes every core-provider horizon from raw regular-session closes; provider-native performance labels are never authoritative.',
  constitutionalRules: [
    'No GREEN horizon is VERIFIED from a single provider.',
    'At least 3 CORE providers are required; Trading 212 user evidence never counts toward the 3-provider minimum.',
    'All core observations must share canonical identifier, exchange, currency, startDate and the exact expected regular-market endDate.',
    'ATLAS recomputes returnPct from raw regular-session closes under one corporate-action policy instead of trusting provider performance labels.',
    'Any core-provider sign disagreement quarantines the horizon regardless of majority size.',
    'Numerical dispersion beyond 0.25 percentage points quarantines the horizon until reconciled.',
    'Trading 212 user-visible evidence is an optional broker-side sign cross-check; if supplied on the same cut and it conflicts with core consensus, the horizon is quarantined.',
    'A complete GREEN classification requires all five horizons to pass this verification gate.',
  ] as const,
} as const;

const WINDOWS: GreenContinuityWindow[] = ['oneWeek', 'oneMonth', 'threeMonths', 'oneYear', 'total'];
const CORE_PROVIDER_SET = new Set<GreenProvider>(GREEN_PROVIDER_QUORUM_OMEGA.coreProviders);

function recomputeReturnPct(start: number, end: number): number {
  return ((end / start) - 1) * 100;
}

function finitePositive(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

function safeMinimumProviders(requested?: number): number {
  if (!Number.isInteger(requested)) return GREEN_PROVIDER_QUORUM_OMEGA.minimumProviders;
  return Math.max(GREEN_PROVIDER_QUORUM_OMEGA.minimumProviders, requested as number);
}

function safeMaxDispersion(requested?: number): number {
  if (!Number.isFinite(requested) || (requested as number) <= 0) return GREEN_PROVIDER_QUORUM_OMEGA.maxDispersionPp;
  return Math.min(GREEN_PROVIDER_QUORUM_OMEGA.maxDispersionPp, requested as number);
}

function identityKey(observation: GreenProviderObservation): string {
  return `${observation.canonicalIdentifier}|${observation.exchange}|${observation.currency}`;
}

function brokerSign(observation: GreenProviderObservation): boolean | null {
  if (observation.rawCloseDerived && finitePositive(observation.startRegularClose) && finitePositive(observation.endRegularClose)) {
    return recomputeReturnPct(observation.startRegularClose, observation.endRegularClose) > 0;
  }
  if (Number.isFinite(observation.returnPct)) return observation.returnPct > 0;
  return null;
}

export function evaluateGreenProviderQuorum(input: GreenProviderQuorumInput): GreenProviderQuorumResult {
  const minimumProviders = safeMinimumProviders(input.minimumProviders);
  const maxDispersionPp = safeMaxDispersion(input.maxDispersionPp);
  const topReasons: string[] = [];
  const windows = {} as Record<GreenContinuityWindow, GreenProviderWindowConsensus>;

  for (const window of WINDOWS) {
    const reasons: string[] = [];
    const seenCoreProviders = new Set<GreenProvider>();

    const coreEligible = input.observations.filter((observation) => {
      if (observation.window !== window) return false;
      if (observation.ticker !== input.ticker) return false;
      if (!CORE_PROVIDER_SET.has(observation.provider)) return false;
      if (observation.endDate !== input.expectedMarketCut) return false;
      if (observation.corporateActionPolicy !== GREEN_PROVIDER_QUORUM_OMEGA.normalizedReturnPolicy) return false;
      if (!observation.rawCloseDerived) return false;
      if (!finitePositive(observation.startRegularClose) || !finitePositive(observation.endRegularClose)) return false;
      if (seenCoreProviders.has(observation.provider)) return false;
      seenCoreProviders.add(observation.provider);
      return true;
    });

    const normalized = coreEligible.map((observation) => ({
      ...observation,
      returnPct: recomputeReturnPct(observation.startRegularClose, observation.endRegularClose),
    }));

    const coreProviderCount = normalized.length;
    const providerCount = coreProviderCount;
    if (coreProviderCount < minimumProviders) {
      reasons.push(`${window}: only ${coreProviderCount} eligible CORE provider(s); minimum is ${minimumProviders}.`);
    }

    const identityConsensus = normalized.length > 0 && new Set(normalized.map(identityKey)).size === 1;
    if (normalized.length > 0 && !identityConsensus) reasons.push(`${window}: canonical identifier/exchange/currency mismatch across core providers.`);

    const startDateConsensus = normalized.length > 0 && new Set(normalized.map((o) => o.startDate)).size === 1;
    if (normalized.length > 0 && !startDateConsensus) reasons.push(`${window}: startDate mismatch across core providers.`);

    const signs = normalized.map((observation) => observation.returnPct > 0);
    const signConsensus = coreProviderCount > 0 && signs.every((sign) => sign === signs[0]);
    if (!signConsensus && coreProviderCount > 0) reasons.push(`${window}: core-provider sign disagreement.`);

    const values = normalized.map((observation) => observation.returnPct);
    const maxReturnDispersionPp = values.length > 0 ? Math.max(...values) - Math.min(...values) : null;
    const numericalConsensus = maxReturnDispersionPp != null && maxReturnDispersionPp <= maxDispersionPp;
    if (maxReturnDispersionPp != null && !numericalConsensus) {
      reasons.push(`${window}: return dispersion ${maxReturnDispersionPp.toFixed(4)}pp exceeds ${maxDispersionPp}pp tolerance.`);
    }

    const brokerChecks = input.observations.filter((observation) =>
      observation.window === window &&
      observation.ticker === input.ticker &&
      observation.provider === GREEN_PROVIDER_QUORUM_OMEGA.optionalBrokerEvidence &&
      observation.endDate === input.expectedMarketCut &&
      observation.corporateActionPolicy === GREEN_PROVIDER_QUORUM_OMEGA.normalizedReturnPolicy &&
      brokerSign(observation) != null,
    );

    const consensusPositive = signConsensus && signs.length ? signs[0] : null;
    const brokerSignConflict = consensusPositive != null && brokerChecks.some((observation) => brokerSign(observation) !== consensusPositive);
    if (brokerSignConflict) reasons.push(`${window}: Trading 212 broker-side evidence conflicts with core-provider GREEN sign.`);

    const verified =
      coreProviderCount >= minimumProviders &&
      identityConsensus &&
      startDateConsensus &&
      signConsensus &&
      numericalConsensus &&
      !brokerSignConflict;

    windows[window] = {
      window,
      eligibleProviders: normalized.map((observation) => observation.provider),
      observations: normalized,
      providerCount,
      coreProviderCount,
      brokerCrossCheckCount: brokerChecks.length,
      signConsensus,
      consensusPositive,
      maxReturnDispersionPp,
      numericalConsensus,
      identityConsensus,
      startDateConsensus,
      brokerSignConflict,
      verified,
      reasons,
    };
  }

  const allFiveVerified = WINDOWS.every((window) => windows[window].verified);
  if (!allFiveVerified) topReasons.push('At least one GREEN horizon failed core-provider/broker verification; final GREEN classification must remain QUARANTINE.');
  else topReasons.push('All five GREEN horizons passed core-provider verification on the synchronized regular-market cut.');

  const providersUsed = [...new Set(input.observations.map((observation) => observation.provider))];

  return {
    ticker: input.ticker,
    engineId: GREEN_PROVIDER_QUORUM_OMEGA.id,
    verified: allFiveVerified,
    allFiveVerified,
    windows,
    providersUsed,
    reasons: topReasons,
  };
}
