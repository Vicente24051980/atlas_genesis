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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
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
  marketSnapshot: () => request<MarketSnapshot>('/v1/market/snapshot'),
  marketScanner: (direction: 'all' | 'up' | 'down' = 'all', limit = 20) => request<MarketScanner>(`/v1/market/scanner?direction=${direction}&limit=${limit}`),
  marketSearch: (query: string, limit = 12) => request<MarketSearch>(`/v1/market/search?q=${encodeURIComponent(query.trim())}&limit=${limit}`),
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
