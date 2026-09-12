export type DataCenterRiskTransferRole =
  | 'BROKER'
  | 'REINSURANCE_BROKER'
  | 'PRIMARY_INSURER'
  | 'REINSURER'
  | 'ILS_MANAGER'
  | 'CAPITAL_MARKETS_STRUCTURER'
  | 'MODELING_ANALYTICS';

export type DataCenterPeril =
  | 'NAT_CAT'
  | 'SEVERE_CONVECTIVE_STORM'
  | 'FIRE'
  | 'ESCAPED_LIQUIDS'
  | 'POWER_OUTAGE'
  | 'BUSINESS_INTERRUPTION'
  | 'CYBER'
  | 'TERRORISM_SABOTAGE'
  | 'OTHER';

export type DataCenterRiskTransferMarketStage =
  | 'DCRT_M0_NARRATIVE'
  | 'DCRT_M1_PROTECTION_GAP_PROVEN'
  | 'DCRT_M2_DEDICATED_CAPACITY_FORMING'
  | 'DCRT_M3_REINSURANCE_TRANSFER_ACTIVE'
  | 'DCRT_M4_ALTERNATIVE_CAPITAL_ACTIVE';

export type DataCenterRiskTransferCompanyProof =
  | 'DCRT_C0_NO_ATTRIBUTION'
  | 'DCRT_C1_COMPANY_POSITIONING'
  | 'DCRT_C2_ATTRIBUTABLE_TRANSACTION'
  | 'DCRT_C3_ATTRIBUTABLE_REVENUE_MARGIN'
  | 'DCRT_C4_MULTI_PERIOD_FCF_ROIC';

export type ParentEconomicProofLevel =
  | 'E0_NARRATIVE'
  | 'E1_MANAGEMENT_CLAIM'
  | 'E2_ORDERS_CONTRACTS'
  | 'E3_REVENUE_MARGIN'
  | 'E4_FCF_ROIC_MULTI_PERIOD';

export type PerilModelabilityState = 'MODEL_READY' | 'PARTIAL_MODELABILITY' | 'HARD_TO_MODEL';

export type DataCenterRiskTransferInput = {
  ticker: string;
  roles: readonly DataCenterRiskTransferRole[];
  perils: readonly DataCenterPeril[];
  evidenceTraceable: boolean;
  evidenceIds: readonly string[];

  // Market-formation evidence. These are deliberately separate from company economics.
  protectionGapEvidence: boolean;
  dedicatedInsuranceCapacityProgram: boolean;
  dedicatedReinsuranceTransaction: boolean;
  dedicatedAlternativeCapitalTransaction: boolean;

  // Company-attribution evidence. A market can mature without a listed company capturing material economics.
  companyPositioningClaim: boolean;
  attributableTransaction: boolean;
  attributableRevenueMargin: boolean;
  multiPeriodCashRoicProof: boolean;

  // Opportunity dimensions, 0-100. Inputs must be evidence-supported; the module does not manufacture them.
  riskAccumulationScore: number;
  protectionGapScore: number;
  dedicatedCapacityScore: number;
  reinsuranceActivityScore: number;
  alternativeCapitalEvidenceScore: number;

  causalExposureScore: number;
  transactionProofScore: number;
  revenueMarginAttributionScore: number;
  cashRoicConversionScore: number;
  capitalLightCaptureScore: number;

  // Fragility is independent from opportunity and is never silently netted against it.
  perilModelabilityScore: number;
  retainedTailRiskScore: number;
  geographicClientConcentrationRiskScore: number;
};

