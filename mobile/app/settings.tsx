import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, Text, View } from 'react-native';

import AtlasBrokerShell from '../components/AtlasBrokerShell';
import { Card, Pill, SectionHeader } from '../components/BrokerUi';
import { MobileApi, apiBaseUrl, type MobileHealth } from '../core/api/mobileApi';
import { BrokerApi, type BrokerStatus } from '../core/api/brokerApi';
import { brokerTheme as t } from '../ui/brokerTheme';

export default function SettingsScreen() {
  const [health, setHealth] = useState<MobileHealth | null>(null);
  const [broker, setBroker] = useState<BrokerStatus | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [healthResult, brokerResult] = await Promise.allSettled([MobileApi.health(), BrokerApi.status()]);
    setHealth(healthResult.status === 'fulfilled' ? healthResult.value : null);
    setBroker(brokerResult.status === 'fulfilled' ? brokerResult.value : null);
  }, []);
  useEffect(() => { void load(); }, [load]);
  const refresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  return (
    <AtlasBrokerShell active="more" title="Ajustes" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { void refresh(); }} tintColor={t.accent} />}>
      <Text style={styles.kicker}>SYSTEM STATUS</Text>
      <Text style={styles.title}>Estado y seguridad</Text>
      <Text style={styles.subtitle}>Configuración visible sin mostrar secretos.</Text>

      {!health && !broker ? <ActivityIndicator color={t.accent} /> : null}

      <SectionHeader title="Backend ATLAS" />
      <Card>
        <StatusRow label="Servicio" value={health?.service || 'No disponible'} state={health?.ok ? 'OK' : 'CHECK'} />
        <StatusRow label="API base" value={apiBaseUrl()} state="INFO" />
        <StatusRow label="Proveedor preferido" value={health?.preferred_provider || 'N/D'} state={health ? 'OK' : 'CHECK'} />
        <StatusRow label="FinancialData.Net" value={health?.financialdatanet_configured ? 'Configurado' : 'No configurado'} state={health?.financialdatanet_configured ? 'OK' : 'CHECK'} />
        <StatusRow label="Finnhub" value={health?.finnhub_configured ? 'Configurado' : 'No configurado'} state={health?.finnhub_configured ? 'OK' : 'CHECK'} last />
      </Card>

      <SectionHeader title="Broker Ω" />
      <Card>
        <StatusRow label="Provider" value={broker?.provider || 'Trading212'} state={broker ? 'OK' : 'CHECK'} />
        <StatusRow label="Entorno" value={broker?.environment || 'N/D'} state="INFO" />
        <StatusRow label="Credenciales" value={broker?.credentialsConfigured ? 'Server-side OK' : 'Pendientes'} state={broker?.credentialsConfigured ? 'OK' : 'CHECK'} />
        <StatusRow label="Lectura" value={broker?.readReady ? 'Lista' : 'Bloqueada'} state={broker?.readReady ? 'OK' : 'CHECK'} />
        <StatusRow label="Live execution" value={broker?.liveExecutionLocked === false ? 'Habilitada' : 'Bloqueada'} state={broker?.liveExecutionLocked === false ? 'WARN' : 'OK'} last />
      </Card>

      <SectionHeader title="Seguridad" />
      <Card><Text style={styles.security}>• La API key/secret de Trading 212 no se almacena en la APK.\n• El token de control se introduce en sesión y no aparece en pantalla.\n• La ejecución live y el análisis permanecen desacoplados.\n• ATLAS no rellena métricas ausentes con datos inventados.</Text></Card>
    </AtlasBrokerShell>
  );
}

function StatusRow({ label, value, state, last = false }: { label: string; value: string; state: 'OK' | 'CHECK' | 'INFO' | 'WARN'; last?: boolean }) {
  return <View style={[styles.row, last && styles.lastRow]}><View style={{ flex: 1 }}><Text style={styles.rowLabel}>{label}</Text><Text style={styles.rowValue}>{value}</Text></View><Pill label={state} tone={state === 'OK' ? 'positive' : state === 'INFO' ? 'info' : state === 'WARN' ? 'warning' : 'neutral'} /></View>;
}

const styles = StyleSheet.create({
  kicker: { color: t.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1.1 },
  title: { color: t.text, fontSize: 26, fontWeight: '900' },
  subtitle: { color: t.textMuted, fontSize: 12, lineHeight: 18 },
  row: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.borderSoft, paddingVertical: 9 },
  lastRow: { borderBottomWidth: 0 },
  rowLabel: { color: t.textMuted, fontSize: 10, fontWeight: '700' },
  rowValue: { color: t.text, fontSize: 12, fontWeight: '800', marginTop: 3 },
  security: { color: t.textMuted, fontSize: 11, lineHeight: 19 },
});
