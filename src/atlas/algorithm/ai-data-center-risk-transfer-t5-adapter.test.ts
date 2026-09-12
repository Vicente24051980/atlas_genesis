import {
  evaluateDataCenterRiskTransferThroughT5,
  type DataCenterRiskTransferT5Input,
} from './ai-data-center-risk-transfer-t5-adapter';

const input: DataCenterRiskTransferT5Input = {
  dcrt: {
    ticker: 'DCRT_T5_CASE',
    roles: ['REINSURANCE_BROKER'],
    perils: ['NAT_CAT', 'BUSINESS_INTERRUPTION'],
    evidenceTraceable: true,
    evidenceIds: ['transaction', 'reported-economics'],
    protectionGapEvidence: true,
    dedicatedInsuranceCapacityProgram: true,
    dedicatedReinsuranceTransaction: true,
    dedicatedAlternativeCapitalTransaction: false,
    companyPositioningClaim: true,
    attributableTransaction: true,
    attributableRevenueMargin: true,
    multiPeriodCashRoicProof: false,
    riskAccumulationScore: 90,
    protectionGapScore: 90,
    dedicatedCapacityScore: 85,
    reinsuranceActivityScore: 80,
    alternativeCapitalEvidenceScore: 30,
    causalExposureScore: 90,
    transactionProofScore: 90,
    revenueMarginAttributionScore: 85,
    cashRoicConversionScore: 50,
    capitalLightCaptureScore: 85,
    perilModelabilityScore: 60,
    retainedTailRiskScore: 20,
    geographicClientConcentrationRiskScore: 40,
  },
  fcfCaptured: 120,
  ownCapitalAtRisk: 40,
};

describe('AI Data Center Risk Transfer -> T5 adapter', () => {
  it('uses the existing T5 CRTA contract after attributable E3 economics', () => {
    const result = evaluateDataCenterRiskTransferThroughT5(input);
    expect(result.dcrt.parentEconomicProofLevel).toBe('E3_REVENUE_MARGIN');
    expect(result.t5State).toBe('AVAILABLE');
    expect(result.crta).toBe(3);
    expect(result.downstreamAction).toBe('CONTINUE_STANDARD_ATLAS_STACK');
  });

  it('blocks T5 when only market formation is proven', () => {
    const result = evaluateDataCenterRiskTransferThroughT5({
      ...input,
      dcrt: {
        ...input.dcrt,
        attributableTransaction: false,
        attributableRevenueMargin: false,
        companyPositioningClaim: true,
      },
    });
    expect(result.dcrt.parentEconomicProofLevel).toBe('E1_MANAGEMENT_CLAIM');
    expect(result.t5State).toBe('NOT_AUTHORIZED');
    expect(result.crta).toBeNull();
    expect(result.downstreamAction).toBe('STOP_AT_R0_E1');
  });

  it('never turns a zero own-capital denominator into infinite advantage', () => {
    const result = evaluateDataCenterRiskTransferThroughT5({ ...input, ownCapitalAtRisk: 0 });
    expect(result.t5State).toBe('NO_CALCULABLE');
    expect(result.crta).toBeNull();
    expect(result.downstreamAction).toBe('STOP_AT_R0_E1');
  });
});
