export type CapexAsymmetryState =
  | 'P0_ELITE'
  | 'P0_STRONG'
  | 'P1_CONFIRMED'
  | 'MATURE_CROWDED'
  | 'NO_ASYMMETRY_EDGE'
  | 'EVIDENCE_PENDING';

export type CapexAsymmetryInput = {
  ticker: string;
  evidenceTraceable: boolean;
  evidenceIds: readonly string[];

  // Structural CAPEX evidence from CAPEX Hunters Ω.
  capexCaptureScore: number;
  remainingCapexScore: number;

  // CAPEX Capture Elasticity Ω ratios. Use null when unavailable.
  revenueElasticity: number | null;
  grossProfitElasticity: number | null;
  fcfElasticity: number | null;

  // Three-year annualized market/fundamental change. Use the best per-share
  // fundamental hierarchy available: FCF/share > EPS/share > gross profit/share > revenue/share.
  priceCagr3yPct: number;
  benchmarkPriceCagr3yPct: number;
  fundamentalCagr3yPct: number;

  // Comparable valuation multiple at start/current date, e.g. forward P/E,
  // EV/EBITDA or EV/Sales. Both must use the same metric definition.
  startValuationMultiple?: number;
  currentValuationMultiple?: number;

  // Optional saturation control. Only use when a defensible mature equity-value
  // estimate exists. Never invent a TAM-derived market cap.
  currentMarketCap?: number;
  plausibleMatureMarketCap?: number;
};

export type CapexAsymmetryResult = {
  ticker: string;
  evidenceGate: 'CONFIRMED' | 'PROVISIONAL' | 'BLOCKED';
  runUpVsBenchmarkPp: number;
  excessReratingPp: number;
  runUpDebtScore: number;
  fundamentalSupportScore: number;
  multipleExpansionDebtScore: number | null;
  expectationsDebtScore: number;
  valuationOpportunityScore: number;
  elasticityScore: number;
  saturationPenaltyScore: number | null;
  p0AdjustedScore: number;
  state: CapexAsymmetryState;
  action: 'ADVANCE_DEEP_RESEARCH' | 'WATCH' | 'NO_CHASE' | 'EVIDENCE_REQUIRED';
  reasons: string[];
  falsifiers: string[];
};

const clamp = (x: number): number => Math.max(0, Math.min(100, x));
const round1 = (x: number): number => Math.round(x * 10) / 10;
const round2 = (x: number): number => Math.round(x * 100) / 100;

function requireScore(name: string, x: number): void {
  if (!Number.isFinite(x) || x < 0 || x > 100) throw new Error(`${name}_must_be_between_0_and_100`);
}

function normalizePositivePp(x: number, fullScalePp: number): number {
  if (!Number.isFinite(x)) throw new Error('normalize_positive_pp_requires_finite_value');
  return round1(clamp((Math.max(0, x) / fullScalePp) * 100));
}

function ratioToElasticityScore(ratio: number | null): number | null {
  if (ratio == null) return null;
  if (!Number.isFinite(ratio)) throw new Error('elasticity_ratio_requires_finite_value_or_null');
  // 1.25x economic capture per unit of funding-pool CAPEX maps to 100.
  // Negative elasticity maps to 0. This is intentionally capped to prevent
  // one extreme quarter from dominating the composite.
  return round1(clamp((Math.max(0, ratio) / 1.25) * 100));
}

export function scoreCapexElasticity(input: Pick<CapexAsymmetryInput, 'revenueElasticity' | 'grossProfitElasticity' | 'fcfElasticity'>): number {
  const candidates = [
    { score: ratioToElasticityScore(input.fcfElasticity), weight: 0.50 },
    { score: ratioToElasticityScore(input.grossProfitElasticity), weight: 0.30 },
    { score: ratioToElasticityScore(input.revenueElasticity), weight: 0.20 },
  ].filter((x): x is { score: number; weight: number } => x.score != null);

  if (candidates.length === 0) return 50; // neutral, never a free positive signal
  const weightSum = candidates.reduce((sum, x) => sum + x.weight, 0);
  return round1(candidates.reduce((sum, x) => sum + x.score * (x.weight / weightSum), 0));
}

export function scoreMultipleExpansionDebt(startMultiple?: number, currentMultiple?: number): number | null {
  if (startMultiple == null || currentMultiple == null) return null;
  if (!Number.isFinite(startMultiple) || !Number.isFinite(currentMultiple) || startMultiple <= 0 || currentMultiple <= 0) {
    throw new Error('valuation_multiples_must_be_positive_finite_values');
  }
  if (currentMultiple <= startMultiple) return 0;

  // One full doubling of a comparable valuation multiple is maximum multiple debt.
  return round1(clamp(Math.log2(currentMultiple / startMultiple) * 100));
}

