export type PredictionScenario = {
  id: string;
  label: string;
  probability: number;
  expectedSignals: readonly string[];
};

export type PredictionAttemptRecord = {
  id: string;
  question: string;
  createdAt: string;
  horizonStart: string;
  horizonEnd: string;
  baseRate: string;
  scenarios: readonly PredictionScenario[];
  confidence: 'low' | 'medium' | 'high';
  evidenceIds: readonly string[];
  confirmers: readonly string[];
  falsifiers: readonly string[];
  forbiddenInterpretations: readonly string[];
  reviewCadence: 'daily' | 'weekly' | 'monthly' | 'event_driven';
  postMortemStatus: 'open' | 'scored' | 'expired_unscored';
};

export const PREDICTION_ATTEMPT_OMEGA = {
  id: 'PREDICTION_ATTEMPT_OMEGA_V1',
  name: 'Prediction Attempt Omega v1.0',
  status: 'canonical_higher_layer_forecasting_discipline',
  scope: [
    'CONSPIRACIONES_ATLAS',
    'MONEY_ROTATION_OMEGA',
    'HISTORICAL_DISLOCATION_OMEGA',
    'RISK_OMEGA',
    'CATALYSTS_OMEGA',
  ] as const,
  purpose:
    'Convert frozen hypotheses into auditable scenarios with probabilities, horizons, confirmers, falsifiers and post-mortems.',
  canonicalSequence:
    'SIGNAL -> HYPOTHESIS -> SCENARIOS -> PROBABILITIES -> WATCH_WINDOW -> CONFIRMERS_FALSIFIERS -> SCORECARD',
  requiredFields: [
    'id',
    'question',
    'createdAt',
    'horizonStart',
    'horizonEnd',
    'baseRate',
    'scenarios',
    'confidence',
    'evidenceIds',
    'confirmers',
    'falsifiers',
    'forbiddenInterpretations',
    'reviewCadence',
    'postMortemStatus',
  ] as const,
  allowedUses: [
    'Forecast discrete events, regime shifts, rotations, narrative saturation and thesis falsifiers.',
    'Raise review priority when predefined confirmers activate.',
    'Score forecast calibration after the horizon closes.',
    'Expose uncertainty in mobile-first prediction cards.',
  ] as const,
  forbiddenUses: [
    'No BUY, SELL, REDUCE or portfolio action by itself.',
    'No symbolic interpretation promoted to fact.',
    'No probability changes after the outcome is known.',
    'No hidden failed forecasts.',
    'No certainty language for low-confidence forecasts.',
  ] as const,
} as const;

export function scenarioProbabilitySum(record: PredictionAttemptRecord): number {
  return record.scenarios.reduce((sum, scenario) => sum + scenario.probability, 0);
}

export function validatePredictionAttempt(record: PredictionAttemptRecord): readonly string[] {
  const violations: string[] = [];
  const probabilitySum = scenarioProbabilitySum(record);

  if (!record.question.trim()) violations.push('missing_question');
  if (!record.baseRate.trim()) violations.push('missing_base_rate');
  if (record.scenarios.length < 2) violations.push('requires_at_least_two_scenarios');
  if (probabilitySum !== 100) violations.push(`probability_sum_must_equal_100:${probabilitySum}`);
  if (record.evidenceIds.length === 0) violations.push('requires_traceable_evidence');
  if (record.confirmers.length === 0) violations.push('requires_confirmers');
  if (record.falsifiers.length === 0) violations.push('requires_falsifiers');
  if (record.horizonEnd <= record.horizonStart) violations.push('invalid_horizon');
  if (record.forbiddenInterpretations.length === 0) violations.push('requires_forbidden_interpretations');

  return violations;
}

export const PHOENIX_2026_MONETARY_REGIME_PREDICTION: PredictionAttemptRecord = {
  id: 'PREDICT_PHOENIX_2026_MONETARY_REGIME_STRESS',
  question:
    'Between 2026-08-09 and 2026-12-31, does the 2026 Big Mac currency cover coincide with at least two independent monetary-regime stress signals from the frozen confirmer list?',
  createdAt: '2026-08-09',
  horizonStart: '2026-08-09',
  horizonEnd: '2026-12-31',
  baseRate:
    'Major monetary-regime changes are rare; narrative covers more often mark visibility or stress than exact future events.',
  confidence: 'low',
  evidenceIds: ['PHOENIX_2026_BIG_MAC_OUT_OF_SAMPLE'],
  scenarios: [
    {
      id: 'anniversary_fx_context',
      label: 'Cover remains mostly anniversary plus foreign-exchange context',
      probability: 55,
      expectedSignals: ['No two independent monetary-regime stress confirmers activate before horizon end'],
    },
    {
      id: 'fragmentation_without_phoenix',
      label: 'Fragmentation continues without a Phoenix-near monetary unit',
      probability: 30,
      expectedSignals: ['Gold accumulation, local-currency settlement or payment-rail work continue without retail/transnational unit'],
    },
    {
      id: 'phoenix_structural_signal',
      label: 'A Phoenix-structural signal appears',
      probability: 15,
      expectedSignals: ['Extraordinary SDR action, private SDR usage, BRICS monetary unit or transnational commercial unit'],
    },
  ] as const,
  confirmers: [
    'USD reserve share persistently below 55% due to real reserve selling',
    'RMB clearly rises from around 2% of global reserves',
    'formal BRICS common currency or monetary unit',
    'continued massive central-bank physical gold accumulation',
    'repeated USD down plus UST yields up plus gold up',
    'major energy contracts migrate away from USD settlement',
    'extraordinary SDR allocation',
    'SDR private or retail use',
    'transnational commercial monetary unit',
  ] as const,
  falsifiers: [
    'No material monetary signal follows the cover by horizon end',
    'BRICS remains limited to local-currency settlement and payment rails',
    'No specific monetary event occurs around 2026-08-12',
  ] as const,
  forbiddenInterpretations: [
    'The Economist secretly predicted an exact event',
    'A cover alone is enough evidence for portfolio action',
    'A symbolic Phoenix reading is a verified fact',
  ] as const,
  reviewCadence: 'weekly',
  postMortemStatus: 'open',
};