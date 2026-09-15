import { Slot, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { TerminalShell } from '../core/ui/TerminalShell';

export default function RootLayout() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <TerminalShell>
        <Slot />
      </TerminalShell>
      <Pressable
        accessibilityLabel="Abrir Radar Omega"
        onPress={() => router.push('/radar' as never)}
        style={({ pressed }) => [styles.radarShortcut, pressed && styles.pressed]}
      >
        <Text style={styles.radarCode}>RAD</Text>
        <Text style={styles.radarLabel}>Radar Ω</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#030506' },
  radarShortcut: {
    position: 'absolute',
    right: 12,
    bottom: 57,
    zIndex: 100,
    minWidth: 72,
    height: 35,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#2d6754',
    backgroundColor: '#07130f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarCode: { color: '#51f2c5', fontFamily: 'monospace', fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  radarLabel: { color: '#a8cfc1', fontFamily: 'monospace', fontSize: 7, marginTop: 1 },
  pressed: { opacity: 0.65 },
});
