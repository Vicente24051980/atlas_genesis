import { assessEuGasStorageOmega } from './engine';

describe('EU Gas Storage Omega v1.0', () => {
  it('classifies 62% vs 74% with high price stress but no official concern as YELLOW', () => {
    expect(assessEuGasStorageOmega({
      asOf: '2026-08-20',
      storageFillPct: 62,
      yearAgoFillPct: 74,
      statutoryTargetPct: 90,
      targetWindowStart: '2026-10-01',
      targetWindowEnd: '2026-12-01',
      gasPriceStress: 'HIGH',
      refillTrajectory: 'UNKNOWN',
      lngSupplyRisk: 'MEDIUM',
      shippingDisruptionRisk: 'MEDIUM',
      officialSupplyAssessment: 'NO_IMMEDIATE_CONCERN',
      physicalShortageEvidence: false,
      regulatoryFlexibilityAvailable: true,
      evidenceIds: ['REUTERS_2026-08-20_EU_GAS', 'EC_GAS_STORAGE_RULES'],
    })).toMatchObject({
      state: 'YELLOW_DETERIORATING',
      yoyGapPctPoints: -12,
      targetGapPctPoints: 28,
      moneyRotationPermission: 'TICKER_FLOW_REQUIRED',
    });
  });

  it('does not turn a statutory target gap alone into a crisis signal', () => {
    expect(assessEuGasStorageOmega({
      asOf: '2026-08-20',
      storageFillPct: 85,
      yearAgoFillPct: 86,
      statutoryTargetPct: 90,
      gasPriceStress: 'LOW',
      refillTrajectory: 'ON_TRACK',
      lngSupplyRisk: 'LOW',
      shippingDisruptionRisk: 'LOW',
      officialSupplyAssessment: 'NO_IMMEDIATE_CONCERN',
      physicalShortageEvidence: false,
      regulatoryFlexibilityAvailable: true,
      evidenceIds: ['STORAGE_DATA', 'OFFICIAL_ASSESSMENT'],
    }).state).toBe('GREEN');
  });

  it('requires cross-channel deterioration for ORANGE', () => {
    expect(assessEuGasStorageOmega({
      asOf: '2026-09-15',
      storageFillPct: 65,
      yearAgoFillPct: 79,
      gasPriceStress: 'HIGH',
      refillTrajectory: 'BEHIND',
      lngSupplyRisk: 'MEDIUM',
      shippingDisruptionRisk: 'MEDIUM',
      officialSupplyAssessment: 'WATCH',
      physicalShortageEvidence: false,
      regulatoryFlexibilityAvailable: true,
      evidenceIds: ['STORAGE_DATA', 'PRICE_DATA', 'TRAJECTORY_DATA'],
    }).state).toBe('ORANGE_STRESS');
  });

  it('requires physical shortage evidence plus severe channels for RED unless emergency is official', () => {
    expect(assessEuGasStorageOmega({
      asOf: '2026-10-10',
      storageFillPct: 54,
      yearAgoFillPct: 83,
      gasPriceStress: 'HIGH',
      refillTrajectory: 'BEHIND',
      lngSupplyRisk: 'HIGH',
      shippingDisruptionRisk: 'HIGH',
      officialSupplyAssessment: 'CONCERN',
      physicalShortageEvidence: true,
      regulatoryFlexibilityAvailable: true,
      evidenceIds: ['STORAGE', 'ENTSOG', 'COMMISSION', 'SHIPPING'],
    }).state).toBe('RED_SUPPLY_RISK');
  });

  it('refuses to promote a state with only one traceable evidence item', () => {
    expect(assessEuGasStorageOmega({
      asOf: '2026-08-20',
      storageFillPct: 62,
      yearAgoFillPct: 74,
      gasPriceStress: 'HIGH',
      refillTrajectory: 'UNKNOWN',
      lngSupplyRisk: 'UNKNOWN',
      shippingDisruptionRisk: 'UNKNOWN',
      officialSupplyAssessment: 'UNKNOWN',
      physicalShortageEvidence: false,
      regulatoryFlexibilityAvailable: true,
      evidenceIds: ['ONE_SOURCE_ONLY'],
    }).state).toBe('INSUFFICIENT_EVIDENCE');
  });
});
