export type AtlasHealth = {
  ok: boolean;
  service: string;
  version?: string;
  finnhub_configured: boolean;
  broker_configured?: boolean;
  broker_environment?: 'demo' | 'live';
  broker_live_enabled?: boolean;
};

export type CompanyBundle = {
  symbol: string;
  source: string;
  generatedAt: string;
  quote: Record<string, unknown>;
  profile: Record<string, unknown>;
  metrics: Record<string, number | string | null>;
  news: Array<Record<string, unknown>>;
  recommendations: Array<Record<string, unknown>>;
  sourceStatus: Record<string, string>;
  guardrail: string;
};

export type MarketQuote = {
  symbol: string;
  name: string;
  sector: string;
  price: number | null;
  change: number | null;
  changePct: number | null;
  open: number | null;
  high: number | null;
  low: number | null;
  previousClose: number | null;
  volume: number | null;
  asOfDate: string | null;
  asOfTime: string | null;
  source: string;
  delayed: boolean;
};

export type MarketSnapshot = {
  source: string;
  delayed: boolean;
  generatedAt: string;
  items: MarketQuote[];
  guardrail: string;
};

export type MarketScanner = {
  source: string;
  delayed: boolean;
  generatedAt: string;
  direction: 'all' | 'up' | 'down';
  count: number;
  items: MarketQuote[];
  guardrail: string;
};

export type MarketSearchItem = { symbol: string; name: string; sector: string };
export type MarketSearch = { query: string; count: number; items: MarketSearchItem[] };

export type MarketHistoryRow = {
  date: string | null;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number;
  volume: number | null;
};

export type MarketHistory = {
  symbol: string;
  source: string;
  delayed: boolean;
  rows: MarketHistoryRow[];
  returns: Record<'5d' | '20d' | '60d' | '252d', number | null>;
  drawdown252: number | null;
};

export type MarketOverview = {
  source: string;
  delayed: boolean;
  generatedAt: string;
  benchmarks: MarketQuote[];
  sectors: MarketQuote[];
  macro: MarketQuote[];
  guardrail: string;
};

export type RotationItem = {
  symbol: string;
  name: string;
  sector: string;
  ret5: number | null;
  ret20: number | null;
  ret60: number | null;
  ret252: number | null;
  drawdown252: number | null;
  phase: string;
  rotationScore: number;
  asOfDate: string | null;
};

export type RotationPayload = {
  engine: string;
  source: string;
  delayed: boolean;
  items: RotationItem[];
  leaders: RotationItem[];
  earlyInflows: RotationItem[];
  guardrail: string;
};

export type DislocationPayload = {
  engine: string;
  source: string;
  delayed: boolean;
  items: RotationItem[];
  guardrail: string;
};

export type TrackedTicker = { ticker: string; symbol?: string; name: string; sector?: string; state?: string };
export type TrackedUniverse = {
  snapshotId: string;
  status: string;
  portfolio: TrackedTicker[];
  portfolioPending: TrackedTicker[];
  watchlist: TrackedTicker[];
  counts: { portfolio: number; pending: number; watchlist: number };
  guardrail: string;
};

export type AtlasAction = 'BUY' | 'NO_BUY' | 'WAIT' | 'ADD' | 'HOLD' | 'REVIEW';
export type AtlasAnalysis = {
  symbol: string;
  context: 'candidate' | 'portfolio' | 'watchlist';
  action: AtlasAction;
  actionLabel: 'COMPRAR' | 'NO COMPRAR' | 'ESPERAR' | 'AÑADIR' | 'MANTENER' | 'REVISAR';
  atlasScore: number | null;
  scoreCoverage: number;
  metricCoverage: number;
  scores: {
    businessQuality: number | null;
    growth: number | null;
    moatProxy: number | null;
    financialQuality: number | null;
    managementProxy: number | null;
    valuation: number | null;
    risk: number | null;
    capexProductivity: number | null;
  };
  engineStates: Record<string, string>;
  capexReason: string;
  reasons: string[];
  flags: { severe: string[]; watch: string[] };
  inputs: Record<string, { value: number; sourceKey: string | null }>;
  rawMetrics: Record<string, number | string | null>;
  generatedAt: string;
  algorithmVersion: string;
  guardrail: string;
};

