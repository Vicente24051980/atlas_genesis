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

// Higher-layer ATLAS Terminal entities. Existing CORE-00 tables above remain semantically unchanged.
export const company = sqliteTable('company', {
  id: text('id').primaryKey(),
  canonicalTicker: text('canonical_ticker').notNull().unique(),
  companyName: text('company_name').notNull(),
  exchange: text('exchange'),
  mic: text('mic'),
  isin: text('isin'),
  country: text('country'),
  sector: text('sector'),
  industry: text('industry'),
  currency: text('currency'),
  identifierStatus: text('identifier_status').notNull().default('PENDING'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});

export const marketSnapshot = sqliteTable('market_snapshot', {
  id: text('id').primaryKey(),
  companyId: text('company_id').notNull(),
  provider: text('provider').notNull(),
  session: text('session').notNull(),
  price: real('price'),
  changePct: real('change_pct'),
  marketCap: real('market_cap'),
  volume: real('volume'),
  payloadJson: text('payload_json').notNull().default('{}'),
  observedAt: integer('observed_at', { mode: 'timestamp_ms' }).notNull(),
});

export const auditSnapshot = sqliteTable('audit_snapshot', {
  id: text('id').primaryKey(),
  companyId: text('company_id').notNull(),
  algorithmVersion: text('algorithm_version').notNull(),
  status: text('status').notNull(),
  inputManifestJson: text('input_manifest_json').notNull().default('{}'),
  outputManifestJson: text('output_manifest_json').notNull().default('{}'),
  explanationJson: text('explanation_json').notNull().default('{}'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
});

export const engineResult = sqliteTable('engine_result', {
  id: text('id').primaryKey(),
  auditSnapshotId: text('audit_snapshot_id').notNull(),
  companyId: text('company_id').notNull(),
  engine: text('engine').notNull(),
  score: real('score'),
  state: text('state').notNull(),
  algorithmVersion: text('algorithm_version').notNull(),
  inputsJson: text('inputs_json').notNull().default('{}'),
  explanationJson: text('explanation_json').notNull().default('{}'),
  evidenceRefsJson: text('evidence_refs_json').notNull().default('[]'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
});

export const thesisSnapshot = sqliteTable('thesis_snapshot', {
  id: text('id').primaryKey(),
  companyId: text('company_id').notNull(),
  state: text('state').notNull(),
  conviction: real('conviction'),
  freshness: real('freshness'),
  thesisJson: text('thesis_json').notNull().default('{}'),
  evidenceRefsJson: text('evidence_refs_json').notNull().default('[]'),
  algorithmVersion: text('algorithm_version').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
});

export const signalEvaluation = sqliteTable('signal_evaluation', {
  id: text('id').primaryKey(),
  companyId: text('company_id').notNull(),
  signalType: text('signal_type').notNull(),
  state: text('state').notNull(),
  score: real('score'),
  horizon: text('horizon'),
  reasonJson: text('reason_json').notNull().default('{}'),
  evidenceRefsJson: text('evidence_refs_json').notNull().default('[]'),
  priceAtSignal: real('price_at_signal'),
  outcomeJson: text('outcome_json'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  evaluatedAt: integer('evaluated_at', { mode: 'timestamp_ms' }),
});
