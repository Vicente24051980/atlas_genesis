export const INSTITUTIONAL_FLOW_SCORE_WEIGHTS = {
  realFlows: 0.25,
  breadth: 0.15,
  relativeStrength: 0.15,
  persistentVolume: 0.15,
  leaderAccumulation: 0.10,
  positioningOptions: 0.05,
  revisionsFundamentals: 0.10,
  macroRegime: 0.05,
} as const;

export type InstitutionalFlowScoreInput = Record<keyof typeof INSTITUTIONAL_FLOW_SCORE_WEIGHTS, number>;

export type InstitutionalFlowState =
  | 'NO_FLOW'
  | 'NEUTRAL'
  | 'EARLY_ROTATION'
  | 'INSTITUTIONAL_ACCUMULATION_PROBABLE'
  | 'CONFIRMED_RECEIVER'
  | 'STRONG_CAPITAL_ROTATION';

export type InstitutionalEvidenceGate = {
  realFlowEvidence: boolean;
  independentPositioningEvidence: boolean;
  breadthEvidence: boolean;
  persistentVolumeEvidence: boolean;
  relativeStrengthEvidence: boolean;
  revisionsOrFundamentalEvidence: boolean;
  macroCompatible: boolean;
  evidenceIds: string[];
  unreconciledConflicts: number;
};

export type InstitutionalRotationInput = {
  score: InstitutionalFlowScoreInput;
  evidence: InstitutionalEvidenceGate;
  priorScore?: number | null;
  priorState?: InstitutionalFlowState | null;
  priceTrend?: 'UP' | 'DOWN' | 'FLAT' | 'UNKNOWN';
  breadthTrend?: 'UP' | 'DOWN' | 'FLAT' | 'UNKNOWN';
  flowTrend?: 'UP' | 'DOWN' | 'FLAT' | 'UNKNOWN';
};

export type InstitutionalRotationResult = {
  score: number;
  rawState: InstitutionalFlowState;
  state: InstitutionalFlowState;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  capitalFlowDivergence: boolean;
  distributionWarning: boolean;
  deltaScore: number | null;
  stateChanged: boolean;
  reasons: string[];
  action: 'IGNORE' | 'MONITOR' | 'RESEARCH' | 'CONFIRM_ROTATION' | 'AVOID_CHASING';
};

export const INSTITUTIONAL_CAPITAL_ROTATION_MANIFEST = {
  id: 'INSTITUTIONAL_CAPITAL_ROTATION_OMEGA_V1_0',
  version: '1.0.0',
  status: 'canonical',
  deterministic: true,
  pure: true,
  idempotent: true,
  mobileFirst: true,
  mission:
    'Detect early, independently evidenced institutional capital rotation across sectors, subsectors, factors and regions before consensus, without equating price action with capital flow.',
  invariants: [
    'MARKET_CAP_CHANGE_IS_NOT_CAPITAL_FLOW',
    'PRICE_ONLY_CANNOT_CONFIRM_RECEIVER',
    'CONFIRMED_RECEIVER_REQUIRES_REAL_FLOW_OR_INDEPENDENT_POSITIONING_EVIDENCE',
    'SCORE_AND_EVIDENCE_GATE_ARE_SEPARATE',
    'NO_PORTFOLIO_ORDER_EMITTED_BY_ENGINE',
    'MONEY_ROTATION_OMEGA_REMAINS_LOGICALLY_INDEPENDENT',
  ] as const,
} as const;

function assertScore(name: string, value: number): void {
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new Error(`institutional_rotation_score_out_of_range:${name}`);
  }
}

export function calculateInstitutionalFlowScore(input: InstitutionalFlowScoreInput): number {
  let score = 0;
  for (const key of Object.keys(INSTITUTIONAL_FLOW_SCORE_WEIGHTS) as Array<keyof InstitutionalFlowScoreInput>) {
    assertScore(key, input[key]);
    score += input[key] * INSTITUTIONAL_FLOW_SCORE_WEIGHTS[key];
  }
  return Math.round(score * 100) / 100;
}

export function classifyInstitutionalFlowState(score: number): InstitutionalFlowState {
  assertScore('composite', score);
  if (score >= 85) return 'STRONG_CAPITAL_ROTATION';
  if (score >= 75) return 'CONFIRMED_RECEIVER';
  if (score >= 65) return 'INSTITUTIONAL_ACCUMULATION_PROBABLE';
  if (score >= 55) return 'EARLY_ROTATION';
  if (score >= 40) return 'NEUTRAL';
  return 'NO_FLOW';
}

function stateRank(state: InstitutionalFlowState): number {
  return {
    NO_FLOW: 0,
    NEUTRAL: 1,
    EARLY_ROTATION: 2,
    INSTITUTIONAL_ACCUMULATION_PROBABLE: 3,
    CONFIRMED_RECEIVER: 4,
    STRONG_CAPITAL_ROTATION: 5,
  }[state];
}

