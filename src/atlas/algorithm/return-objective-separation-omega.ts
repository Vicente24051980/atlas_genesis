import {
  marketTapePasses,
  type MarketReturnKind,
  type MarketReturnWindow,
  type UniversalMarketTapeIntegrityResult,
} from './universal-market-tape-integrity-omega';

export type ReturnRankingObjective =
  | 'HISTORICAL_RETURN'
  | 'EXPECTED_RETURN'
  | 'BUSINESS_QUALITY'
  | 'COMPOSITE_OPPORTUNITY';

export type ReturnObjectiveVerdict =
  | 'RANK_ELIGIBLE'
  | 'EVIDENCE_PENDING'
  | 'DATA_INTEGRITY_REJECT'
  | 'ECONOMIC_PROOF_REJECT'
  | 'FALSIFIER_VETO';

export interface ExpectedReturnScenario {
  probability: number;
  totalReturnPct: number;
  label?: string;
}

export type PriceObservationType = 'OFFICIAL_CLOSE' | 'INTRADAY_SNAPSHOT';

export interface ExpectedReturnIntegrity {
  currentPrice: number;
  currency: string;
  primaryListing: string;
  quotationUnit?: string;
  observationDate: string;
  observationType: PriceObservationType;
  observationTimestamp?: string;
  priceEvidenceId: string;
  corporateActionsReconciled: boolean;
  terminalTargetsRebuiltFromCurrentFundamentals: boolean;
  terminalTargetsSameCurrencyAndShareScale: boolean;
}

