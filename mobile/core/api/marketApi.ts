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
      const detail = typeof row.detail === 'string' ? row.detail : `Market data HTTP ${response.status}`;
      throw new Error(detail);
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