export type DataCenterRiskTransferResult = {
  ticker: string;
  motorOrigin: 'AI_DATA_CENTER_RISK_TRANSFER_OMEGA_V1';
  parentEngine: 'GLOBAL_CAPEX_CHAIN_OMEGA_V1';
  parentModule: 'CAPEX_HUNTERS_OMEGA_V1';
  edd: 5;
  roles: readonly DataCenterRiskTransferRole[];
  perils: readonly DataCenterPeril[];
  hunterClasses: readonly ('H6_SECOND_ORDER_CAPTOR' | 'H5_CONTRACTUAL_CAPTOR')[];
  marketStage: DataCenterRiskTransferMarketStage;
  companyProof: DataCenterRiskTransferCompanyProof;
  parentEconomicProofLevel: ParentEconomicProofLevel;
  evidenceGate: 'CONFIRMED' | 'PROVISIONAL' | 'BLOCKED';
  marketOpportunityScore: number;
  companyCaptureScore: number;
  riskTransferFragilityScore: number;
  perilModelabilityState: PerilModelabilityState;
  independentFundingPoolCredit: 'DERIVED_DO_NOT_COUNT_AS_NEW_POOL';
  action: 'EVIDENCE_REQUIRED' | 'WATCH' | 'ADVANCE_DEEP_RESEARCH' | 'HANDOFF_TO_T5';
  reasons: string[];
  falsifiers: string[];
};

const clamp = (value: number): number => Math.max(0, Math.min(100, value));
const round1 = (value: number): number => Math.round(value * 10) / 10;

function validateScores(input: DataCenterRiskTransferInput): void {
  const scores = [
    input.riskAccumulationScore,
    input.protectionGapScore,
    input.dedicatedCapacityScore,
    input.reinsuranceActivityScore,
    input.alternativeCapitalEvidenceScore,
    input.causalExposureScore,
    input.transactionProofScore,
    input.revenueMarginAttributionScore,
    input.cashRoicConversionScore,
    input.capitalLightCaptureScore,
    input.perilModelabilityScore,
    input.retainedTailRiskScore,
    input.geographicClientConcentrationRiskScore,
  ];

  if (scores.some((score) => !Number.isFinite(score) || score < 0 || score > 100)) {
    throw new Error('ai_data_center_risk_transfer_scores_must_be_between_0_and_100');
  }
  if (input.roles.length === 0) {
    throw new Error('ai_data_center_risk_transfer_requires_at_least_one_role');
  }
  if (input.perils.length === 0) {
    throw new Error('ai_data_center_risk_transfer_requires_at_least_one_peril');
  }
}

function validateEconomicProofChain(input: DataCenterRiskTransferInput): void {
  if (input.multiPeriodCashRoicProof && !input.attributableRevenueMargin) {
    throw new Error('dcrt_cash_roic_proof_requires_attributable_revenue_margin');
  }
  if (input.attributableRevenueMargin && !input.attributableTransaction) {
    throw new Error('dcrt_revenue_margin_requires_attributable_transaction');
  }
  // A dedicated alternative-capital deal is a transaction-level market event.
  // It need not be attributable to the audited listed company, so it does not imply company C2.
  if (input.dedicatedAlternativeCapitalTransaction && !input.protectionGapEvidence) {
    throw new Error('dcrt_alternative_capital_requires_protection_gap_evidence');
  }
}

export function deriveDataCenterRiskTransferMarketStage(
  input: Pick<
    DataCenterRiskTransferInput,
    | 'protectionGapEvidence'
    | 'dedicatedInsuranceCapacityProgram'
    | 'dedicatedReinsuranceTransaction'
    | 'dedicatedAlternativeCapitalTransaction'
  >,
): DataCenterRiskTransferMarketStage {
  if (input.dedicatedAlternativeCapitalTransaction) return 'DCRT_M4_ALTERNATIVE_CAPITAL_ACTIVE';
  if (input.dedicatedReinsuranceTransaction) return 'DCRT_M3_REINSURANCE_TRANSFER_ACTIVE';
  if (input.dedicatedInsuranceCapacityProgram) return 'DCRT_M2_DEDICATED_CAPACITY_FORMING';
  if (input.protectionGapEvidence) return 'DCRT_M1_PROTECTION_GAP_PROVEN';
  return 'DCRT_M0_NARRATIVE';
}

