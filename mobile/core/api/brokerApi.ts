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

export type BrokerRateLimit = {
  limit: string | null;
  period: string | null;
  remaining: string | null;
  reset: string | null;
  used: string | null;
};

export type BrokerEnvelope<T = unknown> = {
  provider: 'Trading212';
  environment: 'demo' | 'live';
  mode: 'PAPER' | 'LIVE';
  data: T;
  rateLimit: BrokerRateLimit;
};

export type ReconciledHolding = {
  symbol: string;
  trading212Ticker: string;
  name?: string | null;
  isin?: string | null;
  instrumentCurrency?: string | null;
  accountCurrency?: string | null;
  quantity?: number | null;
  quantityAvailableForTrading?: number | null;
  quantityInPies?: number | null;
  averagePricePaid?: number | null;
  currentPrice?: number | null;
  instrumentMarketValue?: number | null;
  accountMarketValue?: number | null;
  unrealizedProfitLoss?: number | null;
  weight?: number | null;
};

export type PortfolioReconciliation = {
  accountCurrency?: string | null;
  accountTotalValue?: number | null;
  investmentsCurrentValue?: number | null;
  holdings: ReconciledHolding[];
  holdingCount: number;
  expectedTickers: string[];
  missingExpected: string[];
  unexpectedHeld: string[];
  weightBasis: string;
  weightsComplete: boolean;
};

export type LiquidityQuoteEvidence = {
  ticker: string;
  lastTradePrice?: number;
  bidPrice: number;
  askPrice: number;
  quoteTimestamp: string;
  quoteSource: string;
  venue?: string;
  lowLiquidityFlag?: boolean;
};

export type MarketOrderInput = {
  ticker: string;
  quantity: number;
  extendedHours?: boolean;
  confirmation: 'EXECUTE_DEMO' | 'EXECUTE_LIVE';
  clientRequestId: string;
  liquidity: LiquidityQuoteEvidence;
};