export function scoreMarketCapSaturation(currentMarketCap?: number, plausibleMatureMarketCap?: number): number | null {
  if (currentMarketCap == null || plausibleMatureMarketCap == null) return null;
  if (!Number.isFinite(currentMarketCap) || !Number.isFinite(plausibleMatureMarketCap) || currentMarketCap <= 0 || plausibleMatureMarketCap <= 0) {
    throw new Error('market_caps_must_be_positive_finite_values');
  }

  const ratio = currentMarketCap / plausibleMatureMarketCap;
  if (ratio <= 0.10) return 0;
  if (ratio >= 1) return 100;
  return round1(((ratio - 0.10) / 0.90) * 100);
}

export function evaluateCapexAsymmetry(input: CapexAsymmetryInput): CapexAsymmetryResult {
  requireScore('capex_capture_score', input.capexCaptureScore);
  requireScore('remaining_capex_score', input.remainingCapexScore);
  const growths = [input.priceCagr3yPct, input.benchmarkPriceCagr3yPct, input.fundamentalCagr3yPct];
  if (growths.some((x) => !Number.isFinite(x))) throw new Error('growth_cagrs_must_be_finite_values');

  const runUpVsBenchmarkPp = round2(input.priceCagr3yPct - input.benchmarkPriceCagr3yPct);
  const excessReratingPp = round2(input.priceCagr3yPct - input.fundamentalCagr3yPct);

  // RUN-UP DEBT Ω is descriptive context. A strong stock is not penalized merely
  // for rising; the direct penalty comes from price outrunning per-share economics
  // and/or valuation multiple expansion.
  const runUpDebtScore = normalizePositivePp(runUpVsBenchmarkPp, 50);

  // 0 pp or negative excess rerating means fundamentals have fully caught up.
  // +40 pp annualized price-vs-fundamental gap maps to zero support.
  const excessReratingDebtScore = normalizePositivePp(excessReratingPp, 40);
  const fundamentalSupportScore = round1(100 - excessReratingDebtScore);

  const multipleExpansionDebtScore = scoreMultipleExpansionDebt(
    input.startValuationMultiple,
    input.currentValuationMultiple,
  );

  const expectationsDebtScore = round1(
    multipleExpansionDebtScore == null
      ? excessReratingDebtScore
      : excessReratingDebtScore * 0.65 + multipleExpansionDebtScore * 0.35,
  );
  const valuationOpportunityScore = round1(100 - expectationsDebtScore);
  const elasticityScore = scoreCapexElasticity(input);
  const saturationPenaltyScore = scoreMarketCapSaturation(input.currentMarketCap, input.plausibleMatureMarketCap);

  // P0 ADJUSTED Ω
  // Structural capture remains the largest weight. Remaining physical/financial
  // CAPEX and economic elasticity matter next. Valuation opportunity is explicitly
  // separated from company quality. Saturation is only applied when supported by
  // a defensible mature-equity-value estimate; absent evidence means no penalty,
  // not a guessed neutral score.
  const p0AdjustedScore = round1(clamp(
    input.capexCaptureScore * 0.45 +
      input.remainingCapexScore * 0.20 +
      elasticityScore * 0.15 +
      valuationOpportunityScore * 0.20 -
      (saturationPenaltyScore == null ? 0 : saturationPenaltyScore * 0.10),
  ));

  const evidenceGate: CapexAsymmetryResult['evidenceGate'] =
    input.evidenceTraceable && input.evidenceIds.length >= 3
      ? 'CONFIRMED'
      : input.evidenceTraceable && input.evidenceIds.length > 0
        ? 'PROVISIONAL'
        : 'BLOCKED';

  const reasons: string[] = [];
  const falsifiers = [
    'customer_funding_pool_capex_decelerates_or_is_cancelled',
    'orders_backlog_or_rpo_fail_to_convert_to_revenue',
    'revenue_growth_fails_to_convert_to_margin_or_fcf_per_share',
    'price_growth_materially_outpaces_per_share_fundamental_growth',
    'valuation_multiple_expands_without_forward_estimate_catch_up',
    'own_capex_debt_or_dilution_erodes_capture_elasticity',
    'bottleneck_is_replicated_substituted_or_bypassed',
    'mature_equity_value_assumption_proves_unfounded',
  ];

  let state: CapexAsymmetryState;
  let action: CapexAsymmetryResult['action'];

  if (evidenceGate !== 'CONFIRMED') {
    state = 'EVIDENCE_PENDING';
    action = 'EVIDENCE_REQUIRED';
    reasons.push('P0-adjusted ranking requires at least three traceable evidence records.');
  } else if (p0AdjustedScore >= 85 && expectationsDebtScore <= 45) {
    state = 'P0_ELITE';
    action = 'ADVANCE_DEEP_RESEARCH';
    reasons.push('High structural capture, remaining CAPEX and valuation support coexist without excessive expectations debt.');
  } else if (p0AdjustedScore >= 75) {
    state = 'P0_STRONG';
    action = expectationsDebtScore >= 70 ? 'NO_CHASE' : 'ADVANCE_DEEP_RESEARCH';
    reasons.push('Strong CAPEX asymmetry remains, but valuation/expectations or one structural dimension still requires monitoring.');
  } else if (p0AdjustedScore >= 65) {
    state = 'P1_CONFIRMED';
    action = expectationsDebtScore >= 70 ? 'NO_CHASE' : 'WATCH';
    reasons.push('The company is a confirmed CAPEX captor, but the stock is no longer a clean Point-Zero asymmetry.');
  } else if (p0AdjustedScore >= 50) {
    state = 'MATURE_CROWDED';
    action = 'NO_CHASE';
    reasons.push('Structural CAPEX exposure may remain attractive, but much of the asymmetry is already monetized or priced.');
  } else {
    state = 'NO_ASYMMETRY_EDGE';
    action = 'NO_CHASE';
    reasons.push('Current price/fundamental configuration does not show a sufficient Point-Zero CAPEX asymmetry.');
  }

  if (runUpDebtScore >= 80) reasons.push('The stock has materially outperformed the benchmark over the three-year window; verify that per-share fundamentals have caught up.');
  if (fundamentalSupportScore >= 80) reasons.push('Three-year per-share fundamental growth broadly supports the stock-price trajectory.');
  if (multipleExpansionDebtScore != null && multipleExpansionDebtScore >= 70) reasons.push('Comparable valuation multiple expansion is a material component of expectations debt.');
  if (saturationPenaltyScore == null) reasons.push('Market-cap saturation is intentionally unscored because no defensible mature-equity-value estimate was supplied.');

  return {
    ticker: input.ticker,
    evidenceGate,
    runUpVsBenchmarkPp,
    excessReratingPp,
    runUpDebtScore,
    fundamentalSupportScore,
    multipleExpansionDebtScore,
    expectationsDebtScore,
    valuationOpportunityScore,
    elasticityScore,
    saturationPenaltyScore,
    p0AdjustedScore,
    state,
    action,
    reasons,
    falsifiers,
  };
}

