import * as SecureStore from 'expo-secure-store';

const T212_API_KEY = 'atlas.t212.api_key';
const T212_API_SECRET = 'atlas.t212.api_secret';
const T212_ENVIRONMENT = 'atlas.t212.environment';
const FMP_API_KEY = 'atlas.fmp.api_key';

const secureOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
};

export type Trading212Environment = 'live' | 'demo';

export type Trading212Credentials = {
  apiKey: string;
  apiSecret: string;
  environment: Trading212Environment;
};

export async function saveTrading212Credentials(
  apiKey: string,
  apiSecret: string,
  environment: Trading212Environment,
): Promise<void> {
  const key = apiKey.trim();
  const secret = apiSecret.trim();
  if (!key || !secret) throw new Error('Trading 212 API Key y API Secret son obligatorios.');

  await Promise.all([
    SecureStore.setItemAsync(T212_API_KEY, key, secureOptions),
    SecureStore.setItemAsync(T212_API_SECRET, secret, secureOptions),
    SecureStore.setItemAsync(T212_ENVIRONMENT, environment, secureOptions),
  ]);
}

export async function getTrading212Credentials(): Promise<Trading212Credentials | null> {
  const [apiKey, apiSecret, environment] = await Promise.all([
    SecureStore.getItemAsync(T212_API_KEY, secureOptions),
    SecureStore.getItemAsync(T212_API_SECRET, secureOptions),
    SecureStore.getItemAsync(T212_ENVIRONMENT, secureOptions),
  ]);

  if (!apiKey || !apiSecret) return null;
  return {
    apiKey,
    apiSecret,
    environment: environment === 'demo' ? 'demo' : 'live',
  };
}

export async function clearTrading212Credentials(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(T212_API_KEY, secureOptions),
    SecureStore.deleteItemAsync(T212_API_SECRET, secureOptions),
    SecureStore.deleteItemAsync(T212_ENVIRONMENT, secureOptions),
  ]);
}

export async function saveFmpApiKey(apiKey: string): Promise<void> {
  const key = apiKey.trim();
  if (!key) throw new Error('FMP API Key es obligatoria.');
  await SecureStore.setItemAsync(FMP_API_KEY, key, secureOptions);
}

export async function getFmpApiKey(): Promise<string | null> {
  return SecureStore.getItemAsync(FMP_API_KEY, secureOptions);
}

export async function clearFmpApiKey(): Promise<void> {
  await SecureStore.deleteItemAsync(FMP_API_KEY, secureOptions);
}

export async function getCredentialStatus(): Promise<{
  trading212: boolean;
  fmp: boolean;
  environment: Trading212Environment;
}> {
  const [t212, fmp] = await Promise.all([getTrading212Credentials(), getFmpApiKey()]);
  return {
    trading212: Boolean(t212),
    fmp: Boolean(fmp),
    environment: t212?.environment ?? 'live',
  };
}
