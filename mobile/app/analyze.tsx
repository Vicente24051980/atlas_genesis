import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

const MODULES = [
  { id: 'decision', code: 'Ω', title: 'ATLAS Decision', subtitle: 'COMPRAR · ESPERAR · NO COMPRAR' },
  { id: 'quality', code: 'QLT', title: 'Business Quality Ω', subtitle: 'ROIC · ROE · márgenes · eficiencia' },
  { id: 'growth', code: 'GRW', title: 'Growth Ω', subtitle: 'Ingresos · EPS · FCF' },
  { id: 'moat', code: 'MOT', title: 'Moat Ω', subtitle: 'Proxy cuantitativo + gate de evidencia primaria' },
  { id: 'financial', code: 'FIN', title: 'Financial Quality Ω', subtitle: 'Liquidez · deuda · cobertura' },
  { id: 'management', code: 'MGT', title: 'Management Ω', subtitle: 'Ejecución cuantitativa + evidencia' },
  { id: 'capex', code: 'CPX', title: 'CAPEX Productivity Ω', subtitle: 'ROIC · FCF/CAPEX · monetización' },
  { id: 'valuation', code: 'VAL', title: 'Valuation Ω', subtitle: 'P/E · Forward P/E · P/B · P/S' },
  { id: 'risk', code: 'RSK', title: 'Risk Ω', subtitle: 'Beta · deuda · liquidez · flags' },
  { id: 'catalysts', code: 'CAT', title: 'Catalysts Ω', subtitle: 'Noticias y consenso como sensores' },
  { id: 'news', code: 'NWS', title: 'News Ω', subtitle: 'Flujo de noticias separado del score' },
] as const;

export default function AnalyzeHubScreen() {
  const router = useRouter();
  const [ticker, setTicker] = useState('');
  const symbol = ticker.trim().toUpperCase();
  const valid = /^[A-Z0-9.\-]{1,20}$/.test(symbol);

  const open = (engine: string) => {
    router.push({ pathname: '/engine-detail', params: { engine, ...(valid ? { symbol } : {}) } });
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.topRow}>
        <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable>
        <View><Text style={styles.eyebrow}>ANALYZE Ω</Text><Text style={styles.title}>Analizar ticker</Text></View>
      </View>
      <Text style={styles.subtitle}>Escribe el ticker una vez y elige el motor. Cada pantalla usa inputs y salidas propios; no hay formularios de métricas.</Text>

      <View style={styles.searchCard}>
        <Text style={styles.searchLabel}>TICKER</Text>
        <TextInput value={ticker} onChangeText={setTicker} autoCapitalize="characters" autoCorrect={false} placeholder="NVDA" placeholderTextColor="#5d6972" style={styles.input} />
        <Text style={[styles.validity, valid ? styles.ok : styles.pending]}>{valid ? `${symbol} · LISTO` : 'Introduce ticker para preseleccionarlo en todos los motores'}</Text>
      </View>

      <Pressable accessibilityRole="button" accessibilityLabel="Abrir terminal completo" disabled={!valid} onPress={() => router.push({ pathname: '/ticker', params: { symbol, context: 'candidate' } })} style={[styles.terminal, !valid && styles.disabled]}>
        <View><Text style={styles.terminalTitle}>TERMINAL COMPLETO</Text><Text style={styles.terminalSub}>Precio · gráfico · ATLAS · financiero · noticias</Text></View><Text style={styles.arrow}>›</Text>
      </Pressable>

      <Text style={styles.section}>MOTORES SEPARADOS</Text>
      {MODULES.map((module) => (
        <Pressable key={module.id} accessibilityRole="button" accessibilityLabel={`Abrir ${module.title}`} onPress={() => open(module.id)} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
          <View style={styles.code}><Text style={styles.codeText}>{module.code}</Text></View>
          <View style={styles.flex}><Text style={styles.cardTitle}>{module.title}</Text><Text style={styles.cardSub}>{module.subtitle}</Text></View>
          <Text style={styles.arrow}>›</Text>
        </Pressable>
      ))}

      <View style={styles.rule}><Text style={styles.ruleTitle}>REGLA Ω</Text><Text style={styles.ruleText}>Un motor no hereda automáticamente la conclusión de otro. ATLAS conserva estados incompletos, muestra cobertura y solo converge en la decisión final después del pipeline.</Text></View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#050708' }, content: { padding: 18, paddingBottom: 52, gap: 11 }, flex: { flex: 1 }, pressed: { opacity: 0.58 }, disabled: { opacity: 0.35 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 }, back: { width: 43, height: 43, borderRadius: 22, backgroundColor: '#11161a', borderWidth: 1, borderColor: '#293139', alignItems: 'center', justifyContent: 'center' }, backText: { color: '#edf1f3', fontSize: 31, lineHeight: 33, marginTop: -4 }, eyebrow: { color: '#67c9ef', fontSize: 8.5, fontWeight: '900', letterSpacing: 1.3 }, title: { color: '#f5f7f8', fontSize: 29, fontWeight: '900', marginTop: 2 }, subtitle: { color: '#84919a', fontSize: 11, lineHeight: 17 },
  searchCard: { borderRadius: 15, borderWidth: 1, borderColor: '#2b3f4a', backgroundColor: '#0c1419', padding: 13 }, searchLabel: { color: '#6fcbee', fontSize: 8.5, fontWeight: '900' }, input: { minHeight: 49, borderRadius: 11, borderWidth: 1, borderColor: '#29343c', backgroundColor: '#070b0d', color: '#f0f4f6', paddingHorizontal: 12, fontSize: 17, fontWeight: '900', marginTop: 8 }, validity: { fontSize: 8.5, fontWeight: '900', marginTop: 7 }, ok: { color: '#41d69d' }, pending: { color: '#7b8790' },
  terminal: { minHeight: 75, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 15, borderWidth: 1, borderColor: '#315f72', backgroundColor: '#0b1c24', padding: 14 }, terminalTitle: { color: '#83d5f4', fontSize: 10, fontWeight: '900' }, terminalSub: { color: '#718995', fontSize: 9.5, marginTop: 4 }, arrow: { color: '#5b8297', fontSize: 28 }, section: { color: '#64727c', fontSize: 8.5, fontWeight: '900', letterSpacing: 1.2, marginTop: 4 },
  card: { minHeight: 78, flexDirection: 'row', alignItems: 'center', gap: 11, borderRadius: 14, borderWidth: 1, borderColor: '#232d34', backgroundColor: '#0c1013', padding: 12 }, code: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#101b22', borderWidth: 1, borderColor: '#29404e' }, codeText: { color: '#6fcbee', fontSize: 8.5, fontWeight: '900' }, cardTitle: { color: '#edf1f3', fontSize: 14, fontWeight: '900' }, cardSub: { color: '#75818a', fontSize: 9.5, marginTop: 4 },
  rule: { borderRadius: 13, borderWidth: 1, borderColor: '#384625', backgroundColor: '#101509', padding: 13, marginTop: 4 }, ruleTitle: { color: '#a8bd78', fontSize: 8.5, fontWeight: '900' }, ruleText: { color: '#82916c', fontSize: 9.5, lineHeight: 15, marginTop: 5 },
});
