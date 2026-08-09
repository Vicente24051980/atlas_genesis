import { and, eq } from 'drizzle-orm';

import { db } from '../client';
import { portfolio, position, watchlist } from '../schema';
import type { TrackedTicker, TrackedUniverse } from '../../core/api/atlasOnlineApi';

export type UserUniverseKind = 'portfolio' | 'watchlist';

const PRIMARY_PORTFOLIO_ID = 'ATLAS-PRIMARY';

function normalizeTicker(value: string): string {
  const ticker = value.trim().toUpperCase();
  if (!/^[A-Z0-9.\-]{1,20}$/.test(ticker)) throw new Error(`Ticker no válido: ${value}`);
  return ticker;
}

async function ensurePortfolioShell(): Promise<void> {
  const existing = await db.select().from(portfolio).where(eq(portfolio.id, PRIMARY_PORTFOLIO_ID)).limit(1);
  if (existing.length) return;
  const now = new Date();
  await db.insert(portfolio).values({ id: PRIMARY_PORTFOLIO_ID, name: 'ATLAS Ω', createdAt: now, updatedAt: now });
}

export class UserUniverseRepository {
  static async initializeFromRemote(universe: TrackedUniverse): Promise<void> {
    await ensurePortfolioShell();

    const localPositions = await db.select().from(position).where(eq(position.portfolioId, PRIMARY_PORTFOLIO_ID));
    if (!localPositions.length) {
      const rows = [...universe.portfolio, ...universe.portfolioPending];
      for (const item of rows) {
        const ticker = normalizeTicker(item.ticker);
        await db.insert(position).values({
          id: `POS-${ticker}`,
          portfolioId: PRIMARY_PORTFOLIO_ID,
          canonicalTicker: ticker,
          companyName: item.name || ticker,
          quantity: 0,
          costBasis: null,
          status: item.state === 'PENDING' ? 'PENDING' : 'ACTIVE',
          updatedAt: new Date(),
        });
      }
    }

    const localWatch = await db.select().from(watchlist);
    if (!localWatch.length) {
      for (const item of universe.watchlist) {
        const ticker = normalizeTicker(item.ticker);
        const inPortfolio = await db.select({ id: position.id }).from(position)
          .where(and(eq(position.portfolioId, PRIMARY_PORTFOLIO_ID), eq(position.canonicalTicker, ticker))).limit(1);
        if (inPortfolio.length) continue;
        await db.insert(watchlist).values({
          id: `WATCH-${ticker}`,
          canonicalTicker: ticker,
          companyName: item.name || ticker,
          state: 'ACTIVE',
          addedAt: new Date(),
        });
      }
    }
  }

  static async list(kind: UserUniverseKind): Promise<TrackedTicker[]> {
    if (kind === 'portfolio') {
      await ensurePortfolioShell();
      const rows = await db.select().from(position).where(eq(position.portfolioId, PRIMARY_PORTFOLIO_ID));
      return rows
        .filter((row) => row.status !== 'REMOVED')
        .map((row) => ({
          ticker: row.canonicalTicker,
          name: row.companyName,
          state: row.status,
        }))
        .sort((a, b) => a.ticker.localeCompare(b.ticker));
    }

    const rows = await db.select().from(watchlist);
    return rows
      .filter((row) => row.state !== 'REMOVED')
      .map((row) => ({ ticker: row.canonicalTicker, name: row.companyName, state: row.state }))
      .sort((a, b) => a.ticker.localeCompare(b.ticker));
  }

  static async add(kind: UserUniverseKind, rawTickers: string[]): Promise<string[]> {
    await ensurePortfolioShell();
    const tickers = [...new Set(rawTickers.map(normalizeTicker))];
    const added: string[] = [];

    for (const ticker of tickers) {
      const portfolioMatch = await db.select({ id: position.id }).from(position)
        .where(and(eq(position.portfolioId, PRIMARY_PORTFOLIO_ID), eq(position.canonicalTicker, ticker))).limit(1);
      const watchMatch = await db.select({ id: watchlist.id }).from(watchlist)
        .where(eq(watchlist.canonicalTicker, ticker)).limit(1);

      if (kind === 'portfolio') {
        if (watchMatch.length) throw new Error(`${ticker} ya está en Watchlist Ω. Elimínalo allí antes de añadirlo a cartera.`);
        if (portfolioMatch.length) continue;
        await db.insert(position).values({
          id: `POS-${ticker}-${Date.now()}`,
          portfolioId: PRIMARY_PORTFOLIO_ID,
          canonicalTicker: ticker,
          companyName: ticker,
          quantity: 0,
          costBasis: null,
          status: 'ACTIVE',
          updatedAt: new Date(),
        });
      } else {
        if (portfolioMatch.length) throw new Error(`${ticker} ya está en Mi Cartera Ω y no puede duplicarse en Watchlist.`);
        if (watchMatch.length) continue;
        await db.insert(watchlist).values({
          id: `WATCH-${ticker}-${Date.now()}`,
          canonicalTicker: ticker,
          companyName: ticker,
          state: 'ACTIVE',
          addedAt: new Date(),
        });
      }
      added.push(ticker);
    }
    return added;
  }

  static async remove(kind: UserUniverseKind, rawTicker: string): Promise<void> {
    const ticker = normalizeTicker(rawTicker);
    if (kind === 'portfolio') {
      await db.delete(position).where(and(eq(position.portfolioId, PRIMARY_PORTFOLIO_ID), eq(position.canonicalTicker, ticker)));
    } else {
      await db.delete(watchlist).where(eq(watchlist.canonicalTicker, ticker));
    }
  }

  static async resetToRemote(kind: UserUniverseKind, universe: TrackedUniverse): Promise<void> {
    await ensurePortfolioShell();
    if (kind === 'portfolio') {
      await db.delete(position).where(eq(position.portfolioId, PRIMARY_PORTFOLIO_ID));
    } else {
      await db.delete(watchlist);
    }
    await this.initializeFromRemote(universe);
  }
}

export function parseTickerList(value: string): string[] {
  return value
    .split(/[\s,;|]+/g)
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean);
}
