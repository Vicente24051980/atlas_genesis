import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { router } from 'expo-router';
import type { ReactNode } from 'react';

import { brokerTheme as t } from '../ui/brokerTheme';

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && onAction ? <Pressable onPress={onAction}><Text style={styles.sectionAction}>{action}</Text></Pressable> : null}
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function MetricTile({ label, value, tone = 'default', hint }: { label: string; value: string; tone?: 'default' | 'positive' | 'negative' | 'info'; hint?: string }) {
  const toneStyle = tone === 'positive' ? styles.positive : tone === 'negative' ? styles.negative : tone === 'info' ? styles.info : styles.metricValue;
  return (
    <View style={styles.metricTile}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={toneStyle}>{value}</Text>
      {hint ? <Text style={styles.metricHint}>{hint}</Text> : null}
    </View>
  );
}

export function Pill({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'positive' | 'warning' | 'info' | 'negative' }) {
  const palette = tone === 'positive' ? styles.pillPositive : tone === 'warning' ? styles.pillWarning : tone === 'info' ? styles.pillInfo : tone === 'negative' ? styles.pillNegative : styles.pillNeutral;
  return <View style={[styles.pill, palette]}><Text style={styles.pillText}>{label}</Text></View>;
}

export function InstrumentRow({ ticker, name, meta, value, change, onPress }: { ticker: string; name?: string; meta?: string; value?: string; change?: number | null; onPress?: () => void }) {
  const body = (
    <View style={styles.instrumentRow}>
      <View style={styles.symbolBadge}><Text style={styles.symbolText}>{ticker.slice(0, 2)}</Text></View>
      <View style={styles.instrumentBody}>
        <Text style={styles.instrumentTicker}>{ticker}</Text>
        <Text numberOfLines={1} style={styles.instrumentName}>{name || meta || 'ATLAS instrument'}</Text>
        {name && meta ? <Text numberOfLines={1} style={styles.instrumentMeta}>{meta}</Text> : null}
      </View>
      <View style={styles.instrumentRight}>
        {value ? <Text style={styles.instrumentValue}>{value}</Text> : null}
        {typeof change === 'number' ? <Text style={change >= 0 ? styles.positiveSmall : styles.negativeSmall}>{change >= 0 ? '+' : ''}{change.toFixed(2)}%</Text> : <Text style={styles.chevron}>›</Text>}
      </View>
    </View>
  );
  return onPress ? <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>{body}</Pressable> : body;
}

export function MenuRow({ glyph, title, subtitle, route }: { glyph: string; title: string; subtitle: string; route: string }) {
  return (
    <Pressable onPress={() => router.push(route as never)} style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}>
      <View style={styles.menuGlyph}><Text style={styles.menuGlyphText}>{glyph}</Text></View>
      <View style={styles.menuBody}><Text style={styles.menuTitle}>{title}</Text><Text style={styles.menuSubtitle}>{subtitle}</Text></View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return <View style={styles.empty}><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyText}>{text}</Text></View>;
}

const styles = StyleSheet.create({
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 2 },
  sectionTitle: { color: t.text, fontSize: 15, fontWeight: '800' },
  sectionAction: { color: t.accent, fontSize: 12, fontWeight: '800' },
  card: { backgroundColor: t.surface, borderRadius: t.radius, borderWidth: StyleSheet.hairlineWidth, borderColor: t.border, padding: 15 },
  metricTile: { flex: 1, minWidth: '46%', backgroundColor: t.surface, borderRadius: 15, borderWidth: StyleSheet.hairlineWidth, borderColor: t.border, padding: 14, gap: 5 },
  metricLabel: { color: t.textMuted, fontSize: 11, fontWeight: '700' },
  metricValue: { color: t.text, fontSize: 20, fontWeight: '900' },
  metricHint: { color: t.textFaint, fontSize: 10 },
  positive: { color: t.positive, fontSize: 20, fontWeight: '900' },
  negative: { color: t.negative, fontSize: 20, fontWeight: '900' },
  info: { color: t.info, fontSize: 20, fontWeight: '900' },
  pill: { alignSelf: 'flex-start', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 9, borderWidth: StyleSheet.hairlineWidth },
  pillNeutral: { backgroundColor: t.surfaceRaised, borderColor: t.border },
  pillPositive: { backgroundColor: t.positiveSoft, borderColor: '#245A43' },
  pillWarning: { backgroundColor: t.warningSoft, borderColor: '#66542C' },
  pillInfo: { backgroundColor: t.infoSoft, borderColor: '#29496F' },
  pillNegative: { backgroundColor: t.negativeSoft, borderColor: '#71323B' },
  pillText: { color: t.text, fontSize: 10, fontWeight: '800' },
  instrumentRow: { minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.borderSoft },
  symbolBadge: { width: 38, height: 38, borderRadius: 19, backgroundColor: t.surfaceRaised, alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth, borderColor: t.border },
  symbolText: { color: t.text, fontSize: 11, fontWeight: '900' },
  instrumentBody: { flex: 1, minWidth: 0 },
  instrumentTicker: { color: t.text, fontSize: 14, fontWeight: '900' },
  instrumentName: { color: t.textMuted, fontSize: 11, marginTop: 2 },
  instrumentMeta: { color: t.textFaint, fontSize: 10, marginTop: 2 },
  instrumentRight: { alignItems: 'flex-end', gap: 3 },
  instrumentValue: { color: t.text, fontSize: 13, fontWeight: '800' },
  positiveSmall: { color: t.positive, fontSize: 11, fontWeight: '800' },
  negativeSmall: { color: t.negative, fontSize: 11, fontWeight: '800' },
  chevron: { color: t.textFaint, fontSize: 25, fontWeight: '300' },
  pressed: { opacity: 0.6 },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 72, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.borderSoft },
  menuGlyph: { width: 42, height: 42, borderRadius: 13, backgroundColor: t.surfaceRaised, alignItems: 'center', justifyContent: 'center' },
  menuGlyphText: { color: t.accent, fontWeight: '900', fontSize: 18 },
  menuBody: { flex: 1 },
  menuTitle: { color: t.text, fontWeight: '800', fontSize: 14 },
  menuSubtitle: { color: t.textMuted, fontSize: 11, lineHeight: 16, marginTop: 2 },
  empty: { backgroundColor: t.surfaceSoft, borderRadius: t.radius, padding: 18, borderWidth: StyleSheet.hairlineWidth, borderColor: t.border, gap: 5 },
  emptyTitle: { color: t.text, fontWeight: '800' },
  emptyText: { color: t.textMuted, fontSize: 12, lineHeight: 18 },
});
