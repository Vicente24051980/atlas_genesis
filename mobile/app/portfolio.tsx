import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MobileApi, PortfolioPayload } from '../core/api/mobileApi';

export default function PortfolioScreen() {
  const [portfolio, setPortfolio] = useState<PortfolioPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void MobileApi.portfolio()
      .then(setPortfolio)
      .catch((cause) => setError(cause instanceof Error ? cause.message : String(cause)));
  }, []);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>← Inicio</Text></Pressable>
      <Text style={styles.eyebrow}>PORTFOLIO Ω</Text>
      <Text style={styles.title}>Cartera 36</Text>
      <Text style={styles.subtitle}>Snapshot estructural de ATLAS. Toca un ticker para abrir su análisis. Esta pantalla es de lectura: no ejecuta órdenes ni cambia la cartera.</Text>

      {!portfolio && !error ? <View style={styles.loading}><ActivityIndicator color="#7dd3fc" /><Text style={styles.muted}>Cargando cartera…</Text></View> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {portfolio ? (
        <>
          <View style={styles.metaCard}>
            <Text style={styles.metaBig}>{portfolio.count}</Text>
            <View style={styles.metaTextWrap}><Text style={styles.metaTitle}>posiciones</Text><Text style={styles.metaSmall}>{portfolio.snapshotId}</Text></View>
          </View>

          <View style={styles.grid}>
            {portfolio.items.map(({ ticker }, index) => (
              <Pressable
                key={ticker}
                accessibilityRole="button"
                accessibilityLabel={`Abrir ${ticker}`}
                onPress={() => router.push({ pathname: '/analyze', params: { ticker } })}
                style={({ pressed }) => [styles.tickerCard, pressed && styles.pressed]}
              >
                <Text style={styles.rank}>{String(index + 1).padStart(2, '0')}</Text>
                <Text style={styles.ticker}>{ticker}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.guardrail}><Text style={styles.guardrailTitle}>GOBERNANZA</Text><Text style={styles.guardrailText}>{portfolio.guardrail}</Text></View>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#07090d' },
  content: { paddingTop: 54, paddingHorizontal: 18, paddingBottom: 44, gap: 12 },
  back: { alignSelf: 'flex-start', paddingVertical: 8, paddingRight: 14 },
  backText: { color: '#7dd3fc', fontWeight: '800' },
  eyebrow: { color: '#7dd3fc', fontWeight: '900', fontSize: 12, letterSpacing: 1.2 },
  title: { color: '#f8fafc', fontSize: 31, fontWeight: '900' },
  subtitle: { color: '#94a3b8', lineHeight: 21 },
  loading: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
  muted: { color: '#94a3b8' },
  error: { color: '#fca5a5', backgroundColor: '#241318', padding: 14, borderRadius: 14 },
  metaCard: { backgroundColor: '#0f141c', borderWidth: 1, borderColor: '#223047', borderRadius: 16, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 14 },
  metaBig: { color: '#f8fafc', fontSize: 34, fontWeight: '900' },
  metaTextWrap: { flex: 1 },
  metaTitle: { color: '#cbd5e1', fontWeight: '800' },
  metaSmall: { color: '#64748b', fontSize: 11, marginTop: 3 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  tickerCard: { width: '31.5%', minHeight: 76, backgroundColor: '#0c1118', borderRadius: 14, borderWidth: 1, borderColor: '#1e293b', padding: 11, justifyContent: 'space-between' },
  pressed: { opacity: 0.68 },
  rank: { color: '#475569', fontSize: 10, fontWeight: '800' },
  ticker: { color: '#f8fafc', fontSize: 16, fontWeight: '900' },
  guardrail: { backgroundColor: '#111827', borderRadius: 14, padding: 14, gap: 6 },
  guardrailTitle: { color: '#a5b4fc', fontWeight: '900', fontSize: 11, letterSpacing: 1 },
  guardrailText: { color: '#cbd5e1', lineHeight: 19 },
});
