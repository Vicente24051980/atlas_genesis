import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import AtlasBrokerShell from '../components/AtlasBrokerShell';
import { Card, EmptyState, Pill, SectionHeader } from '../components/BrokerUi';
import { BrokerApi, type BrokerEnvelope, type BrokerStatus } from '../core/api/brokerApi';
import { brokerTheme as t } from '../ui/brokerTheme';

export default function OrdersScreen() {
  const [status, setStatus] = useState<BrokerStatus | null>(null);
  const [token, setToken] = useState('');
  const [orders, setOrders] = useState<BrokerEnvelope | null>(null);
  const [history, setHistory] = useState<BrokerEnvelope | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { void BrokerApi.status().then(setStatus).catch(() => undefined); }, []);

  const load = async () => {
    if (!token.trim()) { setError('Introduce el token de control ATLAS Broker.'); return; }
    setLoading(true); setError('');
    const [ordersResult, historyResult] = await Promise.allSettled([BrokerApi.orders(token), BrokerApi.historyOrders(token, 20)]);
    setOrders(ordersResult.status === 'fulfilled' ? ordersResult.value : null);
    setHistory(historyResult.status === 'fulfilled' ? historyResult.value : null);
    if (ordersResult.status === 'rejected' && historyResult.status === 'rejected') setError('No se pudieron consultar las órdenes.');
    setLoading(false);
  };

  return (
    <AtlasBrokerShell active="more" title="Órdenes" keyboardShouldPersistTaps="handled">
      <View style={styles.heading}><View style={{ flex: 1 }}><Text style={styles.kicker}>BROKER Ω</Text><Text style={styles.title}>Órdenes</Text><Text style={styles.subtitle}>Lectura de pendientes e historial. La ejecución live continúa gobernada por el backend.</Text></View><Pill label={status?.mode || 'CHECK'} tone={status?.mode === 'PAPER' ? 'positive' : 'warning'} /></View>

      <Card>
        <Text style={styles.label}>TOKEN DE CONTROL</Text>
        <TextInput value={token} onChangeText={setToken} secureTextEntry autoCapitalize="none" autoCorrect={false} placeholder="ATLAS_BROKER_CONTROL_TOKEN" placeholderTextColor={t.textFaint} style={styles.input} />
        <Pressable onPress={() => { void load(); }} style={({ pressed }) => [styles.button, pressed && styles.pressed]}><Text style={styles.buttonText}>Sincronizar órdenes</Text></Pressable>
      </Card>
      {loading ? <ActivityIndicator color={t.accent} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <SectionHeader title="Pendientes" />
      {orders ? <DataList value={orders.data} empty="No hay órdenes pendientes." /> : <EmptyState title="Sin sincronizar" text="Introduce el token para consultar Trading 212 desde el bridge server-side." />}

      <SectionHeader title="Historial" />
      {history ? <DataList value={history.data} empty="Sin historial devuelto por el broker." /> : <EmptyState title="Historial protegido" text="Se carga junto con las órdenes pendientes." />}
    </AtlasBrokerShell>
  );
}

function DataList({ value, empty }: { value: unknown; empty: string }) {
  const rows = Array.isArray(value) ? value : value && typeof value === 'object' && Array.isArray((value as Record<string, unknown>).items) ? (value as Record<string, unknown>).items as unknown[] : [];
  if (!rows.length) return <EmptyState title="Vacío" text={empty} />;
  return <Card>{rows.slice(0, 20).map((row, index) => <View key={index} style={styles.orderRow}><Text style={styles.orderTitle}>{extract(row, ['ticker','instrument','type','status']) || `Orden ${index + 1}`}</Text><Text style={styles.orderMeta}>{compact(row)}</Text></View>)}</Card>;
}

function extract(value: unknown, keys: string[]): string {
  if (!value || typeof value !== 'object') return '';
  const row = value as Record<string, unknown>;
  for (const key of keys) if (row[key] != null) return String(row[key]);
  return '';
}

function compact(value: unknown): string {
  try { const text = JSON.stringify(value); return text.length > 240 ? `${text.slice(0, 240)}…` : text; }
  catch { return String(value); }
}

const styles = StyleSheet.create({
  heading: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  kicker: { color: t.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1.1 },
  title: { color: t.text, fontSize: 26, fontWeight: '900', marginTop: 4 },
  subtitle: { color: t.textMuted, fontSize: 12, lineHeight: 18, marginTop: 4 },
  label: { color: t.textFaint, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  input: { marginTop: 8, backgroundColor: t.surfaceSoft, borderWidth: StyleSheet.hairlineWidth, borderColor: t.border, borderRadius: 12, color: t.text, paddingHorizontal: 12, paddingVertical: 12 },
  button: { marginTop: 9, backgroundColor: t.accent, borderRadius: 12, alignItems: 'center', paddingVertical: 13 },
  buttonText: { color: '#07110E', fontWeight: '900', fontSize: 12 },
  pressed: { opacity: 0.65 },
  error: { color: t.negative, backgroundColor: t.negativeSoft, padding: 12, borderRadius: 12 },
  orderRow: { paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.borderSoft },
  orderTitle: { color: t.text, fontWeight: '800', fontSize: 12 },
  orderMeta: { color: t.textMuted, fontSize: 10, lineHeight: 15, marginTop: 4 },
});
