import { describe, expect, it } from "vitest";
import { CLOSED_CIRCUIT, effectiveCircuitState, transitionCircuit } from "./circuit-breaker";
import { buildRoutePlan, routeKey } from "./router";
import type { RouteCandidate } from "./types";

const model = (providerId: string, modelId: string, quality = 0.8): RouteCandidate => ({
  model: {
    providerId,
    modelId,
    supportedTasks: ["general", "reasoning"],
    contextWindow: 64_000,
    supportsTools: true,
    supportsVision: false,
    local: false,
    freeTier: true,
  },
  telemetry: {
    quality,
    reliability: 0.95,
    latencyMsP50: 500,
    quotaRemainingRatio: 0.9,
  },
});

describe("ATLAS Model Intelligence Ω circuit breaker", () => {
  it("opens after the configured failure threshold", () => {
    const policy = { failureThreshold: 2, cooldownMs: 1_000 };
    const first = transitionCircuit(CLOSED_CIRCUIT, "failure", 100, policy);
    const second = transitionCircuit(first, "failure", 200, policy);

    expect(first.state).toBe("closed");
    expect(second.state).toBe("open");
    expect(second.openedAtMs).toBe(200);
  });

  it("becomes half-open after cooldown and resets on success", () => {
    const policy = { failureThreshold: 1, cooldownMs: 1_000 };
    const opened = transitionCircuit(CLOSED_CIRCUIT, "failure", 100, policy);
    expect(effectiveCircuitState(opened, 1_099, policy).state).toBe("open");
    expect(effectiveCircuitState(opened, 1_100, policy).state).toBe("half-open");

    const closed = transitionCircuit(opened, "success", 1_100, policy);
    expect(closed).toEqual(CLOSED_CIRCUIT);
  });
});

describe("ATLAS Model Intelligence Ω route planning", () => {
  it("removes open circuits and exposes an ordered fallback chain", () => {
    const primary = model("provider-a", "primary", 0.99);
    const fallback = model("provider-b", "fallback", 0.85);
    const last = model("provider-c", "last", 0.75);
    const policy = { failureThreshold: 1, cooldownMs: 10_000 };
    const opened = transitionCircuit(CLOSED_CIRCUIT, "failure", 1_000, policy);

    const plan = buildRoutePlan(
      [primary, fallback, last],
      { task: "reasoning" },
      {
        nowMs: 2_000,
        circuitPolicy: policy,
        circuits: { [routeKey(primary)]: opened },
      },
    );

    expect(plan.primary?.model.modelId).toBe("fallback");
    expect(plan.fallbacks.map((item) => item.model.modelId)).toEqual(["last"]);
    expect(plan.rejected.some((item) => item.rejectionReasons.includes("circuit-open"))).toBe(true);
  });

  it("returns no primary rather than bypassing hard policy when every route is rejected", () => {
    const paid = model("provider-a", "paid");
    paid.model.freeTier = false;

    const plan = buildRoutePlan([paid], { task: "reasoning", freeOnly: true });
    expect(plan.primary).toBeNull();
    expect(plan.fallbacks).toEqual([]);
    expect(plan.rejected[0].rejectionReasons).toContain("free-only");
  });
});
