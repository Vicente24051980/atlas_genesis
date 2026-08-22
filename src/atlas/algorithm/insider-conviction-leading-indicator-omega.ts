export type InsiderRole = 'CEO' | 'CFO' | 'COO_PRESIDENT' | 'EXECUTIVE' | 'DIRECTOR' | 'OTHER';

export type InsiderEvidenceGate = 'CONFIRMED' | 'DATA_INCOMPLETE' | 'NO_QUALIFYING_PURCHASE';

export type InsiderConvictionState =
  | 'HIGH_CONVICTION_LEADING'
  | 'CONVICTION_LEADING'
  | 'WATCH_LEADING'
  | 'LOW_SIGNAL'
  | 'NO_QUALIFYING_PURCHASE'
  | 'DATA_INCOMPLETE';

export type InsiderConvictionAction = 'ELEVATE_AUDIT_PRIORITY' | 'WATCH_ONLY' | 'NO_CHANGE' | 'DATA_REQUIRED';

export type InsiderConvictionInput = {
  ticker: string;
  asOfDate: string;
  evidenceTraceable: boolean;
  evidenceIds: readonly string[];
  verifiedOpenMarketPurchase: boolean;
  verifiedTransactionCount: number;
  uniqueInsiderCount: number;
  insiderRoles: readonly InsiderRole[];
  purchaseMaterialityScore: number;
  postDrawdownContextScore: number;
  sectorBreadthScore: number;
  offsettingSalesRiskScore: number;
  recencyDays: number;
};

export type InsiderConvictionResult = {
  ticker: string;
  asOfDate: string;
  evidenceGate: InsiderEvidenceGate;
  score: number;
  state: InsiderConvictionState;
  action: InsiderConvictionAction;
  institutionalFlowInference: 'PROHIBITED_FROM_INSIDER_DATA';
  buySignal: false;
  reasons: string[];
  falsifiers: string[];
};

const clamp = (value: number): number => Math.max(0, Math.min(100, value));
const round1 = (value: number): number => Math.round(value * 10) / 10;

const roleScores: Record<InsiderRole, number> = {
  CEO: 100,
  CFO: 95,
  COO_PRESIDENT: 85,
  EXECUTIVE: 75,
  DIRECTOR: 70,
  OTHER: 50,
};

function validateInput(input: InsiderConvictionInput): void {
  const scores = [
    input.purchaseMaterialityScore,
    input.postDrawdownContextScore,
    input.sectorBreadthScore,
    input.offsettingSalesRiskScore,
  ];
  if (scores.some((value) => !Number.isFinite(value) || value < 0 || value > 100)) {
    throw new Error('insider_conviction_scores_must_be_between_0_and_100');
  }
  if (!Number.isInteger(input.verifiedTransactionCount) || input.verifiedTransactionCount < 0) {
    throw new Error('insider_conviction_verified_transaction_count_invalid');
  }
  if (!Number.isInteger(input.uniqueInsiderCount) || input.uniqueInsiderCount < 0) {
    throw new Error('insider_conviction_unique_insider_count_invalid');
  }
  if (!Number.isFinite(input.recencyDays) || input.recencyDays < 0) {
    throw new Error('insider_conviction_recency_days_invalid');
  }
}

function seniorityScore(roles: readonly InsiderRole[]): number {
  if (roles.length === 0) return 0;
  const best = Math.max(...roles.map((role) => roleScores[role]));
  const breadthBonus = Math.min(10, Math.max(0, new Set(roles).size - 1) * 2.5);
  return clamp(best * 0.9 + breadthBonus);
}

function insiderBreadthScore(uniqueInsiderCount: number): number {
  return clamp((uniqueInsiderCount / 5) * 100);
}

function recencyScore(recencyDays: number): number {
  if (recencyDays <= 30) return 100;
  if (recencyDays <= 90) return 80;
  if (recencyDays <= 180) return 60;
  if (recencyDays <= 365) return 35;
  return 10;
}

