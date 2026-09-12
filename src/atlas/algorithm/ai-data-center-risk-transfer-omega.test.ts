import {
  deriveDataCenterRiskTransferMarketStage,
  evaluateDataCenterRiskTransfer,
  type DataCenterRiskTransferInput,
} from './ai-data-center-risk-transfer-omega';

const baseCase: DataCenterRiskTransferInput = {
  ticker: 'DCRT_CASE',
  roles: ['REINSURANCE_BROKER', 'CAPITAL_MARKETS_STRUCTURER'],
  perils: ['NAT_CAT', 'BUSINESS_INTERRUPTION', 'POWER_OUTAGE'],
  evidenceTraceable: true,
  evidenceIds: ['primary-source-1', 'transaction-source-2'],

  protectionGapEvidence: true,
  dedicatedInsuranceCapacityProgram: true,
  dedicatedReinsuranceTransaction: false,
  dedicatedAlternativeCapitalTransaction: false,

  companyPositioningClaim: true,
  attributableTransaction: false,
  attributableRevenueMargin: false,
  multiPeriodCashRoicProof: false,

  riskAccumulationScore: 90,
  protectionGapScore: 88,
  dedicatedCapacityScore: 80,
  reinsuranceActivityScore: 60,
  alternativeCapitalEvidenceScore: 20,

  causalExposureScore: 75,
  transactionProofScore: 10,
  revenueMarginAttributionScore: 0,
  cashRoicConversionScore: 0,
  capitalLightCaptureScore: 80,

  perilModelabilityScore: 55,
  retainedTailRiskScore: 25,
  geographicClientConcentrationRiskScore: 60,
};

describe('AI Data Center Risk Transfer Omega v1', () => {
  it('classifies dedicated capacity formation without inventing company transaction proof', () => {
    const result = evaluateDataCenterRiskTransfer(baseCase);
    expect(result.marketStage).toBe('DCRT_M2_DEDICATED_CAPACITY_FORMING');
    expect(result.companyProof).toBe('DCRT_C1_COMPANY_POSITIONING');
    expect(result.parentEconomicProofLevel).toBe('E1_MANAGEMENT_CLAIM');
    expect(result.evidenceGate).toBe('PROVISIONAL');
    expect(result.action).toBe('WATCH');
    expect(result.hunterClasses).toEqual(['H6_SECOND_ORDER_CAPTOR']);
  });

  it('does not count data-center risk transfer as a new independent CAPEX funding pool', () => {
    const result = evaluateDataCenterRiskTransfer(baseCase);
    expect(result.independentFundingPoolCredit).toBe('DERIVED_DO_NOT_COUNT_AS_NEW_POOL');
    expect(result.edd).toBe(5);
  });

  it('requires a dedicated data-center alternative-capital transaction for M4', () => {
    expect(
      deriveDataCenterRiskTransferMarketStage({
        protectionGapEvidence: true,
        dedicatedInsuranceCapacityProgram: true,
        dedicatedReinsuranceTransaction: true,
        dedicatedAlternativeCapitalTransaction: false,
      }),
    ).toBe('DCRT_M3_REINSURANCE_TRANSFER_ACTIVE');
  });

  it('promotes an attributable transaction to E2 but not to revenue proof', () => {
    const result = evaluateDataCenterRiskTransfer({
      ...baseCase,
      attributableTransaction: true,
      transactionProofScore: 90,
    });
    expect(result.companyProof).toBe('DCRT_C2_ATTRIBUTABLE_TRANSACTION');
    expect(result.parentEconomicProofLevel).toBe('E2_ORDERS_CONTRACTS');
    expect(result.evidenceGate).toBe('CONFIRMED');
    expect(result.action).toBe('ADVANCE_DEEP_RESEARCH');
    expect(result.hunterClasses).toEqual(['H6_SECOND_ORDER_CAPTOR', 'H5_CONTRACTUAL_CAPTOR']);
  });

  it('hands attributable revenue/margin to the existing T5 contract before standard ATLAS assessment and FRU-MATH', () => {
    const result = evaluateDataCenterRiskTransfer({
      ...baseCase,
      attributableTransaction: true,
      attributableRevenueMargin: true,
      transactionProofScore: 90,
      revenueMarginAttributionScore: 85,
    });
    expect(result.companyProof).toBe('DCRT_C3_ATTRIBUTABLE_REVENUE_MARGIN');
    expect(result.parentEconomicProofLevel).toBe('E3_REVENUE_MARGIN');
    expect(result.action).toBe('HANDOFF_TO_T5');
  });

  it('rejects a broken economic-proof chain', () => {
    expect(() =>
      evaluateDataCenterRiskTransfer({
        ...baseCase,
        attributableRevenueMargin: true,
        attributableTransaction: false,
      }),
    ).toThrow('dcrt_revenue_margin_requires_attributable_transaction');
  });

  it('rejects alternative-capital promotion without protection-gap evidence', () => {
    expect(() =>
      evaluateDataCenterRiskTransfer({
        ...baseCase,
        protectionGapEvidence: false,
        dedicatedAlternativeCapitalTransaction: true,
      }),
    ).toThrow('dcrt_alternative_capital_requires_protection_gap_evidence');
  });

  it('keeps high tail-risk fragility separate from opportunity', () => {
    const result = evaluateDataCenterRiskTransfer({
      ...baseCase,
      perilModelabilityScore: 20,
      retainedTailRiskScore: 95,
      geographicClientConcentrationRiskScore: 90,
    });
    expect(result.marketOpportunityScore).toBeGreaterThan(0);
    expect(result.riskTransferFragilityScore).toBeGreaterThanOrEqual(70);
    expect(result.reasons).toEqual(expect.arrayContaining([
      expect.stringContaining('fragility is high'),
    ]));
  });
});