export interface ReturnObjectiveInput {
  ticker: string;
  objective: ReturnRankingObjective;
  evidenceTraceable: boolean;
  evidenceIds: string[];
  marketTapeIntegrity?: UniversalMarketTapeIntegrityResult;
  historicalTotalReturnPct?: number;
  historicalReturnWindow?: MarketReturnWindow;
  historicalReturnKind?: MarketReturnKind;
  expectedHorizonYears?: number;
  expectedScenarios?: ExpectedReturnScenario[];
  expectedReturnIntegrity?: ExpectedReturnIntegrity;
  businessQualityScore?: number;
  compositeOpportunityScore?: number;
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
  dataIntegrityGate: 'NOT_APPLICABLE' | 'PASS' | 'FAIL';
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

function expectedReturnFromScenarios(scenarios: ExpectedReturnScenario[] | undefined, years: number | undefined) {
  if (!scenarios?.length || years == null || !Number.isFinite(years) || years <= 0) return null;
  const valid = scenarios.filter((s) => Number.isFinite(s.probability) && s.probability > 0 && Number.isFinite(s.totalReturnPct) && s.totalReturnPct >= -100);
  if (!valid.length || valid.length !== scenarios.length) return null;
  const probabilitySum = valid.reduce((sum, s) => sum + s.probability, 0);
  const expectedTerminalMultiple = valid.reduce((sum, s) => sum + (s.probability / probabilitySum) * (1 + s.totalReturnPct / 100), 0);
  const weightedTotalReturnPct = (expectedTerminalMultiple - 1) * 100;
  const cagrPct = annualizeTotalReturn(weightedTotalReturnPct, years);
  return cagrPct == null ? null : { weightedTotalReturnPct, cagrPct };
}

function expectedPriceMatchesTape(input: ReturnObjectiveInput): boolean {
  const i = input.expectedReturnIntegrity;
  const tape = input.marketTapeIntegrity;
  if (!i || !marketTapePasses(tape) || tape?.selectedPrice == null) return false;
  if (!i.quotationUnit?.trim()) return false;
  if (tape.selectedTicker !== input.ticker) return false;
  if (tape.selectedPrimaryListing !== i.primaryListing) return false;
  if (tape.selectedCurrency !== i.currency) return false;
  if (tape.selectedQuotationUnit !== i.quotationUnit) return false;
  if (tape.selectedSourceId !== i.priceEvidenceId) return false;
  if (tape.selectedObservationDate !== i.observationDate) return false;
  if (tape.selectedObservationType !== i.observationType) return false;
  const deltaPct = Math.abs(tape.selectedPrice - i.currentPrice) / Math.max(Math.abs(tape.selectedPrice), Math.abs(i.currentPrice), 1e-9) * 100;
  if (deltaPct > 0.10) return false;
  if (i.observationType === 'INTRADAY_SNAPSHOT') {
    if (!i.observationTimestamp?.trim() || !tape.selectedObservationTimestamp) return false;
    const a = Date.parse(i.observationTimestamp);
    const b = Date.parse(tape.selectedObservationTimestamp);
    if (!Number.isFinite(a) || !Number.isFinite(b) || Math.abs(a - b) > 5 * 60_000) return false;
  }
  return true;
}

function historicalReturnMatchesTape(input: ReturnObjectiveInput): boolean {
  const tape = input.marketTapeIntegrity;
  if (!marketTapePasses(tape)) return false;
  if (tape?.selectedTicker !== input.ticker) return false;
  if (!input.historicalReturnWindow || !input.historicalReturnKind) return false;
  if (!Number.isFinite(input.historicalTotalReturnPct)) return false;
  const selected = tape?.selectedReturns[input.historicalReturnWindow];
  if (!selected || selected.kind !== input.historicalReturnKind) return false;
  return Math.abs(selected.valuePct - (input.historicalTotalReturnPct as number)) <= 0.05;
}

function evaluateEconomicProofGate(input: ReturnObjectiveInput): ReturnObjectiveResult['economicProofGate'] {
  if (input.objective !== 'EXPECTED_RETURN') return 'NOT_APPLICABLE';
  if (input.economicProofPassCount === 5) return 'PASS_5_OF_5';
  if (input.economicProofPassCount === 4 && input.economicProofMaterialFail !== true) return 'PASS_4_OF_5';
  return 'FAIL';
}

function evaluateDataIntegrityGate(input: ReturnObjectiveInput): ReturnObjectiveResult['dataIntegrityGate'] {
  if (input.objective === 'HISTORICAL_RETURN') {
    return historicalReturnMatchesTape(input) ? 'PASS' : 'FAIL';
  }
  if (input.objective !== 'EXPECTED_RETURN') return 'NOT_APPLICABLE';
  const i = input.expectedReturnIntegrity;
  if (!i) return 'FAIL';
  if (!(Number.isFinite(i.currentPrice) && i.currentPrice > 0)) return 'FAIL';
  if (!i.currency.trim() || !i.primaryListing.trim() || !i.quotationUnit?.trim() || !i.observationDate.trim() || !i.priceEvidenceId.trim()) return 'FAIL';
  if (i.observationType === 'INTRADAY_SNAPSHOT' && !i.observationTimestamp?.trim()) return 'FAIL';
  if (!i.corporateActionsReconciled) return 'FAIL';
  if (!i.terminalTargetsRebuiltFromCurrentFundamentals) return 'FAIL';
  if (!i.terminalTargetsSameCurrencyAndShareScale) return 'FAIL';
  if (!expectedPriceMatchesTape(input)) return 'FAIL';
  return 'PASS';
}

export function resolveReturnRankingObjective(intent: string): ReturnRankingObjective {
  const normalized = intent.trim().toLowerCase();
  const historicalMarkers = ['ytd','rentabilidad 2026','retorno 2026','performance 2026','ha subido','han subido','último año','ultimo año','1 año','1a','pasado','histórico','historico'];
  if (historicalMarkers.some((marker) => normalized.includes(marker))) return 'HISTORICAL_RETURN';
  const qualityMarkers = ['mejor empresa','más calidad','mas calidad','business quality','calidad del negocio'];
  if (qualityMarkers.some((marker) => normalized.includes(marker))) return 'BUSINESS_QUALITY';
  const returnMarkers = ['más retorno','mas retorno','máximo retorno','maximo retorno','por retorno','expected return','retorno esperado','retorno futuro','cagr','upside futuro','retorno','rentabilidad'];
  if (returnMarkers.some((marker) => normalized.includes(marker))) return 'EXPECTED_RETURN';
  return 'COMPOSITE_OPPORTUNITY';
}

export function evaluateReturnObjective(input: ReturnObjectiveInput): ReturnObjectiveResult {
  const reasons: string[] = [];
  const economicProofGate = evaluateEconomicProofGate(input);
  const dataIntegrityGate = evaluateDataIntegrityGate(input);
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
    if (dataIntegrityGate === 'PASS') rankingMetric = historicalTotalReturnPct;
    rankingMetricLabel = `${input.historicalReturnKind ?? 'unverified'} ${input.historicalReturnWindow ?? 'window'} %`;
    reasons.push('Historical-return ranking requires the same Universal Market Tape Integrity Ω gate used by every other market-data consumer.');
  } else if (input.objective === 'EXPECTED_RETURN') {
    const expected = expectedReturnFromScenarios(input.expectedScenarios, input.expectedHorizonYears);
    if (expected && dataIntegrityGate === 'PASS') {
      probabilityWeightedTotalReturnPct = expected.weightedTotalReturnPct;
      expectedReturnCagrPct = expected.cagrPct;
      rankingMetric = expected.cagrPct;
    }
    rankingMetricLabel = 'probability-weighted expected CAGR %';
    reasons.push('Expected-return ranking requires Universal Market Tape Integrity Ω for P0 plus contemporaneously rebuilt terminal targets.');
    reasons.push('Business Quality and Economic Proof contribute zero ranking bonus; Economic Proof is a survival gate only.');
  } else if (input.objective === 'BUSINESS_QUALITY') {
    rankingMetric = businessQualityScore ?? null;
    rankingMetricLabel = 'business quality score';
  } else {
    rankingMetric = compositeOpportunityScore ?? null;
    rankingMetricLabel = 'composite opportunity score';
  }

