import {
  evaluateGlobalCapexChain,
  scoreCapexConvergence,
  type GlobalCapexChainInput,
} from './global-capex-chain-omega';

const supplierBase: GlobalCapexChainInput = {
  ticker: 'PWR_CASE',
  edd: 3,
  role: 'PHYSICAL_INFRASTRUCTURE',
  evidenceTraceable: true,
  evidenceIds: ['filing-1', 'earnings-2', 'backlog-3'],
  economicProofLevel: 'E4_FCF_ROIC_MULTI_PERIOD',
  causalDirectnessScore: 96,
  bottleneckScarcityScore: 92,
  backlogVisibilityScore: 96,
  revenueTranslationScore: 90,
  economicCaptureScore: 86,
  customerDiversificationScore: 88,
  durationScore: 94,
  riverExposures: [
    { river: 'GRID_TRANSMISSION', fundingPool: 'UTILITY_GRID', materialityScore: 95, proofLevel: 'E4_FCF_ROIC_MULTI_PERIOD' },
    { river: 'DATA_CENTER_PHYSICAL', fundingPool: 'HYPERSCALER_AI', materialityScore: 90, proofLevel: 'E3_REVENUE_MARGIN' },
    { river: 'ELECTRIFICATION', fundingPool: 'INDUSTRIAL_RESHORING', materialityScore: 82, proofLevel: 'E3_REVENUE_MARGIN' },
    { river: 'GENERATION', fundingPool: 'POWER_GENERATION', materialityScore: 70, proofLevel: 'E2_ORDERS_CONTRACTS' },
  ],
  bottleneckPersistence: {
    replicationLeadTimeMonths: 42,
    marketStructure: 'OLIGOPOLY',
    qualificationSwitchingCostScore: 88,
    capacityExpansionDifficultyScore: 84,
    regulatoryPermittingBarrierScore: 80,
    technologySubstitutionRiskScore: 15,
  },
  fragility: {
    customerConcentrationRisk: 25,
    cyclicalityOverbuildRisk: 35,
    technologyObsolescenceRisk: 15,
    ownCapexBurdenRisk: 30,
    geopoliticalRegulatoryRisk: 25,
    executionSupplyChainRisk: 40,
    financingDependenceRisk: 20,
  },
};

describe('Global CAPEX Chain Omega v1', () => {
  it('classifies a proven multi-river physical bottleneck as a critical toll road', () => {
    const result = evaluateGlobalCapexChain(supplierBase);
    expect(result).toMatchObject({
      ticker: 'PWR_CASE',
      economicMode: 'CAPTURE',
      comparisonCohort: 'SUPPLIER_CAPTURE',
      evidenceGate: 'CONFIRMED',
      state: 'CRITICAL_TOLL_ROAD',
      action: 'ADVANCE_DEEP_RESEARCH',
    });
    expect(result.structuralOpportunityScore).toBeGreaterThanOrEqual(85);
    expect(result.capexConvergenceScore).toBeGreaterThan(60);
  });

  it('routes EDD-0 allocators to payback instead of comparing them with supplier capture', () => {
    const result = evaluateGlobalCapexChain({
      ...supplierBase,
      ticker: 'MSFT_CASE',
      edd: 0,
      role: 'ALLOCATOR_PAYER',
    });
    expect(result.economicMode).toBe('PAYBACK');
    expect(result.comparisonCohort).toBe('ALLOCATOR_PAYBACK');
    expect(result.reasons).toEqual(expect.arrayContaining([
      expect.stringContaining('EDD-0 allocator'),
    ]));
  });

  it('blocks narrative-only exposure even when raw structural scores look strong', () => {
    const result = evaluateGlobalCapexChain({
      ...supplierBase,
      ticker: 'NARRATIVE_CASE',
      evidenceIds: ['management-slide'],
      economicProofLevel: 'E1_MANAGEMENT_CLAIM',
    });
    expect(result).toMatchObject({
      evidenceGate: 'PROVISIONAL',
      state: 'EVIDENCE_PENDING',
      action: 'EVIDENCE_REQUIRED',
    });
  });

  it('does not count multiple rivers financed by the same pool as independent convergence', () => {
    const samePool = scoreCapexConvergence([
      { river: 'AI_COMPUTE', fundingPool: 'HYPERSCALER_AI', materialityScore: 95, proofLevel: 'E4_FCF_ROIC_MULTI_PERIOD' },
      { river: 'NETWORKING_OPTICS', fundingPool: 'HYPERSCALER_AI', materialityScore: 90, proofLevel: 'E3_REVENUE_MARGIN' },
      { river: 'DATA_CENTER_PHYSICAL', fundingPool: 'HYPERSCALER_AI', materialityScore: 85, proofLevel: 'E3_REVENUE_MARGIN' },
    ]);
    const independentPools = scoreCapexConvergence(supplierBase.riverExposures);
    expect(independentPools).toBeGreaterThan(samePool);
  });

  it('keeps structural opportunity separate from fragility', () => {
    const lowFragility = evaluateGlobalCapexChain(supplierBase);
    const highFragility = evaluateGlobalCapexChain({
      ...supplierBase,
      ticker: 'HIGH_FRAGILITY_CASE',
      fragility: {
        customerConcentrationRisk: 95,
        cyclicalityOverbuildRisk: 90,
        technologyObsolescenceRisk: 85,
        ownCapexBurdenRisk: 90,
        geopoliticalRegulatoryRisk: 90,
        executionSupplyChainRisk: 85,
        financingDependenceRisk: 95,
      },
    });
    expect(highFragility.structuralOpportunityScore).toBe(lowFragility.structuralOpportunityScore);
    expect(highFragility.capexFragilityScore).toBeGreaterThan(85);
    expect(highFragility.reasons).toEqual(expect.arrayContaining([
      expect.stringContaining('High CAPEX Fragility'),
    ]));
  });
});
