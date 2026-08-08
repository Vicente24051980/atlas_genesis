import { desc, eq } from 'drizzle-orm';

import type { TerminalBundle } from '../../core/api/atlasApi';
import { db } from '../client';
import { auditSnapshot, company, engineResult, marketSnapshot, thesisSnapshot, watchlist } from '../schema';

export type TerminalCompany = typeof company.$inferSelect;

const uid = (prefix: string, ticker: string) => `${prefix}-${ticker}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

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

  async upsertResolvedCompany(bundle: TerminalBundle): Promise<TerminalCompany> {
    const profile = bundle.security;
    const canonicalTicker = (profile?.canonicalTicker || bundle.quote.ticker).trim().toUpperCase();
    const existing = await this.getByTicker(canonicalTicker);
    const now = new Date();

    if (existing) {
      await db.update(company).set({
        companyName: profile?.companyName || existing.companyName,
        exchange: profile?.exchange ?? existing.exchange,
        country: profile?.country ?? existing.country,
        sector: profile?.sector ?? existing.sector,
        industry: profile?.industry ?? existing.industry,
        currency: profile?.currency ?? existing.currency,
        identifierStatus: profile ? 'RESOLVED' : existing.identifierStatus,
        updatedAt: now,
      }).where(eq(company.id, existing.id));
      return (await this.getByTicker(canonicalTicker)) ?? existing;
    }

    const row = {
      id: `COMPANY-${canonicalTicker}`,
      canonicalTicker,
      companyName: profile?.companyName || canonicalTicker,
      exchange: profile?.exchange ?? null,
      mic: null,
      isin: null,
      country: profile?.country ?? null,
      sector: profile?.sector ?? null,
      industry: profile?.industry ?? null,
      currency: profile?.currency ?? null,
      identifierStatus: profile ? 'RESOLVED' : 'PENDING',
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(company).values(row);
    return row;
  },

  async persistLiveBundle(bundle: TerminalBundle): Promise<TerminalCompany> {
    const entity = await this.upsertResolvedCompany(bundle);
    const observedAt = new Date(bundle.quote.timestamp || bundle.generatedAt);
    const marketId = uid('MKT', entity.canonicalTicker);

    await db.insert(marketSnapshot).values({
      id: marketId,
      companyId: entity.id,
      provider: bundle.quote.provider,
      session: bundle.quote.session || 'UNKNOWN',
      price: bundle.quote.price,
      changePct: bundle.quote.changePct,
      marketCap: bundle.security?.marketCap ?? null,
      volume: bundle.history.at(-1)?.v ?? null,
      payloadJson: JSON.stringify(bundle.quote),
      observedAt,
    });

    if (bundle.marketSignals.status === 'OK' && bundle.marketSignals.algorithmVersion) {
      const auditId = uid('AUDIT-MARKET', entity.canonicalTicker);
      const createdAt = new Date(bundle.generatedAt);
      await db.insert(auditSnapshot).values({
        id: auditId,
        companyId: entity.id,
        algorithmVersion: bundle.marketSignals.algorithmVersion,
        status: 'PASS',
        inputManifestJson: JSON.stringify({ historyPoints: bundle.history.length, quote: bundle.quote, metrics: bundle.marketSignals.metrics }),
        outputManifestJson: JSON.stringify({
          momentumScore: bundle.marketSignals.momentumScore,
          waveScore: bundle.marketSignals.waveScore,
          downsideScore: bundle.marketSignals.downsideScore,
          downsideSeverity: bundle.marketSignals.downsideSeverity,
          streak: bundle.marketSignals.streak,
        }),
        explanationJson: JSON.stringify({ reasons: bundle.marketSignals.reasons, guardrail: bundle.marketSignals.guardrail }),
        createdAt,
      });

      const engines = [
        { engine: 'MOMENTUM', score: bundle.marketSignals.momentumScore, state: 'OBSERVATIONAL' },
        { engine: 'WAVE', score: bundle.marketSignals.waveScore, state: 'OBSERVATIONAL' },
        { engine: 'DOWNSIDE_ALERT', score: bundle.marketSignals.downsideScore, state: bundle.marketSignals.downsideSeverity || 'NORMAL' },
      ];
      for (const result of engines) {
        await db.insert(engineResult).values({
          id: uid(`ENGINE-${result.engine}`, entity.canonicalTicker),
          auditSnapshotId: auditId,
          companyId: entity.id,
          engine: result.engine,
          score: result.score,
          state: result.state,
          algorithmVersion: bundle.marketSignals.algorithmVersion,
          inputsJson: JSON.stringify(bundle.marketSignals.metrics || {}),
          explanationJson: JSON.stringify({ reasons: bundle.marketSignals.reasons }),
          evidenceRefsJson: '[]',
          createdAt,
        });
      }
    }

    return entity;
  },

  async addToWatchlist(entity: TerminalCompany): Promise<boolean> {
    const existing = await db.select().from(watchlist).where(eq(watchlist.canonicalTicker, entity.canonicalTicker)).limit(1);
    if (existing.length) return false;
    await db.insert(watchlist).values({
      id: uid('WATCH', entity.canonicalTicker),
      canonicalTicker: entity.canonicalTicker,
      companyName: entity.companyName,
      state: 'ACTIVE',
      addedAt: new Date(),
    });
    return true;
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

    return { market: marketRows[0] ?? null, audit: latestAudit, thesis: thesisRows[0] ?? null, engines };
  },
};
