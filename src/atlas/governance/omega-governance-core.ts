export const OMEGA_GOVERNANCE_VERSION = '2026-09-07-v1.0.0' as const;

export type Candidate = {
  ticker: string;
  expectedReturn: number;
  risk: number;
  fragility: number;
};

export type DominanceResult = {
  incumbent: string;
  challenger: string;
  dominated: boolean;
};

export function dominates(challenger: Candidate, incumbent: Candidate): boolean {
  const weaklyBetter = challenger.expectedReturn >= incumbent.expectedReturn &&
    challenger.risk <= incumbent.risk && challenger.fragility <= incumbent.fragility;
  const strictlyBetter = challenger.expectedReturn > incumbent.expectedReturn ||
    challenger.risk < incumbent.risk || challenger.fragility < incumbent.fragility;
  return weaklyBetter && strictlyBetter;
}

export function dominanceAudit(candidates: Candidate[]): DominanceResult[] {
  const out: DominanceResult[] = [];
  for (const incumbent of candidates) {
    for (const challenger of candidates) {
      if (incumbent.ticker === challenger.ticker) continue;
      out.push({ incumbent: incumbent.ticker, challenger: challenger.ticker, dominated: dominates(challenger, incumbent) });
    }
  }
  return out;
}

export function paretoFrontier(candidates: Candidate[]): Candidate[] {
  return candidates.filter(c => !candidates.some(other => other.ticker !== c.ticker && dominates(other, c)));
}

export type ExpectedReturnBridge = {
  fundamentalCompounding: number;
  capitalReturn: number;
  multipleEffect: number;
};

export function totalExpectedReturn(x: ExpectedReturnBridge): number {
  return x.fundamentalCompounding + x.capitalReturn + x.multipleEffect;
}

export function multipleDependence(x: ExpectedReturnBridge): 'FUNDAMENTAL_DRIVEN' | 'MIXED' | 'MULTIPLE_DEPENDENT' {
  const total = Math.abs(totalExpectedReturn(x));
  if (total === 0) return 'MIXED';
  const share = Math.abs(x.multipleEffect) / total;
  return share >= 0.5 ? 'MULTIPLE_DEPENDENT' : share >= 0.2 ? 'MIXED' : 'FUNDAMENTAL_DRIVEN';
}

export function incrementalRoic(deltaNopat: number, deltaInvestedCapital: number): number | null {
  if (!Number.isFinite(deltaNopat) || !Number.isFinite(deltaInvestedCapital) || deltaInvestedCapital === 0) return null;
  return deltaNopat / deltaInvestedCapital;
}

export type MaterialityPolicy = {
  minDeltaUtilityAfterCosts: number;
  minDeltaExpectedReturn?: number;
  maxRiskIncrease?: number;
};

export type Replacement = {
  deltaUtilityBeforeCosts: number;
  transactionCosts: number;
  spreads: number;
  fxImpact: number;
  taxEffects: number;
  operationalComplexity: number;
  deltaExpectedReturn?: number;
  deltaRisk?: number;
};

export function netDeltaUtility(x: Replacement): number {
  return x.deltaUtilityBeforeCosts - x.transactionCosts - x.spreads - x.fxImpact - x.taxEffects - x.operationalComplexity;
}

export function replacementPassesFirewall(x: Replacement, policy: MaterialityPolicy): boolean {
  const net = netDeltaUtility(x);
  if (!(net > policy.minDeltaUtilityAfterCosts)) return false;
  if (policy.minDeltaExpectedReturn !== undefined && (x.deltaExpectedReturn ?? -Infinity) < policy.minDeltaExpectedReturn) return false;
  if (policy.maxRiskIncrease !== undefined && (x.deltaRisk ?? Infinity) > policy.maxRiskIncrease) return false;
  return true;
}

export type CutClass = 'HARD_IN' | 'SOFT_IN' | 'BORDERLINE' | 'SOFT_OUT' | 'CLEAR_OUT';

export function classifyCut(selectionFrequency: number): CutClass {
  if (!Number.isFinite(selectionFrequency) || selectionFrequency < 0 || selectionFrequency > 1) throw new Error('INVALID_SELECTION_FREQUENCY');
  if (selectionFrequency >= 0.9) return 'HARD_IN';
  if (selectionFrequency >= 0.7) return 'SOFT_IN';
  if (selectionFrequency >= 0.4) return 'BORDERLINE';
  if (selectionFrequency >= 0.1) return 'SOFT_OUT';
  return 'CLEAR_OUT';
}

export function robustCore(selectionFrequencies: Record<string, number>, threshold = 0.8): string[] {
  if (!Number.isFinite(threshold) || threshold < 0 || threshold > 1) throw new Error('INVALID_ROBUST_CORE_THRESHOLD');
  return Object.entries(selectionFrequencies)
    .filter(([, frequency]) => frequency >= threshold)
    .map(([ticker]) => ticker)
    .sort();
}

export type DecisionRecord = {
  date: string;
  out: string | null;
  in: string | null;
  deltaExpectedReturn: number;
  deltaRisk: number;
  deltaFragility: number;
  deltaUtility: number;
  evidence: string[];
  confidence: number;
  falsifier: string;
};

export function validateDecisionRecord(record: DecisionRecord): string[] {
  const errors: string[] = [];
  if (!Number.isFinite(Date.parse(record.date))) errors.push('INVALID_DATE');
  if (!record.out && !record.in) errors.push('NO_CHANGE_RECORDED');
  if (![record.deltaExpectedReturn, record.deltaRisk, record.deltaFragility, record.deltaUtility].every(Number.isFinite)) errors.push('INVALID_METRIC');
  if (record.evidence.length === 0) errors.push('MISSING_EVIDENCE');
  if (!Number.isFinite(record.confidence) || record.confidence < 0 || record.confidence > 1) errors.push('INVALID_CONFIDENCE');
  if (!record.falsifier.trim()) errors.push('MISSING_FALSIFIER');
  return errors;
}

export type RevisionRecord<T> = {
  field: string;
  oldValue: T;
  newValue: T;
  reason: string;
  timestamp: string;
};

export function validateRevisionRecord<T>(record: RevisionRecord<T>): string[] {
  const errors: string[] = [];
  if (!record.field.trim()) errors.push('MISSING_FIELD');
  if (!record.reason.trim()) errors.push('MISSING_REASON');
  if (!Number.isFinite(Date.parse(record.timestamp))) errors.push('INVALID_TIMESTAMP');
  return errors;
}

export type PredictionRecord = {
  id: string;
  predictionTimestamp: string;
  asOfTimestamp: string;
  target: string;
  horizon: string;
  predictedValue: number;
  confidence: number;
};

export function validatePrediction(record: PredictionRecord): string[] {
  const errors: string[] = [];
  const predictionTs = Date.parse(record.predictionTimestamp);
  const asOfTs = Date.parse(record.asOfTimestamp);
  if (!Number.isFinite(predictionTs) || !Number.isFinite(asOfTs)) errors.push('INVALID_TIMESTAMP');
  if (Number.isFinite(predictionTs) && Number.isFinite(asOfTs) && asOfTs > predictionTs) errors.push('AS_OF_AFTER_PREDICTION');
  if (!record.id.trim() || !record.target.trim() || !record.horizon.trim()) errors.push('MISSING_IDENTITY');
  if (!Number.isFinite(record.predictedValue)) errors.push('INVALID_PREDICTION');
  if (!Number.isFinite(record.confidence) || record.confidence < 0 || record.confidence > 1) errors.push('INVALID_CONFIDENCE');
  return errors;
}
