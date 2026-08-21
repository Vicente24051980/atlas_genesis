import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { AuditApi, AuditEngineResult, FullAuditPayload } from '../core/api/auditApi';
import { AuditResultStore, WatchlistStore } from '../core/storage/localStore';

type Mode = 'audit' | 'security';

type Props = {
  initialTicker?: string;
  mode?: Mode;
};

export function TickerAuditTerminal({ initialTicker = '', mode = 'audit' }: Props) {
  const [ticker, setTicker] = useState(initialTicker.trim().toUpperCase());
  const [audit, setAudit] = useState<FullAuditPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const symbol = useMemo(() => ticker.trim().toUpperCase(), [ticker]);

  const run = async (value = symbol) => {
    const normalized = value.trim().toUpperCase();
    if (!normalized) return;
    setTicker(normalized);
    setLoading(true);
    setStatus(null);
    try {
      setAudit(await AuditApi.full(normalized));
    } catch (cause) {
      setAudit(null);
      setStatus(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialTicker.trim()) void run(initialTicker);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    if (!audit) return;
    const summary = audit.company.summary;
    await AuditResultStore.save({
      id: `${audit.ticker}-${audit.asOf}`,
      ticker: audit.ticker,
      createdAt: audit.asOf,
      provider: audit.company.provider,
      companyName: clean(summary.name) || audit.ticker,
      sector: clean(summary.sector) || clean(summary.industry) || null,
      price: asNumber(summary.price),
      marketCap: asNumber(summary.marketCap),
      pe: asNumber(summary.pe),
      capexPosition: audit.engines.find((row) => row.engineId === 'GLOBAL_CAPEX_CHAIN_OMEGA')?.state || null,
      recommendation: audit.decision.recommendation,
      action: audit.decision.action,
      executionState: audit.decision.executionState,
      confidence: audit.decision.confidence,
      engineSnapshot: audit.engines.map((row) => ({ engineId: row.engineId, label: row.label, state: row.state, score: row.score, detail: row.detail })),
      contradictions: audit.contradictions,
      note: audit.decision.reason,
    });
    setStatus('AUDIT SNAPSHOT GUARDADO EN RESULTADOS.');
  };

  const addWatch = async () => {
    if (!symbol) return;
    await WatchlistStore.add(symbol);
    setStatus(`${symbol} AÑADIDO A WATCHLIST.`);
  };

  const summary = audit?.company.summary;
  const green = audit?.engines.find((row) => row.engineId === 'GREEN_CONTINUITY_OMEGA');

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <View style={styles.codeBox}><Text style={styles.code}>{mode === 'audit' ? 'AUD' : 'SEC'}</Text></View>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>ATLAS Ω · {mode === 'audit' ? 'FULL AUDIT' : 'SECURITY HUB'}</Text>
          <Text style={styles.title}>{mode === 'audit' ? 'Auditar ticker' : 'Ficha + auditoría'}</Text>
          <Text style={styles.subline}>GREEN FIRST → TODOS LOS MOTORES → FALSIFIERS → INVESTMENT COMMITTEE</Text>
        </View>
      </View>

      <View style={styles.commandPanel}>
        <Text style={styles.panelCode}>GO / TICKER</Text>
        <View style={styles.inputRow}>
          <TextInput
            value={ticker}
            onChangeText={setTicker}
            autoCapitalize="characters"
            autoCorrect={false}
            placeholder="NVDA / KO / ETN"
            placeholderTextColor="#4f6066"
            style={styles.input}
            returnKeyType="search"
            onSubmitEditing={() => { void run(); }}
          />
          <Pressable onPress={() => { void run(); }} style={({ pressed }) => [styles.runButton, pressed && styles.pressed]}>
            <Text style={styles.runButtonText}>RUN</Text>
          </Pressable>
        </View>
        <Text style={styles.commandHint}>Un resultado ausente se muestra como GATE. Nunca se completa con una cifra inventada.</Text>
      </View>

      {loading ? <View style={styles.loading}><ActivityIndicator color="#54efbd" /><Text style={styles.loadingText}>EJECUTANDO BARRIDO TRANSVERSAL…</Text></View> : null}
      {status ? <View style={styles.statusBar}><Text style={styles.statusText}>{status}</Text></View> : null}

      {audit ? (
        <>
          <DecisionPanel payload={audit} />

          <View style={styles.identityPanel}>
            <View style={styles.identityTop}>
              <View style={styles.flex}>
                <Text style={styles.symbol}>{audit.ticker}</Text>
                <Text style={styles.companyName}>{clean(summary?.name) || audit.ticker}</Text>
                <Text style={styles.companyMeta}>{clean(summary?.sector) || clean(summary?.industry) || 'SECTOR N/D'} · {clean(summary?.currency) || 'CCY N/D'}</Text>
              </View>
              <View style={styles.providerBadge}><Text style={styles.providerText}>{audit.company.provider.toUpperCase()}</Text></View>
            </View>
            <View style={styles.metricStrip}>
              <Metric label="PRICE" value={formatNumber(summary?.price)} />
              <Metric label="MKT CAP" value={formatCompact(summary?.marketCap)} />
              <Metric label="P/E" value={formatNumber(summary?.pe)} />
              <Metric label="FCF" value={formatCompact(summary?.freeCashFlow)} />
            </View>
          </View>

          <View style={styles.greenFirstBar}>
            <Text style={styles.greenFirstCode}>01 · GREEN FIRST</Text>
            <Text style={[styles.greenFirstState, stateColor(green?.state)]}>{green?.score != null ? `${green.score}/5` : green?.state || 'GATE'}</Text>
            <Text style={styles.greenFirstNote}>GREEN informa continuidad; 3/5, 4/5 y 5/5 pueden seguir siendo oportunidad si el resto de motores es fuerte.</Text>
          </View>

          <View style={styles.ledgerPanel}>
            <View style={styles.sectionHead}>
              <View><Text style={styles.sectionCode}>ENGINE LEDGER Ω</Text><Text style={styles.sectionTitle}>Resultados de todos los motores</Text></View>
              <Text style={styles.count}>{audit.engines.length} ENGINES</Text>
            </View>
            {audit.engines.map((engine, index) => <EngineRow key={engine.engineId} engine={engine} index={index} />)}
          </View>

          <View style={styles.contradictionPanel}>
            <Text style={styles.sectionCode}>CONTRADICTIONS Ω</Text>
            {audit.contradictions.length ? audit.contradictions.map((item, index) => <Text key={`${item}-${index}`} style={styles.contradiction}>• {item}</Text>) : <Text style={styles.emptyText}>NO CONTRADICTION RECORDED IN THIS PACKET</Text>}
          </View>

          <View style={styles.provenancePanel}>
            <Text style={styles.sectionCode}>EVIDENCE / PROVENANCE</Text>
            <Text style={styles.provenanceText}>AS-OF {formatDate(audit.asOf)} · {audit.protocol}</Text>
            <Text style={styles.provenanceText}>PROVIDER {audit.company.provider} · ORDER {audit.engineOrderRule}</Text>
            {audit.guardrails.map((item, index) => <Text key={`${item}-${index}`} style={styles.guardrailText}>• {item}</Text>)}
          </View>

          <View style={styles.actions}>
            <Pressable onPress={() => { void save(); }} style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}><Text style={styles.actionText}>SAVE RESULT</Text></Pressable>
            <Pressable onPress={() => { void addWatch(); }} style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}><Text style={styles.actionText}>+ WATCHLIST</Text></Pressable>
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}

function DecisionPanel({ payload }: { payload: FullAuditPayload }) {
  const decision = payload.decision;
  return (
    <View style={[styles.decisionPanel, decisionBorder(decision.recommendation)]}>
      <View style={styles.decisionTop}>
        <View><Text style={styles.sectionCode}>INVESTMENT COMMITTEE Ω</Text><Text style={styles.decisionLabel}>FINAL RECOMMENDATION</Text></View>
        <View style={[styles.verdictBadge, decisionBadge(decision.recommendation)]}><Text style={styles.verdictText}>{decision.recommendation.replaceAll('_', ' ')}</Text></View>
      </View>
      <Text style={styles.actionHeadline}>{decision.action}</Text>
      <Text style={styles.decisionReason}>{decision.reason}</Text>
      <View style={styles.decisionMetaRow}>
        <Text style={styles.decisionMeta}>EXECUTION {decision.executionState}</Text>
        <Text style={styles.decisionMeta}>CONF {decision.confidence}</Text>
      </View>
    </View>
  );
}

function EngineRow({ engine, index }: { engine: AuditEngineResult; index: number }) {
  return (
    <View style={styles.engineRow}>
      <Text style={styles.engineRank}>{String(index + 1).padStart(2, '0')}</Text>
      <View style={styles.engineBody}>
        <View style={styles.engineTop}>
          <Text style={styles.engineLabel}>{engine.label}</Text>
          {engine.score != null ? <Text style={styles.engineScore}>{engine.score.toFixed(1)}</Text> : null}
          <Text style={[styles.engineState, stateColor(engine.state)]}>{prettyState(engine.state)}</Text>
        </View>
        <Text style={styles.engineDetail}>{engine.detail}</Text>
        {engine.evidence.length ? <Text style={styles.engineEvidence}>EVIDENCE · {engine.evidence.join(' · ')}</Text> : null}
        {engine.provenance.length ? <Text style={styles.engineProvenance}>SOURCE · {engine.provenance.join(' · ')}</Text> : null}
      </View>
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <View style={styles.metric}><Text style={styles.metricLabel}>{label}</Text><Text numberOfLines={1} style={styles.metricValue}>{value}</Text></View>;
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : null; }
  return null;
}
function clean(value: unknown): string { return value === null || value === undefined ? '' : String(value).trim(); }
function formatNumber(value: unknown): string { const n = asNumber(value); return n === null ? 'N/D' : n.toLocaleString('es-ES', { maximumFractionDigits: 2 }); }
function formatCompact(value: unknown): string { const n = asNumber(value); return n === null ? 'N/D' : new Intl.NumberFormat('es-ES', { notation: 'compact', maximumFractionDigits: 2 }).format(n); }
function formatDate(value: string): string { const d = new Date(value); return Number.isNaN(d.getTime()) ? value : d.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
function prettyState(value?: string): string { return (value || 'DATA GATE').replaceAll('_', ' '); }

function stateColor(state?: string) {
  if (state === 'PASS' || state === 'STRONG') return styles.good;
  if (state === 'FAIL') return styles.bad;
  if (state === 'WATCH' || state === 'MIXED' || state === 'QUARANTINE' || state === 'PARTIAL') return styles.warn;
  return styles.neutral;
}
function decisionBorder(recommendation: string) {
  if (recommendation === 'BUY') return styles.decisionBuy;
  if (recommendation === 'REJECT') return styles.decisionReject;
  if (recommendation === 'WATCH') return styles.decisionWatch;
  return styles.decisionNeutral;
}
function decisionBadge(recommendation: string) {
  if (recommendation === 'BUY') return styles.badgeBuy;
  if (recommendation === 'REJECT') return styles.badgeReject;
  if (recommendation === 'WATCH') return styles.badgeWatch;
  return styles.badgeNeutral;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#050708' },
  content: { paddingHorizontal: 10, paddingTop: 12, paddingBottom: 30, gap: 10 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#1a262b' },
  codeBox: { width: 42, height: 42, borderWidth: 1, borderColor: '#2f725b', backgroundColor: '#071510', alignItems: 'center', justifyContent: 'center' },
  code: { color: '#54efbd', fontFamily: 'monospace', fontSize: 12, fontWeight: '900' },
  headerText: { flex: 1 },
  eyebrow: { color: '#607278', fontFamily: 'monospace', fontSize: 8, fontWeight: '900', letterSpacing: 1.1 },
  title: { color: '#eef5f2', fontFamily: 'monospace', fontSize: 22, fontWeight: '900', marginTop: 2 },
  subline: { color: '#4e615f', fontFamily: 'monospace', fontSize: 7, marginTop: 4 },
  commandPanel: { borderWidth: 1, borderColor: '#1b292e', backgroundColor: '#080d0f', padding: 10, gap: 8 },
  panelCode: { color: '#53e8b9', fontFamily: 'monospace', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  inputRow: { flexDirection: 'row', gap: 7 },
  input: { flex: 1, minHeight: 42, borderWidth: 1, borderColor: '#293a40', backgroundColor: '#040708', color: '#eef5f2', paddingHorizontal: 11, fontFamily: 'monospace', fontSize: 14, fontWeight: '800' },
  runButton: { width: 72, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2f725b', backgroundColor: '#071510' },
  runButtonText: { color: '#54efbd', fontFamily: 'monospace', fontSize: 10, fontWeight: '900' },
  commandHint: { color: '#59696e', fontSize: 9, lineHeight: 14 },
  loading: { flexDirection: 'row', alignItems: 'center', gap: 8, borderLeftWidth: 2, borderLeftColor: '#54efbd', padding: 9 },
  loadingText: { color: '#71827f', fontFamily: 'monospace', fontSize: 8, fontWeight: '800' },
  statusBar: { borderWidth: 1, borderColor: '#285846', backgroundColor: '#07130f', padding: 9 }, statusText: { color: '#8bdcc2', fontFamily: 'monospace', fontSize: 8, fontWeight: '800' },
  decisionPanel: { borderWidth: 1, backgroundColor: '#070c0e', padding: 12, gap: 8 },
  decisionBuy: { borderColor: '#238b66' }, decisionReject: { borderColor: '#8a3838' }, decisionWatch: { borderColor: '#7d652c' }, decisionNeutral: { borderColor: '#34454b' },
  decisionTop: { flexDirection: 'row', alignItems: 'center', gap: 8 }, sectionCode: { color: '#54efbd', fontFamily: 'monospace', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  decisionLabel: { color: '#53646a', fontFamily: 'monospace', fontSize: 7, fontWeight: '800', marginTop: 3 },
  verdictBadge: { marginLeft: 'auto', borderWidth: 1, paddingHorizontal: 8, paddingVertical: 5 }, badgeBuy: { borderColor: '#238b66', backgroundColor: '#071a12' }, badgeReject: { borderColor: '#8a3838', backgroundColor: '#190909' }, badgeWatch: { borderColor: '#7d652c', backgroundColor: '#171306' }, badgeNeutral: { borderColor: '#43545a', backgroundColor: '#0b1113' },
  verdictText: { color: '#e7efec', fontFamily: 'monospace', fontSize: 9, fontWeight: '900' },
  actionHeadline: { color: '#f1f6f4', fontFamily: 'monospace', fontSize: 18, fontWeight: '900' },
  decisionReason: { color: '#899895', fontSize: 10, lineHeight: 16 },
  decisionMetaRow: { flexDirection: 'row', gap: 16, borderTopWidth: 1, borderTopColor: '#172328', paddingTop: 7 }, decisionMeta: { color: '#5e6f74', fontFamily: 'monospace', fontSize: 7, fontWeight: '900' },
  identityPanel: { borderWidth: 1, borderColor: '#1b292e', backgroundColor: '#070c0e', padding: 11, gap: 10 }, identityTop: { flexDirection: 'row', gap: 8 }, flex: { flex: 1 },
  symbol: { color: '#f0f5f3', fontFamily: 'monospace', fontSize: 22, fontWeight: '900' }, companyName: { color: '#b8c5c1', fontSize: 12, fontWeight: '800', marginTop: 2 }, companyMeta: { color: '#617176', fontFamily: 'monospace', fontSize: 8, marginTop: 4 },
  providerBadge: { alignSelf: 'flex-start', borderWidth: 1, borderColor: '#2f725b', backgroundColor: '#071510', paddingHorizontal: 7, paddingVertical: 4 }, providerText: { color: '#69dfbc', fontFamily: 'monospace', fontSize: 7, fontWeight: '900' },
  metricStrip: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 }, metric: { minWidth: '23%', flexGrow: 1, borderTopWidth: 1, borderTopColor: '#172328', paddingTop: 6 }, metricLabel: { color: '#4f5e63', fontFamily: 'monospace', fontSize: 6, fontWeight: '900' }, metricValue: { color: '#d7e1de', fontFamily: 'monospace', fontSize: 10, fontWeight: '900', marginTop: 3 },
  greenFirstBar: { borderWidth: 1, borderColor: '#285846', backgroundColor: '#07110e', padding: 10, gap: 5 }, greenFirstCode: { color: '#56e8bb', fontFamily: 'monospace', fontSize: 8, fontWeight: '900' }, greenFirstState: { fontFamily: 'monospace', fontSize: 15, fontWeight: '900' }, greenFirstNote: { color: '#71837d', fontSize: 9, lineHeight: 14 },
  ledgerPanel: { borderWidth: 1, borderColor: '#1b292e', backgroundColor: '#060a0b' }, sectionHead: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', padding: 11, borderBottomWidth: 1, borderBottomColor: '#1b292e' }, sectionTitle: { color: '#edf4f1', fontFamily: 'monospace', fontSize: 13, fontWeight: '900', marginTop: 3 }, count: { color: '#526369', fontFamily: 'monospace', fontSize: 7, fontWeight: '900' },
  engineRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 10, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#111a1e' }, engineRank: { width: 22, color: '#405057', fontFamily: 'monospace', fontSize: 7, fontWeight: '900', paddingTop: 2 }, engineBody: { flex: 1 }, engineTop: { flexDirection: 'row', alignItems: 'center', gap: 7 }, engineLabel: { flex: 1, color: '#dbe5e2', fontFamily: 'monospace', fontSize: 9, fontWeight: '900' }, engineScore: { color: '#e2ebe8', fontFamily: 'monospace', fontSize: 8, fontWeight: '900' }, engineState: { fontFamily: 'monospace', fontSize: 7, fontWeight: '900', textAlign: 'right', maxWidth: 110 }, engineDetail: { color: '#718086', fontSize: 9, lineHeight: 14, marginTop: 5 }, engineEvidence: { color: '#678b80', fontFamily: 'monospace', fontSize: 7, marginTop: 4 }, engineProvenance: { color: '#52676b', fontFamily: 'monospace', fontSize: 7, marginTop: 3 },
  contradictionPanel: { borderWidth: 1, borderColor: '#4d3f24', backgroundColor: '#100e07', padding: 11, gap: 6 }, contradiction: { color: '#c7b985', fontSize: 9, lineHeight: 15 }, emptyText: { color: '#59686d', fontFamily: 'monospace', fontSize: 8 },
  provenancePanel: { borderWidth: 1, borderColor: '#1b292e', backgroundColor: '#070c0e', padding: 11, gap: 5 }, provenanceText: { color: '#68787d', fontFamily: 'monospace', fontSize: 7 }, guardrailText: { color: '#788783', fontSize: 9, lineHeight: 14 },
  actions: { flexDirection: 'row', gap: 7 }, actionButton: { flex: 1, minHeight: 40, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#2f725b', backgroundColor: '#071510' }, actionText: { color: '#66e9bd', fontFamily: 'monospace', fontSize: 8, fontWeight: '900' }, pressed: { opacity: 0.68 },
  good: { color: '#4de7b4' }, bad: { color: '#e47c7c' }, warn: { color: '#d3b45d' }, neutral: { color: '#75868b' },
});
