import { getTrading212Credentials, Trading212Environment } from '../credentials';

export type Trading212Position = {
  brokerTicker: string;
  canonicalTicker: string;
  isin: string | null;
  companyName: string;
  currency: string | null;
  quantity: number;
  averagePrice: number | null;
  currentPrice: number | null;
  marketValue: number | null;
  unrealizedPnl: number | null;
};

export type Trading212Order = {
  id: string;
  brokerTicker: string;
  canonicalTicker: string;
  orderType: string | null;
  quantity: number | null;
  limitPrice: number | null;
  stopPrice: number | null;
  status: string | null;
  createdAt: Date | null;
};

export type Trading212AccountSummary = Record<string, unknown>;

type JsonObject = Record<string, unknown>;

const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function base64Ascii(value: string): string {
  const bytes = Array.from(value).map((char) => char.charCodeAt(0));
  let result = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i] ?? 0;
    const b = bytes[i + 1] ?? 0;
    const c = bytes[i + 2] ?? 0;
    const triple = (a << 16) | (b << 8) | c;
    result += BASE64_ALPHABET[(triple >> 18) & 63];
    result += BASE64_ALPHABET[(triple >> 12) & 63];
    result += i + 1 < bytes.length ? BASE64_ALPHABET[(triple >> 6) & 63] : '=';
    result += i + 2 < bytes.length ? BASE64_ALPHABET[triple & 63] : '=';
  }
  return result;
}

function baseUrl(environment: Trading212Environment): string {
  return environment === 'demo'
    ? 'https://demo.trading212.com/api/v0'
    : 'https://live.trading212.com/api/v0';
}

function asObject(value: unknown): JsonObject {
  return value && typeof value === 'object' ? value as JsonObject : {};
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function canonicalizeTrading212Ticker(rawTicker: string): string {
  const prefix = rawTicker.split('_')[0] || rawTicker;
  const special: Record<string, string> = {
    BRKA: 'BRK.A',
    BRKB: 'BRK.B',
  };
  const normalized = prefix.toUpperCase();
  return special[normalized] ?? normalized;
}

async function request(path: string): Promise<unknown> {
  const credentials = await getTrading212Credentials();
  if (!credentials) throw new Error('Trading 212 no está configurado.');

  const auth = base64Ascii(`${credentials.apiKey}:${credentials.apiSecret}`);
  const response = await fetch(`${baseUrl(credentials.environment)}${path}`, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Trading 212 HTTP ${response.status}${body ? `: ${body.slice(0, 180)}` : ''}`);
  }
  return response.json();
}

export async function fetchTrading212Positions(): Promise<Trading212Position[]> {
  const raw = await request('/equity/positions');
  if (!Array.isArray(raw)) throw new Error('Trading 212 devolvió un formato inesperado para posiciones.');

  return raw.map((row): Trading212Position => {
    const item = asObject(row);
    const instrument = asObject(item.instrument);
    const brokerTicker = asString(instrument.ticker) ?? asString(item.ticker) ?? 'UNKNOWN';
    const quantity = asNumber(item.quantity) ?? 0;
    const averagePrice = asNumber(item.averagePricePaid) ?? asNumber(item.averagePrice);
    const currentPrice = asNumber(item.currentPrice);
    const walletImpact = asObject(item.walletImpact);
    const marketValue = asNumber(walletImpact.currentValue)
      ?? asNumber(walletImpact.totalValue)
      ?? (currentPrice == null ? null : currentPrice * quantity);
    const unrealizedPnl = asNumber(walletImpact.unrealizedProfitLoss)
      ?? asNumber(walletImpact.unrealizedPpl)
      ?? (averagePrice != null && currentPrice != null ? (currentPrice - averagePrice) * quantity : null);

    return {
      brokerTicker,
      canonicalTicker: canonicalizeTrading212Ticker(brokerTicker),
      isin: asString(instrument.isin),
      companyName: asString(instrument.name) ?? asString(instrument.shortName) ?? canonicalizeTrading212Ticker(brokerTicker),
      currency: asString(instrument.currencyCode) ?? asString(instrument.currency),
      quantity,
      averagePrice,
      currentPrice,
      marketValue,
      unrealizedPnl,
    };
  });
}

export async function fetchTrading212Orders(): Promise<Trading212Order[]> {
  const raw = await request('/equity/orders');
  if (!Array.isArray(raw)) throw new Error('Trading 212 devolvió un formato inesperado para órdenes.');

  return raw.map((row): Trading212Order => {
    const item = asObject(row);
    const brokerTicker = asString(item.ticker)
      ?? asString(asObject(item.instrument).ticker)
      ?? 'UNKNOWN';
    const id = String(item.id ?? `${brokerTicker}-${item.createdAt ?? Date.now()}`);
    const createdAtRaw = asString(item.createdAt);
    const createdAt = createdAtRaw ? new Date(createdAtRaw) : null;

    return {
      id,
      brokerTicker,
      canonicalTicker: canonicalizeTrading212Ticker(brokerTicker),
      orderType: asString(item.type) ?? asString(item.orderType),
      quantity: asNumber(item.quantity),
      limitPrice: asNumber(item.limitPrice),
      stopPrice: asNumber(item.stopPrice),
      status: asString(item.status),
      createdAt: createdAt && !Number.isNaN(createdAt.getTime()) ? createdAt : null,
    };
  });
}

export async function fetchTrading212AccountSummary(): Promise<Trading212AccountSummary> {
  const raw = await request('/equity/account/summary');
  return asObject(raw);
}

export async function testTrading212Connection(): Promise<{ positions: number; environment: Trading212Environment }> {
  const credentials = await getTrading212Credentials();
  if (!credentials) throw new Error('Trading 212 no está configurado.');
  const positions = await fetchTrading212Positions();
  return { positions: positions.length, environment: credentials.environment };
}
