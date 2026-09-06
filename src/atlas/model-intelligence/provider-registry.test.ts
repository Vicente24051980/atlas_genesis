import { describe, expect, it } from "vitest";
import { freezeProviderRegistrySnapshot, validateProviderRegistrySnapshot } from "./provider-registry";
import type { RouteCandidate } from "./types";

const route = (providerId: string, modelId: string): RouteCandidate => ({
  model: {
    providerId,
    modelId,
    supportedTasks: ["general"],
    contextWindow: 32_000,
    supportsTools: false,
    supportsVision: false,
    local: false,
    freeTier: true,
  },
  telemetry: { quality: 0.7, reliability: 0.8, latencyMsP50: 900 },
});

describe("provider registry snapshots", () => {
  it("requires timestamped provenance", () => {
    const errors = validateProviderRegistrySnapshot({
      observedAt: "not-a-date",
      source: "",
      candidates: [route("p", "m")],
    });
    expect(errors).toContain("observedAt-invalid");
    expect(errors).toContain("source-missing");
  });

  it("rejects duplicate provider/model routes", () => {
    expect(() => freezeProviderRegistrySnapshot({
      observedAt: "2026-09-06T21:00:00Z",
      source: "fixture",
      candidates: [route("p", "m"), route("p", "m")],
    })).toThrow(/duplicate-route:p\/m/);
  });
});
