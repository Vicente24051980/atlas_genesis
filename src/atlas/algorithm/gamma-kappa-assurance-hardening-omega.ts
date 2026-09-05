export const GAMMA_KAPPA_ASSURANCE_HARDENING_OMEGA_VERSION = '2026-09-05-v1.2.0' as const;

export type GammaThresholdOperator = '<' | '<=' | '>' | '>=';
export type GammaRelativeSeverity = 'MINOR' | 'MAJOR' | 'CRITICAL';
export type GammaRelativeState = 'NORMAL' | 'AMBER' | 'RED' | 'NOT_EVALUATED';

export interface GammaRelativeFalsifier {
  id: string;
  ticker: string;
  metric: string;
  baseline: number;
  unit: string;
  baselineSource: string;
  baselinePeriodEnd: string;
  latestPublishedPeriodEndAtSeal: string;
  amberOperator: GammaThresholdOperator;
  amberThreshold: number;
  redOperator: GammaThresholdOperator;
  redThreshold: number;
  window: string;
  weight: number;
  severity: GammaRelativeSeverity;
  observable: boolean;
  causal: boolean;
  thesisRelevant: boolean;
  sealedDefinitionHash?: string;
  currentDefinitionHash?: string;
}

export type GammaIngestionCode =
  | 'PASS'
  | 'THRESHOLD_ALREADY_BREACHED'
  | 'BASELINE_NON_STANDARD'
  | 'THRESHOLD_DIRECTION_MISMATCH'
  | 'RED_NOT_MORE_SEVERE_THAN_AMBER'
  | 'WEIGHTS_TAMPERED'
  | 'INVALID_DEFINITION';

export interface GammaIngestionResult {
  valid: boolean;
  codes: GammaIngestionCode[];
}

export function thresholdCrossed(value: number, operator: GammaThresholdOperator, threshold: number): boolean {
  if (operator === '<') return value < threshold;
  if (operator === '<=') return value <= threshold;
  if (operator === '>') return value > threshold;
  return value >= threshold;
}

function sameDirection(a: GammaThresholdOperator, b: GammaThresholdOperator): boolean {
  return (a.startsWith('<') && b.startsWith('<')) || (a.startsWith('>') && b.startsWith('>'));
}

export function validateGammaRelativeFalsifier(f: GammaRelativeFalsifier): GammaIngestionResult {
  const codes: GammaIngestionCode[] = [];
  const finite = [f.baseline, f.amberThreshold, f.redThreshold, f.weight].every(Number.isFinite);
  if (!f.id.trim() || !f.ticker.trim() || !f.metric.trim() || !f.unit.trim() || !f.baselineSource.trim()
      || !f.window.trim() || !finite || f.weight <= 0 || f.weight > 1
      || !f.observable || !f.causal || !f.thesisRelevant
      || !Number.isFinite(Date.parse(f.baselinePeriodEnd))
      || !Number.isFinite(Date.parse(f.latestPublishedPeriodEndAtSeal))) {
    codes.push('INVALID_DEFINITION');
  }
  if (f.baselinePeriodEnd !== f.latestPublishedPeriodEndAtSeal) codes.push('BASELINE_NON_STANDARD');
  if (thresholdCrossed(f.baseline, f.amberOperator, f.amberThreshold)) codes.push('THRESHOLD_ALREADY_BREACHED');
  if (!sameDirection(f.amberOperator, f.redOperator)) codes.push('THRESHOLD_DIRECTION_MISMATCH');
  if (sameDirection(f.amberOperator, f.redOperator)) {
    if (f.amberOperator.startsWith('<') && f.redThreshold > f.amberThreshold) codes.push('RED_NOT_MORE_SEVERE_THAN_AMBER');
    if (f.amberOperator.startsWith('>') && f.redThreshold < f.amberThreshold) codes.push('RED_NOT_MORE_SEVERE_THAN_AMBER');
  }
  if (f.sealedDefinitionHash && f.currentDefinitionHash && f.sealedDefinitionHash !== f.currentDefinitionHash) {
    codes.push('WEIGHTS_TAMPERED');
  }
  return { valid: codes.length === 0, codes: codes.length ? [...new Set(codes)] : ['PASS'] };
}

export interface GammaRelativeObservation {
  falsifierId: string;
  observedValue?: number | null;
  observedAt?: string;
  evidenceId?: string;
}

