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

CREATE TABLE IF NOT EXISTS capex_productivity_assessment (
  id TEXT PRIMARY KEY NOT NULL,
  canonical_ticker TEXT NOT NULL,
  score REAL,
  state TEXT NOT NULL,
  signal_count INTEGER NOT NULL DEFAULT 0,
  completeness REAL NOT NULL DEFAULT 0,
  under_monetization INTEGER NOT NULL DEFAULT 0,
  input_json TEXT NOT NULL,
  result_json TEXT NOT NULL,
  evidence_refs_json TEXT NOT NULL DEFAULT '[]',
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS capex_productivity_ticker_created_idx
  ON capex_productivity_assessment (canonical_ticker, created_at DESC);

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

export function useDatabaseInitialization(): { isReady: boolean; error: Error | undefined } {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    try {
      sqlite.execSync(BOOTSTRAP_SQL);
      setIsReady(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause : new Error(String(cause)));
    }
  }, []);

  return { isReady, error };
}
