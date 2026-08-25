export const ECONOMIC_EVIDENCE_TRANSLATION_OMEGA_VERSION = '2026-08-24-v1.0.0' as const;

export type TranslationGate = 'PASS' | 'CAUTION' | 'FAIL' | 'EVIDENCE_PENDING';

function finite(value: number | undefined): value is number {
  return value != null && Number.isFinite(value);
}

function evidencePasses(traceable: boolean, ids: string[], minimum = 2): boolean {
  return traceable && ids.filter((id) => id.trim().length > 0).length >= minimum;
}

/**
 * CONTRACT / ECONOMIC EVIDENCE NORMALIZER Ω
 *
 * Prevents framework values, contract ceilings, milestone values, warrants,
 * RPO and backlog from being promoted into recognized revenue or owner economics.
 */
export type ContractEvidenceKind =
  | 'TAM'
  | 'FRAMEWORK'
  | 'CONTRACT_CEILING'
  | 'MILESTONE_CEILING'
  | 'WARRANT_MILESTONE'
  | 'RPO'
  | 'BACKLOG'
  | 'PURCHASE_ORDER'
  | 'SHIPMENT'
  | 'CUSTOMER_ACCEPTANCE'
  | 'RECOGNIZED_REVENUE'
  | 'GROSS_PROFIT'
  | 'OCF'
  | 'FCF'
  | 'ROIC';

export type EconomicEvidenceStage = 'E0_NARRATIVE' | 'E1_CLAIM' | 'E2_COMMERCIAL' | 'E3_REVENUE_MARGIN' | 'E4_OWNER_ECONOMICS';
export type ValuationTreatment = 'DISCOVERY_ONLY' | 'SCENARIO_INPUT_ONLY' | 'REVENUE_VISIBLE' | 'OWNER_ECONOMICS_VISIBLE';

export interface ContractEvidenceNormalizerInput {
  evidenceTraceable: boolean;
  evidenceIds: string[];
  kind: ContractEvidenceKind;
  amount?: number;
  cancellable?: boolean;
  customerAcceptanceRequired?: boolean;
  customerAccepted?: boolean;
  recognizedRevenue?: boolean;
  grossProfitEvidence?: boolean;
  cashConversionEvidence?: boolean;
  roicEvidence?: boolean;
  multiPeriodCashEvidence?: boolean;
}

export interface ContractEvidenceNormalizerResult {
  gate: TranslationGate;
  economicEvidenceStage: EconomicEvidenceStage;
  valuationTreatment: ValuationTreatment;
  mayEnterRevenueBase: boolean;
  mayEnterFcfBase: boolean;
  reasons: string[];
}

const COMMERCIAL_KINDS: ContractEvidenceKind[] = [
  'CONTRACT_CEILING', 'MILESTONE_CEILING', 'WARRANT_MILESTONE', 'RPO', 'BACKLOG', 'PURCHASE_ORDER', 'SHIPMENT', 'CUSTOMER_ACCEPTANCE',
];

export function normalizeContractEvidence(input: ContractEvidenceNormalizerInput): ContractEvidenceNormalizerResult {
  const reasons: string[] = [];
  if (!evidencePasses(input.evidenceTraceable, input.evidenceIds)) {
    return {
      gate: 'EVIDENCE_PENDING', economicEvidenceStage: 'E0_NARRATIVE', valuationTreatment: 'DISCOVERY_ONLY',
      mayEnterRevenueBase: false, mayEnterFcfBase: false,
      reasons: ['Contract/economic evidence requires at least two traceable evidence records.'],
    };
  }

  let economicEvidenceStage: EconomicEvidenceStage = 'E1_CLAIM';
  let valuationTreatment: ValuationTreatment = 'DISCOVERY_ONLY';
  let mayEnterRevenueBase = false;
  let mayEnterFcfBase = false;

  if (input.kind === 'TAM' || input.kind === 'FRAMEWORK') {
    economicEvidenceStage = 'E1_CLAIM';
    reasons.push('TAM/framework evidence is discovery or scenario evidence, not contracted revenue.');
  } else if (COMMERCIAL_KINDS.includes(input.kind)) {
    economicEvidenceStage = 'E2_COMMERCIAL';
    valuationTreatment = 'SCENARIO_INPUT_ONLY';
    reasons.push(`${input.kind} is commercial evidence but cannot be promoted to recognized revenue by itself.`);
  }

  const revenueObserved = input.kind === 'RECOGNIZED_REVENUE' || input.kind === 'GROSS_PROFIT' || input.kind === 'OCF' || input.kind === 'FCF' || input.kind === 'ROIC' || input.recognizedRevenue === true;
  const marginObserved = input.kind === 'GROSS_PROFIT' || input.kind === 'OCF' || input.kind === 'FCF' || input.kind === 'ROIC' || input.grossProfitEvidence === true;
  const fcfObserved = input.kind === 'FCF' || input.kind === 'ROIC' || input.cashConversionEvidence === true;
  const roicObserved = input.kind === 'ROIC' || input.roicEvidence === true;

  if (input.customerAcceptanceRequired && input.customerAccepted !== true && revenueObserved) {
    reasons.push('Revenue promotion is blocked because economically material customer acceptance has not been evidenced.');
    return {
      gate: 'FAIL', economicEvidenceStage: 'E2_COMMERCIAL', valuationTreatment: 'SCENARIO_INPUT_ONLY',
      mayEnterRevenueBase: false, mayEnterFcfBase: false, reasons,
    };
  }

  if (revenueObserved && marginObserved) {
    economicEvidenceStage = 'E3_REVENUE_MARGIN';
    valuationTreatment = 'REVENUE_VISIBLE';
    mayEnterRevenueBase = true;
  }

  if (fcfObserved && roicObserved && input.multiPeriodCashEvidence === true) {
    economicEvidenceStage = 'E4_OWNER_ECONOMICS';
    valuationTreatment = 'OWNER_ECONOMICS_VISIBLE';
    mayEnterRevenueBase = true;
    mayEnterFcfBase = true;
  } else if (fcfObserved) {
    reasons.push('FCF evidence exists, but E4 requires multi-period cash conversion plus ROIC evidence.');
  }

  if (input.cancellable === true && economicEvidenceStage === 'E2_COMMERCIAL') {
    reasons.push('Cancellation rights reduce backlog/RPO quality and must remain visible in scenario weighting.');
  }

  const gate: TranslationGate = economicEvidenceStage === 'E4_OWNER_ECONOMICS'
    ? 'PASS'
    : economicEvidenceStage === 'E3_REVENUE_MARGIN'
      ? 'CAUTION'
      : input.kind === 'TAM' || input.kind === 'FRAMEWORK'
        ? 'FAIL'
        : 'CAUTION';

  return { gate, economicEvidenceStage, valuationTreatment, mayEnterRevenueBase, mayEnterFcfBase, reasons };
}

