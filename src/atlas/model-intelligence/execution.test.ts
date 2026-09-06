import { describe, expect, it } from "vitest";
import { buildRoutePlan } from "./router";
import { executeRoutePlan } from "./execution";
import type { RouteCandidate } from "./types";

const route = (providerId: string, modelId: string, quality: number): RouteCandidate => ({
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
  telemetry: { quality, reliability: 0.9, latencyMsP50: 500, quotaRemainingRatio: 0.8 },
});

describe("route execution", () => {
  it("falls back after transport failure and records circuit state", async () => {
    const plan = buildRoutePlan(
      [route("p1", "first", 0.99), route("p2", "second", 0.8)],
      { task: "reasoning" },
    );
    let tick = 0;
    const result = await executeRoutePlan(
      plan,
      { prompt: "x" },
      {
        async execute(candidate) {
          if (candidate.model.modelId === "first") throw new Error("provider-down");
          return "ok";
        },
      },
      {
        nowMs: () => ++tick * 10,
        circuitPolicy: { failureThreshold: 1, cooldownMs: 1_000 },
      },
    );

    expect(result.response).toBe("ok");
    expect(result.selectedRoute).toBe("p2/second");
    expect(result.attempts).toHaveLength(2);
    expect(result.circuits["p1/first"].state).toBe("open");
  });

  it("can reject a syntactically successful response and continue fallback", async () => {
    const plan = buildRoutePlan(
      [route("p1", "first", 0.99), route("p2", "second", 0.8)],
      { task: "reasoning" },
    );
    const result = await executeRoutePlan(
      plan,
      "request",
      { async execute(candidate) { return candidate.model.modelId; } },
      { accept: (response) => response === "second" },
    );

    expect(result.selectedRoute).toBe("p2/second");
    expect(result.attempts[0].error).toBe("verification-rejected");
  });
});
