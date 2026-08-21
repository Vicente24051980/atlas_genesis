import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BrokerApi, BrokerEnvelope, BrokerStatus } from '../core/api/brokerApi';
import { BrokerSession } from '../core/security/brokerSession';

export default function PortfolioScreen() {
  const [status, setStatus] = useState<BrokerStatus | null>(null);
  const [account, setAccount] = useState<BrokerEnvelope | null>(null);
  const [positions, setPositions] = useState<BrokerEnvelope | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    const [statusResult, tokenResult] = await Promise.allSettled([BrokerApi.status(), BrokerSession.getControlToken()]);
    setStatus(statusResult.status === 'fulfilled' ? statusResult.value : null);
    const token = tokenResult.status === 'fulfilled' ? tokenResult.value : null;
    if (!token) {
      setAccount(null);
      setPositions(null);
      setLoading(false);
      return;
    }
    const [accountResult, positionsResult] = await Promise.allSettled([BrokerApi.account(token), BrokerApi.positions(token)]);
    setAccount(accountResult.status === 'fulfilled' ? accountResult.value : null);
    setPositions(positionsResult.status === 'fulfilled' ? positionsResult.value : null);
    const failure = accountResult.status === 'rejected' ? accountResult.reason : positionsResult.status === 'rejected' ? positionsResult.reason : null;
    if (failure) setError(failure instanceof Error ? failure.message : String(failure));
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const accountRow = objectRow(account?.data);
  const rows = normalizeRows(positions?.data);
  const currency = pickText(accountRow, 'currency', 'currencyCode', 'currency_code');
  const total = pickNumber(accountRow, 'total', 'equity', 'accountValue', 'value');
  const cash = pickNumber(accountRow, 'free', 'cash', 'availableCash', 'freeCash');
  const invested = pickNumber(accountRow, 'invested', 'investedValue');
  const totalPpl = pickNumber(accountRow, 'ppl', 'profitLoss', 'unrealizedPpl', 'result');

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.codeBox}><Text style={styles.code}>PORT</Text></View>
        <View style={styles.flex}><Text style={styles.eyebrow}>ATLAS Ω · TERMINAL PORTFOLIO</Text><Text style={styles.title}>Portfolio</Text><Text style={styles.subtitle}>Trading 212 · READ ONLY · broker data is evidence, never execution authority.</Text></View>
        <View style={[styles.liveBadge, status?.readReady ? styles.liveReady : styles.liveGate]}><Text style={styles.liveText}>{status?.readReady ? 'LIVE' : 'GATE'}</Text></View>
      </View>

      {loading ? <View style={styles.loading}><ActivityIndicator color="#54efbd" /><Text style={styles.muted}>SYNC T212…</Text></View> : null}
      {error ? <View style={styles.error}><Text style={styles.errorText}>{error}</Text></View> : null}

      {!account && !positions && !loading ? (
        <View style={styles.gatePanel}>
          <View style={styles.gateTop}><Text style={styles.sectionCode}>BROKER GATE</Text><Text style={styles.gateState}>{status?.readReady ? 'LOCAL SESSION REQUIRED' : 'SERVER NOT READY'}</Text></View>
          <Text style={styles.gateCopy}>Conecta el token de control una vez en Broker Ω. Las API keys de Trading 212 permanecen únicamente en el backend y la clave de T212 no tiene permisos de operación.</Text>
          <Pressable onPress={() => router.push('/broker' as never)} style={({ pressed }) => [styles.openButton, pressed && styles.pressed]}><Text style={styles.openText}>OPEN BROKER Ω →</Text></Pressable>
        </View>
      ) : null}

      {account || positions ? (
        <>
          <View style={styles.summaryPanel}>
            <View style={styles.sectionHead}><Text style={styles.sectionCode}>ACCOUNT SUMMARY</Text><Text style={styles.sectionMeta}>{status?.environment.toUpperCase()} · {status?.mode} · {currency || 'ACCOUNT CCY'}</Text></View>
            <View style={styles.metrics}>
              <Metric label="TOTAL" value={formatMoney(total, currency)} />
              <Metric label="INVESTED" value={formatMoney(invested, currency)} />
              <Metric label="CASH" value={formatMoney(cash, currency)} />
              <Metric label="P/L" value={formatSignedMoney(totalPpl, currency)} tone={totalPpl !== null && totalPpl > 0 ? 'good' : totalPpl !== null && totalPpl < 0 ? 'bad' : 'neutral'} />
            </View>
          </View>

          <View style={styles.tablePanel}>
            <View style={styles.sectionHead}><Text style={styles.sectionCode}>POSITIONS</Text><Text style={styles.sectionMeta}>{rows.length} LIVE</Text></View>
            <View style={styles.tableHeader}><Text style={[styles.th, styles.symbolCol]}>TICKER</Text><Text style={styles.th}>QTY</Text><Text style={styles.th}>AVG</Text><Text style={styles.th}>P/L</Text></View>
            {rows.map((row, index) => {
              const symbol = pickText(row, 'ticker', 'instrument', 'symbol') || `POS-${index + 1}`;
              const qty = pickNumber(row, 'quantity', 'qty');
              const avg = pickNumber(row, 'averagePrice', 'avgPrice', 'average_price');
              const ppl = pickNumber(row, 'ppl', 'profitLoss', 'result', 'unrealizedPpl');
              return (
                <Pressable key={`${symbol}-${index}`} onPress={() => router.push(`/analyze?ticker=${encodeURIComponent(symbol)}` as never)} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
                  <View style={styles.symbolCol}><Text style={styles.symbol}>{symbol}</Text><Text style={styles.rowHint}>AUDIT →</Text></View>
                  <Text style={styles.td}>{formatNumber(qty)}</Text>
                  <Text style={styles.td}>{formatNumber(avg)}</Text>
                  <Text style={[styles.td, ppl !== null && ppl > 0 ? styles.good : ppl !== null && ppl < 0 ? styles.bad : null]}>{formatSignedMoney(ppl, currency)}</Text>
                </Pressable>
              );
            })}
            {!rows.length ? <Text style={styles.empty}>NO OPEN POSITIONS RETURNED BY BROKER</Text> : null}
          </View>
        </>
      ) : null}

      <View style={styles.rule}><Text style={styles.ruleCode}>RULE</Text><Text style={styles.ruleText}>READ ONLY · T212 DATA → ATLAS EVIDENCE · NO ORDER PERMISSION · PRICE ≠ THESIS</Text></View>
    </ScrollView>
  );
}

