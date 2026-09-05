import {
  concentrationMetrics,
  gipci,
  layerPower,
  systemCapture,
  verticalRecurrenceScore,
  type LayerSnapshot,
} from './engine';

const search: LayerSnapshot = {
  id: 'SEARCH_GLOBAL',
  label: 'Global search',
  date: '2026-09-05',
  shares: [
    { actor: 'Alphabet', share: 0.911 },
    { actor: 'Microsoft', share: 0.045 },
    { actor: 'Others', share: 0.044 },
  ],
  lock: 0.8,
  verticalIntegration: 0.9,
  evidenceLevel: 'E3',
  source: 'baseline',
};

describe('Information Power Ω', () => {
  it('detects extreme concentration', () => {
    const m = concentrationMetrics(search.shares);
    expect(m.cr1).toBeCloseTo(0.911, 3);
    expect(m.hhi).toBeGreaterThan(8000);
    expect(m.effectiveActors).toBeLessThan(1.3);
    expect(layerPower(search).valid).toBe(true);
  });

  it('refuses canonical VRS with fewer than three E3+ layers', () => {
    const score = verticalRecurrenceScore('Alphabet', [
      { actor: 'Alphabet', layerId: 'A', share: 0.9, chokepoint: 0.9, evidenceLevel: 'E3' },
      { actor: 'Alphabet', layerId: 'B', share: 0.6, chokepoint: 0.8, evidenceLevel: 'E3' },
    ], { A: 8000, B: 5000 });
    expect(score).toBeNull();
  });

  it('computes system capture as mean share across layers', () => {
    const capture = systemCapture(['Alphabet', 'Microsoft'], [search]);
    expect(capture).toBeCloseTo(0.956, 3);
  });

  it('marks GIPCI invalid when fewer than six layers exist', () => {
    const out = gipci([search]);
    expect(out.valid).toBe(false);
    expect(out.validLayerCount).toBe(1);
  });
});
