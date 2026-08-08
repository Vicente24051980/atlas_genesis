import { useEffect } from 'react';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useDatabaseInitialization } from '../db/migrator';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isReady, error } = useDatabaseInitialization();

  useEffect(() => {
    if (isReady || error) {
      void SplashScreen.hideAsync();
    }
  }, [isReady, error]);

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Database initialization failed.</Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
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
  },
  errorText: {
    color: '#ffffff',
  },
});
