import { useEffect, useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CatalystApi, CatalystPayload } from '../../core/api/catalystApi';

type PanelState = 'READY' | 'DATA GATE' | 'BROKER GATE';
type ModuleSpec = { title: string; code: string; description: string; panels: { title: string; detail: string; state: PanelState }[]; primary?: { label: string; route: string } };

const MODULES: Record<string, ModuleSpec> = {
  markets: {
    title: 'Markets', code: 'MKT',
    description: 'Mercados mundiales, índices en tiempo real, macro, movers y rotación. El tape global consume FinancialData.Net index-quotes cuando la suscripción Premium está disponible.',
    panels: [
      { title: 'Global Index Tape', detail: 'S&P 500, Nasdaq 100, Dow, Russell, Euro Stoxx, DAX, FTSE, CAC, IBEX, Nikkei, Hang Seng, Shanghai, KOSPI, ASX, Sensex, Bovespa y TSX.', state: 'READY' },
      { title: 'Money Rotation Ω', detail: 'Mercado → sectores → industrias → acciones → flujo/volumen → fuerza relativa → persistencia.', state: 'READY' },
      { title: 'Movers / Breadth', detail: 'Ganadores, perdedores, gaps, volumen anómalo y amplitud con sesión regular separada de 24/5.', state: 'DATA GATE' },
      { title: 'Macro Regime', detail: 'Oro, BTC, tipos, USD, crédito, petróleo y breadth para clasificar el régimen.', state: 'READY' },
    ],
    primary: { label: 'Abrir Security Hub', route: '/analyze' },
  },
  opportunities: {
    title: 'Opportunities', code: 'OPP',
    description: 'Mesa de oportunidades de ATLAS. Separa compañía excelente, receptor de dinero actual, dislocación y entrada ejecutable.',
    panels: [
      { title: 'Wave Detection Ω', detail: 'Fundamentales, revisiones, momentum, noticias materiales y riesgo → Wave Score con umbral explícito.', state: 'READY' },
      { title: 'Money Rotation Ω', detail: 'Receptores de capital hoy, sin permitir que calidad fundamental sustituya evidencia de flujo.', state: 'READY' },
      { title: 'Return / Valuation Ω', detail: 'CAGR implícito, normalización cíclica y brecha entre expectativas y precio.', state: 'READY' },
      { title: 'Entry Discipline', detail: 'GREEN, no-chase, opening gate y ejecución por tramos antes de asignar capital.', state: 'READY' },
    ],
    primary: { label: 'Auditar candidato', route: '/audit' },
  },
  atlas: {
    title: 'ATLAS Ω', code: 'Ω',
    description: 'Centro de decisión. Evidence Director primero; después motores especialistas, contradicciones, Falsifiers Ω y decisión.',
    panels: [
      { title: 'Investment Committee Ω', detail: 'Economic Proof, valoración, CAPEX, moat, rotación, macro, falsificadores y evidencia.', state: 'READY' },
      { title: 'Evidence Director', detail: 'FACT / HYPOTHESIS / INTERPRETATION / NOISE con trazabilidad y conflictos preservados.', state: 'READY' },
      { title: 'Engine Grid', detail: 'GREEN, Retorno, Money Rotation, Defensive, Clinical Shock, CAPEX y motores aplicables.', state: 'READY' },
      { title: 'Falsifiers Ω', detail: 'Veto independiente antes de cualquier salida de decisión.', state: 'READY' },
    ],
    primary: { label: 'Abrir AUDIT', route: '/audit' },
  },
  screener: {
    title: 'Screener', code: 'SCR',
    description: 'Universos, filtros, rankings y comparaciones. Un filtro identifica candidatos; nunca crea automáticamente una orden.',
    panels: [
      { title: 'Universe Builder', detail: 'Master Universe, sectores, regiones, market cap, disponibilidad T212 y listas congeladas.', state: 'READY' },
      { title: 'GREEN Ω', detail: '1W / 1M / 3M / 1Y / TOTAL con corte temporal sincronizado.', state: 'DATA GATE' },
      { title: 'Return Ω', detail: 'Expectativas inversas, CAGR normalizado y sensibilidad de múltiplos/ciclos.', state: 'READY' },
      { title: 'Ranking Board', detail: 'Ranking por motor y consenso sin votación simple.', state: 'READY' },
    ],
    primary: { label: 'Auditar resultado', route: '/audit' },
  },
  research: {
    title: 'Research', code: 'RSR',
    description: 'Descubrimiento y adquisición de evidencia con Firecrawl Search Ω, fuentes primarias y documentación trazable.',
    panels: [
      { title: 'Evidence Search', detail: 'Web, news, research, GitHub, PDF y developer con provenance por resultado.', state: 'READY' },
      { title: 'Clinical Evidence', detail: 'Ensayos, endpoints, magnitud clínica, probabilidad regulatoria, TAM y economics.', state: 'READY' },
      { title: 'CAPEX Chain', detail: 'Comprador → bottleneck → proveedor → captura económica → fragilidad.', state: 'READY' },
      { title: 'Thesis Notes', detail: 'ACTIVA / REVISIÓN EXTRAORDINARIA / MODIFICADA / RETIRADA.', state: 'READY' },
    ],
    primary: { label: 'Abrir Security Hub', route: '/analyze' },
  },
  catalysts: {
    title: 'Catalysts', code: 'CAL',
    description: 'Calendario operativo para resultados, FDA/clinical, guidance, macro, investor days y eventos que puedan cambiar una tesis.',
    panels: [
      { title: 'Earnings Calendar', detail: 'Cargando calendario real del proveedor…', state: 'DATA GATE' },
      { title: 'Clinical / FDA', detail: 'Readouts, PDUFA, congresos y evidencia clínica conectados a Clinical Evidence Shock Ω.', state: 'READY' },
      { title: 'Macro Events', detail: 'Cargando calendario macro del proveedor…', state: 'DATA GATE' },
      { title: 'Catalyst Alerts', detail: 'Eventos enlazados con watchlist, resultados guardados y falsificadores.', state: 'READY' },
    ],
    primary: { label: 'Abrir Watchlist', route: '/watchlist' },
  },
  news: {
    title: 'News', code: 'NEWS',
    description: 'Noticias filtradas por relevancia ATLAS. Firecrawl descubre y extrae; Evidence Director determina cómo puede utilizarse cada pieza.',
    panels: [
      { title: 'Live News Search', detail: 'Firecrawl Search Ω con web/news, ventanas temporales y contenido completo por resultado.', state: 'READY' },
      { title: 'Source Hierarchy', detail: 'Primaria > regulatoria > IR > prensa fiable > análisis > ruido. AI nunca es evidencia.', state: 'READY' },
      { title: 'Materiality Filter', detail: 'Separa evento que cambia economics/tesis de movimiento narrativo o repetición de titulares.', state: 'READY' },
      { title: 'Ticker Linkage', detail: 'Noticias vinculadas a watchlist, auditorías y falsificadores.', state: 'READY' },
    ],
    primary: { label: 'Abrir Research', route: '/workspace/research' },
  },
  orders: {
    title: 'Orders', code: 'ORD',
    description: 'Ejecución separada del análisis. Demo/paper por defecto y live fail-closed.',
    panels: [
      { title: 'Open Orders', detail: 'Órdenes pendientes y estado upstream de Trading 212.', state: 'BROKER GATE' },
      { title: 'Order Ticket', detail: 'Market, limit, stop y stop-limit con confirmación explícita y clientRequestId único.', state: 'BROKER GATE' },
      { title: 'History', detail: 'Órdenes, dividendos y transacciones con paginación del broker.', state: 'BROKER GATE' },
      { title: 'Execution Safety', detail: 'Demo por defecto, kill switch live y disciplina de sesión regular.', state: 'READY' },
    ],
    primary: { label: 'Abrir Broker Ω', route: '/broker' },
  },
  risk: {
    title: 'Risk', code: 'RSK',
    description: 'Riesgo de cartera, concentración y exposición sin confundir volatilidad de precio con deterioro fundamental.',
    panels: [
      { title: 'Exposure', detail: 'Sector, factor, moneda, región y cadenas económicas.', state: 'DATA GATE' },
      { title: 'Concentration', detail: 'Pesos, contribución al riesgo y solapamiento de tesis.', state: 'DATA GATE' },
      { title: 'Drawdown', detail: 'Pérdida máxima, recuperación y stress por régimen.', state: 'DATA GATE' },
      { title: 'Correlation', detail: 'Matriz de correlación y clústeres cuando exista histórico validado.', state: 'DATA GATE' },
    ],
    primary: { label: 'Abrir cartera', route: '/portfolio' },
  },
};

