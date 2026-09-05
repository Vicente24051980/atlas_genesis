export const ENDOGENOUS_PORTFOLIO_ENGINE_V2_VERSION = '2026-09-05-v2.0.0' as const;
export const MIN_PORTFOLIO_POSITIONS_V2 = 20 as const;
export const MAX_PORTFOLIO_POSITIONS_V2 = 35 as const;

export const CANONICAL_SCENARIOS = [
  'AI_CAPEX_MINUS_30',
  'TREASURY_10Y_PLUS_100BP',
  'US_RECESSION',
  'CREDIT_CRUNCH',
  'PERSISTENT_INFLATION',
  'AI_MONETIZATION_DISAPPOINTS',
  'TAIWAN_CHINA_SHOCK',
  'COMMODITY_SHOCK',
  'HEALTHCARE_REGULATORY_SHOCK',
  'USD_PLUS_MINUS_15',
] as const;

export type ScenarioId = typeof CANONICAL_SCENARIOS[number];
export type IncumbentState = 'GREEN' | 'ORANGE' | 'RED';
export type PortfolioClass =
  | 'CORE_ALPHA'
  | 'CORE_ROBUSTNESS'
  | 'COMPLEMENTARY_ALPHA'
  | 'BORDERLINE'
  | 'REDUNDANT'
  | 'REJECTED';

export type ExpectedReturnBridge = {
  fundamentalGrowthPct: number;
  cashYieldPct: number;
  capitalReturnsPct: number;
  multipleNormalizationPct: number;
};

export type PortfolioCandidateV2 = {
  ticker: string;
  hardGatesPassed: boolean;
  falsifierVetoPassed: boolean;
  expectedReturn: ExpectedReturnBridge;
  permanentLossRisk: number;
  tailRisk: number;
  volatilityRisk: number;
  fragility: number;
  convexity: number;
  confidence: number; // 0..1, reported separately; never folded into Expected Return.
  individualScore: number;
  causalDrivers: Record<string, number>; // signed exposure/intensity, typically -1..1
  fundingSources: string[];
  scenarios: Record<ScenarioId, number>; // impact -5..+5

  // Personal/current-state fields are accepted only to prove non-authority.
  currentInvestedEur?: number;
  currentPositionWeight?: number;
  personalPnLPct?: number;
  personalAverageCost?: number;
  isCurrentlyHeld?: boolean;
};

export type PortfolioEnginePolicyV2 = {
  minPositions?: number;
  maxPositions?: number;
  marginalUtilityThreshold?: number;
  missingDriverRobustnessThreshold?: number;
  requiredStructuralDrivers?: string[];
  alphaDiversification?: number;
  betaRobustness?: number;
  gammaConvexity?: number;
  lambdaPermanentLoss?: number;
  phiFragility?: number;
  rhoCausalRedundancy?: number;
  etaFinancingCorrelation?: number;
  tauTailRisk?: number;
  kappaComplexity?: number;
  uncertaintyPenalty?: number;
  riskWeights?: { permanentLoss: number; tailRisk: number; volatility: number };
  replacementThreshold?: Partial<Record<IncumbentState, number>>;
  maxLocalSearchIterations?: number;
};

export type PortfolioMetricsV2 = {
  n: number;
  equalTestWeight: number;
  expectedReturnPct: number;
  weightedRisk: number;
  permanentLoss: number;
  tailRisk: number;
  volatilityRisk: number;
  fragility: number;
  convexity: number;
  causalDiversification: number;
  causalRedundancy: number;
  financingCorrelation: number;
  robustness: number;
  worstScenarioImpact: number;
  simultaneousAffectedMax: number;
  offsetCapacity: number;
  complexity: number;
  meanConfidence: number;
  utility: number;
  driverCoverage: string[];
};

export type PortfolioFrontierPointV2 = {
  n: number;
  tickers: string[];
  metrics: PortfolioMetricsV2;
  searchMode: 'DETERMINISTIC_LOCAL_SEARCH';
};

