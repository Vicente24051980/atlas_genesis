export type ValuationArchetype =
  | 'BANK'
  | 'INSURER'
  | 'ENERGY_MLP'
  | 'SAAS_SOFTWARE'
  | 'CONSUMER'
  | 'HOMEBUILDER'
  | 'HEALTHCARE'
  | 'INDUSTRIAL_TECH'
  | 'GENERIC_OPERATING'
  | 'PRE_PROOF';

export type ValuationMethodStatus =
  | 'PASS'
  | 'PASS_WITH_NORMALIZATION'
  | 'PRE_PROOF_ONLY'
  | 'FAIL_PRICE_INTEGRITY';

export type ExternalValuationRelation =
  | 'NOT_AVAILABLE'
  | 'DIRECTIONALLY_AGREES'
  | 'DIVERGES'
  | 'MATERIAL_DIVERGENCE';

export interface ExternalValuationObservation {
  source: string;
  asOf: string;
  fairValueGapPct: number;
  uncertainty?: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
  evidenceId?: string;
}

export interface ValuationMethodIntegrityInput {
  ticker: string;
  archetype: ValuationArchetype;
  priceIntegrityPass: boolean;
  meaningfulRevenue: boolean;
  recurringOperatingLosses?: boolean;

  // Earnings-quality diagnostics. If a one-off materially changes earnings,
  // trailing multiples must be normalized before Expected Return uses them.
  oneOffShareOfPretaxIncomePct?: number | null;

  // Raw ROIC can become mechanically meaningless when invested capital is
  // tiny/negative. Keep that state explicit instead of rewarding the number.
  reportedRoicPct?: number | null;
  investedCapitalPositive?: boolean | null;

  // Detect capital-intensity regime shifts before extrapolating historical FCF.
  capexToRevenuePct?: number | null;
  capexToRevenueThreeYearMedianPct?: number | null;

  // Internal ATLAS valuation gap versus the verified current price.
  atlasFairValueGapPct?: number | null;

  // Secondary diagnostic only. It never contributes points directly.
  externalValuations?: readonly ExternalValuationObservation[];
}

export interface ValuationMethodIntegrityResult {
  ticker: string;
  status: ValuationMethodStatus;
  archetype: ValuationArchetype;
  allowedPrimaryMethods: readonly string[];
  forbiddenMethods: readonly string[];
  normalizationFlags: readonly string[];
  externalCrossCheck: {
    directScoreWeight: 0;
    relation: ExternalValuationRelation;
    meanExternalGapPct: number | null;
    atlasFairValueGapPct: number | null;
    auditPriority: 'NORMAL' | 'HIGH';
  };
  expectedReturnEligible: boolean;
  reasons: readonly string[];
}

const METHOD_MAP: Readonly<Record<ValuationArchetype, readonly string[]>> = {
  BANK: ['P_TBV', 'ROTCE_VS_COST_OF_EQUITY', 'CET1', 'CREDIT_NORMALIZATION', 'NII_SENSITIVITY'],
  INSURER: ['P_BV', 'BVPS_CAGR', 'COMBINED_RATIO', 'PREMIUM_GROWTH', 'INVESTMENT_INCOME'],
  ENERGY_MLP: ['MID_CYCLE_FCF', 'EV_EBITDA', 'NAV', 'LEVERAGE', 'DISTRIBUTION_COVERAGE', 'RESERVE_OR_CONTRACT_DURATION'],
  SAAS_SOFTWARE: ['EV_FCF', 'FCF_PER_SHARE', 'ARR_OR_REVENUE_GROWTH', 'RPO_NRR', 'SBC_DILUTION'],
  CONSUMER: ['NORMALIZED_PE', 'EV_FCF', 'FCF_PER_SHARE', 'COMPARABLE_SALES', 'GROSS_MARGIN', 'INVENTORY'],
  HOMEBUILDER: ['NORMALIZED_PE', 'P_BV', 'ORDERS_CANCELLATIONS', 'GROSS_MARGIN', 'LAND_INVENTORY', 'RETURNS_ON_CAPITAL'],
  HEALTHCARE: ['NORMALIZED_PE', 'EV_FCF', 'FCF_PER_SHARE', 'ORGANIC_GROWTH', 'MARGIN_NORMALIZATION'],
  INDUSTRIAL_TECH: ['NORMALIZED_PE', 'EV_FCF', 'FCF_PER_SHARE', 'BACKLOG_CONVERSION', 'MARGIN_NORMALIZATION'],
  GENERIC_OPERATING: ['DCF', 'EV_FCF', 'EV_EBIT', 'NORMALIZED_PE', 'FCF_PER_SHARE'],
  PRE_PROOF: ['OPTIONALITY_SCENARIO_ONLY'],
};

const FORBIDDEN_MAP: Readonly<Record<ValuationArchetype, readonly string[]>> = {
  BANK: ['GENERIC_DCF', 'GENERIC_FCF_YIELD'],
  INSURER: ['GENERIC_FCF_YIELD'],
  ENERGY_MLP: ['SPOT_COMMODITY_PE_AS_BASE_CASE'],
  SAAS_SOFTWARE: ['FCF_WITHOUT_SBC_OR_DILUTION_CHECK'],
  CONSUMER: ['TRAILING_PE_WITHOUT_CYCLE_NORMALIZATION'],
  HOMEBUILDER: ['TRAILING_PE_WITHOUT_HOUSING_CYCLE_NORMALIZATION'],
  HEALTHCARE: [],
  INDUSTRIAL_TECH: [],
  GENERIC_OPERATING: [],
  PRE_PROOF: ['DCF', 'PE', 'EV_FCF', 'INTRINSIC_VALUE_SCORE'],
};

function finite(value: number | null | undefined): value is number {
  return value != null && Number.isFinite(value);
}

