import {
  assessRotationGate,
  assertFlowTotalUsesOnlyAdditiveMetrics,
  calculateRotationScore,
  sumNonOverlappingFlows,
  type RotationFlowObservation,
} from './engine';

const flow = (asset: string, value: number, partitionKey = asset): RotationFlowObservation => ({
  metric: 'ETF_NET_FLOW',
  value,
  unit: 'USD_B',
  currency: 'USD',
  periodStart: '2026-01-01',
  periodEnd: '2026-06-30',
  asOf: '2026-06-30',
  universe: 'US_LISTED_SECTOR_ETFS',
  measurementMethod: 'estimated_net_flow',
  sourceEvidenceId: `state-street-${asset}`,
  provider: 'STATE_STREET',
  dataset: 'H1_2026_SECTOR_FLOWS',
  asset,
  window: 'YTD',
  sourceLevel: 1,
  partitionKey,
});

describe('Money Rotation Omega v1.2', () => {
  it('rejects mixed non-flow totals from the Gran Rotation narrative', () => {
    expect(() => assertFlowTotalUsesOnlyAdditiveMetrics([
      'ETF_NET_FLOW', 'MARKET_CAP_CHANGE', 'GOVERNMENT_BUDGET', 'PRIVATE_COMPANY_VALUATION',
    ])).toThrow('money_rotation_non_additive_total:MARKET_CAP_CHANGE');
  });

  it('sums only comparable non-overlapping partitions', () => {
    expect(sumNonOverlappingFlows([flow('TECH', 44.760), flow('HEALTH', 1.018)])).toBe(45.778);
  });

  it('rejects an overlapping sector partition', () => {
    expect(() => sumNonOverlappingFlows([
      flow('TECH_A', 10, 'TECH'), flow('TECH_B', 5, 'TECH'),
    ])).toThrow('money_rotation_overlapping_partition:TECH');
  });

  it('keeps health at R3 candidate when flow is the only confirmed core signal', () => {
    expect(assessRotationGate({
      signals: {
        OUTFLOW_STOPPED: true,
        RELATIVE_STRENGTH_IMPROVING: false,
        EARNINGS_REVISIONS_IMPROVING: false,
        BREADTH_EXPANDING: false,
        INSTITUTIONAL_VOLUME_CONFIRMING: false,
      },
      comparableFlowSeries: true,
      positiveFlowWindows: 2,
      goodNewsAfterDestruction: false,
      positiveReactionToGoodNews: false,
      primaryEvidenceIds: ['state-street-h1', 'state-street-july'],
      unreconciledConflicts: 0,
    }).state).toBe('R3_CANDIDATE');
  });

  it('promotes only multisignal R4 with persistent flow and positive news reaction', () => {
    expect(assessRotationGate({
      signals: {
        OUTFLOW_STOPPED: true,
        RELATIVE_STRENGTH_IMPROVING: true,
        EARNINGS_REVISIONS_IMPROVING: true,
        BREADTH_EXPANDING: false,
        INSTITUTIONAL_VOLUME_CONFIRMING: false,
      },
      comparableFlowSeries: true,
      positiveFlowWindows: 2,
      goodNewsAfterDestruction: true,
      positiveReactionToGoodNews: true,
      primaryEvidenceIds: ['flow-1', 'flow-2', 'earnings-1'],
      unreconciledConflicts: 0,
    }).state).toBe('R4_CONFIRMED');
  });

  it('uses the canonical 20/20/15/10/10/10/10/5 score', () => {
    expect(calculateRotationScore({
      flows: 100,
      relativeStrength: 100,
      earningsRevisions: 100,
      breadth: 100,
      institutionalVolume: 100,
      newsReaction: 100,
      macroRegime: 100,
      crowding: 100,
    })).toBe(100);
  });
});
