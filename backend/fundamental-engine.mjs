const finite = (v) => typeof v === 'number' && Number.isFinite(v);
const clamp = (v, min = 0, max = 100) => Math.max(min, Math.min(max, v));
const round1 = (v) => finite(v) ? Math.round(v * 10) / 10 : null;

function pick(metric, aliases) {
  for (const key of aliases) {
    const value = metric?.[key];
    if (finite(value)) return value;
  }
  return null;
}

function higher(value, bad, good) {
  if (!finite(value)) return null;
  if (good === bad) return value >= good ? 100 : 0;
  return clamp(((value - bad) / (good - bad)) * 100);
}

function lower(value, good, bad) {
  if (!finite(value)) return null;
  if (bad === good) return value <= good ? 100 : 0;
  return clamp(((bad - value) / (bad - good)) * 100);
}

function average(values) {
  const x = values.filter(finite);
  return x.length ? x.reduce((a, b) => a + b, 0) / x.length : null;
}

function weighted(parts) {
  const observed = parts.filter((p) => finite(p.score));
  const weight = observed.reduce((s, p) => s + p.weight, 0);
  if (!weight) return { score: null, observedWeight: 0 };
  const raw = observed.reduce((s, p) => s + p.score * p.weight, 0) / weight;
  return { score: round1(raw), observedWeight: weight };
}

function component(name, weight, score, state, inputs, explanation) {
  return { name, weight, score: round1(score), state, inputs, explanation };
}

export function extractObservedFundamentals(metric = {}) {
  return {
    roe: pick(metric, ['roeTTM', 'roeAnnual', 'returnOnEquityTTM']),
    roa: pick(metric, ['roaTTM', 'roaAnnual', 'returnOnAssetsTTM']),
    operatingMargin: pick(metric, ['operatingMarginTTM', 'operatingMarginAnnual']),
    netMargin: pick(metric, ['netProfitMarginTTM', 'netProfitMarginAnnual']),
    grossMargin: pick(metric, ['grossMarginTTM', 'grossMarginAnnual']),
    revenueGrowth3Y: pick(metric, ['revenueGrowth3Y', 'revenueGrowth3YAnnual']),
    revenueGrowthTTM: pick(metric, ['revenueGrowthTTMYoy', 'revenueGrowthTTM']),
    epsGrowth3Y: pick(metric, ['epsGrowth3Y', 'epsGrowth3YAnnual']),
    epsGrowthTTM: pick(metric, ['epsGrowthTTMYoy', 'epsGrowthTTM']),
    currentRatio: pick(metric, ['currentRatioAnnual', 'currentRatioTTM']),
    quickRatio: pick(metric, ['quickRatioAnnual', 'quickRatioTTM']),
    debtEquity: pick(metric, ['totalDebtToEquityAnnual', 'totalDebtToEquityTTM', 'debtEquityAnnual']),
    fcfPerShare: pick(metric, ['freeCashFlowPerShareTTM', 'freeCashFlowPerShareAnnual', 'fcfPerShareTTM']),
    fcfYield: pick(metric, ['freeCashFlowYieldTTM', 'fcfYieldTTM', 'fcfYieldAnnual']),
    pe: pick(metric, ['peTTM', 'peAnnual']),
    pb: pick(metric, ['pbAnnual', 'pbQuarterly']),
    evEbitda: pick(metric, ['evEbitdaTTM', 'evEbitdaAnnual']),
    beta: pick(metric, ['beta']),
    marketCap: pick(metric, ['marketCapitalization']),
  };
}

