import { scoreMultipleExpansionDebt } from './capex-asymmetry-omega';

export type PointZeroMode =
  | 'P0_IPO'
  | 'P0_RESET'
  | 'P0_SPIN'
  | 'P0_EARLY_PUBLIC'
  | 'MATURE';

export type AtlasMarketCapBucket =
  | 'XS_LT_2B'
  | 'S_2_10B'
  | 'M_10_50B'
  | 'L_50_200B'
  | 'XL_GE_200B';

export type BreadthRotationState =
  | 'BROADENING_CONFIRMED'
  | 'BROADENING'
  | 'MIXED'
  | 'NARROWING';

export type BreadthRotationInput = {
  smallMidForwardEpsGrowthPct: number;
  largeMegaForwardEpsGrowthPct: number;
  smallMidForwardPe: number;
  largeMegaForwardPe: number;
  smallMidRelativeStrength6mPp: number;
  positiveRevisionBreadthPct: number;
};

export type BreadthRotationResult = {
  epsGrowthSpreadPp: number;
  valuationDiscountPct: number;
  epsGrowthSpreadScore: number;
  valuationDiscountScore: number;
  relativeStrengthScore: number;
  revisionBreadthScore: number;
  breadthRotationScore: number;
  state: BreadthRotationState;
};

export type UniversalP0State =
  | 'P0_ELITE'
  | 'P0_STRONG'
  | 'P1_EARLY'
  | 'WATCH'
  | 'VALUE_TRAP_RISK'
  | 'FUNDING_RISK'
  | 'ILLIQUID_RISK'
  | 'NO_EDGE'
  | 'EVIDENCE_PENDING';

export type UniversalP0Action =
  | 'ADVANCE_DEEP_RESEARCH'
  | 'WATCH'
  | 'NO_CHASE'
  | 'REJECT_FOR_NOW'
  | 'EVIDENCE_REQUIRED';

export type UniversalPointZeroInput = {
  ticker: string;
  pointZeroMode: PointZeroMode;
  marketCapUsd: number;
  evidenceTraceable: boolean;
  evidenceIds: readonly string[];

  // Fundamental inflection, all 0-100.
  revenueAccelerationScore: number;
  epsFcfAccelerationScore: number;
  marginInflectionScore: number;
  perShareEconomicQualityScore: number;

  // Valuation and expectations.
  absoluteValuationScore: number;
  priceCagr3yPct: number;
  fundamentalPerShareCagr3yPct: number;
  startValuationMultiple?: number;
  currentValuationMultiple?: number;

  // Quality of the opportunity, all 0-100.
  capitalEfficiencyScore: number;
  balanceSheetQualityScore: number;
  catalystDurabilityScore: number;
  earningsRevisionScore: number;
  breadthRegimeScore: number;
  relativeMomentumScore: number;
  liquidityQualityScore: number;

  // Risk scores, 0 = no risk, 100 = maximum risk.
  drawdownRiskScore: number;
  valueTrapRiskScore: number;
  dilutionRiskScore: number;
};

export type UniversalPointZeroResult = {
  ticker: string;
  pointZeroMode: PointZeroMode;
  marketCapBucket: AtlasMarketCapBucket;
  sizeBiasContribution: 0;
  evidenceGate: 'CONFIRMED' | 'PROVISIONAL' | 'BLOCKED';
  fundamentalInflectionScore: number;
  excessReratingPp: number;
  excessReratingDebtScore: number;
  multipleExpansionDebtScore: number | null;
  expectationsDebtScore: number;
  valuationOpportunityScore: number;
  coreOpportunityScore: number;
  riskPenaltyScore: number;
  sizeBlindP0Score: number;
  state: UniversalP0State;
  action: UniversalP0Action;
  discoveryTag: 'SMALL_MID_SPRINTER' | 'SIZE_BLIND_P0' | 'NONE';
  reasons: string[];
  falsifiers: string[];
};

const clamp = (x: number): number => Math.max(0, Math.min(100, x));
const round1 = (x: number): number => Math.round(x * 10) / 10;
const round2 = (x: number): number => Math.round(x * 100) / 100;

