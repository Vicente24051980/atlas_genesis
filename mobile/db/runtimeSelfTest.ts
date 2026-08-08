import { eq } from 'drizzle-orm';

import { db } from './client';
import {
  auditLog,
  decisionLog,
  evidence,
  portfolio,
  position,
  radar,
  settings,
  watchlist,
} from './schema';

export const MOBILE_FUNCTIONAL_GATE_KEY = 'mobile_functional_gate_v1';

export type FunctionalCheck = {
  name: string;
  ok: boolean;
  detail: string;
};

export type FunctionalGateResult = {
  ok: boolean;
  checkedAt: string;
  checks: FunctionalCheck[];
};

function assert(condition: unknown, detail: string): asserts condition {
  if (!condition) throw new Error(detail);
}

function token(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
}

async function runCheck(name: string, operation: () => Promise<void>): Promise<FunctionalCheck> {
  try {
    await operation();
    return { name, ok: true, detail: 'PASS' };
  } catch (cause) {
    return {
      name,
      ok: false,
      detail: cause instanceof Error ? cause.message : String(cause),
    };
  }
}

export async function runMobileFunctionalSelfTest(): Promise<FunctionalGateResult> {
  const runToken = token();
  const checks: FunctionalCheck[] = [];

  const portfolioId = `SELFTEST-PORT-${runToken}`;
  checks.push(await runCheck('portfolio root CRUD', async () => {
    try {
      const now = new Date();
      await db.insert(portfolio).values({ id: portfolioId, name: 'ATLAS SELF TEST', createdAt: now, updatedAt: now });
      const created = await db.select().from(portfolio).where(eq(portfolio.id, portfolioId)).limit(1);
      assert(created[0]?.name === 'ATLAS SELF TEST', 'portfolio insert/read failed');
      await db.update(portfolio).set({ name: 'ATLAS SELF TEST UPDATED', updatedAt: new Date() }).where(eq(portfolio.id, portfolioId));
      const updated = await db.select().from(portfolio).where(eq(portfolio.id, portfolioId)).limit(1);
      assert(updated[0]?.name === 'ATLAS SELF TEST UPDATED', 'portfolio update failed');
    } finally {
      await db.delete(portfolio).where(eq(portfolio.id, portfolioId));
    }
  }));

  const positionId = `SELFTEST-POS-${runToken}`;
  checks.push(await runCheck('portfolio position CRUD', async () => {
    try {
      await db.insert(position).values({
        id: positionId,
        portfolioId,
        canonicalTicker: `T${runToken.slice(-7)}`,
        companyName: 'ATLAS Runtime Self Test',
        quantity: 1,
        costBasis: 10,
        status: 'ACTIVE',
        updatedAt: new Date(),
      });
      const created = await db.select().from(position).where(eq(position.id, positionId)).limit(1);
      assert(created[0]?.quantity === 1, 'position insert/read failed');
      await db.update(position).set({ quantity: 2, updatedAt: new Date() }).where(eq(position.id, positionId));
      const updated = await db.select().from(position).where(eq(position.id, positionId)).limit(1);
      assert(updated[0]?.quantity === 2, 'position update failed');
    } finally {
      await db.delete(position).where(eq(position.id, positionId));
    }
  }));

  const watchId = `SELFTEST-WL-${runToken}`;
  const watchTicker = `W${runToken.replace(/[^A-Z0-9]/g, '').slice(-8)}`;
  checks.push(await runCheck('watchlist CRUD', async () => {
    try {
      await db.insert(watchlist).values({
        id: watchId,
        canonicalTicker: watchTicker,
        companyName: 'ATLAS Watchlist Self Test',
        state: 'ACTIVE',
        addedAt: new Date(),
      });
      const created = await db.select().from(watchlist).where(eq(watchlist.id, watchId)).limit(1);
      assert(created[0]?.canonicalTicker === watchTicker, 'watchlist insert/read failed');
      await db.update(watchlist).set({ state: 'TESTED' }).where(eq(watchlist.id, watchId));
      const updated = await db.select().from(watchlist).where(eq(watchlist.id, watchId)).limit(1);
      assert(updated[0]?.state === 'TESTED', 'watchlist update failed');
    } finally {
      await db.delete(watchlist).where(eq(watchlist.id, watchId));
    }
  }));

  const evidenceId = `SELFTEST-EVD-${runToken}`;
  checks.push(await runCheck('evidence CRUD + epistemic state', async () => {
    try {
      await db.insert(evidence).values({
        id: evidenceId,
        subjectId: 'SELFTEST',
        sourceType: 'PRIMARY',
        sourceRef: 'runtime://self-test',
        validationState: 'PENDING_PRIMARY_VALIDATION',
        epistemicClass: 'EVIDENCE',
        contentHash: null,
        summary: 'Temporary runtime self-test evidence.',
        createdAt: new Date(),
      });
      const created = await db.select().from(evidence).where(eq(evidence.id, evidenceId)).limit(1);
      assert(created[0]?.validationState === 'PENDING_PRIMARY_VALIDATION', 'evidence insert/read failed');
      await db.update(evidence).set({ validationState: 'VERIFIED_FACT' }).where(eq(evidence.id, evidenceId));
      const updated = await db.select().from(evidence).where(eq(evidence.id, evidenceId)).limit(1);
      assert(updated[0]?.validationState === 'VERIFIED_FACT', 'evidence validation-state update failed');
    } finally {
      await db.delete(evidence).where(eq(evidence.id, evidenceId));
    }
  }));

  const radarId = `SELFTEST-RAD-${runToken}`;
  checks.push(await runCheck('radar CRUD', async () => {
    try {
      await db.insert(radar).values({
        id: radarId,
        subjectId: 'SELFTEST',
        signalType: 'WAVE',
        score: 77,
        severity: 'MEDIUM',
        payloadJson: JSON.stringify({ note: 'runtime self-test' }),
        createdAt: new Date(),
      });
      const created = await db.select().from(radar).where(eq(radar.id, radarId)).limit(1);
      assert(created[0]?.score === 77, 'radar insert/read failed');
      await db.update(radar).set({ score: 88 }).where(eq(radar.id, radarId));
      const updated = await db.select().from(radar).where(eq(radar.id, radarId)).limit(1);
      assert(updated[0]?.score === 88, 'radar update failed');
    } finally {
      await db.delete(radar).where(eq(radar.id, radarId));
    }
  }));

  const decisionId = `SELFTEST-DEC-${runToken}`;
  checks.push(await runCheck('daily intelligence CRUD', async () => {
    try {
      await db.insert(decisionLog).values({
        id: decisionId,
        subjectId: 'SELFTEST',
        decisionType: 'REVIEW',
        rationale: 'Temporary runtime self-test decision.',
        evidenceRefsJson: '[]',
        createdAt: new Date(),
      });
      const created = await db.select().from(decisionLog).where(eq(decisionLog.id, decisionId)).limit(1);
      assert(created[0]?.decisionType === 'REVIEW', 'decision insert/read failed');
      await db.update(decisionLog).set({ decisionType: 'HOLD' }).where(eq(decisionLog.id, decisionId));
      const updated = await db.select().from(decisionLog).where(eq(decisionLog.id, decisionId)).limit(1);
      assert(updated[0]?.decisionType === 'HOLD', 'decision update failed');
    } finally {
      await db.delete(decisionLog).where(eq(decisionLog.id, decisionId));
    }
  }));

  const settingKey = `self_test_${runToken}`;
  checks.push(await runCheck('settings / digital twin persistence', async () => {
    try {
      await db.insert(settings).values({ key: settingKey, valueJson: '{"stage":1}', updatedAt: new Date() });
      const created = await db.select().from(settings).where(eq(settings.key, settingKey)).limit(1);
      assert(created[0]?.valueJson === '{"stage":1}', 'settings insert/read failed');
      await db.update(settings).set({ valueJson: '{"stage":2}', updatedAt: new Date() }).where(eq(settings.key, settingKey));
      const updated = await db.select().from(settings).where(eq(settings.key, settingKey)).limit(1);
      assert(updated[0]?.valueJson === '{"stage":2}', 'settings update failed');
    } finally {
      await db.delete(settings).where(eq(settings.key, settingKey));
    }
  }));

  const auditId = `SELFTEST-AUD-${runToken}`;
  checks.push(await runCheck('audit log CRUD', async () => {
    try {
      await db.insert(auditLog).values({
        id: auditId,
        action: 'SELF_TEST',
        actor: 'SYSTEM',
        target: runToken,
        payloadHash: null,
        createdAt: new Date(),
      });
      const created = await db.select().from(auditLog).where(eq(auditLog.id, auditId)).limit(1);
      assert(created[0]?.action === 'SELF_TEST', 'audit insert/read failed');
    } finally {
      await db.delete(auditLog).where(eq(auditLog.id, auditId));
    }
  }));

  const result: FunctionalGateResult = {
    ok: checks.every((check) => check.ok),
    checkedAt: new Date().toISOString(),
    checks,
  };

  try {
    await db.insert(settings).values({
      key: MOBILE_FUNCTIONAL_GATE_KEY,
      valueJson: JSON.stringify(result),
      updatedAt: new Date(),
    }).onConflictDoUpdate({
      target: settings.key,
      set: { valueJson: JSON.stringify(result), updatedAt: new Date() },
    });
  } catch {
    // The in-memory result is still authoritative for the startup gate.
  }

  return result;
}