export type PortfolioEngineResultV2 = {
  status: 'SELECTED' | 'EVIDENCE_PENDING' | 'INSUFFICIENT_ELIGIBLE_CANDIDATES';
  selectedTickers: string[];
  optimalN: number | null;
  frontier: PortfolioFrontierPointV2[];
  classifications: Record<string, PortfolioClass>;
  reasonNPlusOne: string | null;
  searchMode: 'DETERMINISTIC_LOCAL_SEARCH';
  globalOptimalityProven: false;
  emitsTargetWeights: false;
  emitsEntryTiming: false;
};

const DEFAULT_POLICY: Required<Omit<PortfolioEnginePolicyV2, 'requiredStructuralDrivers'>> & { requiredStructuralDrivers: string[] } = {
  minPositions: MIN_PORTFOLIO_POSITIONS_V2,
  maxPositions: MAX_PORTFOLIO_POSITIONS_V2,
  marginalUtilityThreshold: 0.10,
  missingDriverRobustnessThreshold: 0.15,
  requiredStructuralDrivers: [],
  alphaDiversification: 1.0,
  betaRobustness: 1.0,
  gammaConvexity: 0.35,
  lambdaPermanentLoss: 1.0,
  phiFragility: 0.75,
  rhoCausalRedundancy: 0.80,
  etaFinancingCorrelation: 0.80,
  tauTailRisk: 0.70,
  kappaComplexity: 0.03,
  uncertaintyPenalty: 0.30,
  riskWeights: { permanentLoss: 0.65, tailRisk: 0.20, volatility: 0.15 },
  replacementThreshold: { GREEN: 0.30, ORANGE: 0.15, RED: 0.01 },
  maxLocalSearchIterations: 6,
};

function finite(x: number): boolean { return Number.isFinite(x); }
function mean(xs: number[]): number { return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0; }
function clamp(x: number, lo: number, hi: number): number { return Math.max(lo, Math.min(hi, x)); }

export function expectedReturnPct(c: PortfolioCandidateV2): number {
  const x = c.expectedReturn;
  return x.fundamentalGrowthPct + x.cashYieldPct + x.capitalReturnsPct + x.multipleNormalizationPct;
}

function validateCandidate(c: PortfolioCandidateV2): boolean {
  if (!c.ticker?.trim()) return false;
  const er = c.expectedReturn;
  const numbers = [
    er.fundamentalGrowthPct, er.cashYieldPct, er.capitalReturnsPct, er.multipleNormalizationPct,
    c.permanentLossRisk, c.tailRisk, c.volatilityRisk, c.fragility, c.convexity, c.confidence, c.individualScore,
  ];
  if (!numbers.every(finite)) return false;
  if (c.confidence < 0 || c.confidence > 1) return false;
  for (const s of CANONICAL_SCENARIOS) {
    if (!finite(c.scenarios?.[s]) || c.scenarios[s] < -5 || c.scenarios[s] > 5) return false;
  }
  return Object.values(c.causalDrivers ?? {}).every(finite);
}

function normalizePolicy(policy: PortfolioEnginePolicyV2): typeof DEFAULT_POLICY | null {
  const p = {
    ...DEFAULT_POLICY,
    ...policy,
    riskWeights: { ...DEFAULT_POLICY.riskWeights, ...(policy.riskWeights ?? {}) },
    replacementThreshold: { ...DEFAULT_POLICY.replacementThreshold, ...(policy.replacementThreshold ?? {}) },
    requiredStructuralDrivers: policy.requiredStructuralDrivers ?? [],
  };
  const rw = p.riskWeights;
  if (!Number.isInteger(p.minPositions) || !Number.isInteger(p.maxPositions) || p.minPositions < 20 || p.maxPositions > 35 || p.minPositions > p.maxPositions) return null;
  if (Math.abs(rw.permanentLoss + rw.tailRisk + rw.volatility - 1) > 1e-9) return null;
  return p;
}

function cosineAbs(a: Record<string, number>, b: Record<string, number>): number {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  let dot = 0, aa = 0, bb = 0;
  for (const k of keys) {
    const x = Math.abs(a[k] ?? 0), y = Math.abs(b[k] ?? 0);
    dot += x * y; aa += x * x; bb += y * y;
  }
  if (aa === 0 || bb === 0) return 0;
  return clamp(dot / Math.sqrt(aa * bb), 0, 1);
}

