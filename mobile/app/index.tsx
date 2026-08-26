import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BrokerApi, BrokerEnvelope, BrokerStatus } from '../core/api/brokerApi';
import { MobileApi, MobileHealth } from '../core/api/mobileApi';
import { BrokerSession } from '../core/security/brokerSession';

export default function HomeScreen() {
  const [health, setHealth] = useState<MobileHealth | null>(null);
  const [brokerStatus, setBrokerStatus] = useState<BrokerStatus | null>(null);
  const [account, setAccount] = useState<BrokerEnvelope | null>(null);
  const [positions, setPositions] = useState<BrokerEnvelope | null>(null);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const [healthResult, brokerStatusResult, token] = await Promise.allSettled([
      MobileApi.health(),
      BrokerApi.status(),
      BrokerSession.getControlToken(),
    ]);
    setHealth(healthResult.status === 'fulfilled' ? healthResult.value : null);
    setBrokerStatus(brokerStatusResult.status === 'fulfilled' ? brokerStatusResult.value : null);

    const controlToken = token.status === 'fulfilled' ? token.value : null;
    if (!controlToken) {
      setAccount(null);
      setPositions(null);
      setPortfolioError(null);
      return;
    }

    const [accountResult, positionsResult] = await Promise.allSettled([
      BrokerApi.account(controlToken),
      BrokerApi.positions(controlToken),
    ]);
    setAccount(accountResult.status === 'fulfilled' ? accountResult.value : null);
    setPositions(positionsResult.status === 'fulfilled' ? positionsResult.value : null);
    const failure = accountResult.status === 'rejected' ? accountResult.reason : positionsResult.status === 'rejected' ? positionsResult.reason : null;
    setPortfolioError(failure instanceof Error ? failure.message : failure ? String(failure) : null);
  };

  useEffect(() => {
    let mounted = true;
    const safeLoad = async () => { if (mounted) await load(); };
    void safeLoad();
    const timer = setInterval(() => { void safeLoad(); }, 30000);
    return () => { mounted = false; clearInterval(timer); };
  }, []);

  const refresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };
  const online = health?.ok === true;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { void refresh(); }} tintColor="#45e8b4" />}>
      <View style={styles.pageHeader}>
        <View><Text style={styles.eyebrow}>ATLAS Ω · TERMINAL COCKPIT</Text><Text style={styles.title}>Portfolio First</Text></View>
        <View style={[styles.engineBadge, online ? styles.engineOnline : styles.engineOffline]}><View style={[styles.engineDot, online ? styles.dotOnline : styles.dotOffline]} /><Text style={styles.engineText}>{online ? 'ENGINE ONLINE' : 'DEGRADED'}</Text></View>
      </View>

      <LivePortfolio account={account} positions={positions} brokerStatus={brokerStatus} error={portfolioError} />

      <View style={styles.statusStrip}>
        <StatusCell label="DATA" value={health?.preferred_provider || 'CONNECTING'} tone={health?.financialdatanet_configured ? 'good' : 'warn'} />
        <StatusCell label="T212" value={brokerStatus?.readReady ? `${brokerStatus.mode} READY` : 'BROKER GATE'} tone={brokerStatus?.readReady ? 'good' : 'warn'} />
        <StatusCell label="REFRESH" value="30s PORT · 15s INDEX" tone="neutral" />
      </View>

      <SectionHeader code="01" title="Primary Workspaces" />
      <View style={styles.tiles}>
        <WorkspaceTile code="AUD" title="Auditar" meta="Run · engines · evidence gates" route="/audit" />
        <WorkspaceTile code="WL" title="Watchlist" meta="Candidates · no-chase · alerts" route="/watchlist" />
        <WorkspaceTile code="RES" title="Resultados" meta="Saved snapshots · history" route="/results" />
        <WorkspaceTile code="OPP" title="Opportunities" meta="Wave · rotation · priority" route="/workspace/opportunities" />
        <WorkspaceTile code="MKT" title="Markets" meta="Global indices · macro · movers" route="/workspace/markets" />
        <WorkspaceTile code="Ω" title="ATLAS" meta="Committee · engines · falsifiers" route="/workspace/atlas" />
      </View>

      <SectionHeader code="02" title="Decision Stack" />
      <View style={styles.stack}>
        <PriorityRow rank="01" title="Audit queue" detail="Ticker → evidence → specialist engines → contradictions → falsifiers." state="ACTIVE" route="/audit" />
        <PriorityRow rank="02" title="Market rotation" detail="Current-flow questions route through Money Rotation Ω before quality filters." state="ACTIVE" route="/workspace/markets" />
        <PriorityRow rank="03" title="Catalysts" detail="Earnings, FDA, macro events and thesis-changing evidence." state="ACTIVE" route="/workspace/catalysts" />
        <PriorityRow rank="04" title="Execution" detail="Trading 212 stays paper-first; live execution remains fail-closed." state="GATED" route="/workspace/orders" />
      </View>

      <Pressable onPress={() => router.push('/analyze' as never)} style={({ pressed }) => [styles.securityHub, pressed && styles.pressed]}>
        <View style={styles.securityCode}><Text style={styles.securityCodeText}>SEC</Text></View>
        <View style={styles.securityText}><Text style={styles.securityTitle}>Security Hub</Text><Text style={styles.securityMeta}>Abrir ficha profunda de cualquier ticker desde la GO Bar o aquí.</Text></View>
        <Text style={styles.arrow}>→</Text>
      </Pressable>

      <View style={styles.ruleBar}><Text style={styles.ruleCode}>RULE</Text><Text style={styles.ruleText}>PORTFOLIO FIRST · EVIDENCE &gt; NARRATIVE · MISSING DATA = GATE · PRICE ≠ EVIDENCE</Text></View>
    </ScrollView>
  );
}

