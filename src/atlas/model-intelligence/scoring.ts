import type {
  ModelTelemetry,
  RouteCandidate,
  RoutingDecision,
  RoutingPolicyWeights,
  RoutingRequirements,
} from "./types";

export const DEFAULT_ROUTING_WEIGHTS: RoutingPolicyWeights = Object.freeze({
  quality: 0.28,
  reliability: 0.24,
  latency: 0.12,
  cost: 0.12,
  taskFit: 0.18,
  quota: 0.06,
});

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

function modelKey(candidate: RouteCandidate): string {
  return `${candidate.model.providerId}/${candidate.model.modelId}`;
}

function supportsTask(candidate: RouteCandidate, task: RoutingRequirements["task"]): boolean {
  return (
    candidate.model.supportedTasks.includes(task) ||
    candidate.model.supportedTasks.includes("general")
  );
}

function rejectionReasons(
  candidate: RouteCandidate,
  requirements: RoutingRequirements,
): string[] {
  const reasons: string[] = [];
  const { model, telemetry } = candidate;

  if (!supportsTask(candidate, requirements.task)) reasons.push("task-not-supported");
  if (requirements.needsTools && !model.supportsTools) reasons.push("tools-required");
  if (requirements.needsVision && !model.supportsVision) reasons.push("vision-required");
  if ((requirements.minContextWindow ?? 0) > model.contextWindow) reasons.push("context-too-small");
  if (requirements.localOnly && !model.local) reasons.push("local-only");
  if (requirements.freeOnly && !model.freeTier) reasons.push("free-only");
  if (
    requirements.maxLatencyMs !== undefined &&
    telemetry.latencyMsP50 > requirements.maxLatencyMs
  ) {
    reasons.push("latency-limit");
  }
  if (requirements.excludedProviders?.includes(model.providerId)) reasons.push("provider-excluded");
  if (requirements.excludedModels?.includes(model.modelId)) reasons.push("model-excluded");

  return reasons;
}

function latencyScore(latencyMsP50: number): number {
  const latency = Math.max(0, latencyMsP50);
  return 1 / (1 + latency / 2_000);
}

function costScore(candidate: RouteCandidate): number {
  if (candidate.model.freeTier) return 1;
  const input = Math.max(0, candidate.model.inputCostPerMillion ?? 10);
  const output = Math.max(0, candidate.model.outputCostPerMillion ?? 30);
  const blended = input * 0.4 + output * 0.6;
  return 1 / (1 + blended / 20);
}

function taskFitScore(telemetry: ModelTelemetry, task: RoutingRequirements["task"]): number {
  return clamp01(telemetry.taskQuality?.[task] ?? telemetry.quality);
}

function normalizedWeights(weights: RoutingPolicyWeights): RoutingPolicyWeights {
  const entries = Object.entries(weights) as [keyof RoutingPolicyWeights, number][];
  const total = entries.reduce((sum, [, value]) => sum + Math.max(0, value), 0);
  if (total <= 0) return DEFAULT_ROUTING_WEIGHTS;

  return Object.fromEntries(
    entries.map(([key, value]) => [key, Math.max(0, value) / total]),
  ) as unknown as RoutingPolicyWeights;
}

export function scoreCandidate(
  candidate: RouteCandidate,
  requirements: RoutingRequirements,
  weights: RoutingPolicyWeights = DEFAULT_ROUTING_WEIGHTS,
): { score: number; reasons: string[] } {
  const w = normalizedWeights(weights);
  const quality = clamp01(candidate.telemetry.quality);
  const reliability = clamp01(candidate.telemetry.reliability);
  const latency = latencyScore(candidate.telemetry.latencyMsP50);
  const cost = costScore(candidate);
  const taskFit = taskFitScore(candidate.telemetry, requirements.task);
  const quota = clamp01(candidate.telemetry.quotaRemainingRatio ?? 0.5);
  const hallucinationPenalty = clamp01(candidate.telemetry.hallucinationRate ?? 0);

  const raw =
    quality * w.quality +
    reliability * w.reliability +
    latency * w.latency +
    cost * w.cost +
    taskFit * w.taskFit +
    quota * w.quota;

  const score = clamp01(raw * (1 - hallucinationPenalty * 0.35));
  const reasons = [
    `quality=${quality.toFixed(3)}`,
    `reliability=${reliability.toFixed(3)}`,
    `taskFit=${taskFit.toFixed(3)}`,
    `latency=${latency.toFixed(3)}`,
    `cost=${cost.toFixed(3)}`,
    `quota=${quota.toFixed(3)}`,
  ];

  if (hallucinationPenalty > 0) reasons.push(`hallucinationPenalty=${hallucinationPenalty.toFixed(3)}`);
  return { score, reasons };
}

export function rankCandidates(
  candidates: readonly RouteCandidate[],
  requirements: RoutingRequirements,
  weights: RoutingPolicyWeights = DEFAULT_ROUTING_WEIGHTS,
): RoutingDecision {
  const accepted: Array<RoutingDecision["ranked"][number]> = [];
  const denied: Array<RoutingDecision["rejected"][number]> = [];

  for (const candidate of candidates) {
    const reasons = rejectionReasons(candidate, requirements);
    if (reasons.length > 0) {
      denied.push({ ...candidate, rejectionReasons: reasons });
      continue;
    }

    const scored = scoreCandidate(candidate, requirements, weights);
    accepted.push({ ...candidate, score: scored.score, reasons: scored.reasons });
  }

  accepted.sort((a, b) => {
    const byScore = b.score - a.score;
    if (Math.abs(byScore) > Number.EPSILON) return byScore;
    return modelKey(a).localeCompare(modelKey(b));
  });

  denied.sort((a, b) => modelKey(a).localeCompare(modelKey(b)));
  return { ranked: accepted, rejected: denied };
}
