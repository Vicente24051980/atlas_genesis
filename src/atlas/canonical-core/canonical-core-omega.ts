export type CanonicalEntityType =
  | 'company'
  | 'etf'
  | 'index'
  | 'country'
  | 'currency'
  | 'commodity'
  | 'person'
  | 'organization'
  | 'technology'
  | 'product'
  | 'macro_indicator'
  | 'supply_chain_node';

export type CanonicalDomain =
  | 'equity'
  | 'macro'
  | 'geopolitics'
  | 'technology'
  | 'commodity'
  | 'rates'
  | 'credit'
  | 'supply_chain'
  | 'market_structure';

export type CanonicalStatus = 'ACTIVE' | 'INACTIVE' | 'DEPRECATED' | 'PENDING_VALIDATION';

export type ProvenanceConfidence = 'HIGH' | 'MEDIUM' | 'LOW' | 'PENDING_PRIMARY_VALIDATION';

export type AtlasProvenance = {
  sourceId: string;
  sourceLabel: string;
  createdAtUtc: string;
  confidence: ProvenanceConfidence;
  evidenceRef?: string;
  reviewAfterUtc?: string;
  notes?: string;
};

export type CanonicalEntity = {
  entityId: string;
  entityType: CanonicalEntityType;
  canonicalName: string;
  aliases: readonly string[];
  domain: CanonicalDomain;
  status: CanonicalStatus;
  metadata?: Readonly<Record<string, string | number | boolean | readonly string[]>>;
  provenance: AtlasProvenance;
};

export type RelationType =
  | 'SUPPLIES'
  | 'CUSTOMER_OF'
  | 'COMPETES_WITH'
  | 'PARTNER_OF'
  | 'OWNS'
  | 'REGULATES'
  | 'DEPENDS_ON'
  | 'USES'
  | 'MANUFACTURES'
  | 'EXPOSED_TO'
  | 'AFFECTS';

export type TimeValidity = {
  validFromUtc: string;
  validToUtc?: string;
};

export type InfluenceWeight = {
  weight: number;
  propagationFactor: number;
  method: 'MANUAL_SEED' | 'PRIMARY_EVIDENCE' | 'BACKTEST_LEARNED' | 'PENDING_VALIDATION';
};

export type CanonicalRelation = {
  relationId: string;
  fromEntityId: string;
  toEntityId: string;
  relationType: RelationType;
  time: TimeValidity;
  influence: InfluenceWeight;
  provenance: AtlasProvenance;
};

export type EventType =
  | 'EARNINGS'
  | 'GUIDANCE'
  | 'RATE_DECISION'
  | 'EXPORT_CONTROL'
  | 'WAR_ESCALATION'
  | 'CYBER_ATTACK'
  | 'ACQUISITION'
  | 'PRODUCT_LAUNCH'
  | 'SUPPLY_DISRUPTION'
  | 'CAPEX_ANNOUNCEMENT'
  | 'MACRO_RELEASE'
  | 'REGULATORY_ACTION';

export type CanonicalEvent = {
  eventId: string;
  eventType: EventType;
  primaryEntityId: string;
  occurredAtUtc: string;
  relatedEntityIds: readonly string[];
  horizon: 'INTRADAY' | 'DAYS' | 'WEEKS' | 'QUARTERS' | 'YEARS';
  magnitude: number;
  normalizedPayload: Readonly<Record<string, unknown>>;
  provenance: AtlasProvenance;
};

export type ConstitutionalValidationResult = {
  valid: boolean;
  errors: readonly string[];
};

export type CascadeImpact = {
  entityId: string;
  accumulatedImpact: number;
  depth: number;
  path: readonly string[];
};

export const ATLAS_CANONICAL_CORE_VERSION = 'ATLAS-HUB-CANONICAL-CORE-OMEGA-v0.1.0';

export function validateEntity(entity: CanonicalEntity): ConstitutionalValidationResult {
  const errors: string[] = [];
  if (!entity.entityId) errors.push('ENTITY_ID_REQUIRED');
  if (!entity.entityType) errors.push('ENTITY_TYPE_REQUIRED');
  if (!entity.canonicalName) errors.push('CANONICAL_NAME_REQUIRED');
  if (!entity.domain) errors.push('DOMAIN_REQUIRED');
  if (!entity.provenance?.sourceId) errors.push('PROVENANCE_SOURCE_REQUIRED');
  if (!entity.provenance?.createdAtUtc) errors.push('PROVENANCE_CREATED_AT_REQUIRED');
  if (!entity.provenance?.confidence) errors.push('PROVENANCE_CONFIDENCE_REQUIRED');
  return { valid: errors.length === 0, errors };
}

