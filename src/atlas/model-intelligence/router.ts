import {
  DEFAULT_CIRCUIT_BREAKER_POLICY,
  isCircuitEligible,
} from "./circuit-breaker";
import { DEFAULT_ROUTING_WEIGHTS, rankCandidates } from "./scoring";
import type {
  CircuitBreakerPolicy,
  CircuitBreakerSnapshot,
  RejectedRouteCandidate,
  RouteCandidate,
  RoutePlan,
  RoutingPolicyWeights,
  RoutingRequirements,
} from "./types";

export function routeKey(candidate: RouteCandidate): string {
  return `${candidate.model.providerId}/${candidate.model.modelId}`;
}

export interface BuildRoutePlanOptions {
  weights?: RoutingPolicyWeights;
  circuits?: Readonly<Record<string, CircuitBreakerSnapshot | undefined>>;
  circuitPolicy?: CircuitBreakerPolicy;
  nowMs?: number;
}

export function buildRoutePlan(
  candidates: readonly RouteCandidate[],
  requirements: RoutingRequirements,
  options: BuildRoutePlanOptions = {},
): RoutePlan {
  const nowMs = options.nowMs ?? Date.now();
  const circuitPolicy = options.circuitPolicy ?? DEFAULT_CIRCUIT_BREAKER_POLICY;
  const eligible: RouteCandidate[] = [];
  const circuitRejected: RejectedRouteCandidate[] = [];

  for (const candidate of candidates) {
    const key = routeKey(candidate);
    if (!isCircuitEligible(options.circuits?.[key], nowMs, circuitPolicy)) {
      circuitRejected.push({ ...candidate, rejectionReasons: ["circuit-open"] });
      continue;
    }
    eligible.push(candidate);
  }

  const decision = rankCandidates(
    eligible,
    requirements,
    options.weights ?? DEFAULT_ROUTING_WEIGHTS,
  );

  const ranked = decision.ranked;
  return {
    ranked,
    rejected: [...decision.rejected, ...circuitRejected],
    primary: ranked[0] ?? null,
    fallbacks: ranked.slice(1),
  };
}
