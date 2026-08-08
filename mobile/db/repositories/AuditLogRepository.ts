import { desc, eq } from 'drizzle-orm';

import { db } from '../client';
import { auditLog } from '../schema';

export type AuditLogRecord = typeof auditLog.$inferSelect;
export type NewAuditLogRecord = typeof auditLog.$inferInsert;

export class AuditLogRepository {
  static async insert(entry: NewAuditLogRecord): Promise<void> {
    await db.insert(auditLog).values({
      ...entry,
      createdAt: entry.createdAt ?? new Date(),
    });
  }

  static async insertBatch(entries: NewAuditLogRecord[]): Promise<void> {
    if (entries.length === 0) return;
    await db.insert(auditLog).values(
      entries.map((entry) => ({
        ...entry,
        createdAt: entry.createdAt ?? new Date(),
      })),
    );
  }

  static async getAll(limit = 100): Promise<AuditLogRecord[]> {
    return db.select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(limit);
  }

  static async getByAction(action: string): Promise<AuditLogRecord[]> {
    return db.select().from(auditLog).where(eq(auditLog.action, action)).orderBy(desc(auditLog.createdAt));
  }

  static async getByActor(actor: string): Promise<AuditLogRecord[]> {
    return db.select().from(auditLog).where(eq(auditLog.actor, actor)).orderBy(desc(auditLog.createdAt));
  }

  static async clearAll(): Promise<void> {
    await db.delete(auditLog);
  }

  static async getSummary(): Promise<{ total: number; passed: number; quarantined: number; rejected: number }> {
    const logs = await db.select().from(auditLog);
    return logs.reduce(
      (acc, log) => {
        acc.total += 1;
        const normalized = `${log.action} ${log.target ?? ''}`.toUpperCase();
        if (normalized.includes('PASS')) acc.passed += 1;
        else if (normalized.includes('QUARANTINED')) acc.quarantined += 1;
        else if (normalized.includes('REJECT') || normalized.includes('FAIL') || normalized.includes('INVALID')) acc.rejected += 1;
        return acc;
      },
      { total: 0, passed: 0, quarantined: 0, rejected: 0 },
    );
  }
}
