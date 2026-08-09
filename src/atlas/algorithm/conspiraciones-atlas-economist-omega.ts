export const CONSPIRACIONES_ATLAS_ECONOMIST_OMEGA_V1 = {
  id: 'CONSPIRACIONES_ATLAS_ECONOMIST_OMEGA_V1',
  status: 'canonical_candidate',
  mobileFirst: true,
  scope: 'research_regime_intelligence_only',
  directTradingAction: false,
  hypotheses: [
    'PREDICTIVE_ECONOMIST_EFFECT',
    'CONTRARIAN_COVER_EFFECT',
    'NARRATIVE_SATURATION_EFFECT',
    'NULL_RETROSPECTIVE_BIAS',
  ],
  motors: [
    'CONSPIRACIONES_ATLAS',
    'NARRATIVE_SATURATION_OMEGA',
    'PHOENIX_2026_MONITOR_OMEGA',
  ],
  consumers: ['MONEY_ROTATION_OMEGA', 'HISTORICAL_DISLOCATION_OMEGA'],
  rules: [
    'Evidence must be separated into fact, interpretation, hypothesis and speculation.',
    'All weekly Economist issues must be eligible for the 1986-2026 dataset; famous covers cannot be selected after outcomes are known.',
    'Publication-time narrative saturation must be computed without future data.',
    'Forward outcomes are classified only after their observation window closes.',
    'Monetary covers must be compared with matched non-monetary-cover control weeks.',
    'False positives are retained and reported.',
    'The 2026-08-08 Global Currency Beef cover is an out-of-sample prospective case frozen on 2026-08-09.',
    'Phoenix 2026 criteria cannot be reinterpreted after future events occur.',
    'The 2026-08-12 eclipse and social-media date symbolism never count as monetary confirmation.',
    'Duplicate causal signals count once.',
    'Only traceable factual observations can increase Phoenix regime-stress score.',
    'This motor never emits BUY or SELL.',
  ],
} as const;

export const NARRATIVE_SATURATION_OMEGA_WEIGHTS = {
  priorTrendMaturity: 25,
  extremeness: 20,
  narrativeIntensity: 15,
  institutionalStress: 15,
  crossAssetConfirmation: 15,
  crowdingWhenAvailable: 10,
} as const;

export const PHOENIX_2026_FROZEN_MONITOR = {
  coverDate: '2026-08-08',
  frozenBaseline: '2026-08-09',
  signals: {
    repeatedUsdDownTreasuryYieldsUpGoldUp: 30,
    usdReserveBelow55DueToRealReallocation: 15,
    rmbReserveMaterialGain: 10,
    elevatedCentralBankGoldBuying: 10,
    formalBricsCommonUnit: 10,
    majorEnergyDedollarization: 10,
    extraordinarySdrExpansion: 5,
    sdrPrivateRetailUse: 5,
    transnationalCommercialMonetaryUnit: 5,
  },
  zeroWeightContext: ['BRICS_LOCAL_CURRENCY_PAYMENT_RAILS_ONLY'],
  excluded: ['AUGUST_12_2026_ECLIPSE', 'SOCIAL_MEDIA_DATE_SYMBOLISM'],
} as const;

export const CONSPIRACIONES_ATLAS_MACRO_CHAIN = [
  'CURRENCY',
  'COMMODITIES',
  'INFLATION',
  'RATES',
  'MARGINS',
  'EARNINGS',
  'FLOWS',
  'SECTORS',
] as const;