export function runFundamentalAudit({ metric = {}, marketSignals = null, marketCap = null, evidence = [] } = {}) {
  const x = extractObservedFundamentals(metric);
  if (!finite(x.marketCap) && finite(marketCap)) x.marketCap = marketCap;

  const profitabilityKnown = finite(x.netMargin) || finite(x.roe) || finite(x.roa);
  const profitable = profitabilityKnown ? ((x.netMargin ?? 0) > 0 || (x.roe ?? 0) > 0 || (x.roa ?? 0) > 0) : null;
  const fcfKnown = finite(x.fcfPerShare) || finite(x.fcfYield);
  const positiveFcf = fcfKnown ? ((x.fcfPerShare ?? 0) > 0 || (x.fcfYield ?? 0) > 0) : null;
  const balanceKnown = finite(x.currentRatio) || finite(x.debtEquity);
  const strongBalance = balanceKnown ? ((x.currentRatio == null || x.currentRatio >= 1) && (x.debtEquity == null || x.debtEquity <= 200)) : null;
  const sizeKnown = finite(x.marketCap);
  const adequateSize = sizeKnown ? x.marketCap >= 10_000 : null; // Finnhub market cap is normally USD millions.
  const verifiedFalsifier = evidence.some((e) => e?.validationState === 'VERIFIED_FACT' && e?.isStructuralFalsifier === true);

  const hardRequirements = {
    profitableBusiness: { state: profitable == null ? 'PENDING' : profitable ? 'PASS' : 'FAIL', value: x.netMargin ?? x.roe ?? x.roa },
    positiveFreeCashFlow: { state: positiveFcf == null ? 'PENDING' : positiveFcf ? 'PASS' : 'FAIL', value: x.fcfPerShare ?? x.fcfYield },
    strongBalanceSheet: { state: strongBalance == null ? 'PENDING' : strongBalance ? 'PASS' : 'FAIL', value: { currentRatio: x.currentRatio, debtEquity: x.debtEquity } },
    sufficientLiquidityAndSize: { state: adequateSize == null ? 'PENDING' : adequateSize ? 'PASS' : 'FAIL', value: x.marketCap },
    governance: { state: 'PENDING', value: null },
    structuralFalsifier: { state: verifiedFalsifier ? 'FAIL' : 'PASS', value: verifiedFalsifier },
  };
  const hardFail = Object.values(hardRequirements).some((r) => r.state === 'FAIL');

  const moatScore = average([
    higher(x.operatingMargin, 5, 30),
    higher(x.grossMargin, 20, 70),
    higher(x.roe, 8, 30),
  ]);
  const capitalAllocationScore = average([
    higher(x.roe, 8, 30),
    higher(x.roa, 3, 15),
    higher(x.epsGrowth3Y, 0, 20),
    higher(x.fcfYield, 0, 8),
  ]);
  const cashGenerationScore = average([
    higher(x.netMargin, 0, 25),
    higher(x.operatingMargin, 5, 30),
    finite(x.fcfPerShare) ? (x.fcfPerShare > 0 ? 80 : 0) : null,
    higher(x.fcfYield, 0, 8),
  ]);
  const financialStrengthScore = average([
    higher(x.currentRatio, 0.7, 2),
    higher(x.quickRatio, 0.5, 1.5),
    lower(x.debtEquity, 50, 250),
  ]);
  const sustainableGrowthScore = average([
    higher(x.revenueGrowth3Y, 0, 20),
    higher(x.revenueGrowthTTM, 0, 20),
    higher(x.epsGrowth3Y, 0, 25),
    higher(x.epsGrowthTTM, 0, 25),
  ]);
  const durabilityScore = average([
    lower(x.beta, 0.8, 2.0),
    higher(x.operatingMargin, 5, 25),
    higher(x.roa, 3, 12),
  ]);
  const valuationComponentScore = average([
    lower(x.pe, 18, 60),
    lower(x.pb, 3, 15),
    lower(x.evEbitda, 12, 35),
    higher(x.fcfYield, 0, 8),
  ]);

  const components = [
    component('MOAT', 25, moatScore, 'QUANT_PROXY', { operatingMargin: x.operatingMargin, grossMargin: x.grossMargin, roe: x.roe }, 'Quantitative proxy only; structural moat still requires primary-source validation.'),
    component('CAPITAL_ALLOCATION', 20, capitalAllocationScore, 'AUTOMATED', { roe: x.roe, roa: x.roa, epsGrowth3Y: x.epsGrowth3Y, fcfYield: x.fcfYield }, 'Observed return and reinvestment proxies.'),
    component('CASH_GENERATION', 15, cashGenerationScore, 'AUTOMATED', { netMargin: x.netMargin, operatingMargin: x.operatingMargin, fcfPerShare: x.fcfPerShare, fcfYield: x.fcfYield }, 'Observed profitability and FCF metrics.'),
    component('FINANCIAL_STRENGTH', 15, financialStrengthScore, 'AUTOMATED', { currentRatio: x.currentRatio, quickRatio: x.quickRatio, debtEquity: x.debtEquity }, 'Liquidity and leverage metrics.'),
    component('SUSTAINABLE_GROWTH', 10, sustainableGrowthScore, 'AUTOMATED', { revenueGrowth3Y: x.revenueGrowth3Y, revenueGrowthTTM: x.revenueGrowthTTM, epsGrowth3Y: x.epsGrowth3Y, epsGrowthTTM: x.epsGrowthTTM }, 'Observed multi-period revenue/EPS growth.'),
    component('BUSINESS_DURABILITY', 10, durabilityScore, 'QUANT_PROXY', { beta: x.beta, operatingMargin: x.operatingMargin, roa: x.roa }, 'Quantitative durability proxy; competitive durability remains an evidence question.'),
    component('VALUATION', 5, valuationComponentScore, 'AUTOMATED', { pe: x.pe, pb: x.pb, evEbitda: x.evEbitda, fcfYield: x.fcfYield }, 'Small valuation contribution inside Business Quality framework.'),
  ];

  const quality = weighted(components);
  const growthScore = round1(average([
    higher(x.revenueGrowth3Y, -5, 25), higher(x.revenueGrowthTTM, -5, 25),
    higher(x.epsGrowth3Y, -10, 30), higher(x.epsGrowthTTM, -10, 30),
  ]));
  const valuationScore = round1(average([
    lower(x.pe, 18, 65), lower(x.pb, 3, 18), lower(x.evEbitda, 12, 40), higher(x.fcfYield, 0, 10),
  ]));
  const fundamentalRisk = round1(average([
    finite(x.beta) ? clamp((x.beta - 0.6) / 1.8 * 100) : null,
    finite(x.debtEquity) ? clamp((x.debtEquity - 30) / 270 * 100) : null,
    finite(x.currentRatio) ? 100 - higher(x.currentRatio, 0.7, 2) : null,
  ]));
  const riskScore = round1(average([fundamentalRisk, marketSignals?.downsideScore]));
  const capitalAllocation = round1(capitalAllocationScore);
  const momentum = marketSignals?.momentumScore ?? null;
  const wave = marketSignals?.waveScore ?? null;

  const opportunityScore = round1(weighted([
    { score: quality.score, weight: 35 },
    { score: growthScore, weight: 20 },
    { score: valuationScore, weight: 20 },
    { score: finite(riskScore) ? 100 - riskScore : null, weight: 15 },
    { score: momentum, weight: 10 },
  ]).score);

  const observedComponents = components.filter((c) => finite(c.score)).length;
  const evidenceCoverage = Math.round((observedComponents / components.length) * 70 + (evidence.length ? 15 : 0));
  const status = hardFail ? 'HARD_FAIL' : quality.score == null ? 'INSUFFICIENT_DATA' : evidenceCoverage >= 80 ? 'AUDITABLE' : 'PRELIMINARY';
  const convictionScore = status === 'AUDITABLE' && finite(opportunityScore) ? opportunityScore : null;

  return {
    status,
    algorithmVersion: 'ATLAS-FUNDAMENTAL-AUDIT-1.0.0',
    epistemicState: status === 'AUDITABLE' ? 'EVIDENCE_BACKED' : 'AUTOMATED_PRELIMINARY',
    hardRequirements,
    businessQuality: {
      score: hardFail ? null : quality.score,
      observedWeight: quality.observedWeight,
      maxWeight: 100,
      components,
      note: 'Moat and Business Durability are quantitative proxies until primary-source validation. AI output is never evidence.',
    },
    growth: { score: growthScore, inputs: { revenueGrowth3Y: x.revenueGrowth3Y, revenueGrowthTTM: x.revenueGrowthTTM, epsGrowth3Y: x.epsGrowth3Y, epsGrowthTTM: x.epsGrowthTTM } },
    valuation: { score: valuationScore, inputs: { pe: x.pe, pb: x.pb, evEbitda: x.evEbitda, fcfYield: x.fcfYield } },
    risk: { score: riskScore, fundamentalRisk, marketDownside: marketSignals?.downsideScore ?? null },
    capitalAllocation: { score: capitalAllocation, inputs: components.find((c) => c.name === 'CAPITAL_ALLOCATION')?.inputs || {} },
    opportunity: { score: opportunityScore, state: finite(opportunityScore) ? 'DECISION_SUPPORT' : 'INSUFFICIENT_DATA' },
    conviction: { score: convictionScore, state: convictionScore == null ? 'LOCKED_PENDING_EVIDENCE' : 'AUDITABLE' },
    marketLayer: { momentumScore: momentum, waveScore: wave, downsideScore: marketSignals?.downsideScore ?? null },
    completeness: { observedComponents, totalComponents: components.length, evidenceItems: evidence.length, evidenceCoverage },
    guardrails: [
      'Market data is a sensor and cannot mutate Thesis or Evidence directly.',
      'AI is never evidence.',
      'Automated moat/durability values are proxies, not verified facts.',
      'Conviction remains locked until the audit reaches evidence-backed status.',
    ],
  };
}
