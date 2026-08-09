export type AtlasHealth = {
  ok: boolean;
  service: string;
  version?: string;
  finnhub_configured?: boolean;
  providers?: { finnhub?: string; trading212?: string; secEdgar?: string };
  time?: string;
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

export type DecisionBundle = {
  symbol: string;
  decision: 'BUY' | 'NO_BUY';
  label: 'COMPRAR' | 'NO COMPRAR';
  buy: boolean;
  algorithmVersion: string;
  auditStatus: string;
  epistemicState: string;
  evidenceCoverage: number;
  scores: {
    quality: number | null;
    growth: number | null;
    valuation: number | null;
    risk: number | null;
    opportunity: number | null;
    conviction: number | null;
    downside: number | null;
  };
  reasons: string[];
  guardrail: string;
  generatedAt: string;
};

export type LiveQuote = {
  provider: string;
  ticker: string;
  price: number | null;
  change: number | null;
  changePct: number | null;
  open: number | null;
  high: number | null;
  low: number | null;
  previousClose: number | null;
  timestamp: string;
  session: string;
};

export type LivePortfolioPosition = {
  brokerTicker?: string | null;
  ticker: string;
  name?: string | null;
  isin?: string | null;
  currency?: string | null;
  quantity?: number | null;
  averagePrice?: number | null;
  currentPrice?: number | null;
  livePrice?: number | null;
  dayChangePct?: number | null;
  quoteTimestamp?: string | null;
  marketValue?: number | null;
  costValue?: number | null;
  pnl?: number | null;
  pnlPct?: number | null;
};

export type LivePortfolio = {
  configured: boolean;
  provider: string;
  environment?: string;
  readOnlyGuard: boolean;
  account: unknown;
  positions: LivePortfolioPosition[];
  observedAt: string;
  quoteProvider?: string;
  message?: string;
  error?: string;
};

const configuredBase = process.env.EXPO_PUBLIC_ATLAS_API_BASE_URL?.replace(/\/$/, '');
const DEFAULT_PUBLIC_API = 'https://atlas-genesis.onrender.com';

export function atlasApiBaseUrl(): string {
  return configuredBase || DEFAULT_PUBLIC_API;
}

export function healthHasFinnhub(health: AtlasHealth): boolean {
  return health.finnhub_configured === true || health.providers?.finnhub === 'CONFIGURED';
}

async function request<T>(path: string, timeoutMs = 30000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${atlasApiBaseUrl()}${path}`, {
      headers: { accept: 'application/json' },
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const detail = typeof payload?.message === 'string'
        ? payload.message
        : typeof payload?.detail === 'string'
          ? payload.detail
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

export const AtlasOnlineApi = {
  health: () => request<AtlasHealth>('/health'),
  company: (ticker: string) => request<CompanyBundle>(`/v1/company/${encodeURIComponent(ticker.trim().toUpperCase())}`),
  decision: (ticker: string) => request<DecisionBundle>(`/v1/decision/${encodeURIComponent(ticker.trim().toUpperCase())}`, 45000),
  quote: (ticker: string) => request<LiveQuote>(`/v1/quote/${encodeURIComponent(ticker.trim().toUpperCase())}`, 15000),
  portfolioLive: () => request<LivePortfolio>('/v1/portfolio-live', 45000),
};