function LivePortfolio({ account, positions, brokerStatus, error }: { account: BrokerEnvelope | null; positions: BrokerEnvelope | null; brokerStatus: BrokerStatus | null; error: string | null }) {
  const accountRow = objectRow(account?.data);
  const rows = normalizeRows(positions?.data);
  const total = pickNumber(accountRow, 'total', 'equity', 'accountValue', 'value');
  const cash = pickNumber(accountRow, 'free', 'cash', 'availableCash', 'freeCash');
  const invested = pickNumber(accountRow, 'invested', 'investedValue');
  const ppl = pickNumber(accountRow, 'ppl', 'profitLoss', 'unrealizedPpl', 'result');
  const currency = pickText(accountRow, 'currency', 'currencyCode', 'currency_code');

  if (!account && !positions) {
    return (
      <View style={styles.portfolioGate}>
        <View style={styles.portfolioGateTop}><Text style={styles.portfolioLabel}>LIVE PORTFOLIO · TRADING 212</Text><Text style={styles.gateBadge}>{brokerStatus?.readReady ? 'LOCAL SESSION GATE' : 'BROKER GATE'}</Text></View>
        <Text style={styles.portfolioGateText}>{error || (brokerStatus?.readReady ? 'Conecta una vez el token de control en Broker Ω; quedará cifrado en el dispositivo y la cartera se cargará automáticamente al abrir ATLAS.' : 'Trading 212 todavía no está listo en el servidor.')}</Text>
        <Pressable onPress={() => router.push('/broker' as never)} style={styles.connectButton}><Text style={styles.connectText}>OPEN BROKER Ω →</Text></Pressable>
      </View>
    );
  }

  return (
    <View style={styles.portfolioPanel}>
      <View style={styles.portfolioTop}><View><Text style={styles.portfolioLabel}>LIVE PORTFOLIO · TRADING 212</Text><Text style={styles.portfolioSub}>{brokerStatus?.environment.toUpperCase()} · {brokerStatus?.mode} · {currency || 'ACCOUNT CCY'} · AUTO REFRESH 30s</Text></View><Text style={styles.liveBadge}>LIVE</Text></View>
      <View style={styles.portfolioMetrics}>
        <PortfolioMetric label="TOTAL" value={formatMoney(total, currency)} />
        <PortfolioMetric label="INVESTED" value={formatMoney(invested, currency)} />
        <PortfolioMetric label="CASH" value={formatMoney(cash, currency)} />
        <PortfolioMetric label="P/L" value={formatSignedMoney(ppl, currency)} tone={ppl !== null && ppl < 0 ? 'bad' : ppl !== null && ppl > 0 ? 'good' : 'neutral'} />
      </View>
      <View style={styles.positionsHeader}><Text style={[styles.positionHead, styles.positionFlex]}>POSITION</Text><Text style={styles.positionHead}>QTY</Text><Text style={styles.positionHead}>P/L</Text></View>
      {rows.slice(0, 8).map((row, index) => {
        const symbol = pickText(row, 'ticker', 'instrument', 'symbol') || `POS ${index + 1}`;
        const qty = pickNumber(row, 'quantity', 'qty');
        const rowPpl = pickNumber(row, 'ppl', 'profitLoss', 'result', 'unrealizedPpl');
        return <View key={`${symbol}-${index}`} style={styles.positionRow}><Text style={[styles.positionSymbol, styles.positionFlex]}>{symbol}</Text><Text style={styles.positionValue}>{formatNumber(qty)}</Text><Text style={[styles.positionValue, rowPpl !== null && rowPpl > 0 ? styles.good : rowPpl !== null && rowPpl < 0 ? styles.bad : null]}>{formatSignedMoney(rowPpl, currency)}</Text></View>;
      })}
      {rows.length > 8 ? <Pressable onPress={() => router.push('/portfolio' as never)}><Text style={styles.morePositions}>+ {rows.length - 8} MORE POSITIONS →</Text></Pressable> : null}
    </View>
  );
}

