import { CapexProductivityInput, MetricProvenance } from './capexProductivity';

export type PrimaryFinancialYear = {
  fiscalYear: number;
  revenue: number | null;
  operatingIncome: number | null;
  cashFlowFromOperations: number | null;
  capex: number | null;
  dilutedShares: number | null;
  totalAssets: number | null;
  equity: number | null;
  shortTermDebt: number | null;
  longTermDebt: number | null;
  cashAndEquivalents: number | null;
  incomeBeforeTaxes: number | null;
  incomeTaxExpense: number | null;
  depreciationAndAmortization: number | null;
  interestExpense: number | null;
  stockBasedCompensation: number | null;
};

export type PrimaryStatementBundle = {
  ticker: string;
  years: PrimaryFinancialYear[];
  externalFinancingRequired?: boolean | null;
  capacityUnderConstruction?: boolean;
  monetizationEvidence?: boolean;
};

export type DerivedCapexBundle = {
  input: CapexProductivityInput;
  provenance: Record<string, MetricProvenance>;
};

const direct = (field: string, year?: number): MetricProvenance => ({
  origin: 'DIRECT',
  formula: null,
  inputs: year == null ? [field] : [`${field}:${year}`],
});

const derived = (formula: string, inputs: string[]): MetricProvenance => ({ origin: 'DERIVED', formula, inputs });
const missing = (inputs: string[]): MetricProvenance => ({ origin: 'MISSING', formula: null, inputs });

function safeDiv(a: number | null, b: number | null): number | null {
  if (a == null || b == null || b === 0) return null;
  return a / b;
}

function growthPct(current: number | null, prior: number | null): number | null {
  if (current == null || prior == null || prior === 0) return null;
  return ((current / prior) - 1) * 100;
}

function cagrPct(current: number | null, prior: number | null, years: number): number | null {
  if (current == null || prior == null || current <= 0 || prior <= 0 || years <= 0) return null;
  return (Math.pow(current / prior, 1 / years) - 1) * 100;
}

function avg(values: Array<number | null>): number | null {
  const available = values.filter((value): value is number => value != null);
  return available.length ? available.reduce((sum, value) => sum + value, 0) / available.length : null;
}

function taxRate(year: PrimaryFinancialYear): number | null {
  const rate = safeDiv(year.incomeTaxExpense, year.incomeBeforeTaxes);
  if (rate == null) return null;
  return Math.min(0.6, Math.max(0, rate));
}

function nopat(year: PrimaryFinancialYear): number | null {
  const rate = taxRate(year);
  if (year.operatingIncome == null || rate == null) return null;
  return year.operatingIncome * (1 - rate);
}

function investedCapital(year: PrimaryFinancialYear): number | null {
  if (year.equity == null || year.shortTermDebt == null || year.longTermDebt == null || year.cashAndEquivalents == null) return null;
  return year.equity + year.shortTermDebt + year.longTermDebt - year.cashAndEquivalents;
}

function roic(year: PrimaryFinancialYear, prior: PrimaryFinancialYear | undefined): number | null {
  const currentNopat = nopat(year);
  const currentIc = investedCapital(year);
  const priorIc = prior ? investedCapital(prior) : null;
  if (currentNopat == null || currentIc == null) return null;
  const denominator = priorIc == null ? currentIc : (currentIc + priorIc) / 2;
  return denominator === 0 ? null : (currentNopat / denominator) * 100;
}

function fcf(year: PrimaryFinancialYear): number | null {
  if (year.cashFlowFromOperations == null || year.capex == null) return null;
  return year.cashFlowFromOperations - year.capex;
}

function ebitda(year: PrimaryFinancialYear): number | null {
  if (year.operatingIncome == null || year.depreciationAndAmortization == null) return null;
  return year.operatingIncome + year.depreciationAndAmortization;
}

function netDebt(year: PrimaryFinancialYear): number | null {
  if (year.shortTermDebt == null || year.longTermDebt == null || year.cashAndEquivalents == null) return null;
  return year.shortTermDebt + year.longTermDebt - year.cashAndEquivalents;
}