function requireFinite(name: string, x: number): void {
  if (!Number.isFinite(x)) throw new Error(`${name}_must_be_finite`);
}

function requireScore(name: string, x: number): void {
  if (!Number.isFinite(x) || x < 0 || x > 100) {
    throw new Error(`${name}_must_be_between_0_and_100`);
  }
}

function linearScore(x: number, low: number, high: number): number {
  if (!Number.isFinite(x) || !Number.isFinite(low) || !Number.isFinite(high) || high <= low) {
    throw new Error('linear_score_invalid_input');
  }
  return round1(clamp(((x - low) / (high - low)) * 100));
}

export function classifyAtlasMarketCap(marketCapUsd: number): AtlasMarketCapBucket {
  if (!Number.isFinite(marketCapUsd) || marketCapUsd <= 0) {
    throw new Error('market_cap_must_be_positive_finite');
  }
  if (marketCapUsd < 2_000_000_000) return 'XS_LT_2B';
  if (marketCapUsd < 10_000_000_000) return 'S_2_10B';
  if (marketCapUsd < 50_000_000_000) return 'M_10_50B';
  if (marketCapUsd < 200_000_000_000) return 'L_50_200B';
  return 'XL_GE_200B';
}

export function evaluateBreadthRotation(input: BreadthRotationInput): BreadthRotationResult {
  const finiteValues = [
    input.smallMidForwardEpsGrowthPct,
    input.largeMegaForwardEpsGrowthPct,
    input.smallMidForwardPe,
    input.largeMegaForwardPe,
    input.smallMidRelativeStrength6mPp,
    input.positiveRevisionBreadthPct,
  ];
  if (finiteValues.some((x) => !Number.isFinite(x))) {
    throw new Error('breadth_rotation_requires_finite_values');
  }
  if (input.smallMidForwardPe <= 0 || input.largeMegaForwardPe <= 0) {
    throw new Error('breadth_rotation_pe_must_be_positive');
  }
  requireScore('positive_revision_breadth_pct', input.positiveRevisionBreadthPct);

  const epsGrowthSpreadPp = round2(
    input.smallMidForwardEpsGrowthPct - input.largeMegaForwardEpsGrowthPct,
  );
  const valuationDiscountPct = round2(
    ((input.largeMegaForwardPe - input.smallMidForwardPe) / input.largeMegaForwardPe) * 100,
  );

  // Calibration windows are intentionally broad. They are regime transforms,
  // not forecasts: -10pp to +30pp EPS-growth spread, 0-35% valuation discount,
  // and -10pp to +20pp 6m relative strength map to 0-100.
  const epsGrowthSpreadScore = linearScore(epsGrowthSpreadPp, -10, 30);
  const valuationDiscountScore = linearScore(valuationDiscountPct, 0, 35);
  const relativeStrengthScore = linearScore(input.smallMidRelativeStrength6mPp, -10, 20);
  const revisionBreadthScore = round1(input.positiveRevisionBreadthPct);

  const breadthRotationScore = round1(
    epsGrowthSpreadScore * 0.35 +
      valuationDiscountScore * 0.25 +
      relativeStrengthScore * 0.20 +
      revisionBreadthScore * 0.20,
  );

  const state: BreadthRotationState =
    breadthRotationScore >= 75
      ? 'BROADENING_CONFIRMED'
      : breadthRotationScore >= 60
        ? 'BROADENING'
        : breadthRotationScore >= 40
          ? 'MIXED'
          : 'NARROWING';

  return {
    epsGrowthSpreadPp,
    valuationDiscountPct,
    epsGrowthSpreadScore,
    valuationDiscountScore,
    relativeStrengthScore,
    revisionBreadthScore,
    breadthRotationScore,
    state,
  };
}

