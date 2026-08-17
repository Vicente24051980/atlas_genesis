export type CapitalDestinationTag =
  | 'MEMORY_STORAGE'
  | 'SEMICONDUCTOR_EQUIPMENT'
  | 'NETWORKING_OPTICS'
  | 'GRID_ELECTRIFICATION'
  | 'POWER_GENERATION'
  | 'COOLING_THERMAL'
  | 'DATA_CENTER_CONSTRUCTION'
  | 'BUILDING_MATERIALS'
  | 'TRANSPORT_LOGISTICS'
  | 'SOFTWARE_FALSE_AI_DISRUPTION'
  | 'HOME_BUILDERS'
  | 'ENERGY_SECURITY'
  | 'FINANCIAL_RAILS_INSURANCE'
  | 'GOLD_REAL_ASSETS';

export type CapitalDestinationWatchRecord = {
  ticker: string;
  company: string;
  primaryTag: CapitalDestinationTag;
  secondaryTags?: readonly CapitalDestinationTag[];
  status: 'ACTIVE_RESEARCH' | 'WATCH' | 'EVENT_MONITOR' | 'DATA_PENDING';
};

// Research/watchlist only. This file does NOT change Portfolio 36, Future Watchlist,
// the frozen 60-company test universe, or any motor-specific BUY state.
// One ticker = one record. Cross-destination exposure is expressed with secondaryTags.
export const CAPITAL_DESTINATION_WATCHLIST_OMEGA: readonly CapitalDestinationWatchRecord[] = [
  { ticker: 'MU', company: 'Micron Technology', primaryTag: 'MEMORY_STORAGE', status: 'ACTIVE_RESEARCH' },
  { ticker: 'SNDK', company: 'SanDisk', primaryTag: 'MEMORY_STORAGE', status: 'ACTIVE_RESEARCH' },
  { ticker: 'WDC', company: 'Western Digital', primaryTag: 'MEMORY_STORAGE', status: 'WATCH' },
  { ticker: 'STX', company: 'Seagate Technology', primaryTag: 'MEMORY_STORAGE', status: 'WATCH' },
  { ticker: '000660.KS', company: 'SK hynix', primaryTag: 'MEMORY_STORAGE', status: 'ACTIVE_RESEARCH' },
  { ticker: '005930.KS', company: 'Samsung Electronics', primaryTag: 'MEMORY_STORAGE', secondaryTags: ['SEMICONDUCTOR_EQUIPMENT'], status: 'WATCH' },

  { ticker: 'LRCX', company: 'Lam Research', primaryTag: 'SEMICONDUCTOR_EQUIPMENT', status: 'ACTIVE_RESEARCH' },
  { ticker: 'AMAT', company: 'Applied Materials', primaryTag: 'SEMICONDUCTOR_EQUIPMENT', status: 'ACTIVE_RESEARCH' },
  { ticker: 'KLAC', company: 'KLA', primaryTag: 'SEMICONDUCTOR_EQUIPMENT', status: 'ACTIVE_RESEARCH' },
  { ticker: 'ASML', company: 'ASML Holding', primaryTag: 'SEMICONDUCTOR_EQUIPMENT', status: 'ACTIVE_RESEARCH' },
  { ticker: 'TSM', company: 'Taiwan Semiconductor Manufacturing', primaryTag: 'SEMICONDUCTOR_EQUIPMENT', status: 'ACTIVE_RESEARCH' },

  { ticker: 'ANET', company: 'Arista Networks', primaryTag: 'NETWORKING_OPTICS', status: 'ACTIVE_RESEARCH' },
  { ticker: 'APH', company: 'Amphenol', primaryTag: 'NETWORKING_OPTICS', status: 'ACTIVE_RESEARCH' },
  { ticker: 'CRDO', company: 'Credo Technology', primaryTag: 'NETWORKING_OPTICS', status: 'ACTIVE_RESEARCH' },
  { ticker: 'MRVL', company: 'Marvell Technology', primaryTag: 'NETWORKING_OPTICS', status: 'ACTIVE_RESEARCH' },
  { ticker: 'LITE', company: 'Lumentum', primaryTag: 'NETWORKING_OPTICS', status: 'WATCH' },
  { ticker: 'COHR', company: 'Coherent', primaryTag: 'NETWORKING_OPTICS', status: 'WATCH' },

  { ticker: 'GEV', company: 'GE Vernova', primaryTag: 'GRID_ELECTRIFICATION', secondaryTags: ['POWER_GENERATION'], status: 'ACTIVE_RESEARCH' },
  { ticker: 'ETN', company: 'Eaton', primaryTag: 'GRID_ELECTRIFICATION', status: 'ACTIVE_RESEARCH' },
  { ticker: 'SU.PA', company: 'Schneider Electric', primaryTag: 'GRID_ELECTRIFICATION', secondaryTags: ['COOLING_THERMAL'], status: 'ACTIVE_RESEARCH' },
  { ticker: 'HUBB', company: 'Hubbell', primaryTag: 'GRID_ELECTRIFICATION', status: 'ACTIVE_RESEARCH' },
  { ticker: 'POWL', company: 'Powell Industries', primaryTag: 'GRID_ELECTRIFICATION', status: 'ACTIVE_RESEARCH' },
  { ticker: 'ABB', company: 'ABB', primaryTag: 'GRID_ELECTRIFICATION', status: 'WATCH' },

  { ticker: 'VST', company: 'Vistra', primaryTag: 'POWER_GENERATION', status: 'ACTIVE_RESEARCH' },
  { ticker: 'CEG', company: 'Constellation Energy', primaryTag: 'POWER_GENERATION', status: 'WATCH' },
  { ticker: 'BE', company: 'Bloom Energy', primaryTag: 'POWER_GENERATION', status: 'WATCH' },
  { ticker: 'NRG', company: 'NRG Energy', primaryTag: 'POWER_GENERATION', status: 'WATCH' },

  { ticker: 'VRT', company: 'Vertiv', primaryTag: 'COOLING_THERMAL', secondaryTags: ['GRID_ELECTRIFICATION'], status: 'ACTIVE_RESEARCH' },
  { ticker: 'TT', company: 'Trane Technologies', primaryTag: 'COOLING_THERMAL', status: 'ACTIVE_RESEARCH' },
  { ticker: 'JCI', company: 'Johnson Controls', primaryTag: 'COOLING_THERMAL', status: 'ACTIVE_RESEARCH' },
  { ticker: 'NVT', company: 'nVent Electric', primaryTag: 'COOLING_THERMAL', secondaryTags: ['GRID_ELECTRIFICATION'], status: 'ACTIVE_RESEARCH' },

  { ticker: 'PWR', company: 'Quanta Services', primaryTag: 'DATA_CENTER_CONSTRUCTION', secondaryTags: ['GRID_ELECTRIFICATION'], status: 'ACTIVE_RESEARCH' },
  { ticker: 'FIX', company: 'Comfort Systems USA', primaryTag: 'DATA_CENTER_CONSTRUCTION', secondaryTags: ['COOLING_THERMAL'], status: 'ACTIVE_RESEARCH' },
  { ticker: 'EME', company: 'EMCOR Group', primaryTag: 'DATA_CENTER_CONSTRUCTION', status: 'ACTIVE_RESEARCH' },
  { ticker: 'TTEK', company: 'Tetra Tech', primaryTag: 'DATA_CENTER_CONSTRUCTION', status: 'WATCH' },
  { ticker: 'ACM', company: 'AECOM', primaryTag: 'DATA_CENTER_CONSTRUCTION', status: 'WATCH' },

  { ticker: 'CRH', company: 'CRH', primaryTag: 'BUILDING_MATERIALS', status: 'ACTIVE_RESEARCH' },
  { ticker: 'VMC', company: 'Vulcan Materials', primaryTag: 'BUILDING_MATERIALS', status: 'WATCH' },
  { ticker: 'MLM', company: 'Martin Marietta Materials', primaryTag: 'BUILDING_MATERIALS', status: 'WATCH' },
  { ticker: 'URI', company: 'United Rentals', primaryTag: 'BUILDING_MATERIALS', secondaryTags: ['DATA_CENTER_CONSTRUCTION'], status: 'WATCH' },
  { ticker: 'CAT', company: 'Caterpillar', primaryTag: 'BUILDING_MATERIALS', secondaryTags: ['POWER_GENERATION'], status: 'ACTIVE_RESEARCH' },

  { ticker: 'UNP', company: 'Union Pacific', primaryTag: 'TRANSPORT_LOGISTICS', status: 'DATA_PENDING' },
  { ticker: 'CSX', company: 'CSX', primaryTag: 'TRANSPORT_LOGISTICS', status: 'DATA_PENDING' },
  { ticker: 'FDX', company: 'FedEx', primaryTag: 'TRANSPORT_LOGISTICS', status: 'DATA_PENDING' },
  { ticker: 'GXO', company: 'GXO Logistics', primaryTag: 'TRANSPORT_LOGISTICS', status: 'DATA_PENDING' },

  { ticker: 'CRM', company: 'Salesforce', primaryTag: 'SOFTWARE_FALSE_AI_DISRUPTION', status: 'ACTIVE_RESEARCH' },
  { ticker: 'NOW', company: 'ServiceNow', primaryTag: 'SOFTWARE_FALSE_AI_DISRUPTION', status: 'ACTIVE_RESEARCH' },
  { ticker: 'ADBE', company: 'Adobe', primaryTag: 'SOFTWARE_FALSE_AI_DISRUPTION', status: 'ACTIVE_RESEARCH' },
  { ticker: 'ADSK', company: 'Autodesk', primaryTag: 'SOFTWARE_FALSE_AI_DISRUPTION', status: 'WATCH' },
  { ticker: 'TEAM', company: 'Atlassian', primaryTag: 'SOFTWARE_FALSE_AI_DISRUPTION', status: 'WATCH' },
  { ticker: 'HUBS', company: 'HubSpot', primaryTag: 'SOFTWARE_FALSE_AI_DISRUPTION', status: 'WATCH' },
  { ticker: 'DDOG', company: 'Datadog', primaryTag: 'SOFTWARE_FALSE_AI_DISRUPTION', status: 'WATCH' },
  { ticker: 'NET', company: 'Cloudflare', primaryTag: 'SOFTWARE_FALSE_AI_DISRUPTION', status: 'WATCH' },
  { ticker: 'MNDY', company: 'monday.com', primaryTag: 'SOFTWARE_FALSE_AI_DISRUPTION', status: 'WATCH' },
  { ticker: 'GTLB', company: 'GitLab', primaryTag: 'SOFTWARE_FALSE_AI_DISRUPTION', status: 'WATCH' },
  { ticker: 'ZM', company: 'Zoom Communications', primaryTag: 'SOFTWARE_FALSE_AI_DISRUPTION', status: 'WATCH' },
  { ticker: 'DOCU', company: 'DocuSign', primaryTag: 'SOFTWARE_FALSE_AI_DISRUPTION', status: 'WATCH' },
  { ticker: 'OKTA', company: 'Okta', primaryTag: 'SOFTWARE_FALSE_AI_DISRUPTION', status: 'WATCH' },
  { ticker: 'PATH', company: 'UiPath', primaryTag: 'SOFTWARE_FALSE_AI_DISRUPTION', status: 'WATCH' },
  { ticker: 'BRZE', company: 'Braze', primaryTag: 'SOFTWARE_FALSE_AI_DISRUPTION', status: 'WATCH' },
  { ticker: 'WDAY', company: 'Workday', primaryTag: 'SOFTWARE_FALSE_AI_DISRUPTION', status: 'EVENT_MONITOR' },

  { ticker: 'DHI', company: 'D.R. Horton', primaryTag: 'HOME_BUILDERS', status: 'ACTIVE_RESEARCH' },
  { ticker: 'LEN', company: 'Lennar', primaryTag: 'HOME_BUILDERS', status: 'ACTIVE_RESEARCH' },
  { ticker: 'PHM', company: 'PulteGroup', primaryTag: 'HOME_BUILDERS', status: 'ACTIVE_RESEARCH' },
  { ticker: 'TOL', company: 'Toll Brothers', primaryTag: 'HOME_BUILDERS', status: 'WATCH' },
  { ticker: 'NVR', company: 'NVR', primaryTag: 'HOME_BUILDERS', status: 'WATCH' },

  { ticker: 'LNG', company: 'Cheniere Energy', primaryTag: 'ENERGY_SECURITY', status: 'ACTIVE_RESEARCH' },
  { ticker: 'BKR', company: 'Baker Hughes', primaryTag: 'ENERGY_SECURITY', secondaryTags: ['POWER_GENERATION'], status: 'ACTIVE_RESEARCH' },

  { ticker: 'CB', company: 'Chubb', primaryTag: 'FINANCIAL_RAILS_INSURANCE', status: 'ACTIVE_RESEARCH' },
  { ticker: 'ICE', company: 'Intercontinental Exchange', primaryTag: 'FINANCIAL_RAILS_INSURANCE', status: 'WATCH' },
  { ticker: 'V', company: 'Visa', primaryTag: 'FINANCIAL_RAILS_INSURANCE', status: 'WATCH' },
  { ticker: 'MA', company: 'Mastercard', primaryTag: 'FINANCIAL_RAILS_INSURANCE', status: 'WATCH' },

  { ticker: 'AEM', company: 'Agnico Eagle Mines', primaryTag: 'GOLD_REAL_ASSETS', status: 'ACTIVE_RESEARCH' },
];

export const CAPITAL_DESTINATION_WATCHLIST_TICKERS = CAPITAL_DESTINATION_WATCHLIST_OMEGA.map((x) => x.ticker);

export function assertCapitalDestinationWatchlistUnique(): true {
  const unique = new Set(CAPITAL_DESTINATION_WATCHLIST_TICKERS);
  if (unique.size !== CAPITAL_DESTINATION_WATCHLIST_TICKERS.length) throw new Error('capital_destination_watchlist_duplicate_ticker');
  return true;
}
