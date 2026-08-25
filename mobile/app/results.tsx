import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AuditResultRecord, AuditResultStore } from '../core/storage/localStore';

export default function ResultsScreen() {
  const [rows, setRows] = useState<AuditResultRecord[]>([]);
  const load = async () => setRows(await AuditResultStore.list());
  useEffect(() => { void load(); }, []);
  const remove = async (id: string) => setRows(await AuditResultStore.remove(id));

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}><Text style={styles.code}>RES</Text><View style={styles.headerText}><Text style={styles.eyebrow}>ATLAS Ω · RESULT JOURNAL</Text><Text style={styles.title}>Resultados</Text><Text style={styles.subtitle}>Snapshots históricos · verdict · engine ledger</Text></View></View>

      <View style={styles.summaryRow}><Summary label="SAVED" value={String(rows.length)} /><Summary label="UNIQUE" value={String(new Set(rows.map((row) => row.ticker)).size)} /><Summary label="LATEST" value={rows[0]?.ticker || '—'} /></View>

      {rows.length ? rows.map((row) => (
        <View key={row.id} style={styles.card}>
          <View style={styles.top}>
            <Pressable onPress={() => router.push(`/analyze?ticker=${encodeURIComponent(row.ticker)}` as never)} style={styles.flex}><Text style={styles.symbol}>{row.ticker}</Text><Text numberOfLines={1} style={styles.company}>{row.companyName}</Text></Pressable>
            <Text style={styles.time}>{formatDate(row.createdAt)}</Text>
          </View>

          <View style={styles.verdictRow}>
            <Text style={styles.verdictLabel}>COMMITTEE</Text>
            <Text style={[styles.verdict, verdictColor(row.recommendation)]}>{row.recommendation || 'LEGACY SNAPSHOT'}</Text>
            <Text style={styles.action} numberOfLines={1}>{row.action || 'NO FINAL VERDICT STORED'}</Text>
          </View>

          <View style={styles.metrics}><Metric label="PRICE" value={formatNumber(row.price)} /><Metric label="MKT CAP" value={formatCompact(row.marketCap)} /><Metric label="P/E" value={formatNumber(row.pe)} /><Metric label="ENGINES" value={row.engineSnapshot?.length ? String(row.engineSnapshot.length) : 'LEGACY'} /></View>

          {row.engineSnapshot?.length ? (
            <View style={styles.engineMini}>
              {row.engineSnapshot.slice(0, 6).map((engine) => <View key={engine.engineId} style={styles.engineMiniRow}><Text numberOfLines={1} style={styles.engineMiniName}>{engine.label}</Text><Text style={styles.engineMiniState}>{engine.state}</Text></View>)}
              {row.engineSnapshot.length > 6 ? <Text style={styles.more}>+ {row.engineSnapshot.length - 6} MORE ENGINES · OPEN TICKER TO RE-AUDIT</Text> : null}
            </View>
          ) : null}

          <View style={styles.metaRow}><Text style={styles.meta}>{row.provider} · {row.sector || 'sector N/D'} · {row.executionState || 'snapshot'}</Text><Pressable onPress={() => { void remove(row.id); }}><Text style={styles.delete}>DELETE</Text></Pressable></View>
          <Text style={styles.note}>{row.note}</Text>
        </View>
      )) : <View style={styles.empty}><Text style={styles.emptyTitle}>NO SAVED AUDITS</Text><Pressable onPress={() => router.push('/audit' as never)} style={styles.openAudit}><Text style={styles.openAuditText}>OPEN AUDIT →</Text></Pressable></View>}

      <View style={styles.rule}><Text style={styles.ruleTitle}>IMMUTABILITY RULE</Text><Text style={styles.ruleText}>Un snapshot guardado conserva el veredicto y estados de motor observados en ese momento. Una auditoría posterior crea un registro nuevo.</Text></View>
    </ScrollView>
  );
}

