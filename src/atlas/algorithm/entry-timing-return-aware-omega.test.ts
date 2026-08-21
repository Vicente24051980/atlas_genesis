import { evaluateUniversalMarketTapeIntegrity } from './universal-market-tape-integrity-omega';
import { evaluateReturnAwareEntryTiming, type ReturnAwareEntryTimingInput } from './entry-timing-return-aware-omega';

const base: Omit<ReturnAwareEntryTimingInput, 'marketTapeIntegrity'> = {
  ticker: 'BASE',
  peakMetricEvidenceIds: ['verified-peak-series'],
  returnScore: 900,
  greenCount: 5,
  oneWeekReturnPct: 2,
  oneMonthReturnPct: 5,
  threeMonthReturnPct: 12,
  athDistancePct: -3,
  normalPullbackPct: 7,
  elevatedPullbackPct: 14,
  stressDrawdownPct: 28,
  extensionZscore: 0.5,
  accelerationPercentile: 65,
  thesisIntact: true,
  evidenceTraceable: true,
};

function verifiedInput(overrides: Partial<Omit<ReturnAwareEntryTimingInput, 'marketTapeIntegrity'>> = {}): ReturnAwareEntryTimingInput {
  const merged = { ...base, ...overrides };
  const marketTapeIntegrity = evaluateUniversalMarketTapeIntegrity({
    ticker: merged.ticker,
    primaryListing: 'TEST',
    currency: 'USD',
    quotationUnit: 'USD',
    asOfTimestamp: '2026-08-21T21:20:00+02:00',
    expectedSessionState: 'OPEN',
    requiredReturnKind: 'PRICE_RETURN',
    requiredReturnWindows: ['1W', '1M', '3M'],
    observations: [{
      ticker: merged.ticker,
      primaryListing: 'TEST',
      currency: 'USD',
      quotationUnit: 'USD',
      observationDate: '2026-08-21',
      observationType: 'INTRADAY_SNAPSHOT',
      observationTimestamp: '2026-08-21T21:19:00+02:00',
      sessionState: 'OPEN',
      price: 100,
      sourceId: `regulated-${merged.ticker}`,
      sourceClass: 'REGULATED_FEED',
      capturedAt: '2026-08-21T21:19:10+02:00',
      corporateActionsReconciled: true,
      returns: {
        '1W': { valuePct: merged.oneWeekReturnPct, kind: 'PRICE_RETURN' },
        '1M': { valuePct: merged.oneMonthReturnPct, kind: 'PRICE_RETURN' },
        '3M': { valuePct: merged.threeMonthReturnPct, kind: 'PRICE_RETURN' },
      },
    }],
  });
  return { ...merged, marketTapeIntegrity };
}

