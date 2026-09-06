import type {
  CircuitBreakerPolicy,
  CircuitBreakerSnapshot,
  CircuitEvent,
} from "./types";

export const DEFAULT_CIRCUIT_BREAKER_POLICY: CircuitBreakerPolicy = Object.freeze({
  failureThreshold: 3,
  cooldownMs: 60_000,
});

export const CLOSED_CIRCUIT: CircuitBreakerSnapshot = Object.freeze({
  state: "closed",
  consecutiveFailures: 0,
});

function normalizePolicy(policy: CircuitBreakerPolicy): CircuitBreakerPolicy {
  return {
    failureThreshold: Math.max(1, Math.floor(policy.failureThreshold)),
    cooldownMs: Math.max(0, Math.floor(policy.cooldownMs)),
  };
}

export function effectiveCircuitState(
  snapshot: CircuitBreakerSnapshot | undefined,
  nowMs: number,
  policy: CircuitBreakerPolicy = DEFAULT_CIRCUIT_BREAKER_POLICY,
): CircuitBreakerSnapshot {
  const current = snapshot ?? CLOSED_CIRCUIT;
  const normalized = normalizePolicy(policy);

  if (
    current.state === "open" &&
    current.openedAtMs !== undefined &&
    nowMs - current.openedAtMs >= normalized.cooldownMs
  ) {
    return { ...current, state: "half-open" };
  }

  return current;
}

export function isCircuitEligible(
  snapshot: CircuitBreakerSnapshot | undefined,
  nowMs: number,
  policy: CircuitBreakerPolicy = DEFAULT_CIRCUIT_BREAKER_POLICY,
): boolean {
  return effectiveCircuitState(snapshot, nowMs, policy).state !== "open";
}

export function transitionCircuit(
  snapshot: CircuitBreakerSnapshot | undefined,
  event: CircuitEvent,
  nowMs: number,
  policy: CircuitBreakerPolicy = DEFAULT_CIRCUIT_BREAKER_POLICY,
): CircuitBreakerSnapshot {
  const current = effectiveCircuitState(snapshot, nowMs, policy);
  const normalized = normalizePolicy(policy);

  if (event === "success") return CLOSED_CIRCUIT;

  if (current.state === "half-open") {
    return {
      state: "open",
      consecutiveFailures: Math.max(normalized.failureThreshold, current.consecutiveFailures + 1),
      openedAtMs: nowMs,
    };
  }

  if (current.state === "open") return current;

  const consecutiveFailures = current.consecutiveFailures + 1;
  if (consecutiveFailures >= normalized.failureThreshold) {
    return { state: "open", consecutiveFailures, openedAtMs: nowMs };
  }

  return { state: "closed", consecutiveFailures };
}
