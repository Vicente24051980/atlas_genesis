export type FabricStandard = 'NVLINK_FUSION' | 'UALINK' | 'UEC' | 'PROPRIETARY_OTHER' | 'UNKNOWN';

export interface ComputeDisplacementCaptureInput {
  ticker: string;
  verifiedEvidence: boolean;
  displacedComputeEconomics: number;
  fabricEconomicsCaptured: number;
  networkingEconomicsCaptured: number;
  cpuEconomicsCaptured: number;
  memoryEconomicsCaptured: number;
  packagingRackEconomicsCaptured: number;
  customAcceleratorAttachRatePct?: number;
  openFabricMigrationPct?: number;
  dominantFabric?: FabricStandard;
}

export interface ComputeDisplacementCaptureOutput {
  ticker: string;
  cdcr: number | null;
  lostDieRecovery: number | null;
  fabricAttachRatePct: number | null;
  openFabricMigrationPct: number | null;
  state: 'UNVERIFIED' | 'VALUE_LEAKAGE' | 'PARTIAL_RECOVERY' | 'FULL_RECOVERY' | 'NET_VALUE_CAPTURE';
  constraints: string[];
}

/**
 * Compute Displacement Capture Ratio Ω
 *
 * Measures whether economics captured around a custom XPU compensate for
 * economics lost when the incumbent compute die is displaced.
 *
 * CDCR > 1 means surrounding economics exceed displaced compute economics.
 * This is an economic-proof metric, never a price/momentum signal.
 */
export function evaluateComputeDisplacementCapture(input: ComputeDisplacementCaptureInput): ComputeDisplacementCaptureOutput {
  const constraints = [
    'SHIPMENTS_ROYALTIES_AND_MARGINS_REQUIRE_VERIFIED_EVIDENCE',
    'ANNOUNCED_PARTNERSHIP_IS_NOT_ECONOMIC_CAPTURE',
    'WARRANT_OR_INVESTMENT_IS_NOT_A_PURCHASE_COMMITMENT',
    'FABRIC_ADOPTION_IS_NOT_MARGIN_PROOF',
    'STOCK_PRICE_RESPONSE_IS_NOT_VALUE_CAPTURE'
  ];

  if (!input.verifiedEvidence || input.displacedComputeEconomics <= 0) {
    return {
      ticker: input.ticker,
      cdcr: null,
      lostDieRecovery: null,
      fabricAttachRatePct: input.customAcceleratorAttachRatePct ?? null,
      openFabricMigrationPct: input.openFabricMigrationPct ?? null,
      state: 'UNVERIFIED',
      constraints
    };
  }

  const recovered =
    input.fabricEconomicsCaptured +
    input.networkingEconomicsCaptured +
    input.cpuEconomicsCaptured +
    input.memoryEconomicsCaptured +
    input.packagingRackEconomicsCaptured;

  const cdcr = recovered / input.displacedComputeEconomics;
  const lostDieRecovery = Math.min(recovered / input.displacedComputeEconomics, 1);

  const state: ComputeDisplacementCaptureOutput['state'] =
    cdcr > 1 ? 'NET_VALUE_CAPTURE' :
    cdcr >= 1 ? 'FULL_RECOVERY' :
    cdcr > 0 ? 'PARTIAL_RECOVERY' :
    'VALUE_LEAKAGE';

  return {
    ticker: input.ticker,
    cdcr,
    lostDieRecovery,
    fabricAttachRatePct: input.customAcceleratorAttachRatePct ?? null,
    openFabricMigrationPct: input.openFabricMigrationPct ?? null,
    state,
    constraints
  };
}
