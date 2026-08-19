export type GreenContinuityWindow = 'oneWeek' | 'oneMonth' | 'threeMonths' | 'oneYear' | 'total';

export type GreenContinuityReturns = Record<GreenContinuityWindow, number>;

export type GreenContinuityPercentiles = Partial<Record<GreenContinuityWindow, number>>;

export type GreenContinuityInput = {
  ticker: string;
  returns: GreenContinuityReturns;
  percentiles?: GreenContinuityPercentiles;
  existingPosition: boolean;
  hasOneYearHistory: boolean;
  synchronizedMarketCut: boolean;
  confirmedStructuralFalsifier?: boolean;
};

export type GreenContinuityDecision =
  | 'PASS_5OF5'
  | 'SHORT_HORIZON_BREAK'
  | 'STRUCTURAL_TREND_BREAK'
  | 'FALSIFIER_ALERT'
  | 'INSUFFICIENT_HISTORY'
  | 'QUARANTINE';

export type GreenContinuityCommitteeImpact = 'POSITIVE' | 'CAUTION' | 'NEGATIVE' | 'ESCALATE';

export type GreenContinuityResult = {
  ticker: string;
  engineId: typeof GREEN_CONTINUITY_OMEGA.id;
  decision: GreenContinuityDecision;
  committeeImpact: GreenContinuityCommitteeImpact;
  greenCount: number;
  pass5of5: boolean;
  green: Record<GreenContinuityWindow, boolean>;
  structuralTrendIntact: boolean;
  shortHorizonBreak: boolean;
  strengthScore: number | null;
  reasons: string[];
};

export const GREEN_CONTINUITY_WEIGHTS: Record<GreenContinuityWindow, number> = {
  oneWeek: 10,
  oneMonth: 20,
  threeMonths: 30,
  oneYear: 35,
  total: 5,
};

export const GREEN_CONTINUITY_OMEGA = {
  id: 'GREEN_CONTINUITY_OMEGA_V1_1',
  name: 'GREEN CONTINUITY Ω v1.1',
  role: 'transversal_diagnostic_engine',
  status: 'canonical',
  mobileFirst: true,
  recommendationAuthority: 'INVESTMENT_COMMITTEE_OMEGA',
  allTickerRule: true,
  diagnosticPassRule: '1W > 0 AND 1M > 0 AND 3M > 0 AND 1Y > 0 AND TOTAL > 0',
  windows: ['oneWeek', 'oneMonth', 'threeMonths', 'oneYear', 'total'] as const,
  rankingWeights: GREEN_CONTINUITY_WEIGHTS,
  constitutionalRules: [
    'Every listed-equity ticker analyzed by ATLAS must receive a GREEN CONTINUITY Ω result when sufficient market history exists.',
    'GREEN 5/5 is a positive continuity signal, not an automatic BUY and not a mandatory gate for the final committee recommendation.',
    'A 1W or 1M break while 3M, 1Y and TOTAL remain positive is a short-horizon continuity warning, not a fundamental falsifier and not an automatic SELL.',
    'A 3M, 1Y or TOTAL break is a structural price-trend warning for this engine, but final portfolio action remains the responsibility of Investment Committee Ω.',
    'A confirmed structural business falsifier is escalated to Falsifiers Ω / Red Team; GREEN CONTINUITY Ω does not own the final veto decision.',
    'Price continuity measures market behavior only. It must remain independent from Quality, Valuation, Defensive, Money Rotation, Macro and all other ATLAS engines.',
    'All engine outputs are recorded independently before Investment Committee Ω issues BUY, HOLD, WATCH, REJECT or NO OPPORTUNITY.',
  ] as const,
} as const;

const WINDOWS: GreenContinuityWindow[] = ['oneWeek', 'oneMonth', 'threeMonths', 'oneYear', 'total'];

