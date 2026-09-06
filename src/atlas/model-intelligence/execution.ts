import { transitionCircuit } from "./circuit-breaker";
import { routeKey } from "./router";
import type {
  CircuitBreakerPolicy,
  CircuitBreakerSnapshot,
  RankedRouteCandidate,
  RoutePlan,
} from "./types";

export interface ModelExecutionAdapter<TRequest, TResponse> {
  execute(candidate: RankedRouteCandidate, request: TRequest): Promise<TResponse>;
}

export interface RouteAttempt<TResponse> {
  route: string;
  success: boolean;
  accepted: boolean;
  durationMs: number;
  response?: TResponse;
  error?: string;
}

export interface RouteExecutionResult<TResponse> {
  response: TResponse | null;
  selectedRoute: string | null;
  attempts: readonly RouteAttempt<TResponse>[];
  circuits: Readonly<Record<string, CircuitBreakerSnapshot>>;
}

export interface ExecuteRoutePlanOptions<TResponse> {
  nowMs?: () => number;
  circuitPolicy?: CircuitBreakerPolicy;
  circuits?: Readonly<Record<string, CircuitBreakerSnapshot | undefined>>;
  accept?: (response: TResponse, candidate: RankedRouteCandidate) => boolean | Promise<boolean>;
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export async function executeRoutePlan<TRequest, TResponse>(
  plan: RoutePlan,
  request: TRequest,
  adapter: ModelExecutionAdapter<TRequest, TResponse>,
  options: ExecuteRoutePlanOptions<TResponse> = {},
): Promise<RouteExecutionResult<TResponse>> {
  const now = options.nowMs ?? Date.now;
  const ordered = plan.primary ? [plan.primary, ...plan.fallbacks] : [];
  const attempts: RouteAttempt<TResponse>[] = [];
  const circuits: Record<string, CircuitBreakerSnapshot> = {};

  for (const [key, snapshot] of Object.entries(options.circuits ?? {})) {
    if (snapshot) circuits[key] = snapshot;
  }

  for (const candidate of ordered) {
    const key = routeKey(candidate);
    const startedAt = now();

    try {
      const response = await adapter.execute(candidate, request);
      const accepted = options.accept ? await options.accept(response, candidate) : true;
      const finishedAt = now();
      const durationMs = Math.max(0, finishedAt - startedAt);

      if (!accepted) {
        circuits[key] = transitionCircuit(
          circuits[key],
          "failure",
          finishedAt,
          options.circuitPolicy,
        );
        attempts.push({
          route: key,
          success: true,
          accepted: false,
          durationMs,
          response,
          error: "verification-rejected",
        });
        continue;
      }

      circuits[key] = transitionCircuit(
        circuits[key],
        "success",
        finishedAt,
        options.circuitPolicy,
      );
      attempts.push({ route: key, success: true, accepted: true, durationMs, response });
      return { response, selectedRoute: key, attempts, circuits };
    } catch (error) {
      const finishedAt = now();
      circuits[key] = transitionCircuit(
        circuits[key],
        "failure",
        finishedAt,
        options.circuitPolicy,
      );
      attempts.push({
        route: key,
        success: false,
        accepted: false,
        durationMs: Math.max(0, finishedAt - startedAt),
        error: errorMessage(error),
      });
    }
  }

  return { response: null, selectedRoute: null, attempts, circuits };
}
