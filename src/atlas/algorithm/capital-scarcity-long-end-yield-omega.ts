export type CapitalScarcityEvidenceState =
  | 'CONFIRMED'
  | 'PARTIAL'
  | 'UNVERIFIED'
  | 'CONTRADICTED';

export type CapitalScarcityState =
  | 'CS0_ABUNDANT_CAPITAL'
  | 'CS1_NORMAL'
  | 'CS2_TIGHTENING'
  | 'CS3_CAPITAL_SCARCITY'
  | 'CS4_FISCAL_PRIVATE_CROWDING'
  | 'CS5_STRESS_CASCADE';

export type ValuationHurdleAction =
  | 'LOWER_HURDLE_WITH_CAUTION'
  | 'KEEP_HURDLE'
  | 'RAISE_HURDLE'
  | 'RAISE_HURDLE_MATERIALLY';

export interface CapitalScarcityInput {
  ust10yPct?: number;
  ust30yPct?: number;
  domesticLongYieldPct?: number;
  realYieldTrend?: 'FALLING' | 'STABLE' | 'RISING' | 'UNKNOWN';
  longYieldTrend: 'FALLING' | 'STABLE' | 'RISING' | 'SHOCK';
  termPremiumTrend?: 'FALLING' | 'STABLE' | 'RISING' | 'UNKNOWN';
  sovereignFundingPressure?: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
  privateCapexDemand?: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
  creditSpreadTrend?: 'TIGHTENING' | 'STABLE' | 'WIDENING' | 'UNKNOWN';
  liquidityState?: 'EASY' | 'NORMAL' | 'TIGHT' | 'STRESSED' | 'UNKNOWN';
  inflationImpulse?: 'FALLING' | 'STABLE' | 'RISING' | 'SHOCK' | 'UNKNOWN';
  companyRefinancingDependency?: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
  companyFundingMix?: Array<'FCF' | 'DEBT' | 'LEASES' | 'EQUITY' | 'PREPAYMENTS' | 'PROJECT_FINANCE'>;
  equityDuration?: 'SHORT' | 'MEDIUM' | 'LONG' | 'UNKNOWN';
  presentCashEconomics?: 'STRONG' | 'MIXED' | 'WEAK' | 'UNKNOWN';
  evidence: CapitalScarcityEvidenceState;
}

export interface CapitalScarcityOutput {
  state: CapitalScarcityState;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  valuationHurdleAction: ValuationHurdleAction;
  fundingRiskAction: 'NORMAL_REVIEW' | 'RECHECK_CFQ' | 'STRESS_CFQ_AND_REFINANCING';
  reasons: string[];
  falsifiers: string[];
  routes: Array<
    | 'VALUATION_IMPLIED_RETURN'
    | 'CAPITAL_FUNDING_QUALITY'
    | 'FINANCED_DEMAND'
    | 'MARKET_TOP_RISK'
    | 'ENTRY_TIMING'
    | 'FALSIFIERS'
  >;
}

/**
 * Non-parametric by design until ATLAS has a calibrated historical dataset.
 * Yield levels are recorded, but state assignment depends on direction,
 * funding pressure, spreads and liquidity rather than a universal threshold.
 */
