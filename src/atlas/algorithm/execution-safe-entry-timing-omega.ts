import {
  evaluateReturnAwareEntryTiming,
  type EntryTimingState,
  type ReturnAwareEntryTimingInput,
  type ReturnAwareEntryTimingResult,
} from './entry-timing-return-aware-omega';
import {
  evaluateLiquiditySpreadGate,
  type LiquiditySpreadGateInput,
  type LiquiditySpreadGateResult,
} from './liquidity-spread-gate-omega';

export type ExecutionSafeEntryState = EntryTimingState | 'WAIT_SPREAD';

export interface ExecutionSafeEntryTimingInput {
  timing: ReturnAwareEntryTimingInput;
  liquidity: LiquiditySpreadGateInput;
}

export interface ExecutionSafeEntryTimingResult {
  ticker: string;
  state: ExecutionSafeEntryState;
  timing: ReturnAwareEntryTimingResult;
  liquidity: LiquiditySpreadGateResult;
  executionAllowed: boolean;
  reasons: string[];
}

const EXECUTABLE_TIMING_STATES = new Set<EntryTimingState>([
  'BUY_NOW',
  'BUY_THE_DIP',
  'STARTER_NOW_DISLOCATION',
  'STARTER_CONFIRMATION',
]);

export const EXECUTION_SAFE_ENTRY_TIMING_OMEGA = {
  id: 'EXECUTION_SAFE_ENTRY_TIMING_OMEGA_V1_0',
  name: 'Execution-Safe Entry Timing Ω v1.0',
  status: 'canonical',
  constitutionalRules: [
    'Selection pass and timing pass do not authorize execution until Liquidity / Spread Gate Ω also passes.',
    'A liquidity failure changes only the execution state; it does not rewrite the parent thesis, Economic Proof or Equity Monetization.',
    'When a market order is blocked, a correctly protected limit order may restore execution eligibility without changing the investment thesis.',
  ] as const,
} as const;

export function evaluateExecutionSafeEntryTiming(
  input: ExecutionSafeEntryTimingInput,
): ExecutionSafeEntryTimingResult {
  const timing = evaluateReturnAwareEntryTiming(input.timing);
  const liquidity = evaluateLiquiditySpreadGate(input.liquidity);
  const reasons = [...timing.reasons, ...liquidity.reasons];

  if (!EXECUTABLE_TIMING_STATES.has(timing.state)) {
    return {
      ticker: input.timing.ticker,
      state: timing.state,
      timing,
      liquidity,
      executionAllowed: false,
      reasons,
    };
  }

  if (!liquidity.executionAllowed) {
    reasons.push('Entry Timing Ω permits an entry, but Liquidity / Spread Gate Ω blocks current execution.');
    return {
      ticker: input.timing.ticker,
      state: 'WAIT_SPREAD',
      timing,
      liquidity,
      executionAllowed: false,
      reasons,
    };
  }

  reasons.push('Timing and execution-price protection both pass.');
  return {
    ticker: input.timing.ticker,
    state: timing.state,
    timing,
    liquidity,
    executionAllowed: true,
    reasons,
  };
}