export default function WorkspaceScreen() {
  const params = useLocalSearchParams<{ module?: string }>();
  const key = typeof params.module === 'string' ? params.module.toLowerCase() : 'atlas';
  const spec: ModuleSpec = MODULES[key] ?? MODULES.atlas!;
  const [catalysts, setCatalysts] = useState<CatalystPayload | null>(null);
  const [catalystError, setCatalystError] = useState<string | null>(null);

  useEffect(() => {
    if (key !== 'catalysts') return;
    let mounted = true;
    CatalystApi.upcoming(14)
      .then((payload) => { if (mounted) { setCatalysts(payload); setCatalystError(null); } })
      .catch((cause) => { if (mounted) setCatalystError(cause instanceof Error ? cause.message : String(cause)); });
    return () => { mounted = false; };
  }, [key]);

  const panels = useMemo(() => {
    if (key !== 'catalysts') return spec.panels;
    return spec.panels.map((panel) => {
      if (panel.title === 'Earnings Calendar') {
        if (!catalysts) return catalystError ? { ...panel, state: 'DATA GATE' as const, detail: `Feed no disponible: ${catalystError}` } : panel;
        return {
          ...panel,
          state: catalysts.earnings.state === 'READY' ? 'READY' as const : 'DATA GATE' as const,
          detail: earningsDetail(catalysts),
        };
      }
      if (panel.title === 'Macro Events') {
        if (!catalysts) return catalystError ? { ...panel, state: 'DATA GATE' as const, detail: `Feed no disponible: ${catalystError}` } : panel;
        return {
          ...panel,
          state: catalysts.macro.state === 'READY' ? 'READY' as const : 'DATA GATE' as const,
          detail: macroDetail(catalysts),
        };
      }
      return panel;
    });
  }, [key, spec.panels, catalysts, catalystError]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}><View style={styles.codeBox}><Text style={styles.code}>{spec.code}</Text></View><View style={styles.headerText}><Text style={styles.eyebrow}>ATLAS TERMINAL · WORKSPACE</Text><Text style={styles.title}>{spec.title}</Text></View></View>
      <Text style={styles.description}>{spec.description}</Text>
      <View style={styles.grid}>{panels.map((panel) => <View key={panel.title} style={styles.panel}><View style={styles.panelTop}><Text style={styles.panelTitle}>{panel.title}</Text><StateBadge state={panel.state} /></View><Text style={styles.panelDetail}>{panel.detail}</Text></View>)}</View>
      {spec.primary ? <Pressable accessibilityRole="button" accessibilityLabel={spec.primary.label} onPress={() => router.push(spec.primary!.route as never)} style={({ pressed }) => [styles.primary, pressed && styles.pressed]}><Text style={styles.primaryCode}>GO</Text><Text style={styles.primaryText}>{spec.primary.label}</Text><Text style={styles.primaryArrow}>→</Text></Pressable> : null}
      <View style={styles.rule}><Text style={styles.ruleTitle}>TERMINAL RULE</Text><Text style={styles.ruleText}>Una superficie puede existir antes que su feed. Si falta evidencia certificada, ATLAS muestra DATA GATE en lugar de fabricar una cifra.</Text></View>
    </ScrollView>
  );
}

