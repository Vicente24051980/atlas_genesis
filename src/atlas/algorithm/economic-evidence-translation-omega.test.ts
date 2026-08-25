import {
  decomposeOrganicGrowth,
  evaluatePriceMarginPassThrough,
  normalizeContractEvidence,
} from './economic-evidence-translation-omega';

describe('Contract / Economic Evidence Normalizer Ω', () => {
  it('caps a milestone ceiling at commercial evidence and blocks revenue-base promotion', () => {
    const result = normalizeContractEvidence({
      evidenceTraceable: true,
      evidenceIds: ['issuer-8k', 'counterparty-filing'],
      kind: 'MILESTONE_CEILING',
      amount: 120_000_000_000,
      cancellable: false,
    });

    expect(result.economicEvidenceStage).toBe('E2_COMMERCIAL');
    expect(result.mayEnterRevenueBase).toBe(false);
    expect(result.mayEnterFcfBase).toBe(false);
    expect(result.valuationTreatment).toBe('SCENARIO_INPUT_ONLY');
  });

  it('requires acceptance when economically material before revenue promotion', () => {
    const result = normalizeContractEvidence({
      evidenceTraceable: true,
      evidenceIds: ['contract', '10q'],
      kind: 'RECOGNIZED_REVENUE',
      customerAcceptanceRequired: true,
      customerAccepted: false,
      recognizedRevenue: true,
      grossProfitEvidence: true,
    });

    expect(result.gate).toBe('FAIL');
    expect(result.economicEvidenceStage).toBe('E2_COMMERCIAL');
    expect(result.mayEnterRevenueBase).toBe(false);
  });

  it('promotes only multi-period FCF plus ROIC to E4 owner economics', () => {
    const result = normalizeContractEvidence({
      evidenceTraceable: true,
      evidenceIds: ['10q-q1', '10q-q2'],
      kind: 'FCF',
      recognizedRevenue: true,
      grossProfitEvidence: true,
      cashConversionEvidence: true,
      roicEvidence: true,
      multiPeriodCashEvidence: true,
    });

    expect(result.gate).toBe('PASS');
    expect(result.economicEvidenceStage).toBe('E4_OWNER_ECONOMICS');
    expect(result.mayEnterFcfBase).toBe(true);
  });
});

describe('Organic Growth Decomposition Ω', () => {
  it('separates acquisition contribution from reported growth', () => {
    const result = decomposeOrganicGrowth({
      evidenceTraceable: true,
      evidenceIds: ['earnings-release', '10q'],
      reportedGrowthPct: 13,
      acquisitionContributionPctPoints: 4,
      fxContributionPctPoints: 0,
      divestitureContributionPctPoints: 0,
      accountingOrOtherContributionPctPoints: 0,
    });

    expect(result.organicGrowthPct).toBe(9);
    expect(result.state).toBe('M_AND_A_MATERIAL');
  });

  it('reconciles organic growth to price, volume and mix', () => {
    const result = decomposeOrganicGrowth({
      evidenceTraceable: true,
      evidenceIds: ['earnings-release', 'segment-note'],
      reportedGrowthPct: 10,
      acquisitionContributionPctPoints: 0,
      fxContributionPctPoints: -1,
      realizedPriceContributionPctPoints: 4,
      volumeOrUsageContributionPctPoints: 6,
      mixContributionPctPoints: 1,
    });

    expect(result.organicGrowthPct).toBe(11);
    expect(result.priceVolumeMixResidualPctPoints).toBe(0);
    expect(result.state).toBe('RECONCILED');
  });
});

describe('Cross-Layer Price / Margin Pass-Through Ω', () => {
  it('identifies pricing power only when margin, volume and gross profit confirm', () => {
    const result = evaluatePriceMarginPassThrough({
      evidenceTraceable: true,
      evidenceIds: ['10q', 'earnings-call'],
      inputCostChangePct: 5,
      realizedPriceChangePct: 8,
      volumeChangePct: 3,
      grossMarginChangeBps: 80,
      grossProfitGrowthPct: 12,
    });

    expect(result.state).toBe('PRICING_POWER');
    expect(result.economicCaptureConfirmed).toBe(true);
  });

  it('identifies cost absorption when price lags costs and margin falls', () => {
    const result = evaluatePriceMarginPassThrough({
      evidenceTraceable: true,
      evidenceIds: ['10q', 'earnings-call'],
      inputCostChangePct: 10,
      realizedPriceChangePct: 4,
      volumeChangePct: 2,
      grossMarginChangeBps: -250,
      grossProfitGrowthPct: 3,
    });

    expect(result.state).toBe('ABSORPTION');
    expect(result.economicCaptureConfirmed).toBe(false);
  });

  it('does not confuse aggressive price increases with pricing power when volume collapses', () => {
    const result = evaluatePriceMarginPassThrough({
      evidenceTraceable: true,
      evidenceIds: ['10q', 'earnings-call'],
      inputCostChangePct: 3,
      realizedPriceChangePct: 9,
      volumeChangePct: -9,
      grossMarginChangeBps: -50,
      grossProfitGrowthPct: -2,
    });

    expect(result.state).toBe('DEMAND_DESTRUCTION');
    expect(result.economicCaptureConfirmed).toBe(false);
  });
});
