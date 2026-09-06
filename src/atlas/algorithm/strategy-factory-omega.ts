export const STRATEGY_FACTORY_OMEGA_VERSION = '2026-09-06-v1.1.0' as const;

export const STRATEGY_FACTORY_OMEGA = {
  id: 'ATLAS_QUANT_LAB_STRATEGY_FACTORY_OMEGA_V1',
  version: STRATEGY_FACTORY_OMEGA_VERSION,
  status: 'FROZEN_SPECIFICATION_ONLY',
  structuralScoreWeight: 0,
  brokerExecutionAuthority: false,
  feeds: [
    'FACTOR_FORGE_OMEGA_V1',
    'STATISTICAL_BACKTEST_FIREWALL_OMEGA_V1',
    'MARKET_CONTEXT_ROUTER_OMEGA_V1',
    'DRIFT_GUARD_OMEGA_V1',
    'TAIL_RISK_DIAGNOSTICS_OMEGA_V1',
    'PORTFOLIO_RISK_UTILITY_RESEARCH_OMEGA_V1',
    'MODEL_LEARNING_GOVERNANCE_OMEGA_V1',
  ] as const,
} as const;

/**
 * Global calibration state. These are factory-level preconditions, not
 * candidate-level metrics. No candidate may become shadow/portfolio eligible
 * while any mandatory precondition is false.
 */
export const STRATEGY_FACTORY_CALIBRATION = {
  endToEndGeneratorBacktesterRunnable: false,
  economicMechanismPriorEnforced: false,
  frictionStage0Pinned: false,
  fullCandidateLedgerAvailable: false,
  nullArmExecuted: false,
  fullFamilyMultiplicityCalibrated: false,
} as const;

export type StrategyFactoryStage =
  | 'IDEA'
  | 'GENERATED'
  | 'DATA_VALID'
  | 'COSTED_BACKTEST_PASS'
  | 'TEMPORAL_VALIDATION_PASS'
  | 'ROBUSTNESS_PASS'
  | 'MULTIPLE_TESTING_PASS'
  | 'SEALED_OOS_PASS'
  | 'PORTFOLIO_ELIGIBLE'
  | 'PAPER'
  | 'LIVE_SHADOW'
  | 'REPEATED_OOS'
  | 'MODEL_LEARNING_REVIEW'
  | 'OPTIONAL_ELIGIBLE';

export type StrategyFactoryRejectCode =
  | 'REJECT_MISSING_PROVENANCE'
  | 'REJECT_DATA_INVALID'
  | 'REJECT_NO_REALISTIC_COST_MODEL'
  | 'REJECT_TEMPORAL_LEAKAGE_RISK'
  | 'REJECT_WALK_FORWARD'
  | 'REJECT_MONTE_CARLO'
  | 'REJECT_PARAMETER_SPIKE'
  | 'REJECT_REGIME_FRAGILITY'
  | 'REJECT_MULTIPLE_TESTING'
  | 'REJECT_DSR'
  | 'REJECT_PBO'
  | 'REJECT_REALITY_CHECK'
  | 'REJECT_SEALED_OOS'
  | 'REJECT_REDUNDANT_PORTFOLIO'
  | 'REJECT_LIVE_SHADOW'
  | 'REJECT_FACTORY_NOT_EMPIRICALLY_CALIBRATED';

export type DiagnosticState = 'PASS' | 'FAIL' | 'NOT_COMPUTED' | 'NOT_APPLICABLE';

export interface StrategyFactoryPolicy {
  minNetSharpe?: number;
  maxNetMaxDrawdown?: number;
  minWalkForwardPositiveShare?: number;
  minMonteCarloSurvivalShare?: number;
  minParameterNeighborPassRate?: number;
  minRegimePositiveShare?: number;
  maxFdrAdjustedPValue?: number;
  minDeflatedSharpeProbability?: number;
  maxPbo?: number;
  requireRealityCheckWhenComputed?: boolean;
  minSealedOosTrades?: number;
  minSealedOosSharpe?: number;
  maxStrategyCorrelationForNewSleeve?: number;
}

