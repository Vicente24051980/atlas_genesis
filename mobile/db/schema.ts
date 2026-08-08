import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const portfolio = sqliteTable('portfolio', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});

export const position = sqliteTable('position', {
  id: text('id').primaryKey(),
  portfolioId: text('portfolio_id').notNull(),
  canonicalTicker: text('canonical_ticker').notNull(),
  companyName: text('company_name').notNull(),
  quantity: real('quantity').notNull().default(0),
  costBasis: real('cost_basis'),
  status: text('status').notNull().default('ACTIVE'),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});

export const brokerPosition = sqliteTable('broker_position', {
  id: text('id').primaryKey(),
  broker: text('broker').notNull(),
  brokerTicker: text('broker_ticker').notNull(),
  canonicalTicker: text('canonical_ticker').notNull(),
  isin: text('isin'),
  companyName: text('company_name').notNull(),
  currency: text('currency'),
  quantity: real('quantity').notNull(),
  averagePrice: real('average_price'),
  currentPrice: real('current_price'),
  marketValue: real('market_value'),
  unrealizedPnl: real('unrealized_pnl'),
  syncedAt: integer('synced_at', { mode: 'timestamp_ms' }).notNull(),
});

export const brokerOrder = sqliteTable('broker_order', {
  id: text('id').primaryKey(),
  broker: text('broker').notNull(),
  brokerTicker: text('broker_ticker').notNull(),
  canonicalTicker: text('canonical_ticker').notNull(),
  orderType: text('order_type'),
  quantity: real('quantity'),
  limitPrice: real('limit_price'),
  stopPrice: real('stop_price'),
  status: text('status'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }),
  syncedAt: integer('synced_at', { mode: 'timestamp_ms' }).notNull(),
});

export const marketSnapshot = sqliteTable('market_snapshot', {
  canonicalTicker: text('canonical_ticker').primaryKey(),
  price: real('price'),
  change: real('change'),
  changePercent: real('change_percent'),
  dayLow: real('day_low'),
  dayHigh: real('day_high'),
  yearLow: real('year_low'),
  yearHigh: real('year_high'),
  marketCap: real('market_cap'),
  volume: real('volume'),
  averageVolume: real('average_volume'),
  priceAvg50: real('price_avg_50'),
  priceAvg200: real('price_avg_200'),
  exchange: text('exchange'),
  source: text('source').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});

export const universeSymbol = sqliteTable('universe_symbol', {
  symbol: text('symbol').primaryKey(),
  companyName: text('company_name'),
  exchange: text('exchange'),
  exchangeShortName: text('exchange_short_name'),
  type: text('type'),
  source: text('source').notNull(),
  discoveredAt: integer('discovered_at', { mode: 'timestamp_ms' }).notNull(),
});

export const evidence = sqliteTable('evidence', {
  id: text('id').primaryKey(),
  subjectId: text('subject_id').notNull(),
  sourceType: text('source_type').notNull(),
  sourceRef: text('source_ref').notNull(),
  validationState: text('validation_state').notNull(),
  epistemicClass: text('epistemic_class').notNull(),
  contentHash: text('content_hash'),
  summary: text('summary').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
});

export const decisionLog = sqliteTable('decision_log', {
  id: text('id').primaryKey(),
  subjectId: text('subject_id'),
  decisionType: text('decision_type').notNull(),
  rationale: text('rationale').notNull(),
  evidenceRefsJson: text('evidence_refs_json').notNull().default('[]'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
});

export const watchlist = sqliteTable('watchlist', {
  id: text('id').primaryKey(),
  canonicalTicker: text('canonical_ticker').notNull().unique(),
  companyName: text('company_name').notNull(),
  state: text('state').notNull().default('ACTIVE'),
  addedAt: integer('added_at', { mode: 'timestamp_ms' }).notNull(),
});

export const radar = sqliteTable('radar', {
  id: text('id').primaryKey(),
  subjectId: text('subject_id').notNull(),
  signalType: text('signal_type').notNull(),
  score: real('score'),
  severity: text('severity').notNull(),
  payloadJson: text('payload_json').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
});

export const syncState = sqliteTable('sync_state', {
  key: text('key').primaryKey(),
  status: text('status').notNull(),
  lastAttemptAt: integer('last_attempt_at', { mode: 'timestamp_ms' }).notNull(),
  lastSuccessAt: integer('last_success_at', { mode: 'timestamp_ms' }),
  error: text('error'),
  payloadJson: text('payload_json').notNull().default('{}'),
});

export const auditLog = sqliteTable('audit_log', {
  id: text('id').primaryKey(),
  action: text('action').notNull(),
  actor: text('actor').notNull(),
  target: text('target'),
  payloadHash: text('payload_hash'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
});

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  valueJson: text('value_json').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});
