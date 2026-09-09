import { evaluateNarrativePriceDivergence } from './narrative-price-divergence-omega';

describe('NARRATIVE PRICE DIVERGENCE Ω',()=>{
  const base={
    evidenceTraceable:true, macroStressScore:70, indexDrawdownFromHighPct:2, indexAtNew20dLow:false,
    breadthDeteriorationScore:35, sectorRelativeStrengthConfirmationScore:65,
    positiveDseSharePct:40, negativeDseSharePct:10, creditSpreadStressScore:30,
    longEndYieldStressScore:45, oilShockScore:65,
  } as const;

  it('confirms resilience only when internals confirm',()=>{
    const r=evaluateNarrativePriceDivergence(base);
    expect(r.state).toBe('RESILIENCE_CONFIRMED');
    expect(r.priceResilience).toBe(true);
    expect(r.internalsConfirm).toBe(true);
    expect(r.capitalDecisionAuthority).toBe('NONE');
  });

  it('classifies fragile resilience when index holds but breadth deteriorates',()=>{
    const r=evaluateNarrativePriceDivergence({...base,breadthDeteriorationScore:70,positiveDseSharePct:10,negativeDseSharePct:35});
    expect(r.state).toBe('FRAGILE_RESILIENCE');
    expect(r.internalsConfirm).toBe(false);
  });

  it('does not call macro stress alone a breakdown',()=>{
    const r=evaluateNarrativePriceDivergence({...base,macroStressScore:95,oilShockScore:95});
    expect(r.breakdownConfirm).toBe(false);
    expect(r.state).toBe('RESILIENCE_CONFIRMED');
  });

  it('requires price plus internals for breakdown confirmation',()=>{
    const r=evaluateNarrativePriceDivergence({...base,indexDrawdownFromHighPct:6,indexAtNew20dLow:true,breadthDeteriorationScore:75,creditSpreadStressScore:65,negativeDseSharePct:45});
    expect(r.state).toBe('BREAKDOWN_CONFIRMING');
    expect(r.breakdownConfirm).toBe(true);
  });

  it('fails closed when evidence is not traceable',()=>{
    const r=evaluateNarrativePriceDivergence({...base,evidenceTraceable:false});
    expect(r.state).toBe('EVIDENCE_PENDING');
  });
});