export interface StrategyFactoryCandidate {
  candidateId: string;
  candidateVersion: string;
  grammarVersion: string;
  generationSeed?: string | number;
  universe: string;
  timeframe: string;
  benchmark: string;
  provenance: {
    source: string;
    generationMethod: string;
    trialsInFamily: number;
    parameterCombinationsTested: number;
    searchObjective: string;
    dataPeriodVisibleToGenerator: string;
    frozenAt: string;
  } | null;
  dataIntegrity: {
    pointInTime: boolean;
    noLookAhead: boolean;
    survivorshipSafe: boolean;
    corporateActionsNormalized: boolean;
    timestampsConsistent: boolean;
    identityContinuity: boolean;
    reproducibleSnapshot: boolean;
  };
  costedBacktest: {
    spreadIncluded: boolean;
    feesIncluded: boolean;
    slippageIncluded: boolean;
    turnoverIncluded: boolean;
    financingOrBorrowHandled: boolean;
    netSharpe: number;
    netMaxDrawdown: number;
  };
  temporalValidation: {
    chronologicalSplit: boolean;
    purgingAppliedWhenNeeded: boolean;
    embargoAppliedWhenNeeded: boolean;
    sealedHoldoutUntouched: boolean;
    walkForwardPositiveShare: number;
  };
  robustness: {
    monteCarloSurvivalShare: number;
    parameterNeighborCount: number;
    parameterNeighborPassRate: number;
    regimePositiveShare: number;
  };
  multipleTesting: {
    fdrAdjustedPValue: number | null;
    deflatedSharpeProbability: number | null;
    pbo: number | null;
    realityCheck: DiagnosticState;
    spa: DiagnosticState;
  };
  sealedOos: {
    trades: number;
    sharpe: number;
    positiveNetAlphaAfterCosts: boolean;
  };
  portfolio: {
    maxCorrelationToExistingStrategy: number | null;
    incrementalUtilityPositive: boolean;
  };
  liveShadow?: {
    timestampedBeforeOutcome: boolean;
    hypotheticalFillRuleFrozen: boolean;
    observations: number;
    positiveNetAlphaAfterCosts: boolean;
    driftState: 'STABLE' | 'WATCH' | 'REDUCE_MODEL_WEIGHT' | 'SUSPEND_MODEL' | 'EVIDENCE_PENDING';
  };
}

export interface StrategyFactoryEvaluation {
  candidateId: string;
  version: string;
  stage: StrategyFactoryStage;
  passed: boolean;
  rejectCodes: StrategyFactoryRejectCode[];
  notes: string[];
  structuralScoreWeight: 0;
  brokerExecutionAuthority: false;
  shadowEligible: boolean;
}

export const DEFAULT_STRATEGY_FACTORY_POLICY: Required<StrategyFactoryPolicy> = {
  minNetSharpe: 0,
  maxNetMaxDrawdown: 0.5,
  minWalkForwardPositiveShare: 0.6,
  minMonteCarloSurvivalShare: 0.8,
  minParameterNeighborPassRate: 0.6,
  minRegimePositiveShare: 0.6,
  maxFdrAdjustedPValue: 0.05,
  minDeflatedSharpeProbability: 0.95,
  maxPbo: 0.2,
  requireRealityCheckWhenComputed: true,
  minSealedOosTrades: 30,
  minSealedOosSharpe: 0,
  maxStrategyCorrelationForNewSleeve: 0.85,
};

const allTrue = (values: boolean[]) => values.every(Boolean);

