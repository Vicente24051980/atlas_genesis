import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { PortfolioPosition, PortfolioRepository } from '../db/repositories/PortfolioRepository';
import { AuditLogRepository } from '../db/repositories/AuditLogRepository';
import { createEventId } from '../core/createEventId';

const MAIN_PORTFOLIO_ID = 'PORTFOLIO-MAIN';

export default function PortfolioScreen() {
  const [items, setItems] = useState<PortfolioPosition[]>([]);
  const [metrics, setMetrics] = useState({ totalCostBasis: 0, activeCount: 0, totalCount: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ticker, setTicker] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [costBasis, setCostBasis] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    try {
      const [positions, summary] = await Promise.all([
        PortfolioRepository.getAll(),
        PortfolioRepository.getMetrics(),
      ]);
      setItems(positions);
      setMetrics(summary);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const savePosition = async () => {
    const normalizedTicker = ticker.trim().toUpperCase();
    const normalizedName = companyName.trim();
    const parsedQuantity = Number(quantity.replace(',', '.'));
    const parsedCost = costBasis.trim() ? Number(costBasis.replace(',', '.')) : null;

    if (!normalizedTicker || !normalizedName || !Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      setMessage('Ticker, empresa y una cantidad mayor que 0 son obligatorios.');
      return;
    }
    if (parsedCost !== null && (!Number.isFinite(parsedCost) || parsedCost < 0)) {
      setMessage('El coste medio debe ser un número válido.');
      return;
    }

    const existing = await PortfolioRepository.getByTicker(normalizedTicker);
    const id = existing?.id ?? createEventId(`POS-${normalizedTicker}`);

    await PortfolioRepository.upsert({
      id,
      portfolioId: MAIN_PORTFOLIO_ID,
      canonicalTicker: normalizedTicker,
      companyName: normalizedName,
      quantity: parsedQuantity,
      costBasis: parsedCost,
      status: 'ACTIVE',
      updatedAt: new Date(),
    });
    await AuditLogRepository.insert({
      id: createEventId('AUD'),
      action: existing ? 'PORTFOLIO_UPDATE' : 'PORTFOLIO_ADD',
      actor: 'USER',
      target: normalizedTicker,
      payloadHash: null,
      createdAt: new Date(),
    });

    setTicker('');
    setCompanyName('');
    setQuantity('');
    setCostBasis('');
    setMessage(existing ? `${normalizedTicker} actualizado.` : `${normalizedTicker} añadido al portfolio.`);
    await load();
  };

  const removePosition = async (item: PortfolioPosition) => {
    await PortfolioRepository.delete(item.id);
    await AuditLogRepository.insert({
      id: createEventId('AUD'),
      action: 'PORTFOLIO_DELETE',
      actor: 'USER',
      target: item.canonicalTicker,
      payloadHash: null,
      createdAt: new Date(),
    });
    setMessage(`${item.canonicalTicker} eliminado.`);
    await load();
  };

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={items}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} tintColor="#71b7ff" />}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>Portfolio</Text>
          <Text style={styles.subtitle}>Crea, actualiza y elimina posiciones. Todo queda guardado en SQLite.</Text>
          <View style={styles.metrics}>
            <Metric label="Activas" value={metrics.activeCount.toString()} />
            <Metric label="Total" value={metrics.totalCount.toString()} />
            <Metric label="Coste" value={`${metrics.totalCostBasis.toFixed(2)} €`} />
          </View>
          <View style={styles.form}>
            <Text style={styles.formTitle}>Añadir / actualizar posición</Text>
            <TextInput value={ticker} onChangeText={setTicker} autoCapitalize="characters" placeholder="Ticker (MSFT)" placeholderTextColor="#64748b" style={styles.input} />
            <TextInput value={companyName} onChangeText={setCompanyName} placeholder="Empresa" placeholderTextColor="#64748b" style={styles.input} />
            <View style={styles.inputRow}>
              <TextInput value={quantity} onChangeText={setQuantity} keyboardType="decimal-pad" placeholder="Cantidad" placeholderTextColor="#64748b" style={[styles.input, styles.half]} />
              <TextInput value={costBasis} onChangeText={setCostBasis} keyboardType="decimal-pad" placeholder="Coste medio €" placeholderTextColor="#64748b" style={[styles.input, styles.half]} />
            </View>
            <Pressable onPress={() => { void savePosition(); }} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
              <Text style={styles.buttonText}>Guardar posición</Text>
            </Pressable>
            {message ? <Text style={styles.message}>{message}</Text> : null}
          </View>
        </View>
      }
      ListEmptyComponent={loading ? <ActivityIndicator size="large" color="#71b7ff" style={styles.loader} /> : <Text style={styles.empty}>No hay posiciones. Añade la primera arriba.</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.ticker}>{item.canonicalTicker}</Text>
            <Text style={styles.status}>{item.status}</Text>
          </View>
          <Text style={styles.company}>{item.companyName}</Text>
          <Text style={styles.detail}>Cantidad: {item.quantity}</Text>
          <Text style={styles.detail}>Coste medio: {item.costBasis == null ? '—' : `${item.costBasis.toFixed(2)} €`}</Text>
          <Text style={styles.detail}>Capital invertido: {((item.costBasis ?? 0) * item.quantity).toFixed(2)} €</Text>
          <Pressable onPress={() => { void removePosition(item); }} style={styles.remove}><Text style={styles.removeText}>Eliminar posición</Text></Pressable>
        </View>
      )}
    />
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <View style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f14' },
  content: { padding: 16, gap: 10 },
  header: { gap: 6, marginBottom: 10 },
  title: { color: '#fff', fontSize: 26, fontWeight: '800' },
  subtitle: { color: '#94a3b8' },
  metrics: { flexDirection: 'row', gap: 8, marginTop: 10 },
  metric: { flex: 1, backgroundColor: '#141a22', borderRadius: 12, padding: 10 },
  metricValue: { color: '#fff', fontWeight: '800', fontSize: 16 },
  metricLabel: { color: '#94a3b8', fontSize: 11, marginTop: 3 },
  form: { backgroundColor: '#111923', borderRadius: 14, padding: 12, gap: 8, marginTop: 10, borderWidth: 1, borderColor: '#29405b' },
  formTitle: { color: '#fff', fontWeight: '800', fontSize: 15 },
  input: { backgroundColor: '#0f141b', color: '#fff', borderWidth: 1, borderColor: '#263241', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  inputRow: { flexDirection: 'row', gap: 8 },
  half: { flex: 1 },
  button: { backgroundColor: '#2f81f7', borderRadius: 10, padding: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '800' },
  pressed: { opacity: 0.7 },
  message: { color: '#9da9b7', fontSize: 12 },
  card: { backgroundColor: '#141a22', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#202b38' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  ticker: { color: '#71b7ff', fontSize: 18, fontWeight: '800' },
  status: { color: '#8ea2b8', fontSize: 12 },
  company: { color: '#fff', fontSize: 15, fontWeight: '600', marginTop: 5 },
  detail: { color: '#9da9b7', marginTop: 4 },
  remove: { alignSelf: 'flex-start', marginTop: 10, borderWidth: 1, borderColor: '#51323a', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7 },
  removeText: { color: '#f87171', fontWeight: '700', fontSize: 12 },
  empty: { color: '#8ea2b8', textAlign: 'center', padding: 40 },
  loader: { marginTop: 40 },
});