function scoreExcessReratingDebt(priceCagr3yPct: number, fundamentalPerShareCagr3yPct: number): {
  excessReratingPp: number;
  excessReratingDebtScore: number;
} {
  requireFinite('price_cagr_3y_pct', priceCagr3yPct);
  requireFinite('fundamental_per_share_cagr_3y_pct', fundamentalPerShareCagr3yPct);

  const excessReratingPp = round2(priceCagr3yPct - fundamentalPerShareCagr3yPct);
  const excessReratingDebtScore = round1(
    clamp((Math.max(0, excessReratingPp) / 40) * 100),
  );
  return { excessReratingPp, excessReratingDebtScore };
}

function validateUniversalP0(input: UniversalPointZeroInput): void {
  classifyAtlasMarketCap(input.marketCapUsd);

  const scoreFields: Array<[string, number]> = [
    ['revenue_acceleration_score', input.revenueAccelerationScore],
    ['eps_fcf_acceleration_score', input.epsFcfAccelerationScore],
    ['margin_inflection_score', input.marginInflectionScore],
    ['per_share_economic_quality_score', input.perShareEconomicQualityScore],
    ['absolute_valuation_score', input.absoluteValuationScore],
    ['capital_efficiency_score', input.capitalEfficiencyScore],
    ['balance_sheet_quality_score', input.balanceSheetQualityScore],
    ['catalyst_durability_score', input.catalystDurabilityScore],
    ['earnings_revision_score', input.earningsRevisionScore],
    ['breadth_regime_score', input.breadthRegimeScore],
    ['relative_momentum_score', input.relativeMomentumScore],
    ['liquidity_quality_score', input.liquidityQualityScore],
    ['drawdown_risk_score', input.drawdownRiskScore],
    ['value_trap_risk_score', input.valueTrapRiskScore],
    ['dilution_risk_score', input.dilutionRiskScore],
  ];
  scoreFields.forEach(([name, score]) => requireScore(name, score));

  requireFinite('price_cagr_3y_pct', input.priceCagr3yPct);
  requireFinite('fundamental_per_share_cagr_3y_pct', input.fundamentalPerShareCagr3yPct);
}

