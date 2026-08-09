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
      .then((result) => {
        if (active) setFunctionalGate(result);
      })
      .catch((cause) => {
        if (!active) return;
        setFunctionalGate({
          ok: false,
          checkedAt: new Date().toISOString(),
          checks: [{
            name: 'functional runtime gate',
            ok: false,
            detail: cause instanceof Error ? cause.message : String(cause),
          }],
        });
      });

    return () => {
      active = false;
    };
  }, [isReady, error]);

  useEffect(() => {
    if (error || functionalGate) {
      void SplashScreen.hideAsync();
    }
  }, [error, functionalGate]);

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorTitle}>Database initialization failed</Text>
        <Text style={styles.errorText}>{error.message}</Text>
      </View>
    );
  }

  if (!isReady || !functionalGate) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#71b7ff" />
        <Text style={styles.loadingText}>Verificando SQLite y operaciones reales…</Text>
      </View>
    );
  }

  if (!functionalGate.ok) {
    const failed = functionalGate.checks.filter((check) => !check.ok);
    return (
      <ScrollView style={styles.failureScreen} contentContainerStyle={styles.failureContent}>
        <Text style={styles.errorTitle}>ATLAS Ω no supera el Functional Gate</Text>
        <Text style={styles.errorText}>La interfaz queda bloqueada porque una operación real de persistencia ha fallado. No se presenta como funcional hasta corregirlo.</Text>
        {failed.map((check) => (
          <View key={check.name} style={styles.failureCard}>
            <Text style={styles.failureName}>{check.name}</Text>
            <Text style={styles.failureDetail}>{check.detail}</Text>
          </View>
        ))}
        <Text style={styles.failureTimestamp}>Comprobado: {functionalGate.checkedAt}</Text>
      </ScrollView>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0b0f14' },
          headerTintColor: '#ffffff',
          contentStyle: { backgroundColor: '#0b0f14' },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'ATLAS Ω' }} />
        <Stack.Screen name="portfolio" options={{ title: 'Portfolio' }} />
        <Stack.Screen name="watchlist" options={{ title: 'Watchlist Ω' }} />
        <Stack.Screen name="capex-productivity" options={{ title: 'CAPEX Productivity Ω' }} />
        <Stack.Screen name="radar" options={{ title: 'Radar Ω' }} />
        <Stack.Screen name="evidence" options={{ title: 'Evidence Ω' }} />
        <Stack.Screen name="daily-intelligence" options={{ title: 'Daily Intelligence' }} />
        <Stack.Screen name="digital-twin" options={{ title: 'Gemelo Digital' }} />
        <Stack.Screen name="audit" options={{ title: 'Auditoría' }} />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0b0f14',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 14,
  },
  loadingText: {
    color: '#9da9b7',
    textAlign: 'center',
  },
  errorTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  errorText: {
    color: '#fca5a5',
    textAlign: 'center',
    lineHeight: 20,
  },
  failureScreen: {
    flex: 1,
    backgroundColor: '#0b0f14',
  },
  failureContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 14,
  },
  failureCard: {
    backgroundColor: '#1c1418',
    borderWidth: 1,
    borderColor: '#63313b',
    borderRadius: 12,
    padding: 14,
  },
  failureName: {
    color: '#fecaca',
    fontWeight: '800',
  },
  failureDetail: {
    color: '#fda4af',
    marginTop: 6,
  },
  failureTimestamp: {
    color: '#64748b',
    fontSize: 11,
    textAlign: 'center',
  },
});
