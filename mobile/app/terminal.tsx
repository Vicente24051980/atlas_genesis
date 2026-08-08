import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { TerminalRepository, TerminalCompany } from '../db/repositories/TerminalRepository';

export default function TerminalScreen() {
  const [ticker, setTicker] = useState('');
  const [company, setCompany] = useState<TerminalCompany | null>(null);
  const [bundle, setBundle] = useState<Awaited<ReturnType<typeof TerminalRepository.latestBundle>> | null>(null);
  const [message, setMessage] = useState('');

  const resolveLocal = async () => {
    const normalized = ticker.trim().toUpperCase();
    if (!/^[A-Z0-9.\-]{1,12}$/.test(normalized)) {
      setMessage('Introduce un ticker válido.');
      return;
    }
    const resolved = await TerminalRepository.ensurePendingCompany(normalized);
    setCompany(resolved);
    setBundle(await TerminalRepository.latestBundle(resolved.id));
    setMessage(resolved.identifierStatus === 'PENDING'
      ? 'Entidad local creada. Falta resolver mercado/ISIN con el backend ATLAS; no se inventan datos.'
      : 'Entidad canónica recuperada.');
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>ATLAS Ω TERMINAL · PHASE 1</Text>
      <Text style={styles.title}>Universal Search</Text>
      <Text style={styles.subtitle}>Ticker → entidad canónica → snapshots → motores. Market data sigue siendo un sensor externo.</Text>

      <View style={styles.searchCard}>
        <TextInput
          value={ticker}
          onChangeText={setTicker}
          autoCapitalize="characters"
          autoCorrect={false}
          placeholder="MSFT · NVDA · ASML"
          placeholderTextColor="#64748b"
          style={styles.input}
          onSubmitEditing={() => { void resolveLocal(); }}
        />
        <Pressable onPress={() => { void resolveLocal(); }} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
          <Text style={styles.buttonText}>Resolver ticker</Text>
        </Pressable>
      </View>

      {message ? <Text style={styles.message}>{message}</Text> : null}

      {company ? (
        <>
          <View style={styles.companyHeader}>
            <View>
              <Text style={styles.ticker}>{company.canonicalTicker}</Text>
              <Text style={styles.companyName}>{company.companyName}</Text>
            </View>
            <StatusBadge state={company.identifierStatus} />
          </View>

          <View style={styles.metricGrid}>
            <Metric label="PRICE" value={bundle?.market?.price == null ? '—' : String(bundle.market.price)} />
            <Metric label="DAILY %" value={bundle?.market?.changePct == null ? '—' : `${bundle.market.changePct.toFixed(2)}%`} />
            <Metric label="THESIS" value={bundle?.thesis?.state ?? '—'} />
            <Metric label="AUDIT" value={bundle?.audit?.status ?? '—'} />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Scores Ω</Text>
            {bundle?.engines.length ? bundle.engines.map((engine) => (
              <View key={engine.id} style={styles.engineRow}>
                <Text style={styles.engineName}>{engine.engine}</Text>
                <Text style={styles.engineValue}>{engine.score == null ? engine.state : engine.score.toFixed(1)}</Text>
              </View>
            )) : <Text style={styles.placeholder}>Sin auditoría persistida. No se muestran scores hasta que el motor canónico produzca un resultado versionado.</Text>}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Conectividad</Text>
            <Text style={styles.line}>Market provider: {bundle?.market?.provider ?? 'NOT CONFIGURED'}</Text>
            <Text style={styles.line}>Identifier: {company.identifierStatus}</Text>
            <Text style={styles.line}>Algorithm: {bundle?.audit?.algorithmVersion ?? 'NOT EXECUTED'}</Text>
            <Text style={styles.guardrail}>La app no calcula ni simula precios, fundamentales o scores cuando el backend/proveedor no está conectado.</Text>
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <View style={styles.metric}><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text></View>;
}

function StatusBadge({ state }: { state: string }) {
  return <View style={styles.badge}><Text style={styles.badgeText}>{state}</Text></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#070b10' },
  content: { padding: 16, gap: 14 },
  eyebrow: { color: '#7f93a8', fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  title: { color: '#fff', fontSize: 28, fontWeight: '900' },
  subtitle: { color: '#95a4b5', lineHeight: 20 },
  searchCard: { backgroundColor: '#0d141d', borderWidth: 1, borderColor: '#223247', borderRadius: 12, padding: 10, gap: 8 },
  input: { backgroundColor: '#070b10', color: '#fff', borderWidth: 1, borderColor: '#26364a', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, fontSize: 17, fontWeight: '800' },
  button: { backgroundColor: '#2563eb', borderRadius: 8, padding: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '900' },
  pressed: { opacity: 0.7 },
  message: { color: '#d6a94b', fontSize: 12, lineHeight: 18 },
  companyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderColor: '#1c2938', paddingBottom: 12 },
  ticker: { color: '#fff', fontSize: 27, fontWeight: '900' },
  companyName: { color: '#8394a8', marginTop: 2 },
  badge: { borderWidth: 1, borderColor: '#8a6a21', backgroundColor: '#2a220f', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  badgeText: { color: '#e7bd5c', fontWeight: '900', fontSize: 10 },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metric: { width: '48.5%', backgroundColor: '#0d141d', borderWidth: 1, borderColor: '#1c2938', borderRadius: 10, padding: 10 },
  metricLabel: { color: '#65778a', fontSize: 10, fontWeight: '800' },
  metricValue: { color: '#fff', fontSize: 18, fontWeight: '900', marginTop: 4 },
  card: { backgroundColor: '#0d141d', borderWidth: 1, borderColor: '#1c2938', borderRadius: 12, padding: 13, gap: 8 },
  cardTitle: { color: '#dbe7f4', fontWeight: '900', fontSize: 13 },
  engineRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderColor: '#172333', paddingTop: 8 },
  engineName: { color: '#8fa1b5', fontSize: 12 },
  engineValue: { color: '#fff', fontWeight: '900' },
  placeholder: { color: '#718196', fontSize: 12, lineHeight: 18 },
  line: { color: '#9aacbf', fontSize: 12 },
  guardrail: { color: '#d6a94b', fontSize: 11, lineHeight: 17, marginTop: 3 },
});
