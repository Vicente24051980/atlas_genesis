export type AtlasHealth = {
  ok: boolean;
  service: string;
  version?: string;
  finnhub_configured: boolean;
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

const configuredBase = process.env.EXPO_PUBLIC_ATLAS_API_BASE_URL?.replace(/\/$/, '');
const DEFAULT_PUBLIC_API = 'https://atlas-genesis.onrender.com';

export function atlasApiBaseUrl(): string {
  return configuredBase || DEFAULT_PUBLIC_API;
}

async function request<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  try {
    const response = await fetch(`${atlasApiBaseUrl()}${path}`, {
      headers: { accept: 'application/json' },
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const detail = typeof payload?.detail === 'string' ? payload.detail : `ATLAS API HTTP ${response.status}`;
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
};
