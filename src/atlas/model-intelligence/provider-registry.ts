import type { RouteCandidate } from "./types";

export interface ProviderRegistrySnapshot {
  observedAt: string;
  source: string;
  candidates: readonly RouteCandidate[];
}

export function validateProviderRegistrySnapshot(
  snapshot: ProviderRegistrySnapshot,
): readonly string[] {
  const errors: string[] = [];
  const seen = new Set<string>();

  if (!snapshot.observedAt || Number.isNaN(Date.parse(snapshot.observedAt))) {
    errors.push("observedAt-invalid");
  }
  if (!snapshot.source.trim()) errors.push("source-missing");

  for (const candidate of snapshot.candidates) {
    const key = `${candidate.model.providerId}/${candidate.model.modelId}`;
    if (!candidate.model.providerId.trim()) errors.push("provider-id-missing");
    if (!candidate.model.modelId.trim()) errors.push("model-id-missing");
    if (seen.has(key)) errors.push(`duplicate-route:${key}`);
    seen.add(key);
  }

  return errors;
}

export function freezeProviderRegistrySnapshot(
  snapshot: ProviderRegistrySnapshot,
): ProviderRegistrySnapshot {
  const errors = validateProviderRegistrySnapshot(snapshot);
  if (errors.length > 0) {
    throw new Error(`Invalid provider registry snapshot: ${errors.join(", ")}`);
  }

  return Object.freeze({
    observedAt: snapshot.observedAt,
    source: snapshot.source,
    candidates: Object.freeze([...snapshot.candidates]),
  });
}
