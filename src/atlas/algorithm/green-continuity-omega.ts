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
  | 'BUY'
  | 'HOLD'
  | 'WATCH'
  | 'SELL'
  | 'REJECT'
  | 'INSUFFICIENT_HISTORY'
  | 'QUARANTINE';

export type GreenContinuityResult = {
  ticker: string;
  engineId: typeof GREEN_CONTINUITY_OMEGA.id;
  decision: GreenContinuityDecision;
  greenCount: number;
  pass5of5: boolean;
  green: Record<GreenContinuityWindow, boolean>;
  structuralTrendIntact: boolean;
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
  id: 'GREEN_CONTINUITY_OMEGA_V1',
  name: 'GREEN CONTINUITY Ω v1.0',
  role: 'primary_portfolio_engine',
  status: 'canonical',
  mobileFirst: true,
  hardEntryRule: '1W > 0 AND 1M > 0 AND 3M > 0 AND 1Y > 0 AND TOTAL > 0',
  windows: ['oneWeek', 'oneMonth', 'threeMonths', 'oneYear', 'total'] as const,
  rankingWeights: GREEN_CONTINUITY_WEIGHTS,
  constitutionalRules: [
    'Discovery is global and ticker-first before quality, sector, portfolio or narrative filters.',
    'A new position enters through this engine only when all five return windows are positive on one synchronized market cut.',
    'A 5/5 green existing position cannot be sold because of overlap, diversification targets, sector concentration or an arbitrary portfolio-size target.',
    'One-week and one-month weakness are short-horizon warnings; three-month and one-year weakness are structural trend failures for this engine.',
    'A confirmed structural business falsifier can override price continuity and force SELL.',
    'Secondary ATLAS engines refine ranking, quality, valuation, risk, sizing and context; they do not replace this engine as the primary trend selector.',
    'Price strength is the primary selector in this engine, not proof of business quality. Fundamental engines remain mandatory refinement layers.',
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
  const strengthScore = calculateGreenContinuityScore(input.percentiles);

  const base = {
    ticker: input.ticker,
    engineId: GREEN_CONTINUITY_OMEGA.id,
    greenCount,
    pass5of5,
    green,
    structuralTrendIntact,
    strengthScore,
    reasons,
  } as const;

  if (!input.synchronizedMarketCut) {
    reasons.push('Return windows are not aligned to the same market cut; decision is quarantined.');
    return { ...base, decision: 'QUARANTINE' };
  }

  if (!input.hasOneYearHistory) {
    reasons.push('At least one full year of listed price history is required for the 1Y hard gate.');
    return { ...base, decision: 'INSUFFICIENT_HISTORY' };
  }

  if (input.confirmedStructuralFalsifier) {
    reasons.push('A confirmed structural business falsifier overrides price continuity.');
    return { ...base, decision: input.existingPosition ? 'SELL' : 'REJECT' };
  }

  if (!input.existingPosition) {
    if (pass5of5) {
      reasons.push('All five horizons are positive on the same market cut: 5/5 GREEN entry gate passed.');
      return { ...base, decision: 'BUY' };
    }
    reasons.push(`Entry rejected: ${greenCount}/5 horizons are positive; 5/5 GREEN is mandatory.`);
    return { ...base, decision: 'REJECT' };
  }

  if (pass5of5) {
    reasons.push('Existing position remains 5/5 GREEN; primary engine requires HOLD and forbids arbitrary pruning.');
    return { ...base, decision: 'HOLD' };
  }

  if (!green.oneYear || !green.threeMonths || !green.total) {
    reasons.push('Structural trend gate failed because 3M, 1Y or TOTAL is no longer positive.');
    return { ...base, decision: 'SELL' };
  }

  reasons.push('Structural trend remains positive, but 1W or 1M continuity broke; short-horizon weakness requires WATCH rather than an automatic SELL.');
  return { ...base, decision: 'WATCH' };
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
