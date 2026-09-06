export const ATLAS_PORTFOLIO_RECONCILIATION_SNAPSHOT_ID = 'ATLAS-PORTFOLIO-RECON-2026-09-06-R1' as const;

export const ATLAS_PORTFOLIO_RECONCILIATION_UNIVERSE = [
  '000660.KS',
  '6501.T',
  '6861.T',
  '7011.T',
  '8035.T',
  'ANET',
  'APH',
  'APP',
  'ASML',
  'AVGO',
  'CEG',
  'CLS',
  'CME',
  'CRDO',
  'EHC',
  'FIX',
  'GEV',
  'GLW',
  'HWM',
  'IBKR',
  'ICE',
  'ISRG',
  'KLAC',
  'LIN',
  'LMB',
  'MA',
  'MCO',
  'MELI',
  'MU',
  'NOW',
  'NVDA',
  'PWR',
  'REGN',
  'ROP',
  'RRC',
  'SPGI',
  'TDG',
  'TEVA',
  'TSM',
  'VEEV',
  'VRTX',
] as const;

export type AtlasReconciliationTicker = typeof ATLAS_PORTFOLIO_RECONCILIATION_UNIVERSE[number];

export const ATLAS_PORTFOLIO_RECONCILIATION_POLICY = {
  mode: 'PORTFOLIO_MODE',
  evidenceCutoff: '2026-09-06',
  riskWeights: {
    permanentLoss: 0.40,
    tailRisk: 0.20,
    volatility: 0.40,
  },
  diversificationAuthority: 0,
  sectorAuthority: 0,
  geographyAuthority: 0,
  styleAuthority: 0,
  cardinality: 'ENDOGENOUS',
  noCardinalityFilling: true,
  tieBreak: 'LEXICOGRAPHIC_TICKER_AFTER_EXACT_NUMERIC_TIE',
  snapshotStatus: 'INPUTS_PENDING',
} as const;

export function canonicalizeReconciliationUniverse(input: readonly string[]): string[] {
  const normalized = [...new Set(input.map(x => x.trim().toUpperCase()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  return normalized;
}

export function assertFrozenReconciliationUniverse(input: readonly string[]): void {
  const actual = canonicalizeReconciliationUniverse(input);
  const expected = [...ATLAS_PORTFOLIO_RECONCILIATION_UNIVERSE];
  if (actual.length !== expected.length || actual.some((x, i) => x !== expected[i])) {
    throw new Error('ATLAS_RECONCILIATION_UNIVERSE_DRIFT');
  }
}