export function deriveDataCenterRiskTransferCompanyProof(
  input: Pick<
    DataCenterRiskTransferInput,
    'companyPositioningClaim' | 'attributableTransaction' | 'attributableRevenueMargin' | 'multiPeriodCashRoicProof'
  >,
): DataCenterRiskTransferCompanyProof {
  if (input.multiPeriodCashRoicProof) return 'DCRT_C4_MULTI_PERIOD_FCF_ROIC';
  if (input.attributableRevenueMargin) return 'DCRT_C3_ATTRIBUTABLE_REVENUE_MARGIN';
  if (input.attributableTransaction) return 'DCRT_C2_ATTRIBUTABLE_TRANSACTION';
  if (input.companyPositioningClaim) return 'DCRT_C1_COMPANY_POSITIONING';
  return 'DCRT_C0_NO_ATTRIBUTION';
}

export function mapCompanyProofToParentEconomicProof(
  proof: DataCenterRiskTransferCompanyProof,
): ParentEconomicProofLevel {
  switch (proof) {
    case 'DCRT_C4_MULTI_PERIOD_FCF_ROIC':
      return 'E4_FCF_ROIC_MULTI_PERIOD';
    case 'DCRT_C3_ATTRIBUTABLE_REVENUE_MARGIN':
      return 'E3_REVENUE_MARGIN';
    case 'DCRT_C2_ATTRIBUTABLE_TRANSACTION':
      return 'E2_ORDERS_CONTRACTS';
    case 'DCRT_C1_COMPANY_POSITIONING':
      return 'E1_MANAGEMENT_CLAIM';
    default:
      return 'E0_NARRATIVE';
  }
}

export function scoreDataCenterRiskTransferMarketOpportunity(input: DataCenterRiskTransferInput): number {
  return round1(
    clamp(input.riskAccumulationScore) * 0.25 +
      clamp(input.protectionGapScore) * 0.25 +
      clamp(input.dedicatedCapacityScore) * 0.20 +
      clamp(input.reinsuranceActivityScore) * 0.15 +
      clamp(input.alternativeCapitalEvidenceScore) * 0.15,
  );
}

export function scoreDataCenterRiskTransferCompanyCapture(input: DataCenterRiskTransferInput): number {
  return round1(
    clamp(input.causalExposureScore) * 0.20 +
      clamp(input.transactionProofScore) * 0.25 +
      clamp(input.revenueMarginAttributionScore) * 0.25 +
      clamp(input.cashRoicConversionScore) * 0.20 +
      clamp(input.capitalLightCaptureScore) * 0.10,
  );
}

export function scoreDataCenterRiskTransferFragility(input: DataCenterRiskTransferInput): number {
  const modelabilityGap = 100 - clamp(input.perilModelabilityScore);
  return round1(
    modelabilityGap * 0.35 +
      clamp(input.retainedTailRiskScore) * 0.35 +
      clamp(input.geographicClientConcentrationRiskScore) * 0.30,
  );
}

export function classifyPerilModelability(score: number): PerilModelabilityState {
  const normalized = clamp(score);
  if (normalized >= 70) return 'MODEL_READY';
  if (normalized >= 40) return 'PARTIAL_MODELABILITY';
  return 'HARD_TO_MODEL';
}

