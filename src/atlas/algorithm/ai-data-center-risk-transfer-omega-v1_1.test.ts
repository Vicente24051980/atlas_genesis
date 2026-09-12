import {
  deriveDcrtCompanyStageV11,
  deriveDcrtMarketStageV11,
  dcrtUtilizationRateV11,
  dcrtModelabilityGapV11,
  evaluateDcrtV11,
  type DcrtV11Input,
} from './ai-data-center-risk-transfer-omega-v1_1';

const base: DcrtV11Input = {
  phase: 'OPERATION',
  role: 'BROKER',
  namedProduct: true,
  protectionGapProven: true,
  dedicatedCapacityProgram: true,
  dedicatedTreaty: false,
  dedicatedFacilityReinsuranceBacking: false,
  dedicatedCatBond: false,
  dedicatedSidecar: false,
  dedicatedCollateralizedReinsurance: false,
  dedicatedParametricAlternativeCapital: false,
  genericFacultativeOnly: true,
  companyPositioning: true,
  attributableTransaction: false,
  attributableTransactionSourceCount: 0,
  disclosedByCompanyOrFiling: false,
  transactionTivUsd: null,
  transactionPremiumUsd: null,
  transactionFeeUsd: null,
  materialityOverride: false,
  quantitativeTractionMetric: false,
  attributableRevenueMargin: false,
  multiPeriodFcfRoic: false,
  announcedCapacityUsd: 5_000_000_000,
  boundLimitUsd: null,
  premiumInvoicedOrEconomicEquivalent: false,
  policyOrContractEffective: false,
  attributableFcf: null,
  ownCapitalAtRisk: null,
  operatingCapitalEmployed: null,
  natCatModelabilityGap: 40,
  nonNatCatModelabilityGap: 60,
  retainedTailRisk: 20,
  geographicConcentrationRisk: 50,
  cbiMaterial: false,
  cbiDistanceSublimitStrict: true,
  cbiWaitingPeriodStrict: true,
  cbiLimitStrict: true,
  primaryDeductibleAdequacy: null,
  primaryAttritionalLossFrequency: null,
  primaryBelowReinsuranceAttachmentShare: null,
};

describe('DCRT Omega v1.1 HARDENED', () => {
  it('keeps ordinary facultative reinsurance below M3', () => {
    expect(deriveDcrtMarketStageV11(base)).toBe('M2');
  });

  it('promotes dedicated treaty or facility backing to M3', () => {
    expect(deriveDcrtMarketStageV11({ ...base, dedicatedTreaty: true })).toBe('M3');
    expect(deriveDcrtMarketStageV11({ ...base, dedicatedFacilityReinsuranceBacking: true })).toBe('M3');
  });

  it('allows dedicated parametric alternative capital to qualify M4', () => {
    expect(deriveDcrtMarketStageV11({ ...base, dedicatedParametricAlternativeCapital: true })).toBe('M4');
  });

  it('blocks immaterial or untraceable transactions from C2', () => {
    expect(deriveDcrtCompanyStageV11({ ...base, attributableTransaction: true, transactionTivUsd: 5_000_000 })).toBe('C1');
  });

  it('allows C2 when transaction is traceable and material', () => {
    expect(deriveDcrtCompanyStageV11({
      ...base,
      attributableTransaction: true,
      attributableTransactionSourceCount: 2,
      transactionTivUsd: 50_000_000,
    })).toBe('C2');
  });

  it('requires quantitative traction before C3', () => {
    const c2 = {
      ...base,
      attributableTransaction: true,
      attributableTransactionSourceCount: 2,
      transactionTivUsd: 50_000_000,
      attributableRevenueMargin: true,
    };
    expect(deriveDcrtCompanyStageV11(c2)).toBe('C2');
    expect(deriveDcrtCompanyStageV11({ ...c2, quantitativeTractionMetric: true })).toBe('C3');
  });

  it('defines utilization only when bound, invoiced and effective', () => {
    expect(dcrtUtilizationRateV11(base)).toBeNull();
    expect(dcrtUtilizationRateV11({
      ...base,
      boundLimitUsd: 1_000_000_000,
      premiumInvoicedOrEconomicEquivalent: true,
      policyOrContractEffective: true,
    })).toBeCloseTo(0.2);
  });

  it('penalizes weak material CBI controls', () => {
    expect(dcrtModelabilityGapV11({
      ...base,
      cbiMaterial: true,
      cbiDistanceSublimitStrict: false,
    })).toBeGreaterThanOrEqual(75);
  });

  it('blocks premium and capex double count', () => {
    const result = evaluateDcrtV11(base);
    expect(result.premiumDoubleCount).toBe('BLOCKED');
    expect(result.capexDoubleCount).toBe('BLOCKED');
  });

  it('uses capital-light route without fabricating infinite CRTA', () => {
    const result = evaluateDcrtV11({
      ...base,
      attributableTransaction: true,
      attributableTransactionSourceCount: 2,
      transactionTivUsd: 50_000_000,
      attributableRevenueMargin: true,
      quantitativeTractionMetric: true,
      attributableFcf: 100,
      operatingCapitalEmployed: 25,
    });
    expect(result.companyStage).toBe('C3');
    expect(result.t5Route).toBe('CAPITAL_LIGHT_NON_RISK_BEARING');
    expect(result.crta).toBeNull();
    expect(result.capitalLightEfficiency).toBe(4);
  });

  it('keeps risk-bearing CRTA no-calculable when own capital is unknown', () => {
    const result = evaluateDcrtV11({
      ...base,
      role: 'REINSURER',
      attributableTransaction: true,
      attributableTransactionSourceCount: 2,
      transactionPremiumUsd: 2_000_000,
      attributableRevenueMargin: true,
      quantitativeTractionMetric: true,
      attributableFcf: 100,
      ownCapitalAtRisk: null,
    });
    expect(result.t5Route).toBe('RISK_BEARING_CRTA');
    expect(result.crta).toBeNull();
  });
});
