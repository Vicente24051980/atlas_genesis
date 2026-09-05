import {
  calculateCoreConfidenceFromDelta,
  evaluateDeltaDivergence,
  type CoreConfidencePolicy,
  type CoreConfidenceResult,
  type DeltaDivergenceResult,
  type DeltaEvaluatorPass,
} from './greek-contracts-omega';

export const DELTA_FALSATION_OMEGA_VERSION = '2026-09-05-v1.1.0' as const;

export type DeltaAssuranceState = 'MEDIBLE' | 'SHADOW_ONLY' | 'NO_MEDIBLE';

export interface DeltaLineageEvidence {
  evaluatorId: string;
  modelFamilyId: string;
  modelInstanceId: string;
  promptLineageId: string;
  reasoningTemplateId: string;
  evidenceGraphId: string;
  evidenceSnapshotHash: string;
  upstreamProviderIds: string[];
  generationSeedId?: string | null;
  independenceAttestationId?: string | null;
}

export interface DeltaHardenedPass extends DeltaEvaluatorPass {
  lineage: DeltaLineageEvidence;
}

export type DeltaFalsationCode =
  | 'PASS'
  | 'INSUFFICIENT_PASSES'
  | 'DECLARATIVE_INDEPENDENCE_ONLY'
  | 'DUPLICATE_EVALUATOR'
  | 'SHARED_MODEL_INSTANCE'
  | 'SHARED_MODEL_FAMILY'
  | 'SHARED_PROMPT_LINEAGE'
  | 'SHARED_REASONING_TEMPLATE'
  | 'SHARED_UPSTREAM_PROVIDER_SET'
  | 'EVIDENCE_GRAPH_MISMATCH'
  | 'EVIDENCE_SNAPSHOT_MISMATCH'
  | 'NEAR_DUPLICATE_PASS'
  | 'DIMENSION_COVERAGE_TOO_LOW'
  | 'DIMENSION_CHERRY_PICK_RISK'
  | 'BOUNDARY_NORMALIZATION_UNSTABLE'
  | 'INVALID_LINEAGE';

export interface DeltaFalsationFinding {
  code: DeltaFalsationCode;
  severity: 'INFO' | 'SHADOW' | 'BLOCK';
  detail: string;
}

export interface DeltaFalsationResult {
  state: DeltaAssuranceState;
  canonicalDelta: DeltaDivergenceResult | null;
  shadowDelta: DeltaDivergenceResult | null;
  findings: DeltaFalsationFinding[];
  dimensionCoverage: Record<string, number>;
  effectiveIndependentPasses: number;
  coreConfidenceEligible: boolean;
  canConclude: false;
  directAtlasScoreDelta: 0;
}

function signature(values: readonly string[]): string {
  return [...new Set(values)].sort().join('|');
}

function nearDuplicate(a: DeltaHardenedPass, b: DeltaHardenedPass): boolean {
  const p = Math.abs(a.probability - b.probability);
  const c = Math.abs(a.confidence - b.confidence);
  const dims = new Set([...Object.keys(a.dimensionProbabilities ?? {}), ...Object.keys(b.dimensionProbabilities ?? {})]);
  let maxDim = 0;
  for (const d of dims) {
    const av = a.dimensionProbabilities?.[d];
    const bv = b.dimensionProbabilities?.[d];
    if (av == null || bv == null) return false;
    maxDim = Math.max(maxDim, Math.abs(av - bv));
  }
  return p <= 0.005 && c <= 0.005 && maxDim <= 0.01;
}

function validLineage(p: DeltaHardenedPass): boolean {
  const l = p.lineage;
  return !!l && [l.evaluatorId, l.modelFamilyId, l.modelInstanceId, l.promptLineageId, l.reasoningTemplateId,
    l.evidenceGraphId, l.evidenceSnapshotHash].every((x) => typeof x === 'string' && x.trim().length > 0)
    && Array.isArray(l.upstreamProviderIds) && l.upstreamProviderIds.length > 0
    && l.evaluatorId === p.evaluatorId && l.evidenceGraphId === p.alignedEvidenceGraphId;
}

