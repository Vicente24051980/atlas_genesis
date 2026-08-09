import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import { fetchEvidence, type EvidenceBundle, type PrimaryEvidence } from '../core/api/evidenceApi';

export default function EvidenceScreen() {
  const router = useRouter();
  const [ticker, setTicker] = useState('');
  const [bundle, setBundle] = useState<EvidenceBundle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyze = async () => {
    const symbol = ticker.trim().toUpperCase();
    if (!/^[A-Z0-9.\-]{1,20}$/.test(symbol)) {
      setError('Introduce un ticker válido.');
      return;
    }
    setTicker(symbol);
    setLoading(true);
    setError('');
    try {
      setBundle(await fetchEvidence(symbol));
    } catch (cause) {
      setBundle(null);
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.topRow}>
        <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable>
        <Text style={styles.engine}>EVIDENCE INGESTION Ω</Text>
      </View>
      <Text style={styles.title}>Evidence Ω</Text>
      <Text style={styles.subtitle}>Ticker → fuentes primarias SEC → clasificación → prioridad de revisión. Ya no introduces hechos, estados ni métricas a mano.</Text>

      <View style={styles.search}>
        <TextInput value={ticker} onChangeText={setTicker} onSubmitEditing={() => void analyze()} autoCapitalize="characters" autoCorrect={false} placeholder="Ticker · ej. MSFT" placeholderTextColor="#5e6b74" style={styles.input} accessibilityLabel="Ticker para Evidence Ω" />
        <Pressable accessibilityRole="button" accessibilityLabel="Analizar Evidence Ω" onPress={() => void analyze()} style={styles.analyze}>{loading ? <ActivityIndicator color="#06110d" /> : <Text style={styles.analyzeText}>INGESTAR</Text>}</Pressable>
      </View>

      {error ? <View style={styles.error}><Text style={styles.errorText}>{error}</Text></View> : null}

      {bundle ? (
        <>
          <View style={styles.summary}>
            <Text style={styles.summaryLabel}>PRIMARY SOURCE</Text>
            <Text style={styles.summaryTitle}>{bundle.companyName || bundle.symbol}</Text>
            <Text style={styles.summaryMeta}>{bundle.symbol} · {bundle.source} · {bundle.status}</Text>
            <View style={styles.stats}>
              <Stat label="FILINGS" value={bundle.primaryEvidence.length} />
              <Stat label="PRIORIDAD ≥70" value={bundle.highPriority?.length || 0} />
              <Stat label="FALSIFICADOR" value={bundle.primaryEvidence.filter((item) => item.falsifierConfirmed).length} />
            </View>
          </View>

          {bundle.status === 'NO_SEC_MATCH' ? <View style={styles.warning}><Text style={styles.warningTitle}>SIN MATCH SEC</Text><Text style={styles.warningText}>No significa que no exista evidencia primaria. Emisores no estadounidenses pueden requerir otro regulador/IR.</Text></View> : null}

          {bundle.primaryEvidence.map((item, index) => <EvidenceCard key={`${item.accessionNumber || item.form}-${index}`} item={item} />)}

          {!bundle.primaryEvidence.length && bundle.status === 'OK' ? <Text style={styles.empty}>No se encontraron filings recientes en los formularios monitorizados.</Text> : null}

          <View style={styles.guardrail}><Text style={styles.guardrailTitle}>REGLA DE EVIDENCIA Ω</Text><Text style={styles.guardrailText}>{bundle.guardrail}</Text></View>
        </>
      ) : !loading ? <View style={styles.emptyState}><Text style={styles.omega}>Ω</Text><Text style={styles.emptyTitle}>Introduce un ticker</Text><Text style={styles.emptyText}>ATLAS consulta la fuente primaria y mantiene separado “filing observado” de “falsificador confirmado”.</Text></View> : null}
    </ScrollView>
  );
}

function EvidenceCard({ item }: { item: PrimaryEvidence }) {
  const high = item.reviewPriority >= 70;
  return (
    <View style={[styles.card, high && styles.highCard]}>
      <View style={styles.cardTop}><Text style={styles.form}>{item.form}</Text><Text style={[styles.priority, high && styles.highPriority]}>{item.reviewPriority} PRIORITY</Text></View>
      <Text style={styles.event}>{item.eventClass.replaceAll('_', ' ')}</Text>
      <Text style={styles.date}>{item.filingDate || 'Sin fecha'}{item.reportDate ? ` · periodo ${item.reportDate}` : ''}</Text>
      {item.items.length ? <Text style={styles.items}>Items: {item.items.join(', ')}</Text> : null}
      <View style={styles.badges}>
        <Badge text={item.sourceQuality} positive />
        <Badge text={item.admissibility.replaceAll('_', ' ')} positive />
        <Badge text={item.thesisImpact.replaceAll('_', ' ')} warning={high} />
      </View>
      <Text style={styles.falsifier}>{item.falsifierConfirmed ? 'FALSIFICADOR CONFIRMADO' : 'FALSIFICADOR: NO CONFIRMADO'}</Text>
      {item.accessionNumber ? <Text style={styles.accession}>Accession: {item.accessionNumber}</Text> : null}
    </View>
  );
}

