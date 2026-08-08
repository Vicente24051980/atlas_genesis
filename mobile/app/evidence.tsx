import { useCallback, useMemo, useState } from 'react';
import { FlatList, Linking, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { EvidenceRepository } from '../db/repositories/EvidenceRepository';
import type { EvidenceRecord } from '../db/repositories/EvidenceRepository';
import { runAutomaticSync } from '../services/autoSync';

export default function EvidenceScreen() {
  const [items, setItems] = useState<EvidenceRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setItems(await EvidenceRepository.getAll());
    setRefreshing(false);
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const syncNow = async () => {
    setRefreshing(true);
    setMessage('');
    try {
      const result = await runAutomaticSync('USER_REFRESH');
      setMessage(`${result.secFilings} filings SEC descubiertos/actualizados.`);
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : String(cause));
    } finally {
      await load();
    }
  };

  const counts = useMemo(() => ({
    primary: items.filter((item) => item.sourceType === 'SEC_EDGAR_PRIMARY').length,
    verified: items.filter((item) => item.validationState === 'VERIFIED_FACT').length,
    pending: items.filter((item) => item.validationState !== 'VERIFIED_FACT').length,
  }), [items]);

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={items}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { void syncNow(); }} tintColor="#71b7ff" />}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>Evidence Ω · Primary Inbox</Text>
          <Text style={styles.subtitle}>ATLAS busca automáticamente nuevas fuentes primarias SEC para cartera y watchlist. Descubrir un filing no convierte sus afirmaciones en hechos verificados.</Text>
          <View style={styles.metrics}>
            <Metric label="SEC" value={counts.primary} />
            <Metric label="Pendiente" value={counts.pending} />
            <Metric label="Verified" value={counts.verified} />
          </View>
          <View style={styles.ruleCard}>
            <Text style={styles.ruleTitle}>EVIDENCE > NARRATIVE</Text>
            <Text style={styles.ruleText}>Estado automático: PRIMARY_SOURCE_DISCOVERED. La promoción a VERIFIED_FACT exige extracción, hash/autenticación y validación por CORE-00; la app no la concede por un simple fetch.</Text>
            <Pressable onPress={() => { void syncNow(); }} style={styles.secondary}><Text style={styles.secondaryText}>Buscar fuentes primarias ahora</Text></Pressable>
            {message ? <Text style={styles.message}>{message}</Text> : null}
          </View>
          <Text style={styles.count}>{items.length} registros de fuente/evidencia</Text>
        </View>
      }
      ListEmptyComponent={<Text style={styles.empty}>No hay fuentes primarias descubiertas todavía. La sincronización automática consultará SEC EDGAR.</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.subject}>{item.subjectId}</Text>
            <Text style={[styles.state, item.validationState === 'VERIFIED_FACT' ? styles.verified : styles.pending]}>{item.validationState}</Text>
          </View>
          <Text style={styles.summary}>{item.summary}</Text>
          <Text style={styles.meta}>{item.sourceType} · {item.epistemicClass}</Text>
          {item.sourceRef.startsWith('http') ? (
            <Pressable onPress={() => { void Linking.openURL(item.sourceRef); }} style={styles.sourceButton}>
              <Text style={styles.sourceButtonText}>Abrir fuente primaria</Text>
            </Pressable>
          ) : <Text style={styles.ref}>{item.sourceRef}</Text>}
          {item.contentHash ? <Text style={styles.hash}>Hash: {item.contentHash}</Text> : <Text style={styles.hash}>Hash: pendiente de CORE-00</Text>}
          <Text style={styles.time}>{item.createdAt.toLocaleString('es-ES')}</Text>
        </View>
      )}
    />
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <View style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f14' },
  content: { padding: 16, gap: 10 },
  header: { gap: 8, marginBottom: 12 },
  title: { color: '#fff', fontSize: 27, fontWeight: '900' },
  subtitle: { color: '#94a3b8', lineHeight: 20 },
  metrics: { flexDirection: 'row', gap: 8 },
  metric: { flex: 1, padding: 10, borderRadius: 11, backgroundColor: '#141a22', borderWidth: 1, borderColor: '#202b38' },
  metricValue: { color: '#71b7ff', fontSize: 20, fontWeight: '900' },
  metricLabel: { color: '#64748b', fontSize: 10, marginTop: 3 },
  ruleCard: { backgroundColor: '#111923', borderRadius: 14, padding: 13, gap: 8, borderWidth: 1, borderColor: '#29405b' },
  ruleTitle: { color: '#71b7ff', fontSize: 12, fontWeight: '900' },
  ruleText: { color: '#9da9b7', fontSize: 12, lineHeight: 18 },
  secondary: { borderWidth: 1, borderColor: '#29405b', borderRadius: 9, padding: 10, alignItems: 'center' },
  secondaryText: { color: '#71b7ff', fontWeight: '800' },
  message: { color: '#cbd5e1', fontSize: 12 },
  count: { color: '#71b7ff', fontWeight: '800' },
  empty: { color: '#8ea2b8', textAlign: 'center', padding: 40, lineHeight: 20 },
  card: { backgroundColor: '#141a22', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#202b38' },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, alignItems: 'center' },
  subject: { color: '#71b7ff', fontWeight: '900', fontSize: 19, flex: 1 },
  state: { fontWeight: '800', fontSize: 9, maxWidth: '58%', paddingHorizontal: 7, paddingVertical: 4, borderRadius: 999, overflow: 'hidden' },
  verified: { color: '#86efac', backgroundColor: '#123922' },
  pending: { color: '#fcd34d', backgroundColor: '#3a3112' },
  summary: { color: '#fff', marginTop: 9, lineHeight: 20 },
  meta: { color: '#9da9b7', marginTop: 8, fontSize: 11 },
  ref: { color: '#8ea2b8', marginTop: 5, fontSize: 11 },
  sourceButton: { alignSelf: 'flex-start', marginTop: 10, borderWidth: 1, borderColor: '#29405b', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7 },
  sourceButtonText: { color: '#71b7ff', fontWeight: '800', fontSize: 12 },
  hash: { color: '#64748b', marginTop: 7, fontSize: 10 },
  time: { color: '#64748b', fontSize: 10, marginTop: 4 },
});
