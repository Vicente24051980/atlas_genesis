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

const LEGACY_INDEX_SET = [
  ['^GSPC', 'S&P 500', 'USA'],
  ['^NDX', 'Nasdaq 100', 'USA'],
  ['^STOXX50E', 'Euro Stoxx 50', 'Europa'],
  ['^N225', 'Nikkei 225', 'Japón'],
  ['^HSI', 'Hang Seng', 'Hong Kong'],
  ['^KS11', 'KOSPI', 'Corea del Sur'],
] as const;

let legacyCache: { at: number; payload: GlobalIndicesPayload } | null = null;
const LEGACY_CACHE_MS = 60_000;

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
        throw new MarketHttpError(404, path, 'BACKEND DEPLOYMENT DRIFT · ruta mobile no desplegada');
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

function finite(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

async function legacyIndices(): Promise<GlobalIndicesPayload> {
  const now = Date.now();
  if (legacyCache && now - legacyCache.at < LEGACY_CACHE_MS) return legacyCache.payload;

  const results = await Promise.allSettled(LEGACY_INDEX_SET.map(async ([symbol, name, region]) => {
    const raw = await request<Record<string, unknown>>(`/v1/quote/${encodeURIComponent(symbol)}`, 12000);
    const data = raw.data && typeof raw.data === 'object' ? raw.data as Record<string, unknown> : {};
    const observedPrice = finite(data.c);
    const validPrice = observedPrice !== null && observedPrice > 0;
    const change = finite(data.d);
    const percentageChange = finite(data.dp);
    const epoch = finite(data.t);
    return {
      symbol,
      name,
      region,
      price: validPrice ? observedPrice : null,
      change: validPrice ? change : null,
      percentageChange: validPrice ? percentageChange : null,
      time: validPrice && epoch && epoch > 0 ? new Date(epoch * 1000).toISOString() : null,
      status: validPrice ? 'OK' as const : 'MISSING' as const,
    };
  }));

  const items = results.flatMap((result) => result.status === 'fulfilled' ? [result.value] : []);
  if (!items.some((item) => item.status === 'OK')) {
    throw new Error('GLOBAL INDICES DATA GATE · ni la ruta mobile ni el fallback Finnhub legacy devolvieron índices utilizables');
  }

  const payload: GlobalIndicesPayload = {
    provider: 'Finnhub',
    providerMode: 'legacy-read-compat-after-mobile-404',
    generatedAt: new Date().toISOString(),
    refreshHintSeconds: 60,
    items,
    guardrails: [
      'Fallback activado únicamente porque /v1/mobile/indices devolvió 404 por deployment drift.',
      'Los valores proceden del endpoint legacy real de Finnhub; cotizaciones cero/no soportadas se marcan MISSING.',
      'No se sustituyen índices por ETFs ni se fabrican cifras.',
      'Fallback cacheado durante 60 segundos para respetar límites de proveedor.',
    ],
  };
  legacyCache = { at: now, payload };
  return payload;
}

export const MarketApi = {
  indices: async (): Promise<GlobalIndicesPayload> => {
    try {
      return await request<GlobalIndicesPayload>('/v1/mobile/indices');
    } catch (error) {
      if (error instanceof MarketHttpError && error.status === 404) return legacyIndices();
      throw error;
    }
  },
};
