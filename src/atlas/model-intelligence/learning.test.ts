import { describe, expect, it } from "vitest";
import { learnTelemetry } from "./learning";

describe("model telemetry learning", () => {
  it("learns task quality without mutating the prior snapshot", () => {
    const previous = {
      quality: 0.5,
      reliability: 0.5,
      latencyMsP50: 1_000,
      taskQuality: { reasoning: 0.4 },
      hallucinationRate: 0.2,
    };
    const next = learnTelemetry(
      previous,
      {
        task: "reasoning",
        success: true,
        latencyMs: 500,
        verifiedQuality: 1,
        hallucinated: false,
      },
      { alpha: 0.5 },
    );

    expect(next.taskQuality?.reasoning).toBeCloseTo(0.7);
    expect(next.reliability).toBeCloseTo(0.75);
    expect(next.latencyMsP50).toBeCloseTo(750);
    expect(next.hallucinationRate).toBeCloseTo(0.1);
    expect(previous.taskQuality.reasoning).toBe(0.4);
  });
});
