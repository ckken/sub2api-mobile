import { adminConfigState } from '@/src/store/admin-config';
import type { ApiEnvelope } from '@/src/types/admin';

function isProxyBaseUrl(baseUrl: string) {
  return /localhost:8787$/.test(baseUrl) || /127\.0\.0\.1:8787$/.test(baseUrl);
}

export function isLocalProxyBaseUrl(baseUrl: string) {
  return isProxyBaseUrl(baseUrl);
}

export async function adminFetch<T>(
  path: string,
  init: RequestInit = {},
  options?: { idempotencyKey?: string }
): Promise<T> {
  const baseUrl = adminConfigState.baseUrl.trim().replace(/\/$/, '');
  const adminApiKey = adminConfigState.adminApiKey.trim();

  if (!baseUrl) {
    throw new Error('BASE_URL_REQUIRED');
  }

  if (!adminApiKey && !isProxyBaseUrl(baseUrl)) {
    throw new Error('ADMIN_API_KEY_REQUIRED');
  }

  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  if (adminApiKey) {
    headers.set('x-api-key', adminApiKey);
  }

  if (options?.idempotencyKey) {
    headers.set('Idempotency-Key', options.idempotencyKey);
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
  });

  let json: ApiEnvelope<T>;

  try {
    json = (await response.json()) as ApiEnvelope<T>;
  } catch {
    throw new Error('INVALID_SERVER_RESPONSE');
  }

  if (!response.ok || json.code !== 0) {
    throw new Error(json.reason || json.message || 'REQUEST_FAILED');
  }

  return json.data as T;
}
