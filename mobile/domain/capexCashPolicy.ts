import { MetricOrigin, MetricProvenance, PrimaryFinancialYear, PrimaryStatementBundle } from './capexFinancialDerivation';

export type ExcessCashEligibilityReason =
  | 'DIRECT_EXCESS_CASH'
  | 'DERIVED_FROM_PUBLISHED_OPERATING_CASH_MINIMUM'
  | 'DERIVED_FROM_PUBLISHED_LIQUIDITY_POLICY'
  | 'OPERATING_CASH_MINIMUM_MISSING'
  | 'CASH_AVAILABLE_MISSING'
  | 'CURRENT_OR_PRIOR_EXCESS_CASH_MISSING';

export type CanonicalCashYear = PrimaryFinancialYear & {
  shortTermInvestments?: number | null;
  cashAndShortTermInvestments?: number | null;
  restrictedCash?: number | null;
  restrictedCashSourceRef?: string | null;
  operatingCashMinimum?: number | null;
  operatingCashMinimumOrigin?: Exclude<MetricOrigin, 'MISSING'> | null;
  operatingCashMinimumSourceRef?: string | null;
  excessCashOrigin?: Exclude<MetricOrigin, 'MISSING'> | null;
};

export type CanonicalCashBundle = Omit<PrimaryStatementBundle, 'years'> & {
  years: CanonicalCashYear[];
};

export type CashPolicyYearResult = {
  fiscalYear: number;
  cashAvailable: number | null;
  restrictedCash: number | null;
  unrestrictedCash: number | null;
  operatingCashMinimum: number | null;
  excessCash: number | null;
  excessCashEligibilityReason: ExcessCashEligibilityReason;
  provenance: Record<string, MetricProvenance>;
};

export type CashPolicyResult = {
  bundle: PrimaryStatementBundle;
  years: CashPolicyYearResult[];
  selectedVariantReason: ExcessCashEligibilityReason;
};

const direct = (field: string, year: number, sourceRef?: string | null): MetricProvenance => ({
  origin: 'DIRECT',
  formula: sourceRef ? `${field} from ${sourceRef}` : null,
  inputs: [`${field}:${year}`],
});

const derived = (formula: string, inputs: string[]): MetricProvenance => ({ origin: 'DERIVED', formula, inputs });
const missing = (inputs: string[]): MetricProvenance => ({ origin: 'MISSING', formula: null, inputs });

function resolveCashAvailable(year: CanonicalCashYear): { value: number | null; provenance: MetricProvenance } {
  if (year.cashAndShortTermInvestments != null) {
    return { value: year.cashAndShortTermInvestments, provenance: direct('cashAndShortTermInvestments', year.fiscalYear) };
  }
  if (year.cashAndEquivalents != null && year.shortTermInvestments != null) {
    return {
      value: year.cashAndEquivalents + year.shortTermInvestments,
      provenance: derived('cashAndEquivalents + shortTermInvestments', ['cashAndEquivalents', 'shortTermInvestments']),
    };
  }
  if (year.cashAndEquivalents != null) {
    return { value: year.cashAndEquivalents, provenance: direct('cashAndEquivalents', year.fiscalYear) };
  }
  return { value: null, provenance: missing(['cashAndEquivalents', 'shortTermInvestments', 'cashAndShortTermInvestments']) };
}

