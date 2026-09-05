// ATLAS Ω — Investing Observable Surface evidence seed
// Cut-off: 2026-09-05. Evidence only; no automatic factor-weight changes.

export type EvidenceClass = 'PROPICKS_SPECIFIC' | 'GENERAL_INVESTING_SURFACE' | 'PUBLIC_PAGE_CONFIRMATION';
export type EvidenceConfidence = 'HIGH' | 'MEDIUM' | 'LOW';

export interface InvestingObservableEvidence {
  id: string;
  observedAt: string;
  evidenceClass: EvidenceClass;
  confidence: EvidenceConfidence;
  ticker?: string;
  feature: string;
  value: string | number;
  unit?: string;
  factorHint?: 'F5' | 'F6' | 'F7' | 'F8' | 'F9' | 'F10' | 'NON_SCORING';
  source: string;
  notes?: string;
}

export const INVESTING_OBSERVABLE_SURFACE_SEED_2026_09_05: InvestingObservableEvidence[] = [
  // User-provided screenshots: ProPicks / strategy-specific observable history.
  { id:'ss-energy-strategy-return', observedAt:'2026-09-05T12:44:00+02:00', evidenceClass:'PROPICKS_SPECIFIC', confidence:'HIGH', feature:'strategy_total_return_2015_2026', value:653.9, unit:'pct', factorHint:'NON_SCORING', source:'user screenshot Investing.com', notes:'Energy leaders strategy card; benchmark S&P 500 Energy shown separately.' },
  { id:'ss-energy-benchmark-return', observedAt:'2026-09-05T12:44:00+02:00', evidenceClass:'PROPICKS_SPECIFIC', confidence:'HIGH', feature:'benchmark_total_return_2015_2026', value:65.9, unit:'pct', factorHint:'NON_SCORING', source:'user screenshot Investing.com' },
  { id:'ss-cnx-entry-date', observedAt:'2026-09-05T12:44:00+02:00', evidenceClass:'PROPICKS_SPECIFIC', confidence:'HIGH', ticker:'CNX', feature:'entry_date', value:'2016-03-01', factorHint:'NON_SCORING', source:'user screenshot Investing.com' },
  { id:'ss-cnx-entry-price', observedAt:'2026-09-05T12:44:00+02:00', evidenceClass:'PROPICKS_SPECIFIC', confidence:'HIGH', ticker:'CNX', feature:'entry_price', value:9.05, unit:'USD', factorHint:'NON_SCORING', source:'user screenshot Investing.com' },
  { id:'ss-cnx-exit-date', observedAt:'2026-09-05T12:44:00+02:00', evidenceClass:'PROPICKS_SPECIFIC', confidence:'HIGH', ticker:'CNX', feature:'exit_date', value:'2016-07-01', factorHint:'NON_SCORING', source:'user screenshot Investing.com' },
  { id:'ss-cnx-exit-price', observedAt:'2026-09-05T12:44:00+02:00', evidenceClass:'PROPICKS_SPECIFIC', confidence:'HIGH', ticker:'CNX', feature:'exit_price', value:16.40, unit:'USD', factorHint:'NON_SCORING', source:'user screenshot Investing.com' },
  { id:'ss-cnx-realized-return', observedAt:'2026-09-05T12:44:00+02:00', evidenceClass:'PROPICKS_SPECIFIC', confidence:'HIGH', ticker:'CNX', feature:'displayed_realized_return', value:81.2, unit:'pct', factorHint:'NON_SCORING', source:'user screenshot Investing.com', notes:'Can be checked against entry/exit prices; preserve displayed value and computed value separately.' },
  { id:'ss-dvn-realized-return', observedAt:'2026-09-05T12:44:00+02:00', evidenceClass:'PROPICKS_SPECIFIC', confidence:'HIGH', ticker:'DVN', feature:'displayed_realized_return', value:117.5, unit:'pct', factorHint:'NON_SCORING', source:'user screenshot Investing.com' },
  { id:'ss-ovv-realized-return', observedAt:'2026-09-05T12:44:00+02:00', evidenceClass:'PROPICKS_SPECIFIC', confidence:'HIGH', ticker:'OVV', feature:'displayed_realized_return', value:162.5, unit:'pct', factorHint:'NON_SCORING', source:'user screenshot Investing.com' },

  // General Investing observable surface from screenshots. Never label as ProPicks feature without direct evidence.
  { id:'ss-tsla-price', observedAt:'2026-09-05T12:44:00+02:00', evidenceClass:'GENERAL_INVESTING_SURFACE', confidence:'HIGH', ticker:'TSLA', feature:'price', value:354.08, unit:'USD', factorHint:'NON_SCORING', source:'user screenshot Investing.com' },
  { id:'ss-tsla-fair-value', observedAt:'2026-09-05T12:44:00+02:00', evidenceClass:'GENERAL_INVESTING_SURFACE', confidence:'HIGH', ticker:'TSLA', feature:'fair_value', value:260.49, unit:'USD', factorHint:'F5', source:'user screenshot Investing.com' },
  { id:'ss-tsla-fv-downside', observedAt:'2026-09-05T12:44:00+02:00', evidenceClass:'GENERAL_INVESTING_SURFACE', confidence:'HIGH', ticker:'TSLA', feature:'fair_value_upside_downside', value:-25.97, unit:'pct', factorHint:'F5', source:'user screenshot Investing.com' },
  { id:'ss-tsla-risk', observedAt:'2026-09-05T12:44:00+02:00', evidenceClass:'GENERAL_INVESTING_SURFACE', confidence:'HIGH', ticker:'TSLA', feature:'risk_label', value:'MEDIUM', factorHint:'F9', source:'user screenshot Investing.com' },
  { id:'ss-tsla-next-earnings', observedAt:'2026-09-05T12:44:00+02:00', evidenceClass:'GENERAL_INVESTING_SURFACE', confidence:'HIGH', ticker:'TSLA', feature:'next_earnings_date', value:'2026-10-28', factorHint:'F10', source:'user screenshot Investing.com' },
  { id:'ss-tsla-revenue-est', observedAt:'2026-09-05T12:44:00+02:00', evidenceClass:'GENERAL_INVESTING_SURFACE', confidence:'HIGH', ticker:'TSLA', feature:'revenue_estimate', value:27.66, unit:'USD_B', factorHint:'F6', source:'user screenshot Investing.com' },
  { id:'ss-tsla-eps-est', observedAt:'2026-09-05T12:44:00+02:00', evidenceClass:'GENERAL_INVESTING_SURFACE', confidence:'HIGH', ticker:'TSLA', feature:'eps_estimate', value:0.45, unit:'USD', factorHint:'F6', source:'user screenshot Investing.com' },
  { id:'ss-tsla-analyst-target', observedAt:'2026-09-05T12:44:00+02:00', evidenceClass:'GENERAL_INVESTING_SURFACE', confidence:'HIGH', ticker:'TSLA', feature:'analyst_target', value:390.09, unit:'USD', factorHint:'F6', source:'user screenshot Investing.com', notes:'Diagnostic; not intrinsic value.' },
  { id:'ss-tsla-analyst-counts', observedAt:'2026-09-05T12:44:00+02:00', evidenceClass:'GENERAL_INVESTING_SURFACE', confidence:'HIGH', ticker:'TSLA', feature:'analyst_consensus_counts', value:'BUY=21,HOLD=20,SELL=5', factorHint:'F6', source:'user screenshot Investing.com' },
  { id:'ss-avgo-new-coverage', observedAt:'2026-09-05T12:44:00+02:00', evidenceClass:'GENERAL_INVESTING_SURFACE', confidence:'HIGH', ticker:'AVGO', feature:'new_coverage', value:'Rosenblatt BUY PT=600 upside=67.64%', factorHint:'F6', source:'user screenshot Investing.com' },
  { id:'ss-undervalued-list', observedAt:'2026-09-05T12:44:00+02:00', evidenceClass:'GENERAL_INVESTING_SURFACE', confidence:'HIGH', feature:'most_undervalued_panel', value:'ADBE 69.26%; CHTR 68.54%; FI 67.86%; EPAM 69.62%; FIS 62.33%', factorHint:'F5', source:'user screenshot Investing.com' },
  { id:'ss-52w-highs', observedAt:'2026-09-05T12:44:00+02:00', evidenceClass:'GENERAL_INVESTING_SURFACE', confidence:'HIGH', feature:'52w_high_panel', value:'DELL, MTW, UNM, HPQ, NMR', factorHint:'F8', source:'user screenshot Investing.com' },
  { id:'ss-52w-lows', observedAt:'2026-09-05T12:44:00+02:00', evidenceClass:'GENERAL_INVESTING_SURFACE', confidence:'HIGH', feature:'52w_low_panel', value:'MCD, SITC, LHX, ADTN, EGAN', factorHint:'F8', source:'user screenshot Investing.com' },
  { id:'ss-active-movers', observedAt:'2026-09-05T12:44:00+02:00', evidenceClass:'GENERAL_INVESTING_SURFACE', confidence:'HIGH', feature:'active_movers', value:'MU +6.10%; NVDA +0.84%; SNDK +11.90%; TSLA -5.92%; AAPL -2.51%', factorHint:'F7', source:'user screenshot Investing.com' },
  { id:'ss-premarket-panel', observedAt:'2026-09-05T12:44:00+02:00', evidenceClass:'GENERAL_INVESTING_SURFACE', confidence:'HIGH', feature:'premarket_movers', value:'BAOS +23.66%; IMRN +62.50%; OFAL +35.26%; PLAG +14.57%; ADBT -10.68%', factorHint:'F8', source:'user screenshot Investing.com' },
  { id:'ss-profitable-growth-screen', observedAt:'2026-09-05T12:44:00+02:00', evidenceClass:'GENERAL_INVESTING_SURFACE', confidence:'HIGH', feature:'profitable_growth_screen', value:'3m return 5.3%; VYT health-growth 4.57; INDXA 4.46; YCPS 4.08; ISUR 3.83; RLIA 3.83', factorHint:'NON_SCORING', source:'user screenshot Investing.com' },

  // Public Investing.com confirmations gathered 2026-09-05.
  { id:'web-avgo-rosenblatt', observedAt:'2026-09-05', evidenceClass:'PUBLIC_PAGE_CONFIRMATION', confidence:'HIGH', ticker:'AVGO', feature:'new_coverage', value:'Rosenblatt BUY PT=600', factorHint:'F6', source:'Investing.com analyst-ratings article 2026-09-03', notes:'Public page independently confirms screenshot analyst event.' },
  { id:'web-dvn-consensus', observedAt:'2026-09-05', evidenceClass:'PUBLIC_PAGE_CONFIRMATION', confidence:'HIGH', ticker:'DVN', feature:'analyst_consensus', value:'25 BUY, 3 HOLD, 0 SELL; avg PT 59.81; +22.60%', factorHint:'F6', source:'Investing.com DVN consensus estimates', notes:'Public surface confirms analyst-consensus schema and target/upside fields.' },
  { id:'web-cnx-fundamental-surface', observedAt:'2026-09-05', evidenceClass:'PUBLIC_PAGE_CONFIRMATION', confidence:'HIGH', ticker:'CNX', feature:'fundamental_peer_panel', value:'P/E 5.9x; PEG 0.01; P/B 1.2x; P/S 2.6x; analyst-target upside -1.5%', factorHint:'F5', source:'Investing.com CNX quote page' },
  { id:'web-cnx-technical', observedAt:'2026-09-05', evidenceClass:'PUBLIC_PAGE_CONFIRMATION', confidence:'HIGH', ticker:'CNX', feature:'technical_surface', value:'daily Strong Buy; RSI14 50.43; MA signals exposed', factorHint:'F8', source:'Investing.com CNX technical page', notes:'Confirms technical indicators/MA surface; does not prove ProPicks uses them.' },
  { id:'web-dvn-technical', observedAt:'2026-09-05', evidenceClass:'PUBLIC_PAGE_CONFIRMATION', confidence:'HIGH', ticker:'DVN', feature:'technical_surface', value:'daily Strong Buy; RSI14 53.355; MA50 47.96; MA200 46.06', factorHint:'F8', source:'Investing.com DVN technical page' },
  { id:'web-dvn-earnings', observedAt:'2026-09-05', evidenceClass:'PUBLIC_PAGE_CONFIRMATION', confidence:'HIGH', ticker:'DVN', feature:'earnings_surprise_surface', value:'Q2/2026 EPS 1.57, +5.4% vs estimate; revenue 7.42B, +23.9% vs forecast; shares -2.8% AH', factorHint:'F6', source:'Investing.com DVN earnings page', notes:'Useful causal-chain evidence: result -> expectations -> market reaction must not be double-counted.' },
];

export function propicksSpecificEvidence(): InvestingObservableEvidence[] {
  return INVESTING_OBSERVABLE_SURFACE_SEED_2026_09_05.filter(e => e.evidenceClass === 'PROPICKS_SPECIFIC');
}

export function evidenceForTicker(ticker: string): InvestingObservableEvidence[] {
  const t = ticker.toUpperCase();
  return INVESTING_OBSERVABLE_SURFACE_SEED_2026_09_05.filter(e => e.ticker?.toUpperCase() === t);
}

export function computedTradeReturnPct(entry: number, exit: number): number {
  if (!(entry > 0) || !Number.isFinite(exit)) throw new Error('Invalid trade prices');
  return Math.round((((exit / entry) - 1) * 100) * 100) / 100;
}

export const CNX_SCREENSHOT_RETURN_CHECK = {
  entry: 9.05,
  exit: 16.40,
  computedPct: computedTradeReturnPct(9.05, 16.40),
  displayedPct: 81.2,
  // A small difference may arise from display precision, corporate-action treatment, or hidden exact prices.
  absoluteGapPctPoints: Math.round(Math.abs(computedTradeReturnPct(9.05, 16.40) - 81.2) * 100) / 100,
};
