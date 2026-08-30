export type NextGenSemisState =
  | 'MIGRATION_CONFIRMED'
  | 'ROTATION_EARLY_MIGRATION'
  | 'TECHNICAL_REBOUND';

export const NEXT_GEN_SEMIS_SENSORS = ['CRDO', 'ALAB', 'BESI', 'COHR', 'LITE'] as const;
export const NEXT_GEN_SEMIS_CONTROLS = ['AVGO', 'MRVL', 'ASML', 'AMAT', 'LRCX', 'KLAC', 'ANET'] as const;

export type NextGenSemisSensor = (typeof NEXT_GEN_SEMIS_SENSORS)[number];
export type NextGenSemisControl = (typeof NEXT_GEN_SEMIS_CONTROLS)[number];

export interface NextGenSemisGateInput {
  /** Verified fundamental strength plus YoY acceleration for the receiver cohort. */
  fundamentalsVerified: boolean;
  /** Cohort relative-strength spread versus SOXX is positive. */
  rsVsSoxxPositive: boolean;
  /** CHILD > PARENT spread is expanding versus the predeclared control cohort. */
  childParentSpreadExpanding: boolean;
  /** Percentage of ALL canonical tickers in the evaluated NG link closing positive. */
  canonicalBreadthPct: number;
  /** Median regular-session return of the complete canonical link. */
  medianReturnPct: number;
  /** Number of consecutive regular closes satisfying the layer persistence condition. */
  consecutiveQualifyingRegularCloses: number;
  /** True only when no key receiver is blocked by Expectations Saturation Ω. */
  freeFromExpectationsSaturation: boolean;
}

export interface NextGenSemisGateResult {
  state: NextGenSemisState;
  confirmed: boolean;
  failedGate:
    | 'FUNDAMENTALS'
    | 'RS_VS_SOXX'
    | 'CHILD_PARENT'
    | 'BREADTH_60'
    | 'MEDIAN_POSITIVE'
    | 'PERSISTENCE_3D'
    | 'EXPECTATIONS_SATURATION'
    | null;
  passedGates: string[];
  reasons: string[];
  constraints: string[];
}

/**
 * NEXT-GEN SEMIS Ω — canonical fail-closed classifier.
 *
 * Pipeline:
 * Fundamentals -> RS vs SOXX -> CHILD > PARENT -> breadth >= 60% ->
 * median > 0 -> persistence >= 3 regular closes -> Expectations Saturation -> state.
 *
 * No partial evidence can return MIGRATION_CONFIRMED. A beta-led rally with no
 * positive RS or no expanding CHILD > PARENT spread is TECHNICAL_REBOUND.
 */
export function evaluateNextGenSemisOmega(input: NextGenSemisGateInput): NextGenSemisGateResult {
  assertFiniteMetric(input.canonicalBreadthPct, 'canonicalBreadthPct');
  assertFiniteMetric(input.medianReturnPct, 'medianReturnPct');
  assertFiniteMetric(input.consecutiveQualifyingRegularCloses, 'consecutiveQualifyingRegularCloses');

  const passedGates: string[] = [];
  const constraints = [
    'FAIL_CLOSED',
    'REGULAR_SESSIONS_ONLY',
    'BREADTH_USES_ALL_CANONICAL_TICKERS_IN_LINK',
    'PRICE_RESPONSE_IS_NOT_FUNDAMENTAL_PROOF',
    'BETA_RALLY_CANNOT_CONFIRM_MIGRATION',
    'CHILD_PARENT_SPREAD_REQUIRED',
  ];

  if (!input.fundamentalsVerified) {
    return fail('TECHNICAL_REBOUND', 'FUNDAMENTALS', passedGates, constraints,
      'Fundamental strength and acceleration are not verified; migration cannot be inferred from price action.');
  }
  passedGates.push('FUNDAMENTALS');

  if (!input.rsVsSoxxPositive) {
    return fail('TECHNICAL_REBOUND', 'RS_VS_SOXX', passedGates, constraints,
      'Relative strength versus SOXX is neutral or negative; classify the move as sector beta/rebound.');
  }
  passedGates.push('RS_VS_SOXX');

  if (!input.childParentSpreadExpanding) {
    return fail('TECHNICAL_REBOUND', 'CHILD_PARENT', passedGates, constraints,
      'CHILD > PARENT spread is not expanding versus the canonical controls.');
  }
  passedGates.push('CHILD_PARENT');

  if (input.canonicalBreadthPct < 60) {
    return fail('ROTATION_EARLY_MIGRATION', 'BREADTH_60', passedGates, constraints,
      'Relative rotation is present but fewer than 60% of all canonical tickers in the link satisfy breadth.');
  }
  passedGates.push('BREADTH_60');

  if (input.medianReturnPct <= 0) {
    return fail('ROTATION_EARLY_MIGRATION', 'MEDIAN_POSITIVE', passedGates, constraints,
      'Breadth threshold is met but the complete-link median return is not positive.');
  }
  passedGates.push('MEDIAN_POSITIVE');

  if (input.consecutiveQualifyingRegularCloses < 3) {
    return fail('ROTATION_EARLY_MIGRATION', 'PERSISTENCE_3D', passedGates, constraints,
      'CHILD > PARENT leadership lacks three consecutive qualifying regular closes.');
  }
  passedGates.push('PERSISTENCE_3D');

  if (!input.freeFromExpectationsSaturation) {
    return fail('ROTATION_EARLY_MIGRATION', 'EXPECTATIONS_SATURATION', passedGates, constraints,
      'A key receiver remains blocked by Expectations Saturation Ω; confirmation is denied.');
  }
  passedGates.push('EXPECTATIONS_SATURATION');

  return {
    state: 'MIGRATION_CONFIRMED',
    confirmed: true,
    failedGate: null,
    passedGates,
    reasons: ['All seven canonical NEXT-GEN SEMIS Ω gates passed simultaneously.'],
    constraints,
  };
}

function fail(
  state: Exclude<NextGenSemisState, 'MIGRATION_CONFIRMED'>,
  failedGate: NonNullable<NextGenSemisGateResult['failedGate']>,
  passedGates: string[],
  constraints: string[],
  reason: string,
): NextGenSemisGateResult {
  return {
    state,
    confirmed: false,
    failedGate,
    passedGates,
    reasons: [reason],
    constraints,
  };
}

function assertFiniteMetric(value: number, field: string): void {
  if (!Number.isFinite(value)) throw new Error(`next_gen_semis_invalid_metric:${field}`);
}
