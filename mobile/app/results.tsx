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
      <View style={styles.header}>
        <Text style={styles.code}>RES</Text>
        <View style={styles.headerText}><Text style={styles.eyebrow}>ATLAS TERMINAL · RESULT JOURNAL</Text><Text style={styles.title}>Resultados</Text></View>
      </View>
      <Text style={styles.description}>Historial persistente de snapshots guardados desde AUDIT. Cada registro conserva ticker, momento, proveedor y métricas observadas; no reescribe retroactivamente la evidencia.</Text>

      <View style={styles.summaryRow}>
        <Summary label="SAVED" value={String(rows.length)} />
        <Summary label="UNIQUE" value={String(new Set(rows.map((row) => row.ticker)).size)} />
        <Summary label="LATEST" value={rows[0] ? rows[0].ticker : '—'} />
      </View>

      {rows.length ? rows.map((row) => (
        <View key={row.id} style={styles.card}>
          <View style={styles.top}>
            <Pressable onPress={() => router.push(`/analyze?ticker=${encodeURIComponent(row.ticker)}` as never)} style={styles.flex}>
              <Text style={styles.symbol}>{row.ticker}</Text>
              <Text numberOfLines={1} style={styles.company}>{row.companyName}</Text>
            </Pressable>
            <Text style={styles.time}>{formatDate(row.createdAt)}</Text>
          </View>
          <View style={styles.metrics}>
            <Metric label="PRICE" value={formatNumber(row.price)} />
            <Metric label="MKT CAP" value={formatCompact(row.marketCap)} />
            <Metric label="P/E" value={formatNumber(row.pe)} />
            <Metric label="CAPEX Ω" value={row.capexPosition || 'N/D'} />
          </View>
          <View style={styles.metaRow}><Text style={styles.meta}>{row.provider} · {row.sector || 'sector N/D'}</Text><Pressable onPress={() => { void remove(row.id); }}><Text style={styles.delete}>DELETE</Text></Pressable></View>
          <Text style={styles.note}>{row.note}</Text>
        </View>
      )) : (
        <View style={styles.empty}><Text style={styles.emptyTitle}>NO HAY RESULTADOS GUARDADOS</Text><Text style={styles.emptyText}>Ejecuta AUDIT y pulsa GUARDAR RESULTADO.</Text><Pressable onPress={() => router.push('/audit' as never)} style={styles.openAudit}><Text style={styles.openAuditText}>ABRIR AUDIT →</Text></Pressable></View>
      )}

      <View style={styles.rule}><Text style={styles.ruleTitle}>IMMUTABILITY RULE</Text><Text style={styles.ruleText}>El journal es histórico: un movimiento posterior del precio no modifica lo que ATLAS observó cuando se guardó el snapshot.</Text></View>
    </ScrollView>
  );
}

function Summary({ label, value }: { label: string; value: string }) { return <View style={styles.summary}><Text style={styles.summaryLabel}>{label}</Text><Text style={styles.summaryValue}>{value}</Text></View>; }
function Metric({ label, value }: { label: string; value: string }) { return <View style={styles.metric}><Text style={styles.metricLabel}>{label}</Text><Text numberOfLines={1} style={styles.metricValue}>{value}</Text></View>; }
function formatDate(value: string): string { const date = new Date(value); return Number.isNaN(date.getTime()) ? value : date.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }); }
function formatNumber(value: number | null): string { return value === null ? 'N/D' : value.toLocaleString('es-ES', { maximumFractionDigits: 2 }); }
function formatCompact(value: number | null): string { return value === null ? 'N/D' : new Intl.NumberFormat('es-ES', { notation: 'compact', maximumFractionDigits: 2 }).format(value); }

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#050708' }, content: { paddingHorizontal: 12, paddingTop: 14, paddingBottom: 28, gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: '#1b272c', paddingBottom: 12 }, code: { width: 48, height: 48, textAlign: 'center', textAlignVertical: 'center', borderWidth: 1, borderColor: '#675d32', backgroundColor: '#151206', color: '#e4cf69', fontFamily: 'monospace', fontWeight: '900' }, headerText: { flex: 1 }, eyebrow: { color: '#5e7379', fontFamily: 'monospace', fontSize: 8, fontWeight: '900', letterSpacing: 1.1 }, title: { color: '#eff5f3', fontFamily: 'monospace', fontSize: 24, fontWeight: '900', marginTop: 3 },
  description: { color: '#8c9a9f', fontSize: 12, lineHeight: 18 }, summaryRow: { flexDirection: 'row', gap: 7 }, summary: { flex: 1, borderWidth: 1, borderColor: '#1b292e', backgroundColor: '#080d0f', padding: 10 }, summaryLabel: { color: '#506067', fontFamily: 'monospace', fontSize: 7, fontWeight: '900' }, summaryValue: { color: '#e3ece9', fontFamily: 'monospace', fontSize: 16, fontWeight: '900', marginTop: 4 },
  card: { borderWidth: 1, borderColor: '#1b292e', backgroundColor: '#070c0e', padding: 12, gap: 10 }, top: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' }, flex: { flex: 1 }, symbol: { color: '#ecf4f1', fontFamily: 'monospace', fontSize: 17, fontWeight: '900' }, company: { color: '#6f7f84', fontSize: 10, marginTop: 2 }, time: { color: '#546268', fontFamily: 'monospace', fontSize: 8 }, metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, metric: { minWidth: 90, flexGrow: 1, borderTopWidth: 1, borderTopColor: '#172328', paddingTop: 7 }, metricLabel: { color: '#4e5c61', fontFamily: 'monospace', fontSize: 7, fontWeight: '900' }, metricValue: { color: '#b9c6c2', fontFamily: 'monospace', fontSize: 9, fontWeight: '800', marginTop: 3 }, metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 }, meta: { flex: 1, color: '#5f6e73', fontSize: 9 }, delete: { color: '#b66f6f', fontFamily: 'monospace', fontSize: 8, fontWeight: '900' }, note: { color: '#6c7a7f', fontSize: 9, lineHeight: 14 },
  empty: { paddingVertical: 40, alignItems: 'center', borderWidth: 1, borderColor: '#172328', backgroundColor: '#070b0d' }, emptyTitle: { color: '#67777c', fontFamily: 'monospace', fontWeight: '900', fontSize: 10 }, emptyText: { color: '#4f5d62', fontSize: 10, marginTop: 5 }, openAudit: { marginTop: 14, borderWidth: 1, borderColor: '#2f725b', backgroundColor: '#071510', paddingHorizontal: 12, paddingVertical: 9 }, openAuditText: { color: '#54efbd', fontFamily: 'monospace', fontSize: 8, fontWeight: '900' },
  rule: { borderTopWidth: 1, borderTopColor: '#1a2428', paddingTop: 12 }, ruleTitle: { color: '#4fe8b6', fontFamily: 'monospace', fontSize: 8, fontWeight: '900', letterSpacing: 1 }, ruleText: { color: '#718087', fontSize: 10, lineHeight: 16, marginTop: 5 },
});
