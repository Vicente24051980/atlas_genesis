import type { AICapitalEfficiencyState } from './ai-capital-efficiency-gate-omega';

export type AiBurrySignalState = 'GREEN' | 'AMBER' | 'RED' | 'UNKNOWN';
export type AiBurryThesisState = 'ACTIVE' | 'REVIEW_EXTRAORDINARY';
export type AiBurryMonitorState =
  | 'DATA_INSUFFICIENT'
  | 'CLEAR'
  | 'WATCH'
  | 'COMPOSITE_FALSIFIER_TRIGGERED';
export type AiBurryReviewAction = 'NONE' | 'RF2_OPEN' | 'THESIS_AUDIT_REQUIRED';

export type Trend3 = 'STABLE_OR_RISING' | 'MILD_DECLINE' | 'PERSISTENT_DECLINE' | 'UNKNOWN';
export type BacklogTrend = 'GROWING' | 'FLAT_OR_SLOWING' | 'CANCELLATIONS_OR_DECLINE' | 'UNKNOWN';
export type CapexTrend = 'GROWING_FUNDED' | 'DOWNWARD_REVISIONS' | 'GENERALIZED_CUTS' | 'UNKNOWN';
export type FundingMode = 'SELF_FUNDED' | 'DETERIORATING' | 'DEBT_DEPENDENT' | 'UNKNOWN';
export type AiMonetizationTrend = 'DEMAND_OUTRUNS_PRICE_DECLINE' | 'MIXED' | 'DETERIORATING' | 'UNKNOWN';
export type ImpairmentTrend = 'NORMAL' | 'ISOLATED' | 'GENERALIZED' | 'UNKNOWN';

export type AiBurrySignalKey =
  | 'GPU_RENTAL_PRICE'
  | 'GPU_UTILIZATION'
  | 'ENERGY_BACKLOG'
  | 'HYPERSCALER_CAPEX'
  | 'FCF_CAPEX_FUNDING'
  | 'ROI_MONETIZATION'
  | 'GPU_ECONOMIC_LIFE'
  | 'IMPAIRMENTS';

export interface AiBurryAdversarialInput {
  evidenceTraceable: boolean;
  evidenceIds: string[];
  persistenceQuarters: number;

  /** Composite or median rental-price move across independently verified channels. */
  gpuRentalPriceChangePct?: number | null;
  /** Prevents one marketplace or one quote from masquerading as an industry-wide price signal. */
  gpuRentalPriceBreadthVerified?: boolean | null;
  gpuUtilizationTrend?: Trend3 | null;
  energyBacklogTrend?: BacklogTrend | null;
  hyperscalerCapexTrend?: CapexTrend | null;
  fcfCapexFunding?: FundingMode | null;
  aiMonetizationTrend?: AiMonetizationTrend | null;
  /** Reuse the existing AI Capital Efficiency Gate rather than inventing a second ROIC engine. */
  capitalEfficiencyState?: AICapitalEfficiencyState | null;
  gpuEconomicLifeYears?: number | null;
  impairmentTrend?: ImpairmentTrend | null;
}

export interface AiBurryAdversarialOutput {
  state: AiBurryMonitorState;
  thesisState: AiBurryThesisState;
  reviewAction: AiBurryReviewAction;
  evidenceGate: 'PASS' | 'BLOCKED';
  signals: Record<AiBurrySignalKey, AiBurrySignalState>;
  redSignalCount: number;
  amberSignalCount: number;
  coreRedSignalCount: number;
  persistenceSatisfied: boolean;
  automaticTradeAllowed: false;
  reasons: string[];
  invariants: readonly string[];
}

export const AI_BURRY_ADVERSARIAL_MONITOR_OMEGA_V1 = {
  id: 'AI_BURRY_ADVERSARIAL_MONITOR_OMEGA_V1',
  version: '1.0.0',
  authority: 'E5_CONTROL_E6_ASSURANCE',
  role: 'adversarial falsifier monitor for AI capital intensity, economic life, monetization and impairment risk',
  directStructuralScoreWeight: 0,
  emitsAutomaticTrade: false,
  coreSignals: ['GPU_UTILIZATION', 'HYPERSCALER_CAPEX', 'ROI_MONETIZATION'] as const,
  extraordinaryReviewRule:
    'At least 3 RED signals, including at least 1 core signal, sustained for at least 2 quarters.',
  invariants: [
    'TRIGGER_IS_NOT_FALSIFIER',
    'ONE_RED_SIGNAL_CANNOT_FALSIFY_AI_THESIS',
    'PRICE_DECLINE_WITHOUT_BREADTH_IS_NOT_INDUSTRY_PROOF',
    'LOWER_COST_PER_TOKEN_IS_NOT_BEARISH_IF_DEMAND_AND_ECONOMIC_VALUE_EXPAND',
    'BACKLOG_IS_NOT_PROFIT_PROOF',
    'ACCOUNTING_USEFUL_LIFE_IS_NOT_ECONOMIC_LIFE_PROOF',
    'IMPAIRMENT_ALLEGATION_IS_NOT_IMPAIRMENT_EVIDENCE',
    'NO_AUTOMATIC_BUY_OR_SELL',
  ] as const,
} as const;

