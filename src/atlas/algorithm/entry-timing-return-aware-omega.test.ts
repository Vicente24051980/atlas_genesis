import { evaluateReturnAwareEntryTiming, type ReturnAwareEntryTimingInput } from './entry-timing-return-aware-omega';

const base: ReturnAwareEntryTimingInput = {
  ticker: 'BASE',
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

describe('Entry Timing Return-Aware Omega v2', () => {
  it('credits a correction that already happened and does not demand an arbitrary extra drop', () => {
    const nxpiLike = evaluateReturnAwareEntryTiming({
      ...base,
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
    });

    expect(nxpiLike.state).toBe('STARTER_NOW_DISLOCATION');
    expect(nxpiLike.observedCorrectionPct).toBe(33.9);
    expect(nxpiLike.additionalDropRequiredPct).toBe(0);
    expect(nxpiLike.greenAcceptedForReturn).toBe(true);
    expect(nxpiLike.starterAllowed).toBe(true);
  });

  it('accepts GREEN 4/5 when Return Score >=850 and a normal pullback is already present', () => {
    const result = evaluateReturnAwareEntryTiming({
      ...base,
      ticker: 'GREEN4',
      returnScore: 880,
      greenCount: 4,
      oneMonthReturnPct: -8,
      normalPullbackPct: 7,
    });

    expect(result.state).toBe('BUY_THE_DIP');
    expect(result.greenAcceptedForReturn).toBe(true);
    expect(result.additionalDropRequiredPct).toBe(0);
  });

  it('accepts GREEN 3/5 with strong return but limits it to confirmation/starter when no dislocation exists', () => {
    const result = evaluateReturnAwareEntryTiming({
      ...base,
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
    });

    expect(result.state).toBe('STARTER_CONFIRMATION');
    expect(result.greenAcceptedForReturn).toBe(true);
    expect(result.starterAllowed).toBe(true);
  });

  it('does not let GREEN 5/5 rescue a sub-850 return opportunity', () => {
    const result = evaluateReturnAwareEntryTiming({ ...base, returnScore: 820, greenCount: 5 });
    expect(result.state).toBe('WAIT_RETURN');
    expect(result.starterAllowed).toBe(false);
  });

  it('requires at least GREEN 3/5 even for a high-return candidate', () => {
    const result = evaluateReturnAwareEntryTiming({ ...base, returnScore: 940, greenCount: 2 });
    expect(result.state).toBe('WAIT_GREEN');
  });

  it('keeps no-chase dynamic by using the ticker-specific normal pullback band', () => {
    const result = evaluateReturnAwareEntryTiming({
      ...base,
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
    });

    expect(result.state).toBe('WAIT_NO_CHASE');
    expect(result.additionalDropRequiredPct).toBe(4);
  });

  it('preserves Falsifiers Omega as an absolute veto', () => {
    const result = evaluateReturnAwareEntryTiming({ ...base, falsifierVeto: true });
    expect(result.state).toBe('REJECT_ENTRY');
    expect(result.starterAllowed).toBe(false);
  });
});