export type AtlasAnalyzeBundle = {
  symbol: string;
  quote: MarketQuote;
  profile: Record<string, unknown>;
  recommendations: Array<Record<string, unknown>>;
  sourceStatus: Record<string, string>;
  analysis: AtlasAnalysis;
};

export type MonitorItem = {
  item: TrackedTicker;
  ok: boolean;
  symbol?: string;
  quote?: MarketQuote;
  profile?: Record<string, unknown>;
  recommendations?: Array<Record<string, unknown>>;
  sourceStatus?: Record<string, string>;
  analysis?: AtlasAnalysis;
  error?: string;
  statusCode?: number;
};

export type MonitorPage = {
  kind: 'portfolio' | 'watchlist';
  snapshotId: string;
  offset: number;
  limit: number;
  total: number;
  nextOffset: number | null;
  items: MonitorItem[];
  guardrail: string;
};

export type AtlasEngine = { id: string; name: string; state: string; description: string };
export type EnginesPayload = { items: AtlasEngine[]; algorithm: string };
export type AgenticSecurityPayload = {
  engine: string;
  status: string;
  items: Array<{ ticker: string; role: string; state: string }>;
  guardrail: string;
};

export type BrokerStatus = {
  provider: 'Trading212';
  environment: 'demo' | 'live';
  configured: boolean;
  liveTradingEnabled: boolean;
  mode: 'PAPER' | 'LIVE';
  guardrail: string;
};
export type BrokerEnvelope = { provider: 'Trading212'; environment: 'demo' | 'live'; data: unknown };
export type BrokerInstrumentSearch = { query: string; count: number; items: Array<Record<string, unknown>> };
export type MarketOrderInput = {
  ticker: string;
  quantity: number;
  extended_hours?: boolean;
  confirmation: 'EXECUTE_DEMO' | 'EXECUTE_LIVE';
};

type LiveQuote = {
  provider?: string;
  ticker?: string;
  price?: number | null;
  change?: number | null;
  changePct?: number | null;
  open?: number | null;
  high?: number | null;
  low?: number | null;
  previousClose?: number | null;
  timestamp?: string | null;
};

type LiveDecision = {
  symbol?: string;
  decision?: string;
  label?: string;
  buy?: boolean;
  algorithmVersion?: string;
  evidenceCoverage?: number;
  scores?: Record<string, number | null>;
  reasons?: string[];
  inputsUsed?: Record<string, { value: number; sourceKey?: string | null }>;
  generatedAt?: string;
  guardrail?: string;
};

const requestedBase = process.env.EXPO_PUBLIC_ATLAS_API_BASE_URL?.replace(/\/$/, '');
const DEFAULT_PUBLIC_API = 'https://atlas-genesis.onrender.com';
const FORBIDDEN_BASES = ['localhost', '127.0.0.1', '10.0.2.2', 'atlas-genesis-api.onrender.com'];

export function atlasApiBaseUrl(): string {
  if (!requestedBase || FORBIDDEN_BASES.some((value) => requestedBase.includes(value))) return DEFAULT_PUBLIC_API;
  return requestedBase;
}

