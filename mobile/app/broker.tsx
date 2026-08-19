import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';

import AtlasBrokerShell from '../components/AtlasBrokerShell';
import { Card, EmptyState, InstrumentRow, MetricTile, Pill, SectionHeader } from '../components/BrokerUi';
import { BrokerApi, type BrokerEnvelope, type BrokerStatus } from '../core/api/brokerApi';
import { brokerTheme as t } from '../ui/brokerTheme';

export default function BrokerScreen() {
  const [status, setStatus] = useState<BrokerStatus | null>(null);
  const [token, setToken] = useState('');
  const [account, setAccount] = useState<BrokerEnvelope | null>(null);
  const [positions, setPositions] = useState<BrokerEnvelope | null>(null);
  const [orders, setOrders] = useState<BrokerEnvelope | null>(null);
  const [query, setQuery] = useState('');
  const [instruments, setInstruments] = useState<BrokerEnvelope | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    void BrokerApi.status()
      .then((value) => { if (active) setStatus(value); })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : String(cause)); });
    return () => { active = false; };
  }, []);

  const sync = async () => {
    const controlToken = token.trim();
    if (!controlToken) { setError('Introduce el token de control ATLAS Broker configurado en el servidor.'); return; }
    setLoading(true); setError('');
    try {
      const [accountResult, positionsResult, ordersResult] = await Promise.allSettled([
        BrokerApi.account(controlToken),
        BrokerApi.positions(controlToken),
        BrokerApi.orders(controlToken),
      ]);
      setAccount(accountResult.status === 'fulfilled' ? accountResult.value : null);
      setPositions(positionsResult.status === 'fulfilled' ? positionsResult.value : null);
      setOrders(ordersResult.status === 'fulfilled' ? ordersResult.value : null);
      const messages = [accountResult, positionsResult, ordersResult].flatMap((item) => item.status === 'rejected' ? [item.reason instanceof Error ? item.reason.message : String(item.reason)] : []);
      if (messages.length) setError(messages.join('\n'));
    } finally {
      setLoading(false);
    }
  };

  const search = async () => {
    const controlToken = token.trim();
    const instrumentQuery = query.trim();
    if (!controlToken) { setError('Introduce primero el token de control ATLAS Broker.'); return; }
    if (!instrumentQuery) { setError('Introduce un ticker o instrumento para buscar.'); return; }
    setLoading(true); setError('');
    try { setInstruments(await BrokerApi.instruments(controlToken, instrumentQuery)); }
    catch (cause) { setInstruments(null); setError(cause instanceof Error ? cause.message : String(cause)); }
    finally { setLoading(false); }
  };

  const accountRow = asRecord(account?.data);
  const positionRows = asArray(positions?.data);
  const orderRows = asArray(orders?.data);

  return (
    <AtlasBrokerShell active="more" title="Broker Ω" keyboardShouldPersistTaps="handled">
      <View style={styles.heading}>
        <View style={{ flex: 1 }}><Text style={styles.kicker}>TRADING 212 BRIDGE</Text><Text style={styles.title}>Cuenta conectada</Text><Text style={styles.subtitle}>Credenciales en servidor. La APK solo usa el token de control del bridge.</Text></View>
        <Pill label={status?.environment?.toUpperCase() || 'CHECK'} tone={status?.readReady ? 'positive' : 'warning'} />
      </View>

      <View style={styles.metrics}>
        <MetricTile label="Bridge" value={status ? 'ONLINE' : '—'} tone={status ? 'positive' : 'default'} />
        <MetricTile label="Lectura" value={status?.readReady ? 'READY' : 'LOCKED'} tone={status?.readReady ? 'positive' : 'default'} />
        <MetricTile label="Modo" value={status?.mode || '—'} tone="info" />
        <MetricTile label="Live execution" value={status?.liveExecutionLocked === false ? 'ON' : 'OFF'} tone={status?.liveExecutionLocked === false ? 'negative' : 'positive'} />
      </View>

      <Card>
        <Text style={styles.label}>ACCESO PRIVADO</Text>
        <TextInput accessibilityLabel="Token de control ATLAS Broker" value={token} onChangeText={setToken} secureTextEntry autoCapitalize="none" autoCorrect={false} placeholder="ATLAS_BROKER_CONTROL_TOKEN" placeholderTextColor={t.textFaint} style={styles.input} />
        <Pressable accessibilityRole="button" accessibilityLabel="Sincronizar cuenta Trading 212" disabled={loading} onPress={() => { void sync(); }} style={({ pressed }) => [styles.primaryButton, (pressed || loading) && styles.pressed]}><Text style={styles.primaryText}>Sincronizar cuenta</Text></Pressable>
      </Card>

      {loading ? <View accessibilityLiveRegion="polite" style={styles.loading}><ActivityIndicator color={t.accent} /><Text style={styles.muted}>Consultando Trading 212…</Text></View> : null}
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}

      <SectionHeader title="Resumen de cuenta" />
      {account ? (
        <View style={styles.metrics}>
          {summaryMetric(accountRow, ['total','totalValue','value','accountValue'], 'Valor cuenta')}
          {summaryMetric(accountRow, ['free','freeFunds','cash','availableToTrade'], 'Disponible')}
          {summaryMetric(accountRow, ['invested','investedValue'], 'Invertido')}
          {summaryMetric(accountRow, ['ppl','result','profitLoss'], 'Resultado')}
        </View>
      ) : <EmptyState title="Cuenta protegida" text="Sincroniza con el token de control para ver los datos reales que devuelve Trading 212." />}

      <SectionHeader title={`Posiciones${positionRows.length ? ` · ${positionRows.length}` : ''}`} action="Cartera ATLAS" onAction={() => router.push('/portfolio')} />
      {positions ? <Card style={styles.listCard}>{positionRows.length ? positionRows.slice(0, 60).map((row, index) => <BrokerPosition key={`${getText(row, ['ticker','instrumentCode','symbol'])}-${index}`} row={row} />) : <Text style={styles.muted}>Trading 212 no devolvió posiciones.</Text>}</Card> : <EmptyState title="Sin posiciones sincronizadas" text="La app no sustituye estos datos por el snapshot ATLAS; son capas distintas." />}

      <SectionHeader title={`Órdenes pendientes${orderRows.length ? ` · ${orderRows.length}` : ''}`} action="Historial" onAction={() => router.push('/orders')} />
      {orders ? <Card>{orderRows.length ? orderRows.slice(0, 20).map((row, index) => <View key={index} style={styles.rawRow}><Text style={styles.rawTitle}>{getText(row, ['ticker','instrumentCode','type','status']) || `Orden ${index + 1}`}</Text><Text style={styles.rawText}>{compact(row)}</Text></View>) : <Text style={styles.muted}>Sin órdenes pendientes.</Text>}</Card> : <EmptyState title="Órdenes protegidas" text="Se cargan con la sincronización privada." />}

      <SectionHeader title="Buscar instrumento T212" />
      <Card>
        <View style={styles.searchRow}><TextInput accessibilityLabel="Buscar instrumento Trading 212" value={query} onChangeText={setQuery} placeholder="AAPL / ASML / TSM" placeholderTextColor={t.textFaint} autoCapitalize="characters" autoCorrect={false} returnKeyType="search" onSubmitEditing={() => { void search(); }} style={[styles.input, styles.searchInput]} /><Pressable accessibilityRole="button" accessibilityLabel="Buscar instrumento Trading 212" disabled={loading} onPress={() => { void search(); }} style={({ pressed }) => [styles.searchButton, (pressed || loading) && styles.pressed]}><Text style={styles.searchButtonText}>Buscar</Text></Pressable></View>
        {instruments ? <BrokerInstrumentResults value={instruments.data} /> : null}
      </Card>

      <Card><Text style={styles.guardrailTitle}>EXECUTION GUARDRAIL</Text><Text style={styles.guardrail}>La infraestructura de órdenes existe en el backend, pero esta vista mantiene la ejecución separada de análisis y señales. LIVE sigue bloqueado salvo habilitación explícita del servidor.</Text></Card>
    </AtlasBrokerShell>
  );
}

