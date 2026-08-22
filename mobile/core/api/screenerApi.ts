import { atlasApiBaseUrl } from './atlasOnlineApi';

export type ScreenerSortKey = 'symbol' | 'day' | 'ret1y' | 'ret2y' | 'marketCap' | 'roic' | 'beta' | 'pe';
export type ScreenerSortDirection = 'asc' | 'desc';

export type ScreenerFilters = {
  symbols?: string[];
  minMarketCap?: number | null;
  maxPE?: number | null;
  maxBeta?: number | null;
  minROIC?: number | null;
  positiveDay?: boolean;
  above200dma?: boolean;
  positive1Y?: boolean;
  positive2Y?: boolean;
  sort?: ScreenerSortKey;
  direction?: ScreenerSortDirection;
  limit?: number;
};

export type ScreenerRow = {
  symbol: string;
  name: string;
  sector: string;
  price: number | null;
  day: number | null;
  sma200: number | null;
  above200dma: boolean | null;
  ret1y: number | null;
  ret2y: number | null;
  marketCap: number | null;
  pe: number | null;
  beta: number | null;
  roic: number | null;
  fundamentalCoverage: number;
  technicalCoverage: number;
  source: { technical: string; fundamental: string };
};

export type ScreenerPayload = {
  engine: string;
  version: string;
  universe: string;
  scanned: number;
  returned: number;
  fundamentalDataGates: number;
  filters: Record<string, number | boolean | null>;
  sort: { key: ScreenerSortKey; direction: ScreenerSortDirection };
  items: ScreenerRow[];
  guardrail: string;
};

function pushNumber(params: URLSearchParams, key: string, value: number | null | undefined) {
  if (typeof value === 'number' && Number.isFinite(value)) params.set(key, String(value));
}

export const ScreenerApi = {
  async screen(filters: ScreenerFilters = {}): Promise<ScreenerPayload> {
    const params = new URLSearchParams();
    if (filters.symbols?.length) params.set('symbols', filters.symbols.map((value) => value.trim().toUpperCase()).filter(Boolean).join(','));
    pushNumber(params, 'min_market_cap', filters.minMarketCap);
    pushNumber(params, 'max_pe', filters.maxPE);
    pushNumber(params, 'max_beta', filters.maxBeta);
    pushNumber(params, 'min_roic', filters.minROIC);
    if (filters.positiveDay) params.set('positive_day', 'true');
    if (filters.above200dma) params.set('above_200dma', 'true');
    if (filters.positive1Y) params.set('positive_1y', 'true');
    if (filters.positive2Y) params.set('positive_2y', 'true');
    params.set('sort', filters.sort || 'ret1y');
    params.set('direction', filters.direction || 'desc');
    params.set('limit', String(filters.limit || 50));

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 65000);
    try {
      const response = await fetch(`${atlasApiBaseUrl()}/v1/screener?${params.toString()}`, {
        headers: { accept: 'application/json' },
        signal: controller.signal,
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const detail = typeof payload?.detail === 'string' ? payload.detail : `SCREENER HTTP ${response.status}`;
        throw new Error(detail);
      }
      return payload as ScreenerPayload;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') throw new Error('SCREENER DATA GATE · el backend no respondió a tiempo');
      throw error;
    } finally {
      clearTimeout(timer);
    }
  },
};
