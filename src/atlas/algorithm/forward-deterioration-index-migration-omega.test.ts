import {
  evaluateForwardDeterioration,
  evaluateIndexMigration,
  promoteIndexEventToDiscovery,
} from './forward-deterioration-index-migration-omega';

describe('Forward Deterioration Gate Omega', () => {
  const base = {
    ticker: 'TEST',
    comparableGrowthBasis: true,
    evidenceTraceable: true,
    primarySourceConfirmed: true,
  };

  it('marks yellow at >=3 pp comparable guided deceleration', () => {
    const result = evaluateForwardDeterioration({ ...base, currentGrowthPct: 20, guidedGrowthPct: 16 });
    expect(result.severity).toBe('YELLOW');
    expect(result.notify).toBe(true);
  });

  it('marks orange at >=5 pp comparable guided deceleration', () => {
    const result = evaluateForwardDeterioration({ ...base, currentGrowthPct: 20, guidedGrowthPct: 14 });
    expect(result.severity).toBe('ORANGE');
    expect(result.action).toBe('REAUDIT');
  });

  it('marks red at >=8 pp comparable guided deceleration', () => {
    const result = evaluateForwardDeterioration({ ...base, currentGrowthPct: 20, guidedGrowthPct: 11 });
    expect(result.severity).toBe('RED');
    expect(result.action).toBe('REPLACEMENT_REVIEW');
  });

  it('marks red on any explicit guidance cut', () => {
    const result = evaluateForwardDeterioration({ ...base, explicitGuidanceCut: true });
    expect(result.severity).toBe('RED');
  });

  it('marks orange for one materially worse principal KPI', () => {
    const result = evaluateForwardDeterioration({
      ...base,
      kpis: [{ name: 'RPO growth', materiallyWorse: true }],
    });
    expect(result.severity).toBe('ORANGE');
  });

  it('marks red when two fundamental KPIs deteriorate materially together', () => {
    const result = evaluateForwardDeterioration({
      ...base,
      kpis: [
        { name: 'Revenue growth', materiallyWorse: true },
        { name: 'FCF margin', materiallyWorse: true },
      ],
    });
    expect(result.severity).toBe('RED');
  });

  it('suppresses false positives from non-comparable quarterly vs full-year growth', () => {
    const result = evaluateForwardDeterioration({
      ...base,
      ticker: 'DELL_LIKE_CASE',
      currentGrowthPct: 88,
      guidedGrowthPct: 47,
      comparableGrowthBasis: false,
    });
    expect(result.growthDeltaPp).toBeNull();
    expect(result.severity).toBe('NONE');
    expect(result.notify).toBe(false);
  });

  it('does not notify from provisional/unconfirmed evidence alone', () => {
    const result = evaluateForwardDeterioration({
      ...base,
      currentGrowthPct: 20,
      guidedGrowthPct: 10,
      primarySourceConfirmed: false,
    });
    expect(result.severity).toBe('RED');
    expect(result.evidenceState).toBe('PROVISIONAL');
    expect(result.notify).toBe(false);
  });
});

describe('Index Migration Signal and Promotion Discovery Omega', () => {
  it('bounds S&P 500 to S&P 100 promotion at +2 and grants zero quality points', () => {
    const result = evaluateIndexMigration({ ticker: 'DELL', from: 'SP500', to: 'SP100', evidenceTraceable: true });
    expect(result.direction).toBe('PROMOTION');
    expect(result.indexSignalPoints).toBe(2);
    expect(result.businessQualityPoints).toBe(0);
    expect(result.canTriggerBuyAlone).toBe(false);
  });

  it('treats demotion as secondary and never as an automatic sell', () => {
    const result = evaluateIndexMigration({ ticker: 'TTD', from: 'SP500', to: 'SP400', evidenceTraceable: true });
    expect(result.direction).toBe('DEMOTION');
    expect(result.indexSignalPoints).toBe(-2);
    expect(result.canTriggerSellAlone).toBe(false);
  });

  it('feeds promotions into discovery at score zero under T0', () => {
    const candidate = promoteIndexEventToDiscovery({ ticker: 'CORT', from: 'SP600', to: 'SP400', evidenceTraceable: true });
    expect(candidate).not.toBeNull();
    expect(candidate?.startingScore).toBe(0);
    expect(candidate?.mandatoryT0AntiMegacapGate).toBe(true);
    expect(candidate?.mandatoryForwardDeteriorationAudit).toBe(true);
  });
});