  let verdict: ReturnObjectiveVerdict = 'RANK_ELIGIBLE';
  if (falsifierVeto) verdict = 'FALSIFIER_VETO';
  else if (['HISTORICAL_RETURN', 'EXPECTED_RETURN'].includes(input.objective) && dataIntegrityGate === 'FAIL') verdict = 'DATA_INTEGRITY_REJECT';
  else if (!evidenceOk || rankingMetric == null) verdict = 'EVIDENCE_PENDING';
  else if (input.objective === 'EXPECTED_RETURN' && economicProofGate === 'FAIL') verdict = 'ECONOMIC_PROOF_REJECT';

  if (!evidenceOk) reasons.push('Traceable evidence gate is incomplete.');
  if (['HISTORICAL_RETURN', 'EXPECTED_RETURN'].includes(input.objective) && dataIntegrityGate === 'FAIL') {
    reasons.push('Universal Market Tape Integrity Ω failed: stale, missing, conflicting, identity-mismatched or unreconciled market data cannot receive a canonical rank.');
    for (const violation of input.marketTapeIntegrity?.violations ?? []) reasons.push(`MARKET_TAPE: ${violation}`);
  }
  if (input.objective === 'EXPECTED_RETURN' && economicProofGate === 'FAIL') reasons.push('Expected-return candidate fails the Economic Proof survival gate.');
  if (falsifierVeto) {
    reasons.push('Falsifiers Ω veto is absolute.');
    for (const reason of input.falsifierReasons ?? []) reasons.push(`FALSIFIER: ${reason}`);
  }

  return {
    ticker: input.ticker, objective: input.objective, verdict,
    eligibleForRanking: verdict === 'RANK_ELIGIBLE', rankingMetric, rankingMetricLabel,
    historicalTotalReturnPct: historicalTotalReturnPct ?? undefined,
    probabilityWeightedTotalReturnPct, expectedReturnCagrPct, businessQualityScore, compositeOpportunityScore,
    economicProofGate, dataIntegrityGate, qualityWasUsedAsReturnBonus: false,
    compositeMayAnswerPureReturnQuery: false, reasons,
  };
}

export function rankByReturnObjective(results: ReturnObjectiveResult[]): ReturnObjectiveResult[] {
  return [...results].filter((r) => r.eligibleForRanking && r.rankingMetric != null).sort((a, b) => (b.rankingMetric ?? -Infinity) - (a.rankingMetric ?? -Infinity));
}
