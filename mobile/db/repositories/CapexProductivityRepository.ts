import { desc } from 'drizzle-orm';

import { evaluateCapexProductivity, CapexProductivityInput } from '../../domain/capexProductivity';
import { db } from '../client';
import { capexProductivityAssessment } from '../schema';
import { AuditLogRepository } from './AuditLogRepository';

export const CapexProductivityRepository = {
  async evaluateAndInsert(input: CapexProductivityInput, evidenceRefs: string[] = []) {
    const result = evaluateCapexProductivity(input);
    const now = new Date();
    const id = `CAPEX-${input.ticker.toUpperCase()}-${now.getTime()}`;

    await db.insert(capexProductivityAssessment).values({
      id,
      canonicalTicker: input.ticker.trim().toUpperCase(),
      score: result.score,
      state: result.state,
      signalCount: result.signalCount,
      completeness: result.completeness,
      underMonetization: result.state === 'CAPEX_UNDER_MONETIZATION',
      inputJson: JSON.stringify(input),
      resultJson: JSON.stringify(result),
      evidenceRefsJson: JSON.stringify(evidenceRefs),
      createdAt: now,
    });

    await AuditLogRepository.insert({
      id: `AUD-${now.getTime()}-CAPEX`,
      action: 'CAPEX_PRODUCTIVITY_EVALUATE',
      actor: 'SYSTEM',
      target: input.ticker.trim().toUpperCase(),
      payloadHash: null,
      createdAt: now,
    });

    return result;
  },

  async listLatest(limit = 100) {
    return db
      .select()
      .from(capexProductivityAssessment)
      .orderBy(desc(capexProductivityAssessment.createdAt))
      .limit(limit);
  },
};
