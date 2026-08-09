import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AtlasOnlineApi, type AtlasEngine } from '../core/api/atlasOnlineApi';

const DETAIL_ENGINE: Record<string, string> = {
  core: 'decision',
  quality: 'quality',
  growth: 'growth',
  capex: 'capex',
  valuation: 'valuation',
  risk: 'risk',
};

export default function EnginesScreen() {
  const router = useRouter();
  const [engines, setEngines] = useState<AtlasEngine[]>([]);
  const [algorithm, setAlgorithm] = useState('');
  const [ticker, setTicker] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    void AtlasOnlineApi.atlasEngines()
      .then((payload) => { if (active) { setEngines(payload.items); setAlgorithm(payload.algorithm); } })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : String(cause)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const symbol = ticker.trim().toUpperCase();
  const valid = /^[A-Z0-9.\-]{1,20}$/.test(symbol);

  const analyze = () => {
    if (valid) router.push({ pathname: '/ticker', params: { symbol, context: 'candidate', tab: 'atlas' } });
    else router.push('/analyze');
  };

  const openEngine = (engine: AtlasEngine) => {
    if (engine.id === 'evidence') {
      router.push(valid ? { pathname: '/evidence', params: { symbol } } : '/evidence');
      return;
    }
    if (['rotation', 'dislocation', 'agentic-security'].includes(engine.id)) {
      router.push('/radar');
      return;
    }
    const detail = DETAIL_ENGINE[engine.id] || 'decision';
    router.push({ pathname: '/engine-detail', params: { engine: detail, ...(valid ? { symbol } : {}) } });
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.topRow}>
        <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable>
        <Text style={styles.topLabel}>ENGINE ROOM Ω</Text>
      </View>
      <Text style={styles.title}>Motores ATLAS Ω</Text>
      <Text style={styles.subtitle}>Registro de motores + acceso a análisis aislado. Cada pantalla muestra inputs y salidas propios; el stack completo converge después en Decision Ω.</Text>

      <View style={styles.searchCard}>
        <Text style={styles.searchLabel}>TICKER GLOBAL</Text>
        <View style={styles.searchRow}>
          <TextInput value={ticker} onChangeText={setTicker} onSubmitEditing={analyze} autoCapitalize="characters" autoCorrect={false} placeholder="NVDA" placeholderTextColor="#596671" style={styles.input} />
          <Pressable accessibilityRole="button" accessibilityLabel="Ejecutar ATLAS Ω" onPress={analyze} style={styles.run}><Text style={styles.runText}>{valid ? 'STACK Ω' : 'MENÚ'}</Text></Pressable>
        </View>
        <Text style={styles.searchHint}>{valid ? `${symbol} quedará preseleccionado al abrir cada motor.` : 'Puedes abrir un motor y escribir allí el ticker.'}</Text>
      </View>

      <Pressable accessibilityRole="button" accessibilityLabel="Abrir centro de análisis" onPress={() => router.push(valid ? { pathname: '/analyze', params: { symbol } } : '/analyze')} style={styles.hub}>
        <View style={styles.flex}><Text style={styles.hubTitle}>CENTRO DE ANÁLISIS Ω</Text><Text style={styles.hubText}>Decision · Quality · Growth · Moat · Financial · Management · CAPEX · Valuation · Risk · Catalysts · News</Text></View><Text style={styles.arrow}>›</Text>
      </Pressable>

      {algorithm ? <View style={styles.algorithm}><Text style={styles.algorithmTitle}>PIPELINE CANÓNICO</Text><Text style={styles.algorithmText}>{algorithm}</Text></View> : null}
      {error ? <View style={styles.error}><Text style={styles.errorText}>{error}</Text></View> : null}
      {loading ? <View style={styles.loading}><ActivityIndicator size="large" color="#33d09b" /><Text style={styles.loadingText}>Leyendo registro de motores…</Text></View> : null}

      {engines.map((engine) => <EngineCard key={engine.id} engine={engine} onPress={() => openEngine(engine)} />)}

      <View style={styles.rule}><Text style={styles.ruleTitle}>REGLA Ω</Text><Text style={styles.ruleText}>CAPEX incompleto permanece incompleto; Moat/Management cuantitativos son proxies; Agentic Security, Rotation y Dislocation descubren o priorizan revisión, pero no emiten BUY/SELL por sí solos. Evidence Integrity decide qué información puede cambiar el estado canónico.</Text></View>
    </ScrollView>
  );
}