const CORE_SIGNALS = new Set<AiBurrySignalKey>(AI_BURRY_ADVERSARIAL_MONITOR_OMEGA_V1.coreSignals);

export function evaluateAiBurryAdversarialMonitor(input: AiBurryAdversarialInput): AiBurryAdversarialOutput {
  validateInput(input);

  const invariants = AI_BURRY_ADVERSARIAL_MONITOR_OMEGA_V1.invariants;
  if (!input.evidenceTraceable || input.evidenceIds.length === 0) {
    return {
      state: 'DATA_INSUFFICIENT',
      thesisState: 'ACTIVE',
      reviewAction: 'NONE',
      evidenceGate: 'BLOCKED',
      signals: unknownSignals(),
      redSignalCount: 0,
      amberSignalCount: 0,
      coreRedSignalCount: 0,
      persistenceSatisfied: input.persistenceQuarters >= 2,
      automaticTradeAllowed: false,
      reasons: ['Traceable evidence is required before an adversarial signal can alter thesis state.'],
      invariants,
    };
  }

  const signals: Record<AiBurrySignalKey, AiBurrySignalState> = {
    GPU_RENTAL_PRICE: classifyGpuRentalPrice(input),
    GPU_UTILIZATION: classifyUtilization(input.gpuUtilizationTrend),
    ENERGY_BACKLOG: classifyBacklog(input.energyBacklogTrend),
    HYPERSCALER_CAPEX: classifyCapex(input.hyperscalerCapexTrend),
    FCF_CAPEX_FUNDING: classifyFunding(input.fcfCapexFunding),
    ROI_MONETIZATION: classifyRoiMonetization(input.capitalEfficiencyState, input.aiMonetizationTrend),
    GPU_ECONOMIC_LIFE: classifyEconomicLife(input.gpuEconomicLifeYears),
    IMPAIRMENTS: classifyImpairments(input.impairmentTrend),
  };

  const entries = Object.entries(signals) as Array<[AiBurrySignalKey, AiBurrySignalState]>;
  const redSignalCount = entries.filter(([, state]) => state === 'RED').length;
  const amberSignalCount = entries.filter(([, state]) => state === 'AMBER').length;
  const coreRedSignalCount = entries.filter(([key, state]) => state === 'RED' && CORE_SIGNALS.has(key)).length;
  const persistenceSatisfied = input.persistenceQuarters >= 2;
  const compositeTriggered = redSignalCount >= 3 && coreRedSignalCount >= 1 && persistenceSatisfied;

  const reasons: string[] = [];
  if (compositeTriggered) {
    reasons.push('Composite adversarial falsifier rule satisfied: 3+ RED signals, at least one core RED, persisted for 2+ quarters.');
    return {
      state: 'COMPOSITE_FALSIFIER_TRIGGERED',
      thesisState: 'REVIEW_EXTRAORDINARY',
      reviewAction: 'THESIS_AUDIT_REQUIRED',
      evidenceGate: 'PASS',
      signals,
      redSignalCount,
      amberSignalCount,
      coreRedSignalCount,
      persistenceSatisfied,
      automaticTradeAllowed: false,
      reasons,
      invariants,
    };
  }

  if (redSignalCount > 0 || amberSignalCount >= 3) {
    if (redSignalCount >= 3 && coreRedSignalCount === 0) {
      reasons.push('Three or more RED signals exist, but none is a core demand/CAPEX/ROI signal; extraordinary review is blocked.');
    }
    if (redSignalCount >= 3 && coreRedSignalCount >= 1 && !persistenceSatisfied) {
      reasons.push('Composite breadth is present, but the required two-quarter persistence has not been met.');
    }
    reasons.push('Adversarial evidence warrants RF2 monitoring but does not yet falsify the structural AI thesis.');
    return {
      state: 'WATCH',
      thesisState: 'ACTIVE',
      reviewAction: 'RF2_OPEN',
      evidenceGate: 'PASS',
      signals,
      redSignalCount,
      amberSignalCount,
      coreRedSignalCount,
      persistenceSatisfied,
      automaticTradeAllowed: false,
      reasons,
      invariants,
    };
  }

  reasons.push('No composite adversarial deterioration is active.');
  return {
    state: 'CLEAR',
    thesisState: 'ACTIVE',
    reviewAction: 'NONE',
    evidenceGate: 'PASS',
    signals,
    redSignalCount,
    amberSignalCount,
    coreRedSignalCount,
    persistenceSatisfied,
    automaticTradeAllowed: false,
    reasons,
    invariants,
  };
}

