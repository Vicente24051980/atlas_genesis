import * as SecureStore from 'expo-secure-store';

const BROKER_CONTROL_TOKEN_KEY = 'atlas.broker-control-token.v1';

export const BrokerSession = {
  async getControlToken(): Promise<string | null> {
    try {
      const value = await SecureStore.getItemAsync(BROKER_CONTROL_TOKEN_KEY);
      return value?.trim() || null;
    } catch {
      return null;
    }
  },
  async saveControlToken(token: string): Promise<void> {
    const value = token.trim();
    if (!value) throw new Error('El token de control está vacío.');
    await SecureStore.setItemAsync(BROKER_CONTROL_TOKEN_KEY, value, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  },
  async clearControlToken(): Promise<void> {
    await SecureStore.deleteItemAsync(BROKER_CONTROL_TOKEN_KEY);
  },
};
