export type FutureWatchStatus =
  | 'ADVANCE'
  | 'ADVANCE_CONDITIONAL'
  | 'PENDING_EVENT'
  | 'NO_PASS_CURRENT'
  | 'OPTIONALITY_ONLY'
  | 'WATCH'
  | 'RECLASSIFY_WATCH'
  | 'DATA_FAIL'
  | 'WATCH_HIGH_RISK'
  | 'PRIORITY_EARNINGS_INFLECTION'
  | 'CATEGORY_MISMATCH'
  | 'NO_PASS_OPERATING_SHELL'
  | 'DISCOVERY_ONLY';

export type FutureBucket =
  | 'FUTURE_LEADERS_GROWTH'
  | 'POWER_GRID_AI_INFRA'
  | 'POWER_TO_AI_HPC_NEOCLOUD'
  | 'ENERGY_LNG'
  | 'EUROPE_DEFENSE_INDUSTRIALS'
  | 'HARD_ASSETS'
  | 'FINANCIAL_PLUMBING'
  | 'DISCOVERY';

export interface FutureWatchItem {
  ticker: string;
  bucket: FutureBucket;
  status: FutureWatchStatus;
  note?: string;
}

export const FUTURE_IDENTIFIER_NORMALIZATION: Record<string, string> = {
  EXENS: 'EXENS.PA',
  BITF: 'KEEL',
};

export const ACTIVE_PORTFOLIO_36 = new Set([
  'GOOGL','MSFT','AMZN','TSM','ASML','FTNT','PWR','SU.PA','GE','MP','CB','ALNY',
  'ARGX','EXENS.PA','HWM','AEM','KKR','IOT','LNG','AXON','ADYEN','NU','HALO','VST',
  'GEV','RDDT','TJX','CRDO','WISE','RBRK','NXT','WST','FTAI','PLMR','SE','NVDA',
]);

export const FUTURE_PORTFOLIO_OVERLAPS_REMOVED = [
  'EXENS.PA','ARGX','ADYEN','PLMR','RBRK','IOT','CRDO','NXT','FTAI','SE','NU','WISE',
  'HALO','WST','AXON','TJX','AEM','GEV','LNG',
] as const;