export function evaluateUniversalPointZero(input: UniversalPointZeroInput): UniversalPointZeroResult {
  validateUniversalP0(input);

  const marketCapBucket = classifyAtlasMarketCap(input.marketCapUsd);
  const fundamentalInflectionScore = round1(
    input.revenueAccelerationScore * 0.25 +
      input.epsFcfAccelerationScore * 0.35 +
      input.marginInflectionScore * 0.20 +
      input.perShareEconomicQualityScore * 0.20,
  );

  const { excessReratingPp, excessReratingDebtScore } = scoreExcessReratingDebt(
    input.priceCagr3yPct,
    input.fundamentalPerShareCagr3yPct,
  );
  const multipleExpansionDebtScore = scoreMultipleExpansionDebt(
    input.startValuationMultiple,
    input.currentValuationMultiple,
  );
  const expectationsDebtScore = round1(
    multipleExpansionDebtScore == null
      ? excessReratingDebtScore
      : excessReratingDebtScore * 0.65 + multipleExpansionDebtScore * 0.35,
  );

  // Absolute valuation and expectations debt are distinct. A low multiple can be
  // a trap; a high multiple can still be justified when per-share economics catch up.
  const valuationOpportunityScore = round1(
    (100 - expectationsDebtScore) * 0.60 + input.absoluteValuationScore * 0.40,
  );

  // Market cap contributes exactly zero. Breadth contributes only 5%, so a broad
  // small/mid-cap rally cannot rescue weak company-level economics.
  const coreOpportunityScore = round1(
    fundamentalInflectionScore * 0.30 +
      valuationOpportunityScore * 0.20 +
      input.capitalEfficiencyScore * 0.12 +
      input.balanceSheetQualityScore * 0.10 +
      input.catalystDurabilityScore * 0.08 +
      input.earningsRevisionScore * 0.07 +
      input.breadthRegimeScore * 0.05 +
      input.relativeMomentumScore * 0.03 +
      input.liquidityQualityScore * 0.05,
  );

  const riskPenaltyScore = round1(
    input.valueTrapRiskScore * 0.12 +
      input.drawdownRiskScore * 0.08 +
      input.dilutionRiskScore * 0.08,
  );

  let sizeBlindP0Score = round1(clamp(coreOpportunityScore - riskPenaltyScore));

  // Fail-closed caps. These prevent cheap/distressed names from gaming the model.
  if (input.valueTrapRiskScore >= 80) sizeBlindP0Score = Math.min(sizeBlindP0Score, 64.9);
  if (input.balanceSheetQualityScore < 30) sizeBlindP0Score = Math.min(sizeBlindP0Score, 59.9);
  if (input.liquidityQualityScore < 25) sizeBlindP0Score = Math.min(sizeBlindP0Score, 59.9);
  if (input.dilutionRiskScore >= 80) sizeBlindP0Score = Math.min(sizeBlindP0Score, 69.9);
  if (expectationsDebtScore >= 85) sizeBlindP0Score = Math.min(sizeBlindP0Score, 69.9);
  sizeBlindP0Score = round1(sizeBlindP0Score);

  const evidenceGate: UniversalPointZeroResult['evidenceGate'] =
    input.evidenceTraceable && input.evidenceIds.length >= 4
      ? 'CONFIRMED'
      : input.evidenceTraceable && input.evidenceIds.length > 0
        ? 'PROVISIONAL'
        : 'BLOCKED';

  const reasons: string[] = [];
  const falsifiers = [
    'fundamental_acceleration_reverses_before_estimates_or_cash_flow_confirm',
    'eps_or_fcf_growth_is_non_recurring_or_accounting_driven',
    'revenue_growth_does_not_translate_to_per_share_economics',
    'valuation_discount_is_explained_by_structural_business_deterioration',
    'balance_sheet_or_refinancing_risk_breaks_the_thesis',
    'dilution_offsets_operating_growth',
    'catalyst_is_one_off_or_mean_reverting',
    'breadth_rotation_reverses_while_company_revisions_weaken',
    'price_outpaces_per_share_fundamentals_and_multiple_expands',
  ];

  let state: UniversalP0State;
  let action: UniversalP0Action;

  if (evidenceGate !== 'CONFIRMED') {
    state = 'EVIDENCE_PENDING';
    action = 'EVIDENCE_REQUIRED';
    reasons.push('Universal P0 requires at least four traceable evidence records.');
  } else if (input.balanceSheetQualityScore < 30) {
    state = 'FUNDING_RISK';
    action = 'REJECT_FOR_NOW';
    reasons.push('Balance-sheet quality fails the Point-Zero funding gate.');
  } else if (input.liquidityQualityScore < 25) {
    state = 'ILLIQUID_RISK';
    action = 'REJECT_FOR_NOW';
    reasons.push('Liquidity quality fails the implementation gate.');
  } else if (input.valueTrapRiskScore >= 80) {
    state = 'VALUE_TRAP_RISK';
    action = 'REJECT_FOR_NOW';
    reasons.push('Cheap valuation is not sufficient: value-trap risk is too high.');
  } else if (sizeBlindP0Score >= 82 && expectationsDebtScore <= 45) {
    state = 'P0_ELITE';
    action = 'ADVANCE_DEEP_RESEARCH';
    reasons.push('Fundamental acceleration, valuation runway and quality align without excessive expectations debt.');
  } else if (sizeBlindP0Score >= 72) {
    state = 'P0_STRONG';
    action = expectationsDebtScore >= 70 ? 'NO_CHASE' : 'ADVANCE_DEEP_RESEARCH';
    reasons.push('Strong universal Point-Zero profile; at least one risk or expectation dimension remains non-elite.');
  } else if (sizeBlindP0Score >= 62) {
    state = 'P1_EARLY';
    action = expectationsDebtScore >= 70 ? 'NO_CHASE' : 'WATCH';
    reasons.push('Early economic inflection is visible but the asymmetry is not yet strong enough for elite discovery status.');
  } else if (sizeBlindP0Score >= 52) {
    state = 'WATCH';
    action = 'WATCH';
    reasons.push('Some useful signals are present, but the total risk-adjusted opportunity remains incomplete.');
  } else {
    state = 'NO_EDGE';
    action = 'REJECT_FOR_NOW';
    reasons.push('No sufficient size-blind Point-Zero edge is currently demonstrated.');
  }

  if (excessReratingPp <= 0) {
    reasons.push('Per-share fundamental CAGR has matched or exceeded the stock-price CAGR; raw run-up is therefore not penalized.');
  }
  if (expectationsDebtScore >= 70) {
    reasons.push('Expectations debt is high: future growth is already materially capitalized in the stock.');
  }
  if (input.breadthRegimeScore >= 70) {
    reasons.push('Market breadth is supportive, but breadth is only a minor discovery input and cannot override company economics.');
  }

  const isSmallMid = input.marketCapUsd < 50_000_000_000;
  const discoveryTag: UniversalPointZeroResult['discoveryTag'] =
    sizeBlindP0Score >= 72
      ? isSmallMid && input.breadthRegimeScore >= 60
        ? 'SMALL_MID_SPRINTER'
        : 'SIZE_BLIND_P0'
      : 'NONE';

  return {
    ticker: input.ticker,
    pointZeroMode: input.pointZeroMode,
    marketCapBucket,
    sizeBiasContribution: 0,
    evidenceGate,
    fundamentalInflectionScore,
    excessReratingPp,
    excessReratingDebtScore,
    multipleExpansionDebtScore,
    expectationsDebtScore,
    valuationOpportunityScore,
    coreOpportunityScore,
    riskPenaltyScore,
    sizeBlindP0Score,
    state,
    action,
    discoveryTag,
    reasons,
    falsifiers,
  };
}

