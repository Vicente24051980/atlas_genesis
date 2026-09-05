import { describe, expect, it } from 'vitest';
import { evaluateRhoCounterpartyExposure } from './counterparty-exposure-omega';
import {
  aiOrderCashQuality,
  capitalRiskTransferAdvantage,
  evaluateCircularDemand,
  evaluateFinancingQualityGate,
  qualityAdjustedBacklog,
  workingCapitalIntensity,
} from './ai-demand-provenance-omega';

describe('Ρ — Counterparty Exposure Ω', () => {
  it('keeps unlike economic exposure kinds separate and counts unquantified records without fake notional', () => {
    const out = evaluateRhoCounterpartyExposure([
      { position:'NVDA', counterparty:'OpenAI', exposureType:'credit support', kind:'MAXIMUM_FACILITY', amount:105, currency:'USD_bn', asOf:'2026-09-05', sourceId:'filing-a', ordinarySales:false, material:true },
      { position:'AVGO', counterparty:'OpenAI', exposureType:'residual guarantee', kind:'NO_CUANTIFICADA', asOf:'2026-09-05', sourceId:'filing-b', ordinarySales:false, material:true },
      { position:'META', counterparty:'COUNTERPARTY_UNDISCLOSED', exposureType:'residual-value guarantee', kind:'CONTINGENT', amount:70, currency:'USD_bn', asOf:'2026-09-05', sourceId:'filing-c', ordinarySales:false, material:true },
    ]);
    expect(out.state).toBe('MEASURABLE');
    const openai = out.aggregates.find((x) => x.counterparty === 'OpenAI')!;
    expect(openai.positions.sort()).toEqual(['AVGO','NVDA']);
    expect(openai.quantifiedByKind.MAXIMUM_FACILITY?.USD_bn).toBe(105);
    expect(openai.quantifiedByKind.CONTINGENT).toBeUndefined();
    expect(openai.unquantifiedRecords).toBe(1);
    expect(out.canBuySell).toBe(false);
    expect(out.canSetWeight).toBe(false);
  });

  it('rejects fabricated amount on NO_CUANTIFICADA', () => {
    const out = evaluateRhoCounterpartyExposure([
      { position:'X', counterparty:'Y', exposureType:'unknown', kind:'NO_CUANTIFICADA', amount:10, asOf:'2026-09-05', sourceId:'s', ordinarySales:false, material:true },
    ]);
    expect(out.state).toBe('EVIDENCE_PENDING');
  });
});

describe('AI demand provenance hard gates', () => {
  it('does not haircut mere equity ownership absent material economic nexus', () => {
    const out = evaluateCircularDemand({
      materialEconomicNexus:false, evidenceComplete:true,
      haircuts:{ circularCapital:25, vendorFinancing:20, guaranteesBackstops:20, leaseDependency:15, reflexiveRevenueFunding:20 },
    });
    expect(out.odq).toBe(100);
    expect(out.state).toBe('PASS_HIGH_QUALITY');
  });

  it('implements ODQ category boundaries exactly', () => {
    const mk = (haircut:number) => evaluateCircularDemand({ materialEconomicNexus:true, evidenceComplete:true,
      haircuts:{ circularCapital:Math.min(haircut,25), vendorFinancing:Math.min(Math.max(haircut-25,0),20), guaranteesBackstops:Math.min(Math.max(haircut-45,0),20), leaseDependency:Math.min(Math.max(haircut-65,0),15), reflexiveRevenueFunding:Math.min(Math.max(haircut-80,0),20) } });
    expect(mk(10).odq).toBe(90); expect(mk(10).state).toBe('PASS_HIGH_QUALITY');
    expect(mk(25).odq).toBe(75); expect(mk(25).state).toBe('PASS_INDEPENDENT_FINANCED');
    expect(mk(40).odq).toBe(60); expect(mk(40).state).toBe('REVIEW_SUPPORTED');
    expect(mk(60).odq).toBe(40); expect(mk(60).state).toBe('HARD_REVIEW_REFLEXIVE');
    expect(mk(61).odq).toBe(39); expect(mk(61).state).toBe('FAIL_CIRCULARITY_CRITICAL');
  });

  it('fails closed when funding evidence is incomplete', () => {
    const fq = evaluateFinancingQualityGate({
      fundingSourceIdentified:true, buyerIndependentFromVendor:true, repaymentFromExternalBusinessCashFlow:true,
      buyerBalanceSheetSupport:null, debtTermsSustainable:true, leaseDependencyMaterial:false, vendorFundingMaterial:false,
      guaranteesBackstopsMaterial:false, customerConcentrationMaterial:false, terminationPrepaymentProtectionAdequate:true,
      residualRiskRetainedByVendor:false,
    });
    expect(fq.state).toBe('EVIDENCE_PENDING');
    expect(fq.downstreamFundamentalScoreAuthorized).toBe(false);
  });

  it('computes quality-adjusted backlog instead of capitalizing reported backlog at face value', () => {
    const out = qualityAdjustedBacklog({ reportedBacklog:100, odq:65, contractQuality:0.8, fundingProbability:0.9 });
    expect(out.state).toBe('AVAILABLE');
    expect(out.qualityAdjustedBacklog).toBeCloseTo(46.8, 8);
  });

  it('returns NO_CALCULABLE on invalid ratio denominators', () => {
    expect(capitalRiskTransferAdvantage(10,0).state).toBe('NO_CALCULABLE');
    expect(aiOrderCashQuality(10,0).state).toBe('NO_CALCULABLE');
    expect(workingCapitalIntensity(1,2,1,0).state).toBe('NO_CALCULABLE');
  });
});
