export const E6_ASSURANCE_HARNESS_POLICY_OMEGA_VERSION = '2026-09-07-v1.0.0' as const;

export const E6_ASSURANCE_HARNESS_POLICY_OMEGA = {
  kind: 'E6_ASSURANCE_CONFIGURATION_NOT_NEW_ENGINE',
  owner: 'E6_ASSURANCE_OMEGA',
  decisionAuthority: false,
  executionAuthority: false,
  canonWriteAuthority: false,
  datasets: {
    D1: 'KNOWN_GOOD',
    D2: 'KNOWN_BAD',
    D3: 'AMBIGUOUS',
    D4: 'ADVERSARIAL',
    D5: 'HISTORICAL_FROZEN_PIT',
    D6: 'UNSEEN_OUT_OF_SAMPLE',
  },
  namespaces: {
    syntheticPrefix: 'SIM-',
    realPrefix: 'AI-',
    syntheticCountsTowardRealQualityGate: false,
    mixedSyntheticRealAggregateAllowed: false,
  },
  noSelfDesignRule: {
    evaluatedComponentMayDesignAllPrimaryTests: false,
    D2D4D5MustBeIndependent: true,
    selfProposedCasesExcludedFromPrimaryMetric: true,
    maxSelfProposedShareForValidMetric: 0.5,
  },
  caseImmutability: {
    retrospectiveEditingAllowed: false,
    badCaseHandling: 'RETIRE_WITH_REASON_KEEP_ORIGINAL_VISIBLE',
    resultRewriteAllowed: false,
  },
  requiredCaseFields: [
    'CASE_ID',
    'PIT_CUTOFF',
    'GROUND_TRUTH',
    'GROUND_TRUTH_JUSTIFICATION',
    'GROUND_TRUTH_OWNER',
    'SYSTEM_VERSION',
    'HARNESS_VERSION',
    'RUN_DATE',
    'DATASET_HASH',
  ],
  metrics: [
    'D1_TRUE_POSITIVE_RATE',
    'D2_TRUE_NEGATIVE_RATE',
    'D3_CORRECT_ABSTENTION_RATE',
    'D4_ADVERSARIAL_RESISTANCE',
    'D5_PIT_FROZEN_ACCURACY',
    'ABSTENTION_RATE',
  ],
  promotionRule: 'NO_SIGNAL_OR_COMPONENT_PROMOTION_FROM_SYNTHETIC_ONLY_EVIDENCE',
} as const;
