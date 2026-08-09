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
  excessCash?: number | null;
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

export type RoicVariants = {
  selected: 'ADJUSTED_EXCESS_CASH' | 'FINANCED_CAPITAL' | 'MISSING';
  financedCurrent: number | null;
  adjustedCurrent: number | null;
  financedIncremental: number | null;
  adjustedIncremental: number | null;
};

export type DerivedCapexBundle = {
  input: CapexProductivityInput;
  provenance: Record<string, MetricProvenance>;
  roicVariants: RoicVariants;
};

const derived = (value: number | null, formula: string, inputs: string[]): MetricProvenance =>
  value == null ? { origin: 'MISSING', formula: null, inputs } : { origin: 'DERIVED', formula, inputs };
const direct = (field: string, year: number): MetricProvenance => ({ origin: 'DIRECT', formula: null, inputs: [`${field}:${year}`] });
const missing = (inputs: string[]): MetricProvenance => ({ origin: 'MISSING', formula: null, inputs });
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
const financedCapital = (y: PrimaryFinancialYear) => y.equity == null || y.shortTermDebt == null || y.longTermDebt == null ? null : y.equity + y.shortTermDebt + y.longTermDebt;
const adjustedCapital = (y: PrimaryFinancialYear) => financedCapital(y) == null || y.excessCash == null ? null : financedCapital(y)! - y.excessCash;
const fcf = (y: PrimaryFinancialYear) => y.cashFlowFromOperations == null || y.capex == null ? null : y.cashFlowFromOperations - y.capex;
const netDebt = (y: PrimaryFinancialYear) => y.shortTermDebt == null || y.longTermDebt == null || y.cashAndEquivalents == null ? null : y.shortTermDebt + y.longTermDebt - y.cashAndEquivalents;
const ebitda = (y: PrimaryFinancialYear) => y.operatingIncome == null || y.depreciationAndAmortization == null ? null : y.operatingIncome + y.depreciationAndAmortization;

function roicUsing(y: PrimaryFinancialYear, prior: PrimaryFinancialYear | undefined, capitalFn: (x: PrimaryFinancialYear) => number | null): number | null {
  const n = nopat(y);
  const ic = capitalFn(y);
  const pic = prior ? capitalFn(prior) : null;
  if (n == null || ic == null || pic == null) return null;
  const avgIc = (ic + pic) / 2;
  return avgIc === 0 ? null : n / avgIc * 100;
}

function incrementalRoicUsing(current: PrimaryFinancialYear, prior: PrimaryFinancialYear | undefined, capitalFn: (x: PrimaryFinancialYear) => number | null): number | null {
  if (!prior) return null;
  const n = nopat(current); const pn = nopat(prior);
  const ic = capitalFn(current); const pic = capitalFn(prior);
  if (n == null || pn == null || ic == null || pic == null || ic === pic) return null;
  return (n - pn) / (ic - pic) * 100;
}