const PORTFOLIO: TrackedTicker[] = [
  ['MSFT','Microsoft','Cloud / Software'],['AMZN','Amazon','Cloud / Consumer'],['GOOG','Alphabet','Cloud / Internet'],
  ['ORCL','Oracle','Cloud / Software'],['NOW','ServiceNow','Software'],['NVDA','NVIDIA','AI / Semiconductors'],
  ['AVGO','Broadcom','AI / Semiconductors'],['PLTR','Palantir','AI / Software'],['TSM','Taiwan Semiconductor','Semiconductors'],
  ['ASML','ASML Holding','Semiconductor Equipment'],['AMAT','Applied Materials','Semiconductor Equipment'],['LRCX','Lam Research','Semiconductor Equipment'],
  ['KLAC','KLA','Semiconductor Equipment'],['CDNS','Cadence Design Systems','EDA'],['COHR','Coherent','Optics'],
  ['ANET','Arista Networks','Networks'],['APH','Amphenol','Connectivity'],['CLS','Celestica','Infrastructure'],['FN','Fabrinet','Infrastructure'],
  ['ETN','Eaton','Electrical Infrastructure'],['SU','Schneider Electric','Electrical Infrastructure'],['GE','GE Aerospace','Aerospace'],
  ['CSL','Carlisle Companies','Industrials'],['CAT','Caterpillar','Industrials'],['ZBRA','Zebra Technologies','Industrials / Automation'],
  ['LLY','Eli Lilly','Health'],['ABBV','AbbVie','Health'],['TMO','Thermo Fisher Scientific','Health'],['DHR','Danaher','Health'],
  ['V','Visa','Payments'],['MA','Mastercard','Payments'],['BAE','BAE Systems','Defense'],['QLYS','Qualys','Cybersecurity'],
].map((row) => ({ ticker: row[0]!, name: row[1]!, sector: row[2]! }));

const PORTFOLIO_PENDING: TrackedTicker[] = [{ ticker: 'MCK', name: 'McKesson', sector: 'Health', state: 'PENDING' }];

const WATCHLIST: TrackedTicker[] = [
  ['MU','Micron Technology','Semiconductors'],['TER','Teradyne','Semiconductor Equipment'],['VRT','Vertiv','Data Centers'],
  ['IRM','Iron Mountain','Data Centers'],['DLR','Digital Realty','Data Centers'],['EQIX','Equinix','Data Centers'],
  ['PWR','Quanta Services','Electrical Infrastructure'],['CEG','Constellation Energy','Power'],['BE','Bloom Energy','Power'],
  ['CCJ','Cameco','Uranium'],['NEE','NextEra Energy','Utilities'],['FSLR','First Solar','Solar'],['ENPH','Enphase Energy','Solar'],
  ['XEL','Xcel Energy','Utilities'],['BKR','Baker Hughes','Energy'],['SLB','SLB','Energy'],['FANG','Diamondback Energy','Energy'],
  ['EOG','EOG Resources','Energy'],['NEM','Newmont','Gold'],['AEM','Agnico Eagle Mines','Gold'],['WPM','Wheaton Precious Metals','Gold'],
  ['FNV','Franco-Nevada','Gold'],['KGC','Kinross Gold','Gold'],['GLD','SPDR Gold Shares','Gold ETF'],['IAU','iShares Gold Trust','Gold ETF'],
  ['UBER','Uber Technologies','Mobility'],['CELH','Celsius Holdings','Consumer'],['TSLA','Tesla','Automotive'],['SLV','iShares Silver Trust','Silver ETF'],
  ['MRNA','Moderna','Biotech'],['BNTX','BioNTech','Biotech'],['CRSP','CRISPR Therapeutics','Biotech'],['RXRX','Recursion Pharmaceuticals','Biotech / AI'],
  ['REGN','Regeneron Pharmaceuticals','Biotech'],['VRTX','Vertex Pharmaceuticals','Biotech'],['APP','AppLovin','Software / Ads'],
  ['HUBS','HubSpot','Software'],['DDOG','Datadog','Observability'],['NET','Cloudflare','Cloud / Security'],['MDB','MongoDB','Database'],
  ['NFLX','Netflix','Media'],['META','Meta Platforms','Internet'],['LMT','Lockheed Martin','Defense'],['IBM','IBM','Technology'],
  ['IONQ','IonQ','Quantum'],['QBTS','D-Wave Quantum','Quantum'],['RGTI','Rigetti Computing','Quantum'],['QUBT','Quantum Computing Inc.','Quantum'],
].map((row) => ({ ticker: row[0]!, name: row[1]!, sector: row[2]! }));

