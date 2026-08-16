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

async function request<T>(path: string, init?: RequestInit, timeoutMs = 20000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${apiBaseUrl()}${path}`, {
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
      const row = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {};
      const detail = typeof row.detail === 'string' ? row.detail : `Trading 212 bridge HTTP ${response.status}`;
      throw new Error(detail);
    }
    return payload as T;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw new Error('Trading 212 bridge no respondió a tiempo.');
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function controlHeaders(controlToken: string): HeadersInit {
  const value = controlToken.trim();
  if (!value) throw new Error('Falta el token de control ATLAS Broker.');
  return { 'x-atlas-broker-token': value };
}

export const BrokerApi = {
  status: () => request<BrokerStatus>('/v1/mobile/broker/status', undefined, 12000),
  account: (controlToken: string) => request<BrokerEnvelope>('/v1/mobile/broker/account', { headers: controlHeaders(controlToken) }),
  positions: (controlToken: string, ticker?: string) => request<BrokerEnvelope>(`/v1/mobile/broker/positions${ticker ? `?ticker=${encodeURIComponent(ticker)}` : ''}`, { headers: controlHeaders(controlToken) }),
  orders: (controlToken: string) => request<BrokerEnvelope>('/v1/mobile/broker/orders', { headers: controlHeaders(controlToken) }),
  instruments: (controlToken: string, query: string) => request<BrokerEnvelope>(`/v1/mobile/broker/metadata/instruments/search?q=${encodeURIComponent(query.trim())}`, { headers: controlHeaders(controlToken) }),
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
