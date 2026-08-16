import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { CapexChainApi, CapexChainPayload } from '../core/api/capexChainApi';
import { CompanyPayload, MobileApi } from '../core/api/mobileApi';

export default function AnalyzeScreen() {
  const params = useLocalSearchParams<{ ticker?: string }>();
  const [ticker, setTicker] = useState(typeof params.ticker === 'string' ? params.ticker.toUpperCase() : 'MSFT');
  const [data, setData] = useState<CompanyPayload | null>(null);
  const [capex, setCapex] = useState<CapexChainPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async (value = ticker) => {
    const symbol = value.trim().toUpperCase();
    if (!symbol) return;
    setTicker(symbol);
    setLoading(true);
    setError(null);

    const [companyResult, capexResult] = await Promise.allSettled([
      MobileApi.company(symbol),
      CapexChainApi.profile(symbol),
    ]);

    if (companyResult.status === 'fulfilled') {
      setData(companyResult.value);
    } else {
      setData(null);
      setError(companyResult.reason instanceof Error ? companyResult.reason.message : String(companyResult.reason));
    }

    setCapex(capexResult.status === 'fulfilled' ? capexResult.value : null);
    setLoading(false);
  };

  useEffect(() => {
    if (typeof params.ticker === 'string' && params.ticker.trim()) void analyze(params.ticker);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>← Inicio</Text></Pressable>
      <Text style={styles.eyebrow}>ANÁLISIS DE EMPRESA</Text>
      <Text style={styles.title}>Analizar empresa</Text>
      <Text style={styles.subtitle}>Ticker-first. FinancialData.Net es la fuente cuantitativa preferida; Global CAPEX Chain Ω añade la posición económica estructural sin mezclarla con valoración o BUY/SELL.</Text>

      <View style={styles.searchCard}>
        <TextInput
          accessibilityLabel="Ticker"
          value={ticker}
          onChangeText={setTicker}
          autoCapitalize="characters"
          autoCorrect={false}
          placeholder="MSFT"
          placeholderTextColor="#64748b"
          style={styles.input}
          returnKeyType="search"
          onSubmitEditing={() => { void analyze(); }}
        />
        <Pressable accessibilityRole="button" accessibilityLabel="Analizar ahora" onPress={() => { void analyze(); }} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
          <Text style={styles.buttonText}>ANALIZAR AHORA</Text>
        </Pressable>
      </View>

      {loading ? <View style={styles.loading}><ActivityIndicator color="#7dd3fc" /><Text style={styles.muted}>Consultando ATLAS…</Text></View> : null}
      {error ? <View style={styles.errorCard}><Text style={styles.errorTitle}>No se pudo consultar {ticker}</Text><Text style={styles.errorText}>{error}</Text></View> : null}

      {data ? (
        <>
          <View style={styles.resultHeader}>
            <View style={styles.providerBadge}><Text style={styles.providerText}>{data.provider}</Text></View>
            <Text style={styles.symbol}>{data.symbol}</Text>
            {data.fallbackReason ? <Text style={styles.fallback}>{data.fallbackReason}</Text> : null}
          </View>

          <View style={styles.companyCard}>
            <Text style={styles.companyName}>{data.summary.name || data.symbol}</Text>
            <Text style={styles.companyMeta}>{clean(data.summary.sector) || clean(data.summary.industry) || 'Sector no disponible'}{clean(data.summary.currency) ? ` · ${clean(data.summary.currency)}` : ''}</Text>
          </View>

          <View style={styles.grid}>
            <Metric label="Precio" value={formatNumber(data.summary.price)} />
            <Metric label="Market cap" value={formatCompact(data.summary.marketCap)} />
            <Metric label="P/E" value={formatNumber(data.summary.pe)} />
            <Metric label="Revenue" value={formatCompact(data.summary.revenue)} />
            <Metric label="Free cash flow" value={formatCompact(data.summary.freeCashFlow)} />
          </View>

          {capex ? <CapexCard payload={capex} /> : null}

          <Text style={styles.sectionTitle}>Cobertura del proveedor</Text>
          <View style={styles.statusCard}>
            {Object.entries(data.sourceStatus || {}).map(([name, status]) => (
              <View key={name} style={styles.statusLine}><Text style={styles.statusName}>{name}</Text><Text style={status === 'OK' ? styles.ok : styles.warn}>{status}</Text></View>
            ))}
            {!Object.keys(data.sourceStatus || {}).length ? <Text style={styles.muted}>Sin detalle de cobertura.</Text> : null}
          </View>

          {data.guardrails?.length ? (
            <View style={styles.guardrailCard}>
              <Text style={styles.guardrailTitle}>GUARDRAILS Ω</Text>
              {data.guardrails.map((item) => <Text key={item} style={styles.guardrailText}>• {item}</Text>)}
            </View>
          ) : null}
        </>
      ) : null}
    </ScrollView>
  );
}

function CapexCard({ payload }: { payload: CapexChainPayload }) {
  return (
    <View style={styles.capexCard}>
      <View style={styles.capexHeader}>
        <Text style={styles.capexTitle}>GLOBAL CAPEX CHAIN Ω</Text>
        <Text style={payload.mapped ? styles.ok : styles.warn}>{payload.mapped ? 'MAPPED' : 'RESEARCH'}</Text>
      </View>
      {payload.mapped ? (
        <>
          <View style={styles.capexMetrics}>
            <Metric label="EDD" value={`EDD-${payload.edd ?? '—'}`} />
            <Metric label="Modo económico" value={pretty(payload.economicMode)} />
          </View>
          <Text style={styles.capexRole}>{pretty(payload.role)}</Text>
          <Text style={styles.capexRivers}>{(payload.rivers || []).map(pretty).join('  →  ') || 'Río CAPEX pendiente'}</Text>
        </>
      ) : <Text style={styles.muted}>Ticker aún no mapeado: ATLAS no inventa una posición económica.</Text>}
      <Text style={styles.capexEvidence}>Evidence Gate: {pretty(payload.evidenceGate)}</Text>
      <Text style={styles.capexGuardrail}>{payload.guardrail}</Text>
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <View style={styles.metric}><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text></View>;
}

function pretty(value: unknown): string {
  if (!value) return 'N/D';
  return String(value).replaceAll('_', ' ');
}

function clean(value: unknown): string {
  if (value === null || value === undefined || value === '') return '';
  return String(value);
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function formatNumber(value: unknown): string {
  const n = asNumber(value);
  if (n === null) return 'N/D';
  return new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 }).format(n);
}

function formatCompact(value: unknown): string {
  const n = asNumber(value);
  if (n === null) return clean(value) || 'N/D';
  return new Intl.NumberFormat('es-ES', { notation: 'compact', maximumFractionDigits: 2 }).format(n);
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#07090d' },
  content: { paddingTop: 54, paddingHorizontal: 18, paddingBottom: 44, gap: 12 },
  back: { alignSelf: 'flex-start', paddingVertical: 8, paddingRight: 14 },
  backText: { color: '#7dd3fc', fontWeight: '800' },
  eyebrow: { color: '#7dd3fc', fontWeight: '900', letterSpacing: 1.2, fontSize: 12 },
  title: { color: '#f8fafc', fontSize: 31, fontWeight: '900' },
  subtitle: { color: '#94a3b8', lineHeight: 21 },
  searchCard: { backgroundColor: '#0f141c', borderRadius: 18, borderWidth: 1, borderColor: '#223047', padding: 14, gap: 10 },
  input: { backgroundColor: '#070a0f', borderRadius: 12, borderWidth: 1, borderColor: '#334155', color: '#f8fafc', paddingHorizontal: 15, paddingVertical: 13, fontSize: 19, fontWeight: '800', letterSpacing: 1 },
  button: { backgroundColor: '#0ea5e9', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  buttonText: { color: '#03111a', fontWeight: '900' },
  pressed: { opacity: 0.72 },
  loading: { flexDirection: 'row', gap: 10, alignItems: 'center', padding: 14 },
  muted: { color: '#94a3b8' },
  errorCard: { backgroundColor: '#241318', borderColor: '#6b2737', borderWidth: 1, borderRadius: 15, padding: 15, gap: 6 },
  errorTitle: { color: '#fecdd3', fontWeight: '900' },
  errorText: { color: '#fda4af', lineHeight: 20 },
  resultHeader: { marginTop: 4, gap: 7 },
  providerBadge: { alignSelf: 'flex-start', backgroundColor: '#102b24', borderColor: '#1d6b54', borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  providerText: { color: '#a7f3d0', fontWeight: '800', fontSize: 12 },
  symbol: { color: '#f8fafc', fontWeight: '900', fontSize: 28 },
  fallback: { color: '#fbbf24', fontSize: 12 },
  companyCard: { backgroundColor: '#0c1118', borderRadius: 16, padding: 15, borderWidth: 1, borderColor: '#1e293b' },
  companyName: { color: '#f8fafc', fontSize: 21, fontWeight: '900' },
  companyMeta: { color: '#94a3b8', marginTop: 5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  metric: { width: '48%', minHeight: 80, backgroundColor: '#0f141c', borderRadius: 14, padding: 13, borderWidth: 1, borderColor: '#1e293b' },
  metricLabel: { color: '#64748b', fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  metricValue: { color: '#f8fafc', fontSize: 17, fontWeight: '900', marginTop: 8 },
  sectionTitle: { color: '#cbd5e1', fontWeight: '900', marginTop: 5, textTransform: 'uppercase', fontSize: 12, letterSpacing: 1 },
  statusCard: { backgroundColor: '#0c1118', borderRadius: 14, borderWidth: 1, borderColor: '#1e293b', padding: 13, gap: 9 },
  statusLine: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  statusName: { color: '#cbd5e1', fontWeight: '700' },
  ok: { color: '#34d399', fontWeight: '900' },
  warn: { color: '#fbbf24', fontWeight: '800' },
  guardrailCard: { backgroundColor: '#111827', borderRadius: 14, padding: 14, gap: 7 },
  guardrailTitle: { color: '#a5b4fc', fontWeight: '900', fontSize: 11, letterSpacing: 1 },
  guardrailText: { color: '#cbd5e1', lineHeight: 19 },
  capexCard: { backgroundColor: '#10151d', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#334155', gap: 10 },
  capexHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  capexTitle: { color: '#f8fafc', fontWeight: '900', fontSize: 12, letterSpacing: 0.8 },
  capexMetrics: { flexDirection: 'row', gap: 9 },
  capexRole: { color: '#7dd3fc', fontWeight: '900', fontSize: 16 },
  capexRivers: { color: '#cbd5e1', lineHeight: 20 },
  capexEvidence: { color: '#fbbf24', fontWeight: '800', fontSize: 12 },
  capexGuardrail: { color: '#94a3b8', lineHeight: 18, fontSize: 12 },
});
