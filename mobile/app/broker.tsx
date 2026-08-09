import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AtlasOnlineApi, BrokerStatus } from '../core/api/atlasOnlineApi';
import { createEventId } from '../core/createEventId';
import { db } from '../db/client';
import { auditLog, decisionLog } from '../db/schema';

function pretty(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

async function writeDecision(subjectId: string, decisionType: string, rationale: unknown): Promise<void> {
  await db.insert(decisionLog).values({
    id: createEventId('BRK-DEC'),
    subjectId,
    decisionType,
    rationale: pretty(rationale),
    evidenceRefsJson: '[]',
    createdAt: new Date(),
  });
}

async function writeAudit(action: string, target: string): Promise<void> {
  await db.insert(auditLog).values({
    id: createEventId('BRK-AUD'),
    action,
    actor: 'ATLAS_MOBILE_USER',
    target,
    payloadHash: null,
    createdAt: new Date(),
  });
}

async function safeLog(operation: () => Promise<void>): Promise<void> {
  try {
    await operation();
  } catch {
    // Broker execution must not be retried merely because local audit persistence failed.
  }
}

export default function BrokerScreen() {
  const router = useRouter();
  const [status, setStatus] = useState<BrokerStatus | null>(null);
  const [controlToken, setControlToken] = useState('');
  const [account, setAccount] = useState<unknown>(null);
  const [positions, setPositions] = useState<unknown>(null);
  const [orders, setOrders] = useState<unknown>(null);
  const [query, setQuery] = useState('AAPL');
  const [instruments, setInstruments] = useState<Record<string, unknown>[]>([]);
  const [ticker, setTicker] = useState('');
  const [quantity, setQuantity] = useState('0.01');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    void AtlasOnlineApi.brokerStatus().then(setStatus).catch((error) => setMessage(error instanceof Error ? error.message : String(error)));
  }, []);

  const confirmation = status?.mode === 'LIVE' ? 'EXECUTE_LIVE' : 'EXECUTE_DEMO';
  const liveLocked = status?.mode === 'LIVE' && !status.liveTradingEnabled;
  const canUsePrivate = Boolean(controlToken.trim() && status?.configured);
  const parsedQuantity = useMemo(() => Number(quantity.replace(',', '.')), [quantity]);

  async function refreshPrivate() {
    if (!canUsePrivate) return;
    setBusy(true);
    setMessage('');
    try {
      const [accountResult, positionResult, orderResult] = await Promise.all([
        AtlasOnlineApi.brokerAccount(controlToken),
        AtlasOnlineApi.brokerPositions(controlToken),
        AtlasOnlineApi.brokerOrders(controlToken),
      ]);
      setAccount(accountResult.data);
      setPositions(positionResult.data);
      setOrders(orderResult.data);
      setMessage('Cuenta Trading 212 sincronizada.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  async function searchInstrument() {
    if (!canUsePrivate || !query.trim()) return;
    setBusy(true);
    setMessage('');
    try {
      const result = await AtlasOnlineApi.brokerInstrumentSearch(query, controlToken);
      setInstruments(result.items);
      setMessage(`${result.count} instrumentos encontrados.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  async function placeOrder() {
    if (!canUsePrivate || !ticker.trim() || !Number.isFinite(parsedQuantity) || parsedQuantity === 0 || !status) return;
    const normalizedTicker = ticker.trim();
    const intent = {
      provider: 'Trading212',
      environment: status.environment,
      mode: status.mode,
      ticker: normalizedTicker,
      quantity: parsedQuantity,
      extendedHours: false,
      confirmation,
    };

    setBusy(true);
    setMessage('');
    await safeLog(() => writeDecision(normalizedTicker, 'BROKER_ORDER_INTENT', intent));
    await safeLog(() => writeAudit('BROKER_ORDER_INTENT', `${status.mode}:${normalizedTicker}`));

    try {
      const result = await AtlasOnlineApi.brokerMarketOrder({
        ticker: normalizedTicker,
        quantity: parsedQuantity,
        extended_hours: false,
        confirmation,
      }, controlToken);
      await safeLog(() => writeDecision(normalizedTicker, 'BROKER_ORDER_ACCEPTED', { intent, result }));
      await safeLog(() => writeAudit('BROKER_ORDER_ACCEPTED', `${status.mode}:${normalizedTicker}`));
      setMessage(`${status.mode} order accepted: ${pretty(result)}`);
      await refreshPrivate();
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      await safeLog(() => writeDecision(normalizedTicker, 'BROKER_ORDER_FAILED', { intent, error: detail }));
      await safeLog(() => writeAudit('BROKER_ORDER_FAILED', `${status.mode}:${normalizedTicker}`));
      setMessage(detail);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable>
        <View><Text style={styles.brand}>BROKER Ω</Text><Text style={styles.subbrand}>TRADING 212</Text></View>
      </View>

      <View style={[styles.card, status?.mode === 'LIVE' ? styles.liveCard : styles.paperCard]}>
        <Text style={styles.label}>ESTADO</Text>
        <Text style={styles.big}>{status ? `${status.mode} · ${status.environment.toUpperCase()}` : 'CARGANDO…'}</Text>
        <Text style={styles.muted}>{status?.configured ? 'Backend configurado' : 'Faltan credenciales/seguridad en el backend'}</Text>
        {liveLocked ? <Text style={styles.warning}>LIVE bloqueado por servidor. No puede enviar órdenes reales.</Text> : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>CONTROL TOKEN</Text>
        <TextInput
          value={controlToken}
          onChangeText={setControlToken}
          placeholder="Token privado del Broker Ω"
          placeholderTextColor="#526170"
          secureTextEntry
          autoCapitalize="none"
          style={styles.input}
        />
        <Text style={styles.small}>El token no está incluido en el APK. Debe coincidir con ATLAS_BROKER_CONTROL_TOKEN del servidor.</Text>
        <Pressable disabled={!canUsePrivate || busy} onPress={refreshPrivate} style={[styles.button, (!canUsePrivate || busy) && styles.disabled]}>
          <Text style={styles.buttonText}>SINCRONIZAR CUENTA</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>BUSCAR INSTRUMENTO T212</Text>
        <TextInput value={query} onChangeText={setQuery} autoCapitalize="characters" style={styles.input} />
        <Pressable disabled={!canUsePrivate || busy} onPress={searchInstrument} style={[styles.button, (!canUsePrivate || busy) && styles.disabled]}>
          <Text style={styles.buttonText}>BUSCAR</Text>
        </Pressable>
        {instruments.map((item, index) => {
          const itemTicker = String(item.ticker || '');
          return (
            <Pressable key={`${itemTicker}-${index}`} onPress={() => setTicker(itemTicker)} style={styles.instrument}>
              <Text style={styles.instrumentTicker}>{itemTicker || '—'}</Text>
              <Text style={styles.instrumentName}>{String(item.name || item.shortName || '')}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.card, styles.orderCard]}>
        <Text style={styles.label}>ORDEN MARKET</Text>
        <TextInput value={ticker} onChangeText={setTicker} placeholder="AAPL_US_EQ" placeholderTextColor="#526170" autoCapitalize="characters" style={styles.input} />
        <TextInput value={quantity} onChangeText={setQuantity} placeholder="0.01" placeholderTextColor="#526170" keyboardType="decimal-pad" style={styles.input} />
        <Text style={styles.small}>Cantidad positiva = compra. Cantidad negativa = venta. La API de Trading 212 usa cantidad de acciones, no importe monetario.</Text>
        <Text style={styles.confirm}>Confirmación automática del entorno: {confirmation}</Text>
        <Pressable disabled={!canUsePrivate || busy || liveLocked || !ticker.trim() || !Number.isFinite(parsedQuantity) || parsedQuantity === 0} onPress={placeOrder} style={[styles.execute, (!canUsePrivate || busy || liveLocked) && styles.disabled]}>
          <Text style={styles.executeText}>{status?.mode === 'LIVE' ? 'EJECUTAR ORDEN REAL' : 'EJECUTAR PAPER ORDER'}</Text>
        </Pressable>
      </View>

      {message ? <View style={styles.message}><Text style={styles.messageText}>{message}</Text></View> : null}

      <View style={styles.card}><Text style={styles.label}>CUENTA</Text><Text style={styles.json}>{account ? pretty(account) : 'Sin sincronizar'}</Text></View>
      <View style={styles.card}><Text style={styles.label}>POSICIONES</Text><Text style={styles.json}>{positions ? pretty(positions) : 'Sin sincronizar'}</Text></View>
      <View style={styles.card}><Text style={styles.label}>ÓRDENES PENDIENTES</Text><Text style={styles.json}>{orders ? pretty(orders) : 'Sin sincronizar'}</Text></View>

      <View style={styles.guardrail}>
        <Text style={styles.guardrailTitle}>GUARDRAIL Ω</Text>
        <Text style={styles.guardrailText}>La app no contiene las claves de Trading 212. Las credenciales viven en el backend. LIVE requiere una activación explícita del servidor y una confirmación específica en cada orden. Cada intento de orden queda registrado localmente en Decision Log Ω y Audit Log Ω sin guardar el control token.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#070b10' },
  content: { padding: 18, paddingBottom: 70, gap: 14 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  back: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#111922', alignItems: 'center', justifyContent: 'center' },
  backText: { color: '#b8cad9', fontSize: 30, lineHeight: 32 },
  brand: { color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: 1.2 },
  subbrand: { color: '#60778c', fontSize: 9, fontWeight: '900', letterSpacing: 1.5 },
  card: { backgroundColor: '#0e151d', borderWidth: 1, borderColor: '#20303f', borderRadius: 16, padding: 15, gap: 9 },
  paperCard: { borderColor: '#24513f', backgroundColor: '#0b1814' },
  liveCard: { borderColor: '#63313b', backgroundColor: '#1a1014' },
  orderCard: { borderColor: '#33475b' },
  label: { color: '#68c9ff', fontSize: 9, fontWeight: '900', letterSpacing: 1.4 },
  big: { color: '#f8fafc', fontSize: 25, fontWeight: '900' },
  muted: { color: '#8b9aaa', fontSize: 12 },
  warning: { color: '#ff9ca9', fontSize: 12, lineHeight: 18, fontWeight: '700' },
  input: { backgroundColor: '#080d13', color: '#eef5fb', borderWidth: 1, borderColor: '#263848', borderRadius: 11, paddingHorizontal: 12, paddingVertical: 12, fontSize: 14 },
  small: { color: '#718293', fontSize: 10, lineHeight: 15 },
  confirm: { color: '#b6cde0', fontSize: 11, fontWeight: '800' },
  button: { backgroundColor: '#17344a', borderWidth: 1, borderColor: '#2b6288', borderRadius: 11, padding: 13, alignItems: 'center' },
  buttonText: { color: '#bce6ff', fontSize: 11, fontWeight: '900', letterSpacing: 0.8 },
  execute: { backgroundColor: '#1b4a34', borderWidth: 1, borderColor: '#34765a', borderRadius: 11, padding: 14, alignItems: 'center' },
  executeText: { color: '#c7f9df', fontSize: 11, fontWeight: '900', letterSpacing: 0.8 },
  disabled: { opacity: 0.35 },
  instrument: { backgroundColor: '#0a1016', borderWidth: 1, borderColor: '#1b2b39', borderRadius: 10, padding: 10 },
  instrumentTicker: { color: '#d9eefc', fontWeight: '900', fontSize: 12 },
  instrumentName: { color: '#74879a', fontSize: 10, marginTop: 3 },
  message: { backgroundColor: '#101b25', borderWidth: 1, borderColor: '#29465d', borderRadius: 12, padding: 12 },
  messageText: { color: '#b8d6e9', fontSize: 11, lineHeight: 17 },
  json: { color: '#9eb0c0', fontFamily: 'monospace', fontSize: 10, lineHeight: 15 },
  guardrail: { backgroundColor: '#17170c', borderWidth: 1, borderColor: '#49451f', borderRadius: 14, padding: 14 },
  guardrailTitle: { color: '#d2c86d', fontSize: 9, fontWeight: '900', letterSpacing: 1.3 },
  guardrailText: { color: '#9b9564', fontSize: 11, lineHeight: 17, marginTop: 6 },
});