const MARKET_META: Record<string, { name: string; sector: string }> = {
  SPY: { name: 'S&P 500', sector: 'US Market' }, QQQ: { name: 'Nasdaq 100', sector: 'US Tech' },
  DIA: { name: 'Dow Jones', sector: 'US Blue Chips' }, IWM: { name: 'Russell 2000', sector: 'US Small Caps' },
  XLK: { name: 'Technology', sector: 'Sector ETF' }, XLE: { name: 'Energy', sector: 'Sector ETF' },
  XLF: { name: 'Financials', sector: 'Sector ETF' }, XLV: { name: 'Health Care', sector: 'Sector ETF' },
  GLD: { name: 'Oro', sector: 'Gold' }, SLV: { name: 'Plata', sector: 'Silver' },
  USO: { name: 'Petróleo', sector: 'Oil' }, TLT: { name: 'US Treasuries 20Y+', sector: 'Rates' },
};

async function request<T>(path: string, init?: RequestInit, timeoutMs = 30000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${atlasApiBaseUrl()}${path}`, {
      ...init,
      headers: {
        accept: 'application/json',
        ...(init?.body ? { 'content-type': 'application/json' } : {}),
        ...(init?.headers || {}),
      },
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const detail = typeof payload?.detail === 'string' ? payload.detail
        : typeof payload?.message === 'string' ? payload.message
        : typeof payload?.error === 'string' ? payload.error
        : `ATLAS API HTTP ${response.status}`;
      throw new Error(detail);
    }
    return payload as T;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw new Error('ATLAS API no respondió a tiempo. Reintenta en unos segundos.');
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function numberOrNull(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function quoteMeta(symbol: string) {
  return MARKET_META[symbol] || { name: symbol, sector: 'Mercado' };
}

function liveQuoteToMarket(payload: LiveQuote, symbol: string): MarketQuote {
  const meta = quoteMeta(symbol);
  const stamp = payload.timestamp ? new Date(payload.timestamp) : null;
  return {
    symbol,
    name: meta.name,
    sector: meta.sector,
    price: numberOrNull(payload.price),
    change: numberOrNull(payload.change),
    changePct: numberOrNull(payload.changePct),
    open: numberOrNull(payload.open),
    high: numberOrNull(payload.high),
    low: numberOrNull(payload.low),
    previousClose: numberOrNull(payload.previousClose),
    volume: null,
    asOfDate: stamp && !Number.isNaN(stamp.getTime()) ? stamp.toISOString().slice(0, 10) : null,
    asOfTime: stamp && !Number.isNaN(stamp.getTime()) ? stamp.toISOString().slice(11, 19) : null,
    source: payload.provider || 'Finnhub',
    delayed: true,
  };
}

function companyQuoteToMarket(company: CompanyBundle): MarketQuote {
  const q = company.quote || {};
  const profile = company.profile || {};
  return {
    symbol: company.symbol,
    name: typeof profile.name === 'string' ? profile.name : company.symbol,
    sector: typeof profile.finnhubIndustry === 'string' ? profile.finnhubIndustry : 'Mercado',
    price: numberOrNull(q.c), change: numberOrNull(q.d), changePct: numberOrNull(q.dp),
    open: numberOrNull(q.o), high: numberOrNull(q.h), low: numberOrNull(q.l), previousClose: numberOrNull(q.pc),
    volume: null,
    asOfDate: company.generatedAt ? company.generatedAt.slice(0, 10) : null,
    asOfTime: company.generatedAt ? company.generatedAt.slice(11, 19) : null,
    source: company.source || 'Finnhub', delayed: true,
  };
}

async function quoteMany(symbols: string[]): Promise<MarketQuote[]> {
  const results = await Promise.allSettled(symbols.map((symbol) => AtlasOnlineApi.marketQuote(symbol)));
  return results.flatMap((result) => result.status === 'fulfilled' ? [result.value] : []);
}

function brokerHeaders(controlToken: string): Record<string, string> {
  return { 'x-atlas-broker-token': controlToken.trim() };
}

export const AtlasOnlineApi = {
  health: () => request<AtlasHealth>('/health'),
  company: (ticker: string) => request<CompanyBundle>(`/v1/company/${encodeURIComponent(ticker.trim().toUpperCase())}`),

  marketQuote: async (ticker: string): Promise<MarketQuote> => {
    const symbol = ticker.trim().toUpperCase();
    const payload = await request<LiveQuote>(`/v1/quote/${encodeURIComponent(symbol)}`);
    return liveQuoteToMarket(payload, symbol);
  },

  marketHistory: async (ticker: string, _days = 380): Promise<MarketHistory> => ({
    symbol: ticker.trim().toUpperCase(), source: 'LIVE_BACKEND_COMPAT', delayed: true, rows: [],
    returns: { '5d': null, '20d': null, '60d': null, '252d': null }, drawdown252: null,
  }),

  marketSnapshot: async (): Promise<MarketSnapshot> => ({
    source: 'Finnhub via ATLAS live backend', delayed: true, generatedAt: new Date().toISOString(),
    items: await quoteMany(['SPY','QQQ','DIA','GLD','USO']),
    guardrail: 'Live quotes from the deployed ATLAS backend. Reference/delayed data; not execution prices.',
  }),

  marketOverview: async (): Promise<MarketOverview> => {
    const quotes = await quoteMany(['SPY','QQQ','DIA','IWM','XLK','XLE','XLF','XLV','GLD','SLV','USO','TLT']);
    const by = (symbols: string[]) => quotes.filter((item) => symbols.includes(item.symbol));
    return {
      source: 'Finnhub via ATLAS live backend', delayed: true, generatedAt: new Date().toISOString(),
      benchmarks: by(['SPY','QQQ','DIA','IWM']), sectors: by(['XLK','XLE','XLF','XLV']), macro: by(['GLD','SLV','USO','TLT']),
      guardrail: 'Live compatibility layer over the currently deployed ATLAS backend.',
    };
  },

  marketRotation: async (): Promise<RotationPayload> => ({
    engine: 'Money Rotation Ω', source: 'LIVE_BACKEND_COMPAT', delayed: true, items: [], leaders: [], earlyInflows: [],
    guardrail: 'The deployed backend does not expose multi-period history. ATLAS leaves R3/R4 empty instead of fabricating rotation signals.',
  }),

  marketDislocation: async (_limit = 15): Promise<DislocationPayload> => ({
    engine: 'Historical Dislocation Ω', source: 'LIVE_BACKEND_COMPAT', delayed: true, items: [],
    guardrail: 'Historical dislocation is unavailable on the deployed backend and is not synthesized from one-day quotes.',
  }),

  marketScanner: async (direction: 'all' | 'up' | 'down' = 'all', limit = 20): Promise<MarketScanner> => {
    const quotes = await quoteMany(['SPY','QQQ','DIA','IWM','XLK','XLE','XLF','XLV','GLD','SLV','USO','TLT']);
    const filtered = quotes.filter((item) => direction === 'all' || (direction === 'up' ? (item.changePct ?? 0) > 0 : (item.changePct ?? 0) < 0));
    filtered.sort((a, b) => Math.abs(b.changePct ?? 0) - Math.abs(a.changePct ?? 0));
    return {
      source: 'Finnhub via ATLAS live backend', delayed: true, generatedAt: new Date().toISOString(), direction,
      count: filtered.length, items: filtered.slice(0, limit),
      guardrail: 'Scanner uses the live deployed quote endpoint; reference/delayed data only.',
    };
  },

  marketSearch: async (query: string, limit = 12): Promise<MarketSearch> => {
    const clean = query.trim();
    if (/^[A-Za-z0-9.\-]{1,20}$/.test(clean)) {
      const symbol = clean.toUpperCase();
      return { query: clean, count: 1, items: [{ symbol, name: symbol, sector: 'Ticker' }] };
    }
    const raw = await request<{ items?: Array<Record<string, unknown>> }>(`/v1/discovery?q=${encodeURIComponent(clean)}`);
    const items = (raw.items || []).flatMap((item) => {
      const symbol = String(item.symbol || item.ticker || '').trim().toUpperCase();
      if (!symbol) return [];
      return [{ symbol, name: String(item.name || symbol), sector: String(item.sector || item.industry || 'Mercado') }];
    }).slice(0, limit);
    return { query: clean, count: items.length, items };
  },

  atlasUniverse: async (): Promise<TrackedUniverse> => ({
    snapshotId: 'ATLAS-MOBILE-LIVE-COMPAT-2026-08-10', status: 'LIVE_COMPATIBILITY',
    portfolio: PORTFOLIO, portfolioPending: PORTFOLIO_PENDING, watchlist: WATCHLIST,
    counts: { portfolio: PORTFOLIO.length, pending: PORTFOLIO_PENDING.length, watchlist: WATCHLIST.length },
    guardrail: 'Tracked lists are bundled as a continuity fallback because the deployed v0.4 backend does not expose /v1/atlas/universe. Quotes and company analysis remain live.',
  }),

  atlasAnalyze: async (ticker: string, context: 'candidate' | 'portfolio' | 'watchlist' = 'candidate'): Promise<AtlasAnalyzeBundle> => {
    const symbol = ticker.trim().toUpperCase();
    const [company, decision] = await Promise.all([
      request<CompanyBundle>(`/v1/company/${encodeURIComponent(symbol)}`),
      request<LiveDecision>(`/v1/decision/${encodeURIComponent(symbol)}`),
    ]);
    const buy = Boolean(decision.buy || String(decision.decision || '').toUpperCase() === 'BUY');
    const action: AtlasAction = context === 'portfolio' ? (buy ? 'HOLD' : 'REVIEW') : (buy ? 'BUY' : 'NO_BUY');
    const actionLabel: AtlasAnalysis['actionLabel'] = context === 'portfolio' ? (buy ? 'MANTENER' : 'REVISAR') : (buy ? 'COMPRAR' : 'NO COMPRAR');
    const scores = decision.scores || {};
    const coverage = numberOrNull(decision.evidenceCoverage) ?? 0;
    const inputs: AtlasAnalysis['inputs'] = {};
    for (const [key, value] of Object.entries(decision.inputsUsed || {})) {
      if (value && typeof value.value === 'number') inputs[key] = { value: value.value, sourceKey: value.sourceKey ?? null };
    }
    const analysis: AtlasAnalysis = {
      symbol, context, action, actionLabel,
      atlasScore: numberOrNull(scores.decisionScore), scoreCoverage: coverage, metricCoverage: coverage,
      scores: {
        businessQuality: numberOrNull(scores.quality), growth: numberOrNull(scores.growth), moatProxy: null,
        financialQuality: null, managementProxy: null, valuation: numberOrNull(scores.valuation), risk: numberOrNull(scores.risk), capexProductivity: null,
      },
      engineStates: {
        businessQuality: 'LIVE', growth: 'LIVE', moat: 'UNAVAILABLE', financialQuality: 'UNAVAILABLE', management: 'UNAVAILABLE',
        valuation: 'LIVE', risk: 'LIVE', capexProductivity: 'UNAVAILABLE',
      },
      capexReason: 'CAPEX Productivity Ω no está expuesto por el backend público v0.4; se mantiene no disponible en vez de fabricar un score.',
      reasons: Array.isArray(decision.reasons) ? decision.reasons : [], flags: { severe: [], watch: [] }, inputs,
      rawMetrics: company.metrics || {}, generatedAt: decision.generatedAt || company.generatedAt || new Date().toISOString(),
      algorithmVersion: decision.algorithmVersion || 'ATLAS-DECISION-SENSOR-v1.0.0',
      guardrail: decision.guardrail || 'Decision support only. No broker order is placed by this analysis endpoint.',
    };
    return {
      symbol, quote: companyQuoteToMarket(company), profile: company.profile || {}, recommendations: company.recommendations || [],
      sourceStatus: company.sourceStatus || {}, analysis,
    };
  },

  atlasMonitor: async (kind: 'portfolio' | 'watchlist', offset = 0, limit = 8): Promise<MonitorPage> => {
    const source = kind === 'portfolio' ? PORTFOLIO : WATCHLIST;
    const boundedLimit = Math.max(1, Math.min(limit, 6));
    const slice = source.slice(offset, offset + boundedLimit);
    const items: MonitorItem[] = await Promise.all(slice.map(async (item) => {
      const symbol = (item.symbol || item.ticker).trim().toUpperCase();
      try {
        const bundle = await AtlasOnlineApi.atlasAnalyze(symbol, kind);
        return { item, ok: true, symbol, quote: bundle.quote, profile: bundle.profile, recommendations: bundle.recommendations, sourceStatus: bundle.sourceStatus, analysis: bundle.analysis };
      } catch (error) {
        return { item, ok: false, symbol, error: error instanceof Error ? error.message : String(error) };
      }
    }));
    const nextOffset = offset + boundedLimit < source.length ? offset + boundedLimit : null;
    return {
      kind, snapshotId: 'ATLAS-MOBILE-LIVE-COMPAT-2026-08-10', offset, limit: boundedLimit, total: source.length, nextOffset, items,
      guardrail: 'Portfolio/watchlist identities are local continuity data; quote, company and decision layers are fetched online from the deployed ATLAS backend.',
    };
  },

  atlasEngines: async (): Promise<EnginesPayload> => ({
    algorithm: 'ATLAS-LIVE-COMPAT-v1',
    items: [
      { id: 'business-quality', name: 'Business Quality Ω', state: 'LIVE', description: 'Quality sensor from the deployed decision endpoint.' },
      { id: 'growth', name: 'Growth Ω', state: 'LIVE', description: 'Growth sensor from the deployed decision endpoint.' },
      { id: 'valuation', name: 'Valuation Ω', state: 'LIVE', description: 'Valuation sensor from the deployed decision endpoint.' },
      { id: 'risk', name: 'Risk Ω', state: 'LIVE', description: 'Risk sensor from the deployed decision endpoint.' },
      { id: 'capex', name: 'CAPEX Productivity Ω', state: 'UNAVAILABLE', description: 'Not exposed by the currently deployed v0.4 public backend.' },
      { id: 'rotation', name: 'Money Rotation Ω', state: 'UNAVAILABLE', description: 'Requires multi-period history not exposed by the current public backend.' },
    ],
  }),

  agenticSecurity: async (): Promise<AgenticSecurityPayload> => ({
    engine: 'Agentic Security Discovery Ω', status: 'UNAVAILABLE_ON_DEPLOYED_BACKEND', items: [],
    guardrail: 'No agentic-security state is fabricated when the public backend does not expose it.',
  }),

  brokerStatus: () => request<BrokerStatus>('/v1/broker/status'),
  brokerAccount: (controlToken: string) => request<BrokerEnvelope>('/v1/broker/account', { headers: brokerHeaders(controlToken) }),
  brokerPositions: (controlToken: string) => request<BrokerEnvelope>('/v1/broker/positions', { headers: brokerHeaders(controlToken) }),
  brokerOrders: (controlToken: string) => request<BrokerEnvelope>('/v1/broker/orders', { headers: brokerHeaders(controlToken) }),
  brokerInstrumentSearch: (query: string, controlToken: string) => request<BrokerInstrumentSearch>(`/v1/broker/instruments/search?q=${encodeURIComponent(query.trim())}`, { headers: brokerHeaders(controlToken) }),
  brokerMarketOrder: (input: MarketOrderInput, controlToken: string) => request<Record<string, unknown>>('/v1/broker/orders/market', {
    method: 'POST', headers: brokerHeaders(controlToken), body: JSON.stringify(input),
  }),
  brokerCancelOrder: (orderId: number, controlToken: string) => request<Record<string, unknown>>(`/v1/broker/orders/${orderId}`, {
    method: 'DELETE', headers: brokerHeaders(controlToken),
  }),
};
