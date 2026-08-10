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

export type MarketSearchItem = {
  symbol: string;
  name: string;
  sector: string;
};

export type MarketSearch = {
  query: string;
  count: number;
  items: MarketSearchItem[];
};

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

export type TrackedTicker = {
  ticker: string;
  symbol?: string;
  name: string;
  sector?: string;
  state?: string;
};

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

export type AtlasEngine = {
  id: string;
  name: string;
  state: string;
  description: string;
};

export type EnginesPayload = {
  items: AtlasEngine[];
  algorithm: string;
};

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

export type BrokerEnvelope = {
  provider: 'Trading212';
  environment: 'demo' | 'live';
  data: unknown;
};

export type BrokerInstrumentSearch = {
  query: string;
  count: number;
  items: Array<Record<string, unknown>>;
};

export type MarketOrderInput = {
  ticker: string;
  quantity: number;
  extended_hours?: boolean;
  confirmation: 'EXECUTE_DEMO' | 'EXECUTE_LIVE';
};

const configuredBase = process.env.EXPO_PUBLIC_ATLAS_API_BASE_URL?.replace(/\/$/, '');
const DEFAULT_PUBLIC_API = 'https://atlas-genesis.onrender.com';

export function atlasApiBaseUrl(): string {
  return configuredBase || DEFAULT_PUBLIC_API;
}

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
      const detail = typeof payload?.detail === 'string'
        ? payload.detail
        : typeof payload?.message === 'string'
          ? payload.message
          : payload?.detail
            ? JSON.stringify(payload.detail)
            : `ATLAS API HTTP ${response.status}`;
      throw new Error(detail);
    }
    return payload as T;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('ATLAS API no respondió a tiempo. Reintenta en unos segundos.');
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function brokerHeaders(controlToken: string): Record<string, string> {
  return { 'x-atlas-broker-token': controlToken.trim() };
}

export const AtlasOnlineApi = {
  health: () => request<AtlasHealth>('/health'),
  company: (ticker: string) => request<CompanyBundle>(`/v1/company/${encodeURIComponent(ticker.trim().toUpperCase())}`),

  marketQuote: (ticker: string) => request<MarketQuote>(`/v1/market/quote/${encodeURIComponent(ticker.trim().toUpperCase())}`),
  marketHistory: (ticker: string, days = 380) => request<MarketHistory>(`/v1/market/history/${encodeURIComponent(ticker.trim().toUpperCase())}?days=${days}`, undefined, 35000),
  marketSnapshot: () => request<MarketSnapshot>('/v1/market/snapshot', undefined, 35000),
  marketOverview: () => request<MarketOverview>('/v1/market/overview', undefined, 45000),
  marketRotation: () => request<RotationPayload>('/v1/market/rotation', undefined, 60000),
  marketDislocation: (limit = 15) => request<DislocationPayload>(`/v1/market/dislocation?limit=${limit}`, undefined, 60000),
  marketScanner: (direction: 'all' | 'up' | 'down' = 'all', limit = 20) => request<MarketScanner>(`/v1/market/scanner?direction=${direction}&limit=${limit}`, undefined, 45000),
  marketSearch: (query: string, limit = 12) => request<MarketSearch>(`/v1/market/search?q=${encodeURIComponent(query.trim())}&limit=${limit}`),

  atlasUniverse: () => request<TrackedUniverse>('/v1/atlas/universe'),
  atlasAnalyze: (ticker: string, context: 'candidate' | 'portfolio' | 'watchlist' = 'candidate') => request<AtlasAnalyzeBundle>(`/v1/atlas/analyze/${encodeURIComponent(ticker.trim().toUpperCase())}?context=${context}`, undefined, 45000),
  atlasMonitor: (kind: 'portfolio' | 'watchlist', offset = 0, limit = 8) => request<MonitorPage>(`/v1/atlas/monitor/${kind}?offset=${offset}&limit=${limit}`, undefined, 70000),
  atlasEngines: () => request<EnginesPayload>('/v1/atlas/engines'),
  agenticSecurity: () => request<AgenticSecurityPayload>('/v1/atlas/agentic-security'),

  brokerStatus: () => request<BrokerStatus>('/v1/broker/status'),
  brokerAccount: (controlToken: string) => request<BrokerEnvelope>('/v1/broker/account', { headers: brokerHeaders(controlToken) }),
  brokerPositions: (controlToken: string) => request<BrokerEnvelope>('/v1/broker/positions', { headers: brokerHeaders(controlToken) }),
  brokerOrders: (controlToken: string) => request<BrokerEnvelope>('/v1/broker/orders', { headers: brokerHeaders(controlToken) }),
  brokerInstrumentSearch: (query: string, controlToken: string) => request<BrokerInstrumentSearch>(`/v1/broker/instruments/search?q=${encodeURIComponent(query.trim())}`, { headers: brokerHeaders(controlToken) }),
  brokerMarketOrder: (input: MarketOrderInput, controlToken: string) => request<Record<string, unknown>>('/v1/broker/orders/market', {
    method: 'POST',
    headers: brokerHeaders(controlToken),
    body: JSON.stringify(input),
  }),
  brokerCancelOrder: (orderId: number, controlToken: string) => request<Record<string, unknown>>(`/v1/broker/orders/${orderId}`, {
    method: 'DELETE',
    headers: brokerHeaders(controlToken),
  }),
};
