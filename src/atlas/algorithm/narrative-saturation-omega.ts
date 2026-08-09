export const NARRATIVE_SATURATION_OMEGA = {
  id: 'NARRATIVE_SATURATION_OMEGA_V1',
  name: 'Narrative Saturation Omega v1.0',
  status: 'canonical_higher_layer_indicator',
  scope: ['CONSPIRACIONES_ATLAS', 'MONEY_ROTATION_OMEGA', 'HISTORICAL_DISLOCATION_OMEGA'] as const,
  purpose:
    'Detect when an extreme macro, monetary or market narrative reaches systemic public visibility and test whether it is early discovery, contemporaneous stress or late-stage narrative saturation.',
  canonicalPattern: 'TREND -> EXTREME -> COVER -> POSSIBLE_REGIME_RESPONSE',
  allowedUses: [
    'Raise macro-regime review priority.',
    'Route evidence into Conspiraciones Atlas, Money Rotation Omega and Historical Dislocation Omega.',
    'Freeze prospective hypotheses before later events are known.',
    'Compare cover weeks against non-cover control weeks.',
  ] as const,
  forbiddenUses: [
    'No BUY, SELL, REDUCE or thesis change from a cover alone.',
    'No owner-intent claim without primary documents.',
    'No symbolic interpretation promoted to fact.',
    'No retrospective reinterpretation after the event window.',
  ] as const,
  requiredCrossChecks: [
    'USD',
    'gold',
    'oil',
    'rates_2y_10y',
    'credit',
    'inflation',
    'breadth',
    'positioning',
    'flows',
    'sector_rotation',
  ] as const,
} as const;

export const PHOENIX_2026_OUT_OF_SAMPLE_CASE = {
  id: 'PHOENIX_2026_BIG_MAC_OUT_OF_SAMPLE',
  status: 'frozen_watch',
  frozenAt: '2026-08-09',
  publication: 'The Economist',
  coverDate: '2026-08-08',
  coverText: 'The Global Currency Beef / Lessons from 40 years of the Big Mac Index',
  baselineVerdict:
    'No solid evidence of a secret calendar. Treat the cover as a prospective monetary-regime watch case tied to Big Mac Index 40th anniversary, FX fragmentation, gold, oil and reserve-system stress.',
  confirmers: [
    'USD reserve share persistently below 55% due to real reserve selling',
    'RMB clearly rises from around 2% of global reserves',
    'formal BRICS common currency or monetary unit',
    'continued massive central-bank physical gold accumulation',
    'repeated USD down plus UST yields up plus gold up',
    'major energy contracts migrate away from USD settlement',
    'extraordinary SDR allocation',
    'SDR private or retail use',
    'transnational commercial monetary unit',
  ] as const,
  falsifiers: [
    'no material monetary signal follows the cover',
    '2026-08-12 produces no specific monetary event beyond the known eclipse',
    'BRICS remains limited to local-currency settlement and payment rails',
  ] as const,
} as const;
