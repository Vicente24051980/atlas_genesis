export type MarketQuote = {
  symbol: string;
  name: string;
  sector: string;
  price: number | null;
  change: number | null;
  changePct: number | null;
  open: number | null;
  high: number | null;
  low: number | null;
  previousClose: number | null;
  volume: number | null;
  asOfDate: string | null;
  asOfTime: string | null;
  source: string;
  delayed: boolean;
};

export type MarketSnapshot = {
  source: string;
  delayed: boolean;
  generatedAt: string;
  items: MarketQuote[];
  guardrail: string;
};

export type MarketOverview = {
  source: string;
  delayed: boolean;
  generatedAt: string;
  benchmarks: MarketQuote[];
  sectors: MarketQuote[];
  macro: MarketQuote[];
  guardrail: string;
};

export type MarketScanner = {
  source: string;
  delayed: boolean;
  generatedAt: string;
  direction: 'all' | 'up' | 'down';
  count: number;
  items: MarketQuote[];
  guardrail: string;
};

export type MarketSearchItem = { symbol: string; name: string; sector: string };
export type MarketSearch = { query: string; count: number; items: MarketSearchItem[] };

export type TrackedTicker = { ticker: string; symbol?: string; name: string; sector?: string; state?: string };
export type TrackedUniverse = {
  snapshotId: string;
  status: string;
  portfolio: TrackedTicker[];
  portfolioPending: TrackedTicker[];
  watchlist: TrackedTicker[];
  counts: { portfolio: number; pending: number; watchlist: number };
  guardrail: string;
};

export type AtlasEngine = { id: string; name: string; state: string; description: string };
export type EnginesPayload = { items: AtlasEngine[]; algorithm: string };

type AtlasOnlineUiContract = {
  marketSnapshot: () => Promise<MarketSnapshot>;
  marketOverview: () => Promise<MarketOverview>;
  marketScanner: (direction?: 'all' | 'up' | 'down', limit?: number) => Promise<MarketScanner>;
  marketSearch: (query: string, limit?: number) => Promise<MarketSearch>;
  atlasUniverse: () => Promise<TrackedUniverse>;
  atlasEngines: () => Promise<EnginesPayload>;
};

type LegacyModule = { AtlasOnlineApi: AtlasOnlineUiContract };

declare const require: (moduleName: string) => unknown;

// Compatibility boundary: atlasOnlineApi predates noUncheckedIndexedAccess and contains
// continuity data used at runtime. Keeping the legacy module behind a typed CommonJS
// boundary lets the broker UI consume only the verified contract without weakening the
// application's strict TypeScript configuration.
const legacy = require('./atlasOnlineApi') as LegacyModule;

export const AtlasOnlineApi: AtlasOnlineUiContract = legacy.AtlasOnlineApi;
