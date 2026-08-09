import { and, desc, eq } from 'drizzle-orm';

import { db } from '../client';
import { decisionLog } from '../schema';

export type MonitorContext = 'portfolio' | 'watchlist';

export class DecisionMonitorRepository {
  static async recordIfChanged(input: {
    ticker: string;
    context: MonitorContext;
    action: string;
    actionLabel: string;
    atlasScore: number | null;
    generatedAt: string;
    reasons: string[];
  }): Promise<boolean> {
    const ticker = input.ticker.trim().toUpperCase();
    const decisionType = `ATLAS_MONITOR_${input.context.toUpperCase()}`;
    const latest = await db
      .select()
      .from(decisionLog)
      .where(and(eq(decisionLog.subjectId, ticker), eq(decisionLog.decisionType, decisionType)))
      .orderBy(desc(decisionLog.createdAt))
      .limit(1);

    let previousAction: string | null = null;
    if (latest[0]?.rationale) {
      try {
        const parsed = JSON.parse(latest[0].rationale) as { action?: unknown };
        if (typeof parsed.action === 'string') previousAction = parsed.action;
      } catch {
        previousAction = null;
      }
    }

    if (previousAction === input.action) return false;

    await db.insert(decisionLog).values({
      id: `MON-${input.context.toUpperCase()}-${ticker}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      subjectId: ticker,
      decisionType,
      rationale: JSON.stringify({
        action: input.action,
        actionLabel: input.actionLabel,
        atlasScore: input.atlasScore,
        generatedAt: input.generatedAt,
        reasons: input.reasons,
        previousAction,
      }),
      evidenceRefsJson: '[]',
      createdAt: new Date(),
    });

    return previousAction !== null;
  }
}
