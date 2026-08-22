import { apiBaseUrl } from './mobileApi';

export type BrokerStatus = {
  provider: 'Trading212';
  apiVersion: string;
  environment: 'demo' | 'live';
  mode: 'PAPER' | 'LIVE';
  credentialsConfigured: boolean;
  controlTokenConfigured: boolean;
  readReady: boolean;
  liveTradingEnabled: boolean;
  liveExecutionLocked: boolean;
  secretsExposed: boolean;
  guardrails: string[];
};

export type BrokerEnvelope<T = unknown> = {
  provider: 'Trading212';
  environment: 'demo' | 'live';
  mode: 'PAPER' | 'LIVE';
  data: T;
  rateLimit: {
    limit: string | null;
    period: string | null;
    remaining: string | null;
    reset: string | null;
    used: string | null;
  };
};

export type MarketOrderInput = {
  ticker: string;
  quantity: number;
  extendedHours?: boolean;
  confirmation: 'EXECUTE_DEMO' | 'EXECUTE_LIVE';
  clientRequestId: string;
};

export type LimitOrderInput = {
  ticker: string;
  quantity: number;
  limitPrice: number;
  timeValidity?: 'DAY' | 'GOOD_TILL_CANCEL';
  confirmation: 'EXECUTE_DEMO' | 'EXECUTE_LIVE';
  clientRequestId: string;
};

export type StopOrderInput = {
  ticker: string;
  quantity: number;
  stopPrice: number;
  timeValidity?: 'DAY' | 'GOOD_TILL_CANCEL';
  confirmation: 'EXECUTE_DEMO' | 'EXECUTE_LIVE';
  clientRequestId: string;
};

export type StopLimitOrderInput = StopOrderInput & { limitPrice: number };

const EMPTY_RATE: BrokerEnvelope['rateLimit'] = {
  limit: null,
  period: null,
  remaining: null,
  reset: null,
  used: null,
};

class ApiHttpError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = 'ApiHttpError';
    this.status = status;
    this.payload = payload;
  }
}

function row(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}

function asText(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  return typeof value === 'string' ? value : String(value);
}

function environment(value: unknown): 'demo' | 'live' {
  return typeof value === 'string' && value.toLowerCase() === 'live' ? 'live' : 'demo';
}

function mode(value: unknown, env: 'demo' | 'live'): 'PAPER' | 'LIVE' {
  if (value === 'LIVE' || value === 'PAPER') return value;
  return env === 'live' ? 'LIVE' : 'PAPER';
}

function errorDetail(payload: unknown, fallback: string): string {
  const body = row(payload);
  const detail = body.detail;
  if (typeof detail === 'string') return detail;
  if (detail && typeof detail === 'object') {
    const nested = row(detail);
    const message = nested.message ?? nested.error ?? nested.provider;
    if (message) return `${fallback}: ${String(message)}`;
  }
  return fallback;
}

async function request<T>(path: string, init?: RequestInit, timeoutMs = 20000, fallbacks: string[] = []): Promise<T> {
  const paths = [path, ...fallbacks];
  let lastError: unknown = null;

  for (const candidate of paths) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(`${apiBaseUrl()}${candidate}`, {
        ...init,
        headers: {
          accept: 'application/json',
          ...(init?.body ? { 'content-type': 'application/json' } : {}),
          ...(init?.headers || {}),
        },
        signal: controller.signal,
      });
      const payload: unknown = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new ApiHttpError(errorDetail(payload, `Trading 212 bridge HTTP ${response.status}`), response.status, payload);
      }
      return payload as T;
    } catch (error) {
      lastError = error;
      if (!(error instanceof ApiHttpError && error.status === 404)) throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  if (lastError instanceof Error && lastError.name === 'AbortError') throw new Error('Trading 212 bridge no respondió a tiempo.');
  if (lastError instanceof Error) throw lastError;
  throw new Error('Trading 212 bridge no respondió.');
}

function controlHeaders(controlToken: string): HeadersInit {
  const value = controlToken.trim();
  if (!value) throw new Error('Falta el token de control ATLAS Broker.');
  return { 'x-atlas-broker-token': value };
}

function normalizeStatus(payload: unknown): BrokerStatus {
  const data = row(payload);
  const env = environment(data.environment);
  const currentMode = mode(data.mode, env);
  const legacyConfigured = data.configured === true;
  const credentialsConfigured = data.credentialsConfigured === true || legacyConfigured;
  const controlTokenConfigured = data.controlTokenConfigured === true || legacyConfigured;
  const liveTradingEnabled = data.liveTradingEnabled === true;
  const guardrails = Array.isArray(data.guardrails)
    ? data.guardrails.filter((item): item is string => typeof item === 'string')
    : typeof data.guardrail === 'string'
      ? [data.guardrail]
      : [];

  return {
    provider: 'Trading212',
    apiVersion: typeof data.apiVersion === 'string' ? data.apiVersion : 'v0-beta-compat',
    environment: env,
    mode: currentMode,
    credentialsConfigured,
    controlTokenConfigured,
    readReady: data.readReady === true || legacyConfigured,
    liveTradingEnabled,
    liveExecutionLocked: typeof data.liveExecutionLocked === 'boolean' ? data.liveExecutionLocked : !(env === 'live' && liveTradingEnabled),
    secretsExposed: data.secretsExposed === true,
    guardrails,
  };
}

