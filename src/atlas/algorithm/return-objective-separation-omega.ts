export type ReturnRankingObjective =
  | 'HISTORICAL_RETURN'
  | 'EXPECTED_RETURN'
  | 'BUSINESS_QUALITY'
  | 'COMPOSITE_OPPORTUNITY';

export type ReturnObjectiveVerdict =
  | 'RANK_ELIGIBLE'
  | 'EVIDENCE_PENDING'
  | 'ECONOMIC_PROOF_REJECT'
  | 'FALSIFIER_VETO';

export interface ExpectedReturnScenario {
  /** Probability weight. Any positive scale is accepted and normalized. */
  probability: number;
  /** Total equity return over the full horizon, in percentage points. */
  totalReturnPct: number;
  label?: string;
}

export interface ReturnObjectiveInput {
  ticker: string;
  objective: ReturnRankingObjective;
  evidenceTraceable: boolean;
  evidenceIds: string[];

  /** Historical total return for the requested past window. */
  historicalTotalReturnPct?: number;

  /** Expected-return scenarios over one common horizon. */
  expectedHorizonYears?: number;
  expectedScenarios?: ExpectedReturnScenario[];

  /** Diagnostics only unless objective === BUSINESS_QUALITY. */
  businessQualityScore?: number;

  /** Existing composite opportunity score. Never allowed to answer a pure-return request. */
  compositeOpportunityScore?: number;

  /**
   * Economic Proof is a survival gate for EXPECTED_RETURN, not an additive ranking bonus.
   * Canon: 5/5 passes; 4/5 passes only when the sole fail is non-material; <=3/5 fails.
   */
  economicProofPassCount?: number;
  economicProofMaterialFail?: boolean;

  falsifierVeto?: boolean;
  falsifierReasons?: string[];
}

export interface ReturnObjectiveResult {
  ticker: string;
  objective: ReturnRankingObjective;
  verdict: ReturnObjectiveVerdict;
  eligibleForRanking: boolean;
  rankingMetric: number | null;
  rankingMetricLabel: string;
  historicalTotalReturnPct?: number;
  probabilityWeightedTotalReturnPct?: number;
  expectedReturnCagrPct?: number;
  businessQualityScore?: number;
  compositeOpportunityScore?: number;
  economicProofGate: 'NOT_APPLICABLE' | 'PASS_5_OF_5' | 'PASS_4_OF_5' | 'FAIL';
  qualityWasUsedAsReturnBonus: false;
  compositeMayAnswerPureReturnQuery: false;
  reasons: string[];
}

function finiteOrNull(value: number | undefined): number | null {
  return value != null && Number.isFinite(value) ? value : null;
}

function clamp100(value: number | undefined): number | undefined {
  if (value == null || !Number.isFinite(value)) return undefined;
  return Math.max(0, Math.min(100, value));
}

function annualizeTotalReturn(totalReturnPct: number, years: number): number | null {
  if (!Number.isFinite(totalReturnPct) || !Number.isFinite(years) || years <= 0) return null;
  const terminalMultiple = 1 + totalReturnPct / 100;
  if (terminalMultiple <= 0) return -100;
  return (Math.pow(terminalMultiple, 1 / years) - 1) * 100;
}

function expectedReturnFromScenarios(
  scenarios: ExpectedReturnScenario[] | undefined,
  years: number | undefined,
): { weightedTotalReturnPct: number; cagrPct: number } | null {
  if (!scenarios?.length || years == null || !Number.isFinite(years) || years <= 0) return null;

  const valid = scenarios.filter(
    (scenario) =>
      Number.isFinite(scenario.probability) &&
      scenario.probability > 0 &&
      Number.isFinite(scenario.totalReturnPct),
  );
  if (!valid.length) return null;

  const probabilitySum = valid.reduce((sum, scenario) => sum + scenario.probability, 0);
  if (!(probabilitySum > 0)) return null;

  const expectedTerminalMultiple = valid.reduce(
    (sum, scenario) =>
      sum + (scenario.probability / probabilitySum) * (1 + scenario.totalReturnPct / 100),
    0,
  );

  const weightedTotalReturnPct = (expectedTerminalMultiple - 1) * 100;
  const cagrPct = annualizeTotalReturn(weightedTotalReturnPct, years);
  if (cagrPct == null) return null;

  return { weightedTotalReturnPct, cagrPct };
}

function evaluateEconomicProofGate(input: ReturnObjectiveInput): ReturnObjectiveResult['economicProofGate'] {
  if (input.objective !== 'EXPECTED_RETURN') return 'NOT_APPLICABLE';

  const passes = input.economicProofPassCount;
  if (passes === 5) return 'PASS_5_OF_5';
  if (passes === 4 && input.economicProofMaterialFail !== true) return 'PASS_4_OF_5';
  return 'FAIL';
}

/**
 * Intent resolver used before any ranking engine runs.
 * Generic "more/max return" means forward expected return unless the request explicitly
 * anchors the metric to a past period (YTD, 2026 performance, 1Y return, etc.).
 */