describe('Entry Timing Return-Aware Omega v2.2', () => {
  it('credits a correction that already happened and does not demand an arbitrary extra drop', () => {
    const nxpiLike = evaluateReturnAwareEntryTiming(verifiedInput({
      ticker: 'NXPI_LIKE',
      returnScore: 932,
      greenCount: 3,
      oneWeekReturnPct: -3.72,
      oneMonthReturnPct: -15.89,
      threeMonthReturnPct: -27.54,
      athDistancePct: -33.9,
      normalPullbackPct: 8,
      elevatedPullbackPct: 15,
      stressDrawdownPct: 30,
    }));

    expect(nxpiLike.state).toBe('STARTER_NOW_DISLOCATION');
    expect(nxpiLike.marketTapeVerified).toBe(true);
    expect(nxpiLike.observedCorrectionPct).toBe(33.9);
    expect(nxpiLike.additionalDropRequiredPct).toBe(0);
    expect(nxpiLike.greenAcceptedForReturn).toBe(true);
    expect(nxpiLike.starterAllowed).toBe(true);
  });

  it('accepts GREEN 4/5 when Return Score >=850 and a normal pullback is already present', () => {
    const result = evaluateReturnAwareEntryTiming(verifiedInput({
      ticker: 'GREEN4',
      returnScore: 880,
      greenCount: 4,
      oneMonthReturnPct: -8,
      normalPullbackPct: 7,
      athDistancePct: null,
    }));

    expect(result.state).toBe('BUY_THE_DIP');
    expect(result.greenAcceptedForReturn).toBe(true);
    expect(result.additionalDropRequiredPct).toBe(0);
  });

  it('accepts GREEN 3/5 with strong return but limits it to confirmation/starter when no dislocation exists', () => {
    const result = evaluateReturnAwareEntryTiming(verifiedInput({
      ticker: 'GREEN3',
      returnScore: 910,
      greenCount: 3,
      oneWeekReturnPct: 1,
      oneMonthReturnPct: 2,
      threeMonthReturnPct: -1,
      athDistancePct: -2,
      normalPullbackPct: 8,
      elevatedPullbackPct: 15,
      stressDrawdownPct: 25,
    }));

    expect(result.state).toBe('STARTER_CONFIRMATION');
    expect(result.greenAcceptedForReturn).toBe(true);
    expect(result.starterAllowed).toBe(true);
  });

  it('does not let GREEN 5/5 rescue a sub-850 return opportunity', () => {
    const result = evaluateReturnAwareEntryTiming(verifiedInput({ returnScore: 820, greenCount: 5 }));
    expect(result.state).toBe('WAIT_RETURN');
    expect(result.starterAllowed).toBe(false);
  });

  it('requires at least GREEN 3/5 even for a high-return candidate', () => {
    const result = evaluateReturnAwareEntryTiming(verifiedInput({ returnScore: 940, greenCount: 2 }));
    expect(result.state).toBe('WAIT_GREEN');
  });

  it('keeps no-chase dynamic by using the ticker-specific normal pullback band', () => {
    const result = evaluateReturnAwareEntryTiming(verifiedInput({
      ticker: 'EXTENDED',
      greenCount: 5,
      oneWeekReturnPct: 6,
      oneMonthReturnPct: 18,
      threeMonthReturnPct: 42,
      athDistancePct: -2,
      normalPullbackPct: 6,
      elevatedPullbackPct: 11,
      stressDrawdownPct: 22,
      extensionZscore: 2.4,
      accelerationPercentile: 96,
    }));

    expect(result.state).toBe('WAIT_NO_CHASE');
    expect(result.additionalDropRequiredPct).toBe(4);
  });

  it('preserves Falsifiers Omega as an absolute veto even before market-tape validation', () => {
    const result = evaluateReturnAwareEntryTiming({ ...verifiedInput(), marketTapeIntegrity: undefined, falsifierVeto: true });
    expect(result.state).toBe('REJECT_ENTRY');
    expect(result.starterAllowed).toBe(false);
  });

  it('blocks entry when 1M is accidentally replaced with another window value', () => {
    const verified = verifiedInput({
      ticker: 'ACN',
      oneWeekReturnPct: 2.71,
      oneMonthReturnPct: 30.15,
      threeMonthReturnPct: 3.07,
      athDistancePct: null,
    });
    const contaminated = { ...verified, oneMonthReturnPct: 3.07 };
    const result = evaluateReturnAwareEntryTiming(contaminated);
    expect(result.marketTapeVerified).toBe(false);
    expect(result.state).toBe('EVIDENCE_PENDING');
    expect(result.starterAllowed).toBe(false);
  });

  it('blocks entry when 1M and 3M are reversed even if all other scores are strong', () => {
    const verified = verifiedInput({
      ticker: 'SPGI',
      oneWeekReturnPct: 1.74,
      oneMonthReturnPct: -0.29,
      threeMonthReturnPct: 3.44,
      athDistancePct: null,
      returnScore: 950,
      greenCount: 5,
    });
    const reversed = { ...verified, oneMonthReturnPct: 3.44, threeMonthReturnPct: -0.29 };
    const result = evaluateReturnAwareEntryTiming(reversed);
    expect(result.state).toBe('EVIDENCE_PENDING');
    expect(result.reasons[0]).toContain('failed to reconcile 1W/1M/3M');
  });

  it('blocks peak-drawdown entry when peak metrics have no traceable evidence', () => {
    const result = evaluateReturnAwareEntryTiming(verifiedInput({
      ticker: 'PEAK_UNTRACED',
      athDistancePct: -20,
      peakMetricEvidenceIds: [],
    }));
    expect(result.state).toBe('EVIDENCE_PENDING');
    expect(result.reasons).toContain('Peak/ATH drawdown metrics are present without traceable peak-metric evidence; dislocation-based entry is blocked.');
  });
});