export function deriveCapexProductivityFromPrimaryStatements(bundle: PrimaryStatementBundle): DerivedCapexBundle {
  const years = [...bundle.years].sort((a, b) => a.fiscalYear - b.fiscalYear);
  const current = years.at(-1);
  if (!current) throw new Error('At least one primary financial year is required.');
  const p1 = years.at(-2); const p2 = years.at(-3); const p3 = years.at(-4);
  const f = fcf(current); const f1 = p1 ? fcf(p1) : null; const f2 = p2 ? fcf(p2) : null; const f3 = p3 ? fcf(p3) : null;
  const fps = div(f, current.dilutedShares); const fps1 = p1 ? div(f1, p1.dilutedShares) : null; const fps3 = p3 ? div(f3, p3.dilutedShares) : null;

  const financedRoics = years.map((y, i) => roicUsing(y, i ? years[i - 1] : undefined, financedCapital));
  const adjustedRoics = years.map((y, i) => roicUsing(y, i ? years[i - 1] : undefined, adjustedCapital));
  const adjustedAvailable = current.excessCash != null && p1?.excessCash != null;
  const selectedRoics = adjustedAvailable ? adjustedRoics : financedRoics;
  const selectedCapital = adjustedAvailable ? adjustedCapital : financedCapital;
  const selectedVariant: RoicVariants['selected'] = adjustedAvailable ? 'ADJUSTED_EXCESS_CASH' : financedCapital(current) != null ? 'FINANCED_CAPITAL' : 'MISSING';

  const ric = selectedCapital(current); const ric1 = p1 ? selectedCapital(p1) : null;
  const dIC = ric != null && ric1 != null ? ric - ric1 : null;
  const dRev = current.revenue != null && p1?.revenue != null ? current.revenue - p1.revenue : null;
  const dOp = current.operatingIncome != null && p1?.operatingIncome != null ? current.operatingIncome - p1.operatingIncome : null;
  const nd = netDebt(current); const nd1 = p1 ? netDebt(p1) : null;

  const financedIncremental = incrementalRoicUsing(current, p1, financedCapital);
  const adjustedIncremental = incrementalRoicUsing(current, p1, adjustedCapital);
  const selectedIncremental = adjustedAvailable ? adjustedIncremental : financedIncremental;

  const values = {
    roicCurrent: selectedRoics.at(-1) ?? null,
    roicAvg3y: average(selectedRoics.slice(-3)),
    roicAvg5y: average(selectedRoics.slice(-5)),
    incrementalRoic: selectedIncremental,
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

  const provenance: Record<string, MetricProvenance> = {};
  const roicInputs = adjustedAvailable
    ? ['operatingIncome','incomeTaxExpense','incomeBeforeTaxes','equity','shortTermDebt','longTermDebt','excessCash']
    : ['operatingIncome','incomeTaxExpense','incomeBeforeTaxes','equity','shortTermDebt','longTermDebt'];
  provenance.roicCurrent = derived(values.roicCurrent, adjustedAvailable ? 'NOPAT / average (Equity + Debt - excessCash)' : 'NOPAT / average (Equity + Debt)', roicInputs);
  provenance.roicAvg3y = derived(values.roicAvg3y, 'average selected annual ROIC, up to 3 years', ['annualROIC']);
  provenance.roicAvg5y = derived(values.roicAvg5y, 'average selected annual ROIC, up to 5 years', ['annualROIC']);
  provenance.incrementalRoic = derived(values.incrementalRoic, adjustedAvailable ? 'ΔNOPAT / Δ(Equity + Debt - excessCash)' : 'ΔNOPAT / Δ(Equity + Debt)', roicInputs);
  provenance['roic.financedCurrent'] = derived(financedRoics.at(-1) ?? null, 'NOPAT / average (Equity + Debt)', ['operatingIncome','taxProxy','equity','shortTermDebt','longTermDebt']);
  provenance['roic.adjustedCurrent'] = adjustedAvailable ? derived(adjustedRoics.at(-1) ?? null, 'NOPAT / average (Equity + Debt - excessCash)', [...roicInputs]) : missing(['excessCash']);
  provenance['roic.financedIncremental'] = derived(financedIncremental, 'ΔNOPAT / Δ(Equity + Debt)', ['NOPAT','equity','shortTermDebt','longTermDebt']);
  provenance['roic.adjustedIncremental'] = adjustedAvailable ? derived(adjustedIncremental, 'ΔNOPAT / Δ(Equity + Debt - excessCash)', ['NOPAT','equity','shortTermDebt','longTermDebt','excessCash']) : missing(['excessCash']);
  provenance['roic.selectedVariant'] = { origin: selectedVariant === 'MISSING' ? 'MISSING' : 'DERIVED', formula: selectedVariant, inputs: adjustedAvailable ? ['excessCash'] : ['financedCapital'] };

  const simpleFormulas: Record<string, [string, string[]]> = {
    capexGrowth: ['YoY CAPEX growth', ['capex']], capexCagr3y: ['CAPEX CAGR', ['capex']], revenueGrowth: ['YoY Revenue growth', ['revenue']], revenueCagr3y: ['Revenue CAGR', ['revenue']], operatingIncomeGrowth: ['YoY Operating Income growth', ['operatingIncome']],
    fcfGrowth: ['YoY FCF growth; FCF=CFO-CAPEX', ['cashFlowFromOperations','capex']], fcfCagr3y: ['FCF CAGR; FCF=CFO-CAPEX', ['cashFlowFromOperations','capex']], fcfPerShareGrowth: ['YoY ((CFO-CAPEX)/diluted shares)', ['cashFlowFromOperations','capex','dilutedShares']], fcfPerShareCagr3y: ['FCF/share CAGR', ['cashFlowFromOperations','capex','dilutedShares']],
    fcfToCapex: ['(CFO-CAPEX)/CAPEX', ['cashFlowFromOperations','capex']], fcfToCapexPrior1y: ['prior-year FCF/CAPEX', ['cashFlowFromOperations','capex']], fcfToCapexPrior2y: ['two-year-prior FCF/CAPEX', ['cashFlowFromOperations','capex']], assetTurnover: ['Revenue / Total Assets', ['revenue','totalAssets']], assetTurnoverPrior1y: ['prior Revenue / Total Assets', ['revenue','totalAssets']], assetTurnoverPrior2y: ['prior2 Revenue / Total Assets', ['revenue','totalAssets']],
    incrementalRevenueToInvestedCapital: ['ΔRevenue / Δselected invested capital', ['revenue','investedCapital']], incrementalOperatingProfitToInvestedCapital: ['ΔOperating Income / Δselected invested capital', ['operatingIncome','investedCapital']], capexToRevenue: ['CAPEX / Revenue', ['capex','revenue']], capexToCfo: ['CAPEX / CFO', ['capex','cashFlowFromOperations']], netDebtToEbitda: ['Net Debt / EBITDA proxy', ['shortTermDebt','longTermDebt','cashAndEquivalents','operatingIncome','depreciationAndAmortization']], netDebtGrowth: ['YoY Net Debt growth', ['shortTermDebt','longTermDebt','cashAndEquivalents']], interestCoverage: ['Operating Income / Interest Expense', ['operatingIncome','interestExpense']], dilutedShareCagr: ['Diluted shares CAGR', ['dilutedShares']], sbcToRevenue: ['SBC / Revenue', ['stockBasedCompensation','revenue']], sbcToFcf: ['SBC / FCF', ['stockBasedCompensation','cashFlowFromOperations','capex']], incrementalOperatingMargin: ['ΔOperating Income / ΔRevenue', ['operatingIncome','revenue']],
  };
  for (const [key, spec] of Object.entries(simpleFormulas)) provenance[key] = derived(values[key as keyof typeof values] as number | null, spec[0], spec[1]);
  for (const [field, value] of Object.entries(current)) if (field !== 'fiscalYear' && value != null) provenance[`primary.${field}`] = direct(field, current.fiscalYear);
  if (current.excessCash == null) provenance['primary.excessCash'] = missing(['excessCash']);

  return {
    input: { ticker: bundle.ticker, ...values, externalFinancingRequired: bundle.externalFinancingRequired ?? null, capacityUnderConstruction: bundle.capacityUnderConstruction ?? false, monetizationEvidence: bundle.monetizationEvidence ?? false },
    provenance,
    roicVariants: {
      selected: selectedVariant,
      financedCurrent: financedRoics.at(-1) ?? null,
      adjustedCurrent: adjustedRoics.at(-1) ?? null,
      financedIncremental,
      adjustedIncremental,
    },
  };
}