function clampPercentile(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

export function isGreen(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

export function calculateGreenContinuityScore(percentiles?: GreenContinuityPercentiles): number | null {
  if (!percentiles) return null;

  let weighted = 0;
  let availableWeight = 0;

  for (const window of WINDOWS) {
    const percentile = percentiles[window];
    if (percentile == null) continue;
    const weight = GREEN_CONTINUITY_WEIGHTS[window];
    weighted += clampPercentile(percentile) * weight;
    availableWeight += weight;
  }

  if (availableWeight === 0) return null;
  return Math.round((weighted / availableWeight) * 100) / 100;
}

export function evaluateGreenContinuity(input: GreenContinuityInput): GreenContinuityResult {
  const reasons: string[] = [];
  const green = {
    oneWeek: isGreen(input.returns.oneWeek),
    oneMonth: isGreen(input.returns.oneMonth),
    threeMonths: isGreen(input.returns.threeMonths),
    oneYear: isGreen(input.returns.oneYear),
    total: isGreen(input.returns.total),
  };
  const greenCount = WINDOWS.filter((window) => green[window]).length;
  const pass5of5 = greenCount === WINDOWS.length;
  const structuralTrendIntact = green.threeMonths && green.oneYear && green.total;
  const shortHorizonBreak = structuralTrendIntact && (!green.oneWeek || !green.oneMonth);
  const strengthScore = calculateGreenContinuityScore(input.percentiles);

  const base = {
    ticker: input.ticker,
    engineId: GREEN_CONTINUITY_OMEGA.id,
    greenCount,
    pass5of5,
    green,
    structuralTrendIntact,
    shortHorizonBreak,
    strengthScore,
    reasons,
  } as const;

  if (!input.synchronizedMarketCut) {
    reasons.push('Return windows are not aligned to the same regular-market cut; GREEN output is quarantined.');
    return { ...base, decision: 'QUARANTINE', committeeImpact: 'CAUTION' };
  }

  if (!input.hasOneYearHistory) {
    reasons.push('At least one full year of listed price history is required to classify the 1Y window; other ATLAS engines still run independently.');
    return { ...base, decision: 'INSUFFICIENT_HISTORY', committeeImpact: 'CAUTION' };
  }

  if (input.confirmedStructuralFalsifier) {
    reasons.push('A confirmed structural business falsifier is present; escalate independently to Falsifiers Ω / Red Team for committee veto handling.');
    return { ...base, decision: 'FALSIFIER_ALERT', committeeImpact: 'ESCALATE' };
  }

  if (pass5of5) {
    reasons.push('All five horizons are positive on the same market cut: GREEN 5/5 continuity signal passed. This is supportive evidence, not a final BUY/HOLD instruction.');
    return { ...base, decision: 'PASS_5OF5', committeeImpact: 'POSITIVE' };
  }

  if (shortHorizonBreak) {
    const positionContext = input.existingPosition ? 'existing position' : 'candidate';
    reasons.push(`${positionContext}: 3M, 1Y and TOTAL remain positive, but 1W or 1M continuity broke. Record GREEN 4/5-or-lower short-horizon warning; no automatic portfolio action.`);
    return { ...base, decision: 'SHORT_HORIZON_BREAK', committeeImpact: 'CAUTION' };
  }

  reasons.push('At least one structural price horizon (3M, 1Y or TOTAL) is non-positive. Record a structural trend warning and pass it to Investment Committee Ω; this engine does not issue a final SELL by itself.');
  return { ...base, decision: 'STRUCTURAL_TREND_BREAK', committeeImpact: 'NEGATIVE' };
}

export function rankGreenContinuityResults(results: GreenContinuityResult[]): GreenContinuityResult[] {
  return [...results].sort((a, b) => {
    if (a.pass5of5 !== b.pass5of5) return a.pass5of5 ? -1 : 1;
    if (a.strengthScore == null && b.strengthScore == null) return 0;
    if (a.strengthScore == null) return 1;
    if (b.strengthScore == null) return -1;
    return b.strengthScore - a.strengthScore;
  });
}
