import { getFmpApiKey } from '../credentials';

export type FmpQuote = {
  symbol: string;
  name: string | null;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  dayLow: number | null;
  dayHigh: number | null;
  yearLow: number | null;
  yearHigh: number | null;
  marketCap: number | null;
  volume: number | null;
  averageVolume: number | null;
  priceAvg50: number | null;
  priceAvg200: number | null;
  exchange: string | null;
};

export type FmpUniverseSymbol = {
  symbol: string;
  name: string | null;
  exchange: string | null;
  exchangeShortName: string | null;
  type: string | null;
};

type JsonObject = Record<string, unknown>;

const BASE_URL = 'https://financialmodelingprep.com/stable';

function asObject(value: unknown): JsonObject {
  return value && typeof value === 'object' ? value as JsonObject : {};
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

async function request(path: string, params: Record<string, string | number | boolean | undefined> = {}): Promise<unknown> {
  const apiKey = await getFmpApiKey();
  if (!apiKey) throw new Error('FMP no está configurado.');

  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) query.set(key, String(value));
  });

  const response = await fetch(`${BASE_URL}${path}?${query.toString()}`, {
    headers: {
      Accept: 'application/json',
      apikey: apiKey,
    },
  });
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`FMP HTTP ${response.status}${body ? `: ${body.slice(0, 180)}` : ''}`);
  }
  return response.json();
}

function parseQuote(value: unknown): FmpQuote | null {
  const item = asObject(value);
  const symbol = asString(item.symbol);
  if (!symbol) return null;

  return {
    symbol: symbol.toUpperCase(),
    name: asString(item.name),
    price: asNumber(item.price),
    change: asNumber(item.change),
    changePercent: asNumber(item.changePercentage) ?? asNumber(item.changesPercentage),
    dayLow: asNumber(item.dayLow),
    dayHigh: asNumber(item.dayHigh),
    yearLow: asNumber(item.yearLow),
    yearHigh: asNumber(item.yearHigh),
    marketCap: asNumber(item.marketCap),
    volume: asNumber(item.volume),
    averageVolume: asNumber(item.avgVolume) ?? asNumber(item.averageVolume),
    priceAvg50: asNumber(item.priceAvg50),
    priceAvg200: asNumber(item.priceAvg200),
    exchange: asString(item.exchange),
  };
}

export async function fetchFmpQuotes(symbols: string[]): Promise<FmpQuote[]> {
  const unique = [...new Set(symbols.map((symbol) => symbol.trim().toUpperCase()).filter(Boolean))];
  if (!unique.length) return [];

  const chunks: string[][] = [];
  for (let i = 0; i < unique.length; i += 80) chunks.push(unique.slice(i, i + 80));

  const output: FmpQuote[] = [];
  for (const chunk of chunks) {
    const raw = await request('/batch-quote', { symbols: chunk.join(',') });
    if (!Array.isArray(raw)) throw new Error('FMP devolvió un formato inesperado para batch quote.');
    output.push(...raw.map(parseQuote).filter((quote): quote is FmpQuote => Boolean(quote)));
  }
  return output;
}

export async function fetchFmpQuote(symbol: string): Promise<FmpQuote | null> {
  const raw = await request('/quote', { symbol: symbol.trim().toUpperCase() });
  if (!Array.isArray(raw) || !raw.length) return null;
  return parseQuote(raw[0]);
}

export async function fetchFmpGlobalUniverse(): Promise<FmpUniverseSymbol[]> {
  const raw = await request('/actively-trading-list');
  if (!Array.isArray(raw)) throw new Error('FMP devolvió un formato inesperado para el universo global.');

  return raw.map((value): FmpUniverseSymbol | null => {
    const item = asObject(value);
    const symbol = asString(item.symbol);
    if (!symbol) return null;
    return {
      symbol: symbol.toUpperCase(),
      name: asString(item.name),
      exchange: asString(item.exchange),
      exchangeShortName: asString(item.exchangeShortName),
      type: asString(item.type),
    };
  }).filter((item): item is FmpUniverseSymbol => Boolean(item));
}

export async function testFmpConnection(): Promise<FmpQuote> {
  const quote = await fetchFmpQuote('MSFT');
  if (!quote?.price) throw new Error('FMP respondió, pero no devolvió una cotización válida para MSFT.');
  return quote;
}