function metricOrigin(value: number | null, formula: string, inputs: string[]): MetricProvenance {
  return value == null ? missing(inputs) : derived(formula, inputs);
}

export function deriveCapexProductivityFromPrimaryStatements(bundle: PrimaryStatementBundle): DerivedCapexBundle {
  const years = [...bundle.years].sort((a, b) => a.fiscalYear - b.fiscalYear);
  const current = years.at(-1);
  if (!current) throw new Error('At least one primary financial year is required.');
  const prior1 = years.at(-2);
  const prior2 = years.at(-3);
  const prior3 = years.at(-4);

  const currentFcf = fcf(current);
  const prior1Fcf = prior1 ? fcf(prior1) : null;
  const prior3Fcf = prior3 ? fcf(prior3) : null;
  const currentFcfPerShare = safeDiv(currentFcf, current.dilutedShares);
  const prior1FcfPerShare = prior1 ? safeDiv(prior1Fcf, prior1.dilutedShares) : null;
  const prior3FcfPerShare = prior3 ? safeDiv(prior3Fcf, prior3.dilutedShares) : null;

  const currentRoic = roic(current, prior1);
  const roicSeries = years.map((year, index) => roic(year, index > 0 ? years[index - 1] : undefined));
  const roicAvg3y = avg(roicSeries.slice(-3));
  const roicAvg5y = avg(roicSeries.slice(-5));

  const currentNopat = nopat(current);
  const prior1Nopat = prior1 ? nopat(prior1) : null;
  const currentIc = investedCapital(current);
  const prior1Ic = prior1 ? investedCapital(prior1) : null;
  const deltaNopat = currentNopat != null && prior1Nopat != null ? currentNopat - prior1Nopat : null;
  const deltaIc = currentIc != null && prior1Ic != null ? currentIc - prior1Ic : null;
  const incrementalRoic = deltaNopat == null || deltaIc == null || deltaIc === 0 ? null : (deltaNopat / deltaIc) * 100;

  const currentNetDebt = netDebt(current);
  const prior1NetDebt = prior1 ? netDebt(prior1) : null;
  const currentEbitda = ebitda(current);
  const netDebtToEbitda = safeDiv(currentNetDebt, currentEbitda);

  const capexGrowth = prior1 ? growthPct(current.capex, prior1.capex) : null;
  const revenueGrowth = prior1 ? growthPct(current.revenue, prior1.revenue) : null;
  const operatingIncomeGrowth = prior1 ? growthPct(current.operatingIncome, prior1.operatingIncome) : null;
  const fcfGrowth = growthPct(currentFcf, prior1Fcf);
  const fcfPerShareGrowth = growthPct(currentFcfPerShare, prior1FcfPerShare);
  const dilutedShareCagr = prior3 ? cagrPct(current.dilutedShares, prior3.dilutedShares, current.fiscalYear - prior3.fiscalYear) : null;
  const capexCagr3y = prior3 ? cagrPct(current.capex, prior3.capex, current.fiscalYear - prior3.fiscalYear) : null;
  const revenueCagr3y = prior3 ? cagrPct(current.revenue, prior3.revenue, current.fiscalYear - prior3.fiscalYear) : null;
  const fcfCagr3y = prior3 ? cagrPct(currentFcf, prior3Fcf, current.fiscalYear - prior3.fiscalYear) : null;
  const fcfPerShareCagr3y = prior3 ? cagrPct(currentFcfPerShare, prior3FcfPerShare, current.fiscalYear - prior3.fiscalYear) : null;

  const fcfToCapex = safeDiv(currentFcf, current.capex);
  const fcfToCapexPrior1y = prior1 ? safeDiv(prior1Fcf, prior1.capex) : null;
  const prior2Fcf = prior2 ? fcf(prior2) : null;
  const fcfToCapexPrior2y = prior2 ? safeDiv(prior2Fcf, prior2.capex) : null;

  const assetTurnover = safeDiv(current.revenue, current.totalAssets);
  const assetTurnoverPrior1y = prior1 ? safeDiv(prior1.revenue, prior1.totalAssets) : null;
  const assetTurnoverPrior2y = prior2 ? safeDiv(prior2.revenue, prior2.totalAssets) : null;

  const deltaRevenue = current.revenue != null && prior1?.revenue != null ? current.revenue - prior1.revenue : null;
  const deltaOperatingProfit = current.operatingIncome != null && prior1?.operatingIncome != null ? current.operatingIncome - prior1.operatingIncome : null;
  const incrementalRevenueToInvestedCapital = safeDiv(deltaRevenue, deltaIc);
  const incrementalOperatingProfitToInvestedCapital = safeDiv(deltaOperatingProfit, deltaIc);
  const incrementalOperatingMargin = safeDiv(deltaOperatingProfit, deltaRevenue);

  const capexToRevenue = safeDiv(current.capex, current.revenue);
  const capexToCfo = safeDiv(current.capex, current.cashFlowFromOperations);
  const netDebtGrowth = growthPct(currentNetDebt, prior1NetDebt);
  const interestCoverage = safeDiv(current.operatingIncome, current.interestExpense);
  const sbcToRevenue = safeDiv(current.stockBasedCompensation, current.revenue);
  const sbcToFcf = safeDiv(current.stockBasedCompensation, currentFcf);

  const provenance: Record<string, MetricProvenance> = {
    roicCurrent: metricOrigin(currentRoic, 'NOPAT / average invested capital', ['operatingIncome', 'incomeTaxExpense', 'incomeBeforeTaxes', 'equity', 'shortTermDebt', 'longTermDebt', 'cashAndEquivalents']),
    roicAvg3y: metricOrigin(roicAvg3y, 'average of derived annual ROIC values over up to 3 years', ['roicSeries']),
    roicAvg5y: metricOrigin(roicAvg5y, 'average of derived annual ROIC values over up to 5 years', ['roicSeries']),
    incrementalRoic: metricOrigin(incrementalRoic, 'ΔNOPAT / Δinvested capital', ['currentNOPAT', 'priorNOPAT', 'currentInvestedCapital', 'priorInvestedCapital']),
    capexGrowth: metricOrigin(capexGrowth, 'YoY CAPEX growth', ['capexCurrent', 'capexPrior']),
    capexCagr3y: metricOrigin(capexCagr3y, 'CAPEX CAGR', ['capexCurrent', 'capex3yPrior']),
    revenueGrowth: metricOrigin(revenueGrowth, 'YoY revenue growth', ['revenueCurrent', 'revenuePrior']),
    revenueCagr3y: metricOrigin(revenueCagr3y, 'Revenue CAGR', ['revenueCurrent', 'revenue3yPrior']),
    operatingIncomeGrowth: metricOrigin(operatingIncomeGrowth, 'YoY operating income growth', ['operatingIncomeCurrent', 'operatingIncomePrior']),
    fcfGrowth: metricOrigin(fcfGrowth, 'YoY FCF growth where FCF=CFO-CAPEX', ['cashFlowFromOperations', 'capex']),
    fcfCagr3y: metricOrigin(fcfCagr3y, 'FCF CAGR where FCF=CFO-CAPEX', ['cashFlowFromOperations', 'capex']),
    fcfPerShareGrowth: metricOrigin(fcfPerShareGrowth, 'YoY growth of (CFO-CAPEX)/diluted shares', ['cashFlowFromOperations', 'capex', 'dilutedShares']),
    fcfPerShareCagr3y: metricOrigin(fcfPerShareCagr3y, 'FCF/share CAGR', ['cashFlowFromOperations', 'capex', 'dilutedShares']),
    fcfToCapex: metricOrigin(fcfToCapex, '(CFO-CAPEX)/CAPEX', ['cashFlowFromOperations', 'capex']),
    fcfToCapexPrior1y: metricOrigin(fcfToCapexPrior1y, 'prior-year (CFO-CAPEX)/CAPEX', ['cashFlowFromOperationsPrior', 'capexPrior']),
    fcfToCapexPrior2y: metricOrigin(fcfToCapexPrior2y, 'two-year-prior (CFO-CAPEX)/CAPEX', ['cashFlowFromOperationsPrior2', 'capexPrior2']),
    assetTurnover: metricOrigin(assetTurnover, 'Revenue / total assets', ['revenue', 'totalAssets']),
    assetTurnoverPrior1y: metricOrigin(assetTurnoverPrior1y, 'prior Revenue / total assets', ['revenuePrior', 'totalAssetsPrior']),
    assetTurnoverPrior2y: metricOrigin(assetTurnoverPrior2y, 'prior2 Revenue / total assets', ['revenuePrior2', 'totalAssetsPrior2']),
    incrementalRevenueToInvestedCapital: metricOrigin(incrementalRevenueToInvestedCapital, 'ΔRevenue / Δinvested capital', ['revenue', 'investedCapital']),
    incrementalOperatingProfitToInvestedCapital: metricOrigin(incrementalOperatingProfitToInvestedCapital, 'ΔOperating Income / Δinvested capital', ['operatingIncome', 'investedCapital']),
    capexToRevenue: metricOrigin(capexToRevenue, 'CAPEX / Revenue', ['capex', 'revenue']),
    capexToCfo: metricOrigin(capexToCfo, 'CAPEX / CFO', ['capex', 'cashFlowFromOperations']),
    netDebtToEbitda: metricOrigin(netDebtToEbitda, '(short-term debt + long-term debt - cash) / (operating income + D&A)', ['shortTermDebt', 'longTermDebt', 'cashAndEquivalents', 'operatingIncome', 'depreciationAndAmortization']),
    netDebtGrowth: metricOrigin(netDebtGrowth, 'YoY net debt growth', ['netDebtCurrent', 'netDebtPrior']),
    interestCoverage: metricOrigin(interestCoverage, 'Operating Income / interest expense', ['operatingIncome', 'interestExpense']),
    dilutedShareCagr: metricOrigin(dilutedShareCagr, 'Diluted shares CAGR', ['dilutedSharesCurrent', 'dilutedShares3yPrior']),
    sbcToRevenue: metricOrigin(sbcToRevenue, 'SBC / Revenue', ['stockBasedCompensation', 'revenue']),
    sbcToFcf: metricOrigin(sbcToFcf, 'SBC / FCF', ['stockBasedCompensation', 'cashFlowFromOperations', 'capex']),
    incrementalOperatingMargin: metricOrigin(incrementalOperatingMargin == null ? null : incrementalOperatingMargin * 100, 'ΔOperating Income / ΔRevenue', ['operatingIncome', 'revenue']),
  };

  // Raw statement fields are DIRECT evidence; formulas above are DERIVED from them.
  for (const [field, value] of Object.entries(current)) {
    if (field !== 'fiscalYear' && value != null) provenance[`primary.${field}`] = direct(field, current.fiscalYear);
  }

  return {
    input: {
      ticker: bundle.ticker,
      roicCurrent: currentRoic,
      roicAvg3y,
      roicAvg5y,
      incrementalRoic,
      capexGrowth,
      capexCagr3y,
      revenueGrowth,
      revenueCagr3y,
      operatingIncomeGrowth,
      fcfGrowth,
      fcfCagr3y,
      fcfPerShareGrowth,
      fcfPerShareCagr3y,
      fcfToCapex,
      fcfToCapexPrior1y,
      fcfToCapexPrior2y,
      assetTurnover,
      assetTurnoverPrior1y,
      assetTurnoverPrior2y,
      incrementalRevenueToInvestedCapital,
      incrementalOperatingProfitToInvestedCapital,
      capexToRevenue,
      capexToCfo,
      netDebtToEbitda,
      netDebtGrowth,
      interestCoverage,
      dilutedShareCagr,
      sbcToRevenue,
      sbcToFcf,
      incrementalOperatingMargin: incrementalOperatingMargin == null ? null : incrementalOperatingMargin * 100,
      externalFinancingRequired: bundle.externalFinancingRequired ?? null,
      capacityUnderConstruction: bundle.capacityUnderConstruction ?? false,
      monetizationEvidence: bundle.monetizationEvidence ?? false,
      metricProvenance: provenance,
    },
    provenance,
  };
}
