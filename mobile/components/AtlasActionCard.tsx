import { StyleSheet, Text, View } from 'react-native';

import type { AtlasAnalysis } from '../core/api/atlasOnlineApi';

export default function AtlasActionCard({ analysis, compact = false }: { analysis: AtlasAnalysis; compact?: boolean }) {
  const tone = actionTone(analysis.action);
  const scores = [
    ['Quality', analysis.scores.businessQuality],
    ['Growth', analysis.scores.growth],
    ['Valuation', analysis.scores.valuation],
    ['Risk', analysis.scores.risk],
    ['CAPEX', analysis.scores.capexProductivity],
  ] as const;

  return (
    <View style={[styles.card, tone === 'positive' ? styles.positiveCard : tone === 'negative' ? styles.negativeCard : tone === 'warning' ? styles.warningCard : styles.neutralCard]}>
      <View style={styles.top}>
        <View style={styles.flex}>
          <Text style={styles.eyebrow}>ATLAS Ω · {analysis.context.toUpperCase()}</Text>
          <Text style={[styles.action, tone === 'positive' ? styles.positiveText : tone === 'negative' ? styles.negativeText : tone === 'warning' ? styles.warningText : styles.neutralText]}>{analysis.actionLabel}</Text>
        </View>
        <View style={styles.scoreHero}>
          <Text style={styles.scoreValue}>{analysis.atlasScore == null ? '—' : Math.round(analysis.atlasScore)}</Text>
          <Text style={styles.scoreLabel}>SCORE Ω</Text>
        </View>
      </View>

      <View style={styles.scoreRow}>
        {scores.map(([label, value]) => (
          <View key={label} style={styles.miniScore}>
            <Text style={styles.miniValue}>{value == null ? '—' : Math.round(value)}</Text>
            <Text style={styles.miniLabel}>{label}</Text>
          </View>
        ))}
      </View>

      {!compact ? (
        <>
          <View style={styles.coverageRow}>
            <Text style={styles.coverage}>Cobertura score {analysis.scoreCoverage.toFixed(0)}%</Text>
            <Text style={styles.coverage}>métricas {analysis.metricCoverage.toFixed(0)}%</Text>
          </View>
          {analysis.reasons.slice(0, 4).map((reason, index) => <Text key={`${index}-${reason}`} style={styles.reason}>• {reason}</Text>)}
          <Text style={styles.guardrail}>Portfolio: ATLAS no emite EXIT por precio. Una salida exige falsificador de tesis confirmado.</Text>
        </>
      ) : null}
    </View>
  );
}

export function actionTone(action: AtlasAnalysis['action']): 'positive' | 'negative' | 'warning' | 'neutral' {
  if (action === 'BUY' || action === 'ADD') return 'positive';
  if (action === 'NO_BUY') return 'negative';
  if (action === 'REVIEW') return 'warning';
  return 'neutral';
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 17, padding: 15, gap: 12 },
  positiveCard: { backgroundColor: '#071a14', borderColor: '#255d48' },
  negativeCard: { backgroundColor: '#1a0c11', borderColor: '#682b3c' },
  warningCard: { backgroundColor: '#1b1509', borderColor: '#665020' },
  neutralCard: { backgroundColor: '#0e151b', borderColor: '#2a3a46' },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  flex: { flex: 1 },
  eyebrow: { color: '#6c8191', fontSize: 8, fontWeight: '900', letterSpacing: 1.1 },
  action: { fontSize: 28, fontWeight: '900', marginTop: 5 },
  positiveText: { color: '#42dfa2' },
  negativeText: { color: '#ff7489' },
  warningText: { color: '#f2c768' },
  neutralText: { color: '#77cfff' },
  scoreHero: { width: 64, height: 64, borderRadius: 32, borderWidth: 1, borderColor: '#304150', alignItems: 'center', justifyContent: 'center', backgroundColor: '#080d11' },
  scoreValue: { color: '#f5f8fa', fontSize: 21, fontWeight: '900' },
  scoreLabel: { color: '#607180', fontSize: 6, fontWeight: '900', marginTop: 1 },
  scoreRow: { flexDirection: 'row', gap: 5 },
  miniScore: { flex: 1, minHeight: 49, backgroundColor: '#080d11', borderRadius: 9, borderWidth: 1, borderColor: '#1d2a33', alignItems: 'center', justifyContent: 'center' },
  miniValue: { color: '#eef3f6', fontWeight: '900', fontSize: 14 },
  miniLabel: { color: '#647583', fontSize: 6.5, fontWeight: '800', marginTop: 2 },
  coverageRow: { flexDirection: 'row', justifyContent: 'space-between' },
  coverage: { color: '#637482', fontSize: 8.5, fontWeight: '800' },
  reason: { color: '#a8b3bd', fontSize: 10.5, lineHeight: 15 },
  guardrail: { color: '#6f7d88', fontSize: 8.5, lineHeight: 13, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#2a343c', paddingTop: 9 },
});