export function evaluateCapitalScarcityLongEnd(
  input: CapitalScarcityInput,
): CapitalScarcityOutput {
  const reasons: string[] = [];
  const sovereignHigh = input.sovereignFundingPressure === 'HIGH';
  const privateHigh = input.privateCapexDemand === 'HIGH';
  const spreadsWidening = input.creditSpreadTrend === 'WIDENING';
  const liquidityStressed = input.liquidityState === 'STRESSED';
  const yieldsShock = input.longYieldTrend === 'SHOCK';
  const yieldsRising = input.longYieldTrend === 'RISING' || yieldsShock;
  const termPremiumRising = input.termPremiumTrend === 'RISING';
  const companyFundingSensitive = input.companyRefinancingDependency === 'HIGH';
  const longDuration = input.equityDuration === 'LONG';

  let state: CapitalScarcityState = 'CS1_NORMAL';

  if (yieldsShock && (spreadsWidening || liquidityStressed) && companyFundingSensitive) {
    state = 'CS5_STRESS_CASCADE';
    reasons.push('Long-end shock is transmitting into credit/liquidity while the company is refinancing-sensitive.');
  } else if (yieldsRising && sovereignHigh && privateHigh) {
    state = 'CS4_FISCAL_PRIVATE_CROWDING';
    reasons.push('Sovereign funding pressure and private CAPEX demand are both high while long yields are rising.');
  } else if (yieldsRising && (sovereignHigh || spreadsWidening || liquidityStressed)) {
    state = 'CS3_CAPITAL_SCARCITY';
    reasons.push('The opportunity cost of capital is rising alongside a material funding or liquidity pressure signal.');
  } else if (yieldsRising || termPremiumRising) {
    state = 'CS2_TIGHTENING';
    reasons.push('Long-end yields or term premium are rising and require a valuation-hurdle recheck.');
  } else if (
    input.longYieldTrend === 'FALLING' &&
    (input.termPremiumTrend === 'FALLING' || input.termPremiumTrend === 'STABLE') &&
    input.sovereignFundingPressure === 'LOW' &&
    (input.liquidityState === 'EASY' || input.liquidityState === 'NORMAL')
  ) {
    state = 'CS0_ABUNDANT_CAPITAL';
    reasons.push('Long-end conditions are easing with low sovereign funding pressure and non-stressed liquidity.');
  } else {
    reasons.push('No material capital-scarcity regime is confirmed from the supplied evidence.');
  }

  if (longDuration && yieldsRising) {
    reasons.push('Long-duration equity cash flows are especially sensitive to the higher discount rate.');
  }

  if (input.presentCashEconomics === 'STRONG' && yieldsRising) {
    reasons.push('Strong present cash economics reduce business fragility but do not eliminate multiple-compression risk.');
  }

  const valuationHurdleAction = hurdleForState(state);
  const fundingRiskAction =
    state === 'CS5_STRESS_CASCADE'
      ? 'STRESS_CFQ_AND_REFINANCING'
      : state === 'CS3_CAPITAL_SCARCITY' || state === 'CS4_FISCAL_PRIVATE_CROWDING' || companyFundingSensitive
        ? 'RECHECK_CFQ'
        : 'NORMAL_REVIEW';

  return {
    state,
    confidence: confidenceFromEvidence(input.evidence),
    valuationHurdleAction,
    fundingRiskAction,
    reasons,
    falsifiers: defaultFalsifiers(),
    routes: [
      'VALUATION_IMPLIED_RETURN',
      'CAPITAL_FUNDING_QUALITY',
      'FINANCED_DEMAND',
      'MARKET_TOP_RISK',
      'ENTRY_TIMING',
      'FALSIFIERS',
    ],
  };
}

function hurdleForState(state: CapitalScarcityState): ValuationHurdleAction {
  if (state === 'CS5_STRESS_CASCADE' || state === 'CS4_FISCAL_PRIVATE_CROWDING') {
    return 'RAISE_HURDLE_MATERIALLY';
  }
  if (state === 'CS3_CAPITAL_SCARCITY' || state === 'CS2_TIGHTENING') {
    return 'RAISE_HURDLE';
  }
  if (state === 'CS0_ABUNDANT_CAPITAL') return 'LOWER_HURDLE_WITH_CAUTION';
  return 'KEEP_HURDLE';
}

function confidenceFromEvidence(
  evidence: CapitalScarcityEvidenceState,
): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (evidence === 'CONFIRMED') return 'HIGH';
  if (evidence === 'PARTIAL') return 'MEDIUM';
  return 'LOW';
}

function defaultFalsifiers(): string[] {
  return [
    'Long sovereign yields reverse lower on a sustained basis without renewed inflation pressure.',
    'Term premium falls while sovereign issuance is absorbed without deteriorating market conditions.',
    'Credit spreads tighten and liquidity improves.',
    'Company refinancing costs stabilize and external-funding dependence falls.',
    'Private CAPEX becomes increasingly self-funded by realized operating cash flow and FCF.',
  ];
}