export interface GammaRelativeEvaluationRow {
  falsifierId: string;
  state: GammaRelativeState;
  weight: number;
  factor: 0 | 0.5 | 1 | null;
  severity: GammaRelativeSeverity;
}

export interface GammaV12Result {
  state: 'VIGENTE_MEDIBLE' | 'VIGENCIA_NO_EVALUABLE' | 'VIGENCIA_EVIDENCE_PENDING' | 'INGESTION_REJECTED';
  vOmega: number | null;
  rows: GammaRelativeEvaluationRow[];
  criticalRed: string[];
  criticalAmber: string[];
  evaluationCoverage: number;
  directStructuralScoreDelta: 0;
  interpretation: 'NO_DETERIORATION_RELATIVE_TO_SEALED_BASELINE' | 'DETERIORATION_OBSERVED' | 'NOT_EVALUABLE';
  reasons: string[];
}

function stateForObservation(f: GammaRelativeFalsifier, value: number): GammaRelativeState {
  if (thresholdCrossed(value, f.redOperator, f.redThreshold)) return 'RED';
  if (thresholdCrossed(value, f.amberOperator, f.amberThreshold)) return 'AMBER';
  return 'NORMAL';
}

export function evaluateGammaV12(
  definitions: readonly GammaRelativeFalsifier[],
  observations: readonly GammaRelativeObservation[],
): GammaV12Result {
  const validation = definitions.map(validateGammaRelativeFalsifier);
  if (!definitions.length || validation.some((v) => !v.valid)) {
    return {
      state: 'INGESTION_REJECTED', vOmega: null, rows: [], criticalRed: [], criticalAmber: [], evaluationCoverage: 0,
      directStructuralScoreDelta: 0, interpretation: 'NOT_EVALUABLE',
      reasons: validation.flatMap((v) => v.codes).filter((c) => c !== 'PASS'),
    };
  }
  const totalWeight = definitions.reduce((s, f) => s + f.weight, 0);
  if (Math.abs(totalWeight - 1) > 1e-6) {
    return {
      state: 'INGESTION_REJECTED', vOmega: null, rows: [], criticalRed: [], criticalAmber: [], evaluationCoverage: 0,
      directStructuralScoreDelta: 0, interpretation: 'NOT_EVALUABLE', reasons: ['INVALID_WEIGHT_SUM'],
    };
  }

  const obs = new Map(observations.map((o) => [o.falsifierId, o]));
  const rows: GammaRelativeEvaluationRow[] = definitions.map((f) => {
    const value = obs.get(f.id)?.observedValue;
    if (value == null || !Number.isFinite(value)) return { falsifierId: f.id, state: 'NOT_EVALUATED', weight: f.weight, factor: null, severity: f.severity };
    const state = stateForObservation(f, value);
    const factor = state === 'NORMAL' ? 0 : state === 'AMBER' ? 0.5 : 1;
    return { falsifierId: f.id, state, weight: f.weight, factor, severity: f.severity };
  });

  const evaluated = rows.filter((r) => r.factor != null);
  const coverage = evaluated.reduce((s, r) => s + r.weight, 0);
  if (!evaluated.length) {
    return {
      state: 'VIGENCIA_NO_EVALUABLE', vOmega: null, rows, criticalRed: [], criticalAmber: [], evaluationCoverage: 0,
      directStructuralScoreDelta: 0, interpretation: 'NOT_EVALUABLE',
      reasons: ['No registered falsifier has a current observable value. NO_EVALUABLE is neither V_Ω=0 nor V_Ω=1.'],
    };
  }

  const criticalRed = rows.filter((r) => r.severity === 'CRITICAL' && r.state === 'RED').map((r) => r.falsifierId);
  const criticalAmber = rows.filter((r) => r.severity === 'CRITICAL' && r.state === 'AMBER').map((r) => r.falsifierId);
  const nonCritical = rows.filter((r) => r.severity !== 'CRITICAL');
  const nonCriticalEvaluated = nonCritical.filter((r) => r.factor != null);
  const nonCriticalWeight = nonCriticalEvaluated.reduce((s, r) => s + r.weight, 0);
  const deterioration = nonCriticalEvaluated.reduce((s, r) => s + r.weight * (r.factor as number), 0);
  const pending = rows.some((r) => r.state === 'NOT_EVALUATED');
  const vOmega = nonCriticalWeight > 0 ? Math.max(0, Math.min(1, 1 - deterioration / nonCriticalWeight)) : null;
  const anyDeterioration = rows.some((r) => r.state === 'AMBER' || r.state === 'RED');

  return {
    state: pending ? 'VIGENCIA_EVIDENCE_PENDING' : 'VIGENTE_MEDIBLE',
    vOmega,
    rows,
    criticalRed,
    criticalAmber,
    evaluationCoverage: coverage,
    directStructuralScoreDelta: 0,
    interpretation: anyDeterioration ? 'DETERIORATION_OBSERVED' : 'NO_DETERIORATION_RELATIVE_TO_SEALED_BASELINE',
    reasons: [
      'Γ v1.2 measures deterioration relative to the sealed baseline; it does not judge whether the baseline itself was economically good.',
      'AMBER contributes factor 0.5 and RED factor 1.0 for non-critical falsifiers.',
      'CRITICAL states remain outside V_Ω and are surfaced separately.',
      'NOT_EVALUATED never becomes NORMAL.',
    ],
  };
}