function earningsDetail(payload: CatalystPayload): string {
  const preview = payload.earnings.items.slice(0, 4).map((row) => `${row.date || '—'} ${row.symbol || '—'}${row.hour ? ` ${row.hour.toUpperCase()}` : ''}`).join(' · ');
  return `${payload.earnings.detail}${preview ? ` Próximos: ${preview}.` : ''} Fuente: ${payload.source}.`;
}

function macroDetail(payload: CatalystPayload): string {
  const preview = payload.macro.items.slice(0, 3).map((row) => `${row.time || '—'} ${row.country || ''} ${row.event || '—'}`).join(' · ');
  return `${payload.macro.detail}${preview ? ` Próximos: ${preview}.` : ''} Fuente: ${payload.source}.`;
}

function StateBadge({ state }: { state: PanelState }) { const style = state === 'READY' ? styles.ready : state === 'BROKER GATE' ? styles.broker : styles.gate; return <View style={[styles.badge, style]}><Text style={styles.badgeText}>{state}</Text></View>; }

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#050708' }, content: { paddingHorizontal: 12, paddingTop: 14, paddingBottom: 24, gap: 12 }, headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: '#1b272c', paddingBottom: 12 }, codeBox: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2e6c58', backgroundColor: '#071510' }, code: { color: '#54efbd', fontFamily: 'monospace', fontSize: 14, fontWeight: '900' }, headerText: { flex: 1 }, eyebrow: { color: '#5e7379', fontFamily: 'monospace', fontSize: 8, fontWeight: '900', letterSpacing: 1.1 }, title: { color: '#eff5f3', fontFamily: 'monospace', fontSize: 24, fontWeight: '900', marginTop: 3 }, description: { color: '#8c9a9f', fontSize: 12, lineHeight: 18 }, grid: { gap: 8 }, panel: { minHeight: 102, borderWidth: 1, borderColor: '#1b292e', backgroundColor: '#080d0f', padding: 12 }, panelTop: { flexDirection: 'row', alignItems: 'center', gap: 8 }, panelTitle: { flex: 1, color: '#dfe8e5', fontFamily: 'monospace', fontWeight: '900', fontSize: 11 }, panelDetail: { color: '#708086', marginTop: 9, lineHeight: 17, fontSize: 11 }, badge: { borderWidth: 1, paddingHorizontal: 6, paddingVertical: 3 }, ready: { borderColor: '#236a52', backgroundColor: '#081912' }, gate: { borderColor: '#5e4b2a', backgroundColor: '#171208' }, broker: { borderColor: '#425975', backgroundColor: '#0b121b' }, badgeText: { color: '#aebbb7', fontFamily: 'monospace', fontSize: 7, fontWeight: '900', letterSpacing: 0.5 }, primary: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#2f725b', backgroundColor: '#071510', paddingHorizontal: 12 }, primaryCode: { color: '#50e9b8', fontFamily: 'monospace', fontSize: 9, fontWeight: '900' }, primaryText: { flex: 1, color: '#e8f3ef', fontFamily: 'monospace', fontSize: 11, fontWeight: '900' }, primaryArrow: { color: '#50e9b8', fontFamily: 'monospace', fontSize: 14 }, pressed: { opacity: 0.7 }, rule: { borderTopWidth: 1, borderTopColor: '#1a2428', paddingTop: 12 }, ruleTitle: { color: '#4fe8b6', fontFamily: 'monospace', fontSize: 8, fontWeight: '900', letterSpacing: 1 }, ruleText: { color: '#718087', fontSize: 10, lineHeight: 16, marginTop: 5 },
});