export function evaluateStrategyFactoryCandidate(
  c: StrategyFactoryCandidate,
  policy: StrategyFactoryPolicy = DEFAULT_STRATEGY_FACTORY_POLICY,
): StrategyFactoryEvaluation {
  const p = { ...DEFAULT_STRATEGY_FACTORY_POLICY, ...policy };
  const rejectCodes: StrategyFactoryRejectCode[] = [];
  const notes: string[] = [];
  let stage: StrategyFactoryStage = 'GENERATED';

  if (!c.provenance || c.provenance.trialsInFamily < 1 || c.provenance.parameterCombinationsTested < 1) {
    rejectCodes.push('REJECT_MISSING_PROVENANCE');
  }

  const dataValid = allTrue([
    c.dataIntegrity.pointInTime,
    c.dataIntegrity.noLookAhead,
    c.dataIntegrity.survivorshipSafe,
    c.dataIntegrity.corporateActionsNormalized,
    c.dataIntegrity.timestampsConsistent,
    c.dataIntegrity.identityContinuity,
    c.dataIntegrity.reproducibleSnapshot,
  ]);
  if (!dataValid) rejectCodes.push('REJECT_DATA_INVALID');
  if (rejectCodes.length) return rejected(c, stage, rejectCodes, notes);
  stage = 'DATA_VALID';

  const realisticCosts = allTrue([
    c.costedBacktest.spreadIncluded,
    c.costedBacktest.feesIncluded,
    c.costedBacktest.slippageIncluded,
    c.costedBacktest.turnoverIncluded,
    c.costedBacktest.financingOrBorrowHandled,
  ]);
  if (!realisticCosts || c.costedBacktest.netSharpe < p.minNetSharpe || c.costedBacktest.netMaxDrawdown > p.maxNetMaxDrawdown) {
    rejectCodes.push('REJECT_NO_REALISTIC_COST_MODEL');
    return rejected(c, stage, rejectCodes, notes);
  }
  stage = 'COSTED_BACKTEST_PASS';

  if (!allTrue([
    c.temporalValidation.chronologicalSplit,
    c.temporalValidation.purgingAppliedWhenNeeded,
    c.temporalValidation.embargoAppliedWhenNeeded,
    c.temporalValidation.sealedHoldoutUntouched,
  ])) {
    rejectCodes.push('REJECT_TEMPORAL_LEAKAGE_RISK');
  }
  if (c.temporalValidation.walkForwardPositiveShare < p.minWalkForwardPositiveShare) {
    rejectCodes.push('REJECT_WALK_FORWARD');
  }
  if (rejectCodes.length) return rejected(c, stage, rejectCodes, notes);
  stage = 'TEMPORAL_VALIDATION_PASS';

  if (c.robustness.monteCarloSurvivalShare < p.minMonteCarloSurvivalShare) {
    rejectCodes.push('REJECT_MONTE_CARLO');
  }
  if (c.robustness.parameterNeighborCount < 1 || c.robustness.parameterNeighborPassRate < p.minParameterNeighborPassRate) {
    rejectCodes.push('REJECT_PARAMETER_SPIKE');
  }
  if (c.robustness.regimePositiveShare < p.minRegimePositiveShare) {
    rejectCodes.push('REJECT_REGIME_FRAGILITY');
  }
  if (rejectCodes.length) return rejected(c, stage, rejectCodes, notes);
  stage = 'ROBUSTNESS_PASS';

  // Candidate-level values are diagnostic only while the complete generated
  // family/search history is unavailable. The factory remains globally frozen.
  if (c.multipleTesting.fdrAdjustedPValue === null || c.multipleTesting.fdrAdjustedPValue > p.maxFdrAdjustedPValue) {
    rejectCodes.push('REJECT_MULTIPLE_TESTING');
  }
  if (c.multipleTesting.deflatedSharpeProbability !== null && c.multipleTesting.deflatedSharpeProbability < p.minDeflatedSharpeProbability) {
    rejectCodes.push('REJECT_DSR');
  } else if (c.multipleTesting.deflatedSharpeProbability === null) {
    notes.push('DSR_NOT_COMPUTED');
  }
  if (c.multipleTesting.pbo !== null && c.multipleTesting.pbo > p.maxPbo) {
    rejectCodes.push('REJECT_PBO');
  } else if (c.multipleTesting.pbo === null) {
    notes.push('PBO_NOT_COMPUTED');
  }
  const realityDiagnostics = [c.multipleTesting.realityCheck, c.multipleTesting.spa];
  if (p.requireRealityCheckWhenComputed && realityDiagnostics.includes('FAIL')) {
    rejectCodes.push('REJECT_REALITY_CHECK');
  }
  if (realityDiagnostics.every(x => x === 'NOT_COMPUTED' || x === 'NOT_APPLICABLE')) {
    notes.push('REALITY_CHECK_SPA_NOT_COMPUTED');
  }
  if (rejectCodes.length) return rejected(c, stage, rejectCodes, notes);
  stage = 'MULTIPLE_TESTING_PASS';

  if (
    c.sealedOos.trades < p.minSealedOosTrades ||
    c.sealedOos.sharpe < p.minSealedOosSharpe ||
    !c.sealedOos.positiveNetAlphaAfterCosts
  ) {
    rejectCodes.push('REJECT_SEALED_OOS');
    return rejected(c, stage, rejectCodes, notes);
  }
  stage = 'SEALED_OOS_PASS';

  if (
    !c.portfolio.incrementalUtilityPositive ||
    (c.portfolio.maxCorrelationToExistingStrategy !== null &&
      c.portfolio.maxCorrelationToExistingStrategy > p.maxStrategyCorrelationForNewSleeve)
  ) {
    rejectCodes.push('REJECT_REDUNDANT_PORTFOLIO');
    return rejected(c, stage, rejectCodes, notes);
  }
  stage = 'PORTFOLIO_ELIGIBLE';

  if (c.liveShadow) {
    if (
      !c.liveShadow.timestampedBeforeOutcome ||
      !c.liveShadow.hypotheticalFillRuleFrozen ||
      !c.liveShadow.positiveNetAlphaAfterCosts ||
      ['SUSPEND_MODEL', 'EVIDENCE_PENDING'].includes(c.liveShadow.driftState)
    ) {
      rejectCodes.push('REJECT_LIVE_SHADOW');
      return rejected(c, stage, rejectCodes, notes);
    }
    stage = 'LIVE_SHADOW';
  }

  // Freeze is deliberately applied only after diagnostic evaluation so tests
  // can still identify local failure modes, while no apparently good candidate
  // can be promoted before factory-level falsification is complete.
  rejectCodes.push('REJECT_FACTORY_NOT_EMPIRICALLY_CALIBRATED');
  notes.push(
    'END_TO_END_GENERATOR_BACKTESTER_NOT_RUNNABLE',
    'ECONOMIC_MECHANISM_PRIOR_NOT_ENFORCED',
    'FRICTION_STAGE_0_NOT_PINNED',
    'FULL_CANDIDATE_LEDGER_NOT_AVAILABLE',
    'NULL_ARM_NOT_EXECUTED',
    'FULL_FAMILY_MULTIPLICITY_NOT_CALIBRATED',
  );
  return rejected(c, stage, rejectCodes, notes);
}

function rejected(
  c: StrategyFactoryCandidate,
  stage: StrategyFactoryStage,
  rejectCodes: StrategyFactoryRejectCode[],
  notes: string[],
): StrategyFactoryEvaluation {
  return {
    candidateId: c.candidateId,
    version: c.candidateVersion,
    stage,
    passed: false,
    rejectCodes: [...new Set(rejectCodes)],
    notes,
    structuralScoreWeight: 0,
    brokerExecutionAuthority: false,
    shadowEligible: false,
  };
}