/**
 * ORGANIC GROWTH DECOMPOSITION Ω
 *
 * Contribution signs must reflect their contribution to reported growth.
 * Example: an acquisition adding +4pp is +4; FX subtracting 1pp is -1.
 */
export interface OrganicGrowthDecompositionInput {
  evidenceTraceable: boolean;
  evidenceIds: string[];
  reportedGrowthPct: number;
  acquisitionContributionPctPoints?: number;
  fxContributionPctPoints?: number;
  divestitureContributionPctPoints?: number;
  accountingOrOtherContributionPctPoints?: number;
  realizedPriceContributionPctPoints?: number;
  volumeOrUsageContributionPctPoints?: number;
  mixContributionPctPoints?: number;
}

export type OrganicGrowthState = 'RECONCILED' | 'PARTIAL' | 'M_AND_A_MATERIAL' | 'EVIDENCE_PENDING';

export interface OrganicGrowthDecompositionResult {
  state: OrganicGrowthState;
  organicGrowthPct: number | null;
  priceVolumeMixResidualPctPoints: number | null;
  acquisitionShareOfReportedGrowthPct: number | null;
  reasons: string[];
}

export function decomposeOrganicGrowth(input: OrganicGrowthDecompositionInput): OrganicGrowthDecompositionResult {
  if (!evidencePasses(input.evidenceTraceable, input.evidenceIds) || !finite(input.reportedGrowthPct)) {
    return {
      state: 'EVIDENCE_PENDING', organicGrowthPct: null, priceVolumeMixResidualPctPoints: null,
      acquisitionShareOfReportedGrowthPct: null, reasons: ['Organic growth decomposition requires traceable reported-growth evidence.'],
    };
  }

  const acquisition = input.acquisitionContributionPctPoints ?? 0;
  const fx = input.fxContributionPctPoints ?? 0;
  const divestiture = input.divestitureContributionPctPoints ?? 0;
  const other = input.accountingOrOtherContributionPctPoints ?? 0;
  const organicGrowthPct = input.reportedGrowthPct - acquisition - fx - divestiture - other;
  const reasons: string[] = [];

  const pvmAvailable = [input.realizedPriceContributionPctPoints, input.volumeOrUsageContributionPctPoints, input.mixContributionPctPoints].every(finite);
  const pvmSum = pvmAvailable
    ? (input.realizedPriceContributionPctPoints as number) + (input.volumeOrUsageContributionPctPoints as number) + (input.mixContributionPctPoints as number)
    : null;
  const priceVolumeMixResidualPctPoints = pvmSum == null ? null : organicGrowthPct - pvmSum;

  const denominator = Math.abs(input.reportedGrowthPct);
  const acquisitionShareOfReportedGrowthPct = denominator > 0 ? (Math.abs(acquisition) / denominator) * 100 : null;
  const materialAcquisition = Math.abs(acquisition) >= 2 && (denominator === 0 || Math.abs(acquisition) >= denominator * 0.25);

  let state: OrganicGrowthState = 'PARTIAL';
  if (materialAcquisition) {
    state = 'M_AND_A_MATERIAL';
    reasons.push('Acquisition contribution is economically material to reported growth; reported growth must not be presented as organic growth.');
  } else if (pvmAvailable && Math.abs(priceVolumeMixResidualPctPoints ?? 0) <= 1) {
    state = 'RECONCILED';
  }

  if (!pvmAvailable) reasons.push('Price/volume/usage/mix bridge is incomplete; organic growth is derived but not fully causally decomposed.');
  if (Math.abs(priceVolumeMixResidualPctPoints ?? 0) > 1) reasons.push('Price/volume/mix components do not fully reconcile organic growth; retain a visible residual.');

  return { state, organicGrowthPct, priceVolumeMixResidualPctPoints, acquisitionShareOfReportedGrowthPct, reasons };
}