export const OMEGA_NE_POLICY_V1 = {
  id: 'OMEGA_NE_POLICY_V1',
  maxEquityWeightWhenNoEvaluable: 0.02,
  escalationAfterConsecutiveQuarters: 2,
  directQualityPenalty: 0 as const,
  vOmegaSubstitution: null,
  rationale: 'Opacity is uncertainty, not deterioration and not verified vigencia.',
} as const;

export interface OmegaNEInput {
  entityIdentityVerified: boolean;
  gammaState: GammaV12Result['state'];
  consecutiveNoEvaluableQuarters: number;
}

export interface OmegaNEResult {
  state: 'NO_SPECIAL_RESTRICTION' | 'NO_EVALUABLE_CAP' | 'ENTITY_IDENTITY_NOT_VERIFIED';
  maxEquityWeight: number | null;
  excludeVOmegaFromUtility: boolean;
  qualityPenalty: 0;
  escalateToXi: boolean;
  downstreamAuthorized: boolean;
}

export function applyOmegaNEPolicy(input: OmegaNEInput): OmegaNEResult {
  if (!input.entityIdentityVerified) {
    return { state: 'ENTITY_IDENTITY_NOT_VERIFIED', maxEquityWeight: null, excludeVOmegaFromUtility: true, qualityPenalty: 0, escalateToXi: false, downstreamAuthorized: false };
  }
  if (input.gammaState === 'VIGENCIA_NO_EVALUABLE') {
    return {
      state: 'NO_EVALUABLE_CAP',
      maxEquityWeight: OMEGA_NE_POLICY_V1.maxEquityWeightWhenNoEvaluable,
      excludeVOmegaFromUtility: true,
      qualityPenalty: 0,
      escalateToXi: input.consecutiveNoEvaluableQuarters >= OMEGA_NE_POLICY_V1.escalationAfterConsecutiveQuarters,
      downstreamAuthorized: true,
    };
  }
  return { state: 'NO_SPECIAL_RESTRICTION', maxEquityWeight: null, excludeVOmegaFromUtility: false, qualityPenalty: 0, escalateToXi: false, downstreamAuthorized: true };
}

export const GAMMA_FALSATION_MATRIX_OMEGA_V1 = {
  transitionThreshold: 0.9,
  attacks: [
    'A1 baseline already breaches AMBER -> THRESHOLD_ALREADY_BREACHED',
    'A2 metric disappears -> NOT_EVALUATED',
    'A3 bad but stable baseline -> V_Ω can remain 1 without quality compensation',
    'A4 CRITICAL cannot be diluted in V_Ω',
    'A5 sealed record mutation -> blocked or LEDGER_TAMPERED',
    'A6 ambiguous/non-published metric -> ingestion rejection',
    'A7 non-latest baseline -> BASELINE_NON_STANDARD',
    'A8 post-seal weight mutation -> blocked or WEIGHTS_TAMPERED',
    'A9 non-causal falsifier -> ingestion rejection',
    'A10 insufficient data -> VIGENCIA_NO_EVALUABLE -> Ω-NE, never 0 or 1',
  ],
  status: 'CANDIDATE_READY_PENDING_EXTERNAL_LEDGER_MIGRATION',
} as const;
