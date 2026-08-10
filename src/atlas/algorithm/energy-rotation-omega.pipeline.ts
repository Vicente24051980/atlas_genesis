import { ENERGY_ROTATION_OMEGA } from './energy-rotation-omega';

export const ENERGY_ROTATION_OMEGA_PIPELINE_NODE = {
  id: ENERGY_ROTATION_OMEGA.id,
  position: 'after_money_rotation_before_capex_productivity',
  upstream: ['EVIDENCE_INGESTION_OMEGA_V1', 'EVIDENCE_INTEGRITY_OMEGA_V1_1', 'MONEY_ROTATION_OMEGA'],
  downstream: [
    'CAPEX_PRODUCTIVITY_OMEGA',
    'VALUATION_OMEGA',
    'RISK_OMEGA',
    'DECISION_SAFETY_GATE_OMEGA',
    'FINAL_SCORE_OMEGA',
  ],
  mobileFirst: true,
} as const;
