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

export const capexProductivityAssessment = sqliteTable('capex_productivity_assessment', {
  id: text('id').primaryKey(),
  canonicalTicker: text('canonical_ticker').notNull(),
  score: real('score'),
  state: text('state').notNull(),
  signalCount: integer('signal_count').notNull().default(0),
  completeness: real('completeness').notNull().default(0),
  underMonetization: integer('under_monetization', { mode: 'boolean' }).notNull().default(false),
  inputJson: text('input_json').notNull(),
  resultJson: text('result_json').notNull(),
  evidenceRefsJson: text('evidence_refs_json').notNull().default('[]'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
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
