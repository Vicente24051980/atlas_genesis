import type { DeltaFalsationResult } from './delta-divergence-falsation-omega';

export const DELTA_INDEPENDENCE_AUTHORITY_OMEGA_VERSION = '2026-09-05-v1.0.0' as const;

export interface DeltaExecutionReceipt {
  evaluatorId: string;
  executionDomainId: string;
  attestationAuthorityId: string;
  verifierPublicKeyFingerprint: string;
  receiptHash: string;
  evidenceSnapshotHash: string;
  issuedAt: string;
}

export interface DeltaAuthorityResult {
  state: 'CANONICAL_MEDIBLE' | 'SHADOW_ONLY' | 'NO_MEDIBLE';
  reasons: string[];
  trustedReceiptCount: number;
  distinctExecutionDomains: number;
  distinctAttestationAuthorities: number;
  coreConfidenceAuthorized: boolean;
}

export function certifyDeltaIndependenceAuthority(
  delta: DeltaFalsationResult,
  expectedEvaluatorIds: readonly string[],
  expectedEvidenceSnapshotHash: string,
  receipts: readonly DeltaExecutionReceipt[],
  trustedVerifierFingerprints: ReadonlySet<string>,
): DeltaAuthorityResult {
  if (delta.state === 'NO_MEDIBLE') {
    return { state:'NO_MEDIBLE', reasons:['Underlying Δ falsation result is NO_MEDIBLE.'], trustedReceiptCount:0, distinctExecutionDomains:0, distinctAttestationAuthorities:0, coreConfidenceAuthorized:false };
  }

  const reasons:string[] = [];
  const expected = new Set(expectedEvaluatorIds);
  const trusted = receipts.filter((r) =>
    expected.has(r.evaluatorId)
    && r.evidenceSnapshotHash === expectedEvidenceSnapshotHash
    && trustedVerifierFingerprints.has(r.verifierPublicKeyFingerprint)
    && r.receiptHash.trim().length > 0
    && Number.isFinite(Date.parse(r.issuedAt))
    && r.executionDomainId.trim().length > 0
    && r.attestationAuthorityId.trim().length > 0
  );

  if (trusted.length !== expected.size) reasons.push('Every evaluator requires one trusted external execution receipt on the same frozen evidence snapshot.');
  if (new Set(trusted.map((r)=>r.evaluatorId)).size !== trusted.length) reasons.push('Duplicate evaluator receipts are not independent evidence.');
  if (new Set(trusted.map((r)=>r.receiptHash)).size !== trusted.length) reasons.push('Receipt hashes must be unique.');

  const domains = new Set(trusted.map((r)=>r.executionDomainId));
  const authorities = new Set(trusted.map((r)=>r.attestationAuthorityId));
  if (domains.size < 2) reasons.push('At least two independently administered execution domains are required.');
  if (authorities.size < 2) reasons.push('At least two independently administered attestation authorities are required.');
  if (trustedVerifierFingerprints.size < 2) reasons.push('A single trusted verifier registry key is a common-mode trust root; at least two trusted verifier fingerprints are required for canonical Δ.');

  const canonical = delta.state === 'MEDIBLE' && reasons.length === 0;
  return {
    state: canonical ? 'CANONICAL_MEDIBLE' : 'SHADOW_ONLY',
    reasons: canonical ? ['Δ lineage passed falsation and is externally anchored by multiple trusted execution/attestation domains.'] : reasons.length ? reasons : ['Underlying Δ is SHADOW_ONLY.'],
    trustedReceiptCount: trusted.length,
    distinctExecutionDomains: domains.size,
    distinctAttestationAuthorities: authorities.size,
    coreConfidenceAuthorized: canonical,
  };
}

export const DELTA_AUTHORITY_RULE_OMEGA_V1 = {
  rule: 'Static lineage metadata is necessary but cannot prove its own authenticity. Canonical Δ requires externally verifiable receipts from multiple trusted administration domains.',
  defaultWithoutReceipts: 'SHADOW_ONLY',
  directAtlasScoreDelta: 0,
  canConclude: false,
} as const;
