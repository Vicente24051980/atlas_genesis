import { ATLAS_KERNEL_CONTRACT_REGISTRY_OMEGA, ATLAS_KERNEL_CONTRACT_REGISTRY_OMEGA_VERSION } from '../algorithm/atlas-kernel-contract-registry-omega';

export const ATLAS_AUTHORITY_REGISTRY_PROJECTION_OMEGA_VERSION = '2026-09-07-v1.0.0' as const;

export type AuthorityRegistryRecord = {
  id: string;
  status: 'ACTIVE_CANONICAL' | 'ACTIVE_REGISTERED';
  componentClass: string;
  runtimeAuthority: string;
  selectionAuthority: 'NONE' | 'SOLE_MASTER' | 'SUBORDINATE' | 'UNKNOWN_NOT_DECLARED';
  directScoreWeight: number | 'NOT_APPLICABLE' | 'UNKNOWN_NOT_DECLARED';
  activationGate: string | 'UNKNOWN_NOT_DECLARED';
  owner: 'ATLAS_KERNEL_CONTRACT_REGISTRY_OMEGA';
  canWriteCanon: false;
  sourceRegistryVersion: string;
};

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value as UnknownRecord;
}

function contractSelectionAuthority(key: string, contract: UnknownRecord): AuthorityRegistryRecord['selectionAuthority'] {
  if (contract.cleanSelectionAuthority === false || contract.portfolioMembershipAuthority === false) return 'NONE';
  if (key === 'capitalBlindSelection' || key === 'endogenousPortfolio') return 'SUBORDINATE';
  if (typeof contract.runtimeAuthority === 'string' && contract.runtimeAuthority.includes('SUBORDINATE_SELECTION_INPUT')) return 'SUBORDINATE';
  return 'UNKNOWN_NOT_DECLARED';
}

function contractDirectScoreWeight(contract: UnknownRecord): AuthorityRegistryRecord['directScoreWeight'] {
  return typeof contract.directScoreWeight === 'number' ? contract.directScoreWeight : 'UNKNOWN_NOT_DECLARED';
}

const kernel = ATLAS_KERNEL_CONTRACT_REGISTRY_OMEGA;

const architectureRecords: AuthorityRegistryRecord[] = Object.entries(kernel.canonicalArchitecture).map(([slot, raw]) => {
  const component = asRecord(raw);
  const id = String(component.id);
  const isResearch = component.kind === 'RESEARCH_SUBSTRATE';
  return {
    id,
    status: 'ACTIVE_CANONICAL',
    componentClass: String(component.kind),
    runtimeAuthority: isResearch ? 'RESEARCH_SUBSTRATE_ONLY' : `CANONICAL_ARCHITECTURE_${slot}`,
    selectionAuthority: 'NONE',
    directScoreWeight: isResearch ? 0 : 'UNKNOWN_NOT_DECLARED',
    activationGate: 'CANONICAL_ARCHITECTURE_ACTIVE',
    owner: 'ATLAS_KERNEL_CONTRACT_REGISTRY_OMEGA',
    canWriteCanon: false,
    sourceRegistryVersion: ATLAS_KERNEL_CONTRACT_REGISTRY_OMEGA_VERSION,
  };
});

const masterSelectionRecord: AuthorityRegistryRecord = {
  id: kernel.masterSelectionAuthority.id,
  status: 'ACTIVE_CANONICAL',
  componentClass: 'MASTER_SELECTION_AUTHORITY',
  runtimeAuthority: kernel.masterSelectionAuthority.authority,
  selectionAuthority: 'SOLE_MASTER',
  directScoreWeight: 'NOT_APPLICABLE',
  activationGate: kernel.masterSelectionAuthority.pointZero ? 'POINT_ZERO_REQUIRED' : 'UNKNOWN_NOT_DECLARED',
  owner: 'ATLAS_KERNEL_CONTRACT_REGISTRY_OMEGA',
  canWriteCanon: false,
  sourceRegistryVersion: ATLAS_KERNEL_CONTRACT_REGISTRY_OMEGA_VERSION,
};

const contractRecords: AuthorityRegistryRecord[] = Object.entries(kernel.contracts).map(([key, raw]) => {
  const contract = asRecord(raw);
  return {
    id: String(contract.id ?? key),
    status: 'ACTIVE_REGISTERED',
    componentClass: `REGISTERED_CONTRACT:${key}`,
    runtimeAuthority: typeof contract.runtimeAuthority === 'string' ? contract.runtimeAuthority : 'UNKNOWN_NOT_DECLARED',
    selectionAuthority: contractSelectionAuthority(key, contract),
    directScoreWeight: contractDirectScoreWeight(contract),
    activationGate: typeof contract.activationGate === 'string' ? contract.activationGate : 'UNKNOWN_NOT_DECLARED',
    owner: 'ATLAS_KERNEL_CONTRACT_REGISTRY_OMEGA',
    canWriteCanon: false,
    sourceRegistryVersion: ATLAS_KERNEL_CONTRACT_REGISTRY_OMEGA_VERSION,
  };
});

/**
 * Derived projection only. It deliberately does not become a second source of truth.
 * Unknown fields remain UNKNOWN_NOT_DECLARED rather than being silently promoted to zero/false.
 */
export const ATLAS_AUTHORITY_REGISTRY_PROJECTION_OMEGA: readonly AuthorityRegistryRecord[] = [
  ...architectureRecords,
  masterSelectionRecord,
  ...contractRecords,
] as const;

export function getAuthorityRecord(id: string): AuthorityRegistryRecord | undefined {
  return ATLAS_AUTHORITY_REGISTRY_PROJECTION_OMEGA.find((record) => record.id === id);
}

export function automatedComponentCanWriteCanon(id: string): boolean {
  const record = getAuthorityRecord(id);
  return record?.canWriteCanon === true;
}

export function getAuthorityRegistryUnknowns(): AuthorityRegistryRecord[] {
  return ATLAS_AUTHORITY_REGISTRY_PROJECTION_OMEGA.filter((record) =>
    record.runtimeAuthority === 'UNKNOWN_NOT_DECLARED' ||
    record.selectionAuthority === 'UNKNOWN_NOT_DECLARED' ||
    record.directScoreWeight === 'UNKNOWN_NOT_DECLARED' ||
    record.activationGate === 'UNKNOWN_NOT_DECLARED',
  );
}
