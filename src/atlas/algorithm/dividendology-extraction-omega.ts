export const DIVIDENDOLOGY_EXTRACTION_OMEGA_VERSION = '2026-09-04-v1.0.0' as const;

export const DIVIDENDOLOGY_EXTRACTION_OMEGA_GOVERNANCE = {
  status: 'ACTIVE_DIAGNOSTIC_OOS_REQUIRED',
  directAtlasScoreWeight: 0,
  canAuthorizeBuySell: false,
  canOverrideFalsifierVeto: false,
  canReplaceCanonicalValuation: false,
  canReplaceCanonicalInstitutionalFlow: false,
  sourceAuthority: 'EXTERNAL_METHOD_DIAGNOSTIC_ONLY',
  migrationRule: 'KEEP_ONLY_INCREMENTAL_SIGNAL_AFTER_OUT_OF_SAMPLE_VALIDATION',
  intentionallyExcludedScoreInputs: ['DIVIDEND_YIELD', 'DIVIDEND_ARISTOCRAT_LABEL', 'DIVIDEND_KING_LABEL'],
  reusedCanonicalEngines: [
    'REINVESTMENT_RUNWAY_ROIC_OMEGA_V1',
    'PER_SHARE_ECONOMICS_OMEGA_V1',
    'MOAT_MIGRATION_OMEGA_V1',
    'CAPITAL_ALLOCATION_QUALITY_OMEGA_V1',
    'VALUATION_OMEGA_EXPECTATION_GAP_REVERSE_DCF',
    'INSTITUTIONAL_CONVERGENCE_OMEGA_V1',
    'MODEL_LEARNING_GOVERNANCE_OMEGA_V1',
  ],
} as const;

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function finite(value: number | undefined): value is number {
  return value != null && Number.isFinite(value);
}

function evidencePasses(traceable: boolean, ids: string[], minimum = 2): boolean {
  return traceable && ids.filter((id) => id.trim().length > 0).length >= minimum;
}

export const COMPOUNDER_EFFICIENCY_RESEARCH_WEIGHTS = {
  reinvestmentRunwayRoic: 0.20,
  fcfQuality: 0.20,
  forwardGrowth: 0.15,
  expectationGap: 0.25,
  capitalAllocation: 0.15,
  moatConfirmation: 0.05,
} as const;

export interface CompounderEfficiencyDiagnosticInput {
  evidenceTraceable: boolean;
  evidenceIds: string[];
  reinvestmentRunwayRoicScore: number;
  fcfQualityScore: number;
  forwardGrowthScore: number;
  expectationGapScore: number;
  capitalAllocationScore: number;
  moatConfirmationScore: number;
}

export type CompounderEfficiencyState = 'ELITE' | 'STRONG' | 'MIXED' | 'WEAK' | 'EVIDENCE_PENDING';

export interface CompounderEfficiencyDiagnosticResult {
  state: CompounderEfficiencyState;
  diagnosticScore: number | null;
  directAtlasScoreDelta: 0;
  weights: typeof COMPOUNDER_EFFICIENCY_RESEARCH_WEIGHTS;
  reasons: string[];
}

export function evaluateCompounderEfficiencyDiagnostic(
  input: CompounderEfficiencyDiagnosticInput,
): CompounderEfficiencyDiagnosticResult {
  const scores = [
    input.reinvestmentRunwayRoicScore,
    input.fcfQualityScore,
    input.forwardGrowthScore,
    input.expectationGapScore,
    input.capitalAllocationScore,
    input.moatConfirmationScore,
  ];

  if (!evidencePasses(input.evidenceTraceable, input.evidenceIds) || !scores.every(Number.isFinite)) {
    return {
      state: 'EVIDENCE_PENDING',
      diagnosticScore: null,
      directAtlasScoreDelta: 0,
      weights: COMPOUNDER_EFFICIENCY_RESEARCH_WEIGHTS,
      reasons: ['Compounder Efficiency requires traceable evidence and all six canonical component scores.'],
    };
  }

  const bounded = scores.map((score) => clamp(score));
  const diagnosticScore =
    bounded[0] * COMPOUNDER_EFFICIENCY_RESEARCH_WEIGHTS.reinvestmentRunwayRoic +
    bounded[1] * COMPOUNDER_EFFICIENCY_RESEARCH_WEIGHTS.fcfQuality +
    bounded[2] * COMPOUNDER_EFFICIENCY_RESEARCH_WEIGHTS.forwardGrowth +
    bounded[3] * COMPOUNDER_EFFICIENCY_RESEARCH_WEIGHTS.expectationGap +
    bounded[4] * COMPOUNDER_EFFICIENCY_RESEARCH_WEIGHTS.capitalAllocation +
    bounded[5] * COMPOUNDER_EFFICIENCY_RESEARCH_WEIGHTS.moatConfirmation;

  let state: CompounderEfficiencyState = 'WEAK';
  if (diagnosticScore >= 85) state = 'ELITE';
  else if (diagnosticScore >= 75) state = 'STRONG';
  else if (diagnosticScore >= 60) state = 'MIXED';

  const reasons = [
    'Diagnostic synthesis only: component economics remain governed by their canonical ATLAS engines.',
    'No component is allowed to earn points twice in the final ATLAS score.',
    'The 25% Expectation Gap research weight is provisional and must survive out-of-sample validation before any scoring migration.',
  ];

  return {
    state,
    diagnosticScore: Math.round(diagnosticScore * 100) / 100,
    directAtlasScoreDelta: 0,
    weights: COMPOUNDER_EFFICIENCY_RESEARCH_WEIGHTS,
    reasons,
  };
}