function SectionHeader({ code, title }: { code: string; title: string }) { return <View style={styles.sectionHeader}><Text style={styles.sectionCode}>{code}</Text><Text style={styles.sectionTitle}>{title}</Text><View style={styles.sectionLine} /></View>; }
function StatusCell({ label, value, tone }: { label: string; value: string; tone: 'good' | 'warn' | 'neutral' }) { return <View style={styles.statusCell}><Text style={styles.statusLabel}>{label}</Text><Text style={[styles.statusValue, tone === 'good' ? styles.good : tone === 'warn' ? styles.warn : styles.neutral]} numberOfLines={1}>{value}</Text></View>; }
function PortfolioMetric({ label, value, tone = 'neutral' }: { label: string; value: string; tone?: 'good' | 'bad' | 'neutral' }) { return <View style={styles.portfolioMetric}><Text style={styles.portfolioMetricLabel}>{label}</Text><Text style={[styles.portfolioMetricValue, tone === 'good' ? styles.good : tone === 'bad' ? styles.bad : null]}>{value}</Text></View>; }
function PriorityRow({ rank, title, detail, state, route }: { rank: string; title: string; detail: string; state: 'ACTIVE' | 'GATED'; route: string }) { return <Pressable onPress={() => router.push(route as never)} style={({ pressed }) => [styles.priorityRow, pressed && styles.pressed]}><Text style={styles.rank}>{rank}</Text><View style={styles.priorityText}><Text style={styles.priorityTitle}>{title}</Text><Text style={styles.priorityDetail}>{detail}</Text></View><View style={[styles.stateBadge, state === 'ACTIVE' ? styles.stateActive : styles.stateGated]}><Text style={styles.stateText}>{state}</Text></View></Pressable>; }
function WorkspaceTile({ code, title, meta, route }: { code: string; title: string; meta: string; route: string }) { return <Pressable onPress={() => router.push(route as never)} style={({ pressed }) => [styles.tile, pressed && styles.pressed]}><Text style={styles.tileCode}>{code}</Text><Text style={styles.tileTitle}>{title}</Text><Text style={styles.tileMeta}>{meta}</Text><Text style={styles.tileArrow}>OPEN →</Text></Pressable>; }

