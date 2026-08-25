import { evaluateUniversalMarketTapeIntegrity } from '../algorithm/universal-market-tape-integrity-omega';
import {
  assessGoldRegime,
  assessOilScenario,
  assessRotationGate,
  assertFlowTotalUsesOnlyAdditiveMetrics,
  calculateRotationScore,
  classifyRotationLifecycle,
  inferGoldOilRegime,
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

function tape(subject: string) {
  return evaluateUniversalMarketTapeIntegrity({
    ticker: subject,
    primaryListing: 'MARKET',
    currency: 'USD',
    quotationUnit: 'USD',
    asOfTimestamp: '2026-08-21T21:20:00+02:00',
    expectedSessionState: 'OPEN',
    observations: [{
      ticker: subject,
      primaryListing: 'MARKET',
      currency: 'USD',
      quotationUnit: 'USD',
      observationDate: '2026-08-21',
      observationType: 'INTRADAY_SNAPSHOT',
      observationTimestamp: '2026-08-21T21:19:00+02:00',
      sessionState: 'OPEN',
      price: 100,
      sourceId: `regulated-${subject}`,
      sourceClass: 'REGULATED_FEED',
      capturedAt: '2026-08-21T21:19:10+02:00',
      corporateActionsReconciled: true,
    }],
  });
}

const market = (subject: string) => ({ marketTapeSubject: subject, marketTapeIntegrity: tape(subject) });

describe('Money Rotation Omega v1.4 market-tape integrity', () => {
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
      ...market('XLV'),
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

  it('promotes only multisignal R4 with persistent flow and verified positive news reaction', () => {
    expect(assessRotationGate({
      ...market('XLK'),
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

  it('cannot promote R4 when relative strength and price reaction are not market-tape verified', () => {
    const result = assessRotationGate({
      marketTapeSubject: 'XLK',
      marketTapeIntegrity: undefined,
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
    });
    expect(result.marketTapeVerified).toBe(false);
    expect(result.state).toBe('R3_CANDIDATE');
    expect(result.coreSignalCount).toBe(2);
    expect(result.reasons).toContain('universal_market_tape_integrity_required_for_relative_strength_and_price_reaction');
  });

  it('uses the canonical 20/20/15/10/10/10/10/5 score with verified market dimensions', () => {
    expect(calculateRotationScore({
      flows: 100,
      relativeStrength: 100,
      earningsRevisions: 100,
      breadth: 100,
      institutionalVolume: 100,
      newsReaction: 100,
      macroRegime: 100,
      crowding: 100,
    }, market('XLK'))).toBe(100);
  });

  it('renormalizes the score without RS/news reaction instead of treating unverified tape as bearish', () => {
    expect(calculateRotationScore({
      flows: 100,
      relativeStrength: 0,
      earningsRevisions: 100,
      breadth: 100,
      institutionalVolume: 100,
      newsReaction: 0,
      macroRegime: 100,
      crowding: 100,
    }, { marketTapeSubject: 'XLK', marketTapeIntegrity: undefined })).toBe(100);
  });

  it('does not classify a broken business as an investable R2 dislocation', () => {
    expect(classifyRotationLifecycle({
      ...market('XLK'),
      gateState: 'NO_ROTATION_SIGNAL',
      structuralBusinessIntact: false,
      outflowsDominant: true,
      capitulationExtreme: true,
      mainAtlasDetected: false,
      crowdingExtreme: false,
    }).phase).toBe('REJECT_STRUCTURAL_DAMAGE');
  });

  it('maps confirmed R4 to the handoff phase before ATLAS main detects it', () => {
    expect(classifyRotationLifecycle({
      ...market('XLK'),
      gateState: 'R4_CONFIRMED',
      structuralBusinessIntact: true,
      outflowsDominant: false,
      capitulationExtreme: false,
      mainAtlasDetected: false,
      crowdingExtreme: false,
    })).toMatchObject({ phase: 'R4_EARLY_ACCUMULATION', action: 'HANDOFF_ATLAS_MAIN' });
  });

  it('does not use capitulation as an R2 price signal without verified tape', () => {
    expect(classifyRotationLifecycle({
      marketTapeSubject: 'XLK', marketTapeIntegrity: undefined,
      gateState: 'NO_ROTATION_SIGNAL', structuralBusinessIntact: true, outflowsDominant: false,
      capitulationExtreme: true, mainAtlasDetected: false, crowdingExtreme: false,
    })).toEqual({
      phase: 'INSUFFICIENT_EVIDENCE',
      action: 'MONITOR',
      reason: 'price_capitulation_unverified_without_universal_market_tape',
    });
  });

  it('keeps structural and tactical gold signals independent while gating momentum', () => {
    expect(assessGoldRegime({
      ...market('GOLD'),
      structural: {
        centralBankDemand: 90,
        reserveDiversification: 85,
        physicalDemand: 70,
        monetaryTrustStress: 80,
        evidenceIds: ['wgc-central-banks'],
      },
      tactical: {
        etfFlows: 20,
        realYieldsSupport: 30,
        dollarSupport: 35,
        momentum: 25,
        evidenceIds: ['wgc-etf-flows'],
      },
    })).toMatchObject({ structural: 'STRONG', tactical: 'WEAK', marketTapeVerified: true });
  });

  it('excludes unverified gold momentum rather than silently scoring it', () => {
    const result = assessGoldRegime({
      marketTapeSubject: 'GOLD', marketTapeIntegrity: undefined,
      structural: { centralBankDemand: 90, reserveDiversification: 85, physicalDemand: 70, monetaryTrustStress: 80, evidenceIds: ['wgc-central-banks'] },
      tactical: { etfFlows: 90, realYieldsSupport: 90, dollarSupport: 90, momentum: 0, evidenceIds: ['wgc-etf-flows'] },
    });
    expect(result.marketTapeVerified).toBe(false);
    expect(result.tacticalScore).toBe(90);
    expect(result.tactical).toBe('STRONG');
  });

  it('uses gold up and oil down only when both market directions are verified', () => {
    expect(inferGoldOilRegime(
      { ...market('GOLD'), trend: 'UP' },
      { ...market('OIL'), trend: 'DOWN' },
    )).toEqual({
      regime: 'RISK_DISINFLATION',
      investigate: ['QUALITY', 'HEALTHCARE', 'BONDS', 'DEFENSIVES'],
    });
  });

  it('returns unresolved rather than infer a regime from unverified commodity price directions', () => {
    expect(inferGoldOilRegime(
      { marketTapeSubject: 'GOLD', marketTapeIntegrity: undefined, trend: 'UP' },
      { ...market('OIL'), trend: 'DOWN' },
    )).toEqual({
      regime: 'MIXED_UNRESOLVED',
      investigate: ['MARKET_TAPE_UNVERIFIED', 'NO_MECHANICAL_SECTOR_CALL'],
    });
  });

  it('keeps falling-oil disinflation conditional when geopolitical risk remains high and price tape is verified', () => {
    expect(assessOilScenario({
      ...market('OIL'),
      priceTrend: 'DOWN',
      supplyDemandBalance: 'SURPLUS',
      geopoliticalRisk: 'HIGH',
      primaryEvidenceIds: ['eia-steo', 'iea-omr'],
    })).toBe('CONDITIONAL_DISINFLATIONARY');
  });

  it('does not infer an oil price regime from an unverified price trend', () => {
    expect(assessOilScenario({
      marketTapeSubject: 'OIL', marketTapeIntegrity: undefined,
      priceTrend: 'DOWN', supplyDemandBalance: 'SURPLUS', geopoliticalRisk: 'LOW',
      primaryEvidenceIds: ['eia-steo', 'iea-omr'],
    })).toBe('UNVALIDATED');
  });
});