function jaccard(a: string[], b: string[]): number {
  const A = new Set(a.map(x => x.toLowerCase())), B = new Set(b.map(x => x.toLowerCase()));
  if (A.size === 0 || B.size === 0) return 0;
  const intersection = [...A].filter(x => B.has(x)).length;
  const union = new Set([...A, ...B]).size;
  return union ? intersection / union : 0;
}

function averagePairwise<T>(xs: T[], fn: (a: T, b: T) => number): number {
  if (xs.length < 2) return 0;
  let total = 0, n = 0;
  for (let i = 0; i < xs.length; i++) for (let j = i + 1; j < xs.length; j++) { total += fn(xs[i], xs[j]); n++; }
  return n ? total / n : 0;
}

export function evaluatePortfolioSetV2(candidates: PortfolioCandidateV2[], policy: PortfolioEnginePolicyV2 = {}): PortfolioMetricsV2 {
  const p = normalizePolicy(policy);
  if (!p || candidates.length === 0) throw new Error('INVALID_PORTFOLIO_INPUT');
  const n = candidates.length;
  const w = 1 / n;
  const er = mean(candidates.map(expectedReturnPct));
  const permanentLoss = mean(candidates.map(c => c.permanentLossRisk));
  const tailRisk = mean(candidates.map(c => c.tailRisk));
  const volatilityRisk = mean(candidates.map(c => c.volatilityRisk));
  const weightedRisk = p.riskWeights.permanentLoss * permanentLoss + p.riskWeights.tailRisk * tailRisk + p.riskWeights.volatility * volatilityRisk;
  const fragility = mean(candidates.map(c => c.fragility));
  const convexity = mean(candidates.map(c => c.convexity));
  const causalRedundancy = averagePairwise(candidates, (a, b) => cosineAbs(a.causalDrivers, b.causalDrivers));
  const causalDiversification = 1 - causalRedundancy;
  const financingCorrelation = averagePairwise(candidates, (a, b) => jaccard(a.fundingSources, b.fundingSources));

  const scenarioMeans = CANONICAL_SCENARIOS.map(s => mean(candidates.map(c => c.scenarios[s])));
  const worstScenarioImpact = Math.min(...scenarioMeans);
  const simultaneousAffectedMax = Math.max(...CANONICAL_SCENARIOS.map(s => candidates.filter(c => c.scenarios[s] <= -2).length));
  const offsetCapacity = mean(CANONICAL_SCENARIOS.map(s => {
    const neg = candidates.filter(c => c.scenarios[s] < 0).reduce((sum, c) => sum + Math.abs(c.scenarios[s]), 0);
    const pos = candidates.filter(c => c.scenarios[s] > 0).reduce((sum, c) => sum + c.scenarios[s], 0);
    return neg === 0 ? (pos > 0 ? 1 : 0) : clamp(pos / neg, 0, 1);
  }));
  // More negative worst scenario and broader simultaneous damage reduce robustness; offset capacity improves it.
  const robustness = worstScenarioImpact + offsetCapacity - simultaneousAffectedMax / n;
  const complexity = Math.max(0, n - p.minPositions);
  const meanConfidence = mean(candidates.map(c => c.confidence));
  const uncertainty = 1 - meanConfidence;
  const driverCoverage = [...new Set(candidates.flatMap(c => Object.entries(c.causalDrivers).filter(([, v]) => Math.abs(v) > 0.25).map(([k]) => k)))].sort();

  const utility = er
    + p.alphaDiversification * causalDiversification
    + p.betaRobustness * robustness
    + p.gammaConvexity * convexity
    - p.lambdaPermanentLoss * weightedRisk
    - p.phiFragility * fragility
    - p.rhoCausalRedundancy * causalRedundancy
    - p.etaFinancingCorrelation * financingCorrelation
    - p.tauTailRisk * tailRisk
    - p.kappaComplexity * complexity
    - p.uncertaintyPenalty * uncertainty;

  return { n, equalTestWeight: w, expectedReturnPct: er, weightedRisk, permanentLoss, tailRisk, volatilityRisk, fragility, convexity,
    causalDiversification, causalRedundancy, financingCorrelation, robustness, worstScenarioImpact, simultaneousAffectedMax,
    offsetCapacity, complexity, meanConfidence, utility, driverCoverage };
}