export function evaluateDataCenterRiskTransfer(input: DataCenterRiskTransferInput): DataCenterRiskTransferResult {
  validateScores(input);
  validateEconomicProofChain(input);

  const marketStage = deriveDataCenterRiskTransferMarketStage(input);
  const companyProof = deriveDataCenterRiskTransferCompanyProof(input);
  const parentEconomicProofLevel = mapCompanyProofToParentEconomicProof(companyProof);
  const marketOpportunityScore = scoreDataCenterRiskTransferMarketOpportunity(input);
  const companyCaptureScore = scoreDataCenterRiskTransferCompanyCapture(input);
  const riskTransferFragilityScore = scoreDataCenterRiskTransferFragility(input);
  const perilModelabilityState = classifyPerilModelability(input.perilModelabilityScore);

  const proofRank: Record<DataCenterRiskTransferCompanyProof, number> = {
    DCRT_C0_NO_ATTRIBUTION: 0,
    DCRT_C1_COMPANY_POSITIONING: 1,
    DCRT_C2_ATTRIBUTABLE_TRANSACTION: 2,
    DCRT_C3_ATTRIBUTABLE_REVENUE_MARGIN: 3,
    DCRT_C4_MULTI_PERIOD_FCF_ROIC: 4,
  };

  const evidenceCountAdequate = input.evidenceIds.length >= 2;
  const evidenceGate: DataCenterRiskTransferResult['evidenceGate'] =
    input.evidenceTraceable && evidenceCountAdequate && proofRank[companyProof] >= 2
      ? 'CONFIRMED'
      : input.evidenceTraceable && proofRank[companyProof] >= 1
        ? 'PROVISIONAL'
        : 'BLOCKED';

  const hunterClasses: DataCenterRiskTransferResult['hunterClasses'] =
    proofRank[companyProof] >= 2
      ? ['H6_SECOND_ORDER_CAPTOR', 'H5_CONTRACTUAL_CAPTOR']
      : ['H6_SECOND_ORDER_CAPTOR'];

  const reasons: string[] = [
    'Data-center risk-transfer demand is a second-order consequence of AI/data-center asset concentration, not an independent CAPEX funding pool.',
  ];
  const falsifiers: string[] = [
    'insured_value_growth_fails_to_translate_into_premium_or_capacity_demand',
    'traditional_capacity_expands_enough_to_remove_the_protection_gap',
    'dedicated_program_capacity_is_announced_but_not_utilized',
    'reinsurance_or_ils_transactions_fail_to_scale_or_repeat',
    'company_transaction_activity_fails_to_translate_into_attributable_revenue_margin_or_cash',
    'pricing_softens_faster_than_volume_grows',
    'loss_experience_or_model_error_erases_underwriting_economics',
    'client_or_geographic_accumulation_creates_unacceptable_tail_risk',
    'valuation_prices_in_more_capture_than_company_can_economically_realize',
  ];

  let action: DataCenterRiskTransferResult['action'];
  if (companyProof === 'DCRT_C4_MULTI_PERIOD_FCF_ROIC' || companyProof === 'DCRT_C3_ATTRIBUTABLE_REVENUE_MARGIN') {
    action = 'HANDOFF_TO_T5';
    reasons.push('Company-level economics are attributable; hand off to the existing T5 CRTA contract. T5 then governs continuation to the standard ATLAS assessment stack and FRU-MATH.');
  } else if (companyProof === 'DCRT_C2_ATTRIBUTABLE_TRANSACTION' && evidenceGate === 'CONFIRMED') {
    action = 'ADVANCE_DEEP_RESEARCH';
    reasons.push('Attributable transaction proof exists, but revenue/margin/FCF conversion still requires verification.');
  } else if (marketStage === 'DCRT_M2_DEDICATED_CAPACITY_FORMING' || marketStage === 'DCRT_M3_REINSURANCE_TRANSFER_ACTIVE' || marketStage === 'DCRT_M4_ALTERNATIVE_CAPITAL_ACTIVE') {
    action = 'WATCH';
    reasons.push('Market formation is real, but company-level economic capture is not yet sufficiently proven.');
  } else {
    action = 'EVIDENCE_REQUIRED';
    reasons.push('Protection-gap or narrative evidence alone cannot establish a listed-company investment thesis.');
  }

  if (riskTransferFragilityScore >= 70) {
    reasons.push('Risk-transfer fragility is high; opportunity and retained tail risk must remain separate in E5/E6 review.');
  }
  if (perilModelabilityState === 'HARD_TO_MODEL') {
    reasons.push('Peril modelability is weak; pricing confidence and transfer capacity should be treated as provisional.');
  }
  if (!input.dedicatedAlternativeCapitalTransaction) {
    reasons.push('No dedicated data-center alternative-capital transaction is evidenced by this input; generic cloud/cyber ILS does not qualify as DCRT_M4.');
  }

  return {
    ticker: input.ticker,
    motorOrigin: 'AI_DATA_CENTER_RISK_TRANSFER_OMEGA_V1',
    parentEngine: 'GLOBAL_CAPEX_CHAIN_OMEGA_V1',
    parentModule: 'CAPEX_HUNTERS_OMEGA_V1',
    edd: 5,
    roles: input.roles,
    perils: input.perils,
    hunterClasses,
    marketStage,
    companyProof,
    parentEconomicProofLevel,
    evidenceGate,
    marketOpportunityScore,
    companyCaptureScore,
    riskTransferFragilityScore,
    perilModelabilityState,
    independentFundingPoolCredit: 'DERIVED_DO_NOT_COUNT_AS_NEW_POOL',
    action,
    reasons,
    falsifiers,
  };
}

