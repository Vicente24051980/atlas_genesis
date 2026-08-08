export type CanonicalWatchlistSeed = {
  ticker: string;
  companyName: string;
  state: 'WATCHLIST' | 'DISCOVERY';
};

// Versioned bootstrap only. Broker reconciliation removes any ticker already held
// in the live portfolio so portfolio and watchlist never duplicate each other.
export const CANONICAL_WATCHLIST_SEED: CanonicalWatchlistSeed[] = [
  { ticker: 'IDXX', companyName: 'IDEXX Laboratories', state: 'WATCHLIST' },
  { ticker: 'CRL', companyName: 'Charles River Laboratories', state: 'WATCHLIST' },
  { ticker: 'EAT', companyName: 'Brinker International', state: 'WATCHLIST' },
  { ticker: 'FANG', companyName: 'Diamondback Energy', state: 'WATCHLIST' },
  { ticker: 'BHP', companyName: 'BHP Group', state: 'WATCHLIST' },
  { ticker: 'AEM', companyName: 'Agnico Eagle Mines', state: 'WATCHLIST' },
  { ticker: 'LLY', companyName: 'Eli Lilly and Company', state: 'WATCHLIST' },
  { ticker: 'MCK', companyName: 'McKesson Corporation', state: 'WATCHLIST' },
  { ticker: 'COR', companyName: 'Cencora', state: 'WATCHLIST' },
  { ticker: 'ABT', companyName: 'Abbott Laboratories', state: 'WATCHLIST' },
  { ticker: 'ABBV', companyName: 'AbbVie', state: 'WATCHLIST' },
  { ticker: 'BSX', companyName: 'Boston Scientific', state: 'WATCHLIST' },
  { ticker: 'LMT', companyName: 'Lockheed Martin', state: 'WATCHLIST' },
  { ticker: 'OVV', companyName: 'Ovintiv', state: 'WATCHLIST' },
  { ticker: 'TER', companyName: 'Teradyne', state: 'WATCHLIST' },
  { ticker: 'ICE', companyName: 'Intercontinental Exchange', state: 'WATCHLIST' },
  { ticker: 'GOOG', companyName: 'Alphabet', state: 'WATCHLIST' },
  { ticker: 'NFLX', companyName: 'Netflix', state: 'WATCHLIST' },
  { ticker: 'META', companyName: 'Meta Platforms', state: 'WATCHLIST' },
  { ticker: 'MSFT', companyName: 'Microsoft', state: 'WATCHLIST' },
  { ticker: 'PLTR', companyName: 'Palantir Technologies', state: 'WATCHLIST' },
  { ticker: 'SPCX', companyName: 'SpaceX', state: 'WATCHLIST' },
  { ticker: 'UBER', companyName: 'Uber Technologies', state: 'WATCHLIST' },
  { ticker: 'CELH', companyName: 'Celsius Holdings', state: 'WATCHLIST' },
  { ticker: 'NVDA', companyName: 'NVIDIA', state: 'WATCHLIST' },
  { ticker: 'AVGO', companyName: 'Broadcom', state: 'WATCHLIST' },
  { ticker: 'ORCL', companyName: 'Oracle', state: 'WATCHLIST' },
  { ticker: 'TSLA', companyName: 'Tesla', state: 'WATCHLIST' },
  { ticker: 'SLV', companyName: 'iShares Silver Trust', state: 'WATCHLIST' },

  // Current unbiased discovery cohort: memory + storage + semiconductors.
  { ticker: 'MU', companyName: 'Micron Technology', state: 'DISCOVERY' },
  { ticker: 'STX', companyName: 'Seagate Technology', state: 'DISCOVERY' },
  { ticker: 'WDC', companyName: 'Western Digital', state: 'DISCOVERY' },
  { ticker: 'SNDK', companyName: 'Sandisk', state: 'DISCOVERY' },
  { ticker: 'INTC', companyName: 'Intel', state: 'DISCOVERY' },
  { ticker: 'NBIS', companyName: 'Nebius Group', state: 'DISCOVERY' },
  { ticker: 'AMD', companyName: 'Advanced Micro Devices', state: 'DISCOVERY' },
  { ticker: 'MRVL', companyName: 'Marvell Technology', state: 'DISCOVERY' },
  { ticker: 'ARM', companyName: 'Arm Holdings', state: 'DISCOVERY' },
];
