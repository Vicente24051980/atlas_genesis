import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import AtlasBrokerShell from '../components/AtlasBrokerShell';
import { Card, MetricTile, Pill, SectionHeader } from '../components/BrokerUi';
import { CapexChainApi, type CapexChainPayload } from '../core/api/capexChainApi';
import { MobileApi, type CompanyPayload } from '../core/api/mobileApi';
import { brokerTheme as t } from '../ui/brokerTheme';

export default function AnalyzeScreen() {
  const params = useLocalSearchParams<{ ticker?: string }>();
  const [ticker, setTicker] = useState(typeof params.ticker === 'string' ? params.ticker.toUpperCase() : 'MSFT');
  const [data, setData] = useState<CompanyPayload | null>(null);
  const [capex, setCapex] = useState<CapexChainPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyze = async (value = ticker) => {
    const symbol = value.trim().toUpperCase();
    if (!symbol) return;
    setTicker(symbol); setLoading(true); setError('');
    const [companyResult, capexResult] = await Promise.allSettled([MobileApi.company(symbol), CapexChainApi.profile(symbol)]);
    if (companyResult.status === 'fulfilled') setData(companyResult.value);
    else { setData(null); setError(companyResult.reason instanceof Error ? companyResult.reason.message : String(companyResult.reason)); }
    setCapex(capexResult.status === 'fulfilled' ? capexResult.value : null);
    setLoading(false);
  };

  useEffect(() => { if (typeof params.ticker === 'string' && params.ticker.trim()) void analyze(params.ticker); }, []);

  return (
    <AtlasBrokerShell active="home" title={data?.symbol || 'Analizar'} keyboardShouldPersistTaps="handled">
      <View style={styles.heading}><View style={{ flex: 1 }}><Text style={styles.kicker}>INSTRUMENT DETAIL</Text><Text style={styles.title}>Análisis ATLAS</Text><Text style={styles.subtitle}>Ficha única para fundamentales, proveedor y posición Global CAPEX Chain Ω.</Text></View>{data ? <Pill label={data.provider} tone="info" /> : null}</View>

      <View style={styles.searchBox}>
        <TextInput value={ticker} onChangeText={setTicker} autoCapitalize="characters" autoCorrect={false} placeholder="MSFT" placeholderTextColor={t.textFaint} returnKeyType="search" onSubmitEditing={() => { void analyze(); }} style={styles.input} />
        <Pressable onPress={() => { void analyze(); }} style={({ pressed }) => [styles.button, pressed && styles.pressed]}><Text style={styles.buttonText}>Analizar</Text></Pressable>
      </View>

      {loading ? <View style={styles.loading}><ActivityIndicator color={t.accent} /><Text style={styles.muted}>Consultando ATLAS…</Text></View> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {data ? (
        <>
          <Card>
            <Text style={styles.symbol}>{data.symbol}</Text>
            <Text style={styles.company}>{data.summary.name || data.symbol}</Text>
            <Text style={styles.meta}>{clean(data.summary.sector) || clean(data.summary.industry) || 'Sector no disponible'}{clean(data.summary.currency) ? ` · ${clean(data.summary.currency)}` : ''}</Text>
            {data.fallbackReason ? <Text style={styles.fallback}>{data.fallbackReason}</Text> : null}
          </Card>

          <View style={styles.metrics}>
            <MetricTile label="Precio" value={formatNumber(data.summary.price)} />
            <MetricTile label="Market cap" value={formatCompact(data.summary.marketCap)} />
            <MetricTile label="P/E" value={formatNumber(data.summary.pe)} />
            <MetricTile label="Revenue" value={formatCompact(data.summary.revenue)} />
            <MetricTile label="Free cash flow" value={formatCompact(data.summary.freeCashFlow)} />
          </View>

          <SectionHeader title="Global CAPEX Chain Ω" />
          {capex ? <CapexCard payload={capex} /> : <Card><Text style={styles.muted}>Sin perfil CAPEX verificable para este ticker.</Text></Card>}

          <SectionHeader title="Cobertura de fuentes" />
          <Card>
            {Object.entries(data.sourceStatus || {}).length ? Object.entries(data.sourceStatus || {}).map(([name, status], index, rows) => (
              <View key={name} style={[styles.statusRow, index === rows.length - 1 && styles.lastRow]}><Text style={styles.statusName}>{name}</Text><Pill label={status} tone={status === 'OK' ? 'positive' : 'warning'} /></View>
            )) : <Text style={styles.muted}>Sin detalle de cobertura.</Text>}
          </Card>

          {data.guardrails?.length ? <Card><Text style={styles.guardrailTitle}>GUARDRAILS Ω</Text>{data.guardrails.map((item) => <Text key={item} style={styles.guardrail}>• {item}</Text>)}</Card> : null}
        </>
      ) : null}
    </AtlasBrokerShell>
  );
}

function CapexCard({ payload }: { payload: CapexChainPayload }) {
  return (
    <Card>
      <View style={styles.capexHead}><View style={{ flex: 1 }}><Text style={styles.capexName}>{payload.role || payload.ticker}</Text><Text style={styles.capexMeta}>{payload.economicMode || payload.engine}</Text></View><Pill label={payload.mapped ? 'MAPPED' : payload.state || 'RESEARCH'} tone={payload.mapped ? 'positive' : 'warning'} /></View>
      <View style={styles.metrics}>
        <MetricTile label="EDD" value={payload.edd == null ? 'N/D' : String(payload.edd)} />
        <MetricTile label="CAPEX position" value={formatNumber(payload.capexPositionScore)} />
        <MetricTile label="Structural opp." value={formatNumber(payload.structuralOpportunityScore)} />
        <MetricTile label="Fragility" value={formatNumber(payload.capexFragilityScore)} />
      </View>
      <Text style={styles.evidence}>Evidence gate: {payload.evidenceGate}</Text>
      {payload.rivers?.length ? <Text style={styles.rivers}>Rivers: {payload.rivers.join(' · ')}</Text> : null}
      <Text style={styles.guardrail}>{payload.guardrail}</Text>
    </Card>
  );
}

function clean(value: unknown): string { return typeof value === 'string' ? value : value == null ? '' : String(value); }
function asNumber(value: unknown): number | null { const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN; return Number.isFinite(n) ? n : null; }
function formatNumber(value: unknown): string { const n = asNumber(value); return n == null ? 'N/D' : n.toLocaleString('es-ES', { maximumFractionDigits: 2 }); }
function formatCompact(value: unknown): string { const n = asNumber(value); if (n == null) return 'N/D'; const abs = Math.abs(n); if (abs >= 1e12) return `${(n / 1e12).toFixed(2)}T`; if (abs >= 1e9) return `${(n / 1e9).toFixed(2)}B`; if (abs >= 1e6) return `${(n / 1e6).toFixed(2)}M`; return n.toLocaleString('es-ES', { maximumFractionDigits: 2 }); }

const styles = StyleSheet.create({
  heading: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  kicker: { color: t.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1.1 },
  title: { color: t.text, fontSize: 26, fontWeight: '900', marginTop: 4 },
  subtitle: { color: t.textMuted, fontSize: 12, lineHeight: 18, marginTop: 4 },
  searchBox: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, backgroundColor: t.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: t.border, borderRadius: 13, color: t.text, paddingHorizontal: 13, paddingVertical: 12, fontSize: 15, fontWeight: '800' },
  button: { backgroundColor: t.accent, borderRadius: 13, paddingHorizontal: 18, justifyContent: 'center' },
  buttonText: { color: '#07110E', fontWeight: '900', fontSize: 12 },
  pressed: { opacity: 0.65 },
  loading: { flexDirection: 'row', gap: 8, alignItems: 'center', padding: 10 },
  muted: { color: t.textMuted, fontSize: 11, lineHeight: 17 },
  error: { color: t.negative, backgroundColor: t.negativeSoft, padding: 12, borderRadius: 12 },
  symbol: { color: t.accent, fontSize: 13, fontWeight: '900', letterSpacing: 1 },
  company: { color: t.text, fontSize: 22, fontWeight: '900', marginTop: 4 },
  meta: { color: t.textMuted, fontSize: 11, marginTop: 4 },
  fallback: { color: t.warning, fontSize: 10, lineHeight: 15, marginTop: 7 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 9 },
  capexHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  capexName: { color: t.text, fontSize: 15, fontWeight: '900' },
  capexMeta: { color: t.textMuted, fontSize: 11, marginTop: 3 },
  evidence: { color: t.info, fontSize: 10, fontWeight: '800', marginTop: 10 },
  rivers: { color: t.textMuted, fontSize: 10, lineHeight: 15, marginTop: 5 },
  statusRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.borderSoft },
  lastRow: { borderBottomWidth: 0 },
  statusName: { color: t.text, fontSize: 11, fontWeight: '700' },
  guardrailTitle: { color: t.warning, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  guardrail: { color: t.textMuted, fontSize: 10, lineHeight: 16, marginTop: 5 },
});
