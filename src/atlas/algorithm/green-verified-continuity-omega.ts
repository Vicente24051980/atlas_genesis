import {
  evaluateGreenContinuity,
  type GreenContinuityEvidence,
  type GreenContinuityPercentiles,
  type GreenContinuityResult,
  type GreenContinuityReturns,
  type GreenContinuityWindow,
} from './green-continuity-omega';
import {
  evaluateGreenProviderQuorum,
  GREEN_PROVIDER_QUORUM_OMEGA,
  type GreenProviderObservation,
  type GreenProviderQuorumResult,
} from './green-provider-quorum-omega';

export type VerifiedGreenContinuityInput = {
  ticker: string;
  expectedMarketCut: string;
  observations: GreenProviderObservation[];
  percentiles?: GreenContinuityPercentiles;
  existingPosition: boolean;
  hasOneYearHistory: boolean;
  confirmedStructuralFalsifier?: boolean;
};

export type VerifiedGreenContinuityResult = {
  ticker: string;
  engineId: typeof GREEN_VERIFIED_CONTINUITY_OMEGA.id;
  verified: boolean;
  quorum: GreenProviderQuorumResult;
  continuity: GreenContinuityResult | null;
  decision: GreenContinuityResult['decision'] | 'QUARANTINE';
  reasons: string[];
};

export const GREEN_VERIFIED_CONTINUITY_OMEGA = {
  id: 'GREEN_VERIFIED_CONTINUITY_OMEGA_V1_0',
  name: 'GREEN Verified Continuity Ω v1.0',
  status: 'canonical',
  role: 'first_analytical_engine_entrypoint',
  quorumGate: GREEN_PROVIDER_QUORUM_OMEGA.id,
  rules: [
    'Canonical callers must enter GREEN through this verified entrypoint, never by supplying unverified return percentages directly.',
    'Provider quorum executes before GREEN classification and must verify all five horizons.',
    'GREEN returns are derived from normalized raw-close provider consensus, not from vendor performance labels or fundamentals.',
    'If provider quorum fails, GREEN is QUARANTINE and no 0/5-5/5 classification is emitted.',
    'Economic Proof, Quality, valuation, analyst targets and news cannot alter any GREEN window.',
  ] as const,
} as const;

const WINDOWS: GreenContinuityWindow[] = ['oneWeek', 'oneMonth', 'threeMonths', 'oneYear', 'total'];

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[middle];
  return (sorted[middle - 1] + sorted[middle]) / 2;
}

export function evaluateVerifiedGreenContinuity(input: VerifiedGreenContinuityInput): VerifiedGreenContinuityResult {
  const quorum = evaluateGreenProviderQuorum({
    ticker: input.ticker,
    expectedMarketCut: input.expectedMarketCut,
    observations: input.observations,
  });

  if (!quorum.allFiveVerified) {
    return {
      ticker: input.ticker,
      engineId: GREEN_VERIFIED_CONTINUITY_OMEGA.id,
      verified: false,
      quorum,
      continuity: null,
      decision: 'QUARANTINE',
      reasons: [
        'GREEN classification blocked: provider quorum did not verify all five horizons.',
        ...quorum.reasons,
      ],
    };
  }

  const returns = {} as GreenContinuityReturns;
  const evidence = {} as GreenContinuityEvidence;

  for (const window of WINDOWS) {
    const consensus = quorum.windows[window];
    const observations = consensus.observations;
    const first = observations[0];
    const returnPct = median(observations.map((observation) => observation.returnPct));
    const endClose = median(observations.map((observation) => observation.endRegularClose));

    returns[window] = returnPct;
    evidence[window] = {
      ticker: input.ticker,
      canonicalIdentifier: first.canonicalIdentifier,
      exchange: first.exchange,
      currency: first.currency,
      startDate: first.startDate,
      endDate: input.expectedMarketCut,
      regularMarketClose: endClose,
      corporateActionAdjustmentPolicy: GREEN_PROVIDER_QUORUM_OMEGA.normalizedReturnPolicy,
      dataSource: consensus.eligibleProviders.join('+'),
      capturedAt: observations.map((observation) => observation.capturedAt).sort().at(-1) ?? first.capturedAt,
      asOf: input.expectedMarketCut,
      calculationMethod: 'median_of_ATLAS_recomputed_core_provider_raw_close_returns',
    };
  }

  const continuity = evaluateGreenContinuity({
    ticker: input.ticker,
    returns,
    percentiles: input.percentiles,
    evidence,
    expectedMarketCut: input.expectedMarketCut,
    existingPosition: input.existingPosition,
    hasOneYearHistory: input.hasOneYearHistory,
    synchronizedMarketCut: true,
    confirmedStructuralFalsifier: input.confirmedStructuralFalsifier,
  });

  return {
    ticker: input.ticker,
    engineId: GREEN_VERIFIED_CONTINUITY_OMEGA.id,
    verified: continuity.decision !== 'QUARANTINE' && continuity.decision !== 'INSUFFICIENT_HISTORY',
    quorum,
    continuity,
    decision: continuity.decision,
    reasons: [
      'All GREEN return values were derived from verified core-provider raw-close consensus.',
      ...continuity.reasons,
    ],
  };
}