export function scoreInsiderConviction(input: InsiderConvictionInput): number {
  validateInput(input);
  const openMarketScore = input.verifiedOpenMarketPurchase ? 100 : 0;
  const roleScore = seniorityScore(input.insiderRoles);
  const breadthScore = insiderBreadthScore(input.uniqueInsiderCount);
  const inverseOffsettingSales = 100 - clamp(input.offsettingSalesRiskScore);

  return round1(
    openMarketScore * 0.2 +
      roleScore * 0.15 +
      breadthScore * 0.15 +
      clamp(input.purchaseMaterialityScore) * 0.15 +
      clamp(input.postDrawdownContextScore) * 0.1 +
      clamp(input.sectorBreadthScore) * 0.1 +
      inverseOffsettingSales * 0.1 +
      recencyScore(input.recencyDays) * 0.05,
  );
}

export function evaluateInsiderConviction(input: InsiderConvictionInput): InsiderConvictionResult {
  validateInput(input);

  const reasons: string[] = [];
  const falsifiers = [
    'transaction_reclassified_as_non_discretionary_or_non_open_market',
    'material_insider_selling_overwhelms_purchases',
    'purchase_is_immaterial_relative_to_holdings_or_compensation_when_known',
    'fundamentals_deteriorate_after_purchase',
    'expected_return_collapses_due_to_valuation_expansion',
    'recommendation_performance_audit_shows_repeated_negative_selection_alpha_for_signal_class',
  ];

  const dataComplete = input.evidenceTraceable && input.evidenceIds.length >= 1;
  if (!dataComplete) {
    reasons.push('Traceable transaction evidence is required before Insider Conviction can be confirmed.');
    return {
      ticker: input.ticker,
      asOfDate: input.asOfDate,
      evidenceGate: 'DATA_INCOMPLETE',
      score: 0,
      state: 'DATA_INCOMPLETE',
      action: 'DATA_REQUIRED',
      institutionalFlowInference: 'PROHIBITED_FROM_INSIDER_DATA',
      buySignal: false,
      reasons,
      falsifiers,
    };
  }

  if (!input.verifiedOpenMarketPurchase || input.verifiedTransactionCount < 1 || input.uniqueInsiderCount < 1) {
    reasons.push('No verified discretionary open-market insider purchase is present. Grants, exercises, transfers and corporate buybacks do not qualify.');
    return {
      ticker: input.ticker,
      asOfDate: input.asOfDate,
      evidenceGate: 'NO_QUALIFYING_PURCHASE',
      score: 0,
      state: 'NO_QUALIFYING_PURCHASE',
      action: 'NO_CHANGE',
      institutionalFlowInference: 'PROHIBITED_FROM_INSIDER_DATA',
      buySignal: false,
      reasons,
      falsifiers,
    };
  }

  const score = scoreInsiderConviction(input);
  let state: InsiderConvictionState;
  let action: InsiderConvictionAction;

  if (score >= 75) {
    state = 'HIGH_CONVICTION_LEADING';
    action = 'ELEVATE_AUDIT_PRIORITY';
    reasons.push('Verified open-market buying is broad/material/recent enough to elevate research priority.');
  } else if (score >= 60) {
    state = 'CONVICTION_LEADING';
    action = 'ELEVATE_AUDIT_PRIORITY';
    reasons.push('Insider activity is a meaningful leading signal, but still subordinate to Economic Proof and Expected Return.');
  } else if (score >= 45) {
    state = 'WATCH_LEADING';
    action = 'WATCH_ONLY';
    reasons.push('Insider activity is informative but not strong enough to change audit priority materially.');
  } else {
    state = 'LOW_SIGNAL';
    action = 'NO_CHANGE';
    reasons.push('Qualified insider buying exists, but breadth/materiality/context are too weak for a material leading signal.');
  }

  reasons.push('Insider activity cannot be used to infer institutional fund flow.');
  reasons.push('This engine intentionally has no BUY action; it can only alter research priority.');

  return {
    ticker: input.ticker,
    asOfDate: input.asOfDate,
    evidenceGate: 'CONFIRMED',
    score,
    state,
    action,
    institutionalFlowInference: 'PROHIBITED_FROM_INSIDER_DATA',
    buySignal: false,
    reasons,
    falsifiers,
  };
}

export type SpendingScope =
  | 'AI_SPECIFIC'
  | 'IT_TECH_BROAD'
  | 'DATA_CENTER_BROAD'
  | 'SEMICONDUCTOR_BROAD'
  | 'OTHER'
  | 'SCOPE_UNVERIFIED';

