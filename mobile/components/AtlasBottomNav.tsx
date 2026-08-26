import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

type NavKey = 'home' | 'portfolio' | 'watchlist' | 'radar' | 'more';

const ITEMS: { key: NavKey; label: string; glyph: string; route: '/' | '/portfolio' | '/watchlist' | '/radar' | '/more' }[] = [
  { key: 'home', label: 'Inicio', glyph: '⌂', route: '/' },
  { key: 'portfolio', label: 'Cartera', glyph: '▦', route: '/portfolio' },
  { key: 'watchlist', label: 'Watchlist', glyph: '★', route: '/watchlist' },
  { key: 'radar', label: 'Radar Ω', glyph: '◎', route: '/radar' },
  { key: 'more', label: 'Más', glyph: '•••', route: '/more' },
];

export default function AtlasBottomNav({ active }: { active: NavKey }) {
  const router = useRouter();
  return (
    <View style={styles.bar}>
      {ITEMS.map((item) => {
        const selected = item.key === active;
        return (
          <Pressable
            key={item.key}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            onPress={() => router.replace(item.route)}
            style={({ pressed }) => [styles.item, pressed && styles.pressed]}
          >
            <Text style={[styles.glyph, selected && styles.active]}>{item.glyph}</Text>
            <Text style={[styles.label, selected && styles.active]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 72,
    flexDirection: 'row',
    backgroundColor: '#0b0f12',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#2a3036',
    paddingBottom: 6,
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.55 },
  glyph: { color: '#68727c', fontSize: 20, lineHeight: 23, fontWeight: '900' },
  label: { color: '#929ba3', fontSize: 9, fontWeight: '800', marginTop: 3 },
  active: { color: '#27c992' },
});
