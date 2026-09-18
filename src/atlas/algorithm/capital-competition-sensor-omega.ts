export type CapitalCompetitionPricePressure =
  | 'DATA_INSUFFICIENT'
  | 'BENIGN'
  | 'ACTIVE'
  | 'STRESSED';

export type CapitalCompetitionTrend =
  | 'UNKNOWN'
  | 'FALLING'
  | 'STABLE'
  | 'RISING';

export type CapitalRationingState =
  | 'UNKNOWN'
  | 'NOT_OBSERVED'
  | 'EARLY_WARNING'
  | 'OBSERVED';

export type YieldAttribution =
  | 'UNKNOWN'
  | 'FED_PATH'
  | 'TERM_PREMIUM_FISCAL'
  | 'AI_CORPORATE_SUPPLY'
  | 'MIXED';

export type FinancingStructure =
  | 'HYPERSCALER_CORPORATE'
  | 'CHIP_ABS'
  | 'SPV_JV'
  | 'NEOCLOUD'
  | 'OTHER';

export type MarginalFinancingSensitivity =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CASE_SPECIFIC';

export type CapitalEvidenceConfidence = 'LOW' | 'MEDIUM' | 'HIGH';

export type CapitalCompetitionInput = {
  traceableEvidenceCount: number;

  // Price of capital / market-clearing evidence.
  marginalConcessionObserved: boolean | null;
  repeatedConcessionOrSpreadWidening: boolean | null;
  aiDebtSupplyRising: boolean | null;
  recentPlacementStillClearing: boolean | null;

  // Quantity/rationing evidence. Price pressure alone MUST NOT promote rationing.
  issueWithdrawalObserved: boolean | null;
  bridgeRefinanceFailureObserved: boolean | null;
  capexCutCitingFinancingCost: boolean | null;

  // Yield attribution controls.
  fedPathShockActive: boolean | null;
  termPremiumOrFiscalSupplyPressure: boolean | null;
  aiCorporateSupplyPressure: boolean | null;

  // Epistemic confidence comes from E1; this sensor does not manufacture it.
  pricePressureConfidence: CapitalEvidenceConfidence;
  trendConfidence: CapitalEvidenceConfidence;
};

export type CapitalCompetitionResult = {
  pricePressure: CapitalCompetitionPricePressure;
  trend: CapitalCompetitionTrend;
  rationing: CapitalRationingState;
  yieldAttribution: YieldAttribution;
  mostExposed: readonly FinancingStructure[];
  financingSensitivity: Record<FinancingStructure, MarginalFinancingSensitivity>;

  // Governance.
  authority: 'E2_SCENARIOS_PLUS_E5_CAUSAL_MAP';
  directScoreWeight: 0;
  irrBonusPenalty: 0;
  canCreateBuySell: false;
  canCreatePortfolioQuota: false;
  canCreateCoreLabel: false;
  canAlterPointZeroRankingDirectly: false;

  reasons: string[];
  falsifiers: string[];
};

export type CapitalFlowObservation = {
  id: string;
  economicDollarId: string;
  kind:
    | 'LOAN'
    | 'BOND'
    | 'EQUITY'
    | 'ASSET_BACKED_FINANCING'
    | 'CAPEX_PURCHASE'
    | 'LEASE'
    | 'OTHER';
};

export type CapitalFlowDeduplicationResult = {
  uniqueEconomicDollars: number;
  duplicateObservationIds: string[];
  independentFundingPoolCredit: 'DERIVED_DO_NOT_COUNT_AS_NEW_POOL';
};

const FINANCING_SENSITIVITY: Record<
  FinancingStructure,
  MarginalFinancingSensitivity
> = {
  HYPERSCALER_CORPORATE: 'LOW',
  CHIP_ABS: 'HIGH',
  SPV_JV: 'HIGH',
  NEOCLOUD: 'HIGH',
  OTHER: 'CASE_SPECIFIC',
};

function observedTrue(value: boolean | null): boolean {
  return value === true;
}

function observedFalse(value: boolean | null): boolean {
  return value === false;
}