export function validateRelation(
  relation: CanonicalRelation,
  entityIds: ReadonlySet<string>,
): ConstitutionalValidationResult {
  const errors: string[] = [];
  if (!relation.relationId) errors.push('RELATION_ID_REQUIRED');
  if (!entityIds.has(relation.fromEntityId)) errors.push(`RELATION_FROM_ENTITY_UNKNOWN:${relation.fromEntityId}`);
  if (!entityIds.has(relation.toEntityId)) errors.push(`RELATION_TO_ENTITY_UNKNOWN:${relation.toEntityId}`);
  if (!relation.relationType) errors.push('RELATION_TYPE_REQUIRED');
  if (!relation.time?.validFromUtc) errors.push('RELATION_VALID_FROM_REQUIRED');
  if (relation.influence.weight < 0 || relation.influence.weight > 1) errors.push('RELATION_WEIGHT_OUT_OF_RANGE');
  if (relation.influence.propagationFactor < 0 || relation.influence.propagationFactor > 1) {
    errors.push('RELATION_PROPAGATION_OUT_OF_RANGE');
  }
  if (!relation.provenance?.sourceId) errors.push('RELATION_PROVENANCE_SOURCE_REQUIRED');
  return { valid: errors.length === 0, errors };
}

export function validateEvent(event: CanonicalEvent, entityIds: ReadonlySet<string>): ConstitutionalValidationResult {
  const errors: string[] = [];
  if (!event.eventId) errors.push('EVENT_ID_REQUIRED');
  if (!entityIds.has(event.primaryEntityId)) errors.push(`EVENT_PRIMARY_ENTITY_UNKNOWN:${event.primaryEntityId}`);
  if (!event.eventType) errors.push('EVENT_TYPE_REQUIRED');
  if (!event.occurredAtUtc) errors.push('EVENT_OCCURRED_AT_REQUIRED');
  if (!event.relatedEntityIds || event.relatedEntityIds.length === 0) errors.push('EVENT_RELATED_ENTITIES_REQUIRED');
  for (const relatedEntityId of event.relatedEntityIds ?? []) {
    if (!entityIds.has(relatedEntityId)) errors.push(`EVENT_RELATED_ENTITY_UNKNOWN:${relatedEntityId}`);
  }
  if (event.magnitude < 0 || event.magnitude > 1) errors.push('EVENT_MAGNITUDE_OUT_OF_RANGE');
  if (!event.provenance?.sourceId) errors.push('EVENT_PROVENANCE_SOURCE_REQUIRED');
  return { valid: errors.length === 0, errors };
}

export function resolveEntityByAlias(
  entities: readonly CanonicalEntity[],
  rawIdentifier: string,
): CanonicalEntity | undefined {
  const needle = rawIdentifier.trim().toLowerCase();
  return entities.find((entity) => {
    if (entity.entityId.toLowerCase() === needle) return true;
    if (entity.canonicalName.toLowerCase() === needle) return true;
    return entity.aliases.some((alias) => alias.toLowerCase() === needle);
  });
}

export function computeCascadeImpacts(
  originEntityId: string,
  relations: readonly CanonicalRelation[],
  magnitude: number,
  options: { maxDepth?: number; minImpact?: number } = {},
): readonly CascadeImpact[] {
  const maxDepth = options.maxDepth ?? 3;
  const minImpact = options.minImpact ?? 0.01;
  const activeRelations = relations.filter((relation) => !relation.time.validToUtc);
  const results = new Map<string, CascadeImpact>();
  const queue: CascadeImpact[] = [{ entityId: originEntityId, accumulatedImpact: magnitude, depth: 0, path: [originEntityId] }];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.depth >= maxDepth) continue;

    for (const relation of activeRelations.filter((r) => r.fromEntityId === current.entityId)) {
      if (current.path.includes(relation.toEntityId)) continue;
      const nextImpact = current.accumulatedImpact * relation.influence.weight * relation.influence.propagationFactor;
      if (nextImpact < minImpact) continue;
      const next: CascadeImpact = {
        entityId: relation.toEntityId,
        accumulatedImpact: Number(nextImpact.toFixed(6)),
        depth: current.depth + 1,
        path: [...current.path, relation.toEntityId],
      };
      const previous = results.get(next.entityId);
      if (!previous || next.accumulatedImpact > previous.accumulatedImpact) results.set(next.entityId, next);
      queue.push(next);
    }
  }

  return [...results.values()].sort((a, b) => b.accumulatedImpact - a.accumulatedImpact || a.depth - b.depth);
}

