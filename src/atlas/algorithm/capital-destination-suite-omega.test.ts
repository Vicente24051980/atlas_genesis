import { evaluateDestinationOfMoney, type DestinationInput } from './destination-of-money-omega';
import { evaluateMemoryScarcity } from './memory-scarcity-omega';
import { evaluateCapitalMigration, evaluateFalseAiDisruption, evaluateCapitalMigrationFalseAiConvergence } from './capital-migration-false-ai-omega';
import { evaluateLiquiditySurvival, evaluateCrowdingRisk, detectForcedLiquidationDislocation } from './liquidity-crowding-omega';
import { evaluateMacroOptionsLiquidity } from './macro-options-liquidity-omega';
import { evaluateHomebuilderAsymmetry, evaluateBuffettQuality } from './homebuilders-buffett-quality-omega';
import { evaluateCapexCaptureElasticity } from './capex-capture-elasticity-omega';

const destinationCase: DestinationInput = {
  destination: 'COOLING_THERMAL',
  destinationMode: 'REAL_ECONOMY',
  evidenceTraceable: true,
  evidenceIds: ['flow', 'orders', 'fcf', 'capex'],
  evidenceTypes: ['PUBLIC_FUND_FLOW', 'CORPORATE_CAPEX', 'ORDERS_BACKLOG_CONTRACTS', 'REVENUE_MARGIN_FCF'],
  publicFlowScore: 70,
  privateCapitalScore: 55,
  corporateCapexScore: 92,
  sovereignFiscalScore: 55,
  creditFundingScore: 82,
  ordersBacklogScore: 94,
  fcfEconomicProofScore: 90,
  revisionsScore: 82,
  relativeStrengthScore: 80,
  crowdingRiskScore: 60,
  fundingFragilityScore: 35,
  valuationExpectationRiskScore: 70,
  flowAccelerationScore: 75,
  fundamentalAccelerationScore: 85,
};

