import type { ReactElement, ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { RefreshControlProps } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AtlasBottomNav, { type NavKey } from './AtlasBottomNav';
import { brokerTheme as t } from '../ui/brokerTheme';

export default function AtlasBrokerShell({
  active,
  title,
  eyebrow = 'ATLAS Ω',
  children,
  refreshControl,
  keyboardShouldPersistTaps,
  hideBottomNav = false,
}: {
  active: NavKey;
  title: string;
  eyebrow?: string;
  children: ReactNode;
  refreshControl?: ReactElement<RefreshControlProps>;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
  hideBottomNav?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 8) }]}>
      <View style={styles.topbar}>
        <Pressable onPress={() => router.replace('/')} style={styles.brand}>
          <View style={styles.logo}><Text style={styles.logoText}>Ω</Text></View>
          <View><Text style={styles.eyebrow}>{eyebrow}</Text><Text numberOfLines={1} style={styles.title}>{title}</Text></View>
        </Pressable>
        <View style={styles.topActions}>
          <Pressable accessibilityLabel="Buscar" onPress={() => router.push('/markets')} style={styles.iconButton}><Text style={styles.iconText}>⌕</Text></Pressable>
          <Pressable accessibilityLabel="Menú" onPress={() => router.push('/more')} style={styles.iconButton}><Text style={styles.iconText}>☰</Text></Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={refreshControl}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>

      {!hideBottomNav ? <View style={{ paddingBottom: insets.bottom }}><AtlasBottomNav active={active} /></View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  topbar: { height: 66, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.borderSoft },
  brand: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 36, height: 36, borderRadius: 12, backgroundColor: t.accentSoft, borderWidth: StyleSheet.hairlineWidth, borderColor: '#285849', alignItems: 'center', justifyContent: 'center' },
  logoText: { color: t.accent, fontSize: 21, fontWeight: '900' },
  eyebrow: { color: t.textFaint, fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  title: { color: t.text, fontSize: 16, fontWeight: '900', maxWidth: 220, marginTop: 1 },
  topActions: { flexDirection: 'row', gap: 7 },
  iconButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: t.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: t.border, alignItems: 'center', justifyContent: 'center' },
  iconText: { color: t.text, fontSize: 18, fontWeight: '800' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 30, gap: 12 },
});
