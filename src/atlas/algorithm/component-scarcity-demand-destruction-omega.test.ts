import { evaluateComponentScarcity } from './component-scarcity-demand-destruction-omega';

describe('Component Scarcity / End-Market Demand Destruction Ω', () => {
  it('detects downstream demand destruction when component inflation passes into ASP and units collapse', () => {
    const result = evaluateComponentScarcity({
      evidenceTraceable: true,
      evidenceIds: ['industry-primary', 'issuer-results'],
      componentCostChangePct: 12,
      endProductPriceChangePct: 9,
      endMarketVolumeChangePct: -16.7,
      supplierGrossProfitGrowthPct: 20,
      supplierFcfGrowthPct: 12,
      oemGrossProfitGrowthPct: -4,
      capacityReallocatedToAi: true,
      scarcityConfirmed: true,
    });
    expect(result.state).toBe('DOWNSTREAM_DEMAND_DESTRUCTION');
    expect(result.aiCapacityCrowdingOut).toBe(true);
    expect(result.upstreamCaptureConfirmed).toBe(true);
    expect(result.downstreamEconomicsConfirmed).toBe(false);
  });

  it('does not call component inflation supplier capture without gross-profit evidence', () => {
    const result = evaluateComponentScarcity({
      evidenceTraceable: true,
      evidenceIds: ['supplier-call', 'market-data'],
      componentCostChangePct: 10,
      endProductPriceChangePct: 8,
      endMarketVolumeChangePct: 1,
      scarcityConfirmed: true,
    });
    expect(result.upstreamCaptureConfirmed).toBe(false);
    expect(result.state).toBe('MIXED');
  });

  it('recognizes benign pass-through only when downstream owner economics confirm', () => {
    const result = evaluateComponentScarcity({
      evidenceTraceable: true,
      evidenceIds: ['oem-10q', 'oem-call'],
      componentCostChangePct: 4,
      endProductPriceChangePct: 5,
      endMarketVolumeChangePct: 2,
      oemGrossProfitGrowthPct: 8,
      oemFcfGrowthPct: 6,
    });
    expect(result.state).toBe('BENIGN_PASS_THROUGH');
    expect(result.downstreamEconomicsConfirmed).toBe(true);
  });

  it('keeps single-source forecasts evidence-pending', () => {
    const result = evaluateComponentScarcity({
      evidenceTraceable: true,
      evidenceIds: ['one-forecast'],
      componentCostChangePct: 10,
      endProductPriceChangePct: 7,
      endMarketVolumeChangePct: -10,
    });
    expect(result.state).toBe('EVIDENCE_PENDING');
  });
});
