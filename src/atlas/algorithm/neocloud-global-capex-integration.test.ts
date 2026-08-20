import { type GlobalCapexChainInput } from './global-capex-chain-omega';
import { evaluateNeocloudGlobalCapexChain } from './neocloud-global-capex-integration';
import { type NeocloudCustomerAcceptanceInput } from './neocloud-customer-acceptance-gate-omega';

const capexBase: GlobalCapexChainInput = {
  ticker: 'NEOCLOUD_CASE',
  edd: 1,
  role: 'DIRECT_COMPUTE_CONNECTIVITY',
  evidenceTraceable: true,
  evidenceIds: ['contract', 'deployment', 'revenue'],
  economicProofLevel: 'E4_FCF_ROIC_MULTI_PERIOD',
  causalDirectnessScore: 90,
  bottleneckScarcityScore: 80,
  backlogVisibilityScore: 95,
  revenueTranslationScore: 75,
  economicCaptureScore: 70,
  customerDiversificationScore: 45,
  durationScore: 85,
  riverExposures: [
    {
      river: 'AI_COMPUTE',
      fundingPool: 'HYPERSCALER_AI',
      materialityScore: 95,
      proofLevel: 'E2_ORDERS_CONTRACTS',
    },
  ],
  bottleneckPersistence: {
    replicationLeadTimeMonths: 24,
    marketStructure: 'CONCENTRATED',
    qualificationSwitchingCostScore: 65,
    capacityExpansionDifficultyScore: 80,
    regulatoryPermittingBarrierScore: 55,
    technologySubstitutionRiskScore: 50,
  },
  fragility: {
    customerConcentrationRisk: 85,
    cyclicalityOverbuildRisk: 70,
    technologyObsolescenceRisk: 75,
    ownCapexBurdenRisk: 90,
    geopoliticalRegulatoryRisk: 40,
    executionSupplyChainRisk: 75,
    financingDependenceRisk: 90,
  },
};

const acceptanceBase: NeocloudCustomerAcceptanceInput = {
  ticker: 'NEOCLOUD_CASE',
  evidenceTraceable: true,
  evidenceIds: ['contract', 'deployment'],
  contracted: true,
  capacitySecured: true,
  hardwareReady: true,
  deployed: true,
  acceptanceStatus: 'PENDING',
  slaPassed: null,
  escrowReleased: null,
  revenueRecognizedFromAcceptedDeployment: false,
  marginProvenOnAcceptedDeployment: false,
  multiPeriodCashReturnProven: false,
  materialAcceptanceDelay: false,
  contractRenegotiatedOrCancelled: false,
};

describe('Neocloud Customer Acceptance Gate + Global CAPEX integration', () => {
  it('caps a requested E4 at E2 when the cluster is deployed but not accepted', () => {
    const result = evaluateNeocloudGlobalCapexChain({
      capex: capexBase,
      acceptance: acceptanceBase,
    });

    expect(result.acceptance.stage).toBe('N3_DEPLOYED');
    expect(result.appliedEconomicProofLevel).toBe('E2_ORDERS_CONTRACTS');
    expect(result.globalCapex.economicProofLevel).toBe('E2_ORDERS_CONTRACTS');
    expect(result.globalCapex.reasons).toEqual(expect.arrayContaining([
      expect.stringContaining('Customer Acceptance Gate capped Economic Proof'),
    ]));
  });

  it('still caps an accepted cluster at E2 until revenue and margin are proven', () => {
    const result = evaluateNeocloudGlobalCapexChain({
      capex: capexBase,
      acceptance: {
        ...acceptanceBase,
        acceptanceStatus: 'ACCEPTED',
        slaPassed: true,
        escrowReleased: true,
      },
    });

    expect(result.acceptance.stage).toBe('N4_CUSTOMER_ACCEPTED');
    expect(result.appliedEconomicProofLevel).toBe('E2_ORDERS_CONTRACTS');
  });

  it('permits E3 once accepted deployment converts to recognized revenue and margin', () => {
    const result = evaluateNeocloudGlobalCapexChain({
      capex: {
        ...capexBase,
        economicProofLevel: 'E3_REVENUE_MARGIN',
      },
      acceptance: {
        ...acceptanceBase,
        acceptanceStatus: 'ACCEPTED',
        slaPassed: true,
        revenueRecognizedFromAcceptedDeployment: true,
        marginProvenOnAcceptedDeployment: true,
      },
    });

    expect(result.acceptance.stage).toBe('N6_MARGIN_PROVEN');
    expect(result.appliedEconomicProofLevel).toBe('E3_REVENUE_MARGIN');
  });
});