function capStateByEvidence(rawState: InstitutionalFlowState, evidence: InstitutionalEvidenceGate, reasons: string[]): InstitutionalFlowState {
  if (evidence.evidenceIds.length === 0) {
    reasons.push('institutional_rotation_requires_traceable_evidence');
    return stateRank(rawState) > stateRank('NEUTRAL') ? 'NEUTRAL' : rawState;
  }
  if (evidence.unreconciledConflicts > 0) {
    reasons.push('institutional_rotation_has_unreconciled_conflicts');
    return stateRank(rawState) > stateRank('EARLY_ROTATION') ? 'EARLY_ROTATION' : rawState;
  }

  const independentCapitalEvidence = evidence.realFlowEvidence || evidence.independentPositioningEvidence;
  if (stateRank(rawState) >= stateRank('CONFIRMED_RECEIVER') && !independentCapitalEvidence) {
    reasons.push('confirmed_receiver_requires_real_flow_or_independent_positioning');
    return 'INSTITUTIONAL_ACCUMULATION_PROBABLE';
  }

  const confirmationDimensions = [
    independentCapitalEvidence,
    evidence.breadthEvidence,
    evidence.persistentVolumeEvidence,
    evidence.relativeStrengthEvidence,
    evidence.revisionsOrFundamentalEvidence,
    evidence.macroCompatible,
  ].filter(Boolean).length;

  if (rawState === 'STRONG_CAPITAL_ROTATION' && confirmationDimensions < 4) {
    reasons.push('strong_rotation_requires_four_independent_confirmation_dimensions');
    return independentCapitalEvidence ? 'CONFIRMED_RECEIVER' : 'INSTITUTIONAL_ACCUMULATION_PROBABLE';
  }

  return rawState;
}

export function detectCapitalFlowDivergence(input: InstitutionalRotationInput): boolean {
  const priceNotYetConfirming = input.priceTrend === 'FLAT' || input.priceTrend === 'DOWN';
  const internalsImproving = input.breadthTrend === 'UP';
  const flowsImproving = input.flowTrend === 'UP';
  return Boolean(priceNotYetConfirming && internalsImproving && flowsImproving);
}

export function detectDistributionWarning(input: InstitutionalRotationInput): boolean {
  const priceStillRising = input.priceTrend === 'UP';
  const breadthDeteriorating = input.breadthTrend === 'DOWN';
  const flowsWeakening = input.flowTrend === 'DOWN';
  return Boolean(priceStillRising && breadthDeteriorating && flowsWeakening);
}

export function assessInstitutionalRotation(input: InstitutionalRotationInput): InstitutionalRotationResult {
  const score = calculateInstitutionalFlowScore(input.score);
  const rawState = classifyInstitutionalFlowState(score);
  const reasons: string[] = [];
  const state = capStateByEvidence(rawState, input.evidence, reasons);
  const capitalFlowDivergence = detectCapitalFlowDivergence(input);
  const distributionWarning = detectDistributionWarning(input);

  if (capitalFlowDivergence) reasons.push('capital_flow_divergence_detected_before_price_confirmation');
  if (distributionWarning) reasons.push('distribution_warning_price_up_breadth_and_flows_down');

  const deltaScore = input.priorScore == null ? null : Math.round((score - input.priorScore) * 100) / 100;
  const stateChanged = input.priorState != null ? input.priorState !== state : false;

  const independentCapitalEvidence = input.evidence.realFlowEvidence || input.evidence.independentPositioningEvidence;
  const dimensions = [
    independentCapitalEvidence,
    input.evidence.breadthEvidence,
    input.evidence.persistentVolumeEvidence,
    input.evidence.relativeStrengthEvidence,
    input.evidence.revisionsOrFundamentalEvidence,
    input.evidence.macroCompatible,
  ].filter(Boolean).length;

  const confidence: InstitutionalRotationResult['confidence'] =
    input.evidence.evidenceIds.length === 0 || input.evidence.unreconciledConflicts > 0
      ? 'LOW'
      : dimensions >= 4
        ? 'HIGH'
        : dimensions >= 2
          ? 'MEDIUM'
          : 'LOW';

  let action: InstitutionalRotationResult['action'] = 'MONITOR';
  if (distributionWarning) action = 'AVOID_CHASING';
  else if (state === 'NO_FLOW') action = 'IGNORE';
  else if (state === 'EARLY_ROTATION' || capitalFlowDivergence) action = 'RESEARCH';
  else if (state === 'CONFIRMED_RECEIVER' || state === 'STRONG_CAPITAL_ROTATION') action = 'CONFIRM_ROTATION';

  return {
    score,
    rawState,
    state,
    confidence,
    capitalFlowDivergence,
    distributionWarning,
    deltaScore,
    stateChanged,
    reasons,
    action,
  };
}
