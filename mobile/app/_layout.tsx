import { useEffect, useState } from 'react';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useDatabaseInitialization } from '../db/migrator';
import { FunctionalGateResult, runMobileFunctionalSelfTest } from '../db/runtimeSelfTest';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isReady, error } = useDatabaseInitialization();
  const [functionalGate, setFunctionalGate] = useState<FunctionalGateResult | null>(null);

  useEffect(() => {
    if (!isReady || error) return;
    let active = true;
    void runMobileFunctionalSelfTest()
      .then((result) => { if (active) setFunctionalGate(result); })
      .catch((cause) => {
        if (!active) return;
        setFunctionalGate({
          ok: false,
          checkedAt: new Date().toISOString(),
          checks: [{ name: 'functional runtime gate', ok: false, detail: cause instanceof Error ? cause.message : String(cause) }],
        });
      });
    return () => { active = false; };
  }, [isReady, error]);

  useEffect(() => {
    if (error || functionalGate) void SplashScreen.hideAsync();
  }, [error, functionalGate]);

  if (error) {
    return <View style={styles.loadingContainer}><Text style={styles.errorTitle}>Database initialization failed</Text><Text style={styles.errorText}>{error.message}</Text></View>;
  }

  if (!isReady || !functionalGate) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#71b7ff" /><Text style={styles.loadingText}>Inicializando ATLAS Ω…</Text></View>;
  }

  if (!functionalGate.ok) {
    const failed = functionalGate.checks.filter((check) => !check.ok);
    return (
      <ScrollView style={styles.failureScreen} contentContainerStyle={styles.failureContent}>
        <Text style={styles.errorTitle}>ATLAS Ω no supera el Functional Gate</Text>
        <Text style={styles.errorText}>Una operación local crítica ha fallado. La interfaz queda bloqueada hasta corregirla.</Text>
        {failed.map((check) => <View key={check.name} style={styles.failureCard}><Text style={styles.failureName}>{check.name}</Text><Text style={styles.failureDetail}>{check.detail}</Text></View>)}
      </ScrollView>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#050708' }, animation: 'fade_from_bottom' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="portfolio" />
        <Stack.Screen name="watchlist" />
        <Stack.Screen name="radar" />
        <Stack.Screen name="more" />
        <Stack.Screen name="engines" />
        <Stack.Screen name="ticker" />
        <Stack.Screen name="overview" />
        <Stack.Screen name="market" />
        <Stack.Screen name="growth" />
        <Stack.Screen name="quality" />
        <Stack.Screen name="capex-productivity" />
        <Stack.Screen name="valuation" />
        <Stack.Screen name="risk" />
        <Stack.Screen name="catalysts" />
        <Stack.Screen name="news" />
        <Stack.Screen name="broker" />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, backgroundColor: '#050708', justifyContent: 'center', alignItems: 'center', padding: 24, gap: 14 },
  loadingText: { color: '#9da9b7', textAlign: 'center' },
  errorTitle: { color: '#ffffff', fontSize: 20, fontWeight: '800', textAlign: 'center' },
  errorText: { color: '#fca5a5', textAlign: 'center', lineHeight: 20 },
  failureScreen: { flex: 1, backgroundColor: '#050708' },
  failureContent: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 14 },
  failureCard: { backgroundColor: '#1c1418', borderWidth: 1, borderColor: '#63313b', borderRadius: 12, padding: 14 },
  failureName: { color: '#fecaca', fontWeight: '800' },
  failureDetail: { color: '#fda4af', marginTop: 6 },
});