export type AICapexPaybackState =
  | 'P0_SPENDING_ONLY'
  | 'P1_CAPACITY_DEPLOYED'
  | 'P2_UTILIZATION_VISIBLE'
  | 'P3_REVENUE_LINKAGE'
  | 'P4_MARGIN_CASH_CONVERSION'
  | 'P5_INCREMENTAL_ROIC_PAYBACK';

export type AICapexValidationInput = {
  reportedScope: SpendingScope;
  sourceExplicitlyAiSpecific: boolean;
  capacityDeployed: boolean;
  utilizationVisible: boolean;
  attributableRevenueVisible: boolean;
  marginAndCashConversionVisible: boolean;
  incrementalRoicPaybackVisible: boolean;
};

export type AICapexValidationResult = {
  normalizedScope: SpendingScope;
  paybackState: AICapexPaybackState;
  ownerEconomicProof: boolean;
  reasons: string[];
};

export function validateAICapexEvidence(input: AICapexValidationInput): AICapexValidationResult {
  const reasons: string[] = [];
  const normalizedScope: SpendingScope =
    input.reportedScope === 'AI_SPECIFIC' && !input.sourceExplicitlyAiSpecific ? 'SCOPE_UNVERIFIED' : input.reportedScope;

  if (input.reportedScope === 'AI_SPECIFIC' && !input.sourceExplicitlyAiSpecific) {
    reasons.push('Broad technology spending cannot be relabelled AI-specific without explicit source scope.');
  }

  let paybackState: AICapexPaybackState = 'P0_SPENDING_ONLY';
  if (input.capacityDeployed) paybackState = 'P1_CAPACITY_DEPLOYED';
  if (input.capacityDeployed && input.utilizationVisible) paybackState = 'P2_UTILIZATION_VISIBLE';
  if (input.capacityDeployed && input.utilizationVisible && input.attributableRevenueVisible) paybackState = 'P3_REVENUE_LINKAGE';
  if (
    input.capacityDeployed &&
    input.utilizationVisible &&
    input.attributableRevenueVisible &&
    input.marginAndCashConversionVisible
  ) {
    paybackState = 'P4_MARGIN_CASH_CONVERSION';
  }
  if (
    input.capacityDeployed &&
    input.utilizationVisible &&
    input.attributableRevenueVisible &&
    input.marginAndCashConversionVisible &&
    input.incrementalRoicPaybackVisible
  ) {
    paybackState = 'P5_INCREMENTAL_ROIC_PAYBACK';
  }

  const ownerEconomicProof = paybackState === 'P5_INCREMENTAL_ROIC_PAYBACK';
  if (!ownerEconomicProof) {
    reasons.push('CAPEX activity remains distinct from owner-economic payback until incremental ROIC/payback is visible.');
  }

  return { normalizedScope, paybackState, ownerEconomicProof, reasons };
}

export const INSIDER_CONVICTION_LEADING_INDICATOR_OMEGA = {
  id: 'INSIDER_CONVICTION_LEADING_INDICATOR_OMEGA_V1',
  name: 'Insider Conviction Leading Indicator Ω v1.0',
  role: 'leading_evidence_research_priority_only',
  constitutionalRules: [
    'INSIDER_BUYING_IS_NOT_INSTITUTIONAL_FLOW',
    'INSIDER_BUYING_IS_NOT_ECONOMIC_PROOF',
    'INSIDER_BUYING_IS_NOT_A_BUY_SIGNAL',
    'CORPORATE_BUYBACK_IS_NOT_INSIDER_BUYING',
    'OPTION_OR_RSU_GRANT_IS_NOT_OPEN_MARKET_PURCHASE',
    'TECH_INVESTMENT_GDP_IS_NOT_AI_INVESTMENT_GDP_WITHOUT_EXPLICIT_SCOPE',
    'CAPEX_GROWTH_IS_NOT_CAPEX_PRODUCTIVITY',
    'SEASONALITY_IS_NOT_AN_ENTRY_SIGNAL',
  ] as const,
  scoreWeights: {
    verifiedOpenMarketNature: 0.2,
    insiderSeniority: 0.15,
    independentInsiderBreadth: 0.15,
    purchaseMateriality: 0.15,
    postDrawdownContext: 0.1,
    sectorBreadth: 0.1,
    inverseOffsettingSalesRisk: 0.1,
    recency: 0.05,
  },
} as const;
