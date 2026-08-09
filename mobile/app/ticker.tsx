import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import {
  AtlasOnlineApi,
  type CompanyBundle,
  type MarketQuote,
} from '../core/api/atlasOnlineApi';

export default function TickerDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ symbol?: string | string[] }>();
  const symbol = Array.isArray(params.symbol) ? params.symbol[0] : params.symbol;
  const normalized = (symbol || '').trim().toUpperCase();
  const [quote, setQuote] = useState<MarketQuote | null>(null);
  const [bundle, setBundle] = useState<CompanyBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    if (!normalized) {
      setError('Ticker no válido.');
      setLoading(false);
      return () => { active = false; };
    }

    setLoading(true);
    setError('');
    void Promise.allSettled([
      AtlasOnlineApi.marketQuote(normalized),
      AtlasOnlineApi.company(normalized),
    ]).then((results) => {
      if (!active) return;
      const marketResult = results[0];
      const companyResult = results[1];
      if (marketResult.status === 'fulfilled') setQuote(marketResult.value);
      if (companyResult.status === 'fulfilled') setBundle(companyResult.value);
      if (marketResult.status === 'rejected' && companyResult.status === 'rejected') {
        const cause = marketResult.reason;
        setError(cause instanceof Error ? cause.message : String(cause));
      }
      setLoading(false);
    });

    return () => { active = false; };
  }, [normalized]);

  const price = quote?.price ?? numberValue(bundle?.quote.c);
  const pct = quote?.changePct ?? numberValue(bundle?.quote.dp);
  const positive = (pct ?? 0) >= 0;
  const companyName = quote?.name || stringValue(bundle?.profile.name) || normalized;
  const sector = quote?.sector || stringValue(bundle?.profile.finnhubIndustry) || 'Mercado';

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topRow}>
          <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <View style={styles.symbolPill}><Text style={styles.symbolPillText}>{normalized || '—'}</Text></View>
          <Pressable accessibilityRole="button" accessibilityLabel="Abrir ATLAS Ω" onPress={() => router.push('/overview')} style={styles.atlasButton}>
            <Text style={styles.atlasButtonText}>ATLAS Ω</Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.loading}><ActivityIndicator size="large" color="#25c991" /><Text style={styles.loadingText}>Cargando {normalized}…</Text></View>
        ) : null}

        {error ? <View style={styles.error}><Text style={styles.errorTitle}>SIN DATOS</Text><Text style={styles.errorText}>{error}</Text></View> : null}

        {!loading && (quote || bundle) ? (
          <>
            <View style={styles.identityRow}>
              <View style={styles.logoCircle}><Text style={styles.logoText}>{normalized.slice(0, 2)}</Text></View>
              <View style={styles.flex}>
                <Text style={styles.companyName}>{companyName}</Text>
                <Text style={styles.companyMeta}>{normalized} · {sector}</Text>
              </View>
            </View>

            <Text style={styles.price}>{formatNumber(price)}</Text>
            <View style={styles.changeRow}>
              <Text style={[styles.changeValue, positive ? styles.positive : styles.negative]}>{formatSigned(quote?.change)}</Text>
              <Text style={[styles.changePct, positive ? styles.positive : styles.negative]}>{formatPct(pct)}</Text>
              <Text style={styles.closeLabel}>último dato disponible</Text>
            </View>

            <View style={styles.rangeCard}>
              <View style={styles.rangeTop}>
                <Text style={styles.rangeTitle}>SESIÓN</Text>
                <Text style={styles.rangeSource}>{quote?.source || bundle?.source || 'ATLAS'}</Text>
              </View>
              <View style={styles.rangeTrack}>
                <View style={[styles.rangeFill, { width: `${rangePosition(price, quote?.low, quote?.high)}%` }]} />
              </View>
              <View style={styles.rangeLabels}>
                <Text style={styles.rangeText}>Mín {formatNumber(quote?.low ?? numberValue(bundle?.quote.l))}</Text>
                <Text style={styles.rangeText}>Máx {formatNumber(quote?.high ?? numberValue(bundle?.quote.h))}</Text>
              </View>
            </View>

            <View style={styles.periods}>
              {['1D', '5D', '1M', '3M', 'YTD', '1A', '5A'].map((period, index) => (
                <View key={period} style={[styles.period, index === 0 && styles.periodActive]}>
                  <Text style={[styles.periodText, index === 0 && styles.periodTextActive]}>{period}</Text>
                </View>
              ))}
            </View>

            <View style={styles.panel}>
              <Text style={styles.panelTitle}>DATOS DE MERCADO</Text>
              <MetricRow label="Apertura" value={formatNumber(quote?.open ?? numberValue(bundle?.quote.o))} />
              <MetricRow label="Cierre anterior" value={formatNumber(quote?.previousClose ?? numberValue(bundle?.quote.pc))} />
              <MetricRow label="Máximo" value={formatNumber(quote?.high ?? numberValue(bundle?.quote.h))} />
              <MetricRow label="Mínimo" value={formatNumber(quote?.low ?? numberValue(bundle?.quote.l))} />
              <MetricRow label="Volumen" value={formatCompact(quote?.volume)} />
              <MetricRow label="Fecha" value={quote?.asOfDate || bundle?.generatedAt || '—'} />
            </View>

            {bundle ? (
              <View style={styles.panel}>
                <Text style={styles.panelTitle}>ATLAS · PERFIL</Text>
                <MetricRow label="País" value={stringValue(bundle.profile.country) || '—'} />
                <MetricRow label="Bolsa" value={stringValue(bundle.profile.exchange) || '—'} />
                <MetricRow label="Moneda" value={stringValue(bundle.profile.currency) || '—'} />
                <MetricRow label="Industria" value={stringValue(bundle.profile.finnhubIndustry) || sector} />
                <MetricRow label="Capitalización" value={formatCompact(numberValue(bundle.profile.marketCapitalization))} />
              </View>
            ) : (
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>ATLAS FUNDAMENTALS</Text>
                <Text style={styles.infoText}>El precio funciona con el proveedor de mercado de respaldo. Perfil, métricas y noticias se completarán cuando el proveedor fundamental esté configurado.</Text>
              </View>
            )}

            {bundle?.news?.length ? (
              <View style={styles.panel}>
                <Text style={styles.panelTitle}>NOTICIAS</Text>
                {bundle.news.slice(0, 5).map((item, index) => (
                  <View key={`${stringValue(item.headline) || 'news'}-${index}`} style={styles.newsRow}>
                    <Text style={styles.newsSource}>{stringValue(item.source) || 'Fuente'}</Text>
                    <Text style={styles.newsTitle}>{stringValue(item.headline) || 'Noticia'}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return <View style={styles.metricRow}><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text></View>;
}

function numberValue(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function stringValue(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function formatNumber(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 }).format(value);
}

function formatSigned(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '';
  return `${value >= 0 ? '+' : ''}${formatNumber(value)}`;
}

function formatPct(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '—';
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

function formatCompact(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('es-ES', { notation: 'compact', maximumFractionDigits: 2 }).format(value);
}

function rangePosition(price: number | null | undefined, low: number | null | undefined, high: number | null | undefined): number {
  if (price == null || low == null || high == null || high <= low) return 50;
  return Math.max(3, Math.min(100, ((price - low) / (high - low)) * 100));
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#050607' },
  content: { padding: 18, paddingBottom: 44 },
  flex: { flex: 1 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
  backButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: '#11151a', borderWidth: 1, borderColor: '#242a30' },
  backText: { color: '#f4f6f7', fontSize: 33, lineHeight: 35, marginTop: -4 },
  symbolPill: { minWidth: 92, height: 42, paddingHorizontal: 16, borderRadius: 22, backgroundColor: '#171b20', borderWidth: 1, borderColor: '#343b43', alignItems: 'center', justifyContent: 'center' },
  symbolPillText: { color: '#d8dde2', fontSize: 18, fontWeight: '800' },
  atlasButton: { height: 42, paddingHorizontal: 13, borderRadius: 21, backgroundColor: '#0c1b16', borderWidth: 1, borderColor: '#275646', alignItems: 'center', justifyContent: 'center' },
  atlasButtonText: { color: '#49d6a0', fontSize: 10, fontWeight: '900' },
  loading: { minHeight: 330, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: '#7b858d' },
  error: { padding: 14, borderRadius: 12, backgroundColor: '#190d11', borderWidth: 1, borderColor: '#5b2733', marginBottom: 18 },
  errorTitle: { color: '#ff7286', fontWeight: '900', fontSize: 10, letterSpacing: 1 },
  errorText: { color: '#b98089', marginTop: 5, fontSize: 12 },
  identityRow: { flexDirection: 'row', alignItems: 'center' },
  logoCircle: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', backgroundColor: '#13181d', borderWidth: 1, borderColor: '#2d353c', marginRight: 14 },
  logoText: { color: '#f3f6f8', fontWeight: '900', fontSize: 15 },
  companyName: { color: '#f4f6f7', fontSize: 25, fontWeight: '900' },
  companyMeta: { color: '#767f87', fontSize: 12, marginTop: 4 },
  price: { color: '#f5f6f7', fontSize: 52, fontWeight: '900', letterSpacing: -1.5, marginTop: 28 },
  changeRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 4 },
  changeValue: { fontSize: 22, fontWeight: '900' },
  changePct: { fontSize: 22, fontWeight: '900' },
  positive: { color: '#18c78a' },
  negative: { color: '#ff5b72' },
  closeLabel: { color: '#767f87', fontSize: 11, marginLeft: 3 },
  rangeCard: { marginTop: 32, backgroundColor: '#0e1114', borderWidth: 1, borderColor: '#262d33', borderRadius: 16, padding: 16 },
  rangeTop: { flexDirection: 'row', justifyContent: 'space-between' },
  rangeTitle: { color: '#e7eaed', fontWeight: '900', fontSize: 10, letterSpacing: 1.1 },
  rangeSource: { color: '#5f6971', fontSize: 9, fontWeight: '800' },
  rangeTrack: { height: 6, backgroundColor: '#252a2f', borderRadius: 4, marginTop: 20, overflow: 'hidden' },
  rangeFill: { height: 6, backgroundColor: '#16bd83', borderRadius: 4 },
  rangeLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  rangeText: { color: '#7e878f', fontSize: 10 },
  periods: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, paddingVertical: 6 },
  period: { minWidth: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  periodActive: { backgroundColor: '#e8ebed' },
  periodText: { color: '#aeb4b9', fontWeight: '800', fontSize: 11 },
  periodTextActive: { color: '#101315' },
  panel: { marginTop: 20, backgroundColor: '#0d1013', borderWidth: 1, borderColor: '#252b30', borderRadius: 16, padding: 15 },
  panelTitle: { color: '#6fcaef', fontSize: 10, fontWeight: '900', letterSpacing: 1.2, marginBottom: 8 },
  metricRow: { minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#24292e' },
  metricLabel: { color: '#818a92', fontSize: 12 },
  metricValue: { color: '#e8ebed', fontSize: 12, fontWeight: '800', maxWidth: '55%', textAlign: 'right' },
  infoCard: { marginTop: 20, backgroundColor: '#11160f', borderWidth: 1, borderColor: '#344728', borderRadius: 14, padding: 14 },
  infoTitle: { color: '#9db877', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  infoText: { color: '#82916e', fontSize: 11, lineHeight: 17, marginTop: 5 },
  newsRow: { paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#24292e' },
  newsSource: { color: '#5e6972', fontSize: 9, fontWeight: '800' },
  newsTitle: { color: '#dfe3e6', fontSize: 13, lineHeight: 18, marginTop: 4 },
});
