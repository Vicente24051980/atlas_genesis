import { desc, eq } from 'drizzle-orm';

import { db } from '../client';
import { evidence } from '../schema';

export type EvidenceRecord = typeof evidence.$inferSelect;
export type NewEvidenceRecord = typeof evidence.$inferInsert;

export class EvidenceRepository {
  static async getAll(): Promise<EvidenceRecord[]> {
    return db.select().from(evidence).orderBy(desc(evidence.createdAt));
  }

  static async getByValidationState(validationState: string): Promise<EvidenceRecord[]> {
    return db
      .select()
      .from(evidence)
      .where(eq(evidence.validationState, validationState))
      .orderBy(desc(evidence.createdAt));
  }

  static async getById(id: string): Promise<EvidenceRecord | undefined> {
    const rows = await db.select().from(evidence).where(eq(evidence.id, id)).limit(1);
    return rows[0];
  }

  static async insert(data: NewEvidenceRecord): Promise<void> {
    await db.insert(evidence).values({
      ...data,
      createdAt: data.createdAt ?? new Date(),
    });
  }

  static async updateValidationState(id: string, validationState: string): Promise<void> {
    await db.update(evidence).set({ validationState }).where(eq(evidence.id, id));
  }

  static async delete(id: string): Promise<void> {
    await db.delete(evidence).where(eq(evidence.id, id));
  }
}
