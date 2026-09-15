export type AtlasDecisionMateriality = 'LOW' | 'MATERIAL';
export type AtlasDecisionProtocolState =
  | 'READY_TO_DECIDE'
  | 'BLOCKED_EVIDENCE'
  | 'BLOCKED_DISSENT'
  | 'BLOCKED_UNRESOLVED_CONFLICT';

export interface AtlasDecisionProtocolInput {
  materiality: AtlasDecisionMateriality;
  evidenceTraceable: boolean;
  evidenceIds: string[];
  independentFirstPasses: number;
  counterevidenceSearchCompleted: boolean;
  dissentRaised: boolean;
  unresolvedEvidenceConflict: boolean;
}

export interface AtlasDecisionProtocolOutput {
  state: AtlasDecisionProtocolState;
  mayProceedToHumanDecision: boolean;
  automaticExecutionAllowed: false;
  automaticCanonWriteAllowed: false;
  reasons: string[];
}

export interface ExplainableMindChangeInput {
  previousConclusion: string;
  nextConclusion: string;
  newEvidenceIds: string[];
  affectedVariables: string[];
  causalExplanation: string;
}

export const GOV_CULTURE_001 = {
  id: 'GOV-CULTURE-001',
  version: '1.0.0',
  status: 'ACTIVE_CANONICAL_GOVERNANCE',
  kind: 'TRANSVERSAL_GOVERNANCE_PROTOCOL_NOT_FINANCIAL_ENGINE',
  authority: 'E5_CONTROL_E6_ASSURANCE_HUMAN_SOVEREIGN',
  directStructuralScoreWeight: 0,
  automaticExecutionAllowed: false,
  automaticCanonWriteAllowed: false,
  rules: {
    G1: 'OBLIGATION_TO_DISSENT',
    G2: 'EVIDENCE_MERITOCRACY',
    G3: 'DISAGREE_DECIDE_COMMIT',
    G4: 'ERROR_VISIBILITY',
    G5: 'AUTONOMY_BY_DEFAULT_WITHIN_AUTHORITY',
    G6: 'EXCEPTION_BASED_HUMAN_CONTROL',
    G7: 'METRICS_ALWAYS',
    G8: 'NO_SILENT_STANDARD_DEGRADATION',
    G9: 'INDEPENDENT_FIRST_PASS',
    G10: 'PRESIDENT_IS_NOT_MAJORITY_VOTE',
    G11: 'EXPLAINABLE_MIND_CHANGE',
  },
  reopenDecisionOnlyFor: [
    'NEW_MATERIAL_EVIDENCE',
    'FALSIFIER',
    'REGIME_CHANGE',
    'DEMONSTRATED_ANALYTICAL_ERROR',
    'EXPLICIT_HUMAN_MANDATE_CHANGE',
  ] as const,
  invariants: [
    'EVIDENCE_OVER_AUTHORITY',
    'MAJORITY_DOES_NOT_DETERMINE_TRUTH',
    'DISSENT_BEFORE_MATERIAL_DECISION',
    'COMMIT_AFTER_DECISION_UNTIL_VALID_REOPEN_CONDITION',
    'ANALYSIS_IS_NOT_EXECUTION',
    'NO_AUTOMATIC_CANON_WRITE',
    'NO_SILENT_CONCLUSION_CHANGE',
  ] as const,
} as const;

export function evaluateHighPerformanceDecisionProtocol(
  input: AtlasDecisionProtocolInput,
): AtlasDecisionProtocolOutput {
  const reasons: string[] = [];

  if (!input.evidenceTraceable || input.evidenceIds.length === 0) {
    return {
      state: 'BLOCKED_EVIDENCE',
      mayProceedToHumanDecision: false,
      automaticExecutionAllowed: false,
      automaticCanonWriteAllowed: false,
      reasons: ['Traceable evidence is required before a material ATLAS decision can proceed.'],
    };
  }

  if (input.materiality === 'MATERIAL') {
    if (input.independentFirstPasses < 2 || !input.counterevidenceSearchCompleted || !input.dissentRaised) {
      if (input.independentFirstPasses < 2) reasons.push('Material decisions require at least two independent first passes.');
      if (!input.counterevidenceSearchCompleted) reasons.push('Material decisions require an explicit counterevidence search.');
      if (!input.dissentRaised) reasons.push('Material decisions require an explicit dissent/contrarian pass.');
      return {
        state: 'BLOCKED_DISSENT',
        mayProceedToHumanDecision: false,
        automaticExecutionAllowed: false,
        automaticCanonWriteAllowed: false,
        reasons,
      };
    }
  }

  if (input.unresolvedEvidenceConflict) {
    return {
      state: 'BLOCKED_UNRESOLVED_CONFLICT',
      mayProceedToHumanDecision: false,
      automaticExecutionAllowed: false,
      automaticCanonWriteAllowed: false,
      reasons: ['A material evidence conflict remains unresolved; reduce confidence or resolve it before decision.'],
    };
  }

  return {
    state: 'READY_TO_DECIDE',
    mayProceedToHumanDecision: true,
    automaticExecutionAllowed: false,
    automaticCanonWriteAllowed: false,
    reasons: ['Evidence, independent review and dissent gates are satisfied. Human decision may proceed.'],
  };
}

export function explainableMindChangeSatisfied(input: ExplainableMindChangeInput): boolean {
  if (input.previousConclusion === input.nextConclusion) return true;
  return (
    input.newEvidenceIds.length > 0 &&
    input.affectedVariables.length > 0 &&
    input.causalExplanation.trim().length > 0
  );
}
