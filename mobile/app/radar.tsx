import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { CanonicalRadarItem, RADAR_AS_OF, RadarLane, radarByLane } from '../core/radar/canonicalRadar';

const LANES: Array<{ key: RadarLane; label: string; code: string }> = [
  { key: 'MACRO', label: 'Régimen / riesgos transversales', code: 'MACRO' },
  { key: 'IPO_2026_2027', label: 'IPO / pre-IPO 2026–27', code: 'IPO' },
  { key: 'PRIVATE_WATCH', label: 'Private Watch', code: 'PVT' },
  { key: 'EVIDENCE_ONLY', label: 'Solo evidencia', code: 'EVID' },
];

export default function RadarScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.code}>◎</Text>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>ATLAS Ω · R0 DISCOVERY · {RADAR_AS_OF}</Text>
          <Text style={styles.title}>Radar Ω</Text>
        </View>
      </View>

      <View style={styles.guardrail}>
        <Text style={styles.guardrailTitle}>ANALYSIS ≠ EXECUTION</Text>
        <Text style={styles.guardrailText}>
          Este radar ordena investigación. No crea BUY, sizing, sustituciones de cartera ni autoridad de capital. IPO privada/confidencial permanece bloqueada hasta evidencia pública suficiente.
        </Text>
      </View>

      {LANES.map((lane) => {
        const items = radarByLane(lane.key);
        if (!items.length) return null;
        return (
          <View key={lane.key} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionCode}>{lane.code}</Text>
              <Text style={styles.sectionTitle}>{lane.label}</Text>
            </View>
            {items.map((item) => <RadarCard key={item.id} item={item} />)}
          </View>
        );
      })}

      <View style={styles.rule}>
        <Text style={styles.ruleTitle}>REGLAS ACTIVAS</Text>
        <Text style={styles.ruleText}>China = evidencia externa, no universo invertible. 10Y &gt; 5% = hurdle de valoración más alto, no SELL automático. Narrativa de desaceleración IA solo escala cuando aparecen cancelaciones, pedidos/backlog/RPO o FCF que confirmen deterioro.</Text>
      </View>
    </ScrollView>
  );
}

function RadarCard({ item }: { item: CanonicalRadarItem }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardNameWrap}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.functionText}>{item.function}</Text>
        </View>
        <View style={[styles.priorityPill, item.priority === 'MAX' && styles.priorityMax]}>
          <Text style={[styles.priorityText, item.priority === 'MAX' && styles.priorityTextMax]}>{item.priority}</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <Meta label="STATE" value={item.state} />
        <Meta label="LIFECYCLE" value={item.lifecycle} />
        <Meta label="CAPITAL" value={item.investable ? 'ELIGIBLE' : 'NONE'} />
      </View>

      <Text style={styles.blockTitle}>VERIFICADO</Text>
      {item.verified.map((row) => <Text key={row} style={styles.fact}>• {row}</Text>)}

      {item.pending.length ? (
        <>
          <Text style={styles.blockTitle}>PENDIENTE</Text>
          {item.pending.map((row) => <Text key={row} style={styles.pending}>• {row}</Text>)}
        </>
      ) : null}

      <View style={styles.nextGate}>
        <Text style={styles.nextGateLabel}>NEXT GATE</Text>
        <Text style={styles.nextGateText}>{item.nextGate}</Text>
      </View>
    </View>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaCell}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text numberOfLines={2} style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#050708' },
  content: { paddingHorizontal: 12, paddingTop: 14, paddingBottom: 36, gap: 14 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: '#1b272c', paddingBottom: 12 },
  code: { width: 48, height: 48, textAlign: 'center', textAlignVertical: 'center', borderWidth: 1, borderColor: '#315b75', backgroundColor: '#071019', color: '#8cccf3', fontSize: 24, fontWeight: '900' },
  headerText: { flex: 1 },
  eyebrow: { color: '#5e7379', fontFamily: 'monospace', fontSize: 8, fontWeight: '900', letterSpacing: 1.1 },
  title: { color: '#eff5f3', fontFamily: 'monospace', fontSize: 24, fontWeight: '900', marginTop: 3 },
  guardrail: { borderWidth: 1, borderColor: '#51471f', backgroundColor: '#141106', padding: 12 },
  guardrailTitle: { color: '#f0d76b', fontFamily: 'monospace', fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  guardrailText: { color: '#a99f75', fontSize: 11, lineHeight: 17, marginTop: 5 },
  section: { gap: 9 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 4 },
  sectionCode: { color: '#4fe8b6', fontFamily: 'monospace', fontSize: 8, fontWeight: '900', borderWidth: 1, borderColor: '#244a3f', paddingHorizontal: 7, paddingVertical: 4 },
  sectionTitle: { color: '#a9bab6', fontFamily: 'monospace', fontSize: 11, fontWeight: '900' },
  card: { borderWidth: 1, borderColor: '#1b2b31', backgroundColor: '#070b0d', padding: 12, gap: 8 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  cardNameWrap: { flex: 1 },
  name: { color: '#edf4f2', fontFamily: 'monospace', fontSize: 15, fontWeight: '900' },
  functionText: { color: '#718087', fontSize: 10, lineHeight: 15, marginTop: 3 },
  priorityPill: { borderWidth: 1, borderColor: '#315b75', backgroundColor: '#071019', paddingHorizontal: 7, paddingVertical: 4 },
  priorityMax: { borderColor: '#7b5a33', backgroundColor: '#171005' },
  priorityText: { color: '#8cccf3', fontFamily: 'monospace', fontSize: 8, fontWeight: '900' },
  priorityTextMax: { color: '#f0c477' },
  metaRow: { flexDirection: 'row', gap: 6 },
  metaCell: { flex: 1, minHeight: 48, borderWidth: 1, borderColor: '#142126', backgroundColor: '#06090a', padding: 7 },
  metaLabel: { color: '#4f6066', fontFamily: 'monospace', fontSize: 7, fontWeight: '900' },
  metaValue: { color: '#9eafaa', fontFamily: 'monospace', fontSize: 8, lineHeight: 12, marginTop: 3 },
  blockTitle: { color: '#5f716f', fontFamily: 'monospace', fontSize: 7, fontWeight: '900', letterSpacing: 0.7, marginTop: 2 },
  fact: { color: '#9db4ad', fontSize: 10, lineHeight: 15 },
  pending: { color: '#9b9381', fontSize: 10, lineHeight: 15 },
  nextGate: { borderTopWidth: 1, borderTopColor: '#16252a', paddingTop: 8, marginTop: 2 },
  nextGateLabel: { color: '#4fe8b6', fontFamily: 'monospace', fontSize: 7, fontWeight: '900', letterSpacing: 0.8 },
  nextGateText: { color: '#81918d', fontSize: 10, lineHeight: 15, marginTop: 4 },
  rule: { borderTopWidth: 1, borderTopColor: '#1a2428', paddingTop: 12 },
  ruleTitle: { color: '#4fe8b6', fontFamily: 'monospace', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  ruleText: { color: '#718087', fontSize: 10, lineHeight: 16, marginTop: 5 },
});
