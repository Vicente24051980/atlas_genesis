export const TAIL_RISK_DIAGNOSTICS_OMEGA_VERSION = '2026-09-05-v1.0.0' as const;

export const TAIL_RISK_DIAGNOSTICS_OMEGA_GOVERNANCE = {
  status: 'ACTIVE_DIAGNOSTIC',
  directAtlasScoreWeight: 0,
  canAuthorizeBuySell: false,
  canOverrideFalsifierVeto: false,
  canAuthorizeBrokerExecution: false,
  role: 'TAIL_RISK_AND_DRAWDOWN_DIAGNOSTICS',
} as const;

function finiteSeries(values: readonly number[], minimum = 2): boolean {
  return values.length >= minimum && values.every(Number.isFinite);
}

function mean(values: readonly number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function quantile(sortedAscending: readonly number[], q: number): number {
  if (sortedAscending.length === 1) return sortedAscending[0];
  const position = (sortedAscending.length - 1) * q;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) return sortedAscending[lower];
  const weight = position - lower;
  return sortedAscending[lower] * (1 - weight) + sortedAscending[upper] * weight;
}

export function downsideDeviation(returns: readonly number[], target = 0): number | null {
  if (!finiteSeries(returns, 2) || !Number.isFinite(target)) return null;
  const downsideSquares = returns.map((r) => Math.min(0, r - target) ** 2);
  return Math.sqrt(downsideSquares.reduce((sum, value) => sum + value, 0) / returns.length);
}

export function conditionalValueAtRisk(returns: readonly number[], confidence = 0.95): number | null {
  if (!finiteSeries(returns, 20) || !Number.isFinite(confidence) || confidence <= 0 || confidence >= 1) return null;
  const sorted = [...returns].sort((a, b) => a - b);
  const tailCount = Math.max(1, Math.ceil((1 - confidence) * sorted.length));
  const tail = sorted.slice(0, tailCount);
  const tailMean = mean(tail);
  return Math.max(0, -tailMean);
}

export function maximumDrawdown(returns: readonly number[]): number | null {
  if (!finiteSeries(returns, 2)) return null;
  let equity = 1;
  let peak = 1;
  let maxDrawdown = 0;
  for (const r of returns) {
    equity *= 1 + r;
    if (equity > peak) peak = equity;
    if (peak > 0) maxDrawdown = Math.max(maxDrawdown, (peak - equity) / peak);
  }
  return maxDrawdown;
}

export function ulcerIndex(returns: readonly number[]): number | null {
  if (!finiteSeries(returns, 2)) return null;
  let equity = 1;
  let peak = 1;
  const drawdownSquares: number[] = [];
  for (const r of returns) {
    equity *= 1 + r;
    peak = Math.max(peak, equity);
    const drawdownPct = peak > 0 ? ((equity - peak) / peak) * 100 : 0;
    drawdownSquares.push(drawdownPct ** 2);
  }
  return Math.sqrt(mean(drawdownSquares));
}

export function skewness(returns: readonly number[]): number | null {
  if (!finiteSeries(returns, 3)) return null;
  const m = mean(returns);
  const n = returns.length;
  const m2 = returns.reduce((sum, r) => sum + (r - m) ** 2, 0) / n;
  if (m2 === 0) return 0;
  const m3 = returns.reduce((sum, r) => sum + (r - m) ** 3, 0) / n;
  return m3 / Math.pow(m2, 1.5);
}

export function excessKurtosis(returns: readonly number[]): number | null {
  if (!finiteSeries(returns, 4)) return null;
  const m = mean(returns);
  const n = returns.length;
  const m2 = returns.reduce((sum, r) => sum + (r - m) ** 2, 0) / n;
  if (m2 === 0) return -3;
  const m4 = returns.reduce((sum, r) => sum + (r - m) ** 4, 0) / n;
  return m4 / (m2 ** 2) - 3;
}

export function tailRatio(returns: readonly number[]): number | null {
  if (!finiteSeries(returns, 20)) return null;
  const sorted = [...returns].sort((a, b) => a - b);
  const q05 = quantile(sorted, 0.05);
  const q95 = quantile(sorted, 0.95);
  if (q05 === 0) return null;
  return Math.max(0, q95) / Math.abs(Math.min(0, q05));
}

export interface TailRiskDiagnosticInput {
  returns: number[];
  confidence?: number;
  targetReturn?: number;
  evidenceTraceable: boolean;
  evidenceIds: string[];
}

export interface TailRiskDiagnosticResult {
  state: 'AVAILABLE' | 'EVIDENCE_PENDING';
  cvar: number | null;
  downsideDeviation: number | null;
  maxDrawdown: number | null;
  ulcerIndex: number | null;
  skewness: number | null;
  excessKurtosis: number | null;
  tailRatio: number | null;
  directAtlasScoreDelta: 0;
  reasons: string[];
}

export function evaluateTailRiskDiagnostics(input: TailRiskDiagnosticInput): TailRiskDiagnosticResult {
  const evidenceOk = input.evidenceTraceable && input.evidenceIds.some((id) => id.trim().length > 0);
  if (!evidenceOk || !finiteSeries(input.returns, 20)) {
    return {
      state: 'EVIDENCE_PENDING', cvar: null, downsideDeviation: null, maxDrawdown: null, ulcerIndex: null,
      skewness: null, excessKurtosis: null, tailRatio: null, directAtlasScoreDelta: 0,
      reasons: ['Tail Risk Diagnostics requires traceable evidence and at least 20 finite return observations.'],
    };
  }
  const confidence = input.confidence ?? 0.95;
  const target = input.targetReturn ?? 0;
  return {
    state: 'AVAILABLE',
    cvar: conditionalValueAtRisk(input.returns, confidence),
    downsideDeviation: downsideDeviation(input.returns, target),
    maxDrawdown: maximumDrawdown(input.returns),
    ulcerIndex: ulcerIndex(input.returns),
    skewness: skewness(input.returns),
    excessKurtosis: excessKurtosis(input.returns),
    tailRatio: tailRatio(input.returns),
    directAtlasScoreDelta: 0,
    reasons: [
      'Tail metrics diagnose loss shape, drawdown depth/duration pressure and asymmetry; they do not create structural quality points.',
      'CVaR is reported as positive loss magnitude of the worst return tail.',
      'Risk diagnostics feed portfolio review and Competition for Capital without bypassing canonical risk or falsifier gates.',
    ],
  };
}

export interface RiskUtilityInput {
  expectedReturnPct: number;
  cvarPct: number;
  maxDrawdownPct: number;
  turnoverPct: number;
  costsPct: number;
  concentrationPenaltyPct: number;
  lambdaCvar: number;
  lambdaDrawdown: number;
  lambdaTurnover: number;
  lambdaCosts: number;
  lambdaConcentration: number;
}

export function calculateResearchRiskUtility(input: RiskUtilityInput): number | null {
  const values = Object.values(input);
  if (!values.every((value) => Number.isFinite(value))) return null;
  return input.expectedReturnPct
    - input.lambdaCvar * input.cvarPct
    - input.lambdaDrawdown * input.maxDrawdownPct
    - input.lambdaTurnover * input.turnoverPct
    - input.lambdaCosts * input.costsPct
    - input.lambdaConcentration * input.concentrationPenaltyPct;
}

export const TAIL_RISK_ENGINE_MANIFEST = [
  'TAIL_RISK_DIAGNOSTICS_OMEGA_V1',
  'PORTFOLIO_RISK_UTILITY_RESEARCH_OMEGA_V1',
] as const;