export function attributeYieldPressure(
  input: Pick<
    CapitalCompetitionInput,
    | 'fedPathShockActive'
    | 'termPremiumOrFiscalSupplyPressure'
    | 'aiCorporateSupplyPressure'
  >,
): YieldAttribution {
  const active = [
    ['FED_PATH', input.fedPathShockActive],
    ['TERM_PREMIUM_FISCAL', input.termPremiumOrFiscalSupplyPressure],
    ['AI_CORPORATE_SUPPLY', input.aiCorporateSupplyPressure],
  ].filter(([, value]) => value === true) as [YieldAttribution, boolean][];

  if (active.length === 0) return 'UNKNOWN';
  if (active.length > 1) return 'MIXED';
  return active[0][0];
}

export function dedupeCapitalFlows(
  observations: readonly CapitalFlowObservation[],
): CapitalFlowDeduplicationResult {
  const firstByDollar = new Map<string, string>();
  const duplicateObservationIds: string[] = [];

  for (const observation of observations) {
    const existing = firstByDollar.get(observation.economicDollarId);
    if (existing) {
      duplicateObservationIds.push(observation.id);
      continue;
    }
    firstByDollar.set(observation.economicDollarId, observation.id);
  }

  return {
    uniqueEconomicDollars: firstByDollar.size,
    duplicateObservationIds,
    independentFundingPoolCredit: 'DERIVED_DO_NOT_COUNT_AS_NEW_POOL',
  };
}

export function evaluateCapitalCompetitionSensor(
  input: CapitalCompetitionInput,
): CapitalCompetitionResult {
  if (
    !Number.isInteger(input.traceableEvidenceCount) ||
    input.traceableEvidenceCount < 0
  ) {
    throw new Error('capital_competition_traceable_evidence_count_invalid');
  }

  const reasons: string[] = [];
  const falsifiers = [
    'marginal_concessions_normalize_despite_high_ai_financing_supply',
    'credit_spreads_tighten_while_new_ai_financing_continues_to_clear',
    'no_withdrawn_issues_failed_refinancings_or_financing_driven_capex_cuts_emerge',
    'borrowers_move_from_external_financing_to_internal_cash_generation',
  ];

  if (input.traceableEvidenceCount < 2) {
    return {
      pricePressure: 'DATA_INSUFFICIENT',
      trend: 'UNKNOWN',
      rationing: 'UNKNOWN',
      yieldAttribution: attributeYieldPressure(input),
      mostExposed: ['CHIP_ABS', 'SPV_JV', 'NEOCLOUD'],
      financingSensitivity: FINANCING_SENSITIVITY,
      authority: 'E2_SCENARIOS_PLUS_E5_CAUSAL_MAP',
      directScoreWeight: 0,
      irrBonusPenalty: 0,
      canCreateBuySell: false,
      canCreatePortfolioQuota: false,
      canCreateCoreLabel: false,
      canAlterPointZeroRankingDirectly: false,
      reasons: ['At least two traceable evidence records are required.'],
      falsifiers,
    };
  }

  let pricePressure: CapitalCompetitionPricePressure = 'BENIGN';
  if (
    observedTrue(input.repeatedConcessionOrSpreadWidening) &&
    observedTrue(input.marginalConcessionObserved)
  ) {
    pricePressure = 'STRESSED';
    reasons.push(
      'Repeated marginal financing concessions/spread widening indicate stressed price-of-capital conditions.',
    );
  } else if (
    observedTrue(input.marginalConcessionObserved) ||
    observedTrue(input.aiDebtSupplyRising)
  ) {
    pricePressure = 'ACTIVE';
    reasons.push(
      'Marginal financing concessions and/or rising AI debt supply indicate active price pressure.',
    );
  }

  let trend: CapitalCompetitionTrend = 'UNKNOWN';
  if (
    observedTrue(input.aiDebtSupplyRising) &&
    (observedTrue(input.marginalConcessionObserved) ||
      observedTrue(input.repeatedConcessionOrSpreadWidening))
  ) {
    trend = 'RISING';
  } else if (
    observedFalse(input.aiDebtSupplyRising) &&
    observedFalse(input.marginalConcessionObserved)
  ) {
    trend = 'FALLING';
  } else if (
    input.aiDebtSupplyRising !== null &&
    input.marginalConcessionObserved !== null
  ) {
    trend = 'STABLE';
  }

  const hardRationingEvidence =
    observedTrue(input.issueWithdrawalObserved) ||
    observedTrue(input.bridgeRefinanceFailureObserved) ||
    observedTrue(input.capexCutCitingFinancingCost);

  let rationing: CapitalRationingState = 'UNKNOWN';
  if (hardRationingEvidence) {
    rationing = 'OBSERVED';
    reasons.push(
      'Quantity rationing is observed because financing failed/was withdrawn or CAPEX was cut citing financing cost.',
    );
  } else if (
    observedTrue(input.recentPlacementStillClearing) &&
    observedFalse(input.issueWithdrawalObserved) &&
    observedFalse(input.bridgeRefinanceFailureObserved) &&
    observedFalse(input.capexCutCitingFinancingCost)
  ) {
    rationing = 'NOT_OBSERVED';
    reasons.push(
      'Capital is more expensive at the margin but still clearing; price pressure is not quantity rationing.',
    );
  } else if (
    pricePressure === 'STRESSED' &&
    input.recentPlacementStillClearing !== true
  ) {
    rationing = 'EARLY_WARNING';
    reasons.push(
      'Stressed financing price plus incomplete clearing evidence warrants a rationing warning, not a confirmed rationing state.',
    );
  }

  const yieldAttribution = attributeYieldPressure(input);
  if (yieldAttribution === 'MIXED') {
    reasons.push(
      'Yield attribution is mixed; Fed-path, fiscal/term-premium and AI corporate-supply effects must not be collapsed into one cause.',
    );
  }

  return {
    pricePressure,
    trend,
    rationing,
    yieldAttribution,
    mostExposed: ['CHIP_ABS', 'SPV_JV', 'NEOCLOUD'],
    financingSensitivity: FINANCING_SENSITIVITY,
    authority: 'E2_SCENARIOS_PLUS_E5_CAUSAL_MAP',
    directScoreWeight: 0,
    irrBonusPenalty: 0,
    canCreateBuySell: false,
    canCreatePortfolioQuota: false,
    canCreateCoreLabel: false,
    canAlterPointZeroRankingDirectly: false,
    reasons,
    falsifiers,
  };
}