function EngineCard({ engine, onPress }: { engine: AtlasEngine; onPress: () => void }) {
  const stateTone = engine.state.includes('ACTIVE') ? styles.active : engine.state.includes('PARTIAL') ? styles.partial : styles.pending;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Abrir ${engine.name}`} onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.cardTop}><Text style={styles.engineName}>{engine.name}</Text><Text style={[styles.state, stateTone]}>{engine.state.replaceAll('_', ' ')}</Text></View>
      <Text style={styles.description}>{engine.description}</Text>
      <Text style={styles.open}>ABRIR MOTOR ›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#050708' }, content: { padding: 18, paddingBottom: 48, gap: 11 }, flex: { flex: 1 }, pressed: { opacity: 0.58 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 }, back: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#11161a', borderWidth: 1, borderColor: '#283139', alignItems: 'center', justifyContent: 'center' }, backText: { color: '#edf1f3', fontSize: 31, lineHeight: 33, marginTop: -4 }, topLabel: { color: '#6fcbee', fontSize: 9, fontWeight: '900', letterSpacing: 1.4 },
  title: { color: '#f5f7f8', fontSize: 31, fontWeight: '900', marginTop: 7 }, subtitle: { color: '#87939d', fontSize: 12, lineHeight: 18 },
  searchCard: { borderRadius: 15, borderWidth: 1, borderColor: '#2a3d49', backgroundColor: '#0c1419', padding: 13 }, searchLabel: { color: '#6fcbee', fontSize: 8.5, fontWeight: '900', letterSpacing: 1 }, searchRow: { flexDirection: 'row', gap: 8, marginTop: 9 }, input: { flex: 1, minHeight: 45, borderRadius: 11, borderWidth: 1, borderColor: '#29333b', backgroundColor: '#070b0e', color: '#f0f4f6', paddingHorizontal: 12, fontSize: 15, fontWeight: '800' }, run: { minWidth: 92, borderRadius: 11, backgroundColor: '#163c30', borderWidth: 1, borderColor: '#2d765b', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 }, runText: { color: '#9fe9c9', fontSize: 9, fontWeight: '900' }, searchHint: { color: '#65737d', fontSize: 8.5, marginTop: 7 },
  hub: { minHeight: 78, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 15, borderWidth: 1, borderColor: '#315a70', backgroundColor: '#0b1b24', padding: 13 }, hubTitle: { color: '#7ed4f4', fontSize: 10, fontWeight: '900' }, hubText: { color: '#6f8794', fontSize: 9, lineHeight: 14, marginTop: 4 }, arrow: { color: '#5a8094', fontSize: 28 },
  algorithm: { borderRadius: 13, backgroundColor: '#11160d', borderWidth: 1, borderColor: '#354525', padding: 13 }, algorithmTitle: { color: '#a8bd76', fontSize: 8.5, fontWeight: '900' }, algorithmText: { color: '#87936f', fontSize: 10, lineHeight: 16, marginTop: 5 },
  loading: { minHeight: 180, alignItems: 'center', justifyContent: 'center', gap: 10 }, loadingText: { color: '#75818a' }, error: { borderRadius: 12, borderWidth: 1, borderColor: '#5e2937', backgroundColor: '#1a0d11', padding: 12 }, errorText: { color: '#d8919d', fontSize: 10 },
  card: { borderRadius: 14, borderWidth: 1, borderColor: '#232d34', backgroundColor: '#0d1114', padding: 13 }, cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }, engineName: { color: '#f0f3f5', fontSize: 15, fontWeight: '900', flex: 1 }, state: { fontSize: 7, fontWeight: '900', maxWidth: 120, textAlign: 'right' }, active: { color: '#45d9a1' }, partial: { color: '#e5bd61' }, pending: { color: '#79bfe1' }, description: { color: '#7f8b94', fontSize: 10.5, lineHeight: 16, marginTop: 7 }, open: { color: '#6fcbee', fontSize: 8, fontWeight: '900', marginTop: 9 },
  rule: { borderRadius: 13, borderWidth: 1, borderColor: '#3b3423', backgroundColor: '#151209', padding: 13, marginTop: 5 }, ruleTitle: { color: '#dfbe69', fontSize: 8.5, fontWeight: '900' }, ruleText: { color: '#9d8d64', fontSize: 10, lineHeight: 16, marginTop: 5 },
});