const CORE_PROVENANCE: AtlasProvenance = {
  sourceId: 'ATLAS_MANUAL_SEED_2026_08_20',
  sourceLabel: 'ATLAS Ω manual canonical seed',
  createdAtUtc: '2026-08-20T00:00:00Z',
  confidence: 'PENDING_PRIMARY_VALIDATION',
  notes: 'Initial canonical core seed. Must be promoted only after primary-source validation.',
};

export const ATLAS_CANONICAL_SEED_ENTITIES: readonly CanonicalEntity[] = [
  { entityId: 'msft-us', entityType: 'company', canonicalName: 'Microsoft', aliases: ['MSFT', 'Microsoft Corporation', 'Azure'], domain: 'equity', status: 'ACTIVE', metadata: { ticker: 'MSFT', country: 'US' }, provenance: CORE_PROVENANCE },
  { entityId: 'nvda-us', entityType: 'company', canonicalName: 'NVIDIA', aliases: ['NVDA', 'NVIDIA Corporation', 'CUDA'], domain: 'equity', status: 'ACTIVE', metadata: { ticker: 'NVDA', country: 'US' }, provenance: CORE_PROVENANCE },
  { entityId: 'tsm-us', entityType: 'company', canonicalName: 'Taiwan Semiconductor Manufacturing', aliases: ['TSM', 'TSMC', 'Taiwan Semiconductor'], domain: 'equity', status: 'ACTIVE', metadata: { ticker: 'TSM', country: 'TW' }, provenance: CORE_PROVENANCE },
  { entityId: 'asml-nl', entityType: 'company', canonicalName: 'ASML Holding', aliases: ['ASML', 'ASML Holding NV', 'EUV'], domain: 'equity', status: 'ACTIVE', metadata: { ticker: 'ASML', country: 'NL' }, provenance: CORE_PROVENANCE },
  { entityId: 'pltr-us', entityType: 'company', canonicalName: 'Palantir Technologies', aliases: ['PLTR', 'Palantir'], domain: 'equity', status: 'ACTIVE', metadata: { ticker: 'PLTR', country: 'US' }, provenance: CORE_PROVENANCE },
  { entityId: 'openai-org', entityType: 'organization', canonicalName: 'OpenAI', aliases: ['OpenAI'], domain: 'technology', status: 'ACTIVE', provenance: CORE_PROVENANCE },
  { entityId: 'hbm-tech', entityType: 'technology', canonicalName: 'High Bandwidth Memory', aliases: ['HBM', 'HBM3E', 'HBM4'], domain: 'technology', status: 'ACTIVE', provenance: CORE_PROVENANCE },
  { entityId: 'euv-tech', entityType: 'technology', canonicalName: 'Extreme Ultraviolet Lithography', aliases: ['EUV', 'High-NA EUV'], domain: 'technology', status: 'ACTIVE', provenance: CORE_PROVENANCE },
  { entityId: 'usa-country', entityType: 'country', canonicalName: 'United States', aliases: ['US', 'USA', 'United States of America'], domain: 'geopolitics', status: 'ACTIVE', provenance: CORE_PROVENANCE },
  { entityId: 'china-country', entityType: 'country', canonicalName: 'China', aliases: ['CN', 'PRC', 'People\'s Republic of China'], domain: 'geopolitics', status: 'ACTIVE', provenance: CORE_PROVENANCE },
  { entityId: 'fed-org', entityType: 'organization', canonicalName: 'Federal Reserve', aliases: ['Fed', 'FOMC', 'Federal Reserve System'], domain: 'rates', status: 'ACTIVE', provenance: CORE_PROVENANCE },
  { entityId: 'brent-commodity', entityType: 'commodity', canonicalName: 'Brent Crude Oil', aliases: ['Brent', 'Oil', 'Crude Oil'], domain: 'commodity', status: 'ACTIVE', provenance: CORE_PROVENANCE },
];