function standaloneOpportunity(c: PortfolioCandidateV2, p: PortfolioEnginePolicyV2): number {
  // Confidence is deliberately excluded from ER and used only as an uncertainty cost in set utility.
  return expectedReturnPct(c) - c.permanentLossRisk - c.fragility - c.tailRisk + 0.25 * c.convexity;
}

function localBestForN(eligible: PortfolioCandidateV2[], n: number, policy: PortfolioEnginePolicyV2): PortfolioCandidateV2[] {
  const p = normalizePolicy(policy)!;
  let set = [...eligible].sort((a, b) => standaloneOpportunity(b, policy) - standaloneOpportunity(a, policy) || a.ticker.localeCompare(b.ticker)).slice(0, n);
  let current = evaluatePortfolioSetV2(set, policy).utility;
  for (let iter = 0; iter < p.maxLocalSearchIterations; iter++) {
    let bestGain = 0;
    let bestSet: PortfolioCandidateV2[] | null = null;
    const selected = new Set(set.map(c => c.ticker));
    const outsiders = eligible.filter(c => !selected.has(c.ticker));
    for (let i = 0; i < set.length; i++) {
      for (const out of outsiders) {
        const trial = [...set]; trial[i] = out;
        const u = evaluatePortfolioSetV2(trial, policy).utility;
        const gain = u - current;
        if (gain > bestGain + 1e-12) { bestGain = gain; bestSet = trial; }
      }
    }
    if (!bestSet) break;
    set = bestSet; current += bestGain;
  }
  return set.sort((a, b) => a.ticker.localeCompare(b.ticker));
}

function addsMissingRequiredDriver(a: PortfolioMetricsV2, b: PortfolioMetricsV2, required: string[]): boolean {
  const before = new Set(a.driverCoverage);
  return required.some(d => !before.has(d) && b.driverCoverage.includes(d));
}

function classifyUniverse(selected: PortfolioCandidateV2[], eligible: PortfolioCandidateV2[], all: PortfolioCandidateV2[], policy: PortfolioEnginePolicyV2): Record<string, PortfolioClass> {
  const out: Record<string, PortfolioClass> = {};
  const base = evaluatePortfolioSetV2(selected, policy);
  const erMedian = [...selected.map(expectedReturnPct)].sort((a,b)=>a-b)[Math.floor(selected.length/2)] ?? 0;
  for (const c of all) {
    if (!c.hardGatesPassed || !c.falsifierVetoPassed) { out[c.ticker] = 'REJECTED'; continue; }
    if (!selected.some(x => x.ticker === c.ticker)) {
      out[c.ticker] = standaloneOpportunity(c, policy) > erMedian ? 'REDUNDANT' : 'BORDERLINE';
      continue;
    }
    if (selected.length <= 1) { out[c.ticker] = 'CORE_ALPHA'; continue; }
    const without = selected.filter(x => x.ticker !== c.ticker);
    const m = evaluatePortfolioSetV2(without, policy);
    const removalUtilityLoss = base.utility - m.utility;
    const robustnessLoss = base.robustness - m.robustness;
    if (robustnessLoss > 0.12 && expectedReturnPct(c) < erMedian) out[c.ticker] = 'CORE_ROBUSTNESS';
    else if (removalUtilityLoss > 0.20 || expectedReturnPct(c) >= erMedian) out[c.ticker] = 'CORE_ALPHA';
    else if (removalUtilityLoss > 0.05) out[c.ticker] = 'COMPLEMENTARY_ALPHA';
    else out[c.ticker] = 'BORDERLINE';
  }
  return out;
}

