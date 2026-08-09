export type QuantMetricType =
  | 'MARKET_CAP_CHANGE'
  | 'ETF_NET_FLOW'
  | 'MUTUAL_FUND_NET_FLOW'
  | 'ETF_CREATION_REDEMPTION'
  | 'AUM_CHANGE'
  | 'PRICE_RETURN'
  | 'VOLUME'
  | 'INSTITUTIONAL_POSITION_CHANGE'
  | 'FUND_ALLOCATION'
  | 'CAPEX'
  | 'FCF'
  | 'ROIC';

export type ClaimClass = 'fact' | 'evidence' | 'interpretation' | 'hypothesis' | 'speculation';

export type QuantitativeObservation = {
  metric: QuantMetricType;
  value: number;
  unit: string;
  currency?: string;
  periodStart?: string;
  periodEnd?: string;
  asOf: string;
  universe?: string;
  measurementMethod?: string;
  sourceEvidenceId: string;
};

export type ClaimRecord = {
  id: string;
  evidenceId: string;
  text: string;
  claimClass: ClaimClass;
  sourceLevel: 1 | 2 | 3 | 4;
  eventClusterId?: string;
  independenceScore: number;
  publishedAt?: string;
  filedAt?: string;
  eventAt?: string;
  effectiveAt?: string;
  isNewInformation: boolean;
  quantitative?: QuantitativeObservation;
  confirmedByPrimaryEvidenceIds: string[];
};

export type AtlasAction = 'HOLD' | 'WATCH' | 'BUY' | 'REDUCE' | 'SELL';

export function isCapitalFlowMetric(metric: QuantMetricType): boolean {
  return metric === 'ETF_NET_FLOW' ||
    metric === 'MUTUAL_FUND_NET_FLOW' ||
    metric === 'ETF_CREATION_REDEMPTION' ||
    metric === 'INSTITUTIONAL_POSITION_CHANGE' ||
    metric === 'FUND_ALLOCATION';
}

export function assertMoneyRotationSemantics(observation: QuantitativeObservation): void {
  if (!isCapitalFlowMetric(observation.metric)) {
    throw new Error(`money_rotation_non_flow_metric:${observation.metric}`);
  }
}

export function canClaimCanonicalFact(claim: ClaimRecord): boolean {
  if (claim.sourceLevel === 1 && (claim.claimClass === 'fact' || claim.claimClass === 'evidence')) return true;
  return claim.confirmedByPrimaryEvidenceIds.length > 0 &&
    (claim.claimClass === 'fact' || claim.claimClass === 'evidence');
}

export function independentSignalCount(claims: ClaimRecord[], minimumIndependence = 0.7): number {
  const clusters = new Set<string>();
  let independent = 0;
  for (const claim of claims) {
    if (!claim.isNewInformation || claim.independenceScore < minimumIndependence) continue;
    if (claim.eventClusterId) {
      if (clusters.has(claim.eventClusterId)) continue;
      clusters.add(claim.eventClusterId);
    }
    independent += 1;
  }
  return independent;
}

export type DecisionGateInput = {
  requestedAction: AtlasAction;
  claims: ClaimRecord[];
  confirmedThesisFalsifier: boolean;
  falsifierEvidenceIds: string[];
};

export type DecisionGateResult = {
  allowed: boolean;
  action: AtlasAction;
  reasons: string[];
};

export function decisionSafetyGate(input: DecisionGateInput): DecisionGateResult {
  const reasons: string[] = [];
  const destructive = input.requestedAction === 'REDUCE' || input.requestedAction === 'SELL';

  if (destructive && !input.confirmedThesisFalsifier) reasons.push('destructive_action_requires_confirmed_thesis_falsifier');
  if (destructive && input.falsifierEvidenceIds.length === 0) reasons.push('destructive_action_requires_traceable_primary_evidence');
  if (destructive && independentSignalCount(input.claims) < 1) reasons.push('destructive_action_requires_independent_new_signal');

  return {
    allowed: reasons.length === 0,
    action: reasons.length === 0 ? input.requestedAction : 'WATCH',
    reasons,
  };
}

export function reconciliationKey(observation: QuantitativeObservation): string {
  return [observation.metric, observation.unit, observation.currency ?? '', observation.periodStart ?? '', observation.periodEnd ?? '', observation.asOf, observation.universe ?? ''].join('|');
}

export function requiresReconciliation(a: QuantitativeObservation, b: QuantitativeObservation): boolean {
  return reconciliationKey(a) === reconciliationKey(b) && a.value !== b.value;
}
