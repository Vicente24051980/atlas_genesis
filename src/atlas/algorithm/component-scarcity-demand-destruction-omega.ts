export const COMPONENT_SCARCITY_DEMAND_DESTRUCTION_OMEGA_VERSION = '2026-08-26-v1.0.0' as const;

export type ComponentScarcityState =
  | 'BENIGN_PASS_THROUGH'
  | 'UPSTREAM_CAPTURE'
  | 'CROWDING_OUT'
  | 'DOWNSTREAM_DEMAND_DESTRUCTION'
  | 'MIXED'
  | 'EVIDENCE_PENDING';

export interface ComponentScarcityInput {
  evidenceTraceable: boolean;
  evidenceIds: string[];
  componentCostChangePct: number;
  endProductPriceChangePct: number;
  endMarketVolumeChangePct: number;
  supplierGrossProfitGrowthPct?: number;
  oemGrossProfitGrowthPct?: number;
  supplierFcfGrowthPct?: number;
  oemFcfGrowthPct?: number;
  capacityReallocatedToAi?: boolean;
  scarcityConfirmed?: boolean;
  volumeStressThresholdPct?: number;
  materialCostThresholdPct?: number;
}

export interface ComponentScarcityResult {
  state: ComponentScarcityState;
  consumerPricePassThroughPctPoints: number | null;
  upstreamCaptureConfirmed: boolean;
  downstreamEconomicsConfirmed: boolean;
  aiCapacityCrowdingOut: boolean;
  reasons: string[];
}

function finite(value: number | undefined): value is number {
  return value != null && Number.isFinite(value);
}

function evidencePasses(traceable: boolean, ids: string[]): boolean {
  return traceable && ids.filter((id) => id.trim().length > 0).length >= 2;
}

/**
 * COMPONENT SCARCITY / END-MARKET DEMAND DESTRUCTION Ω
 *
 * Extends Cross-Layer Price / Margin Pass-Through Ω across end markets.
 * It detects when AI-driven component scarcity is passed into consumer ASPs,
 * crowds out non-AI capacity, and/or destroys downstream unit demand.
 *
 * Canonical chain:
 * AI demand -> component capacity scarcity -> component cost -> OEM ASP -> units
 * -> gross profit -> FCF.
 */
export function evaluateComponentScarcity(input: ComponentScarcityInput): ComponentScarcityResult {
  const required = [input.componentCostChangePct, input.endProductPriceChangePct, input.endMarketVolumeChangePct];
  if (!evidencePasses(input.evidenceTraceable, input.evidenceIds) || !required.every(Number.isFinite)) {
    return {
      state: 'EVIDENCE_PENDING', consumerPricePassThroughPctPoints: null,
      upstreamCaptureConfirmed: false, downstreamEconomicsConfirmed: false,
      aiCapacityCrowdingOut: false,
      reasons: ['Scarcity analysis requires at least two traceable records plus component cost, end-product price and end-market volume evidence.'],
    };
  }

  const volumeStress = input.volumeStressThresholdPct ?? -5;
  const materialCost = input.materialCostThresholdPct ?? 3;
  const consumerPricePassThroughPctPoints = input.endProductPriceChangePct - input.componentCostChangePct;
  const upstreamCaptureConfirmed = finite(input.supplierGrossProfitGrowthPct) && input.supplierGrossProfitGrowthPct > 0 &&
    (!finite(input.supplierFcfGrowthPct) || input.supplierFcfGrowthPct >= 0);
  const downstreamEconomicsConfirmed = finite(input.oemGrossProfitGrowthPct) && input.oemGrossProfitGrowthPct > 0 &&
    (!finite(input.oemFcfGrowthPct) || input.oemFcfGrowthPct >= 0);
  const aiCapacityCrowdingOut = input.capacityReallocatedToAi === true && input.scarcityConfirmed === true;
  const reasons: string[] = [];

  let state: ComponentScarcityState = 'MIXED';
  if (input.endMarketVolumeChangePct <= volumeStress && input.endProductPriceChangePct > 0 && input.componentCostChangePct >= materialCost) {
    state = 'DOWNSTREAM_DEMAND_DESTRUCTION';
    reasons.push('Component inflation is being passed into end-product pricing while end-market unit demand is under material stress.');
  } else if (aiCapacityCrowdingOut && input.componentCostChangePct >= materialCost) {
    state = 'CROWDING_OUT';
    reasons.push('Traceable evidence indicates AI demand is reallocating constrained component capacity away from another end market.');
  } else if (upstreamCaptureConfirmed && input.componentCostChangePct >= materialCost) {
    state = 'UPSTREAM_CAPTURE';
    reasons.push('Scarcity is translating into supplier gross-profit/cash capture rather than only nominal component inflation.');
  } else if (input.endMarketVolumeChangePct > volumeStress && downstreamEconomicsConfirmed) {
    state = 'BENIGN_PASS_THROUGH';
    reasons.push('Downstream pricing and owner economics remain intact without material unit-demand destruction.');
  } else {
    reasons.push('Evidence is mixed: do not promote scarcity or higher ASP into Economic Proof without gross-profit and FCF confirmation.');
  }

  if (aiCapacityCrowdingOut) reasons.push('AI CAPEX is competing for physical component capacity, not only financial capital.');
  if (!upstreamCaptureConfirmed) reasons.push('Upstream beneficiary status remains unconfirmed until supplier gross profit/FCF validate economic capture.');
  if (!downstreamEconomicsConfirmed) reasons.push('Higher consumer ASP is not downstream pricing power until gross profit/FCF and units confirm.');

  return { state, consumerPricePassThroughPctPoints, upstreamCaptureConfirmed, downstreamEconomicsConfirmed, aiCapacityCrowdingOut, reasons };
}

export const COMPONENT_SCARCITY_LAWS = [
  'COMPONENT_SCARCITY != SUPPLIER_ECONOMIC_CAPTURE',
  'HIGHER_DEVICE_ASP != OEM_PRICING_POWER',
  'AI_CAPEX_COMPETES_FOR_PHYSICAL_CAPACITY_AS_WELL_AS_FINANCIAL_CAPITAL',
  'MEMORY_PRICE_INFLATION_CAN_BENEFIT_SUPPLIERS_AND_DESTROY_DOWNSTREAM_UNITS_SIMULTANEOUSLY',
  'FORECAST != REALIZED_ECONOMIC_PROOF',
] as const;