function Metric({ label, value, tone = 'neutral' }: { label: string; value: string; tone?: 'good' | 'bad' | 'neutral' }) {
  return <View style={styles.metric}><Text style={styles.metricLabel}>{label}</Text><Text numberOfLines={1} style={[styles.metricValue, tone === 'good' ? styles.good : tone === 'bad' ? styles.bad : null]}>{value}</Text></View>;
}
function objectRow(value: unknown): Record<string, unknown> { return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
function normalizeRows(value: unknown): Array<Record<string, unknown>> { if (Array.isArray(value)) return value.filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === 'object' && !Array.isArray(row)); const row = objectRow(value); for (const key of ['items', 'positions', 'data', 'results']) { if (Array.isArray(row[key])) return normalizeRows(row[key]); } return []; }
function nk(value: string): string { return value.toLowerCase().replace(/[^a-z0-9]/g, ''); }
function pickNumber(row: Record<string, unknown>, ...names: string[]): number | null { const map = new Map(Object.entries(row).map(([k, v]) => [nk(k), v])); for (const name of names) { const value = map.get(nk(name)); if (typeof value === 'number' && Number.isFinite(value)) return value; if (typeof value === 'string') { const n = Number(value); if (Number.isFinite(n)) return n; } } return null; }
function pickText(row: Record<string, unknown>, ...names: string[]): string | null { const map = new Map(Object.entries(row).map(([k, v]) => [nk(k), v])); for (const name of names) { const value = map.get(nk(name)); if (typeof value === 'string' && value.trim()) return value.trim(); } return null; }
function formatNumber(value: number | null): string { return value === null ? '—' : value.toLocaleString('es-ES', { maximumFractionDigits: 4 }); }
function formatMoney(value: number | null, currency: string | null): string { if (value === null) return 'N/D'; const code = currency?.toUpperCase(); if (!code || !/^[A-Z]{3}$/.test(code)) return value.toLocaleString('es-ES', { maximumFractionDigits: 2 }); try { return new Intl.NumberFormat('es-ES', { style: 'currency', currency: code, maximumFractionDigits: 2 }).format(value); } catch { return `${value.toLocaleString('es-ES', { maximumFractionDigits: 2 })} ${code}`; } }
function formatSignedMoney(value: number | null, currency: string | null): string { if (value === null) return 'N/D'; return `${value > 0 ? '+' : value < 0 ? '−' : ''}${formatMoney(Math.abs(value), currency)}`; }

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#050708' }, content: { paddingHorizontal: 10, paddingTop: 12, paddingBottom: 28, gap: 10 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: '#1a262b', paddingBottom: 10 }, codeBox: { width: 46, height: 42, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2f725b', backgroundColor: '#071510' }, code: { color: '#54efbd', fontFamily: 'monospace', fontSize: 9, fontWeight: '900' }, flex: { flex: 1 }, eyebrow: { color: '#607278', fontFamily: 'monospace', fontSize: 8, fontWeight: '900', letterSpacing: 1 }, title: { color: '#eef5f2', fontFamily: 'monospace', fontSize: 22, fontWeight: '900', marginTop: 2 }, subtitle: { color: '#596b70', fontSize: 9, marginTop: 3 }, liveBadge: { borderWidth: 1, paddingHorizontal: 7, paddingVertical: 5 }, liveReady: { borderColor: '#2f725b', backgroundColor: '#071510' }, liveGate: { borderColor: '#66542b', backgroundColor: '#151206' }, liveText: { color: '#dce7e3', fontFamily: 'monospace', fontSize: 7, fontWeight: '900' },
  loading: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 9 }, muted: { color: '#718087', fontFamily: 'monospace', fontSize: 8 }, error: { borderWidth: 1, borderColor: '#633535', backgroundColor: '#160909', padding: 10 }, errorText: { color: '#d98c8c', fontSize: 9 },
  gatePanel: { borderWidth: 1, borderColor: '#514724', backgroundColor: '#111006', padding: 12, gap: 9 }, gateTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 }, gateState: { color: '#d1b85f', fontFamily: 'monospace', fontSize: 7, fontWeight: '900' }, gateCopy: { color: '#918a6d', fontSize: 10, lineHeight: 16 }, openButton: { alignSelf: 'flex-start', borderWidth: 1, borderColor: '#514724', paddingHorizontal: 10, paddingVertical: 8 }, openText: { color: '#d3bd68', fontFamily: 'monospace', fontSize: 8, fontWeight: '900' },
  summaryPanel: { borderWidth: 1, borderColor: '#1b292e', backgroundColor: '#070c0e' }, sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: 10, borderBottomWidth: 1, borderBottomColor: '#1b292e' }, sectionCode: { color: '#54efbd', fontFamily: 'monospace', fontSize: 8, fontWeight: '900', letterSpacing: 1 }, sectionMeta: { color: '#53656a', fontFamily: 'monospace', fontSize: 7, fontWeight: '800' }, metrics: { flexDirection: 'row', flexWrap: 'wrap' }, metric: { width: '50%', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#121d21', padding: 10 }, metricLabel: { color: '#4c5c61', fontFamily: 'monospace', fontSize: 6, fontWeight: '900' }, metricValue: { color: '#e1e9e6', fontFamily: 'monospace', fontSize: 12, fontWeight: '900', marginTop: 4 },
  tablePanel: { borderWidth: 1, borderColor: '#1b292e', backgroundColor: '#060a0b' }, tableHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 9, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#1b292e' }, th: { width: 70, color: '#46565b', fontFamily: 'monospace', fontSize: 6, fontWeight: '900', textAlign: 'right' }, symbolCol: { flex: 1, textAlign: 'left' }, row: { minHeight: 48, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 9, borderBottomWidth: 1, borderBottomColor: '#10181b' }, symbol: { color: '#e9f1ef', fontFamily: 'monospace', fontSize: 10, fontWeight: '900' }, rowHint: { color: '#3f7566', fontFamily: 'monospace', fontSize: 6, marginTop: 2 }, td: { width: 70, color: '#aab8b4', fontFamily: 'monospace', fontSize: 8, textAlign: 'right' }, empty: { color: '#5d6b70', fontFamily: 'monospace', fontSize: 8, padding: 15 },
  rule: { flexDirection: 'row', gap: 8, borderTopWidth: 1, borderTopColor: '#1a2428', paddingTop: 9 }, ruleCode: { color: '#54efbd', fontFamily: 'monospace', fontSize: 7, fontWeight: '900' }, ruleText: { flex: 1, color: '#627277', fontFamily: 'monospace', fontSize: 7, lineHeight: 12 }, pressed: { opacity: 0.68 }, good: { color: '#4de7b4' }, bad: { color: '#e47c7c' },
});
