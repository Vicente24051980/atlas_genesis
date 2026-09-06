import {
  ATLAS_CORE_PLUS_VRT_UNIVERSE_VERSION,
  ATLAS_CORE_UNIVERSE_VERSION,
  isTickerAllowedByStructuralUniverse,
} from '../algorithm/structural-universe-authority-omega';

export const CURRENT_OPERATIONAL_PORTFOLIO_OMEGA_VERSION = '2026-09-06-v1.0.0' as const;

export const CURRENT_OPERATIONAL_PORTFOLIO_OMEGA = {
  version: CURRENT_OPERATIONAL_PORTFOLIO_OMEGA_VERSION,
  effectiveDate: '2026-09-06',
  status: 'OPERATIONAL_EXECUTION_STATE',
  selectionAuthority: 'NONE',
  n: 27,
  latestConfirmedChange: { out: 'GLW', in: 'VRT' },
  positions: [
    { rank: 1, ticker: 'AXON', company: 'Axon Enterprise', gics: 'Industrials' },
    { rank: 2, ticker: 'MELI', company: 'MercadoLibre', gics: 'Consumer Discretionary' },
    { rank: 3, ticker: 'CRWD', company: 'CrowdStrike Holdings', gics: 'Information Technology' },
    { rank: 4, ticker: 'LRCX', company: 'Lam Research', gics: 'Information Technology' },
    { rank: 5, ticker: 'PWR', company: 'Quanta Services', gics: 'Industrials' },
    { rank: 6, ticker: 'GEV', company: 'GE Vernova', gics: 'Industrials' },
    { rank: 7, ticker: 'AVGO', company: 'Broadcom', gics: 'Information Technology' },
    { rank: 8, ticker: 'PANW', company: 'Palo Alto Networks', gics: 'Information Technology' },
    { rank: 9, ticker: 'SYK', company: 'Stryker', gics: 'Health Care' },
    { rank: 10, ticker: 'MA', company: 'Mastercard', gics: 'Financials' },
    { rank: 11, ticker: 'ANET', company: 'Arista Networks', gics: 'Information Technology' },
    { rank: 12, ticker: 'CDNS', company: 'Cadence Design Systems', gics: 'Information Technology' },
    { rank: 13, ticker: 'ISRG', company: 'Intuitive Surgical', gics: 'Health Care' },
    { rank: 14, ticker: 'APH', company: 'Amphenol', gics: 'Information Technology' },
    { rank: 15, ticker: 'HWM', company: 'Howmet Aerospace', gics: 'Industrials' },
    { rank: 16, ticker: 'VRT', company: 'Vertiv Holdings', gics: 'Industrials' },
    { rank: 17, ticker: 'TT', company: 'Trane Technologies', gics: 'Industrials' },
    { rank: 18, ticker: 'VRTX', company: 'Vertex Pharmaceuticals', gics: 'Health Care' },
    { rank: 19, ticker: 'BSX', company: 'Boston Scientific', gics: 'Health Care' },
    { rank: 20, ticker: 'INTU', company: 'Intuit', gics: 'Information Technology' },
    { rank: 21, ticker: 'TRGP', company: 'Targa Resources', gics: 'Energy' },
    { rank: 22, ticker: 'LLY', company: 'Eli Lilly', gics: 'Health Care' },
    { rank: 23, ticker: 'GE', company: 'GE Aerospace', gics: 'Industrials' },
    { rank: 24, ticker: 'ETN', company: 'Eaton', gics: 'Industrials' },
    { rank: 25, ticker: 'ICE', company: 'Intercontinental Exchange', gics: 'Financials' },
    { rank: 26, ticker: 'V', company: 'Visa', gics: 'Financials' },
    { rank: 27, ticker: 'BKNG', company: 'Booking Holdings', gics: 'Consumer Discretionary' },
  ],
  laws: [
    'CURRENT_PORTFOLIO != SELECTION_PRIOR',
    'OPERATIONAL_RANK != INHERITED_POINT_ZERO_RANK',
    'CURRENT_HOLDING != INCUMBENCY_BONUS',
    'Use this exact snapshot when current operational holdings are requested; do not reconstruct from memory.',
  ],
} as const;

export const CURRENT_OPERATIONAL_TICKERS = CURRENT_OPERATIONAL_PORTFOLIO_OMEGA.positions.map(p => p.ticker);

export function validateCurrentOperationalPortfolioOmega(): string[] {
  const errors: string[] = [];
  const p = CURRENT_OPERATIONAL_PORTFOLIO_OMEGA;
  const tickers = CURRENT_OPERATIONAL_TICKERS;
  if (p.positions.length !== p.n || p.n !== 27) errors.push('N_MISMATCH');
  if (new Set(tickers).size !== tickers.length) errors.push('DUPLICATE_TICKER');
  if (p.positions.some((x, i) => x.rank !== i + 1)) errors.push('RANK_SEQUENCE_INVALID');
  if (tickers.includes('GLW')) errors.push('GLW_SHOULD_BE_OUT');
  if (!tickers.includes('VRT')) errors.push('VRT_SHOULD_BE_IN');
  if (p.positions.find(x => x.ticker === 'VRT')?.rank !== 16) errors.push('VRT_OPERATIONAL_RANK_MISMATCH');
  if (p.latestConfirmedChange.out !== 'GLW' || p.latestConfirmedChange.in !== 'VRT') errors.push('LATEST_CHANGE_MISMATCH');
  if (p.selectionAuthority !== 'NONE') errors.push('OPERATIONAL_STATE_HAS_SELECTION_AUTHORITY');
  if (tickers.some(t => !isTickerAllowedByStructuralUniverse(ATLAS_CORE_PLUS_VRT_UNIVERSE_VERSION, t))) errors.push('TICKER_OUTSIDE_488_EXTENSION');
  const externalToCore = tickers.filter(t => !isTickerAllowedByStructuralUniverse(ATLAS_CORE_UNIVERSE_VERSION, t));
  if (externalToCore.length !== 1 || externalToCore[0] !== 'VRT') errors.push('CORE_EXTERNAL_SET_MISMATCH');
  return errors;
}