export const ATLAS_CANONICAL_SEED_RELATIONS: readonly CanonicalRelation[] = [
  { relationId: 'rel-msft-openai-partner', fromEntityId: 'msft-us', toEntityId: 'openai-org', relationType: 'PARTNER_OF', time: { validFromUtc: '2023-01-01T00:00:00Z' }, influence: { weight: 0.85, propagationFactor: 0.7, method: 'MANUAL_SEED' }, provenance: CORE_PROVENANCE },
  { relationId: 'rel-msft-nvda-uses', fromEntityId: 'msft-us', toEntityId: 'nvda-us', relationType: 'USES', time: { validFromUtc: '2023-01-01T00:00:00Z' }, influence: { weight: 0.75, propagationFactor: 0.7, method: 'MANUAL_SEED' }, provenance: CORE_PROVENANCE },
  { relationId: 'rel-nvda-tsm-depends', fromEntityId: 'nvda-us', toEntityId: 'tsm-us', relationType: 'DEPENDS_ON', time: { validFromUtc: '2020-01-01T00:00:00Z' }, influence: { weight: 0.9, propagationFactor: 0.75, method: 'MANUAL_SEED' }, provenance: CORE_PROVENANCE },
  { relationId: 'rel-tsm-asml-depends', fromEntityId: 'tsm-us', toEntityId: 'asml-nl', relationType: 'DEPENDS_ON', time: { validFromUtc: '2018-01-01T00:00:00Z' }, influence: { weight: 0.82, propagationFactor: 0.75, method: 'MANUAL_SEED' }, provenance: CORE_PROVENANCE },
  { relationId: 'rel-nvda-hbm-depends', fromEntityId: 'nvda-us', toEntityId: 'hbm-tech', relationType: 'DEPENDS_ON', time: { validFromUtc: '2022-01-01T00:00:00Z' }, influence: { weight: 0.78, propagationFactor: 0.7, method: 'MANUAL_SEED' }, provenance: CORE_PROVENANCE },
  { relationId: 'rel-asml-euv-manufactures', fromEntityId: 'asml-nl', toEntityId: 'euv-tech', relationType: 'MANUFACTURES', time: { validFromUtc: '2010-01-01T00:00:00Z' }, influence: { weight: 0.95, propagationFactor: 0.65, method: 'MANUAL_SEED' }, provenance: CORE_PROVENANCE },
  { relationId: 'rel-fed-rates-affects-msft', fromEntityId: 'fed-org', toEntityId: 'msft-us', relationType: 'AFFECTS', time: { validFromUtc: '2000-01-01T00:00:00Z' }, influence: { weight: 0.35, propagationFactor: 0.6, method: 'MANUAL_SEED' }, provenance: CORE_PROVENANCE },
  { relationId: 'rel-brent-inflation-affects-fed', fromEntityId: 'brent-commodity', toEntityId: 'fed-org', relationType: 'AFFECTS', time: { validFromUtc: '2000-01-01T00:00:00Z' }, influence: { weight: 0.55, propagationFactor: 0.6, method: 'MANUAL_SEED' }, provenance: CORE_PROVENANCE },
];

export function assertCanonicalSeedIntegrity(): true {
  const entityIds = new Set(ATLAS_CANONICAL_SEED_ENTITIES.map((entity) => entity.entityId));
  const entityErrors = ATLAS_CANONICAL_SEED_ENTITIES.flatMap((entity) => validateEntity(entity).errors);
  const relationErrors = ATLAS_CANONICAL_SEED_RELATIONS.flatMap((relation) => validateRelation(relation, entityIds).errors);
  if (entityIds.size !== ATLAS_CANONICAL_SEED_ENTITIES.length) throw new Error('DUPLICATE_CANONICAL_ENTITY_ID');
  if (entityErrors.length || relationErrors.length) {
    throw new Error(`CANONICAL_CORE_SEED_INVALID:${[...entityErrors, ...relationErrors].join(',')}`);
  }
  return true;
}
