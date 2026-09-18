import { describe, expect, it } from 'vitest';
import {
  attributeYieldPressure,
  dedupeCapitalFlows,
  evaluateCapitalCompetitionSensor,
  type CapitalCompetitionInput,
} from './capital-competition-sensor-omega';

const base: CapitalCompetitionInput = {
  traceableEvidenceCount: 4,
  marginalConcessionObserved: true,
  repeatedConcessionOrSpreadWidening: false,
  aiDebtSupplyRising: true,
  recentPlacementStillClearing: true,
  issueWithdrawalObserved: false,
  bridgeRefinanceFailureObserved: false,
  capexCutCitingFinancingCost: false,
  fedPathShockActive: true,
  termPremiumOrFiscalSupplyPressure: true,
  aiCorporateSupplyPressure: true,
  pricePressureConfidence: 'HIGH',
  trendConfidence: 'MEDIUM',
};

describe('Capital Competition Omega sensor', () => {
  it('separates higher marginal financing cost from quantity rationing', () => {
    const result = evaluateCapitalCompetitionSensor(base);

    expect(result.pricePressure).toBe('ACTIVE');
    expect(result.trend).toBe('RISING');
    expect(result.rationing).toBe('NOT_OBSERVED');
    expect(result.directScoreWeight).toBe(0);
    expect(result.irrBonusPenalty).toBe(0);
    expect(result.canCreateBuySell).toBe(false);
  });

  it('attributes yields as mixed when Fed, fiscal/term-premium and AI supply are simultaneously active', () => {
    expect(attributeYieldPressure(base)).toBe('MIXED');
  });

  it('does not promote rationing until a quantity failure is observed', () => {
    const result = evaluateCapitalCompetitionSensor({
      ...base,
      repeatedConcessionOrSpreadWidening: true,
      recentPlacementStillClearing: null,
    });

    expect(result.pricePressure).toBe('STRESSED');
    expect(result.rationing).toBe('EARLY_WARNING');
  });

  it('promotes rationing only on financing failure/withdrawal or financing-driven CAPEX cuts', () => {
    const result = evaluateCapitalCompetitionSensor({
      ...base,
      issueWithdrawalObserved: true,
      recentPlacementStillClearing: false,
    });

    expect(result.rationing).toBe('OBSERVED');
  });

  it('treats chip-ABS, SPV/JV and neocloud structures as more exposed than hyperscaler corporate issuance', () => {
    const result = evaluateCapitalCompetitionSensor(base);

    expect(result.financingSensitivity.HYPERSCALER_CORPORATE).toBe('LOW');
    expect(result.financingSensitivity.CHIP_ABS).toBe('HIGH');
    expect(result.financingSensitivity.SPV_JV).toBe('HIGH');
    expect(result.financingSensitivity.NEOCLOUD).toBe('HIGH');
  });

  it('counts the same economic dollar once across financing and CAPEX purchase observations', () => {
    const result = dedupeCapitalFlows([
      {
        id: 'crux-loan',
        economicDollarId: 'CRUX-2026-TPU-POOL',
        kind: 'LOAN',
      },
      {
        id: 'crux-tpu-purchase',
        economicDollarId: 'CRUX-2026-TPU-POOL',
        kind: 'CAPEX_PURCHASE',
      },
      {
        id: 'independent-bond',
        economicDollarId: 'OTHER-2026-BOND-POOL',
        kind: 'BOND',
      },
    ]);

    expect(result.uniqueEconomicDollars).toBe(2);
    expect(result.duplicateObservationIds).toEqual(['crux-tpu-purchase']);
    expect(result.independentFundingPoolCredit).toBe(
      'DERIVED_DO_NOT_COUNT_AS_NEW_POOL',
    );
  });

  it('fails closed when evidence is insufficient', () => {
    const result = evaluateCapitalCompetitionSensor({
      ...base,
      traceableEvidenceCount: 1,
    });

    expect(result.pricePressure).toBe('DATA_INSUFFICIENT');
    expect(result.rationing).toBe('UNKNOWN');
    expect(result.canCreatePortfolioQuota).toBe(false);
    expect(result.canCreateCoreLabel).toBe(false);
  });
});
