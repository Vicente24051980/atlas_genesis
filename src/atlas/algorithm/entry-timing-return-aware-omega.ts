import {
  marketTapePasses,
  type UniversalMarketTapeIntegrityResult,
} from './universal-market-tape-integrity-omega';

export type EntryTimingState =
  | 'BUY_NOW'
  | 'BUY_THE_DIP'
  | 'STARTER_NOW_DISLOCATION'
  | 'STARTER_CONFIRMATION'
  | 'WAIT_NO_CHASE'
  | 'WAIT_RETURN'
  | 'WAIT_GREEN'
  | 'WAIT_EVENT'
  | 'EVIDENCE_PENDING'
  | 'REJECT_ENTRY';

export type DislocationState = 'NONE' | 'NORMAL' | 'ELEVATED' | 'STRESS';
export type CorrectionEvidenceMode = 'PEAK_DRAWDOWN' | 'WINDOW_RETURN_FALLBACK';

export interface ReturnAwareEntryTimingInput {
  ticker: string;
  marketTapeIntegrity?: UniversalMarketTapeIntegrityResult;
  peakMetricEvidenceIds?: readonly string[];
  returnScore: number; // Size-Neutral Return Ranking Ω, 0..1000
  greenCount: number; // GREEN Continuity Ω, 0..5
  oneWeekReturnPct: number;
  oneMonthReturnPct: number;
  threeMonthReturnPct: number;
  athDistancePct?: number | null; // <= 0 when below ATH

  // Prefer rolling/current peak drawdowns when available. Negative values mean below peak.
  oneMonthPeakDrawdownPct?: number | null;
  threeMonthPeakDrawdownPct?: number | null;
  oneYearPeakDrawdownPct?: number | null;

  // Ticker-specific historical pullback bands. Positive magnitudes.
  normalPullbackPct: number;
  elevatedPullbackPct: number;
  stressDrawdownPct: number;

  extensionZscore?: number | null;
  accelerationPercentile?: number | null;
  eventRiskWithinFiveTradingDays?: boolean;
  thesisIntact: boolean;
  evidenceTraceable: boolean;
  falsifierVeto?: boolean;
}

export interface ReturnAwareEntryTimingResult {
  ticker: string;
  state: EntryTimingState;
  returnScore: number;
  returnEligible: boolean;
  greenCount: number;
  greenAcceptedForReturn: boolean;
  marketTapeVerified: boolean;
  observedCorrectionPct: number;
  correctionEvidenceMode: CorrectionEvidenceMode;
  dislocationState: DislocationState;
  additionalDropRequiredPct: number;
  starterAllowed: boolean;
  reasons: string[];
}

export const ENTRY_TIMING_RETURN_AWARE_OMEGA = {
  id: 'ENTRY_TIMING_RETURN_AWARE_OMEGA_V2_2',
  name: 'Entry Timing Return-Aware Ω v2.2',
  status: 'canonical',
  minimumReturnScore: 850,
  minimumGreenCountWhenReturnPasses: 3,
  constitutionalRules: [
    'SELECTION != ENTRY.',
    'ENTRY_TIMING_REQUIRES_UNIVERSAL_MARKET_TAPE_PASS_FOR_THE_SAME_TICKER.',
    '1W != 1M != 3M; the three windows must reconcile exactly to verified PRICE_RETURN observations before GREEN or dislocation can drive an entry state.',
    'A correction that already occurred must be credited before asking for any additional pullback.',
    'Current drawdown from ATH or a rolling peak is preferred to a negative window return; return is only a fallback when peak data are unavailable.',
    'Peak/ATH metrics require traceable evidence IDs in addition to verified current market tape.',
    'Never prescribe a universal extra -3%, -5% or -10% after a ticker-specific dislocation has already reached its historical pullback band.',
    'GREEN 5/5 is strongest continuity, but GREEN 4/5 or 3/5 remains eligible when evidence-backed Return Score is >=850.',
    'GREEN is diagnostic and independent; return quality permits committee eligibility but does not rewrite GREEN history.',
    'GREEN <3/5 does not create a structural falsifier; it blocks immediate entry pending confirmation.',
    'Falsifiers Ω remains an absolute independent veto.',
    'Falling price alone never proves cheapness; thesis integrity and evidence are mandatory.',
  ] as const,
} as const;

function clamp(value: number, low: number, high: number): number {
  if (!Number.isFinite(value)) return low;
  return Math.max(low, Math.min(high, value));
}

function positiveMagnitudeOfNegative(value?: number | null): number {
  if (value == null || !Number.isFinite(value) || value >= 0) return 0;
  return Math.abs(value);
}