function Summary({ label, value }: { label: string; value: string }) { return <View style={styles.summary}><Text style={styles.summaryLabel}>{label}</Text><Text style={styles.summaryValue}>{value}</Text></View>; }
function Metric({ label, value }: { label: string; value: string }) { return <View style={styles.metric}><Text style={styles.metricLabel}>{label}</Text><Text numberOfLines={1} style={styles.metricValue}>{value}</Text></View>; }
function verdictColor(value?: string | null) { if (value === 'BUY') return styles.good; if (value === 'REJECT') return styles.bad; if (value === 'WATCH') return styles.warn; return styles.neutral; }
function formatDate(value: string): string { const date = new Date(value); return Number.isNaN(date.getTime()) ? value : date.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }); }
function formatNumber(value: number | null): string { return value === null ? 'N/D' : value.toLocaleString('es-ES', { maximumFractionDigits: 2 }); }
function formatCompact(value: number | null): string { return value === null ? 'N/D' : new Intl.NumberFormat('es-ES', { notation: 'compact', maximumFractionDigits: 2 }).format(value); }

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#050708' }, content: { paddingHorizontal: 10, paddingTop: 12, paddingBottom: 28, gap: 10 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: '#1b272c', paddingBottom: 10 }, code: { width: 44, height: 42, textAlign: 'center', textAlignVertical: 'center', borderWidth: 1, borderColor: '#2f725b', backgroundColor: '#071510', color: '#54efbd', fontFamily: 'monospace', fontWeight: '900', fontSize: 9 }, headerText: { flex: 1 }, eyebrow: { color: '#5e7379', fontFamily: 'monospace', fontSize: 8, fontWeight: '900', letterSpacing: 1 }, title: { color: '#eff5f3', fontFamily: 'monospace', fontSize: 22, fontWeight: '900', marginTop: 2 }, subtitle: { color: '#59696e', fontFamily: 'monospace', fontSize: 7, marginTop: 3 },
  summaryRow: { flexDirection: 'row', gap: 6 }, summary: { flex: 1, borderWidth: 1, borderColor: '#1b292e', backgroundColor: '#080d0f', padding: 9 }, summaryLabel: { color: '#506067', fontFamily: 'monospace', fontSize: 6, fontWeight: '900' }, summaryValue: { color: '#e3ece9', fontFamily: 'monospace', fontSize: 14, fontWeight: '900', marginTop: 3 },
  card: { borderWidth: 1, borderColor: '#1b292e', backgroundColor: '#070c0e', padding: 10, gap: 9 }, top: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' }, flex: { flex: 1 }, symbol: { color: '#ecf4f1', fontFamily: 'monospace', fontSize: 16, fontWeight: '900' }, company: { color: '#6f7f84', fontSize: 9, marginTop: 2 }, time: { color: '#546268', fontFamily: 'monospace', fontSize: 7 },
  verdictRow: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#172328', paddingVertical: 7, gap: 3 }, verdictLabel: { color: '#4d5e63', fontFamily: 'monospace', fontSize: 6, fontWeight: '900' }, verdict: { fontFamily: 'monospace', fontSize: 12, fontWeight: '900' }, action: { color: '#8d9b97', fontFamily: 'monospace', fontSize: 8, fontWeight: '800' },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 }, metric: { minWidth: 74, flexGrow: 1, borderTopWidth: 1, borderTopColor: '#172328', paddingTop: 6 }, metricLabel: { color: '#4e5c61', fontFamily: 'monospace', fontSize: 6, fontWeight: '900' }, metricValue: { color: '#b9c6c2', fontFamily: 'monospace', fontSize: 8, fontWeight: '800', marginTop: 3 },
  engineMini: { borderTopWidth: 1, borderTopColor: '#172328' }, engineMiniRow: { minHeight: 25, flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 1, borderBottomColor: '#10181b' }, engineMiniName: { flex: 1, color: '#778783', fontFamily: 'monospace', fontSize: 7 }, engineMiniState: { color: '#a8b5b1', fontFamily: 'monospace', fontSize: 6, fontWeight: '900' }, more: { color: '#456b60', fontFamily: 'monospace', fontSize: 6, marginTop: 5 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 }, meta: { flex: 1, color: '#5f6e73', fontSize: 8 }, delete: { color: '#b66f6f', fontFamily: 'monospace', fontSize: 7, fontWeight: '900' }, note: { color: '#6c7a7f', fontSize: 8, lineHeight: 13 },
  empty: { paddingVertical: 36, alignItems: 'center', borderWidth: 1, borderColor: '#172328', backgroundColor: '#070b0d' }, emptyTitle: { color: '#67777c', fontFamily: 'monospace', fontWeight: '900', fontSize: 9 }, openAudit: { marginTop: 12, borderWidth: 1, borderColor: '#2f725b', backgroundColor: '#071510', paddingHorizontal: 12, paddingVertical: 8 }, openAuditText: { color: '#54efbd', fontFamily: 'monospace', fontSize: 8, fontWeight: '900' },
  rule: { borderTopWidth: 1, borderTopColor: '#1a2428', paddingTop: 10 }, ruleTitle: { color: '#4fe8b6', fontFamily: 'monospace', fontSize: 7, fontWeight: '900', letterSpacing: 1 }, ruleText: { color: '#718087', fontSize: 9, lineHeight: 15, marginTop: 4 }, good: { color: '#4de7b4' }, bad: { color: '#e47c7c' }, warn: { color: '#d3b45d' }, neutral: { color: '#819095' },
});
