export const CONVERSATIONAL_INTENT_MONETIZATION_OMEGA_VERSION = '1.0.0' as const;

export type ConversationalIntentState =
  | 'C0_NARRATIVE_OR_ANNOUNCED'
  | 'C1_LIVE_INVENTORY'
  | 'C2_ADVERTISER_DEMAND'
  | 'C3_REVENUE_LINKAGE'
  | 'C4_UNIT_ECONOMICS_PROOF'
  | 'C5_DURABLE_INTENT_CONTROL_POINT'
  | 'INSUFFICIENT_EVIDENCE';

export type ParentTollboothContribution =
  | 'T0_ONLY'
  | 'T1_USAGE_SUPPORT'
  | 'T2_REVENUE_SUPPORT'
  | 'T3_MARGIN_FCF_SUPPORT'
  | 'T4_CONTROL_POINT_SUPPORT';

export type ConversationalIntentInput = {
  asOf: string;
  company: string;
  adsLiveInAnyMarket: boolean;
  announcedOnly?: boolean;
  eligibleAudienceProof: number;
  adInventoryProof: number;
  advertiserDemandProof: number;
  monetizationMechanismProof: number;
  conversionMeasurementProof: number;
  revenueLinkageProof: number;
  unitEconomicsProof: number;
  advertiserRoiProof: number;
  retentionIntegrityProof: number;
  intentControlPointDurability: number;
  trustRegulatoryRisk: number;
  disintermediationRisk: number;
  adLoadExperienceRisk: number;
  adsSeparatedFromAnswers: boolean | 'UNKNOWN';
  assistantResponseIndependencePolicy: boolean | 'UNKNOWN';
  advertiserConversationAccessProhibited: boolean | 'UNKNOWN';
  sensitiveTopicExclusions: boolean | 'UNKNOWN';
  evidenceIds: string[];
};

export type ConversationalIntentResult = {
  version: typeof CONVERSATIONAL_INTENT_MONETIZATION_OMEGA_VERSION;
  company: string;
  state: ConversationalIntentState;
  score: number | null;
  parentTollboothContribution: ParentTollboothContribution;
  economicChain: readonly string[];
  facts: string[];
  hypotheses: string[];
  falsifiers: string[];
  forbiddenInferences: readonly string[];
  nextEvidenceRequired: string[];
  action: 'DISCOVERY' | 'WATCH' | 'ECONOMIC_PROOF_AUDIT' | 'DURABILITY_AUDIT';
  buyAuthority: false;
};

const ECONOMIC_CHAIN = [
  'ELIGIBLE_USERS',
  'COMMERCIAL_INTENT',
  'AD_INVENTORY',
  'IMPRESSION_OR_CLICK',
  'CONVERSION',
  'AD_REVENUE',
  'REVENUE_PER_ELIGIBLE_USER',
  'INFERENCE_COST_PER_USER',
  'CONTRIBUTION_MARGIN',
  'RETENTION_AND_TRUST',
] as const;

const FORBIDDEN_INFERENCES = [
  'ADS_LIVE_DOES_NOT_EQUAL_MATERIAL_REVENUE',
  'CPM_CPC_O_CPC_CAPABILITY_DOES_NOT_EQUAL_ADVERTISER_ROAS',
  'USER_SCALE_DOES_NOT_EQUAL_MONETIZABLE_INTENT',
  'AD_REVENUE_DOES_NOT_EQUAL_POSITIVE_UNIT_ECONOMICS',
  'ADVERTISER_PAYMENT_DOES_NOT_EQUAL_ASSISTANT_RESPONSE_INFLUENCE',
  'PRIVATE_COMPANY_SIGNAL_DOES_NOT_CREATE_PUBLIC_EQUITY_BUY',
  'AI_TOLLBOOTH_SIGNAL_DOES_NOT_OVERRIDE_VALUATION_OR_FALSIFIERS',
] as const;

function assertScore(name: string, value: number): void {
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new Error(`conversational_intent_score_out_of_range:${name}`);
  }
}