export function resolveReturnRankingObjective(intent: string): ReturnRankingObjective {
  const normalized = intent.trim().toLowerCase();

  const historicalMarkers = [
    'ytd',
    'rentabilidad 2026',
    'retorno 2026',
    'performance 2026',
    'ha subido',
    'han subido',
    'último año',
    'ultimo año',
    '1 año',
    '1a',
    'pasado',
    'histórico',
    'historico',
  ];
  if (historicalMarkers.some((marker) => normalized.includes(marker))) return 'HISTORICAL_RETURN';

  const qualityMarkers = [
    'mejor empresa',
    'más calidad',
    'mas calidad',
    'business quality',
    'calidad del negocio',
  ];
  if (qualityMarkers.some((marker) => normalized.includes(marker))) return 'BUSINESS_QUALITY';

  const returnMarkers = [
    'más retorno',
    'mas retorno',
    'máximo retorno',
    'maximo retorno',
    'por retorno',
    'expected return',
    'retorno esperado',
    'retorno futuro',
    'cagr',
    'upside futuro',
  ];
  if (returnMarkers.some((marker) => normalized.includes(marker))) return 'EXPECTED_RETURN';

  return 'COMPOSITE_OPPORTUNITY';
}

/**
 * Return Objective Separation Ω
 *
 * Invariants:
 * - HISTORICAL_RETURN ranks only by verified historical total return for the requested window.
 * - EXPECTED_RETURN ranks only by evidence-backed forward expected CAGR.
 * - Business Quality / Economic Proof may gate survival for EXPECTED_RETURN but add zero ranking points.
 * - BUSINESS_QUALITY is its own ranking surface.
 * - COMPOSITE_OPPORTUNITY is explicitly not a pure-return ranking and may never be presented as one.
 * - Falsifiers Ω remains an absolute veto without rewriting the diagnostic ranking metric.
 */
export function evaluateReturnObjective(input: ReturnObjectiveInput): ReturnObjectiveResult {
  const reasons: string[] = [];
  const economicProofGate = evaluateEconomicProofGate(input);
  const evidenceOk = input.evidenceTraceable && input.evidenceIds.length >= 2;
  const falsifierVeto = input.falsifierVeto === true;

  let rankingMetric: number | null = null;
  let rankingMetricLabel = '';
  let probabilityWeightedTotalReturnPct: number | undefined;
  let expectedReturnCagrPct: number | undefined;

  const historicalTotalReturnPct = finiteOrNull(input.historicalTotalReturnPct);
  const businessQualityScore = clamp100(input.businessQualityScore);
  const compositeOpportunityScore = clamp100(input.compositeOpportunityScore);

  if (input.objective === 'HISTORICAL_RETURN') {
    rankingMetric = historicalTotalReturnPct;
    rankingMetricLabel = 'verified historical total return %';
    reasons.push('Historical-return ranking is ordered by the requested past-window return only.');
  } else if (input.objective === 'EXPECTED_RETURN') {
    const expected = expectedReturnFromScenarios(input.expectedScenarios, input.expectedHorizonYears);
    if (expected) {
      probabilityWeightedTotalReturnPct = expected.weightedTotalReturnPct;
      expectedReturnCagrPct = expected.cagrPct;
      rankingMetric = expected.cagrPct;
    }
    rankingMetricLabel = 'probability-weighted expected CAGR %';
    reasons.push('Expected-return ranking is ordered by forward probability-weighted CAGR only.');
    reasons.push('Business Quality and Economic Proof contribute zero ranking bonus; Economic Proof is a survival gate only.');
  } else if (input.objective === 'BUSINESS_QUALITY') {
    rankingMetric = businessQualityScore ?? null;
    rankingMetricLabel = 'business quality score';
    reasons.push('Business-quality ranking is independent from historical and expected return.');
  } else {
    rankingMetric = compositeOpportunityScore ?? null;
    rankingMetricLabel = 'composite opportunity score';
    reasons.push('Composite Opportunity combines multiple engines and is not a pure-return ranking.');
  }

  let verdict: ReturnObjectiveVerdict = 'RANK_ELIGIBLE';
  if (falsifierVeto) {
    verdict = 'FALSIFIER_VETO';
  } else if (!evidenceOk || rankingMetric == null) {
    verdict = 'EVIDENCE_PENDING';
  } else if (input.objective === 'EXPECTED_RETURN' && economicProofGate === 'FAIL') {
    verdict = 'ECONOMIC_PROOF_REJECT';
  }

  if (!evidenceOk) reasons.push('Traceable evidence gate is incomplete.');
  if (input.objective === 'EXPECTED_RETURN' && economicProofGate === 'FAIL') {
    reasons.push('Expected-return candidate fails the Economic Proof survival gate: requires 5/5 or non-material 4/5.');
  }
  if (falsifierVeto) {
    reasons.push('Falsifiers Ω veto is absolute.');
    for (const reason of input.falsifierReasons ?? []) reasons.push(`FALSIFIER: ${reason}`);
  }

  return {
    ticker: input.ticker,
    objective: input.objective,
    verdict,
    eligibleForRanking: verdict === 'RANK_ELIGIBLE',
    rankingMetric,
    rankingMetricLabel,
    historicalTotalReturnPct: historicalTotalReturnPct ?? undefined,
    probabilityWeightedTotalReturnPct,
    expectedReturnCagrPct,
    businessQualityScore,
    compositeOpportunityScore,
    economicProofGate,
    qualityWasUsedAsReturnBonus: false,
    compositeMayAnswerPureReturnQuery: false,
    reasons,
  };
}

export function rankByReturnObjective(results: ReturnObjectiveResult[]): ReturnObjectiveResult[] {
  return [...results]
    .filter((result) => result.eligibleForRanking && result.rankingMetric != null)
    .sort((a, b) => (b.rankingMetric ?? -Infinity) - (a.rankingMetric ?? -Infinity));
}
