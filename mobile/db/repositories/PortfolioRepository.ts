import { desc, eq } from 'drizzle-orm';

import { db } from '../client';
import { position } from '../schema';

export type PortfolioPosition = typeof position.$inferSelect;
export type NewPortfolioPosition = typeof position.$inferInsert;

export class PortfolioRepository {
  static async getAll(): Promise<PortfolioPosition[]> {
    return db.select().from(position).orderBy(desc(position.updatedAt));
  }

  static async getByStatus(status: string): Promise<PortfolioPosition[]> {
    return db.select().from(position).where(eq(position.status, status)).orderBy(desc(position.updatedAt));
  }

  static async getByTicker(ticker: string): Promise<PortfolioPosition | undefined> {
    const rows = await db
      .select()
      .from(position)
      .where(eq(position.canonicalTicker, ticker.toUpperCase()))
      .limit(1);
    return rows[0];
  }

  static async upsert(data: NewPortfolioPosition): Promise<void> {
    const normalized = {
      ...data,
      canonicalTicker: data.canonicalTicker.toUpperCase(),
      updatedAt: data.updatedAt ?? new Date(),
    };

    await db
      .insert(position)
      .values(normalized)
      .onConflictDoUpdate({
        target: position.id,
        set: {
          portfolioId: normalized.portfolioId,
          canonicalTicker: normalized.canonicalTicker,
          companyName: normalized.companyName,
          quantity: normalized.quantity,
          costBasis: normalized.costBasis,
          status: normalized.status,
          updatedAt: normalized.updatedAt,
        },
      });
  }

  static async delete(id: string): Promise<void> {
    await db.delete(position).where(eq(position.id, id));
  }

  static async getMetrics(): Promise<{ totalCostBasis: number; activeCount: number; totalCount: number }> {
    const positions = await this.getAll();
    return positions.reduce(
      (acc, item) => {
        acc.totalCount += 1;
        if (item.status === 'ACTIVE') acc.activeCount += 1;
        acc.totalCostBasis += (item.costBasis ?? 0) * item.quantity;
        return acc;
      },
      { totalCostBasis: 0, activeCount: 0, totalCount: 0 },
    );
  }
}
