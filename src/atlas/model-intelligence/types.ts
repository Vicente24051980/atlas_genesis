export type TaskClass =
  | "classification"
  | "extraction"
  | "coding"
  | "research"
  | "reasoning"
  | "summarization"
  | "vision"
  | "embedding"
  | "general";

export interface ModelCapability {
  providerId: string;
  modelId: string;
  supportedTasks: readonly TaskClass[];
  contextWindow: number;
  supportsTools: boolean;
  supportsVision: boolean;
  local: boolean;
  freeTier: boolean;
  inputCostPerMillion?: number;
  outputCostPerMillion?: number;
}

export interface ModelTelemetry {
  quality: number;
  reliability: number;
  latencyMsP50: number;
  hallucinationRate?: number;
  taskQuality?: Partial<Record<TaskClass, number>>;
  quotaRemainingRatio?: number;
}

export interface RouteCandidate {
  model: ModelCapability;
  telemetry: ModelTelemetry;
}

export interface RoutingRequirements {
  task: TaskClass;
  needsTools?: boolean;
  needsVision?: boolean;
  minContextWindow?: number;
  localOnly?: boolean;
  freeOnly?: boolean;
  maxLatencyMs?: number;
  excludedProviders?: readonly string[];
  excludedModels?: readonly string[];
}

export interface RoutingPolicyWeights {
  quality: number;
  reliability: number;
  latency: number;
  cost: number;
  taskFit: number;
  quota: number;
}

export interface RankedRouteCandidate extends RouteCandidate {
  score: number;
  reasons: readonly string[];
}

export interface RejectedRouteCandidate extends RouteCandidate {
  rejectionReasons: readonly string[];
}

export interface RoutingDecision {
  ranked: readonly RankedRouteCandidate[];
  rejected: readonly RejectedRouteCandidate[];
}

export interface RoutePlan extends RoutingDecision {
  primary: RankedRouteCandidate | null;
  fallbacks: readonly RankedRouteCandidate[];
}

export type CircuitState = "closed" | "open" | "half-open";

export interface CircuitBreakerSnapshot {
  state: CircuitState;
  consecutiveFailures: number;
  openedAtMs?: number;
}

export interface CircuitBreakerPolicy {
  failureThreshold: number;
  cooldownMs: number;
}

export type CircuitEvent = "success" | "failure";