export interface DividendSustainabilityOverlayInput {
  evidenceTraceable: boolean;
  evidenceIds: string[];
  paysDividend: boolean;
  fcfCagr5Pct?: number;
  dividendCagr5Pct?: number;
  fcfPayoutPct?: number;
  netDebtToEbitda?: number;
  interestCoverageX?: number;
  dividendCutLast10y?: boolean;
}

export type DividendSustainabilityState =
  | 'NOT_APPLICABLE'
  | 'RESILIENT'
  | 'SUSTAINABLE'
  | 'STRETCHED'
  | 'UNSUSTAINABLE'
  | 'EVIDENCE_PENDING';

export interface DividendSustainabilityOverlayResult {
  state: DividendSustainabilityState;
  diagnosticScore: number | null;
  sustainableDistributionDeltaPct: number | null;
  fcfCoverageX: number | null;
  directAtlasScoreDelta: 0;
  noDividendPenalty: 0;
  reasons: string[];
}

function payoutScore(payoutPct: number): number {
  if (payoutPct <= 50) return 100;
  if (payoutPct <= 65) return 85;
  if (payoutPct <= 80) return 65;
  if (payoutPct <= 95) return 40;
  if (payoutPct <= 110) return 20;
  return 0;
}

function distributionDeltaScore(deltaPct: number): number {
  if (deltaPct >= 2) return 100;
  if (deltaPct >= -2) return 85;
  if (deltaPct >= -5) return 65;
  if (deltaPct >= -10) return 35;
  return 10;
}

function leverageScore(netDebtToEbitda?: number, interestCoverageX?: number): number | null {
  const scores: number[] = [];
  if (finite(netDebtToEbitda)) {
    if (netDebtToEbitda <= 1.5) scores.push(100);
    else if (netDebtToEbitda <= 2.5) scores.push(85);
    else if (netDebtToEbitda <= 3.5) scores.push(60);
    else if (netDebtToEbitda <= 4.5) scores.push(30);
    else scores.push(10);
  }
  if (finite(interestCoverageX)) {
    if (interestCoverageX >= 12) scores.push(100);
    else if (interestCoverageX >= 8) scores.push(85);
    else if (interestCoverageX >= 5) scores.push(65);
    else if (interestCoverageX >= 3) scores.push(40);
    else scores.push(10);
  }
  return scores.length ? Math.min(...scores) : null;
}

