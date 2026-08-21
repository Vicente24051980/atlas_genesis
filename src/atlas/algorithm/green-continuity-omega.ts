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
  | 'PASS_4OF5'
  | 'MIXED_3OF5'
  | 'WEAK_0_TO_2OF5'
  | 'FALSIFIER_ALERT'
  | 'INSUFFICIENT_HISTORY'
  | 'QUARANTINE';

export type GreenContinuityCommitteeImpact =
  | 'POSITIVE'
  | 'POSITIVE_WITH_CAUTION'
  | 'CAUTION'
  | 'NEGATIVE'
  | 'ESCALATE';

export type GreenContinuityResult = {
  ticker: string;
  engineId: typeof GREEN_CONTINUITY_OMEGA.id;
  decision: GreenContinuityDecision;
  committeeImpact: GreenContinuityCommitteeImpact;
  greenCount: number;
  pass5of5: boolean;
  continuityQualified: boolean;
  fullAuditRequired: true;
  green: Record<GreenContinuityWindow, boolean>;
  failedWindows: GreenContinuityWindow[];
  structuralTrendIntact: boolean;
  shortHorizonBreak: boolean;
  structuralTrendBreak: boolean;
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
  id: 'GREEN_CONTINUITY_OMEGA_V1_2',
  name: 'GREEN CONTINUITY Ω v1.2',
  role: 'first_analytical_engine',
  status: 'canonical',
  mobileFirst: true,
  recommendationAuthority: 'INVESTMENT_COMMITTEE_OMEGA',
  allTickerRule: true,
  fullAuditContinuationRule: true,
  preferredContinuityMinimum: 4,
  diagnosticPassRule: '1W > 0 AND 1M > 0 AND 3M > 0 AND 1Y > 0 AND TOTAL > 0',
  windows: ['oneWeek', 'oneMonth', 'threeMonths', 'oneYear', 'total'] as const,
  rankingWeights: GREEN_CONTINUITY_WEIGHTS,
  constitutionalRules: [
    'GREEN CONTINUITY Ω is the first analytical motor after evidence/source/quantitative/temporal integrity and ticker identity normalization.',
    'Every listed-equity ticker analyzed by ATLAS must receive a GREEN CONTINUITY Ω result when sufficient market history exists.',
    'GREEN 5/5 is the strongest continuity class and GREEN 4/5 is continuity-qualified; neither is an automatic BUY.',
    'GREEN 3/5 or lower never terminates the research audit: all registered/applicable ATLAS engines continue to run and the weak GREEN state remains visible.',
    'GREEN is price-continuity evidence only; it is not fundamental evidence and not verified capital flow.',
    'A structural price-horizon break is recorded explicitly but is not by itself a fundamental falsifier.',
    'A confirmed structural business falsifier is escalated to Falsifiers Ω / Red Team; GREEN CONTINUITY Ω does not own the final veto decision.',
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
  const failedWindows = WINDOWS.filter((window) => !green[window]);
  const pass5of5 = greenCount === WINDOWS.length;
  const continuityQualified = greenCount >= GREEN_CONTINUITY_OMEGA.preferredContinuityMinimum;
  const structuralTrendIntact = green.threeMonths && green.oneYear && green.total;
  const shortHorizonBreak = structuralTrendIntact && (!green.oneWeek || !green.oneMonth);
  const structuralTrendBreak = !structuralTrendIntact;
  const strengthScore = calculateGreenContinuityScore(input.percentiles);

  const base = {
    ticker: input.ticker,
    engineId: GREEN_CONTINUITY_OMEGA.id,
    greenCount,
    pass5of5,
    continuityQualified,
    fullAuditRequired: true as const,
    green,
    failedWindows,
    structuralTrendIntact,
    shortHorizonBreak,
    structuralTrendBreak,
    strengthScore,
    reasons,
  } as const;

  if (!input.synchronizedMarketCut) {
    reasons.push('Return windows are not aligned to the same regular-market cut; GREEN output is quarantined. Continue other engines where their own evidence integrity is independently sufficient.');
    return { ...base, decision: 'QUARANTINE', committeeImpact: 'CAUTION' };
  }

  if (!input.hasOneYearHistory) {
    reasons.push('At least one full year of listed price history is unavailable for 1Y classification. The full ATLAS audit still continues through engines whose own data requirements are satisfied.');
    return { ...base, decision: 'INSUFFICIENT_HISTORY', committeeImpact: 'CAUTION' };
  }

  if (input.confirmedStructuralFalsifier) {
    reasons.push('A confirmed structural business falsifier is present; escalate independently to Falsifiers Ω / Red Team. Full engine evidence remains recorded for auditability.');
    return { ...base, decision: 'FALSIFIER_ALERT', committeeImpact: 'ESCALATE' };
  }

  if (greenCount === 5) {
    reasons.push('All five horizons are positive on the same market cut: GREEN 5/5. Continue the complete ATLAS audit; GREEN is supportive continuity evidence, not final recommendation authority.');
    return { ...base, decision: 'PASS_5OF5', committeeImpact: 'POSITIVE' };
  }

  if (greenCount === 4) {
    reasons.push(`GREEN 4/5 continuity-qualified. Failed window(s): ${failedWindows.join(', ')}. Continue the complete ATLAS audit and preserve the failed horizon explicitly.`);
    if (structuralTrendBreak) {
      reasons.push('The failed horizon includes 3M, 1Y or TOTAL; preserve a structural price-trend warning even though the count is 4/5.');
    } else if (shortHorizonBreak) {
      reasons.push('Only a short-horizon continuity break is present; this is not a fundamental falsifier.');
    }
    return { ...base, decision: 'PASS_4OF5', committeeImpact: 'POSITIVE_WITH_CAUTION' };
  }

  if (greenCount === 3) {
    const positionContext = input.existingPosition ? 'existing position' : 'candidate';
    reasons.push(`${positionContext}: GREEN 3/5 mixed continuity. Full audit continues through every registered/applicable engine; do not terminate research because GREEN is below 4/5.`);
    if (structuralTrendBreak) reasons.push('At least one structural price horizon is non-positive; preserve this warning independently from fundamentals.');
    return { ...base, decision: 'MIXED_3OF5', committeeImpact: 'CAUTION' };
  }

  reasons.push(`GREEN ${greenCount}/5 weak continuity. Full audit continues through every registered/applicable engine; the weak price state cannot be overwritten by later engines.`);
  if (structuralTrendBreak) reasons.push('At least one structural price horizon is non-positive; preserve this as a GREEN-specific warning, not automatic fundamental rejection.');
  return { ...base, decision: 'WEAK_0_TO_2OF5', committeeImpact: 'NEGATIVE' };
}

export function rankGreenContinuityResults(results: GreenContinuityResult[]): GreenContinuityResult[] {
  return [...results].sort((a, b) => {
    if (a.greenCount !== b.greenCount) return b.greenCount - a.greenCount;
    if (a.strengthScore == null && b.strengthScore == null) return 0;
    if (a.strengthScore == null) return 1;
    if (b.strengthScore == null) return -1;
    return b.strengthScore - a.strengthScore;
  });
}