/**
 * CROSS-LAYER PRICE / MARGIN PASS-THROUGH Ω
 *
 * Implementation thresholds are configurable defaults, not immutable canon.
 */
export interface PriceMarginPassThroughInput {
  evidenceTraceable: boolean;
  evidenceIds: string[];
  inputCostChangePct: number;
  realizedPriceChangePct: number;
  volumeChangePct: number;
  grossMarginChangeBps: number;
  grossProfitGrowthPct: number;
  pricingGapThresholdPctPoints?: number;
  marginToleranceBps?: number;
  volumeStressThresholdPct?: number;
}

export type PriceMarginPassThroughState =
  | 'PRICING_POWER'
  | 'NEUTRAL_PASS_THROUGH'
  | 'ABSORPTION'
  | 'DEMAND_DESTRUCTION'
  | 'MIXED'
  | 'EVIDENCE_PENDING';

export interface PriceMarginPassThroughResult {
  state: PriceMarginPassThroughState;
  priceMinusCostPctPoints: number | null;
  economicCaptureConfirmed: boolean;
  reasons: string[];
}

export function evaluatePriceMarginPassThrough(input: PriceMarginPassThroughInput): PriceMarginPassThroughResult {
  const values = [input.inputCostChangePct, input.realizedPriceChangePct, input.volumeChangePct, input.grossMarginChangeBps, input.grossProfitGrowthPct];
  if (!evidencePasses(input.evidenceTraceable, input.evidenceIds) || !values.every(Number.isFinite)) {
    return { state: 'EVIDENCE_PENDING', priceMinusCostPctPoints: null, economicCaptureConfirmed: false, reasons: ['Pass-through requires traceable price, cost, volume, margin and gross-profit evidence.'] };
  }

  const pricingGap = input.pricingGapThresholdPctPoints ?? 1.5;
  const marginTolerance = input.marginToleranceBps ?? 100;
  const volumeStress = input.volumeStressThresholdPct ?? -5;
  const priceMinusCostPctPoints = input.realizedPriceChangePct - input.inputCostChangePct;
  const reasons: string[] = [];

  let state: PriceMarginPassThroughState = 'MIXED';
  if (
    priceMinusCostPctPoints > pricingGap &&
    input.grossMarginChangeBps >= 0 &&
    input.volumeChangePct > volumeStress &&
    input.grossProfitGrowthPct > 0
  ) {
    state = 'PRICING_POWER';
    reasons.push('Realized pricing exceeds input-cost inflation while margin, volume and gross-profit conversion remain intact.');
  } else if (
    Math.abs(priceMinusCostPctPoints) <= pricingGap &&
    Math.abs(input.grossMarginChangeBps) <= marginTolerance &&
    input.volumeChangePct > volumeStress
  ) {
    state = 'NEUTRAL_PASS_THROUGH';
    reasons.push('Pricing broadly offsets input-cost inflation without material volume or margin damage.');
  } else if (priceMinusCostPctPoints < -pricingGap && input.grossMarginChangeBps < -marginTolerance) {
    state = 'ABSORPTION';
    reasons.push('Input-cost inflation is not fully recovered in realized price and gross margin is deteriorating.');
  } else if (
    priceMinusCostPctPoints > pricingGap &&
    input.volumeChangePct <= volumeStress &&
    (input.grossProfitGrowthPct <= 0 || input.grossMarginChangeBps < 0)
  ) {
    state = 'DEMAND_DESTRUCTION';
    reasons.push('Price increases exceed cost inflation but coincide with material volume stress and weak economic capture.');
  }

  if (state === 'MIXED') reasons.push('Price, cost, volume and margin signals do not support a clean pass-through classification.');
  const economicCaptureConfirmed = state === 'PRICING_POWER' || (state === 'NEUTRAL_PASS_THROUGH' && input.grossProfitGrowthPct > 0);
  return { state, priceMinusCostPctPoints, economicCaptureConfirmed, reasons };
}

export const ECONOMIC_EVIDENCE_TRANSLATION_LAWS = [
  'CONTRACT_CEILING != BACKLOG != REVENUE != FCF',
  'MILESTONE_VALUE != CONTRACTED_REVENUE',
  'REPORTED_GROWTH != ORGANIC_GROWTH',
  'PRICE_INCREASE != PRICING_POWER unless volume, gross margin and gross profit confirm',
  'CUSTOMER_ACCEPTANCE != REVENUE',
  'REVENUE_GROWTH != OWNER_ECONOMICS',
] as const;