export const AI_DATA_CENTER_RISK_TRANSFER_OMEGA = {
  id: 'AI_DATA_CENTER_RISK_TRANSFER_OMEGA_V1',
  name: 'AI Data Center Risk Transfer Ω v1.0',
  effectiveDate: '2026-09-12',
  role: 'r0_e1_second_order_capex_risk_transfer_discovery_submodule',
  parentEngine: 'GLOBAL_CAPEX_CHAIN_OMEGA_V1',
  parentModule: 'CAPEX_HUNTERS_OMEGA_V1',
  edd: 5,
  defaultHunterClass: 'H6_SECOND_ORDER_CAPTOR',
  structuralRules: [
    'NO_NEW_ENGINE',
    'NO_FRU_MATH_MODIFICATION',
    'DATA_CENTER_RISK_TRANSFER_IS_DERIVED_FROM_EXISTING_CAPEX_AND_DOES_NOT_CREATE_A_NEW_INDEPENDENT_FUNDING_POOL',
    'TIV_IS_NOT_EXPECTED_LOSS',
    'INSURED_VALUE_IS_NOT_PREMIUM',
    'PREMIUM_IS_NOT_COMPANY_REVENUE',
    'REINSURANCE_CEDED_IS_NOT_ILS_PLACED',
    'GENERIC_CLOUD_OR_CYBER_ILS_IS_NOT_A_DEDICATED_DATA_CENTER_CAT_BOND',
    'DEDICATED_FACILITY_CAPACITY_IS_NOT_UTILIZED_CAPACITY',
    'MARKET_GROWTH_IS_NOT_COMPANY_ALPHA',
    'BROKER_FEE_REVENUE_IS_NOT_UNDERWRITING_PROFIT',
    'OPPORTUNITY_AND_RETAINED_TAIL_RISK_REMAIN_SEPARATE',
    'C3_OR_C4_HANDOFF_MUST_GO_TO_EXISTING_T5_BEFORE_STANDARD_ATLAS_ASSESSMENT_AND_FRU',
    'NO_OUTPUT_IS_A_BUY_SIGNAL',
    'VALUATION_AND_EXPECTED_RETURN_REMAIN_EXTERNAL',
  ],
  parentEconomicProofMapping: {
    DCRT_C0_NO_ATTRIBUTION: 'E0_NARRATIVE',
    DCRT_C1_COMPANY_POSITIONING: 'E1_MANAGEMENT_CLAIM',
    DCRT_C2_ATTRIBUTABLE_TRANSACTION: 'E2_ORDERS_CONTRACTS',
    DCRT_C3_ATTRIBUTABLE_REVENUE_MARGIN: 'E3_REVENUE_MARGIN',
    DCRT_C4_MULTI_PERIOD_FCF_ROIC: 'E4_FCF_ROIC_MULTI_PERIOD',
  },
  marketOpportunityWeights: {
    riskAccumulation: 0.25,
    protectionGap: 0.25,
    dedicatedCapacity: 0.20,
    reinsuranceActivity: 0.15,
    alternativeCapitalEvidence: 0.15,
  },
  companyCaptureWeights: {
    causalExposure: 0.20,
    transactionProof: 0.25,
    revenueMarginAttribution: 0.25,
    cashRoicConversion: 0.20,
    capitalLightCapture: 0.10,
  },
} as const;