function normalizeBand(value: number): number {
  return Math.max(0, Number.isFinite(value) ? value : 0);
}

function hasPeakMetric(input: ReturnAwareEntryTimingInput): boolean {
  return [
    input.athDistancePct,
    input.oneMonthPeakDrawdownPct,
    input.threeMonthPeakDrawdownPct,
    input.oneYearPeakDrawdownPct,
  ].some((value) => value != null && Number.isFinite(value));
}

function marketWindowsVerified(input: ReturnAwareEntryTimingInput): boolean {
  const tape = input.marketTapeIntegrity;
  if (!marketTapePasses(tape) || tape?.selectedTicker !== input.ticker) return false;
  const expected: Array<['1W' | '1M' | '3M', number]> = [
    ['1W', input.oneWeekReturnPct],
    ['1M', input.oneMonthReturnPct],
    ['3M', input.threeMonthReturnPct],
  ];
  return expected.every(([window, value]) => {
    const selected = tape.selectedReturns[window];
    return Boolean(
      selected &&
      selected.kind === 'PRICE_RETURN' &&
      Number.isFinite(value) &&
      Math.abs(selected.valuePct - value) <= 0.05,
    );
  });
}

export function calculateObservedCorrection(input: ReturnAwareEntryTimingInput): {
  observedCorrectionPct: number;
  correctionEvidenceMode: CorrectionEvidenceMode;
} {
  const peakDrawdowns = [
    input.athDistancePct,
    input.oneMonthPeakDrawdownPct,
    input.threeMonthPeakDrawdownPct,
    input.oneYearPeakDrawdownPct,
  ]
    .map(positiveMagnitudeOfNegative)
    .filter((value) => value > 0);

  if (peakDrawdowns.length > 0) {
    return {
      observedCorrectionPct: Math.max(...peakDrawdowns),
      correctionEvidenceMode: 'PEAK_DRAWDOWN',
    };
  }

  return {
    observedCorrectionPct: Math.max(
      positiveMagnitudeOfNegative(input.oneWeekReturnPct),
      positiveMagnitudeOfNegative(input.oneMonthReturnPct),
      positiveMagnitudeOfNegative(input.threeMonthReturnPct),
    ),
    correctionEvidenceMode: 'WINDOW_RETURN_FALLBACK',
  };
}

export function classifyDislocation(
  observedCorrectionPct: number,
  normalPullbackPct: number,
  elevatedPullbackPct: number,
  stressDrawdownPct: number,
): DislocationState {
  const normal = normalizeBand(normalPullbackPct);
  const elevated = Math.max(normal, normalizeBand(elevatedPullbackPct));
  const stress = Math.max(elevated, normalizeBand(stressDrawdownPct));

  if (stress > 0 && observedCorrectionPct >= stress) return 'STRESS';
  if (elevated > 0 && observedCorrectionPct >= elevated) return 'ELEVATED';
  if (normal > 0 && observedCorrectionPct >= normal) return 'NORMAL';
  return 'NONE';
}