function uniqueEvidence(ids: string[]): string[] {
  return [...new Set(ids.map((id) => id.trim()).filter(Boolean))];
}

export function calculateConversationalIntentScore(input: ConversationalIntentInput): number {
  const positive = {
    eligibleAudienceProof: 0.08,
    adInventoryProof: 0.10,
    advertiserDemandProof: 0.10,
    monetizationMechanismProof: 0.10,
    conversionMeasurementProof: 0.08,
    revenueLinkageProof: 0.16,
    unitEconomicsProof: 0.14,
    advertiserRoiProof: 0.08,
    retentionIntegrityProof: 0.08,
    intentControlPointDurability: 0.08,
  } as const;

  const penalties = {
    trustRegulatoryRisk: 0.08,
    disintermediationRisk: 0.06,
    adLoadExperienceRisk: 0.06,
  } as const;

  let score = 0;
  for (const [key, weight] of Object.entries(positive) as Array<[keyof typeof positive, number]>) {
    assertScore(key, input[key]);
    score += input[key] * weight;
  }
  for (const [key, weight] of Object.entries(penalties) as Array<[keyof typeof penalties, number]>) {
    assertScore(key, input[key]);
    score -= input[key] * weight;
  }

  return Math.max(0, Math.min(100, Math.round(score * 100) / 100));
}