export const SIZE_BLIND_POINT_ZERO_OMEGA = {
  id: 'SIZE_BLIND_POINT_ZERO_OMEGA_V1',
  name: 'Size-Blind Point Zero Ω v1.0',
  effectiveDate: '2026-09-04',
  role: 'universal_cross_sector_point_zero_discovery_engine',
  scoreWeights: {
    fundamentalInflection: 0.30,
    valuationOpportunity: 0.20,
    capitalEfficiency: 0.12,
    balanceSheetQuality: 0.10,
    catalystDurability: 0.08,
    earningsRevisions: 0.07,
    breadthRegime: 0.05,
    relativeMomentum: 0.03,
    liquidityQuality: 0.05,
    marketCap: 0,
  },
  riskPenalties: {
    valueTrapRisk: 0.12,
    drawdownRisk: 0.08,
    dilutionRisk: 0.08,
  },
  constitutionalRules: [
    'EVERY_COMPANY_STARTS_FROM_ZERO',
    'NO_MEGACAP_BONUS',
    'NO_SMALLCAP_BONUS',
    'MARKET_CAP_IS_METADATA_NOT_SCORE',
    'PRICE_RUN_UP_IS_NOT_A_PENALTY_WHEN_PER_SHARE_ECONOMICS_CATCH_UP',
    'CHEAP_IS_NOT_VALUE_IF_BUSINESS_ECONOMICS_ARE_DETERIORATING',
    'BREADTH_IS_A_REGIME_INPUT_NOT_A_STOCK_SELECTION_SHORTCUT',
    'P0_WINNER_IS_NOT_AUTOMATIC_BUY',
    'REPLACEMENT_FIREWALL_AND_FALSIFIERS_RETAIN_VETO',
  ],
} as const;

export const BREADTH_ROTATION_OMEGA = {
  id: 'BREADTH_ROTATION_OMEGA_V1',
  name: 'Breadth Rotation Ω v1.0',
  effectiveDate: '2026-09-04',
  scoreWeights: {
    epsGrowthSpread: 0.35,
    valuationDiscount: 0.25,
    relativeStrength6m: 0.20,
    positiveRevisionBreadth: 0.20,
  },
  rule: 'A broadening market increases discovery priority outside megacaps but never overrides company-level economics.',
} as const;