function resolveYear(year: CanonicalCashYear): CashPolicyYearResult {
  const provenance: Record<string, MetricProvenance> = {};
  const cash = resolveCashAvailable(year);
  provenance.cashAvailable = cash.provenance;

  const restrictedKnown = year.restrictedCash != null;
  const restrictedCash = restrictedKnown ? year.restrictedCash! : null;
  provenance.restrictedCash = restrictedKnown
    ? direct('restrictedCash', year.fiscalYear, year.restrictedCashSourceRef)
    : missing(['restrictedCash']);

  // Missing restricted cash never triggers an invented haircut. We retain cashAvailable and disclose no adjustment.
  const unrestrictedCash = cash.value == null ? null : restrictedKnown ? Math.max(0, cash.value - restrictedCash!) : cash.value;
  provenance.unrestrictedCash = unrestrictedCash == null
    ? missing(['cashAvailable'])
    : derived(
        restrictedKnown ? 'cashAvailable - restrictedCash' : 'cashAvailable; restrictedCash unavailable, no inferred adjustment',
        restrictedKnown ? ['cashAvailable', 'restrictedCash'] : ['cashAvailable'],
      );

  if (year.excessCash != null && year.excessCashOrigin === 'DIRECT') {
    provenance.operatingCashMinimum = year.operatingCashMinimum != null
      ? (year.operatingCashMinimumOrigin === 'DIRECT'
          ? direct('operatingCashMinimum', year.fiscalYear, year.operatingCashMinimumSourceRef)
          : derived('published operating cash policy', ['operatingCashMinimum']))
      : missing(['operatingCashMinimum']);
    provenance.excessCash = direct('excessCash', year.fiscalYear);
    return {
      fiscalYear: year.fiscalYear,
      cashAvailable: cash.value,
      restrictedCash,
      unrestrictedCash,
      operatingCashMinimum: year.operatingCashMinimum ?? null,
      excessCash: year.excessCash,
      excessCashEligibilityReason: 'DIRECT_EXCESS_CASH',
      provenance,
    };
  }

  if (cash.value == null || unrestrictedCash == null) {
    provenance.operatingCashMinimum = year.operatingCashMinimum == null ? missing(['operatingCashMinimum']) : derived('published operating cash policy', ['operatingCashMinimum']);
    provenance.excessCash = missing(['cashAvailable', 'operatingCashMinimum']);
    return {
      fiscalYear: year.fiscalYear,
      cashAvailable: cash.value,
      restrictedCash,
      unrestrictedCash,
      operatingCashMinimum: year.operatingCashMinimum ?? null,
      excessCash: null,
      excessCashEligibilityReason: 'CASH_AVAILABLE_MISSING',
      provenance,
    };
  }

  if (year.operatingCashMinimum == null || year.operatingCashMinimumOrigin == null) {
    provenance.operatingCashMinimum = missing(['published operating cash minimum or replicable liquidity policy']);
    provenance.excessCash = missing(['unrestrictedCash', 'operatingCashMinimum']);
    return {
      fiscalYear: year.fiscalYear,
      cashAvailable: cash.value,
      restrictedCash,
      unrestrictedCash,
      operatingCashMinimum: null,
      excessCash: null,
      excessCashEligibilityReason: 'OPERATING_CASH_MINIMUM_MISSING',
      provenance,
    };
  }

  provenance.operatingCashMinimum = year.operatingCashMinimumOrigin === 'DIRECT'
    ? direct('operatingCashMinimum', year.fiscalYear, year.operatingCashMinimumSourceRef)
    : derived('replicable operating liquidity policy published by issuer', ['publishedPolicyInputs']);
  const excessCash = Math.max(0, unrestrictedCash - year.operatingCashMinimum);
  provenance.excessCash = derived('max(0, unrestrictedCash - operatingCashMinimum)', ['unrestrictedCash', 'operatingCashMinimum']);

  return {
    fiscalYear: year.fiscalYear,
    cashAvailable: cash.value,
    restrictedCash,
    unrestrictedCash,
    operatingCashMinimum: year.operatingCashMinimum,
    excessCash,
    excessCashEligibilityReason: year.operatingCashMinimumOrigin === 'DIRECT'
      ? 'DERIVED_FROM_PUBLISHED_OPERATING_CASH_MINIMUM'
      : 'DERIVED_FROM_PUBLISHED_LIQUIDITY_POLICY',
    provenance,
  };
}

export function applyCanonicalCashPolicy(input: CanonicalCashBundle): CashPolicyResult {
  const resolvedYears = input.years.map(resolveYear);
  const years: PrimaryFinancialYear[] = input.years.map((year, index) => ({
    ...year,
    excessCash: resolvedYears[index].excessCash,
  }));

  const current = resolvedYears.at(-1);
  const prior = resolvedYears.at(-2);
  const selectedVariantReason: ExcessCashEligibilityReason =
    current?.excessCash != null && prior?.excessCash != null
      ? current.excessCashEligibilityReason
      : 'CURRENT_OR_PRIOR_EXCESS_CASH_MISSING';

  return {
    bundle: {
      ticker: input.ticker,
      years,
      externalFinancingRequired: input.externalFinancingRequired,
      capacityUnderConstruction: input.capacityUnderConstruction,
      monetizationEvidence: input.monetizationEvidence,
    },
    years: resolvedYears,
    selectedVariantReason,
  };
}