export const CAPEX_ASYMMETRY_OMEGA = {
  id: 'CAPEX_ASYMMETRY_OMEGA_V1',
  name: 'CAPEX Asymmetry / P0 Adjusted Ω v1.0',
  effectiveDate: '2026-09-04',
  parentEngines: ['CAPEX_HUNTERS_OMEGA_V1', 'CAPEX_CAPTURE_ELASTICITY_OMEGA_V1'],
  formulas: {
    excessReratingPp: 'PRICE_CAGR_3Y - FUNDAMENTAL_PER_SHARE_CAGR_3Y',
    runUpVsBenchmarkPp: 'PRICE_CAGR_3Y - BENCHMARK_CAGR_3Y',
    expectationsDebt: '65% EXCESS_RERATING_DEBT + 35% MULTIPLE_EXPANSION_DEBT when comparable multiple history exists',
    p0Adjusted: '45% CAPEX_CAPTURE + 20% REMAINING_CAPEX + 15% CAPTURE_ELASTICITY + 20% VALUATION_OPPORTUNITY - 10% MARKET_CAP_SATURATION_PENALTY',
  },
  fundamentalHierarchy: ['FCF_PER_SHARE', 'EPS_PER_SHARE', 'GROSS_PROFIT_PER_SHARE', 'REVENUE_PER_SHARE'],
  constitutionalRules: [
    'PRICE_RUN_UP_ALONE_IS_NOT_A_PENALTY',
    'PENALIZE_PRICE_ONLY_WHEN_IT_OUTRUNS_PER_SHARE_ECONOMICS_OR_MULTIPLE_EXPANDS',
    'USE_COMPARABLE_VALUATION_MULTIPLES_ONLY',
    'DO_NOT_INVENT_MATURE_MARKET_CAP_FROM_TAM',
    'MISSING_SATURATION_EVIDENCE_MEANS_UNSCORED_NOT_ZERO_QUALITY',
    'P0_ADJUSTED_WINNER_IS_NOT_AUTOMATIC_BUY',
  ],
} as const;