describe('ATLAS capital destination engine suite', () => {
  it('confirms a multi-source real-economy destination only when economic proof is present', () => {
    const result = evaluateDestinationOfMoney(destinationCase);
    expect(result.evidenceGate).toBe('CONFIRMED');
    expect(['R3_CONFIRMED_RECEIVER', 'R4_ACCELERATING']).toContain(result.stage);
    expect(result.action).toBe('PRIORITIZE_RESEARCH');
  });

  it('does not let price alone confirm a real-economy destination', () => {
    const result = evaluateDestinationOfMoney({
      ...destinationCase,
      evidenceIds: ['price'],
      evidenceTypes: ['PRICE_RELATIVE_STRENGTH'],
      corporateCapexScore: 20,
      ordersBacklogScore: 20,
      fcfEconomicProofScore: 20,
    });
    expect(result.evidenceGate).toBe('PROVISIONAL');
  });

  it('requires verified fund-flow evidence for an asset-class destination', () => {
    const result = evaluateDestinationOfMoney({
      ...destinationCase,
      destination: 'BONDS',
      destinationMode: 'ASSET_CLASS',
      evidenceIds: ['lipper-flow', 'bond-performance'],
      evidenceTypes: ['PUBLIC_FUND_FLOW', 'PRICE_RELATIVE_STRENGTH'],
      publicFlowScore: 95,
      creditFundingScore: 85,
      sovereignFiscalScore: 70,
      revisionsScore: 65,
      relativeStrengthScore: 72,
      flowAccelerationScore: 85,
      fundamentalAccelerationScore: 50,
      crowdingRiskScore: 45,
    });
    expect(result.evidenceGate).toBe('CONFIRMED');
    expect(result.structuralDestinationScore).toBeGreaterThan(75);
  });

  it('recognizes real memory scarcity but keeps crowding separate', () => {
    const result = evaluateMemoryScarcity({
      ticker: 'MEM', evidenceTraceable: true, evidenceIds: ['pricing', 'capacity', 'fcf'], aiDemandElasticityScore: 90, hbmDramNandPricingScore: 92, capacityTightnessScore: 90, contractDurationPrepaymentScore: 80, serverMixShiftScore: 88, inventoryHealthScore: 76, fcfConversionScore: 86, supplyResponseDisciplineScore: 78, customerConcentrationRiskScore: 55, technologySubstitutionRiskScore: 35, crowdingRiskScore: 85,
    });
    expect(result.state).toBe('SCARCITY_CONFIRMED');
    expect(result.action).toBe('WATCH');
  });

  it('detects software capital migration and false AI disruption convergence', () => {
    const migration = evaluateCapitalMigration({ ticker: 'SFTW', evidenceTraceable: true, evidenceIds: ['pe', 'fcf', 'buyback'], valuationGapScore: 82, privateEquityStrategicActivityScore: 90, fcfQualityScore: 88, buybackNetShareReductionScore: 80, insiderStrategicActivityScore: 65, estimateRevisionScore: 65, publicFlowConfirmationScore: 40, structuralDisruptionRiskScore: 35 });
    const falseAi = evaluateFalseAiDisruption({ ticker: 'SFTW', evidenceTraceable: true, evidenceIds: ['retention', 'fcf', 'ai'], recurringRevenueQualityScore: 92, switchingCostSystemOfRecordScore: 90, fcfPerShareTrendScore: 85, retentionScore: 88, aiMonetizationScore: 75, sbcShareCountDisciplineScore: 72, grossMarginResilienceScore: 88, valuationCompressionScore: 82, organicGrowthResilienceScore: 78, actualAiSubstitutionRiskScore: 35 });
    const convergence = evaluateCapitalMigrationFalseAiConvergence(migration, falseAi);
    expect(['STRONG_MIGRATION', 'EARLY_MIGRATION']).toContain(migration.state);
    expect(falseAi.state).toBe('FALSE_DISRUPTION_CONFIRMED');
    expect(convergence.convergence).toBe('MULTI_MOTOR_CONVERGENCE');
  });

  it('identifies leverage structures that cannot survive thesis volatility', () => {
    const result = evaluateLiquiditySurvival({ id: 'FUND', evidenceTraceable: true, leverageScore: 20, marginFundingResilienceScore: 15, liquidityDepthScore: 55, concentrationResilienceScore: 15, factorDiversificationScore: 10, collateralStabilityScore: 35, maturityFundingMatchScore: 30, drawdownToleranceScore: 15 });
    expect(result.state).toBe('FORCED_SELL_RISK');
  });

  it('keeps crowding as a timing overlay rather than a thesis falsifier', () => {
    const result = evaluateCrowdingRisk({ id: 'TRADE', ownershipConcentrationScore: 90, factorConsensusScore: 95, valuationStretchScore: 80, momentumExtensionScore: 90, derivativesPositioningScore: 85, liquidityFragilityScore: 70 });
    expect(['CROWDED', 'EXTREME']).toContain(result.state);
    expect(result.rule).toContain('NOT_A_FUNDAMENTAL_FALSIFIER');
  });

  it('separates forced liquidation from a genuine fundamental break', () => {
    const dislocation = detectForcedLiquidationDislocation({ ticker: 'X', priceShockScore: 92, abnormalVolumeScore: 90, correlationSpikeScore: 85, leverageUnwindEvidenceScore: 95, fundamentalDeteriorationScore: 20, buyerAbsorptionScore: 82, postLiquidationReversalScore: 75 });
    expect(dislocation.state).toBe('CONFIRMED_DISLOCATION');
  });

  it('treats options expiry as a vulnerability window, not a crash forecast', () => {
    const result = evaluateMacroOptionsLiquidity({ evidenceTraceable: true, usdJpyStressScore: 55, japanTreasuryLiquidityRiskScore: 40, longEndYieldStressScore: 60, carryTradeUnwindScore: 45, vixCompressionScore: 75, dispersionStressScore: 78, optionsExpiryWindowScore: 90, dealerGammaFragilityScore: 60, creditSpreadStressScore: 35, breadthDeteriorationScore: 40, crossAssetCorrelationSpikeScore: 35, cryptoLiquidityStressScore: 30 });
    expect(result.state).toBe('WINDOW_ACTIVE');
  });

  it('scores homebuilder rate convexity only with balance sheet and operating proof', () => {
    const result = evaluateHomebuilderAsymmetry({ ticker: 'HOME', evidenceTraceable: true, ordersBacklogScore: 75, cancellationTrendScore: 65, grossMarginResilienceScore: 75, incentiveDisciplineScore: 65, landCapitalEfficiencyScore: 85, balanceSheetScore: 90, fcfScore: 82, structuralHousingShortageScore: 80, mortgageRateConvexityScore: 85, valuationScore: 78 });
    expect(['HIGH_ASYMMETRY', 'QUALITY_VALUE']).toContain(result.state);
  });

  it('runs Buffett Quality without narrative or momentum inputs', () => {
    const result = evaluateBuffettQuality({ ticker: 'QUALITY', evidenceTraceable: true, understandableBusinessScore: 90, durableMoatScore: 92, managementCapitalAllocationScore: 88, roicWithoutExcessLeverageScore: 94, fcfConsistencyScore: 90, marginOfSafetyScore: 70 });
    expect(result.state).toBe('BUFFETT_ELITE');
  });

  it('measures CAPEX capture per funding-pool CAPEX while checking own CAPEX and dilution leakage', () => {
    const result = evaluateCapexCaptureElasticity({ ticker: 'CAPTOR', evidenceTraceable: true, evidenceIds: ['pool-capex', 'gp', 'fcf'], customerFundingPoolCapexGrowthPct: 20, companyRevenueGrowthPct: 25, companyGrossProfitGrowthPct: 30, companyFcfGrowthPct: 35, ownCapexGrowthPct: 10, dilutionGrowthPct: 0.5 });
    expect(result.state).toBe('ELASTIC_CAPTOR');
    expect(result.fcfElasticity).toBeGreaterThan(1);
  });
});
