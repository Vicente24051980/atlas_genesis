import { atlasApiBaseUrl } from './atlasOnlineApi';

export type Trading212PortfolioStatus = {
  provider: 'Trading212';
  environment: 'demo' | 'live';
  configured: boolean;
  readOnly: true;
  rateLimit: Record<string, string>;
  guardrail: string;
};

export type Trading212Position = {
  brokerTicker: string;
  analysisSymbol: string;
  name: string;
  isin?: string | null;
  currency?: string | null;
  quantity?: number | null;
  quantityAvailableForTrading?: number | null;
  quantityInPies?: number | null;
  averagePricePaid?: number | null;
  currentPrice?: number | null;
  walletImpact?: Record<string, unknown> | null;
  createdAt?: string | null;
  instrument: Record<string, unknown>;
};

export type Trading212LivePortfolio = {
  provider: 'Trading212';
  environment: 'demo' | 'live';
  readOnly: true;
  generatedAt: string;
  sourceStatus: string;
  count: number;
  positions: Trading212Position[];
  rateLimit: Record<string, string>;
  guardrail: string;
};

export type Trading212Account = {
  provider: 'Trading212';
  environment: 'demo' | 'live';
  readOnly: true;
  generatedAt: string;
  sourceStatus: string;
  account: Record<string, unknown>;
  rateLimit: Record<string, string>;
};

async function request<T>(path: string, timeoutMs = 15_000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${atlasApiBaseUrl()}${path}`, {
      headers: { accept: 'application/json' },
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const detail = typeof payload?.detail === 'string'
        ? payload.detail
        : `ATLAS portfolio API HTTP ${response.status}`;
      throw new Error(detail);
    }
    return payload as T;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Trading 212 no respondió a tiempo. Se conservará la última cartera válida.');
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export function getTrading212PortfolioStatus(): Promise<Trading212PortfolioStatus> {
  return request<Trading212PortfolioStatus>('/v1/portfolio/status');
}

export function getTrading212LivePortfolio(): Promise<Trading212LivePortfolio> {
  return request<Trading212LivePortfolio>('/v1/portfolio/live');
}

export function getTrading212Account(): Promise<Trading212Account> {
  return request<Trading212Account>('/v1/portfolio/account');
}

export function searchTrading212Instruments(query: string): Promise<Record<string, unknown>> {
  return request<Record<string, unknown>>(`/v1/portfolio/instruments?q=${encodeURIComponent(query.trim())}`);
}