export const FUTURE_WATCHLIST_OMEGA: FutureWatchItem[] = [
  // Future Leaders / Growth
  { ticker: 'NBIS', bucket: 'FUTURE_LEADERS_GROWTH', status: 'ADVANCE_CONDITIONAL', note: 'Strong demand proof; high CAPEX and funding/partner dependence require CFQ/FD gates.' },
  { ticker: 'FIX', bucket: 'FUTURE_LEADERS_GROWTH', status: 'ADVANCE', note: 'Strong earnings/backlog; hidden concentration in data-center CAPEX must be tracked.' },
  { ticker: 'MTSI', bucket: 'FUTURE_LEADERS_GROWTH', status: 'ADVANCE' },
  { ticker: 'CRS', bucket: 'FUTURE_LEADERS_GROWTH', status: 'ADVANCE' },
  { ticker: 'MTZ', bucket: 'FUTURE_LEADERS_GROWTH', status: 'ADVANCE_CONDITIONAL', note: 'Mission-critical/data-center growth plus integration risk.' },
  { ticker: 'GLNG', bucket: 'FUTURE_LEADERS_GROWTH', status: 'ADVANCE_CONDITIONAL', note: 'Strong FLNG economics; project execution and financing remain material.' },
  { ticker: 'ON', bucket: 'FUTURE_LEADERS_GROWTH', status: 'ADVANCE_CONDITIONAL', note: 'AI power-semiconductor optionality plus acquisition/integration risk.' },
  { ticker: 'FN', bucket: 'FUTURE_LEADERS_GROWTH', status: 'PENDING_EVENT', note: 'Q4/FY26 event gate; do not pre-judge.' },
  { ticker: 'UBER', bucket: 'FUTURE_LEADERS_GROWTH', status: 'ADVANCE' },

  // Power / Grid / AI Infrastructure
  { ticker: 'VRT', bucket: 'POWER_GRID_AI_INFRA', status: 'ADVANCE' },
  { ticker: 'ETN', bucket: 'POWER_GRID_AI_INFRA', status: 'ADVANCE' },
  { ticker: 'NVT', bucket: 'POWER_GRID_AI_INFRA', status: 'ADVANCE', note: 'nVent Electric; not Navitas Semiconductor.' },
  { ticker: 'HUBB', bucket: 'POWER_GRID_AI_INFRA', status: 'ADVANCE' },
  { ticker: 'BE', bucket: 'POWER_GRID_AI_INFRA', status: 'ADVANCE_CONDITIONAL', note: 'Exceptional growth; funding/backlog/accounting and supply execution require scrutiny.' },
  { ticker: 'FCEL', bucket: 'POWER_GRID_AI_INFRA', status: 'NO_PASS_CURRENT', note: 'Current economic proof insufficient; optionality alone does not pass.' },
  { ticker: 'NEE', bucket: 'POWER_GRID_AI_INFRA', status: 'ADVANCE' },
  { ticker: 'DLR', bucket: 'POWER_GRID_AI_INFRA', status: 'ADVANCE_CONDITIONAL', note: 'Strong demand; asset-heavy funding/leverage gate.' },
  { ticker: 'EQIX', bucket: 'POWER_GRID_AI_INFRA', status: 'ADVANCE' },

  // Power-to-AI / Miner -> HPC / Neocloud
  { ticker: 'CORZ', bucket: 'POWER_TO_AI_HPC_NEOCLOUD', status: 'ADVANCE_CONDITIONAL', note: 'Large contracted AI/HPC demand; CAPEX/funding execution still material.' },
  { ticker: 'APLD', bucket: 'POWER_TO_AI_HPC_NEOCLOUD', status: 'ADVANCE_CONDITIONAL', note: 'Contracted campus demand; project finance and debt remain central.' },
  { ticker: 'IREN', bucket: 'POWER_TO_AI_HPC_NEOCLOUD', status: 'ADVANCE_CONDITIONAL', note: 'Strong managed-cloud contracts; strategic supplier/customer overlap => FD2 watch.' },
  { ticker: 'KEEL', bucket: 'POWER_TO_AI_HPC_NEOCLOUD', status: 'OPTIONALITY_ONLY', note: 'Former BITF; HPC transformation still early and current economic proof weak.' },
  { ticker: 'HUT', bucket: 'POWER_TO_AI_HPC_NEOCLOUD', status: 'ADVANCE_CONDITIONAL', note: 'High-quality contracted revenue with non-recourse project-finance structure; one of the cleaner transition models.' },
  { ticker: 'MARA', bucket: 'POWER_TO_AI_HPC_NEOCLOUD', status: 'WATCH', note: 'HPC proof less mature than leading transition peers.' },
  { ticker: 'CIFR', bucket: 'POWER_TO_AI_HPC_NEOCLOUD', status: 'ADVANCE_CONDITIONAL', note: 'Cipher Digital; hyperscaler lease economics promising, external financing remains material.' },
  { ticker: 'RIOT', bucket: 'POWER_TO_AI_HPC_NEOCLOUD', status: 'ADVANCE_CONDITIONAL', note: 'AI/HPC contract inflection real but operating proof still early.' },
  { ticker: 'CLSK', bucket: 'POWER_TO_AI_HPC_NEOCLOUD', status: 'ADVANCE_CONDITIONAL', note: 'Long-duration AI lease proof is strong; substantial additional capital required.' },
  { ticker: 'BTBT', bucket: 'POWER_TO_AI_HPC_NEOCLOUD', status: 'RECLASSIFY_WATCH', note: 'Digital assets / WhiteFiber holding exposure; not a clean direct HPC operating peer.' },
  { ticker: 'TERA', bucket: 'POWER_TO_AI_HPC_NEOCLOUD', status: 'DATA_FAIL', note: 'Ticker/issuer ambiguous; never silently normalize.' },
  { ticker: 'WYFI', bucket: 'POWER_TO_AI_HPC_NEOCLOUD', status: 'ADVANCE_CONDITIONAL', note: 'WhiteFiber; early public AI-infrastructure operator.' },
  { ticker: 'CRWV', bucket: 'POWER_TO_AI_HPC_NEOCLOUD', status: 'ADVANCE_CONDITIONAL', note: 'Very strong backlog/demand; heavy debt/capex and strategic supplier overlap elevate CFQ/FD risk.' },
  { ticker: 'AIB', bucket: 'POWER_TO_AI_HPC_NEOCLOUD', status: 'WATCH_HIGH_RISK', note: 'Very early AI-data-center developer with external-capital dependency.' },
  { ticker: 'FUFU', bucket: 'POWER_TO_AI_HPC_NEOCLOUD', status: 'PRIORITY_EARNINGS_INFLECTION', note: 'User-priority watch; no confirmed BUY until operating inflection is verified.' },
  { ticker: 'CHCI', bucket: 'POWER_TO_AI_HPC_NEOCLOUD', status: 'CATEGORY_MISMATCH', note: 'Comstock Holding Companies is a real-estate operator, not a miner-to-HPC peer.' },
  { ticker: 'CCOI', bucket: 'POWER_TO_AI_HPC_NEOCLOUD', status: 'RECLASSIFY_WATCH', note: 'Cogent Communications; digital connectivity/fiber rather than miner-to-HPC.' },
  { ticker: 'AIIA', bucket: 'POWER_TO_AI_HPC_NEOCLOUD', status: 'NO_PASS_OPERATING_SHELL', note: 'Blank-check/SPAC shell; no operating economics to audit as an AI-infrastructure company.' },

  // Energy / LNG
  { ticker: 'BKR', bucket: 'ENERGY_LNG', status: 'ADVANCE' },
  { ticker: 'WMB', bucket: 'ENERGY_LNG', status: 'ADVANCE' },
  { ticker: 'EQT', bucket: 'ENERGY_LNG', status: 'ADVANCE' },
  { ticker: 'EXE', bucket: 'ENERGY_LNG', status: 'ADVANCE_CONDITIONAL', note: 'Integration/funding gate after Twin Eagle acquisition.' },
  { ticker: 'AR', bucket: 'ENERGY_LNG', status: 'ADVANCE' },
  { ticker: 'RRC', bucket: 'ENERGY_LNG', status: 'ADVANCE' },
  { ticker: 'CRK', bucket: 'ENERGY_LNG', status: 'ADVANCE_CONDITIONAL', note: 'Improving economics but high development CAPEX; CFQ scrutiny.' },

  // Europe / Defense / Industrials
  { ticker: 'RHM.DE', bucket: 'EUROPE_DEFENSE_INDUSTRIALS', status: 'ADVANCE_CONDITIONAL', note: 'Huge backlog/demand; guidance/program timing and working-capital/advance-payment effects matter.' },
  { ticker: 'HAG.DE', bucket: 'EUROPE_DEFENSE_INDUSTRIALS', status: 'ADVANCE_CONDITIONAL', note: 'Record backlog; FCF and customer-advance normalization required.' },
  { ticker: 'ATCO-A.ST', bucket: 'EUROPE_DEFENSE_INDUSTRIALS', status: 'ADVANCE' },

  // Hard assets
  { ticker: 'FNV', bucket: 'HARD_ASSETS', status: 'ADVANCE' },
  { ticker: 'NEM', bucket: 'HARD_ASSETS', status: 'ADVANCE' },

  // Financial plumbing
  { ticker: 'CBOE', bucket: 'FINANCIAL_PLUMBING', status: 'ADVANCE' },
  { ticker: 'NDAQ', bucket: 'FINANCIAL_PLUMBING', status: 'ADVANCE' },

  // Discovery
  { ticker: 'FRVO', bucket: 'DISCOVERY', status: 'OPTIONALITY_ONLY', note: 'Fervo Energy; public enhanced-geothermal project execution and project-finance gate.' },
  { ticker: 'KODK', bucket: 'DISCOVERY', status: 'DISCOVERY_ONLY', note: 'Current filing/economic evidence must be recovered before ranking.' },
];

export function assertFuturePortfolioSeparation(): void {
  const duplicates = FUTURE_WATCHLIST_OMEGA
    .map((x) => x.ticker)
    .filter((ticker) => ACTIVE_PORTFOLIO_36.has(ticker));
  if (duplicates.length > 0) {
    throw new Error(`ATLAS Future/Portfolio duplicate violation: ${duplicates.join(', ')}`);
  }
}

export function normalizeFutureTicker(ticker: string): string {
  return FUTURE_IDENTIFIER_NORMALIZATION[ticker] ?? ticker;
}

assertFuturePortfolioSeparation();