function classifyGpuRentalPrice(input: AiBurryAdversarialInput): AiBurrySignalState {
  const move = input.gpuRentalPriceChangePct;
  if (move == null || input.gpuRentalPriceBreadthVerified !== true) return 'UNKNOWN';
  if (move <= -40) return 'RED';
  if (move <= -20) return 'AMBER';
  return 'GREEN';
}

function classifyUtilization(value?: Trend3 | null): AiBurrySignalState {
  if (value == null || value === 'UNKNOWN') return 'UNKNOWN';
  if (value === 'PERSISTENT_DECLINE') return 'RED';
  if (value === 'MILD_DECLINE') return 'AMBER';
  return 'GREEN';
}

function classifyBacklog(value?: BacklogTrend | null): AiBurrySignalState {
  if (value == null || value === 'UNKNOWN') return 'UNKNOWN';
  if (value === 'CANCELLATIONS_OR_DECLINE') return 'RED';
  if (value === 'FLAT_OR_SLOWING') return 'AMBER';
  return 'GREEN';
}

function classifyCapex(value?: CapexTrend | null): AiBurrySignalState {
  if (value == null || value === 'UNKNOWN') return 'UNKNOWN';
  if (value === 'GENERALIZED_CUTS') return 'RED';
  if (value === 'DOWNWARD_REVISIONS') return 'AMBER';
  return 'GREEN';
}

function classifyFunding(value?: FundingMode | null): AiBurrySignalState {
  if (value == null || value === 'UNKNOWN') return 'UNKNOWN';
  if (value === 'DEBT_DEPENDENT') return 'RED';
  if (value === 'DETERIORATING') return 'AMBER';
  return 'GREEN';
}

function classifyRoiMonetization(
  capitalEfficiencyState?: AICapitalEfficiencyState | null,
  monetization?: AiMonetizationTrend | null,
): AiBurrySignalState {
  if (capitalEfficiencyState === 'VALUE_DESTRUCTION' || monetization === 'DETERIORATING') return 'RED';
  if (capitalEfficiencyState === 'NEUTRAL' || monetization === 'MIXED') return 'AMBER';
  if (capitalEfficiencyState === 'VALUE_CREATION' && monetization === 'DEMAND_OUTRUNS_PRICE_DECLINE') return 'GREEN';
  return 'UNKNOWN';
}

function classifyEconomicLife(years?: number | null): AiBurrySignalState {
  if (years == null) return 'UNKNOWN';
  if (years <= 3) return 'RED';
  if (years < 5) return 'AMBER';
  return 'GREEN';
}

function classifyImpairments(value?: ImpairmentTrend | null): AiBurrySignalState {
  if (value == null || value === 'UNKNOWN') return 'UNKNOWN';
  if (value === 'GENERALIZED') return 'RED';
  if (value === 'ISOLATED') return 'AMBER';
  return 'GREEN';
}

function unknownSignals(): Record<AiBurrySignalKey, AiBurrySignalState> {
  return {
    GPU_RENTAL_PRICE: 'UNKNOWN',
    GPU_UTILIZATION: 'UNKNOWN',
    ENERGY_BACKLOG: 'UNKNOWN',
    HYPERSCALER_CAPEX: 'UNKNOWN',
    FCF_CAPEX_FUNDING: 'UNKNOWN',
    ROI_MONETIZATION: 'UNKNOWN',
    GPU_ECONOMIC_LIFE: 'UNKNOWN',
    IMPAIRMENTS: 'UNKNOWN',
  };
}

