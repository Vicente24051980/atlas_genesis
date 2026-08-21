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
  signConsensus: boolean;
  consensusPositive: boolean | null;
  maxReturnDispersionPp: number | null;
  numericalConsensus: boolean;
  verified: boolean;
  reasons: string[];
};

export type GreenProviderQuorumInput = {
  ticker: string;
  expectedMarketCut: string;
  observations: GreenProviderObservation[];
  /** Canonical minimum: 3 independent eligible providers per horizon. */
  minimumProviders?: number;
  /** Maximum cross-provider absolute range in percentage points after normalization. */
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
  id: 'GREEN_PROVIDER_QUORUM_OMEGA_V1_0',
  name: 'GREEN Provider Quorum Ω v1.0',
  status: 'canonical',
  coreProviders: ['TRADINGVIEW', 'YAHOO_FINANCE', 'BARCHART', 'INVESTING_COM'] as const,
  optionalBrokerEvidence: 'TRADING212_USER_EVIDENCE' as const,
  minimumProviders: 3,
  maxDispersionPp: 0.25,
  normalizedReturnPolicy: 'SPLIT_ADJUSTED_DIVIDEND_UNADJUSTED',
  method: 'ATLAS recomputes every horizon from raw regular-session closes; provider-native performance labels are not authoritative.',
  constitutionalRules: [
    'No GREEN horizon is VERIFIED from a single provider.',
    'At least 3 eligible independent providers must agree on the sign for each horizon.',
    'All observations must end on the exact expected regular-market cut.',
    'ATLAS recomputes returnPct from raw regular-session closes under one corporate-action policy instead of trusting provider performance labels.',
    'Any sign disagreement quarantines the horizon regardless of majority size.',
    'Numerical dispersion beyond the canonical tolerance quarantines the horizon until reconciled.',
    'Trading 212 user-visible evidence may act as an additional broker-side cross-check but is not assumed accessible programmatically and is never required for quorum.',
    'A complete GREEN 5/5 or 4/5 classification requires all five horizons to pass the provider quorum gate.',
  ] as const,
} as const;

const WINDOWS: GreenContinuityWindow[] = ['oneWeek', 'oneMonth', 'threeMonths', 'oneYear', 'total'];

function recomputeReturnPct(start: number, end: number): number {
  return ((end / start) - 1) * 100;
}

function finitePositive(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

export function evaluateGreenProviderQuorum(input: GreenProviderQuorumInput): GreenProviderQuorumResult {
  const minimumProviders = input.minimumProviders ?? GREEN_PROVIDER_QUORUM_OMEGA.minimumProviders;
  const maxDispersionPp = input.maxDispersionPp ?? GREEN_PROVIDER_QUORUM_OMEGA.maxDispersionPp;
  const topReasons: string[] = [];

  const windows = {} as Record<GreenContinuityWindow, GreenProviderWindowConsensus>;

  for (const window of WINDOWS) {
    const reasons: string[] = [];
    const seenProviders = new Set<GreenProvider>();

    const eligible = input.observations.filter((o) => {
      if (o.window !== window) return false;
      if (o.ticker !== input.ticker) return false;
      if (o.endDate !== input.expectedMarketCut) return false;
      if (o.corporateActionPolicy !== GREEN_PROVIDER_QUORUM_OMEGA.normalizedReturnPolicy) return false;
      if (!o.rawCloseDerived) return false;
      if (!finitePositive(o.startRegularClose) || !finitePositive(o.endRegularClose)) return false;
      if (seenProviders.has(o.provider)) return false;
      seenProviders.add(o.provider);
      return true;
    });

    const normalized = eligible.map((o) => ({
      ...o,
      returnPct: recomputeReturnPct(o.startRegularClose, o.endRegularClose),
    }));

    const providerCount = normalized.length;
    if (providerCount < minimumProviders) reasons.push(`${window}: only ${providerCount} eligible provider(s); minimum is ${minimumProviders}.`);

    const signs = normalized.map((o) => o.returnPct > 0);
    const signConsensus = providerCount > 0 && signs.every((s) => s === signs[0]);
    if (!signConsensus && providerCount > 0) reasons.push(`${window}: provider sign disagreement.`);

    const values = normalized.map((o) => o.returnPct);
    const maxReturnDispersionPp = values.length > 0 ? Math.max(...values) - Math.min(...values) : null;
    const numericalConsensus = maxReturnDispersionPp != null && maxReturnDispersionPp <= maxDispersionPp;
    if (maxReturnDispersionPp != null && !numericalConsensus) {
      reasons.push(`${window}: return dispersion ${maxReturnDispersionPp.toFixed(4)}pp exceeds ${maxDispersionPp}pp tolerance.`);
    }

    const verified = providerCount >= minimumProviders && signConsensus && numericalConsensus;
    windows[window] = {
      window,
      eligibleProviders: normalized.map((o) => o.provider),
      observations: normalized,
      providerCount,
      signConsensus,
      consensusPositive: signConsensus && signs.length ? signs[0] : null,
      maxReturnDispersionPp,
      numericalConsensus,
      verified,
      reasons,
    };
  }

  const allFiveVerified = WINDOWS.every((window) => windows[window].verified);
  if (!allFiveVerified) topReasons.push('At least one GREEN horizon failed multi-provider verification; final GREEN classification must remain QUARANTINE.');
  else topReasons.push('All five GREEN horizons passed multi-provider verification on the synchronized regular-market cut.');

  const providersUsed = [...new Set(input.observations.map((o) => o.provider))];

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
