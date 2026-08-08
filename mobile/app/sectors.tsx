import { useCallback, useState } from 'react';
import { desc } from 'drizzle-orm';
import { useFocusEffect } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { db } from '../db/client';
import { company, marketSnapshot, position } from '../db/schema';

type SectorRow = {
  sector: string;
  positions: number;
  invested: number;
  marketValue: number;
  pnl: number;
  weight: number;
  dayWeightedPct: number | null;
  tickers: string[];
};

export default function SectorsScreen() {
  const [rows, setRows] = useState<SectorRow[]>([]);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    const [positions, companies, markets] = await Promise.all([
      db.select().from(position),
      db.select().from(company),
      db.select().from(marketSnapshot).orderBy(desc(marketSnapshot.observedAt)),
    ]);
    const companyByTicker = new Map(companies.map((item) => [item.canonicalTicker, item]));
    const latestMarketByCompany = new Map<string, typeof markets[number]>();
    for (const market of markets) if (!latestMarketByCompany.has(market.companyId)) latestMarketByCompany.set(market.companyId, market);

    const aggregate = new Map<string, Omit<SectorRow, 'weight' | 'dayWeightedPct'> & { dayNumerator: number; dayDenominator: number }>();
    for (const pos of positions.filter((item) => item.status === 'ACTIVE')) {
      const comp = companyByTicker.get(pos.canonicalTicker);
      const sector = comp?.sector || 'Unclassified';
      const market = comp ? latestMarketByCompany.get(comp.id) : undefined;
      const invested = (pos.costBasis || 0) * pos.quantity;
      const marketValue = market?.price == null ? invested : market.price * pos.quantity;
      const pnl = marketValue - invested;
      const current = aggregate.get(sector) || { sector, positions: 0, invested: 0, marketValue: 0, pnl: 0, tickers: [], dayNumerator: 0, dayDenominator: 0 };
      current.positions += 1;
      current.invested += invested;
      current.marketValue += marketValue;
      current.pnl += pnl;
      current.tickers.push(pos.canonicalTicker);
      if (market?.changePct != null && marketValue > 0) {
        current.dayNumerator += market.changePct * marketValue;
        current.dayDenominator += marketValue;
      }
      aggregate.set(sector, current);
    }
    const grand = [...aggregate.values()].reduce((sum, item) => sum + item.marketValue, 0);
    setTotal(grand);
    setRows([...aggregate.values()].map((item) => ({
      sector: item.sector,
      positions: item.positions,
      invested: item.invested,
      marketValue: item.marketValue,
      pnl: item.pnl,
      tickers: item.tickers.sort(),
      weight: grand > 0 ? (item.marketValue / grand) * 100 : 0,
      dayWeightedPct: item.dayDenominator > 0 ? item.dayNumerator / item.dayDenominator : null,
    })).sort((a, b) => b.marketValue - a.marketValue));
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>ATLAS Ω · SECTOR INTELLIGENCE</Text>
      <Text style={styles.title}>Exposición y concentración</Text>
      <Text style={styles.subtitle}>Agrupa la cartera por sector usando la entidad canónica y el último market snapshot disponible.</Text>

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>MARKET VALUE TRACKED</Text>
        <Text style={styles.totalValue}>{formatMoney(total)}</Text>
        <Text style={styles.totalHint}>{rows.length} sectores · {rows.reduce((sum, row) => sum + row.positions, 0)} posiciones</Text>
      </View>

      {rows.map((row) => (
        <View key={row.sector} style={styles.card}>
          <View style={styles.rowTop}>
            <View style={styles.flex}><Text style={styles.sector}>{row.sector}</Text><Text style={styles.tickers}>{row.tickers.join(' · ')}</Text></View>
            <View style={styles.alignRight}><Text style={styles.weight}>{row.weight.toFixed(1)}%</Text><Text style={[styles.day, row.dayWeightedPct != null && row.dayWeightedPct < 0 ? styles.negative : styles.positive]}>{row.dayWeightedPct == null ? '—' : `${row.dayWeightedPct >= 0 ? '+' : ''}${row.dayWeightedPct.toFixed(2)}%`}</Text></View>
          </View>
          <View style={styles.barTrack}><View style={[styles.bar, { width: `${Math.max(2, Math.min(row.weight, 100))}%` }]} /></View>
          <View style={styles.metrics}>
            <Metric label="VALUE" value={formatMoney(row.marketValue)} />
            <Metric label="COST" value={formatMoney(row.invested)} />
            <Metric label="P/L" value={formatMoney(row.pnl)} tone={row.pnl < 0 ? 'bad' : 'good'} />
            <Metric label="N" value={String(row.positions)} />
          </View>
        </View>
      ))}
      {!rows.length ? <Text style={styles.empty}>Añade posiciones y resuelve tickers en Terminal para construir el mapa sectorial.</Text> : null}
    </ScrollView>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: 'good' | 'bad' }) {
  return <View style={styles.metric}><Text style={styles.metricLabel}>{label}</Text><Text style={[styles.metricValue, tone === 'good' ? styles.positive : tone === 'bad' ? styles.negative : undefined]}>{value}</Text></View>;
}
const formatMoney = (value: number) => `${new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(value)} €`;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#05080c' },
  content: { padding: 14, paddingBottom: 40, gap: 10 },
  eyebrow: { color: '#617589', fontSize: 9, fontWeight: '900', letterSpacing: 1.4 },
  title: { color: '#eff4f8', fontSize: 24, fontWeight: '950' },
  subtitle: { color: '#728497', fontSize: 11, lineHeight: 17 },
  totalCard: { marginTop: 6, backgroundColor: '#091018', borderWidth: 1, borderColor: '#183043', borderRadius: 10, padding: 14 },
  totalLabel: { color: '#60788d', fontSize: 8, fontWeight: '950', letterSpacing: 1 },
  totalValue: { color: '#eaf3f9', fontSize: 29, fontWeight: '950', marginTop: 5 },
  totalHint: { color: '#53677a', fontSize: 9, marginTop: 4 },
  card: { backgroundColor: '#090e14', borderWidth: 1, borderColor: '#17222e', borderRadius: 10, padding: 12, gap: 9 },
  rowTop: { flexDirection: 'row', gap: 10 },
  flex: { flex: 1 },
  alignRight: { alignItems: 'flex-end' },
  sector: { color: '#dce5ec', fontSize: 14, fontWeight: '900' },
  tickers: { color: '#586b7d', fontSize: 8, lineHeight: 13, marginTop: 4 },
  weight: { color: '#cdeefa', fontSize: 16, fontWeight: '950' },
  day: { fontSize: 9, fontWeight: '900', marginTop: 3 },
  positive: { color: '#49d99d' },
  negative: { color: '#ff6e80' },
  barTrack: { height: 4, borderRadius: 2, backgroundColor: '#101a24', overflow: 'hidden' },
  bar: { height: 4, backgroundColor: '#55ccef', borderRadius: 2 },
  metrics: { flexDirection: 'row', gap: 5 },
  metric: { flex: 1, padding: 7, borderRadius: 6, backgroundColor: '#0b1219' },
  metricLabel: { color: '#516476', fontSize: 7, fontWeight: '900' },
  metricValue: { color: '#aebdca', fontSize: 10, fontWeight: '900', marginTop: 3 },
  empty: { color: '#607285', textAlign: 'center', marginTop: 30, lineHeight: 18 },
});
