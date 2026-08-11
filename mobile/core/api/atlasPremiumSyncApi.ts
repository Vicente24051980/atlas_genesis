import {
  AtlasOnlineApi,
  DislocationPayload,
  MarketHistory,
  MarketOverview,
  MonitorItem,
  MonitorPage,
  RotationPayload,
  TrackedUniverse,
  atlasApiBaseUrl,
} from './atlasOnlineApi';

export type MobileUniverse = TrackedUniverse & {
  portfolioMeta?: {
    provider?: string;
    configured?: boolean;
    environment?: string;
    sourceStatus?: string;
    generatedAt?: string;
    readOnly?: boolean;
    unresolvedAnalysisSymbols?: number;
    rateLimit?: Record<string, string>;
  };
  watchlistMeta?: {
    provider?: string;
    analysisProvider?: string;
  };
};

export type AnalysisBatch = {
  context: 'portfolio' | 'watchlist';
  count: number;
  items: MonitorItem[];
  guardrail: string;
};

async function request<T>(path: string, timeoutMs = 30_000): Promise<T> {
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
        : `ATLAS premium API HTTP ${response.status}`;
      const error = new Error(detail) as Error & { status?: number };
      error.status = response.status;
      throw error;
    }
    return payload as T;
  } finally {
    clearTimeout(timer);
  }
}

async function newBackendOrFallback<T>(
  path: string,
  fallback: () => Promise<T>,
): Promise<T> {
  try {
    return await request<T>(path);
  } catch (error) {
    const status = (error as Error & { status?: number })?.status;
    // During staged rollout the old public v0.4 backend may still be serving.
    // 404/405 means the new router is not deployed yet; retain the certified
    // compatibility behavior until backend promotion is complete.
    if (status === 404 || status === 405) return fallback();
    throw error;
  }
}

export const AtlasPremiumSyncApi = {
  universe: (): Promise<MobileUniverse> => newBackendOrFallback(
    '/v1/mobile/universe',
    async () => AtlasOnlineApi.atlasUniverse() as Promise<MobileUniverse>,
  ),

  monitor: (kind: 'portfolio' | 'watchlist', offset = 0, limit = 6): Promise<MonitorPage> =>
    newBackendOrFallback(
      `/v1/mobile/monitor/${kind}?offset=${Math.max(0, offset)}&limit=${Math.max(1, Math.min(limit, 8))}`,
      () => AtlasOnlineApi.atlasMonitor(kind, offset, limit),
    ),

  analyzeSymbols: (
    symbols: string[],
    context: 'portfolio' | 'watchlist' = 'watchlist',
  ): Promise<AnalysisBatch> => {
    const cleaned = Array.from(new Set(symbols.map((item) => item.trim().toUpperCase()).filter(Boolean))).slice(0, 8);
    const query = encodeURIComponent(cleaned.join(','));
    return request<AnalysisBatch>(`/v1/mobile/analyze-symbols?symbols=${query}&context=${context}`);
  },

  history: (ticker: string, days = 380): Promise<MarketHistory> => newBackendOrFallback(
    `/v1/market/history/${encodeURIComponent(ticker.trim().toUpperCase())}?days=${Math.max(10, Math.min(days, 1900))}`,
    () => AtlasOnlineApi.marketHistory(ticker, days),
  ),

  overview: (): Promise<MarketOverview> => newBackendOrFallback(
    '/v1/market/overview',
    () => AtlasOnlineApi.marketOverview(),
  ),

  rotation: (): Promise<RotationPayload> => newBackendOrFallback(
    '/v1/market/rotation',
    () => AtlasOnlineApi.marketRotation(),
  ),

  dislocation: (limit = 15): Promise<DislocationPayload> => newBackendOrFallback(
    `/v1/market/dislocation?limit=${Math.max(5, Math.min(limit, 30))}`,
    () => AtlasOnlineApi.marketDislocation(limit),
  ),
};