function objectRow(value: unknown): Record<string, unknown> { return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
function normalizeRows(value: unknown): Record<string, unknown>[] { if (Array.isArray(value)) return value.filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === 'object' && !Array.isArray(row)); const row = objectRow(value); for (const key of ['items', 'positions', 'data', 'results']) { const nested = row[key]; if (Array.isArray(nested)) return normalizeRows(nested); } return []; }
function normalizedKey(value: string): string { return value.toLowerCase().replace(/[^a-z0-9]/g, ''); }
function pickNumber(row: Record<string, unknown>, ...names: string[]): number | null { const normalized = new Map(Object.entries(row).map(([key, value]) => [normalizedKey(key), value])); for (const name of names) { const value = normalized.get(normalizedKey(name)); if (typeof value === 'number' && Number.isFinite(value)) return value; if (typeof value === 'string') { const parsed = Number(value); if (Number.isFinite(parsed)) return parsed; } } return null; }
function pickText(row: Record<string, unknown>, ...names: string[]): string | null { const normalized = new Map(Object.entries(row).map(([key, value]) => [normalizedKey(key), value])); for (const name of names) { const value = normalized.get(normalizedKey(name)); if (typeof value === 'string' && value.trim()) return value.trim(); } return null; }
function formatMoney(value: number | null, currency: string | null): string {
  if (value === null) return 'N/D';
  const code = currency?.trim().toUpperCase();
  if (!code || !/^[A-Z]{3}$/.test(code)) return value.toLocaleString('es-ES', { maximumFractionDigits: 2 });
  try { return new Intl.NumberFormat('es-ES', { style: 'currency', currency: code, maximumFractionDigits: 2 }).format(value); }
  catch { return `${value.toLocaleString('es-ES', { maximumFractionDigits: 2 })} ${code}`; }
}
function formatSignedMoney(value: number | null, currency: string | null): string { if (value === null) return 'N/D'; const formatted = formatMoney(Math.abs(value), currency); return `${value > 0 ? '+' : value < 0 ? '−' : ''}${formatted}`; }
function formatNumber(value: number | null): string { return value === null ? '—' : value.toLocaleString('es-ES', { maximumFractionDigits: 4 }); }

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#050708' }, content: { paddingHorizontal: 10, paddingTop: 12, paddingBottom: 22, gap: 10 },
  pageHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#1a262b' }, eyebrow: { color: '#607278', fontFamily: 'monospace', fontSize: 8, fontWeight: '900', letterSpacing: 1.1 }, title: { color: '#eef5f2', fontFamily: 'monospace', fontSize: 24, fontWeight: '900', marginTop: 2 },
  engineBadge: { marginLeft: 'auto', minHeight: 30, flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, paddingHorizontal: 8 }, engineOnline: { borderColor: '#23634f', backgroundColor: '#07150f' }, engineOffline: { borderColor: '#5e3535', backgroundColor: '#170b0b' }, engineDot: { width: 6, height: 6, borderRadius: 99 }, dotOnline: { backgroundColor: '#38e7aa' }, dotOffline: { backgroundColor: '#ef7676' }, engineText: { color: '#b9c9c3', fontFamily: 'monospace', fontSize: 7, fontWeight: '900' },
  portfolioGate: { borderWidth: 1, borderColor: '#514724', backgroundColor: '#111006', padding: 12, gap: 9 }, portfolioGateTop: { flexDirection: 'row', alignItems: 'center', gap: 8 }, portfolioLabel: { flex: 1, color: '#dce7e3', fontFamily: 'monospace', fontSize: 9, fontWeight: '900' }, gateBadge: { color: '#dfc66b', fontFamily: 'monospace', fontSize: 7, fontWeight: '900' }, portfolioGateText: { color: '#8e896a', fontSize: 10, lineHeight: 15 }, connectButton: { alignSelf: 'flex-start', borderWidth: 1, borderColor: '#645b2d', paddingHorizontal: 10, paddingVertical: 7 }, connectText: { color: '#dfc66b', fontFamily: 'monospace', fontSize: 8, fontWeight: '900' },
  portfolioPanel: { borderWidth: 1, borderColor: '#285b4a', backgroundColor: '#06100c', padding: 11, gap: 10 }, portfolioTop: { flexDirection: 'row', alignItems: 'center', gap: 8 }, portfolioSub: { color: '#4f6e63', fontFamily: 'monospace', fontSize: 7, marginTop: 3 }, liveBadge: { color: '#4ce8b5', borderWidth: 1, borderColor: '#2b6b55', paddingHorizontal: 6, paddingVertical: 3, fontFamily: 'monospace', fontSize: 7, fontWeight: '900' }, portfolioMetrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, portfolioMetric: { minWidth: 100, flexGrow: 1, borderTopWidth: 1, borderTopColor: '#163126', paddingTop: 7 }, portfolioMetricLabel: { color: '#476359', fontFamily: 'monospace', fontSize: 7, fontWeight: '900' }, portfolioMetricValue: { color: '#e5eeeb', fontFamily: 'monospace', fontSize: 13, fontWeight: '900', marginTop: 3 }, positionsHeader: { flexDirection: 'row', gap: 7, borderTopWidth: 1, borderTopColor: '#163126', paddingTop: 7 }, positionHead: { width: 70, color: '#486158', fontFamily: 'monospace', fontSize: 7, fontWeight: '900', textAlign: 'right' }, positionFlex: { flex: 1, textAlign: 'left' }, positionRow: { minHeight: 28, flexDirection: 'row', alignItems: 'center', gap: 7, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#11251d' }, positionSymbol: { color: '#cbd8d4', fontFamily: 'monospace', fontSize: 9, fontWeight: '900' }, positionValue: { width: 70, color: '#95a49f', fontFamily: 'monospace', fontSize: 8, textAlign: 'right' }, morePositions: { color: '#69caaa', fontFamily: 'monospace', fontSize: 8, fontWeight: '900', marginTop: 3 },
  statusStrip: { flexDirection: 'row', borderWidth: 1, borderColor: '#1a282d', backgroundColor: '#080d0f' }, statusCell: { flex: 1, minWidth: 0, paddingHorizontal: 8, paddingVertical: 8, borderRightWidth: 1, borderRightColor: '#172328' }, statusLabel: { color: '#506168', fontFamily: 'monospace', fontSize: 6, fontWeight: '900', letterSpacing: 0.7 }, statusValue: { marginTop: 3, fontFamily: 'monospace', fontSize: 8, fontWeight: '900' }, good: { color: '#49e8b7' }, bad: { color: '#e47c83' }, warn: { color: '#e0b761' }, neutral: { color: '#87969b' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 4 }, sectionCode: { color: '#41e6b2', fontFamily: 'monospace', fontSize: 8, fontWeight: '900' }, sectionTitle: { color: '#bdc9c6', fontFamily: 'monospace', fontSize: 9, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.8 }, sectionLine: { flex: 1, height: 1, backgroundColor: '#1a262b' },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, tile: { width: '48.8%', minHeight: 108, borderWidth: 1, borderColor: '#1b292e', backgroundColor: '#080d0f', padding: 9 }, tileCode: { color: '#45e7b3', fontFamily: 'monospace', fontSize: 8, fontWeight: '900' }, tileTitle: { color: '#e3ebe8', fontFamily: 'monospace', fontSize: 13, fontWeight: '900', marginTop: 8 }, tileMeta: { color: '#697980', fontSize: 9, lineHeight: 13, marginTop: 4 }, tileArrow: { color: '#739188', fontFamily: 'monospace', fontSize: 7, fontWeight: '900', marginTop: 'auto', paddingTop: 8 },
  stack: { borderWidth: 1, borderColor: '#1a282d', backgroundColor: '#070b0d' }, priorityRow: { minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#152126' }, rank: { width: 21, color: '#52636a', fontFamily: 'monospace', fontSize: 8, fontWeight: '900' }, priorityText: { flex: 1, minWidth: 0 }, priorityTitle: { color: '#dce6e2', fontFamily: 'monospace', fontSize: 10, fontWeight: '900' }, priorityDetail: { color: '#6c7c82', fontSize: 9, lineHeight: 13, marginTop: 3 }, stateBadge: { borderWidth: 1, paddingHorizontal: 5, paddingVertical: 3 }, stateActive: { borderColor: '#245f4d', backgroundColor: '#07140f' }, stateGated: { borderColor: '#5d4c2d', backgroundColor: '#171208' }, stateText: { color: '#aab8b4', fontFamily: 'monospace', fontSize: 6, fontWeight: '900' },
  securityHub: { minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: 9, borderWidth: 1, borderColor: '#2a654f', backgroundColor: '#07140f', padding: 9 }, securityCode: { width: 37, height: 30, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2d6f57' }, securityCodeText: { color: '#53edbd', fontFamily: 'monospace', fontSize: 8, fontWeight: '900' }, securityText: { flex: 1 }, securityTitle: { color: '#e8f1ed', fontFamily: 'monospace', fontSize: 10, fontWeight: '900' }, securityMeta: { color: '#708078', fontSize: 9, marginTop: 3 }, arrow: { color: '#4ce9b7', fontFamily: 'monospace', fontSize: 14 },
  ruleBar: { minHeight: 38, flexDirection: 'row', alignItems: 'center', gap: 8, borderTopWidth: 1, borderTopColor: '#1a262b', marginTop: 3 }, ruleCode: { color: '#4ae8b6', fontFamily: 'monospace', fontSize: 7, fontWeight: '900' }, ruleText: { flex: 1, color: '#65767c', fontFamily: 'monospace', fontSize: 7, lineHeight: 11 }, pressed: { opacity: 0.66 },
});
