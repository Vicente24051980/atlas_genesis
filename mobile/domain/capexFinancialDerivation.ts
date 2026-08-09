import { CapexProductivityInput } from './capexProductivity';

export type MetricOrigin = 'DIRECT' | 'DERIVED' | 'MISSING';
export type MetricProvenance = { origin: MetricOrigin; formula: string | null; inputs: string[] };

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

const derived = (value: number | null, formula: string, inputs: string[]): MetricProvenance =>
  value == null ? { origin: 'MISSING', formula: null, inputs } : { origin: 'DERIVED', formula, inputs };
const direct = (field: string, year: number): MetricProvenance => ({ origin: 'DIRECT', formula: null, inputs: [`${field}:${year}`] });
const div = (a: number | null, b: number | null) => a == null || b == null || b === 0 ? null : a / b;
const yoy = (a: number | null, b: number | null) => a == null || b == null || b === 0 ? null : (a / b - 1) * 100;
const cagr = (a: number | null, b: number | null, years: number) => a == null || b == null || a <= 0 || b <= 0 || years <= 0 ? null : (Math.pow(a / b, 1 / years) - 1) * 100;
const average = (values: Array<number | null>) => {
  const x = values.filter((v): v is number => v != null);
  return x.length ? x.reduce((s, v) => s + v, 0) / x.length : null;
};
const taxRate = (y: PrimaryFinancialYear) => {
  const r = div(y.incomeTaxExpense, y.incomeBeforeTaxes);
  return r == null ? null : Math.min(0.6, Math.max(0, r));
};
const nopat = (y: PrimaryFinancialYear) => y.operatingIncome == null || taxRate(y) == null ? null : y.operatingIncome * (1 - taxRate(y)!);
const investedCapital = (y: PrimaryFinancialYear) => y.equity == null || y.shortTermDebt == null || y.longTermDebt == null || y.cashAndEquivalents == null ? null : y.equity + y.shortTermDebt + y.longTermDebt - y.cashAndEquivalents;
const fcf = (y: PrimaryFinancialYear) => y.cashFlowFromOperations == null || y.capex == null ? null : y.cashFlowFromOperations - y.capex;
const netDebt = (y: PrimaryFinancialYear) => y.shortTermDebt == null || y.longTermDebt == null || y.cashAndEquivalents == null ? null : y.shortTermDebt + y.longTermDebt - y.cashAndEquivalents;
const ebitda = (y: PrimaryFinancialYear) => y.operatingIncome == null || y.depreciationAndAmortization == null ? null : y.operatingIncome + y.depreciationAndAmortization;

function roic(y: PrimaryFinancialYear, prior?: PrimaryFinancialYear): number | null {
  const n = nopat(y);
  const ic = investedCapital(y);
  const pic = prior ? investedCapital(prior) : null;
  if (n == null || ic == null) return null;
  const avgIc = pic == null ? ic : (ic + pic) / 2;
  return avgIc === 0 ? null : n / avgIc * 100;
}

