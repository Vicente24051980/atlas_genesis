import { useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { CapexChainApi, CapexChainPayload } from '../core/api/capexChainApi';
import { CompanyPayload, MobileApi } from '../core/api/mobileApi';
import { AuditResultStore, WatchlistStore } from '../core/storage/localStore';

export default function AuditScreen() {
  const params = useLocalSearchParams<{ ticker?: string }>();
  const initialTicker = typeof params.ticker === 'string' ? params.ticker.trim().toUpperCase() : '';
  const [ticker, setTicker] = useState(initialTicker);
  const [company, setCompany] = useState<CompanyPayload | null>(null);
  const [capex, setCapex] = useState<CapexChainPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const symbol = useMemo(() => ticker.trim().toUpperCase(), [ticker]);

  const run = async () => {
    if (!symbol) return;
    setLoading(true);
    setStatus(null);
    const [companyResult, capexResult] = await Promise.allSettled([
      MobileApi.company(symbol),
      CapexChainApi.profile(symbol),
    ]);
    const nextCompany = companyResult.status === 'fulfilled' ? companyResult.value : null;
    const nextCapex = capexResult.status === 'fulfilled' ? capexResult.value : null;
    setCompany(nextCompany);
    setCapex(nextCapex);
    if (!nextCompany) {
      setStatus(companyResult.status === 'rejected' && companyResult.reason instanceof Error ? companyResult.reason.message : 'No hay datos utilizables.');
    }
    setLoading(false);
  };

  const save = async () => {
    if (!company) return;
    const summary = company.summary;
    const now = new Date().toISOString();
    await AuditResultStore.save({
      id: `${company.symbol}-${now}`,
      ticker: company.symbol,
      createdAt: now,
      provider: company.provider,
      companyName: summary.name || company.symbol,
      sector: textValue(summary.sector) || textValue(summary.industry),
      price: numberValue(summary.price),
      marketCap: numberValue(summary.marketCap),
      pe: numberValue(summary.pe),
      capexPosition: capex ? `${capex.state}${typeof capex.capexPositionScore === 'number' ? ` · ${capex.capexPositionScore}` : ''}` : null,
      note: 'Snapshot rápido de auditoría. No sustituye Investment Committee Ω ni convierte evidencia parcial en BUY/SELL.',
    });
    setStatus('Resultado guardado en RESULTADOS.');
  };

  const addWatch = async () => {
    if (!symbol) return;
    await WatchlistStore.add(symbol);
    setStatus(`${symbol} añadido a WATCHLIST.`);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.code}>AUD</Text>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>ATLAS TERMINAL · AUDIT</Text>
          <Text style={styles.title}>Auditar</Text>
        </View>
      </View>

      <Text style={styles.description}>Pantalla dedicada para lanzar una auditoría ticker-first. Ejecuta el snapshot cuantitativo disponible y Global CAPEX Chain Ω; los motores no conectados siguen apareciendo como gates, no como resultados inventados.</Text>

      <View style={styles.inputRow}>
        <TextInput
          value={ticker}
          onChangeText={setTicker}
          autoCapitalize="characters"
          autoCorrect={false}
          placeholder="TSM / ASML / ARVN"
          placeholderTextColor="#4c5b60"
          style={styles.input}
          returnKeyType="search"
          onSubmitEditing={() => { void run(); }}
        />
        <Pressable onPress={() => { void run(); }} style={({ pressed }) => [styles.run, pressed && styles.pressed]}>
          <Text style={styles.runText}>RUN AUDIT</Text>
        </Pressable>
      </View>

      {loading ? <View style={styles.loading}><ActivityIndicator color="#53efbd" /><Text style={styles.muted}>Consultando evidencia…</Text></View> : null}
      {status ? <Text style={styles.status}>{status}</Text> : null}

      <View style={styles.engineGrid}>
        <Engine label="Company / Quote" state={company ? 'READY' : 'DATA GATE'} />
        <Engine label="Global CAPEX Chain Ω" state={capex ? 'READY' : 'DATA GATE'} />
        <Engine label="GREEN Ω" state="ENGINE GATE" />
        <Engine label="Retorno Ω" state="ENGINE GATE" />
        <Engine label="Money Rotation Ω" state="ENGINE GATE" />
        <Engine label="Falsifiers Ω" state="ENGINE GATE" />
      </View>

      {company ? (
        <View style={styles.panel}>
          <View style={styles.panelTop}>
            <View>
              <Text style={styles.symbol}>{company.symbol}</Text>
              <Text style={styles.name}>{company.summary.name || company.symbol}</Text>
            </View>
            <Text style={styles.provider}>{company.provider}</Text>
          </View>
          <View style={styles.metrics}>
            <Metric label="PRICE" value={formatNumber(company.summary.price)} />
            <Metric label="MARKET CAP" value={formatCompact(company.summary.marketCap)} />
            <Metric label="P/E" value={formatNumber(company.summary.pe)} />
            <Metric label="SECTOR" value={textValue(company.summary.sector) || textValue(company.summary.industry) || 'N/D'} />
          </View>
          {capex ? (
            <View style={styles.capexLine}>
              <Text style={styles.capexLabel}>CAPEX Ω</Text>
              <Text style={styles.capexValue}>{capex.state} · position {capex.capexPositionScore ?? 'N/D'} · structural {capex.structuralOpportunityScore ?? 'N/D'}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {company ? (
        <View style={styles.actions}>
          <Pressable onPress={() => { void save(); }} style={({ pressed }) => [styles.action, pressed && styles.pressed]}><Text style={styles.actionText}>GUARDAR RESULTADO</Text></Pressable>
          <Pressable onPress={() => { void addWatch(); }} style={({ pressed }) => [styles.action, pressed && styles.pressed]}><Text style={styles.actionText}>+ WATCHLIST</Text></Pressable>
          <Pressable onPress={() => router.push(`/analyze?ticker=${encodeURIComponent(company.symbol)}` as never)} style={({ pressed }) => [styles.action, pressed && styles.pressed]}><Text style={styles.actionText}>SECURITY HUB →</Text></Pressable>
        </View>
      ) : null}

      <View style={styles.rule}>
        <Text style={styles.ruleTitle}>AUDIT RULE</Text>
        <Text style={styles.ruleText}>Guardar un snapshot conserva lo observado y su proveedor. No convierte el snapshot en tesis canónica ni reemplaza evidencia primaria, contradicciones o Falsifiers Ω.</Text>
      </View>
    </ScrollView>
  );
}

function Engine({ label, state }: { label: string; state: string }) {
  const ready = state === 'READY';
  return <View style={styles.engine}><Text style={styles.engineLabel}>{label}</Text><Text style={[styles.engineState, ready && styles.engineReady]}>{state}</Text></View>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <View style={styles.metric}><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text></View>;
}

function numberValue(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : null; }
  return null;
}
function textValue(value: unknown): string | null { return typeof value === 'string' && value.trim() ? value.trim() : null; }
function formatNumber(value: unknown): string { const n = numberValue(value); return n === null ? 'N/D' : n.toLocaleString('es-ES', { maximumFractionDigits: 2 }); }
function formatCompact(value: unknown): string { const n = numberValue(value); return n === null ? 'N/D' : new Intl.NumberFormat('es-ES', { notation: 'compact', maximumFractionDigits: 2 }).format(n); }

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#050708' },
  content: { paddingHorizontal: 12, paddingTop: 14, paddingBottom: 28, gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: '#1b272c', paddingBottom: 12 },
  code: { width: 48, height: 48, textAlign: 'center', textAlignVertical: 'center', borderWidth: 1, borderColor: '#2f725b', backgroundColor: '#071510', color: '#54efbd', fontFamily: 'monospace', fontWeight: '900' },
  headerText: { flex: 1 },
  eyebrow: { color: '#5e7379', fontFamily: 'monospace', fontSize: 8, fontWeight: '900', letterSpacing: 1.1 },
  title: { color: '#eff5f3', fontFamily: 'monospace', fontSize: 24, fontWeight: '900', marginTop: 3 },
  description: { color: '#8c9a9f', fontSize: 12, lineHeight: 18 },
  inputRow: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, minWidth: 0, borderWidth: 1, borderColor: '#26383e', backgroundColor: '#080d0f', color: '#edf5f2', paddingHorizontal: 12, minHeight: 46, fontFamily: 'monospace' },
  run: { justifyContent: 'center', borderWidth: 1, borderColor: '#2f725b', backgroundColor: '#071510', paddingHorizontal: 12 },
  runText: { color: '#54efbd', fontFamily: 'monospace', fontSize: 9, fontWeight: '900' },
  loading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  muted: { color: '#77878c', fontFamily: 'monospace', fontSize: 10 },
  status: { color: '#9fd9c7', borderLeftWidth: 2, borderLeftColor: '#2f725b', paddingLeft: 9, fontSize: 11 },
  engineGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  engine: { width: '48%', minWidth: 145, borderWidth: 1, borderColor: '#1b292e', backgroundColor: '#080d0f', padding: 10, gap: 5 },
  engineLabel: { color: '#c3cfcc', fontSize: 10, fontWeight: '800' },
  engineState: { color: '#856e44', fontFamily: 'monospace', fontSize: 8, fontWeight: '900' },
  engineReady: { color: '#4de7b4' },
  panel: { borderWidth: 1, borderColor: '#22343a', backgroundColor: '#070c0e', padding: 12, gap: 12 },
  panelTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  symbol: { color: '#f1f6f4', fontFamily: 'monospace', fontSize: 22, fontWeight: '900' },
  name: { color: '#718187', fontSize: 11, marginTop: 3 },
  provider: { color: '#5be6ba', fontFamily: 'monospace', fontSize: 8, fontWeight: '900' },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  metric: { minWidth: 120, flexGrow: 1, borderTopWidth: 1, borderTopColor: '#1b292e', paddingTop: 8 },
  metricLabel: { color: '#506067', fontFamily: 'monospace', fontSize: 7, fontWeight: '900' },
  metricValue: { color: '#dbe5e2', fontFamily: 'monospace', fontSize: 11, fontWeight: '800', marginTop: 4 },
  capexLine: { borderTopWidth: 1, borderTopColor: '#1b292e', paddingTop: 9 },
  capexLabel: { color: '#52e6b7', fontFamily: 'monospace', fontSize: 8, fontWeight: '900' },
  capexValue: { color: '#93a29f', fontSize: 10, marginTop: 4 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  action: { borderWidth: 1, borderColor: '#2b4540', backgroundColor: '#08110e', paddingVertical: 10, paddingHorizontal: 11 },
  actionText: { color: '#a8ddd0', fontFamily: 'monospace', fontSize: 8, fontWeight: '900' },
  pressed: { opacity: 0.68 },
  rule: { borderTopWidth: 1, borderTopColor: '#1a2428', paddingTop: 12 },
  ruleTitle: { color: '#4fe8b6', fontFamily: 'monospace', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  ruleText: { color: '#718087', fontSize: 10, lineHeight: 16, marginTop: 5 },
});
