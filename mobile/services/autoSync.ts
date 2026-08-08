import { desc, eq } from 'drizzle-orm';

import { CANONICAL_WATCHLIST_SEED } from '../data/canonicalWatchlist';
import { db } from '../db/client';
import { ensureDatabaseSchema } from '../db/migrator';
import {
  auditLog,
  brokerOrder,
  brokerPosition,
  marketSnapshot,
  radar,
  syncState,
  universeSymbol,
  watchlist,
} from '../db/schema';
import { getCredentialStatus } from './credentials';
import { fetchFmpGlobalUniverse, fetchFmpQuotes, FmpQuote } from './providers/fmp';
import {
  fetchTrading212AccountSummary,
  fetchTrading212Orders,
  fetchTrading212Positions,
} from './providers/trading212';

export type SyncTrigger = 'APP_START' | 'BACKGROUND' | 'USER_REFRESH' | 'SETUP_TEST';

export type AutoSyncResult = {
  ok: boolean;
  trigger: SyncTrigger;
  brokerPositions: number;
  brokerOrders: number;
  marketQuotes: number;
  radarSignals: number;
  universeSymbols: number;
  warnings: string[];
  completedAt: string;
};

const SYNC_KEY = 'AUTO_SYNC';
const UNIVERSE_SYNC_KEY = 'GLOBAL_UNIVERSE';
const UNIVERSE_REFRESH_MS = 24 * 60 * 60 * 1000;
const STARTUP_REFRESH_MS = 10 * 60 * 1000;

