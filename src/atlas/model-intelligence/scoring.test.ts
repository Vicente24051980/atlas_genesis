import { describe, expect, it } from "vitest";
import { rankCandidates } from "./scoring";
import type { RouteCandidate, RoutingPolicyWeights } from "./types";

const candidate = (
  providerId: string,
  modelId: string,
  overrides: Partial<RouteCandidate> = {},
): RouteCandidate => ({
  model: {
    providerId,
    modelId,
    supportedTasks: ["general", "reasoning", "coding"],
    contextWindow: 128_000,
    supportsTools: true,
    supportsVision: false,
    local: false,
    freeTier: true,
  },
  telemetry: {
    quality: 0.8,
    reliability: 0.9,
    latencyMsP50: 1_000,
    quotaRemainingRatio: 0.8,
  },
  ...overrides,
});

describe("ATLAS Model Intelligence Ω scoring", () => {
  it("enforces hard capability gates before scoring", () => {
    const noTools = candidate("a", "no-tools", {
      model: { ...candidate("a", "x").model, modelId: "no-tools", supportsTools: false },
    });
    const withTools = candidate("b", "tools");

    const result = rankCandidates([noTools, withTools], {
      task: "reasoning",
      needsTools: true,
    });

    expect(result.ranked.map((item) => item.model.modelId)).toEqual(["tools"]);
    expect(result.rejected[0].rejectionReasons).toContain("tools-required");
  });

  it("enforces free-only policy as a hard gate", () => {
    const paid = candidate("a", "paid", {
      model: { ...candidate("a", "x").model, modelId: "paid", freeTier: false },
    });

    const result = rankCandidates([paid, candidate("b", "free")], {
      task: "reasoning",
      freeOnly: true,
    });

    expect(result.ranked).toHaveLength(1);
    expect(result.ranked[0].model.modelId).toBe("free");
    expect(result.rejected[0].rejectionReasons).toContain("free-only");
  });

  it("uses deterministic provider/model ordering to break exact ties", () => {
    const result = rankCandidates(
      [candidate("zeta", "same"), candidate("alpha", "same")],
      { task: "reasoning" },
    );

    expect(result.ranked.map((item) => item.model.providerId)).toEqual(["alpha", "zeta"]);
  });

  it("can prioritize latency without changing the hard gates", () => {
    const weights: RoutingPolicyWeights = {
      quality: 0,
      reliability: 0,
      latency: 1,
      cost: 0,
      taskFit: 0,
      quota: 0,
    };
    const slow = candidate("a", "slow", {
      telemetry: { ...candidate("a", "x").telemetry, latencyMsP50: 8_000 },
    });
    const fast = candidate("b", "fast", {
      telemetry: { ...candidate("b", "x").telemetry, latencyMsP50: 200 },
    });

    const result = rankCandidates([slow, fast], { task: "reasoning" }, weights);
    expect(result.ranked[0].model.modelId).toBe("fast");
  });

  it("uses task-specific evidence when available", () => {
    const generic = candidate("a", "generic", {
      telemetry: {
        ...candidate("a", "x").telemetry,
        quality: 0.95,
        taskQuality: { coding: 0.35 },
      },
    });
    const coding = candidate("b", "coding", {
      telemetry: {
        ...candidate("b", "x").telemetry,
        quality: 0.8,
        taskQuality: { coding: 0.99 },
      },
    });
    const weights: RoutingPolicyWeights = {
      quality: 0,
      reliability: 0,
      latency: 0,
      cost: 0,
      taskFit: 1,
      quota: 0,
    };

    const result = rankCandidates([generic, coding], { task: "coding" }, weights);
    expect(result.ranked[0].model.modelId).toBe("coding");
  });
});
