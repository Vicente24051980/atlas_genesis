export const EU_GAS_STORAGE_OMEGA_VERSION = '1.0.0' as const;

export type StressLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
export type RefillTrajectory = 'AHEAD' | 'ON_TRACK' | 'BEHIND' | 'UNKNOWN';
export type OfficialSupplyAssessment =
  | 'NO_IMMEDIATE_CONCERN'
  | 'WATCH'
  | 'CONCERN'
  | 'EMERGENCY'
  | 'UNKNOWN';

export type EuGasStorageState =
  | 'GREEN'
  | 'YELLOW_DETERIORATING'
  | 'ORANGE_STRESS'
  | 'RED_SUPPLY_RISK'
  | 'INSUFFICIENT_EVIDENCE';

export type EuGasStorageInput = {
  asOf: string;
  storageFillPct: number;
  yearAgoFillPct?: number;
  statutoryTargetPct?: number;
  targetWindowStart?: string;
  targetWindowEnd?: string;
  gasPriceStress: StressLevel;
  refillTrajectory: RefillTrajectory;
  lngSupplyRisk: StressLevel;
  shippingDisruptionRisk: StressLevel;
  officialSupplyAssessment: OfficialSupplyAssessment;
  physicalShortageEvidence: boolean;
  regulatoryFlexibilityAvailable: boolean;
  evidenceIds: string[];
};

export type EuGasStorageResult = {
  version: typeof EU_GAS_STORAGE_OMEGA_VERSION;
  state: EuGasStorageState;
  storageFillPct: number;
  yoyGapPctPoints: number | null;
  targetGapPctPoints: number;
  stressChannels: string[];
  reasons: string[];
  energySecurityAction:
    | 'NORMAL_MONITORING'
    | 'DAILY_MONITORING'
    | 'ESCALATE_ENERGY_SECURITY_REVIEW'
    | 'EMERGENCY_PORTFOLIO_RISK_REVIEW'
    | 'RECOVER_EVIDENCE';
  moneyRotationPermission: 'TICKER_FLOW_REQUIRED';
  beneficiaryDiscovery: readonly string[];
};

const DEFAULT_STATUTORY_TARGET_PCT = 90;
const MATERIAL_YOY_GAP_PCT_POINTS = 8;

function assertPct(name: string, value: number): void {
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new Error(`eu_gas_storage_invalid_pct:${name}`);
  }
}

function uniqueEvidence(ids: string[]): string[] {
  return [...new Set(ids.map((id) => id.trim()).filter(Boolean))];
}

