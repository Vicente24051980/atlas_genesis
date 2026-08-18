import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { brokerTheme as t } from '../ui/brokerTheme';

export type NavKey = 'home' | 'portfolio' | 'watchlist' | 'radar' | 'more';

type Route = '/' | '/portfolio' | '/watchlist' | '/radar' | '/more';

const ITEMS: Array<{ key: NavKey; label: string; glyph: string; route: Route }> = [
  { key: 'home', label: 'Inicio', glyph: '⌂', route: '/' },
  { key: 'portfolio', label: 'Cartera', glyph: '▥', route: '/portfolio' },
  { key: 'watchlist', label: 'Watchlist', glyph: '☆', route: '/watchlist' },
  { key: 'radar', label: 'Radar', glyph: '◎', route: '/radar' },
  { key: 'more', label: 'Más', glyph: '•••', route: '/more' },
];

export default function AtlasBottomNav({ active }: { active: NavKey }) {
  const router = useRouter();
  return (
    <View style={styles.bar}>
      {ITEMS.map((item) => {
        const selected = item.key === active;
        return (
          <Pressable key={item.key} accessibilityRole="button" accessibilityLabel={item.label} onPress={() => router.replace(item.route)} style={({ pressed }) => [styles.item, pressed && styles.pressed]}>
            <View style={[styles.glyphWrap, selected && styles.glyphWrapActive]}><Text style={[styles.glyph, selected && styles.active]}>{item.glyph}</Text></View>
            <Text style={[styles.label, selected && styles.active]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { height: 68, flexDirection: 'row', backgroundColor: '#0B0E12', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.border, paddingTop: 5 },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  pressed: { opacity: 0.55 },
  glyphWrap: { minWidth: 34, height: 27, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  glyphWrapActive: { backgroundColor: t.accentSoft },
  glyph: { color: t.textFaint, fontSize: 17, lineHeight: 20, fontWeight: '900' },
  label: { color: t.textMuted, fontSize: 9, fontWeight: '800' },
  active: { color: t.accent },
});
