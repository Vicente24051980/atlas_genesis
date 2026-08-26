import { apiBaseUrl } from './mobileApi';

export type GlobalIndexQuote = {
  symbol: string;
  name: string;
  region: string;
  price: number | null;
  change: number | null;
  percentageChange: number | null;
  time: string | null;
  status: 'OK' | 'MISSING';
};

export type GlobalIndicesPayload = {
  provider: string;
  providerMode: string;
  generatedAt: string;
  refreshHintSeconds: number;
  items: GlobalIndexQuote[];
  guardrails: string[];
};

export class MarketHttpError extends Error {
  readonly status: number;
  readonly path: string;

  constructor(status: number, path: string, message: string) {
    super(message);
    this.name = 'MarketHttpError';
    this.status = status;
    this.path = path;
  }
}

async function request<T>(path: string, timeoutMs = 12000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${apiBaseUrl()}${path}`, {
      headers: { accept: 'application/json' },
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
          : `Market data HTTP ${response.status}`;
      if (response.status === 404) {
        throw new MarketHttpError(404, path, 'BACKEND DEPLOYMENT DRIFT · /v1/mobile/indices no está desplegado todavía');
      }
      if (response.status === 503) {
        throw new MarketHttpError(503, path, `MARKET DATA GATE · ${detail}`);
      }
      throw new MarketHttpError(response.status, path, detail);
    }
    return payload as T;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw new Error('Market feed no respondió a tiempo.');
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export const MarketApi = {
  indices: () => request<GlobalIndicesPayload>('/v1/mobile/indices'),
};
