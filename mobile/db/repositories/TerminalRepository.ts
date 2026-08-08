import { desc, eq } from 'drizzle-orm';

import { db } from '../client';
import { auditSnapshot, company, engineResult, marketSnapshot, thesisSnapshot } from '../schema';

export type TerminalCompany = typeof company.$inferSelect;

export const TerminalRepository = {
  async getByTicker(ticker: string): Promise<TerminalCompany | null> {
    const rows = await db.select().from(company).where(eq(company.canonicalTicker, ticker.trim().toUpperCase())).limit(1);
    return rows[0] ?? null;
  },

  async ensurePendingCompany(ticker: string): Promise<TerminalCompany> {
    const canonicalTicker = ticker.trim().toUpperCase();
    const existing = await this.getByTicker(canonicalTicker);
    if (existing) return existing;

    const now = new Date();
    const row = {
      id: `COMPANY-${canonicalTicker}`,
      canonicalTicker,
      companyName: canonicalTicker,
      exchange: null,
      mic: null,
      isin: null,
      country: null,
      sector: null,
      industry: null,
      currency: null,
      identifierStatus: 'PENDING',
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(company).values(row);
    return row;
  },

  async latestBundle(companyId: string) {
    const [marketRows, auditRows, thesisRows] = await Promise.all([
      db.select().from(marketSnapshot).where(eq(marketSnapshot.companyId, companyId)).orderBy(desc(marketSnapshot.observedAt)).limit(1),
      db.select().from(auditSnapshot).where(eq(auditSnapshot.companyId, companyId)).orderBy(desc(auditSnapshot.createdAt)).limit(1),
      db.select().from(thesisSnapshot).where(eq(thesisSnapshot.companyId, companyId)).orderBy(desc(thesisSnapshot.createdAt)).limit(1),
    ]);

    const latestAudit = auditRows[0] ?? null;
    const engines = latestAudit
      ? await db.select().from(engineResult).where(eq(engineResult.auditSnapshotId, latestAudit.id))
      : [];

    return {
      market: marketRows[0] ?? null,
      audit: latestAudit,
      thesis: thesisRows[0] ?? null,
      engines,
    };
  },
};