export type LimitOrderInput = {
  ticker: string;
  quantity: number;
  limitPrice: number;
  timeValidity?: 'DAY' | 'GOOD_TILL_CANCEL';
  confirmation: 'EXECUTE_DEMO' | 'EXECUTE_LIVE';
  clientRequestId: string;
  liquidity: LiquidityQuoteEvidence;
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

export type OrderPreviewInput = {
  orderType: 'market' | 'limit' | 'stop' | 'stop_limit';
  ticker: string;
  quantity: number;
  extendedHours?: boolean;
  limitPrice?: number;
  stopPrice?: number;
  timeValidity?: 'DAY' | 'GOOD_TILL_CANCEL';
  liquidity?: LiquidityQuoteEvidence;
};

export type OrderPreview = {
  previewOnly: true;
  willExecute: false;
  environment: 'demo' | 'live';
  orderType: OrderPreviewInput['orderType'];
  side: 'BUY' | 'SELL';
  instrument: {
    ticker?: string | null;
    name?: string | null;
    isin?: string | null;
    currencyCode?: string | null;
    type?: string | null;
  };
  upstreamPayload: Record<string, unknown>;
  liveCompatibility: string;
  nextStep: 'EXECUTE_DEMO' | 'EXECUTE_LIVE';
};

export class BrokerHttpError extends Error {
  readonly status: number;
  readonly path: string;

  constructor(status: number, path: string, message: string) {
    super(message);
    this.name = 'BrokerHttpError';
    this.status = status;
    this.path = path;
  }
}

const EMPTY_RATE_LIMIT: BrokerRateLimit = {
  limit: null,
  period: null,
  remaining: null,
  reset: null,
  used: null,
};

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
      const rawDetail = row.detail;
      const detail = typeof rawDetail === 'string'
        ? rawDetail
        : rawDetail && typeof rawDetail === 'object'
          ? JSON.stringify(rawDetail)
          : `Trading 212 bridge HTTP ${response.status}`;
      throw new BrokerHttpError(response.status, path, detail);
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

function isRoute404(error: unknown): error is BrokerHttpError {
  return error instanceof BrokerHttpError && error.status === 404;
}

function normalizeEnvironment(value: unknown): 'demo' | 'live' {
  return String(value || '').toLowerCase() === 'live' ? 'live' : 'demo';
}

function normalizeLegacyStatus(raw: Record<string, unknown>): BrokerStatus {
  const environment = normalizeEnvironment(raw.environment);
  const configured = raw.configured === true;
  const liveTradingEnabled = raw.liveTradingEnabled === true;
  const guardrail = typeof raw.guardrail === 'string' ? raw.guardrail : 'Legacy Trading 212 read bridge compatibility active.';
  return {
    provider: 'Trading212',
    apiVersion: 'legacy-read-compat',
    environment,
    mode: environment === 'live' ? 'LIVE' : 'PAPER',
    credentialsConfigured: configured,
    controlTokenConfigured: configured,
    readReady: configured,
    liveTradingEnabled,
    liveExecutionLocked: environment !== 'live' || !liveTradingEnabled,
    secretsExposed: false,
    guardrails: [guardrail, 'Legacy fallback is read-only from the mobile compatibility layer; v2 execution remains fail-closed.'],
  };
}

function normalizeLegacyEnvelope<T = unknown>(raw: Record<string, unknown>, data?: T): BrokerEnvelope<T> {
  const environment = normalizeEnvironment(raw.environment);
  return {
    provider: 'Trading212',
    environment,
    mode: environment === 'live' ? 'LIVE' : 'PAPER',
    data: (data === undefined ? raw.data : data) as T,
    rateLimit: EMPTY_RATE_LIMIT,
  };
}

async function readWithLegacyFallback<T>(
  mobilePath: string,
  legacyPath: string,
  init: RequestInit | undefined,
  normalizeLegacy: (raw: Record<string, unknown>) => T,
  timeoutMs = 20000,
): Promise<T> {
  try {
    return await request<T>(mobilePath, init, timeoutMs);
  } catch (error) {
    if (!isRoute404(error)) throw error;
    const legacy = await request<Record<string, unknown>>(legacyPath, init, timeoutMs);
    return normalizeLegacy(legacy);
  }
}

export const BrokerApi = {
  status: () => readWithLegacyFallback<BrokerStatus>(
    '/v1/mobile/broker/status',
    '/v1/broker/status',
    undefined,
    normalizeLegacyStatus,
    12000,
  ),
  account: (controlToken: string) => readWithLegacyFallback<BrokerEnvelope>(
    '/v1/mobile/broker/account',
    '/v1/broker/account',
    { headers: controlHeaders(controlToken) },
    (raw) => normalizeLegacyEnvelope(raw),
  ),
  positions: (controlToken: string, ticker?: string) => {
    const suffix = ticker ? `?ticker=${encodeURIComponent(ticker)}` : '';
    return readWithLegacyFallback<BrokerEnvelope>(
      `/v1/mobile/broker/positions${suffix}`,
      `/v1/broker/positions${suffix}`,
      { headers: controlHeaders(controlToken) },
      (raw) => normalizeLegacyEnvelope(raw),
    );
  },
  reconcilePortfolio: (controlToken: string, expectedTickers: string[] = []) => request<BrokerEnvelope<PortfolioReconciliation>>('/v1/mobile/broker/portfolio/reconcile', {
    method: 'POST',
    headers: controlHeaders(controlToken),
    body: JSON.stringify({ expectedTickers }),
  }),
  orders: (controlToken: string) => readWithLegacyFallback<BrokerEnvelope>(
    '/v1/mobile/broker/orders',
    '/v1/broker/orders',
    { headers: controlHeaders(controlToken) },
    (raw) => normalizeLegacyEnvelope(raw),
  ),
  instruments: (controlToken: string, query: string) => {
    const encoded = encodeURIComponent(query.trim());
    return readWithLegacyFallback<BrokerEnvelope>(
      `/v1/mobile/broker/metadata/instruments/search?q=${encoded}`,
      `/v1/broker/instruments/search?q=${encoded}`,
      { headers: controlHeaders(controlToken) },
      (raw) => normalizeLegacyEnvelope(raw, raw.items ?? raw),
    );
  },
  historyOrders: (controlToken: string, limit = 20) => request<BrokerEnvelope>(`/v1/mobile/broker/history/orders?limit=${Math.min(50, Math.max(1, limit))}`, { headers: controlHeaders(controlToken) }),
  historyDividends: (controlToken: string, limit = 20) => request<BrokerEnvelope>(`/v1/mobile/broker/history/dividends?limit=${Math.min(50, Math.max(1, limit))}`, { headers: controlHeaders(controlToken) }),
  historyTransactions: (controlToken: string, limit = 20) => request<BrokerEnvelope>(`/v1/mobile/broker/history/transactions?limit=${Math.min(50, Math.max(1, limit))}`, { headers: controlHeaders(controlToken) }),
  nextHistoryPage: (controlToken: string, nextPagePath: string) => request<BrokerEnvelope>(`/v1/mobile/broker/history/next?nextPagePath=${encodeURIComponent(nextPagePath)}`, { headers: controlHeaders(controlToken) }),
  previewOrder: (controlToken: string, input: OrderPreviewInput) => request<BrokerEnvelope<OrderPreview>>('/v1/mobile/broker/orders/preview', {
    method: 'POST',
    headers: controlHeaders(controlToken),
    body: JSON.stringify(input),
  }),
  marketOrder: (controlToken: string, input: MarketOrderInput) => request<BrokerEnvelope>('/v1/mobile/broker/orders/market', { method: 'POST', headers: controlHeaders(controlToken), body: JSON.stringify(input) }),
  limitOrder: (controlToken: string, input: LimitOrderInput) => request<BrokerEnvelope>('/v1/mobile/broker/orders/limit', { method: 'POST', headers: controlHeaders(controlToken), body: JSON.stringify(input) }),
  stopOrder: (controlToken: string, input: StopOrderInput) => request<BrokerEnvelope>('/v1/mobile/broker/orders/stop', { method: 'POST', headers: controlHeaders(controlToken), body: JSON.stringify(input) }),
  stopLimitOrder: (controlToken: string, input: StopLimitOrderInput) => request<BrokerEnvelope>('/v1/mobile/broker/orders/stop_limit', { method: 'POST', headers: controlHeaders(controlToken), body: JSON.stringify(input) }),
  cancelOrder: (controlToken: string, orderId: number) => request<BrokerEnvelope>(`/v1/mobile/broker/orders/${orderId}`, { method: 'DELETE', headers: controlHeaders(controlToken) }),
};