export function falsifyDeltaIndependence(passes: readonly DeltaHardenedPass[]): DeltaFalsationResult {
  const findings: DeltaFalsationFinding[] = [];
  if (passes.length < 3) findings.push({ code: 'INSUFFICIENT_PASSES', severity: 'BLOCK', detail: 'At least three passes are necessary but not sufficient.' });
  if (passes.some((p) => !validLineage(p))) findings.push({ code: 'INVALID_LINEAGE', severity: 'BLOCK', detail: 'Every pass must carry internally consistent lineage evidence.' });
  if (passes.some((p) => !p.lineage.independenceAttestationId?.trim())) findings.push({ code: 'DECLARATIVE_INDEPENDENCE_ONLY', severity: 'BLOCK', detail: '`independent: true` without an auditable attestation never proves independence.' });

  const duplicateField = (selector: (p: DeltaHardenedPass) => string, code: DeltaFalsationCode, detail: string, severity: 'BLOCK'|'SHADOW' = 'BLOCK') => {
    const vals = passes.map(selector);
    if (new Set(vals).size !== vals.length) findings.push({ code, severity, detail });
  };
  duplicateField((p) => p.evaluatorId, 'DUPLICATE_EVALUATOR', 'Evaluator IDs must be unique.');
  duplicateField((p) => p.lineage.modelInstanceId, 'SHARED_MODEL_INSTANCE', 'Two passes share the same model instance.');
  duplicateField((p) => p.lineage.modelFamilyId, 'SHARED_MODEL_FAMILY', 'Canonical independence requires distinct model families; same-family diversity is shadow evidence only.', 'SHADOW');
  duplicateField((p) => p.lineage.promptLineageId, 'SHARED_PROMPT_LINEAGE', 'Shared prompt lineage creates common-mode dependence.');
  duplicateField((p) => p.lineage.reasoningTemplateId, 'SHARED_REASONING_TEMPLATE', 'Shared reasoning templates create common-mode dependence.', 'SHADOW');

  const graphs = new Set(passes.map((p) => p.lineage.evidenceGraphId));
  if (graphs.size !== 1) findings.push({ code: 'EVIDENCE_GRAPH_MISMATCH', severity: 'BLOCK', detail: 'All passes must evaluate the same aligned evidence graph.' });
  const snapshots = new Set(passes.map((p) => p.lineage.evidenceSnapshotHash));
  if (snapshots.size !== 1) findings.push({ code: 'EVIDENCE_SNAPSHOT_MISMATCH', severity: 'BLOCK', detail: 'All passes must see the same frozen evidence snapshot.' });

  const providerSets = passes.map((p) => signature(p.lineage.upstreamProviderIds));
  if (new Set(providerSets).size === 1 && passes.length >= 3) {
    findings.push({ code: 'SHARED_UPSTREAM_PROVIDER_SET', severity: 'SHADOW', detail: 'All evaluators share the same upstream provider set; common-source risk prevents strongest independence claim.' });
  }

  for (let i = 0; i < passes.length; i++) for (let j = i + 1; j < passes.length; j++) {
    if (nearDuplicate(passes[i], passes[j])) {
      findings.push({ code: 'NEAR_DUPLICATE_PASS', severity: 'BLOCK', detail: `Passes ${passes[i].evaluatorId} and ${passes[j].evaluatorId} are numerically near-duplicates.` });
    }
  }

  const dimensions = new Set<string>();
  for (const p of passes) Object.keys(p.dimensionProbabilities ?? {}).forEach((d) => dimensions.add(d));
  const dimensionCoverage: Record<string, number> = {};
  for (const d of dimensions) dimensionCoverage[d] = passes.filter((p) => p.dimensionProbabilities?.[d] != null).length / Math.max(1, passes.length);
  const lowCoverage = Object.entries(dimensionCoverage).filter(([, v]) => v < 1);
  if (lowCoverage.length) findings.push({ code: 'DIMENSION_CHERRY_PICK_RISK', severity: 'SHADOW', detail: `Incomplete dimension coverage: ${lowCoverage.map(([d,v]) => `${d}:${v.toFixed(2)}`).join(', ')}` });
  if (Object.keys(dimensionCoverage).length > 0 && Object.values(dimensionCoverage).some((v) => v < 2/3)) {
    findings.push({ code: 'DIMENSION_COVERAGE_TOO_LOW', severity: 'BLOCK', detail: 'A dimension observed in fewer than two-thirds of passes cannot support canonical per-dimension disagreement.' });
  }

  const raw = evaluateDeltaDivergence(passes);
  if (raw.state === 'MEDIBLE' && raw.meanProbability != null && raw.dOmega != null) {
    const boundary = raw.meanProbability <= 0.02 || raw.meanProbability >= 0.98;
    if (boundary && raw.dOmega > 1e-9) {
      findings.push({ code: 'BOUNDARY_NORMALIZATION_UNSTABLE', severity: 'SHADOW', detail: 'Near Bernoulli boundaries, normalized divergence is hypersensitive to a small denominator. Retain raw sigma/IQR only as shadow evidence.' });
    }
  }

  const hasBlock = findings.some((f) => f.severity === 'BLOCK');
  const hasShadow = findings.some((f) => f.severity === 'SHADOW');
  const state: DeltaAssuranceState = hasBlock ? 'NO_MEDIBLE' : hasShadow ? 'SHADOW_ONLY' : 'MEDIBLE';
  const canonicalDelta = state === 'MEDIBLE' && raw.state === 'MEDIBLE' ? raw : null;
  const shadowDelta = raw.state === 'MEDIBLE' ? raw : null;
  if (!findings.length) findings.push({ code: 'PASS', severity: 'INFO', detail: 'No falsation attack triggered under the declared threat model.' });

  return {
    state,
    canonicalDelta,
    shadowDelta,
    findings,
    dimensionCoverage,
    effectiveIndependentPasses: state === 'MEDIBLE' ? passes.length : 0,
    coreConfidenceEligible: state === 'MEDIBLE' && canonicalDelta?.state === 'MEDIBLE',
    canConclude: false,
    directAtlasScoreDelta: 0,
  };
}