export const CAPITAL_COMPETITION_SENSOR_OMEGA = {
  id: 'CAPITAL_COMPETITION_SENSOR_OMEGA_V1',
  name: 'Capital Competition Ω — sensor v1.0',
  placement: 'CAPITAL_FORMATION_SENSOR',
  primaryEngineStatus: 'NOT_A_NEW_PRIMARY_ENGINE',
  directScoreWeight: 0,
  authority: 'E2_SCENARIOS_PLUS_E5_CAUSAL_MAP',
  laws: [
    'PRICE_OF_CAPITAL_IS_NOT_QUANTITY_RATIONING',
    'YIELD_ATTRIBUTION_MUST_CONTROL_FOR_FED_PATH_AND_TERM_PREMIUM',
    'BORROWER_STRUCTURE_MATTERS',
    'HYPERSCALER_CORPORATE_FINANCING_IS_NOT_EQUIVALENT_TO_CHIP_ABS_SPV_OR_NEOCLOUD_FINANCING',
    'SAME_ECONOMIC_DOLLAR_COUNTS_ONCE',
    'CAPITAL_IS_A_PARENT_CAUSAL_FACTOR_NOT_A_LINEAR_FIRST_LINK',
    'NO_DIRECT_IRR_BONUS_OR_PENALTY',
    'NO_BUY_SELL_AUTHORITY',
    'NO_PORTFOLIO_QUOTA_AUTHORITY',
    'NO_PRE_E2_CORE_LABEL_AUTHORITY',
  ],
} as const;