function mean(values: number[]): number | null {
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function relationBetween(
  atlasGap: number | null,
  externalGap: number | null,
): ExternalValuationRelation {
  if (atlasGap == null || externalGap == null) return 'NOT_AVAILABLE';
  const sameDirection = Math.sign(atlasGap) === Math.sign(externalGap) || atlasGap === 0 || externalGap === 0;
  const spread = Math.abs(atlasGap - externalGap);
  if (sameDirection) return spread >= 20 ? 'DIVERGES' : 'DIRECTIONALLY_AGREES';
  return spread >= 20 ? 'MATERIAL_DIVERGENCE' : 'DIVERGES';
}

/**
 * Valuation Method Integrity Ω
 *
 * Structural calibration from cross-provider valuation audits:
 * - external fair value is diagnostic and has ZERO direct score weight;
 * - valuation method must match the business archetype;
 * - price/listing/currency/unit integrity is a hard prerequisite;
 * - pre-proof companies cannot receive an intrinsic-value score;
 * - material one-offs, pathological ROIC and capex-regime shifts force normalization;
 * - Expected Return remains an ATLAS output, never a vendor fair-value label.
 */
export function evaluateValuationMethodIntegrity(
  input: ValuationMethodIntegrityInput,
): ValuationMethodIntegrityResult {
  const reasons: string[] = [];
  const normalizationFlags: string[] = [];

  if (!input.priceIntegrityPass) {
    return {
      ticker: input.ticker,
      status: 'FAIL_PRICE_INTEGRITY',
      archetype: input.archetype,
      allowedPrimaryMethods: METHOD_MAP[input.archetype],
      forbiddenMethods: FORBIDDEN_MAP[input.archetype],
      normalizationFlags: ['PRICE_LISTING_CURRENCY_UNIT_NOT_VERIFIED'],
      externalCrossCheck: {
        directScoreWeight: 0,
        relation: 'NOT_AVAILABLE',
        meanExternalGapPct: null,
        atlasFairValueGapPct: finite(input.atlasFairValueGapPct) ? input.atlasFairValueGapPct : null,
        auditPriority: 'HIGH',
      },
      expectedReturnEligible: false,
      reasons: ['Verified price, primary listing, currency and quotation unit are mandatory before valuation.'],
    };
  }

  const preProof = input.archetype === 'PRE_PROOF' || !input.meaningfulRevenue;
  if (preProof) {
    reasons.push('Meaningful economic proof is absent; intrinsic-value scoring is disabled and only explicit optionality scenarios are allowed.');
  }

  if (finite(input.oneOffShareOfPretaxIncomePct) && Math.abs(input.oneOffShareOfPretaxIncomePct) >= 10) {
    normalizationFlags.push('MATERIAL_ONE_OFF_EARNINGS_NORMALIZATION_REQUIRED');
    reasons.push('A material one-off changes reported earnings; trailing P/E or ROIC cannot enter Expected Return unadjusted.');
  }

  if (
    (finite(input.reportedRoicPct) && Math.abs(input.reportedRoicPct) > 100) ||
    input.investedCapitalPositive === false
  ) {
    normalizationFlags.push('ROIC_NON_COMPARABLE');
    reasons.push('Raw ROIC is mechanically non-comparable because the reported return is extreme or invested capital is non-positive.');
  }

  if (
    finite(input.capexToRevenuePct) &&
    finite(input.capexToRevenueThreeYearMedianPct) &&
    input.capexToRevenueThreeYearMedianPct > 0 &&
    input.capexToRevenuePct >= 1.5 * input.capexToRevenueThreeYearMedianPct
  ) {
    normalizationFlags.push('CASH_CONVERSION_REGIME_SHIFT');
    reasons.push('Capital intensity is at least 1.5x its three-year median; historical FCF conversion must not be extrapolated mechanically.');
  }

  const validExternal = (input.externalValuations ?? [])
    .filter((observation) => finite(observation.fairValueGapPct));
  const meanExternalGapPct = mean(validExternal.map((observation) => observation.fairValueGapPct));
  const atlasGap = finite(input.atlasFairValueGapPct) ? input.atlasFairValueGapPct : null;
  const relation = relationBetween(atlasGap, meanExternalGapPct);
  const highUncertainty = validExternal.some((observation) => observation.uncertainty === 'HIGH');
  const auditPriority: 'NORMAL' | 'HIGH' =
    relation === 'MATERIAL_DIVERGENCE' || relation === 'DIVERGES' || highUncertainty ? 'HIGH' : 'NORMAL';

  if (validExternal.length) {
    reasons.push('External fair-value observations are retained as diagnostic cross-checks with zero direct score weight.');
  }
  if (relation === 'DIVERGES' || relation === 'MATERIAL_DIVERGENCE') {
    reasons.push('External and ATLAS valuation assumptions diverge; growth, margins, cash conversion, dilution and terminal multiple require explicit review.');
  }

  const status: ValuationMethodStatus = preProof
    ? 'PRE_PROOF_ONLY'
    : normalizationFlags.length
      ? 'PASS_WITH_NORMALIZATION'
      : 'PASS';

  return {
    ticker: input.ticker,
    status,
    archetype: preProof ? 'PRE_PROOF' : input.archetype,
    allowedPrimaryMethods: METHOD_MAP[preProof ? 'PRE_PROOF' : input.archetype],
    forbiddenMethods: FORBIDDEN_MAP[preProof ? 'PRE_PROOF' : input.archetype],
    normalizationFlags,
    externalCrossCheck: {
      directScoreWeight: 0,
      relation,
      meanExternalGapPct,
      atlasFairValueGapPct: atlasGap,
      auditPriority,
    },
    expectedReturnEligible: !preProof,
    reasons,
  };
}