export function calculateHardenedCoreConfidence(
  individualConfidences: readonly number[],
  result: DeltaFalsationResult,
  policy: CoreConfidencePolicy,
): CoreConfidenceResult {
  if (!result.coreConfidenceEligible || !result.canonicalDelta) {
    return {
      state: 'NO_MEDIBLE', meanIndividualConfidence: null, effectiveConfidence: null,
      policyId: policy.policyId, divergencePenaltyK: policy.divergencePenaltyK, formulaOwner: 'CORE_OMEGA',
    };
  }
  return calculateCoreConfidenceFromDelta(individualConfidences, result.canonicalDelta, policy);
}

export const DELTA_FALSATION_MATRIX_OMEGA_V1 = {
  attacks: [
    'D1 declarative independence without auditable lineage',
    'D2 duplicate evaluator/model instance',
    'D3 shared model family',
    'D4 shared prompt lineage/reasoning template',
    'D5 common upstream provider set',
    'D6 aligned graph but non-identical frozen evidence snapshot',
    'D7 numerical near-duplicate passes',
    'D8 selective dimension omission / cherry-picking',
    'D9 Bernoulli-boundary normalization instability',
    'D10 small-N insufficiency',
  ],
  transitionRule: 'MEDIBLE only if no BLOCK or SHADOW finding remains; SHADOW_ONLY never feeds Core Confidence.',
} as const;
