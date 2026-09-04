export const EXPECTATION_GAP_OMEGA_VERSION = '2026-09-04-v1.1.0' as const;

export type ValuationBasis = 'EV_FCFF' | 'MARKET_CAP_FCFE';
export type DiscountRateKind = 'WACC' | 'COST_OF_EQUITY';
export type CapitalIntensity = 'LOW' | 'MEDIUM' | 'HIGH';
export type NormalizationMethod =
  | 'REPORTED_FCF'
  | 'COMPANY_DISCLOSED_MAINTENANCE_CAPEX'
  | 'D_AND_A_PROXY'
  | 'CYCLE_NORMALIZED';
export type ReasonableGrowthSource =
  | 'ANALYST_BASE_CASE'
  | 'MANAGEMENT_ANALYST_BRIDGE'
  | 'CYCLE_NORMALIZED'
  | 'HISTORICAL_ONLY';

export type ExpectationGapState =
  | 'POSITIVE_WIDE'
  | 'POSITIVE'
  | 'NEUTRAL'
  | 'NEGATIVE'
  | 'NEGATIVE_SEVERE'
  | 'EVIDENCE_PENDING';

export interface ExpectationGapInput {
  evidenceTraceable: boolean;
  evidenceIds: string[];
  valuationBasis: ValuationBasis;
  discountRateKind: DiscountRateKind;
  equityOrEnterpriseValue: number;
  startingCashFlow: number;
  discountRatePct: number;
  terminalGrowthPct: number;
  horizonYears: number;
  reasonableGrowthPct: number;
  reasonableGrowthSource: ReasonableGrowthSource;
  normalizationMethod: NormalizationMethod;
  capitalIntensity: CapitalIntensity;
}

export interface ExpectationGapResult {
  state: ExpectationGapState;
  impliedGrowthPct: number | null;
  reasonableGrowthPct: number | null;
  expectationGapPct: number | null;
  directAtlasScoreDelta: 0;
  provisionalResearchAdjustmentBand: string | null;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'EVIDENCE_PENDING';
  reasons: string[];
}

function finite(value: number): boolean {
  return Number.isFinite(value);
}

function evidencePasses(traceable: boolean, ids: string[], minimum = 2): boolean {
  return traceable && ids.filter((id) => id.trim().length > 0).length >= minimum;
}

function valuationBasisIsCoherent(input: ExpectationGapInput): boolean {
  if (input.valuationBasis === 'EV_FCFF') return input.discountRateKind === 'WACC';
  if (input.valuationBasis === 'MARKET_CAP_FCFE') return input.discountRateKind === 'COST_OF_EQUITY';
  return false;
}

export function presentValueFromGrowth(
  startingCashFlow: number,
  growthPct: number,
  discountRatePct: number,
  terminalGrowthPct: number,
  horizonYears: number,
): number | null {
  const values = [startingCashFlow, growthPct, discountRatePct, terminalGrowthPct, horizonYears];
  if (!values.every(Number.isFinite) || startingCashFlow <= 0 || horizonYears < 1) return null;

  const g = growthPct / 100;
  const r = discountRatePct / 100;
  const tg = terminalGrowthPct / 100;
  if (r <= tg || r <= -0.99 || g <= -0.99) return null;

  let pv = 0;
  let cashFlow = startingCashFlow;
  for (let year = 1; year <= Math.floor(horizonYears); year += 1) {
    cashFlow *= (1 + g);
    pv += cashFlow / Math.pow(1 + r, year);
  }

  const terminalValue = cashFlow * (1 + tg) / (r - tg);
  pv += terminalValue / Math.pow(1 + r, Math.floor(horizonYears));
  return pv;
}

export function solveImpliedGrowthPct(
  targetValue: number,
  startingCashFlow: number,
  discountRatePct: number,
  terminalGrowthPct: number,
  horizonYears: number,
): number | null {
  if (![targetValue, startingCashFlow, discountRatePct, terminalGrowthPct, horizonYears].every(Number.isFinite)) return null;
  if (targetValue <= 0 || startingCashFlow <= 0 || horizonYears < 1) return null;

  let low = -50;
  let high = 80;
  const lowPv = presentValueFromGrowth(startingCashFlow, low, discountRatePct, terminalGrowthPct, horizonYears);
  const highPv = presentValueFromGrowth(startingCashFlow, high, discountRatePct, terminalGrowthPct, horizonYears);
  if (lowPv == null || highPv == null || targetValue < lowPv || targetValue > highPv) return null;

  for (let i = 0; i < 120; i += 1) {
    const mid = (low + high) / 2;
    const pv = presentValueFromGrowth(startingCashFlow, mid, discountRatePct, terminalGrowthPct, horizonYears);
    if (pv == null) return null;
    if (pv < targetValue) low = mid;
    else high = mid;
  }
  return Math.round(((low + high) / 2) * 100) / 100;
}