function validateInput(input: AiBurryAdversarialInput): void {
  if (!Number.isInteger(input.persistenceQuarters) || input.persistenceQuarters < 0) {
    throw new Error('ai_burry_adversarial_invalid_metric:persistenceQuarters');
  }
  if (input.gpuRentalPriceChangePct != null && !Number.isFinite(input.gpuRentalPriceChangePct)) {
    throw new Error('ai_burry_adversarial_invalid_metric:gpuRentalPriceChangePct');
  }
  if (input.gpuEconomicLifeYears != null && (!Number.isFinite(input.gpuEconomicLifeYears) || input.gpuEconomicLifeYears < 0)) {
    throw new Error('ai_burry_adversarial_invalid_metric:gpuEconomicLifeYears');
  }
}

export type AiFundingStressState = 'DATA_INSUFFICIENT' | 'NORMAL' | 'ELEVATED' | 'SEVERE';
export type SpreadTrend = 'STABLE_OR_TIGHTENING' | 'WIDENING' | 'SHARPLY_WIDENING' | 'UNKNOWN';
export type DebtFundingTrend = 'FCF_DOMINANT' | 'MIXED' | 'DEBT_DEPENDENT' | 'UNKNOWN';
export type EnergyCostTrend = 'STABLE_OR_DOWN' | 'RISING' | 'SHARPLY_RISING' | 'UNKNOWN';
export type FcfTrend = 'STABLE_OR_RISING' | 'DETERIORATING' | 'NEGATIVE_OR_COLLAPSING' | 'UNKNOWN';

export interface AiFundingStressInput {
  evidenceTraceable: boolean;
  evidenceIds: string[];
  treasury10yPct?: number | null;
  corporateSpreadTrend?: SpreadTrend | null;
  aiInfrastructureDebtFunding?: DebtFundingTrend | null;
  energyCostTrend?: EnergyCostTrend | null;
  fcfTrend?: FcfTrend | null;
}

export interface AiFundingStressOutput {
  state: AiFundingStressState;
  stressPointCount: number;
  reasons: string[];
  automaticTradeAllowed: false;
}

export const MACRO_AI_FUNDING_STRESS_OMEGA_V1 = {
  id: 'MACRO_AI_FUNDING_STRESS_OMEGA_V1',
  version: '1.0.0',
  role: 'separate macro financing stress from structural AI thesis deterioration',
  emitsAutomaticTrade: false,
  severeRule: 'UST10Y >= 5% plus at least two additional severe funding/energy/FCF stress points.',
} as const;

export function evaluateAiFundingStress(input: AiFundingStressInput): AiFundingStressOutput {
  if (!input.evidenceTraceable || input.evidenceIds.length === 0) {
    return {
      state: 'DATA_INSUFFICIENT',
      stressPointCount: 0,
      reasons: ['Traceable macro evidence is required.'],
      automaticTradeAllowed: false,
    };
  }
  if (input.treasury10yPct != null && (!Number.isFinite(input.treasury10yPct) || input.treasury10yPct < 0)) {
    throw new Error('macro_ai_funding_stress_invalid_metric:treasury10yPct');
  }

  const treasurySevere = input.treasury10yPct != null && input.treasury10yPct >= 5;
  let stressPointCount = 0;
  if (input.corporateSpreadTrend === 'SHARPLY_WIDENING') stressPointCount += 1;
  if (input.aiInfrastructureDebtFunding === 'DEBT_DEPENDENT') stressPointCount += 1;
  if (input.energyCostTrend === 'SHARPLY_RISING') stressPointCount += 1;
  if (input.fcfTrend === 'NEGATIVE_OR_COLLAPSING') stressPointCount += 1;

  if (treasurySevere && stressPointCount >= 2) {
    return {
      state: 'SEVERE',
      stressPointCount,
      reasons: ['High risk-free rate is combining with at least two additional financing/energy/cash-flow stress channels.'],
      automaticTradeAllowed: false,
    };
  }

  const elevated = treasurySevere
    || input.corporateSpreadTrend === 'WIDENING'
    || input.aiInfrastructureDebtFunding === 'MIXED'
    || input.energyCostTrend === 'RISING'
    || input.fcfTrend === 'DETERIORATING'
    || stressPointCount > 0;

  return {
    state: elevated ? 'ELEVATED' : 'NORMAL',
    stressPointCount,
    reasons: [
      elevated
        ? 'Macro funding stress is elevated but remains analytically separate from structural AI falsification.'
        : 'No material macro AI funding stress is active.',
    ],
    automaticTradeAllowed: false,
  };
}
