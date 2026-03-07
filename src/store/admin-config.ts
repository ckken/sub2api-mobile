import * as SecureStore from 'expo-secure-store';
const { proxy } = require('valtio');

const BASE_URL_KEY = 'sub2api_base_url';
const ADMIN_KEY_KEY = 'sub2api_admin_api_key';

export function getDefaultAdminConfig() {
  return {
    baseUrl: '',
    adminApiKey: '',
  };
}

async function getItem(key: string) {
  if (typeof window !== 'undefined') {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    return localStorage.getItem(key);
  }

  return SecureStore.getItemAsync(key);
}

async function setItem(key: string, value: string) {
  if (typeof window !== 'undefined') {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }

    return;
  }

  await SecureStore.setItemAsync(key, value);
}

export const adminConfigState = proxy({
  ...getDefaultAdminConfig(),
  hydrated: false,
  saving: false,
});

export async function hydrateAdminConfig() {
  const defaults = getDefaultAdminConfig();
  const [baseUrl, adminApiKey] = await Promise.all([
    getItem(BASE_URL_KEY),
    getItem(ADMIN_KEY_KEY),
  ]);

  adminConfigState.baseUrl = baseUrl ?? defaults.baseUrl;
  adminConfigState.adminApiKey = adminApiKey ?? defaults.adminApiKey;

  adminConfigState.hydrated = true;
}

export async function saveAdminConfig(input: { baseUrl: string; adminApiKey: string }) {
  adminConfigState.saving = true;

  const nextBaseUrl = input.baseUrl.trim().replace(/\/$/, '');
  const nextAdminApiKey = input.adminApiKey.trim();

  await Promise.all([
    setItem(BASE_URL_KEY, nextBaseUrl),
    setItem(ADMIN_KEY_KEY, nextAdminApiKey),
  ]);

  adminConfigState.baseUrl = nextBaseUrl;
  adminConfigState.adminApiKey = nextAdminApiKey;
  adminConfigState.saving = false;
}