function normalizeEnvelope<T = unknown>(payload: unknown): BrokerEnvelope<T> {
  const data = row(payload);
  const env = environment(data.environment);
  const rate = row(data.rateLimit);
  const outputRate: BrokerEnvelope['rateLimit'] = {
    limit: asText(rate.limit) ?? EMPTY_RATE.limit,
    period: asText(rate.period) ?? EMPTY_RATE.period,
    remaining: asText(rate.remaining) ?? EMPTY_RATE.remaining,
    reset: asText(rate.reset) ?? EMPTY_RATE.reset,
    used: asText(rate.used) ?? EMPTY_RATE.used,
  };
  return {
    provider: 'Trading212',
    environment: env,
    mode: mode(data.mode, env),
    data: (Object.prototype.hasOwnProperty.call(data, 'data') ? data.data : payload) as T,
    rateLimit: outputRate,
  };
}

export const BrokerApi = {
  status: async () => normalizeStatus(await request<unknown>('/v1/mobile/broker/status', undefined, 12000, ['/v1/broker/status'])),
  account: async (controlToken: string) => normalizeEnvelope(await request<unknown>('/v1/mobile/broker/account', { headers: controlHeaders(controlToken) }, 20000, ['/v1/broker/account'])),
  positions: async (controlToken: string, ticker?: string) => {
    const query = ticker ? `?ticker=${encodeURIComponent(ticker)}` : '';
    return normalizeEnvelope(await request<unknown>(`/v1/mobile/broker/positions${query}`, { headers: controlHeaders(controlToken) }, 20000, [`/v1/broker/positions${query}`]));
  },
  orders: async (controlToken: string) => normalizeEnvelope(await request<unknown>('/v1/mobile/broker/orders', { headers: controlHeaders(controlToken) }, 20000, ['/v1/broker/orders'])),
  instruments: async (controlToken: string, query: string) => {
    const q = encodeURIComponent(query.trim());
    return normalizeEnvelope(await request<unknown>(`/v1/mobile/broker/metadata/instruments/search?q=${q}`, { headers: controlHeaders(controlToken) }, 20000, [`/v1/broker/instruments/search?q=${q}`]));
  },
  historyOrders: (controlToken: string, limit = 20) => request<BrokerEnvelope>(`/v1/mobile/broker/history/orders?limit=${Math.min(50, Math.max(1, limit))}`, { headers: controlHeaders(controlToken) }),
  historyDividends: (controlToken: string, limit = 20) => request<BrokerEnvelope>(`/v1/mobile/broker/history/dividends?limit=${Math.min(50, Math.max(1, limit))}`, { headers: controlHeaders(controlToken) }),
  historyTransactions: (controlToken: string, limit = 20) => request<BrokerEnvelope>(`/v1/mobile/broker/history/transactions?limit=${Math.min(50, Math.max(1, limit))}`, { headers: controlHeaders(controlToken) }),
  nextHistoryPage: (controlToken: string, nextPagePath: string) => request<BrokerEnvelope>(`/v1/mobile/broker/history/next?nextPagePath=${encodeURIComponent(nextPagePath)}`, { headers: controlHeaders(controlToken) }),
  marketOrder: (controlToken: string, input: MarketOrderInput) => request<BrokerEnvelope>('/v1/mobile/broker/orders/market', { method: 'POST', headers: controlHeaders(controlToken), body: JSON.stringify(input) }),
  limitOrder: (controlToken: string, input: LimitOrderInput) => request<BrokerEnvelope>('/v1/mobile/broker/orders/limit', { method: 'POST', headers: controlHeaders(controlToken), body: JSON.stringify(input) }),
  stopOrder: (controlToken: string, input: StopOrderInput) => request<BrokerEnvelope>('/v1/mobile/broker/orders/stop', { method: 'POST', headers: controlHeaders(controlToken), body: JSON.stringify(input) }),
  stopLimitOrder: (controlToken: string, input: StopLimitOrderInput) => request<BrokerEnvelope>('/v1/mobile/broker/orders/stop_limit', { method: 'POST', headers: controlHeaders(controlToken), body: JSON.stringify(input) }),
  cancelOrder: (controlToken: string, orderId: number) => request<BrokerEnvelope>(`/v1/mobile/broker/orders/${orderId}`, { method: 'DELETE', headers: controlHeaders(controlToken) }),
};