function BrokerPosition({ row }: { row: Record<string, unknown> }) {
  const brokerTicker = getText(row, ['ticker','instrumentCode','symbol']) || 'T212';
  const quantity = getNumber(row, ['quantity','qty']);
  const current = getNumber(row, ['currentPrice','price']);
  const ppl = getNumber(row, ['ppl','result','profitLoss']);
  const analysisTicker = resolveAnalysisTicker(row);
  return <InstrumentRow ticker={brokerTicker} name={quantity == null ? 'Posición Trading 212' : `${quantity} acciones`} meta={ppl == null ? 'Broker verified' : `P/L ${formatMoney(ppl)}`} value={current == null ? undefined : current.toFixed(2)} onPress={analysisTicker ? () => router.push({ pathname: '/analyze', params: { ticker: analysisTicker } }) : undefined} />;
}

function BrokerInstrumentResults({ value }: { value: unknown }) {
  const rows = asArray(value);
  if (!rows.length) return <Text style={styles.muted}>Sin coincidencias.</Text>;
  return <View style={{ marginTop: 8 }}>{rows.slice(0, 15).map((row, index) => {
    const ticker = getText(row, ['ticker','symbol','instrumentCode']) || `#${index + 1}`;
    const analysisTicker = resolveAnalysisTicker(row);
    return <InstrumentRow key={`${ticker}-${index}`} ticker={ticker} name={getText(row, ['name','shortName']) || 'Trading 212'} meta={getText(row, ['exchange','currency','type']) || 'Instrumento'} onPress={analysisTicker ? () => router.push({ pathname: '/analyze', params: { ticker: analysisTicker } }) : undefined} />;
  })}</View>;
}

