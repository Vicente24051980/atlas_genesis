import { desc, eq } from 'drizzle-orm';

import { CapexProductivityInput, CapexProductivityState, evaluateCapexProductivity } from '../../domain/capexProductivity';
import { db } from '../client';
import { capexProductivityAssessment } from '../schema';
import { AuditLogRepository } from './AuditLogRepository';

export const CapexProductivityRepository = {
  async evaluateAndInsert(input: CapexProductivityInput, evidenceRefs: string[] = []) {
    const result = evaluateCapexProductivity(input);
    const now = new Date();
    const normalizedTicker = input.ticker.trim().toUpperCase();
    const id = `CAPEX-${normalizedTicker}-${now.getTime()}`;

    const priorRows = await db
      .select()
      .from(capexProductivityAssessment)
      .where(eq(capexProductivityAssessment.canonicalTicker, normalizedTicker))
      .orderBy(desc(capexProductivityAssessment.createdAt))
      .limit(1);
    const prior = priorRows[0];

    let persistedState: CapexProductivityState = result.state;
    if (
      result.state === 'CAPEX_DETERIORATION'
      && result.signalCount >= 3
      && prior?.signalCount != null
      && prior.signalCount >= 3
      && prior.state !== 'CAPEX_UNDER_MONETIZATION'
    ) {
      persistedState = 'CAPEX_RED_ALERT';
    }

    const persistedResult = { ...result, state: persistedState };

    await db.insert(capexProductivityAssessment).values({
      id,
      canonicalTicker: normalizedTicker,
      score: result.score,
      state: persistedState,
      signalCount: result.signalCount,
      completeness: result.completeness,
      underMonetization: result.state === 'CAPEX_UNDER_MONETIZATION',
      inputJson: JSON.stringify(input),
      resultJson: JSON.stringify(persistedResult),
      evidenceRefsJson: JSON.stringify(evidenceRefs),
      createdAt: now,
    });

    await AuditLogRepository.insert({
      id: `AUD-${now.getTime()}-CAPEX`,
      action: persistedState === 'CAPEX_RED_ALERT' ? 'CAPEX_PRODUCTIVITY_RED_ALERT' : 'CAPEX_PRODUCTIVITY_EVALUATE',
      actor: 'SYSTEM',
      target: normalizedTicker,
      payloadHash: null,
      createdAt: now,
    });

    return persistedResult;
  },

  async listLatest(limit = 100) {
    return db
      .select()
      .from(capexProductivityAssessment)
      .orderBy(desc(capexProductivityAssessment.createdAt))
      .limit(limit);
  },
};
