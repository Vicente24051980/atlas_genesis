import type { ModelTelemetry, TaskClass } from "./types";

export interface ModelOutcomeObservation {
  task: TaskClass;
  success: boolean;
  latencyMs: number;
  verifiedQuality?: number;
  hallucinated?: boolean;
  quotaRemainingRatio?: number;
}

export interface TelemetryLearningPolicy {
  alpha: number;
}

export const DEFAULT_TELEMETRY_LEARNING_POLICY: TelemetryLearningPolicy = Object.freeze({
  alpha: 0.2,
});

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

function ewma(previous: number, observation: number, alpha: number): number {
  return previous * (1 - alpha) + observation * alpha;
}

export function learnTelemetry(
  previous: ModelTelemetry,
  observation: ModelOutcomeObservation,
  policy: TelemetryLearningPolicy = DEFAULT_TELEMETRY_LEARNING_POLICY,
): ModelTelemetry {
  const alpha = clamp01(policy.alpha);
  const reliability = ewma(clamp01(previous.reliability), observation.success ? 1 : 0, alpha);
  const latencyMsP50 = Math.max(0, ewma(Math.max(0, previous.latencyMsP50), Math.max(0, observation.latencyMs), alpha));
  const taskQuality = { ...(previous.taskQuality ?? {}) };

  let quality = clamp01(previous.quality);
  if (observation.verifiedQuality !== undefined) {
    const verifiedQuality = clamp01(observation.verifiedQuality);
    const oldTaskQuality = taskQuality[observation.task] ?? quality;
    taskQuality[observation.task] = ewma(oldTaskQuality, verifiedQuality, alpha);
    quality = ewma(quality, verifiedQuality, alpha * 0.5);
  }

  let hallucinationRate = previous.hallucinationRate;
  if (observation.hallucinated !== undefined) {
    hallucinationRate = ewma(
      clamp01(previous.hallucinationRate ?? 0),
      observation.hallucinated ? 1 : 0,
      alpha,
    );
  }

  return {
    ...previous,
    quality,
    reliability,
    latencyMsP50,
    taskQuality,
    hallucinationRate,
    quotaRemainingRatio:
      observation.quotaRemainingRatio === undefined
        ? previous.quotaRemainingRatio
        : clamp01(observation.quotaRemainingRatio),
  };
}
