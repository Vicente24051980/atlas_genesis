import { useEffect, useState } from 'react';

import { sqlite } from './client';

const BOOTSTRAP_SQL = `
CREATE TABLE IF NOT EXISTS portfolio (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS position (
  id TEXT PRIMARY KEY NOT NULL,
  portfolio_id TEXT NOT NULL,
  canonical_ticker TEXT NOT NULL,
  company_name TEXT NOT NULL,
  quantity REAL NOT NULL DEFAULT 0,
  cost_basis REAL,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS broker_position (
  id TEXT PRIMARY KEY NOT NULL,
  broker TEXT NOT NULL,
  broker_ticker TEXT NOT NULL,
  canonical_ticker TEXT NOT NULL,
  isin TEXT,
  company_name TEXT NOT NULL,
  currency TEXT,
  quantity REAL NOT NULL,
  average_price REAL,
  current_price REAL,
  market_value REAL,
  unrealized_pnl REAL,
  synced_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_broker_position_ticker ON broker_position(canonical_ticker);

CREATE TABLE IF NOT EXISTS broker_order (
  id TEXT PRIMARY KEY NOT NULL,
  broker TEXT NOT NULL,
  broker_ticker TEXT NOT NULL,
  canonical_ticker TEXT NOT NULL,
  order_type TEXT,
  quantity REAL,
  limit_price REAL,
  stop_price REAL,
  status TEXT,
  created_at INTEGER,
  synced_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS market_snapshot (
  canonical_ticker TEXT PRIMARY KEY NOT NULL,
  price REAL,
  change REAL,
  change_percent REAL,
  day_low REAL,
  day_high REAL,
  year_low REAL,
  year_high REAL,
  market_cap REAL,
  volume REAL,
  average_volume REAL,
  price_avg_50 REAL,
  price_avg_200 REAL,
  exchange TEXT,
  source TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS universe_symbol (
  symbol TEXT PRIMARY KEY NOT NULL,
  company_name TEXT,
  exchange TEXT,
  exchange_short_name TEXT,
  type TEXT,
  source TEXT NOT NULL,
  discovered_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS evidence (
  id TEXT PRIMARY KEY NOT NULL,
  subject_id TEXT NOT NULL,
  source_type TEXT NOT NULL,
  source_ref TEXT NOT NULL,
  validation_state TEXT NOT NULL,
  epistemic_class TEXT NOT NULL,
  content_hash TEXT,
  summary TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS decision_log (
  id TEXT PRIMARY KEY NOT NULL,
  subject_id TEXT,
  decision_type TEXT NOT NULL,
  rationale TEXT NOT NULL,
  evidence_refs_json TEXT NOT NULL DEFAULT '[]',
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS watchlist (
  id TEXT PRIMARY KEY NOT NULL,
  canonical_ticker TEXT NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'ACTIVE',
  added_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS radar (
  id TEXT PRIMARY KEY NOT NULL,
  subject_id TEXT NOT NULL,
  signal_type TEXT NOT NULL,
  score REAL,
  severity TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sync_state (
  key TEXT PRIMARY KEY NOT NULL,
  status TEXT NOT NULL,
  last_attempt_at INTEGER NOT NULL,
  last_success_at INTEGER,
  error TEXT,
  payload_json TEXT NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY NOT NULL,
  action TEXT NOT NULL,
  actor TEXT NOT NULL,
  target TEXT,
  payload_hash TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY NOT NULL,
  value_json TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
`;

export function ensureDatabaseSchema(): void {
  sqlite.execSync(BOOTSTRAP_SQL);
}

export function useDatabaseInitialization(): { isReady: boolean; error: Error | undefined } {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    try {
      ensureDatabaseSchema();
      setIsReady(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause : new Error(String(cause)));
    }
  }, []);

  return { isReady, error };
}