function Badge({ text, positive = false, warning = false }: { text: string; positive?: boolean; warning?: boolean }) {
  return <View style={[styles.badge, positive && styles.badgePositive, warning && styles.badgeWarning]}><Text style={[styles.badgeText, positive && styles.badgeTextPositive, warning && styles.badgeTextWarning]}>{text}</Text></View>;
}
function Stat({ label, value }: { label: string; value: number }) { return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>; }

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#050708' }, content: { padding: 18, paddingBottom: 50, gap: 11 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 }, back: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#11161a', borderWidth: 1, borderColor: '#283139', alignItems: 'center', justifyContent: 'center' }, backText: { color: '#edf1f3', fontSize: 31, lineHeight: 33, marginTop: -4 }, engine: { color: '#6fcbee', fontSize: 9, fontWeight: '900', letterSpacing: 1.3 },
  title: { color: '#f5f7f8', fontSize: 31, fontWeight: '900' }, subtitle: { color: '#87939d', fontSize: 12, lineHeight: 18 },
  search: { flexDirection: 'row', gap: 8 }, input: { flex: 1, minHeight: 49, borderRadius: 12, backgroundColor: '#0b1014', borderWidth: 1, borderColor: '#29343d', color: '#f2f5f7', paddingHorizontal: 13, fontSize: 15, fontWeight: '800' }, analyze: { minWidth: 104, borderRadius: 12, backgroundColor: '#61d8ad', alignItems: 'center', justifyContent: 'center' }, analyzeText: { color: '#06110d', fontSize: 9, fontWeight: '900' },
  error: { borderRadius: 12, backgroundColor: '#190d11', borderWidth: 1, borderColor: '#5e2937', padding: 11 }, errorText: { color: '#d28b96', fontSize: 10 },
  summary: { borderRadius: 16, borderWidth: 1, borderColor: '#295142', backgroundColor: '#081611', padding: 15 }, summaryLabel: { color: '#45d59e', fontSize: 8.5, fontWeight: '900', letterSpacing: 1.1 }, summaryTitle: { color: '#f2f5f3', fontSize: 22, fontWeight: '900', marginTop: 7 }, summaryMeta: { color: '#738a7e', fontSize: 9, marginTop: 3 }, stats: { flexDirection: 'row', gap: 7, marginTop: 13 }, stat: { flex: 1, minHeight: 55, borderRadius: 10, backgroundColor: '#07100d', borderWidth: 1, borderColor: '#20382e', alignItems: 'center', justifyContent: 'center' }, statValue: { color: '#e8eeea', fontSize: 18, fontWeight: '900' }, statLabel: { color: '#61786c', fontSize: 6.5, fontWeight: '900', marginTop: 2 },
  warning: { borderRadius: 13, borderWidth: 1, borderColor: '#5d4922', backgroundColor: '#171307', padding: 13 }, warningTitle: { color: '#deba61', fontSize: 9, fontWeight: '900' }, warningText: { color: '#9a895b', fontSize: 10, lineHeight: 15, marginTop: 5 },
  card: { borderRadius: 14, borderWidth: 1, borderColor: '#252e34', backgroundColor: '#0c1013', padding: 13 }, highCard: { borderColor: '#574623', backgroundColor: '#131008' }, cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, form: { color: '#f0f3f5', fontSize: 16, fontWeight: '900' }, priority: { color: '#6f8290', fontSize: 8, fontWeight: '900' }, highPriority: { color: '#e0ba60' }, event: { color: '#76caeb', fontSize: 10, fontWeight: '900', marginTop: 6 }, date: { color: '#7c8891', fontSize: 9, marginTop: 4 }, items: { color: '#9ba5ac', fontSize: 9, marginTop: 6 }, badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 9 }, badge: { borderWidth: 1, borderColor: '#33404a', backgroundColor: '#111920', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5 }, badgePositive: { borderColor: '#295440', backgroundColor: '#0a1a13' }, badgeWarning: { borderColor: '#5d4923', backgroundColor: '#191407' }, badgeText: { color: '#81909b', fontSize: 6.5, fontWeight: '900' }, badgeTextPositive: { color: '#67c89d' }, badgeTextWarning: { color: '#d9b45c' }, falsifier: { color: '#8c9ba5', fontSize: 8, fontWeight: '900', marginTop: 9 }, accession: { color: '#56636c', fontSize: 7.5, marginTop: 5 },
  guardrail: { borderRadius: 13, borderWidth: 1, borderColor: '#344625', backgroundColor: '#0e150b', padding: 13 }, guardrailTitle: { color: '#a7bc77', fontSize: 8.5, fontWeight: '900' }, guardrailText: { color: '#81906c', fontSize: 9.5, lineHeight: 14, marginTop: 5 },
  empty: { color: '#73808a', textAlign: 'center', paddingVertical: 25 }, emptyState: { minHeight: 280, alignItems: 'center', justifyContent: 'center' }, omega: { color: '#355268', fontSize: 48, fontWeight: '900' }, emptyTitle: { color: '#dbe1e5', fontSize: 17, fontWeight: '900', marginTop: 8 }, emptyText: { color: '#737f88', fontSize: 10, lineHeight: 15, textAlign: 'center', marginTop: 5, maxWidth: 280 },
});