export function evaluateDividendSustainabilityOverlay(
  input: DividendSustainabilityOverlayInput,
): DividendSustainabilityOverlayResult {
  if (!input.paysDividend) {
    return {
      state: 'NOT_APPLICABLE',
      diagnosticScore: null,
      sustainableDistributionDeltaPct: null,
      fcfCoverageX: null,
      directAtlasScoreDelta: 0,
      noDividendPenalty: 0,
      reasons: ['A non-dividend payer receives neither a bonus nor a penalty. Dividend payment is not an ATLAS quality requirement.'],
    };
  }

  const balanceScore = leverageScore(input.netDebtToEbitda, input.interestCoverageX);
  const required = [input.fcfCagr5Pct, input.dividendCagr5Pct, input.fcfPayoutPct];
  if (!evidencePasses(input.evidenceTraceable, input.evidenceIds) || !required.every(finite) || balanceScore == null) {
    return {
      state: 'EVIDENCE_PENDING',
      diagnosticScore: null,
      sustainableDistributionDeltaPct: null,
      fcfCoverageX: null,
      directAtlasScoreDelta: 0,
      noDividendPenalty: 0,
      reasons: ['Dividend Sustainability requires traceable 5Y FCF/dividend growth, FCF payout, and at least one balance-sheet coverage metric.'],
    };
  }

  const fcfCagr5Pct = input.fcfCagr5Pct as number;
  const dividendCagr5Pct = input.dividendCagr5Pct as number;
  const fcfPayoutPct = input.fcfPayoutPct as number;
  const sustainableDistributionDeltaPct = fcfCagr5Pct - dividendCagr5Pct;
  const fcfCoverageX = fcfPayoutPct > 0 ? 100 / fcfPayoutPct : null;

  let diagnosticScore =
    payoutScore(fcfPayoutPct) * 0.45 +
    distributionDeltaScore(sustainableDistributionDeltaPct) * 0.35 +
    balanceScore * 0.20;

  if (input.dividendCutLast10y === true) diagnosticScore -= 15;
  diagnosticScore = clamp(diagnosticScore);

  let state: DividendSustainabilityState = 'UNSUSTAINABLE';
  const hardUnsustainable =
    fcfPayoutPct > 120 ||
    (fcfPayoutPct > 100 && sustainableDistributionDeltaPct < -5) ||
    (sustainableDistributionDeltaPct < -10 && balanceScore <= 30);

  if (!hardUnsustainable) {
    if (diagnosticScore >= 80) state = 'RESILIENT';
    else if (diagnosticScore >= 65) state = 'SUSTAINABLE';
    else if (diagnosticScore >= 45) state = 'STRETCHED';
  }

  const reasons: string[] = [
    'Dividend yield is deliberately excluded from scoring.',
    'Sustainable Distribution Delta = 5Y FCF CAGR - 5Y dividend CAGR.',
    'The overlay is diagnostic and feeds Capital Allocation / risk review without creating a standalone BUY or SELL.',
  ];
  if (sustainableDistributionDeltaPct < 0) reasons.push('Dividend growth is outrunning FCF growth and is consuming distribution headroom.');
  if (fcfPayoutPct > 100) reasons.push('Dividend payments exceed current FCF and require explicit normalization before sustainability can be claimed.');
  if (input.dividendCutLast10y === true) reasons.push('A dividend cut occurred within the last 10 years; cause and regime change require review.');

  return {
    state,
    diagnosticScore: Math.round(diagnosticScore * 100) / 100,
    sustainableDistributionDeltaPct: Math.round(sustainableDistributionDeltaPct * 100) / 100,
    fcfCoverageX: fcfCoverageX == null ? null : Math.round(fcfCoverageX * 100) / 100,
    directAtlasScoreDelta: 0,
    noDividendPenalty: 0,
    reasons,
  };
}

export interface DividendologyExtractionInput {
  compounder: CompounderEfficiencyDiagnosticInput;
  dividend: DividendSustainabilityOverlayInput;
}

export interface DividendologyExtractionResult {
  compounder: CompounderEfficiencyDiagnosticResult;
  dividend: DividendSustainabilityOverlayResult;
  directAtlasScoreDelta: 0;
  learningStatus: 'EXPERIMENTAL_OUT_OF_SAMPLE_REQUIRED';
  uniqueCandidateSignal: 'SUSTAINABLE_DISTRIBUTION_DELTA_OMEGA_V1';
  redundantSignalsDoNotDoubleCount: readonly string[];
}

export function evaluateDividendologyExtraction(input: DividendologyExtractionInput): DividendologyExtractionResult {
  return {
    compounder: evaluateCompounderEfficiencyDiagnostic(input.compounder),
    dividend: evaluateDividendSustainabilityOverlay(input.dividend),
    directAtlasScoreDelta: 0,
    learningStatus: 'EXPERIMENTAL_OUT_OF_SAMPLE_REQUIRED',
    uniqueCandidateSignal: 'SUSTAINABLE_DISTRIBUTION_DELTA_OMEGA_V1',
    redundantSignalsDoNotDoubleCount: DIVIDENDOLOGY_EXTRACTION_OMEGA_GOVERNANCE.reusedCanonicalEngines,
  };
}