export function assessEuGasStorageOmega(input: EuGasStorageInput): EuGasStorageResult {
  assertPct('storageFillPct', input.storageFillPct);
  if (input.yearAgoFillPct !== undefined) assertPct('yearAgoFillPct', input.yearAgoFillPct);

  const target = input.statutoryTargetPct ?? DEFAULT_STATUTORY_TARGET_PCT;
  assertPct('statutoryTargetPct', target);

  const evidence = uniqueEvidence(input.evidenceIds);
  const yoyGap = input.yearAgoFillPct === undefined
    ? null
    : Math.round((input.storageFillPct - input.yearAgoFillPct) * 100) / 100;
  const targetGap = Math.max(0, Math.round((target - input.storageFillPct) * 100) / 100);

  const stressChannels: string[] = [];
  const reasons: string[] = [];

  if (yoyGap !== null && yoyGap <= -MATERIAL_YOY_GAP_PCT_POINTS) {
    stressChannels.push('MATERIAL_YOY_STORAGE_GAP');
    reasons.push(`storage_yoy_gap_${yoyGap}pp`);
  }
  if (input.refillTrajectory === 'BEHIND') {
    stressChannels.push('REFILL_TRAJECTORY_BEHIND');
    reasons.push('refill_trajectory_behind');
  }
  if (input.gasPriceStress === 'HIGH') {
    stressChannels.push('GAS_PRICE_STRESS_HIGH');
    reasons.push('high_gas_prices_can_discourage_injection');
  }
  if (input.lngSupplyRisk === 'HIGH') {
    stressChannels.push('LNG_SUPPLY_RISK_HIGH');
    reasons.push('lng_supply_risk_high');
  }
  if (input.shippingDisruptionRisk === 'HIGH') {
    stressChannels.push('SHIPPING_DISRUPTION_HIGH');
    reasons.push('shipping_disruption_risk_high');
  }
  if (input.officialSupplyAssessment === 'CONCERN') {
    stressChannels.push('OFFICIAL_SUPPLY_CONCERN');
    reasons.push('official_supply_concern');
  }
  if (input.officialSupplyAssessment === 'EMERGENCY') {
    stressChannels.push('OFFICIAL_SUPPLY_EMERGENCY');
    reasons.push('official_supply_emergency');
  }

  if (targetGap > 0) reasons.push(`statutory_target_gap_${targetGap}pp`);
  if (input.regulatoryFlexibilityAvailable) reasons.push('regulatory_flexibility_available');
  if (input.officialSupplyAssessment === 'NO_IMMEDIATE_CONCERN') {
    reasons.push('official_no_immediate_supply_concern');
  }

  // Evidence Integrity Ω: a storage datapoint plus at least one independent contextual source
  // is required before the state machine is allowed to escalate or de-escalate.
  if (!input.asOf.trim() || evidence.length < 2) {
    return {
      version: EU_GAS_STORAGE_OMEGA_VERSION,
      state: 'INSUFFICIENT_EVIDENCE',
      storageFillPct: input.storageFillPct,
      yoyGapPctPoints: yoyGap,
      targetGapPctPoints: targetGap,
      stressChannels,
      reasons: [...reasons, 'minimum_two_traceable_evidence_ids_required'],
      energySecurityAction: 'RECOVER_EVIDENCE',
      moneyRotationPermission: 'TICKER_FLOW_REQUIRED',
      beneficiaryDiscovery: [],
    };
  }

  const severePhysicalChannel =
    input.lngSupplyRisk === 'HIGH' ||
    input.shippingDisruptionRisk === 'HIGH' ||
    input.refillTrajectory === 'BEHIND';

  let state: EuGasStorageState = 'GREEN';

  if (
    input.officialSupplyAssessment === 'EMERGENCY' ||
    (input.physicalShortageEvidence && severePhysicalChannel && stressChannels.length >= 3)
  ) {
    state = 'RED_SUPPLY_RISK';
  } else if (
    input.officialSupplyAssessment === 'CONCERN' ||
    (stressChannels.length >= 3 && severePhysicalChannel)
  ) {
    state = 'ORANGE_STRESS';
  } else if (stressChannels.length >= 1) {
    state = 'YELLOW_DETERIORATING';
  }

  const energySecurityAction = state === 'RED_SUPPLY_RISK'
    ? 'EMERGENCY_PORTFOLIO_RISK_REVIEW'
    : state === 'ORANGE_STRESS'
      ? 'ESCALATE_ENERGY_SECURITY_REVIEW'
      : state === 'YELLOW_DETERIORATING'
        ? 'DAILY_MONITORING'
        : 'NORMAL_MONITORING';

  const beneficiaryDiscovery = state === 'GREEN'
    ? []
    : ['LNG_EXPORTERS', 'GAS_INFRASTRUCTURE', 'ENERGY_SECURITY', 'GRID_AND_POWER'];

  return {
    version: EU_GAS_STORAGE_OMEGA_VERSION,
    state,
    storageFillPct: input.storageFillPct,
    yoyGapPctPoints: yoyGap,
    targetGapPctPoints: targetGap,
    stressChannels,
    reasons,
    energySecurityAction,
    moneyRotationPermission: 'TICKER_FLOW_REQUIRED',
    beneficiaryDiscovery,
  };
}