export function assessConversationalIntentMonetizationOmega(
  input: ConversationalIntentInput,
): ConversationalIntentResult {
  if (!input.company.trim()) throw new Error('conversational_intent_missing_company');

  const evidence = uniqueEvidence(input.evidenceIds);
  const score = calculateConversationalIntentScore(input);
  const facts: string[] = [];
  const hypotheses: string[] = [];
  const falsifiers: string[] = [];
  const nextEvidenceRequired: string[] = [];

  if (input.adsLiveInAnyMarket) facts.push('ads_live_in_at_least_one_market');
  if (input.announcedOnly) facts.push('announced_rollout_not_yet_live_in_target_market');
  if (input.adsSeparatedFromAnswers === true) facts.push('ads_separated_from_answers_policy');
  if (input.assistantResponseIndependencePolicy === true) facts.push('assistant_response_independence_policy');
  if (input.advertiserConversationAccessProhibited === true) facts.push('advertiser_conversation_access_prohibited_policy');
  if (input.sensitiveTopicExclusions === true) facts.push('sensitive_topic_ad_exclusions_policy');

  if (!input.asOf.trim() || evidence.length < 2) {
    return {
      version: CONVERSATIONAL_INTENT_MONETIZATION_OMEGA_VERSION,
      company: input.company,
      state: 'INSUFFICIENT_EVIDENCE',
      score: null,
      parentTollboothContribution: 'T0_ONLY',
      economicChain: ECONOMIC_CHAIN,
      facts,
      hypotheses: ['monetization_chain_unverified'],
      falsifiers,
      forbiddenInferences: FORBIDDEN_INFERENCES,
      nextEvidenceRequired: ['minimum_two_traceable_evidence_ids', 'dated_operational_evidence'],
      action: 'DISCOVERY',
      buyAuthority: false,
    };
  }

  let state: ConversationalIntentState = 'C0_NARRATIVE_OR_ANNOUNCED';

  const liveInventory =
    input.adsLiveInAnyMarket &&
    input.eligibleAudienceProof >= 50 &&
    input.adInventoryProof >= 50;

  const advertiserDemand =
    liveInventory &&
    input.advertiserDemandProof >= 50 &&
    input.monetizationMechanismProof >= 50 &&
    input.conversionMeasurementProof >= 50;

  const revenueLinked = advertiserDemand && input.revenueLinkageProof >= 60;

  const unitEconomics =
    revenueLinked &&
    input.unitEconomicsProof >= 60 &&
    input.retentionIntegrityProof >= 50;

  const trustArchitectureKnown =
    input.adsSeparatedFromAnswers === true &&
    input.assistantResponseIndependencePolicy === true &&
    input.advertiserConversationAccessProhibited === true;

  const durableControlPoint =
    unitEconomics &&
    input.advertiserRoiProof >= 60 &&
    input.intentControlPointDurability >= 70 &&
    input.trustRegulatoryRisk <= 40 &&
    input.disintermediationRisk <= 50 &&
    input.adLoadExperienceRisk <= 45 &&
    trustArchitectureKnown;

  if (liveInventory) state = 'C1_LIVE_INVENTORY';
  if (advertiserDemand) state = 'C2_ADVERTISER_DEMAND';
  if (revenueLinked) state = 'C3_REVENUE_LINKAGE';
  if (unitEconomics) state = 'C4_UNIT_ECONOMICS_PROOF';
  if (durableControlPoint) state = 'C5_DURABLE_INTENT_CONTROL_POINT';

  if (!liveInventory) nextEvidenceRequired.push('live_inventory_and_eligible_audience');
  if (liveInventory && !advertiserDemand) nextEvidenceRequired.push('repeat_advertiser_demand_and_conversion_measurement');
  if (advertiserDemand && !revenueLinked) nextEvidenceRequired.push('company_specific_ad_revenue_linkage');
  if (revenueLinked && !unitEconomics) nextEvidenceRequired.push('revenue_per_user_vs_inference_cost_and_contribution_margin');
  if (unitEconomics && !durableControlPoint) nextEvidenceRequired.push('repeat_advertiser_roas_retention_and_control_point_durability');

  if (input.trustRegulatoryRisk >= 60) falsifiers.push('trust_or_regulatory_risk_high');
  if (input.disintermediationRisk >= 60) falsifiers.push('intent_layer_disintermediation_risk_high');
  if (input.adLoadExperienceRisk >= 60) falsifiers.push('ad_load_or_user_experience_risk_high');
  if (input.retentionIntegrityProof < 40 && revenueLinked) falsifiers.push('monetization_may_degrade_retention_or_trust');

  if (state === 'C0_NARRATIVE_OR_ANNOUNCED' || state === 'C1_LIVE_INVENTORY') {
    hypotheses.push('commercial_intent_may_be_monetizable_but_economic_linkage_not_proven');
  }
  if (state === 'C2_ADVERTISER_DEMAND') {
    hypotheses.push('advertiser_demand_exists_but_material_revenue_linkage_not_proven');
  }

  const parentTollboothContribution: ParentTollboothContribution =
    state === 'C5_DURABLE_INTENT_CONTROL_POINT'
      ? 'T4_CONTROL_POINT_SUPPORT'
      : state === 'C4_UNIT_ECONOMICS_PROOF'
        ? 'T3_MARGIN_FCF_SUPPORT'
        : state === 'C3_REVENUE_LINKAGE'
          ? 'T2_REVENUE_SUPPORT'
          : state === 'C1_LIVE_INVENTORY' || state === 'C2_ADVERTISER_DEMAND'
            ? 'T1_USAGE_SUPPORT'
            : 'T0_ONLY';

  const action: ConversationalIntentResult['action'] =
    state === 'C5_DURABLE_INTENT_CONTROL_POINT'
      ? 'DURABILITY_AUDIT'
      : state === 'C3_REVENUE_LINKAGE' || state === 'C4_UNIT_ECONOMICS_PROOF'
        ? 'ECONOMIC_PROOF_AUDIT'
        : state === 'C2_ADVERTISER_DEMAND'
          ? 'WATCH'
          : 'DISCOVERY';

  return {
    version: CONVERSATIONAL_INTENT_MONETIZATION_OMEGA_VERSION,
    company: input.company,
    state,
    score,
    parentTollboothContribution,
    economicChain: ECONOMIC_CHAIN,
    facts,
    hypotheses,
    falsifiers,
    forbiddenInferences: FORBIDDEN_INFERENCES,
    nextEvidenceRequired,
    action,
    buyAuthority: false,
  };
}
