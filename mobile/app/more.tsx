import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import AtlasBottomNav from '../components/AtlasBottomNav';
import { AtlasOnlineApi, atlasApiBaseUrl, type AtlasHealth, type TrackedUniverse } from '../core/api/atlasOnlineApi';

const ITEMS = [
  { code: 'ENG', title: 'Motores ATLAS Ω', subtitle: 'Registro, estados y pipeline completo', route: '/engines' },
  { code: 'MKT', title: 'Mercados Ω', subtitle: 'Índices, sectores, oro, petróleo, dólar, duración y crédito', route: '/market' },
  { code: 'NWS', title: 'News Ω', subtitle: 'Noticias por ticker y catalizadores', route: '/news' },
  { code: 'BRK', title: 'Broker Ω', subtitle: 'Trading 212 · conexión y guardrails', route: '/broker' },
] as const;

export default function MoreScreen() {
  const router = useRouter();
  const [health, setHealth] = useState<AtlasHealth | null>(null);
  const [universe, setUniverse] = useState<TrackedUniverse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    void Promise.allSettled([AtlasOnlineApi.health(), AtlasOnlineApi.atlasUniverse()]).then(([healthResult, universeResult]) => {
      if (!active) return;
      if (healthResult.status === 'fulfilled') setHealth(healthResult.value);
      if (universeResult.status === 'fulfilled') setUniverse(universeResult.value);
      if (healthResult.status === 'rejected' && universeResult.status === 'rejected') setError('Backend ATLAS no disponible.');
    });
    return () => { active = false; };
  }, []);

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>ATLAS Ω MOBILE</Text>
        <Text style={styles.title}>Más</Text>
        <Text style={styles.subtitle}>Motores, proveedores, broker y estado operativo. Sin formularios de métricas manuales.</Text>

        <View style={styles.statusCard}>
          <View style={styles.statusTop}><Text style={styles.statusTitle}>SISTEMA</Text><Text style={[styles.statusBadge, health?.ok ? styles.ok : styles.bad]}>{health?.ok ? 'ONLINE' : 'NO VERIFICADO'}</Text></View>
          <StatusRow label="Backend" value={atlasApiBaseUrl()} />
          <StatusRow label="API" value={health?.version || '—'} />
          <StatusRow label="Finnhub" value={health?.finnhub_configured ? 'CONFIGURADO' : 'NO CONFIGURADO'} />
          <StatusRow label="Trading 212" value={health?.broker_configured ? `${(health.broker_environment || 'demo').toUpperCase()} · CONFIGURADO` : 'NO CONFIGURADO'} />
          <StatusRow label="LIVE trading" value={health?.broker_live_enabled ? 'HABILITADO' : 'BLOQUEADO'} />
          <StatusRow label="Cartera / Watchlist" value={universe ? `${universe.counts.portfolio} / ${universe.counts.watchlist}` : '—'} />
        </View>

        {universe?.status === 'AWAITING_USER_CONFIRMATION' ? (
          <View style={styles.warning}>
            <Text style={styles.warningTitle}>UNIVERSO BOOTSTRAP</Text>
            <Text style={styles.warningText}>La estructura está preparada para cargar cartera y watchlist desde servidor sin reconstruir el APK. El snapshot actual todavía exige confirmación exacta del usuario antes de etiquetarlo como definitivo.</Text>
          </View>
        ) : null}

        {ITEMS.map((item) => (
          <Pressable key={item.code} accessibilityRole="button" accessibilityLabel={`Abrir ${item.title}`} onPress={() => router.push(item.route)} style={({ pressed }) => [styles.item, pressed && styles.pressed]}>
            <View style={styles.codeBox}><Text style={styles.code}>{item.code}</Text></View>
            <View style={styles.flex}><Text style={styles.itemTitle}>{item.title}</Text><Text style={styles.itemSub}>{item.subtitle}</Text></View>
            <Text style={styles.arrow}>›</Text>
          </Pressable>
        ))}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.core}><Text style={styles.coreTitle}>CORE-00</Text><Text style={styles.coreText}>El runtime epistemológico permanece congelado. La app móvil añade superficies operativas; no cambia los invariantes de evidencia, incertidumbre ni soberanía del usuario.</Text></View>
      </ScrollView>
      <AtlasBottomNav active="more" />
    </View>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return <View style={styles.statusRow}><Text style={styles.statusLabel}>{label}</Text><Text style={styles.statusValue} numberOfLines={1}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#050708' }, scroll: { flex: 1 }, content: { padding: 18, paddingBottom: 38, gap: 11 }, flex: { flex: 1 }, pressed: { opacity: 0.58 },
  eyebrow: { color: '#68c9ef', fontSize: 9, fontWeight: '900', letterSpacing: 1.4, marginTop: 6 }, title: { color: '#f5f7f8', fontSize: 32, fontWeight: '900' }, subtitle: { color: '#87939e', fontSize: 12, lineHeight: 18 },
  statusCard: { borderRadius: 16, borderWidth: 1, borderColor: '#2b3b46', backgroundColor: '#0c1216', padding: 14 }, statusTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }, statusTitle: { color: '#70ccef', fontSize: 9, fontWeight: '900', letterSpacing: 1.2 }, statusBadge: { fontSize: 8, fontWeight: '900' }, ok: { color: '#3ed89d' }, bad: { color: '#ff788a' }, statusRow: { minHeight: 37, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#283038' }, statusLabel: { color: '#75828c', fontSize: 10 }, statusValue: { color: '#d7dde1', fontSize: 10, fontWeight: '800', maxWidth: '65%', textAlign: 'right' },
  warning: { borderRadius: 13, borderWidth: 1, borderColor: '#5d4b22', backgroundColor: '#181307', padding: 13 }, warningTitle: { color: '#e1bc62', fontSize: 9, fontWeight: '900' }, warningText: { color: '#9f8d5c', fontSize: 10, lineHeight: 15, marginTop: 5 },
  item: { minHeight: 78, flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, borderWidth: 1, borderColor: '#232d34', backgroundColor: '#0c1013', padding: 12 }, codeBox: { width: 43, height: 43, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#101b22', borderWidth: 1, borderColor: '#29404e' }, code: { color: '#6fcbee', fontSize: 9, fontWeight: '900' }, itemTitle: { color: '#eef2f4', fontSize: 15, fontWeight: '900' }, itemSub: { color: '#75818b', fontSize: 10, marginTop: 4 }, arrow: { color: '#557183', fontSize: 28 },
  error: { color: '#e28c98', fontSize: 10, textAlign: 'center' }, core: { borderRadius: 13, borderWidth: 1, borderColor: '#334525', backgroundColor: '#0e150b', padding: 13 }, coreTitle: { color: '#a7bc76', fontSize: 9, fontWeight: '900' }, coreText: { color: '#82916d', fontSize: 10, lineHeight: 15, marginTop: 5 },
});