export function runEndogenousPortfolioEngineV2(candidates: PortfolioCandidateV2[], policy: PortfolioEnginePolicyV2 = {}): PortfolioEngineResultV2 {
  const p = normalizePolicy(policy);
  const empty: PortfolioEngineResultV2 = { status: 'EVIDENCE_PENDING', selectedTickers: [], optimalN: null, frontier: [], classifications: {}, reasonNPlusOne: null,
    searchMode: 'DETERMINISTIC_LOCAL_SEARCH', globalOptimalityProven: false, emitsTargetWeights: false, emitsEntryTiming: false };
  if (!p || candidates.some(c => !validateCandidate(c))) return empty;
  const eligible = candidates.filter(c => c.hardGatesPassed && c.falsifierVetoPassed);
  if (eligible.length < p.minPositions) return { ...empty, status: 'INSUFFICIENT_ELIGIBLE_CANDIDATES', classifications: Object.fromEntries(candidates.map(c => [c.ticker, (!c.hardGatesPassed || !c.falsifierVetoPassed) ? 'REJECTED' : 'BORDERLINE'])) as Record<string, PortfolioClass> };

  const upper = Math.min(p.maxPositions, eligible.length);
  const frontier: PortfolioFrontierPointV2[] = [];
  for (let n = p.minPositions; n <= upper; n++) {
    const set = localBestForN(eligible, n, p);
    frontier.push({ n, tickers: set.map(c => c.ticker), metrics: evaluatePortfolioSetV2(set, p), searchMode: 'DETERMINISTIC_LOCAL_SEARCH' });
  }

  let chosenIndex = frontier.length - 1;
  let reason = 'Reached maximum eligible/canonical cardinality.';
  for (let i = 0; i < frontier.length - 1; i++) {
    const a = frontier[i], b = frontier[i + 1];
    const delta = b.metrics.utility - a.metrics.utility;
    const driverException = addsMissingRequiredDriver(a.metrics, b.metrics, p.requiredStructuralDrivers) && (b.metrics.robustness - a.metrics.robustness) >= p.missingDriverRobustnessThreshold;
    if (delta < p.marginalUtilityThreshold && !driverException) {
      chosenIndex = i;
      reason = `N=${a.n} selected because ΔU to N+1=${delta.toFixed(4)} is below material threshold ${p.marginalUtilityThreshold.toFixed(4)} and no missing-driver robustness exception applies.`;
      break;
    }
  }
  const chosen = frontier[chosenIndex];
  const selected = chosen.tickers.map(t => eligible.find(c => c.ticker === t)!).filter(Boolean);
  return { status: 'SELECTED', selectedTickers: chosen.tickers, optimalN: chosen.n, frontier,
    classifications: classifyUniverse(selected, eligible, candidates, p), reasonNPlusOne: reason,
    searchMode: 'DETERMINISTIC_LOCAL_SEARCH', globalOptimalityProven: false, emitsTargetWeights: false, emitsEntryTiming: false };
}

export type ReplacementDecisionV2 = {
  allowed: boolean;
  deltaPortfolioUtility: number;
  threshold: number;
  reason: string;
};

export function evaluateReplacementV2(
  portfolio: PortfolioCandidateV2[], incumbentTicker: string, challenger: PortfolioCandidateV2,
  incumbentState: IncumbentState, policy: PortfolioEnginePolicyV2 = {},
): ReplacementDecisionV2 {
  const p = normalizePolicy(policy);
  if (!p || !challenger.hardGatesPassed || !challenger.falsifierVetoPassed) return { allowed: false, deltaPortfolioUtility: Number.NEGATIVE_INFINITY, threshold: Infinity, reason: 'Challenger fails policy or hard gates.' };
  const idx = portfolio.findIndex(c => c.ticker === incumbentTicker);
  if (idx < 0) return { allowed: false, deltaPortfolioUtility: Number.NEGATIVE_INFINITY, threshold: Infinity, reason: 'Incumbent not found.' };
  const before = evaluatePortfolioSetV2(portfolio, p).utility;
  const afterSet = [...portfolio]; afterSet[idx] = challenger;
  const after = evaluatePortfolioSetV2(afterSet, p).utility;
  const delta = after - before;
  const threshold = p.replacementThreshold[incumbentState] ?? DEFAULT_POLICY.replacementThreshold[incumbentState]!;
  return { allowed: delta >= threshold, deltaPortfolioUtility: delta, threshold,
    reason: delta >= threshold ? 'Replacement materially improves whole-portfolio utility.' : 'Replacement improvement is below hysteresis threshold.' };
}