function provisionalBand(gapPct: number): string {
  if (gapPct >= 10) return '+6 to +10 research only';
  if (gapPct >= 5) return '+3 to +6 research only';
  if (gapPct >= 2) return '+1 to +3 research only';
  if (gapPct > -2) return '0 research neutral';
  if (gapPct > -5) return '-1 to -4 research only';
  if (gapPct > -10) return '-5 to -10 research only';
  return '-10 to -15 research only';
}

export function evaluateExpectationGap(input: ExpectationGapInput): ExpectationGapResult {
  const reasons: string[] = [];
  const required = [
    input.equityOrEnterpriseValue,
    input.startingCashFlow,
    input.discountRatePct,
    input.terminalGrowthPct,
    input.horizonYears,
    input.reasonableGrowthPct,
  ];

  if (!evidencePasses(input.evidenceTraceable, input.evidenceIds) || !required.every(finite)) {
    return {
      state: 'EVIDENCE_PENDING', impliedGrowthPct: null, reasonableGrowthPct: null, expectationGapPct: null,
      directAtlasScoreDelta: 0, provisionalResearchAdjustmentBand: null, confidence: 'EVIDENCE_PENDING',
      reasons: ['Expectation Gap requires traceable valuation, cash-flow and growth evidence.'],
    };
  }

  if (!valuationBasisIsCoherent(input)) {
    return {
      state: 'EVIDENCE_PENDING', impliedGrowthPct: null, reasonableGrowthPct: input.reasonableGrowthPct, expectationGapPct: null,
      directAtlasScoreDelta: 0, provisionalResearchAdjustmentBand: null, confidence: 'EVIDENCE_PENDING',
      reasons: ['Valuation basis mismatch: EV/FCFF must use WACC; market-cap/FCFE must use cost of equity.'],
    };
  }

  if (input.discountRatePct <= input.terminalGrowthPct) {
    return {
      state: 'EVIDENCE_PENDING', impliedGrowthPct: null, reasonableGrowthPct: input.reasonableGrowthPct, expectationGapPct: null,
      directAtlasScoreDelta: 0, provisionalResearchAdjustmentBand: null, confidence: 'EVIDENCE_PENDING',
      reasons: ['Discount rate must exceed terminal growth.'],
    };
  }

  if (input.reasonableGrowthSource === 'HISTORICAL_ONLY') {
    reasons.push('Historical CAGR alone cannot define reasonably achievable forward growth.');
  }

  if (input.normalizationMethod === 'D_AND_A_PROXY' && input.capitalIntensity === 'HIGH') {
    reasons.push('D&A as maintenance-CAPEX proxy is low-confidence for capital-intensive businesses and cannot authorize scoring migration.');
  }

  const impliedGrowthPct = solveImpliedGrowthPct(
    input.equityOrEnterpriseValue,
    input.startingCashFlow,
    input.discountRatePct,
    input.terminalGrowthPct,
    input.horizonYears,
  );

  if (impliedGrowthPct == null) {
    return {
      state: 'EVIDENCE_PENDING', impliedGrowthPct: null, reasonableGrowthPct: input.reasonableGrowthPct, expectationGapPct: null,
      directAtlasScoreDelta: 0, provisionalResearchAdjustmentBand: null, confidence: 'EVIDENCE_PENDING',
      reasons: [...reasons, 'Reverse-DCF solver could not bracket a finite implied growth rate under the supplied assumptions.'],
    };
  }

  const expectationGapPct = Math.round((input.reasonableGrowthPct - impliedGrowthPct) * 100) / 100;
  let state: ExpectationGapState = 'NEUTRAL';
  if (expectationGapPct >= 5) state = 'POSITIVE_WIDE';
  else if (expectationGapPct >= 2) state = 'POSITIVE';
  else if (expectationGapPct <= -10) state = 'NEGATIVE_SEVERE';
  else if (expectationGapPct <= -2) state = 'NEGATIVE';

  let confidence: ExpectationGapResult['confidence'] = 'HIGH';
  if (input.reasonableGrowthSource === 'HISTORICAL_ONLY') confidence = 'LOW';
  if (input.normalizationMethod === 'D_AND_A_PROXY') confidence = input.capitalIntensity === 'HIGH' ? 'LOW' : 'MEDIUM';

  reasons.push('Expectation Gap is a standardized Valuation Ω diagnostic already conceptually present in ATLAS; it is not a new standalone business-quality dimension.');
  reasons.push('Direct score delta remains 0 until a score-mapping function is validated out of sample and approved by Model Learning Governance Ω.');

  return {
    state,
    impliedGrowthPct,
    reasonableGrowthPct: input.reasonableGrowthPct,
    expectationGapPct,
    directAtlasScoreDelta: 0,
    provisionalResearchAdjustmentBand: provisionalBand(expectationGapPct),
    confidence,
    reasons,
  };
}
