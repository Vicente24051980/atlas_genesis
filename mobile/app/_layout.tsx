import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { brokerTheme as t } from '../ui/brokerTheme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.bg }, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="portfolio" />
        <Stack.Screen name="watchlist" />
        <Stack.Screen name="radar" />
        <Stack.Screen name="markets" />
        <Stack.Screen name="analyze" />
        <Stack.Screen name="evidence" />
        <Stack.Screen name="broker" />
        <Stack.Screen name="orders" />
        <Stack.Screen name="alerts" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="more" />
      </Stack>
    </SafeAreaProvider>
  );
}
