import * as SecureStore from 'expo-secure-store';
import { eq } from 'drizzle-orm';

import { db } from './client';
import { brokerOrder, brokerPosition, marketSnapshot, syncState, universeSymbol } from './schema';
import type { FunctionalCheck, FunctionalGateResult } from './runtimeSelfTest';

function assert(condition: unknown, detail: string): asserts condition {
  if (!condition) throw new Error(detail);
}

async function check(name: string, operation: () => Promise<void>): Promise<FunctionalCheck> {
  try {
    await operation();
    return { name, ok: true, detail: 'PASS' };
  } catch (cause) {
    return { name, ok: false, detail: cause instanceof Error ? cause.message : String(cause) };
  }
}

export async function runAutomationFunctionalSelfTest(): Promise<FunctionalGateResult> {
  const token = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const checks: FunctionalCheck[] = [];
  const now = new Date();

  const brokerPositionId = `SELF-AUTO-POS-${token}`;
  checks.push(await check('automation broker_position CRUD', async () => {
    try {
      await db.insert(brokerPosition).values({
        id: brokerPositionId,
        broker: 'SELFTEST',
        brokerTicker: 'SELFTEST_US_EQ',
        canonicalTicker: 'SELFTEST',
        isin: null,
        companyName: 'Automation Self Test',
        currency: 'USD',
        quantity: 1,
        averagePrice: 10,
        currentPrice: 11,
        marketValue: 11,
        unrealizedPnl: 1,
        syncedAt: now,
      });
      const created = await db.select().from(brokerPosition).where(eq(brokerPosition.id, brokerPositionId)).limit(1);
      assert(created[0]?.quantity === 1, 'broker_position insert/read failed');
      await db.update(brokerPosition).set({ quantity: 2 }).where(eq(brokerPosition.id, brokerPositionId));
      const updated = await db.select().from(brokerPosition).where(eq(brokerPosition.id, brokerPositionId)).limit(1);
      assert(updated[0]?.quantity === 2, 'broker_position update failed');
    } finally {
      await db.delete(brokerPosition).where(eq(brokerPosition.id, brokerPositionId));
    }
  }));

  const orderId = `SELF-AUTO-ORD-${token}`;
  checks.push(await check('automation broker_order CRUD', async () => {
    try {
      await db.insert(brokerOrder).values({
        id: orderId,
        broker: 'SELFTEST',
        brokerTicker: 'SELFTEST_US_EQ',
        canonicalTicker: 'SELFTEST',
        orderType: 'MARKET',
        quantity: 1,
        limitPrice: null,
        stopPrice: null,
        status: 'PENDING',
        createdAt: now,
        syncedAt: now,
      });
      const created = await db.select().from(brokerOrder).where(eq(brokerOrder.id, orderId)).limit(1);
      assert(created[0]?.status === 'PENDING', 'broker_order insert/read failed');
      await db.update(brokerOrder).set({ status: 'TESTED' }).where(eq(brokerOrder.id, orderId));
      const updated = await db.select().from(brokerOrder).where(eq(brokerOrder.id, orderId)).limit(1);
      assert(updated[0]?.status === 'TESTED', 'broker_order update failed');
    } finally {
      await db.delete(brokerOrder).where(eq(brokerOrder.id, orderId));
    }
  }));

  const marketTicker = `SELF${token.slice(-5).toUpperCase()}`;
  checks.push(await check('automation market_snapshot upsert', async () => {
    try {
      await db.insert(marketSnapshot).values({
        canonicalTicker: marketTicker,
        price: 100,
        change: 1,
        changePercent: 1,
        dayLow: 98,
        dayHigh: 101,
        yearLow: 60,
        yearHigh: 110,
        marketCap: 20_000_000_000,
        volume: 1_000_000,
        averageVolume: 900_000,
        priceAvg50: 90,
        priceAvg200: 80,
        exchange: 'SELF',
        source: 'SELFTEST',
        updatedAt: now,
      });
      await db.insert(marketSnapshot).values({
        canonicalTicker: marketTicker,
        price: 101,
        source: 'SELFTEST',
        updatedAt: new Date(),
      }).onConflictDoUpdate({ target: marketSnapshot.canonicalTicker, set: { price: 101, updatedAt: new Date() } });
      const row = await db.select().from(marketSnapshot).where(eq(marketSnapshot.canonicalTicker, marketTicker)).limit(1);
      assert(row[0]?.price === 101, 'market_snapshot upsert failed');
    } finally {
      await db.delete(marketSnapshot).where(eq(marketSnapshot.canonicalTicker, marketTicker));
    }
  }));

  const universeTicker = `U${token.slice(-7).toUpperCase()}`;
  checks.push(await check('automation universe_symbol CRUD', async () => {
    try {
      await db.insert(universeSymbol).values({
        symbol: universeTicker,
        companyName: 'Universe Self Test',
        exchange: 'SELF',
        exchangeShortName: 'SELF',
        type: 'stock',
        source: 'GLOBAL_DISCOVERY_SELFTEST',
        discoveredAt: now,
      });
      const row = await db.select().from(universeSymbol).where(eq(universeSymbol.symbol, universeTicker)).limit(1);
      assert(row[0]?.source === 'GLOBAL_DISCOVERY_SELFTEST', 'universe_symbol insert/read failed');
    } finally {
      await db.delete(universeSymbol).where(eq(universeSymbol.symbol, universeTicker));
    }
  }));

  const syncKey = `SELF-AUTO-SYNC-${token}`;
  checks.push(await check('automation sync_state upsert', async () => {
    try {
      await db.insert(syncState).values({
        key: syncKey,
        status: 'RUNNING',
        lastAttemptAt: now,
        lastSuccessAt: null,
        error: null,
        payloadJson: '{}',
      });
      await db.update(syncState).set({ status: 'SUCCESS', lastSuccessAt: new Date() }).where(eq(syncState.key, syncKey));
      const row = await db.select().from(syncState).where(eq(syncState.key, syncKey)).limit(1);
      assert(row[0]?.status === 'SUCCESS', 'sync_state update failed');
    } finally {
      await db.delete(syncState).where(eq(syncState.key, syncKey));
    }
  }));

  const secureKey = `atlas.selftest.${token}`;
  checks.push(await check('SecureStore encrypted credential roundtrip', async () => {
    try {
      await SecureStore.setItemAsync(secureKey, 'ATLAS_SELF_TEST_SECRET');
      const value = await SecureStore.getItemAsync(secureKey);
      assert(value === 'ATLAS_SELF_TEST_SECRET', 'SecureStore readback failed');
    } finally {
      await SecureStore.deleteItemAsync(secureKey).catch(() => undefined);
    }
  }));

  return {
    ok: checks.every((item) => item.ok),
    checkedAt: new Date().toISOString(),
    checks,
  };
}
