import {
  assessConversationalIntentMonetizationOmega,
  calculateConversationalIntentScore,
  type ConversationalIntentInput,
} from './conversational-intent-monetization';

const baseInput = (): ConversationalIntentInput => ({
  asOf: '2026-08-20',
  company: 'Example AI',
  adsLiveInAnyMarket: false,
  announcedOnly: true,
  eligibleAudienceProof: 40,
  adInventoryProof: 20,
  advertiserDemandProof: 10,
  monetizationMechanismProof: 40,
  conversionMeasurementProof: 20,
  revenueLinkageProof: 0,
  unitEconomicsProof: 0,
  advertiserRoiProof: 0,
  retentionIntegrityProof: 30,
  intentControlPointDurability: 20,
  trustRegulatoryRisk: 30,
  disintermediationRisk: 50,
  adLoadExperienceRisk: 40,
  adsSeparatedFromAnswers: true,
  assistantResponseIndependencePolicy: true,
  advertiserConversationAccessProhibited: true,
  sensitiveTopicExclusions: true,
  evidenceIds: ['official-policy', 'official-product-docs'],
});

describe('Conversational Intent Monetization Omega v1.0.0', () => {
  it('keeps an announced-only rollout at C0', () => {
    const result = assessConversationalIntentMonetizationOmega(baseInput());
    expect(result.state).toBe('C0_NARRATIVE_OR_ANNOUNCED');
    expect(result.parentTollboothContribution).toBe('T0_ONLY');
    expect(result.buyAuthority).toBe(false);
  });

  it('allows live inventory to support T1 but not revenue proof', () => {
    const result = assessConversationalIntentMonetizationOmega({
      ...baseInput(),
      adsLiveInAnyMarket: true,
      announcedOnly: false,
      eligibleAudienceProof: 80,
      adInventoryProof: 80,
    });
    expect(result.state).toBe('C1_LIVE_INVENTORY');
    expect(result.parentTollboothContribution).toBe('T1_USAGE_SUPPORT');
  });

  it('requires advertiser demand plus monetization and measurement for C2', () => {
    const result = assessConversationalIntentMonetizationOmega({
      ...baseInput(),
      adsLiveInAnyMarket: true,
      announcedOnly: false,
      eligibleAudienceProof: 80,
      adInventoryProof: 80,
      advertiserDemandProof: 70,
      monetizationMechanismProof: 80,
      conversionMeasurementProof: 70,
    });
    expect(result.state).toBe('C2_ADVERTISER_DEMAND');
    expect(result.parentTollboothContribution).toBe('T1_USAGE_SUPPORT');
    expect(result.nextEvidenceRequired).toContain('company_specific_ad_revenue_linkage');
  });

  it('does not call ad infrastructure economic proof without revenue linkage', () => {
    const result = assessConversationalIntentMonetizationOmega({
      ...baseInput(),
      adsLiveInAnyMarket: true,
      announcedOnly: false,
      eligibleAudienceProof: 90,
      adInventoryProof: 90,
      advertiserDemandProof: 90,
      monetizationMechanismProof: 90,
      conversionMeasurementProof: 90,
      revenueLinkageProof: 59,
    });
    expect(result.state).toBe('C2_ADVERTISER_DEMAND');
    expect(result.parentTollboothContribution).not.toBe('T2_REVENUE_SUPPORT');
  });

  it('promotes to C3 only with company-specific revenue linkage', () => {
    const result = assessConversationalIntentMonetizationOmega({
      ...baseInput(),
      adsLiveInAnyMarket: true,
      announcedOnly: false,
      eligibleAudienceProof: 90,
      adInventoryProof: 90,
      advertiserDemandProof: 90,
      monetizationMechanismProof: 90,
      conversionMeasurementProof: 90,
      revenueLinkageProof: 70,
    });
    expect(result.state).toBe('C3_REVENUE_LINKAGE');
    expect(result.parentTollboothContribution).toBe('T2_REVENUE_SUPPORT');
  });

  it('requires unit economics and retention integrity for C4', () => {
    const result = assessConversationalIntentMonetizationOmega({
      ...baseInput(),
      adsLiveInAnyMarket: true,
      announcedOnly: false,
      eligibleAudienceProof: 90,
      adInventoryProof: 90,
      advertiserDemandProof: 90,
      monetizationMechanismProof: 90,
      conversionMeasurementProof: 90,
      revenueLinkageProof: 80,
      unitEconomicsProof: 80,
      retentionIntegrityProof: 70,
    });
    expect(result.state).toBe('C4_UNIT_ECONOMICS_PROOF');
    expect(result.parentTollboothContribution).toBe('T3_MARGIN_FCF_SUPPORT');
  });

  it('requires ROAS, durability, trust architecture and bounded risks for C5', () => {
    const result = assessConversationalIntentMonetizationOmega({
      ...baseInput(),
      adsLiveInAnyMarket: true,
      announcedOnly: false,
      eligibleAudienceProof: 95,
      adInventoryProof: 95,
      advertiserDemandProof: 90,
      monetizationMechanismProof: 95,
      conversionMeasurementProof: 90,
      revenueLinkageProof: 85,
      unitEconomicsProof: 85,
      advertiserRoiProof: 75,
      retentionIntegrityProof: 80,
      intentControlPointDurability: 80,
      trustRegulatoryRisk: 30,
      disintermediationRisk: 40,
      adLoadExperienceRisk: 35,
    });
    expect(result.state).toBe('C5_DURABLE_INTENT_CONTROL_POINT');
    expect(result.parentTollboothContribution).toBe('T4_CONTROL_POINT_SUPPORT');
  });

  it('blocks C5 when trust/regulatory risk is high', () => {
    const result = assessConversationalIntentMonetizationOmega({
      ...baseInput(),
      adsLiveInAnyMarket: true,
      announcedOnly: false,
      eligibleAudienceProof: 95,
      adInventoryProof: 95,
      advertiserDemandProof: 90,
      monetizationMechanismProof: 95,
      conversionMeasurementProof: 90,
      revenueLinkageProof: 85,
      unitEconomicsProof: 85,
      advertiserRoiProof: 75,
      retentionIntegrityProof: 80,
      intentControlPointDurability: 80,
      trustRegulatoryRisk: 75,
      disintermediationRisk: 40,
      adLoadExperienceRisk: 35,
    });
    expect(result.state).toBe('C4_UNIT_ECONOMICS_PROOF');
    expect(result.falsifiers).toContain('trust_or_regulatory_risk_high');
  });

  it('returns insufficient evidence with fewer than two traceable sources', () => {
    const result = assessConversationalIntentMonetizationOmega({
      ...baseInput(),
      evidenceIds: ['one-source'],
    });
    expect(result.state).toBe('INSUFFICIENT_EVIDENCE');
    expect(result.score).toBeNull();
  });

  it('keeps the score bounded between zero and one hundred', () => {
    const score = calculateConversationalIntentScore({
      ...baseInput(),
      adsLiveInAnyMarket: true,
      eligibleAudienceProof: 100,
      adInventoryProof: 100,
      advertiserDemandProof: 100,
      monetizationMechanismProof: 100,
      conversionMeasurementProof: 100,
      revenueLinkageProof: 100,
      unitEconomicsProof: 100,
      advertiserRoiProof: 100,
      retentionIntegrityProof: 100,
      intentControlPointDurability: 100,
      trustRegulatoryRisk: 0,
      disintermediationRisk: 0,
      adLoadExperienceRisk: 0,
    });
    expect(score).toBe(100);
  });
});