export function deriveCapexProductivityFromPrimaryStatements(bundle: PrimaryStatementBundle): DerivedCapexBundle {
  const years = [...bundle.years].sort((a, b) => a.fiscalYear - b.fiscalYear);
  const current = years.at(-1);
  if (!current) throw new Error('At least one primary financial year is required.');
  const p1 = years.at(-2); const p2 = years.at(-3); const p3 = years.at(-4);
  const f = fcf(current); const f1 = p1 ? fcf(p1) : null; const f2 = p2 ? fcf(p2) : null; const f3 = p3 ? fcf(p3) : null;
  const fps = div(f, current.dilutedShares); const fps1 = p1 ? div(f1, p1.dilutedShares) : null; const fps3 = p3 ? div(f3, p3.dilutedShares) : null;
  const roics = years.map((y, i) => roic(y, i ? years[i - 1] : undefined));
  const ric = investedCapital(current); const ric1 = p1 ? investedCapital(p1) : null;
  const n = nopat(current); const n1 = p1 ? nopat(p1) : null;
  const dIC = ric != null && ric1 != null ? ric - ric1 : null; const dN = n != null && n1 != null ? n - n1 : null;
  const dRev = current.revenue != null && p1?.revenue != null ? current.revenue - p1.revenue : null;
  const dOp = current.operatingIncome != null && p1?.operatingIncome != null ? current.operatingIncome - p1.operatingIncome : null;
  const nd = netDebt(current); const nd1 = p1 ? netDebt(p1) : null;

  const values = {
    roicCurrent: roic(current, p1),
    roicAvg3y: average(roics.slice(-3)),
    roicAvg5y: average(roics.slice(-5)),
    incrementalRoic: dN == null || dIC == null || dIC === 0 ? null : dN / dIC * 100,
    capexGrowth: p1 ? yoy(current.capex, p1.capex) : null,
    capexCagr3y: p3 ? cagr(current.capex, p3.capex, current.fiscalYear - p3.fiscalYear) : null,
    revenueGrowth: p1 ? yoy(current.revenue, p1.revenue) : null,
    revenueCagr3y: p3 ? cagr(current.revenue, p3.revenue, current.fiscalYear - p3.fiscalYear) : null,
    operatingIncomeGrowth: p1 ? yoy(current.operatingIncome, p1.operatingIncome) : null,
    fcfGrowth: yoy(f, f1),
    fcfCagr3y: p3 ? cagr(f, f3, current.fiscalYear - p3.fiscalYear) : null,
    fcfPerShareGrowth: yoy(fps, fps1),
    fcfPerShareCagr3y: p3 ? cagr(fps, fps3, current.fiscalYear - p3.fiscalYear) : null,
    fcfToCapex: div(f, current.capex),
    fcfToCapexPrior1y: p1 ? div(f1, p1.capex) : null,
    fcfToCapexPrior2y: p2 ? div(f2, p2.capex) : null,
    assetTurnover: div(current.revenue, current.totalAssets),
    assetTurnoverPrior1y: p1 ? div(p1.revenue, p1.totalAssets) : null,
    assetTurnoverPrior2y: p2 ? div(p2.revenue, p2.totalAssets) : null,
    incrementalRevenueToInvestedCapital: div(dRev, dIC),
    incrementalOperatingProfitToInvestedCapital: div(dOp, dIC),
    capexToRevenue: div(current.capex, current.revenue),
    capexToCfo: div(current.capex, current.cashFlowFromOperations),
    netDebtToEbitda: div(nd, ebitda(current)),
    netDebtGrowth: yoy(nd, nd1),
    interestCoverage: div(current.operatingIncome, current.interestExpense),
    dilutedShareCagr: p3 ? cagr(current.dilutedShares, p3.dilutedShares, current.fiscalYear - p3.fiscalYear) : null,
    sbcToRevenue: div(current.stockBasedCompensation, current.revenue),
    sbcToFcf: div(current.stockBasedCompensation, f),
    incrementalOperatingMargin: div(dOp, dRev) == null ? null : div(dOp, dRev)! * 100,
  };

  const formulas: Record<keyof typeof values, [string, string[]]> = {
    roicCurrent: ['NOPAT / average invested capital', ['operatingIncome','incomeTaxExpense','incomeBeforeTaxes','equity','shortTermDebt','longTermDebt','cashAndEquivalents']],
    roicAvg3y: ['average annual derived ROIC, up to 3 years', ['annualROIC']], roicAvg5y: ['average annual derived ROIC, up to 5 years', ['annualROIC']],
    incrementalRoic: ['ΔNOPAT / Δinvested capital', ['NOPAT','investedCapital']], capexGrowth: ['YoY CAPEX growth', ['capex']], capexCagr3y: ['CAPEX CAGR', ['capex']],
    revenueGrowth: ['YoY Revenue growth', ['revenue']], revenueCagr3y: ['Revenue CAGR', ['revenue']], operatingIncomeGrowth: ['YoY Operating Income growth', ['operatingIncome']],
    fcfGrowth: ['YoY FCF growth; FCF=CFO-CAPEX', ['cashFlowFromOperations','capex']], fcfCagr3y: ['FCF CAGR; FCF=CFO-CAPEX', ['cashFlowFromOperations','capex']],
    fcfPerShareGrowth: ['YoY ((CFO-CAPEX)/diluted shares)', ['cashFlowFromOperations','capex','dilutedShares']], fcfPerShareCagr3y: ['FCF/share CAGR', ['cashFlowFromOperations','capex','dilutedShares']],
    fcfToCapex: ['(CFO-CAPEX)/CAPEX', ['cashFlowFromOperations','capex']], fcfToCapexPrior1y: ['prior-year FCF/CAPEX', ['cashFlowFromOperations','capex']], fcfToCapexPrior2y: ['two-year-prior FCF/CAPEX', ['cashFlowFromOperations','capex']],
    assetTurnover: ['Revenue / Total Assets', ['revenue','totalAssets']], assetTurnoverPrior1y: ['prior Revenue / Total Assets', ['revenue','totalAssets']], assetTurnoverPrior2y: ['prior2 Revenue / Total Assets', ['revenue','totalAssets']],
    incrementalRevenueToInvestedCapital: ['ΔRevenue / Δinvested capital', ['revenue','investedCapital']], incrementalOperatingProfitToInvestedCapital: ['ΔOperating Income / Δinvested capital', ['operatingIncome','investedCapital']],
    capexToRevenue: ['CAPEX / Revenue', ['capex','revenue']], capexToCfo: ['CAPEX / CFO', ['capex','cashFlowFromOperations']], netDebtToEbitda: ['Net Debt / EBITDA proxy', ['shortTermDebt','longTermDebt','cashAndEquivalents','operatingIncome','depreciationAndAmortization']],
    netDebtGrowth: ['YoY Net Debt growth', ['shortTermDebt','longTermDebt','cashAndEquivalents']], interestCoverage: ['Operating Income / Interest Expense', ['operatingIncome','interestExpense']],
    dilutedShareCagr: ['Diluted shares CAGR', ['dilutedShares']], sbcToRevenue: ['SBC / Revenue', ['stockBasedCompensation','revenue']], sbcToFcf: ['SBC / FCF', ['stockBasedCompensation','cashFlowFromOperations','capex']], incrementalOperatingMargin: ['ΔOperating Income / ΔRevenue', ['operatingIncome','revenue']],
  };
  const provenance: Record<string, MetricProvenance> = {};
  for (const [key, value] of Object.entries(values)) {
    const [formula, inputs] = formulas[key as keyof typeof values]; provenance[key] = derived(value, formula, inputs);
  }
  for (const [field, value] of Object.entries(current)) if (field !== 'fiscalYear' && value != null) provenance[`primary.${field}`] = direct(field, current.fiscalYear);

  return {
    input: { ticker: bundle.ticker, ...values, externalFinancingRequired: bundle.externalFinancingRequired ?? null, capacityUnderConstruction: bundle.capacityUnderConstruction ?? false, monetizationEvidence: bundle.monetizationEvidence ?? false },
    provenance,
  };
}