export function evaluateReturnAwareEntryTiming(
  input: ReturnAwareEntryTimingInput,
): ReturnAwareEntryTimingResult {
  const returnScore = Math.round(clamp(input.returnScore, 0, 1000));
  const greenCount = Math.round(clamp(input.greenCount, 0, 5));
  const returnEligible = returnScore >= ENTRY_TIMING_RETURN_AWARE_OMEGA.minimumReturnScore;
  const greenAcceptedForReturn = returnEligible && greenCount >= ENTRY_TIMING_RETURN_AWARE_OMEGA.minimumGreenCountWhenReturnPasses;
  const marketTapeVerified = marketWindowsVerified(input);
  const correction = calculateObservedCorrection(input);
  const observedCorrectionPct = Math.round(correction.observedCorrectionPct * 100) / 100;
  const correctionEvidenceMode = correction.correctionEvidenceMode;
  const dislocationState = classifyDislocation(
    observedCorrectionPct,
    input.normalPullbackPct,
    input.elevatedPullbackPct,
    input.stressDrawdownPct,
  );

  const normalPullback = normalizeBand(input.normalPullbackPct);
  const additionalDropRequiredPct = Math.round(Math.max(0, normalPullback - observedCorrectionPct) * 100) / 100;
  const reasons: string[] = [];

  const build = (state: EntryTimingState, starterAllowed: boolean, additional = additionalDropRequiredPct): ReturnAwareEntryTimingResult => ({
    ticker: input.ticker,
    state,
    returnScore,
    returnEligible,
    greenCount,
    greenAcceptedForReturn,
    marketTapeVerified,
    observedCorrectionPct,
    correctionEvidenceMode,
    dislocationState,
    additionalDropRequiredPct: additional,
    starterAllowed,
    reasons,
  });

  if (input.falsifierVeto) {
    reasons.push('Confirmed Falsifiers Ω veto blocks entry regardless of score, GREEN or dislocation.');
    return build('REJECT_ENTRY', false, 0);
  }

  if (!input.evidenceTraceable) {
    reasons.push('Entry evidence is incomplete or not traceable; no execution state may be confirmed.');
    return build('EVIDENCE_PENDING', false);
  }

  if (!input.thesisIntact) {
    reasons.push('The parent investment thesis is not intact; a falling price cannot be classified as a buyable dislocation.');
    return build('REJECT_ENTRY', false, 0);
  }

  if (!marketTapeVerified) {
    reasons.push('Universal Market Tape Integrity Ω failed to reconcile 1W/1M/3M PRICE_RETURN for the same ticker; entry timing is blocked.');
    for (const violation of input.marketTapeIntegrity?.violations ?? []) reasons.push(`MARKET_TAPE: ${violation}`);
    if (input.marketTapeIntegrity?.selectedTicker && input.marketTapeIntegrity.selectedTicker !== input.ticker) {
      reasons.push('MARKET_TAPE: ticker_mismatch');
    }
    return build('EVIDENCE_PENDING', false, 0);
  }

  if (hasPeakMetric(input) && (input.peakMetricEvidenceIds?.length ?? 0) === 0) {
    reasons.push('Peak/ATH drawdown metrics are present without traceable peak-metric evidence; dislocation-based entry is blocked.');
    return build('EVIDENCE_PENDING', false, 0);
  }

  if (!returnEligible) {
    reasons.push(`Return Score ${returnScore}/1000 is below the canonical 850 threshold; timing cannot rescue insufficient expected return.`);
    return build('WAIT_RETURN', false);
  }

  if (greenCount < 3) {
    reasons.push(`GREEN ${greenCount}/5 is below the return-aware minimum of 3/5. Keep the candidate, but wait for market confirmation.`);
    if (dislocationState !== 'NONE') {
      reasons.push(`Dislocation ${dislocationState} is recorded but cannot by itself override GREEN <3/5; watch for the next horizon to turn positive.`);
    }
    return build('WAIT_GREEN', false, 0);
  }

  if (input.eventRiskWithinFiveTradingDays) {
    reasons.push('Material event risk is within five trading days; defer sizing decision unless the parent event engine explicitly authorizes pre-event exposure.');
    return build('WAIT_EVENT', false, 0);
  }

  if (dislocationState === 'STRESS' || dislocationState === 'ELEVATED') {
    reasons.push(`Observed correction ${observedCorrectionPct}% has already reached the ticker-specific ${dislocationState.toLowerCase()} pullback band.`);
    reasons.push('Do not demand an arbitrary additional decline. A starter is allowed while confirmation and falsifiers continue to be monitored.');
    if (greenCount === 3) reasons.push('GREEN 3/5 is accepted because Return Score passes 850; size remains starter-only until continuity improves.');
    if (greenCount === 4) reasons.push('GREEN 4/5 plus strong return and material dislocation supports a staged entry.');
    return build('STARTER_NOW_DISLOCATION', true, 0);
  }

  if (dislocationState === 'NORMAL') {
    reasons.push(`Observed correction ${observedCorrectionPct}% has already reached the ticker-specific normal pullback band.`);
    reasons.push('Entry asymmetry has improved; no generic extra -3%/-5% rule applies.');
    return build('BUY_THE_DIP', true, 0);
  }

  const extensionZscore = input.extensionZscore ?? 0;
  const accelerationPercentile = input.accelerationPercentile ?? 0;
  const statisticallyExtended = extensionZscore >= 2 || accelerationPercentile >= 90;

  if (statisticallyExtended) {
    reasons.push('Price remains statistically extended relative to its own trend/history and has not yet reached its normal pullback band.');
    reasons.push(`Only ${additionalDropRequiredPct}% remains to the ticker-specific normal pullback band; this is a dynamic estimate, not a universal correction target.`);
    return build('WAIT_NO_CHASE', false);
  }

  if (greenCount === 5) {
    reasons.push('GREEN 5/5, Return Score >=850, thesis intact and no statistical extension: immediate staged entry is allowed.');
    return build('BUY_NOW', true, 0);
  }

  reasons.push(`GREEN ${greenCount}/5 is acceptable because Return Score ${returnScore}/1000 passes 850, but continuity is incomplete.`);
  reasons.push('Allow only a starter/confirmation entry rather than rejecting the candidate or forcing another arbitrary pullback.');
  return build('STARTER_CONFIRMATION', true, 0);
}
