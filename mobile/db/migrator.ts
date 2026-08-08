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

CREATE TABLE IF NOT EXISTS company (
  id TEXT PRIMARY KEY NOT NULL,
  canonical_ticker TEXT NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  exchange TEXT,
  mic TEXT,
  isin TEXT,
  country TEXT,
  sector TEXT,
  industry TEXT,
  currency TEXT,
  identifier_status TEXT NOT NULL DEFAULT 'PENDING',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS market_snapshot (
  id TEXT PRIMARY KEY NOT NULL,
  company_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  session TEXT NOT NULL,
  price REAL,
  change_pct REAL,
  market_cap REAL,
  volume REAL,
  payload_json TEXT NOT NULL DEFAULT '{}',
  observed_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_snapshot (
  id TEXT PRIMARY KEY NOT NULL,
  company_id TEXT NOT NULL,
  algorithm_version TEXT NOT NULL,
  status TEXT NOT NULL,
  input_manifest_json TEXT NOT NULL DEFAULT '{}',
  output_manifest_json TEXT NOT NULL DEFAULT '{}',
  explanation_json TEXT NOT NULL DEFAULT '{}',
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS engine_result (
  id TEXT PRIMARY KEY NOT NULL,
  audit_snapshot_id TEXT NOT NULL,
  company_id TEXT NOT NULL,
  engine TEXT NOT NULL,
  score REAL,
  state TEXT NOT NULL,
  algorithm_version TEXT NOT NULL,
  inputs_json TEXT NOT NULL DEFAULT '{}',
  explanation_json TEXT NOT NULL DEFAULT '{}',
  evidence_refs_json TEXT NOT NULL DEFAULT '[]',
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS thesis_snapshot (
  id TEXT PRIMARY KEY NOT NULL,
  company_id TEXT NOT NULL,
  state TEXT NOT NULL,
  conviction REAL,
  freshness REAL,
  thesis_json TEXT NOT NULL DEFAULT '{}',
  evidence_refs_json TEXT NOT NULL DEFAULT '[]',
  algorithm_version TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS signal_evaluation (
  id TEXT PRIMARY KEY NOT NULL,
  company_id TEXT NOT NULL,
  signal_type TEXT NOT NULL,
  state TEXT NOT NULL,
  score REAL,
  horizon TEXT,
  reason_json TEXT NOT NULL DEFAULT '{}',
  evidence_refs_json TEXT NOT NULL DEFAULT '[]',
  price_at_signal REAL,
  outcome_json TEXT,
  created_at INTEGER NOT NULL,
  evaluated_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_market_snapshot_company_time ON market_snapshot(company_id, observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_snapshot_company_time ON audit_snapshot(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_engine_result_audit ON engine_result(audit_snapshot_id);
CREATE INDEX IF NOT EXISTS idx_thesis_snapshot_company_time ON thesis_snapshot(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_signal_evaluation_company_time ON signal_evaluation(company_id, created_at DESC);
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