function resolveAnalysisTicker(row: Record<string, unknown>): string | null {
  const direct = getText(row, ['ticker','symbol']).trim();
  if (direct && /^[A-Z0-9.-]{1,20}$/i.test(direct)) return direct.toUpperCase();
  const instrumentCode = getText(row, ['instrumentCode']).trim();
  if (!instrumentCode) return null;
  const candidate = instrumentCode.split('_')[0]?.trim();
  return candidate && /^[A-Z0-9.-]{1,20}$/i.test(candidate) ? candidate.toUpperCase() : null;
}

function summaryMetric(row: Record<string, unknown>, keys: string[], label: string) {
  const value = getNumber(row, keys);
  return <MetricTile label={label} value={value == null ? 'N/D' : formatMoney(value)} />;
}
function asRecord(value: unknown): Record<string, unknown> { return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
function asArray(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object');
  if (value && typeof value === 'object') {
    const row = value as Record<string, unknown>;
    for (const key of ['items','positions','orders','data']) if (Array.isArray(row[key])) return (row[key] as unknown[]).filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object');
  }
  return [];
}
function getText(row: Record<string, unknown>, keys: string[]): string { for (const key of keys) if (row[key] != null) return String(row[key]); return ''; }
function getNumber(row: Record<string, unknown>, keys: string[]): number | null { for (const key of keys) { const value = row[key]; const num = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN; if (Number.isFinite(num)) return num; } return null; }
function formatMoney(value: number): string { return value.toLocaleString('es-ES', { maximumFractionDigits: 2 }); }
function compact(value: unknown): string { try { const text = JSON.stringify(value); return text.length > 220 ? `${text.slice(0, 220)}…` : text; } catch { return String(value); } }

const styles = StyleSheet.create({
  heading: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  kicker: { color: t.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1.1 },
  title: { color: t.text, fontSize: 26, fontWeight: '900', marginTop: 4 },
  subtitle: { color: t.textMuted, fontSize: 12, lineHeight: 18, marginTop: 4 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  label: { color: t.textFaint, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  input: { marginTop: 8, backgroundColor: t.surfaceSoft, borderWidth: StyleSheet.hairlineWidth, borderColor: t.border, borderRadius: 12, color: t.text, paddingHorizontal: 12, paddingVertical: 12 },
  primaryButton: { marginTop: 9, backgroundColor: t.accent, borderRadius: 12, alignItems: 'center', paddingVertical: 13 },
  primaryText: { color: '#07110E', fontWeight: '900', fontSize: 12 },
  pressed: { opacity: 0.65 },
  loading: { flexDirection: 'row', gap: 8, alignItems: 'center', padding: 10 },
  muted: { color: t.textMuted, fontSize: 11, lineHeight: 17 },
  error: { color: t.negative, backgroundColor: t.negativeSoft, padding: 12, borderRadius: 12 },
  listCard: { paddingTop: 2, paddingBottom: 2 },
  rawRow: { paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.borderSoft },
  rawTitle: { color: t.text, fontWeight: '800', fontSize: 12 },
  rawText: { color: t.textMuted, fontSize: 10, lineHeight: 15, marginTop: 4 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchInput: { flex: 1, marginTop: 0 },
  searchButton: { backgroundColor: t.surfaceRaised, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, borderWidth: StyleSheet.hairlineWidth, borderColor: t.border },
  searchButtonText: { color: t.accent, fontWeight: '800', fontSize: 11 },
  guardrailTitle: { color: t.warning, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  guardrail: { color: t.textMuted, fontSize: 11, lineHeight: 17, marginTop: 6 },
});
