export type ApiHealth = {
  ok: boolean;
  service: string;
  version: string;
  providers: { finnhub: 'CONFIGURED' | 'UNCONFIGURED'; secEdgar: 'CONFIGURED' | 'UNCONFIGURED' };
  invariants: Record<string, boolean>;
  time: string;
};

export type SecurityProfile = {
  canonicalTicker: string;
  companyName: string;
  exchange: string | null;
  country: string | null;
  sector: string | null;
  industry: string | null;
  currency: string | null;
  marketCap: number | null;
  logo?: string | null;
  weburl?: string | null;
};

export type Quote = {
  ticker: string;
  provider: string;
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

export type HistoryPoint = { t: string; o: number; h: number; l: number; c: number; v: number };

export type MarketSignals = {
  status: string;
  algorithmVersion?: string;
  momentumScore: number | null;
  waveScore: number | null;
  downsideScore: number | null;
  downsideSeverity?: 'NORMAL' | 'WATCH' | 'ELEVATED' | 'CRITICAL';
  streak: { direction: 'UP' | 'DOWN' | 'FLAT'; length: number; upDays20: number; downDays20: number };
  metrics?: {
    ret5?: number | null;
    ret20?: number | null;
    ret60?: number | null;
    ret252?: number | null;
    ma20?: number | null;
    ma50?: number | null;
    vol20?: number | null;
    volumeRatio?: number | null;
  };
  reasons: string[];
  guardrail?: string;
};

export type EdgarFiling = {
  form: string;
  filingDate: string | null;
  reportDate: string | null;
  accessionNumber: string | null;
  primaryDocument: string | null;
  items: string[];
  eventClass: string;
  materialityScore: number;
  validationState: 'PENDING_PRIMARY_VALIDATION' | 'VERIFIED_FACT' | 'DISCARDED';
  requiresHumanReview: boolean;
};

export type TerminalBundle = {
  security: SecurityProfile | null;
  quote: Quote;
  history: HistoryPoint[];
  marketSignals: MarketSignals;
  fundamentals: { provider: string; ticker: string; metric: Record<string, number | string | null> } | null;
  news: Array<{ id: string | number; headline: string; summary: string; source: string; url: string; datetime: string | null }>;
  edgar: { ticker: string; cik?: string | null; status: string; filings: EdgarFiling[] };
  canonicalAudit: { status: string; message: string };
  generatedAt: string;
};

export type DiscoveryItem = {
  ticker: string;
  price: number | null;
  dayPct: number | null;
  discoveryScore: number;
  momentumScore: number | null;
  waveScore: number | null;
  downsideScore: number | null;
  downsideSeverity?: string;
  streak: MarketSignals['streak'];
  metrics?: MarketSignals['metrics'];
};

const configuredBase = process.env.EXPO_PUBLIC_ATLAS_API_BASE_URL?.replace(/\/$/, '');

export function apiBaseUrl(): string {
  if (configuredBase) return configuredBase;
  if (__DEV__) return 'http://10.0.2.2:8787';
  return '';
}

async function request<T>(path: string): Promise<T> {
  const base = apiBaseUrl();
  if (!base) throw new Error('ATLAS API no configurada. Define EXPO_PUBLIC_ATLAS_API_BASE_URL en el build.');
  const response = await fetch(`${base}${path}`, { headers: { accept: 'application/json' } });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof payload?.message === 'string' ? payload.message : `ATLAS API ${response.status}`;
    throw new Error(message);
  }
  return payload as T;
}

export const AtlasApi = {
  health: () => request<ApiHealth>('/health'),
  terminal: (ticker: string) => request<TerminalBundle>(`/v1/terminal/${encodeURIComponent(ticker.trim().toUpperCase())}`),
  quote: (ticker: string) => request<Quote>(`/v1/quote/${encodeURIComponent(ticker.trim().toUpperCase())}`),
  history: (ticker: string, range = '1Y') => request<{ ticker: string; range: string; rows: HistoryPoint[] }>(`/v1/history/${encodeURIComponent(ticker.trim().toUpperCase())}?range=${encodeURIComponent(range)}`),
  signals: (ticker: string) => request<MarketSignals & { ticker: string }>(`/v1/signals/${encodeURIComponent(ticker.trim().toUpperCase())}`),
  discovery: (limit = 25) => request<{ generatedAt: string; methodology: string; items: DiscoveryItem[] }>(`/v1/discovery?limit=${limit}`),
};