function id(prefix: string, value?: string): string {
  const suffix = value?.replace(/[^A-Za-z0-9.-]/g, '_') ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${prefix}-${suffix}`;
}

async function setSyncState(
  key: string,
  status: string,
  startedAt: Date,
  error: string | null,
  payload: Record<string, unknown>,
): Promise<void> {
  const now = new Date();
  const lastSuccessAt = status === 'SUCCESS' ? now : undefined;
  await db.insert(syncState).values({
    key,
    status,
    lastAttemptAt: startedAt,
    lastSuccessAt,
    error,
    payloadJson: JSON.stringify(payload),
  }).onConflictDoUpdate({
    target: syncState.key,
    set: {
      status,
      lastAttemptAt: startedAt,
      ...(lastSuccessAt ? { lastSuccessAt } : {}),
      error,
      payloadJson: JSON.stringify(payload),
    },
  });
}

export async function seedCanonicalWatchlist(): Promise<void> {
  const now = new Date();
  for (const item of CANONICAL_WATCHLIST_SEED) {
    await db.insert(watchlist).values({
      id: `WL-${item.ticker}`,
      canonicalTicker: item.ticker,
      companyName: item.companyName,
      state: item.state,
      addedAt: now,
    }).onConflictDoNothing();
  }
}

async function syncTrading212(): Promise<{ positions: number; orders: number; account: Record<string, unknown> | null }> {
  const credentials = await getCredentialStatus();
  if (!credentials.trading212) return { positions: 0, orders: 0, account: null };

  const now = new Date();
  const [positions, orders, account] = await Promise.all([
    fetchTrading212Positions(),
    fetchTrading212Orders(),
    fetchTrading212AccountSummary(),
  ]);

  await db.delete(brokerPosition).where(eq(brokerPosition.broker, 'TRADING212'));
  await db.delete(brokerOrder).where(eq(brokerOrder.broker, 'TRADING212'));

  for (const item of positions) {
    await db.insert(brokerPosition).values({
      id: id('T212POS', item.brokerTicker),
      broker: 'TRADING212',
      brokerTicker: item.brokerTicker,
      canonicalTicker: item.canonicalTicker,
      isin: item.isin,
      companyName: item.companyName,
      currency: item.currency,
      quantity: item.quantity,
      averagePrice: item.averagePrice,
      currentPrice: item.currentPrice,
      marketValue: item.marketValue,
      unrealizedPnl: item.unrealizedPnl,
      syncedAt: now,
    });
  }

  for (const item of orders) {
    await db.insert(brokerOrder).values({
      id: id('T212ORD', item.id),
      broker: 'TRADING212',
      brokerTicker: item.brokerTicker,
      canonicalTicker: item.canonicalTicker,
      orderType: item.orderType,
      quantity: item.quantity,
      limitPrice: item.limitPrice,
      stopPrice: item.stopPrice,
      status: item.status,
      createdAt: item.createdAt,
      syncedAt: now,
    });
  }

  // Portfolio is truth. Anything held is removed from the watchlist to prevent duplication.
  for (const item of positions) {
    await db.delete(watchlist).where(eq(watchlist.canonicalTicker, item.canonicalTicker));
  }

  await db.insert(auditLog).values({
    id: id('AUD'),
    action: 'BROKER_SYNC',
    actor: 'SYSTEM',
    target: 'TRADING212',
    payloadHash: null,
    createdAt: now,
  });

  return { positions: positions.length, orders: orders.length, account };
}

async function syncMarketData(): Promise<number> {
  const credentials = await getCredentialStatus();
  if (!credentials.fmp) return 0;

  const [portfolioRows, watchRows] = await Promise.all([
    db.select().from(brokerPosition),
    db.select().from(watchlist),
  ]);
  const symbols = [...new Set([
    ...portfolioRows.map((row) => row.canonicalTicker),
    ...watchRows.map((row) => row.canonicalTicker),
  ])].filter((symbol) => symbol && symbol !== 'SPCX');

  const quotes = await fetchFmpQuotes(symbols);
  const now = new Date();
  for (const quote of quotes) {
    await db.insert(marketSnapshot).values({
      canonicalTicker: quote.symbol,
      price: quote.price,
      change: quote.change,
      changePercent: quote.changePercent,
      dayLow: quote.dayLow,
      dayHigh: quote.dayHigh,
      yearLow: quote.yearLow,
      yearHigh: quote.yearHigh,
      marketCap: quote.marketCap,
      volume: quote.volume,
      averageVolume: quote.averageVolume,
      priceAvg50: quote.priceAvg50,
      priceAvg200: quote.priceAvg200,
      exchange: quote.exchange,
      source: 'FMP',
      updatedAt: now,
    }).onConflictDoUpdate({
      target: marketSnapshot.canonicalTicker,
      set: {
        price: quote.price,
        change: quote.change,
        changePercent: quote.changePercent,
        dayLow: quote.dayLow,
        dayHigh: quote.dayHigh,
        yearLow: quote.yearLow,
        yearHigh: quote.yearHigh,
        marketCap: quote.marketCap,
        volume: quote.volume,
        averageVolume: quote.averageVolume,
        priceAvg50: quote.priceAvg50,
        priceAvg200: quote.priceAvg200,
        exchange: quote.exchange,
        source: 'FMP',
        updatedAt: now,
      },
    });
  }
  return quotes.length;
}

function scoreMarketWave(quote: FmpQuote): { score: number; reasons: string[] } {
  let score = 40;
  const reasons: string[] = [];
  const day = quote.changePercent ?? 0;

  score += Math.max(-15, Math.min(15, day * 2));
  if (day > 0) reasons.push('Día positivo');

  if (quote.price != null && quote.priceAvg50 != null && quote.price > quote.priceAvg50) {
    score += 15;
    reasons.push('Precio > media 50d');
  }
  if (quote.price != null && quote.priceAvg200 != null && quote.price > quote.priceAvg200) {
    score += 15;
    reasons.push('Precio > media 200d');
  }
  if (quote.priceAvg50 != null && quote.priceAvg200 != null && quote.priceAvg50 > quote.priceAvg200) {
    score += 10;
    reasons.push('Media 50d > media 200d');
  }
  if (quote.price != null && quote.yearLow != null && quote.yearHigh != null && quote.yearHigh > quote.yearLow) {
    const rangePosition = (quote.price - quote.yearLow) / (quote.yearHigh - quote.yearLow);
    score += Math.max(0, Math.min(10, rangePosition * 10));
    if (rangePosition >= 0.75) reasons.push('Zona alta del rango anual');
  }

  return { score: Math.round(Math.max(0, Math.min(100, score))), reasons };
}

async function rebuildAutomaticRadar(): Promise<number> {
  const quoteRows = await db.select().from(marketSnapshot).orderBy(desc(marketSnapshot.updatedAt));
  await db.delete(radar);

  const ranked = quoteRows
    .map((row) => {
      const quote: FmpQuote = {
        symbol: row.canonicalTicker,
        name: null,
        price: row.price,
        change: row.change,
        changePercent: row.changePercent,
        dayLow: row.dayLow,
        dayHigh: row.dayHigh,
        yearLow: row.yearLow,
        yearHigh: row.yearHigh,
        marketCap: row.marketCap,
        volume: row.volume,
        averageVolume: row.averageVolume,
        priceAvg50: row.priceAvg50,
        priceAvg200: row.priceAvg200,
        exchange: row.exchange,
      };
      return { quote, ...scoreMarketWave(quote) };
    })
    .filter((item) => item.score >= 60)
    .sort((a, b) => b.score - a.score)
    .slice(0, 30);

  const now = new Date();
  for (const item of ranked) {
    await db.insert(radar).values({
      id: `AUTO-RADAR-${item.quote.symbol}`,
      subjectId: item.quote.symbol,
      signalType: 'AUTO_MARKET_WAVE',
      score: item.score,
      severity: item.score >= 80 ? 'HIGH' : item.score >= 70 ? 'MEDIUM' : 'LOW',
      payloadJson: JSON.stringify({
        source: 'FMP',
        canonical: false,
        classification: 'MARKET_SIGNAL',
        changePercent: item.quote.changePercent,
        price: item.quote.price,
        priceAvg50: item.quote.priceAvg50,
        priceAvg200: item.quote.priceAvg200,
        reasons: item.reasons,
        note: 'Señal cuantitativa automática. No modifica Quality Ω, tesis ni Conviction Ω.',
      }),
      createdAt: now,
    });
  }

  return ranked.length;
}

async function shouldRefreshUniverse(): Promise<boolean> {
  const rows = await db.select().from(syncState).where(eq(syncState.key, UNIVERSE_SYNC_KEY)).limit(1);
  const last = rows[0]?.lastSuccessAt?.getTime() ?? 0;
  return Date.now() - last >= UNIVERSE_REFRESH_MS;
}

async function syncGlobalUniverse(): Promise<number> {
  const credentials = await getCredentialStatus();
  if (!credentials.fmp) return 0;
  if (!(await shouldRefreshUniverse())) return 0;

  const startedAt = new Date();
  try {
    const items = await fetchFmpGlobalUniverse();
    const equities = items.filter((item) => {
      const type = (item.type ?? '').toLowerCase();
      return !type || type === 'stock' || type === 'equity';
    });

    await db.delete(universeSymbol);
    const now = new Date();
    for (const item of equities) {
      await db.insert(universeSymbol).values({
        symbol: item.symbol,
        companyName: item.name,
        exchange: item.exchange,
        exchangeShortName: item.exchangeShortName,
        type: item.type,
        source: 'FMP_ACTIVELY_TRADING_LIST',
        discoveredAt: now,
      }).onConflictDoNothing();
    }
    await setSyncState(UNIVERSE_SYNC_KEY, 'SUCCESS', startedAt, null, { symbols: equities.length });
    return equities.length;
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    await setSyncState(UNIVERSE_SYNC_KEY, 'ERROR', startedAt, message, {});
    throw cause;
  }
}

export async function shouldRunStartupSync(): Promise<boolean> {
  ensureDatabaseSchema();
  const rows = await db.select().from(syncState).where(eq(syncState.key, SYNC_KEY)).limit(1);
  const last = rows[0]?.lastSuccessAt?.getTime() ?? 0;
  return Date.now() - last >= STARTUP_REFRESH_MS;
}

export async function runAutomaticSync(trigger: SyncTrigger): Promise<AutoSyncResult> {
  ensureDatabaseSchema();
  const startedAt = new Date();
  const warnings: string[] = [];
  let brokerPositions = 0;
  let brokerOrders = 0;
  let marketQuotes = 0;
  let radarSignals = 0;
  let universeSymbols = 0;

  await setSyncState(SYNC_KEY, 'RUNNING', startedAt, null, { trigger });
  await seedCanonicalWatchlist();

  try {
    const credentialStatus = await getCredentialStatus();

    if (credentialStatus.trading212) {
      try {
        const broker = await syncTrading212();
        brokerPositions = broker.positions;
        brokerOrders = broker.orders;
      } catch (cause) {
        warnings.push(`Trading 212: ${cause instanceof Error ? cause.message : String(cause)}`);
      }
    } else {
      warnings.push('Trading 212 pendiente de configurar.');
    }

    if (credentialStatus.fmp) {
      try {
        marketQuotes = await syncMarketData();
        radarSignals = await rebuildAutomaticRadar();
      } catch (cause) {
        warnings.push(`FMP: ${cause instanceof Error ? cause.message : String(cause)}`);
      }

      if (trigger === 'BACKGROUND' || trigger === 'SETUP_TEST') {
        try {
          universeSymbols = await syncGlobalUniverse();
        } catch (cause) {
          warnings.push(`Discovery global: ${cause instanceof Error ? cause.message : String(cause)}`);
        }
      }
    } else {
      warnings.push('FMP pendiente de configurar.');
    }

    const result: AutoSyncResult = {
      ok: credentialStatus.trading212 || credentialStatus.fmp,
      trigger,
      brokerPositions,
      brokerOrders,
      marketQuotes,
      radarSignals,
      universeSymbols,
      warnings,
      completedAt: new Date().toISOString(),
    };

    await setSyncState(SYNC_KEY, result.ok ? 'SUCCESS' : 'NOT_CONFIGURED', startedAt, null, result);
    return result;
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    await setSyncState(SYNC_KEY, 'ERROR', startedAt, message, { trigger, warnings });
    throw cause;
  }
}
