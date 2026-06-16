import { getAuthHeaders } from '@/lib/clientAuth';

export async function apiGet<T>(url: string, authenticated = false): Promise<T> {
  const response = await fetch(url, {
    headers: authenticated ? getAuthHeaders() : undefined,
    cache: 'no-store',
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || 'Request failed');
  }

  return payload.data as T;
}

export async function apiPut<T>(url: string, body: unknown, authenticated = true): Promise<T> {
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(authenticated ? getAuthHeaders() : {}),
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || 'Request failed');
  }

  return payload.data as T;
}

export async function apiPost<T>(url: string, body?: unknown, authenticated = true): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authenticated ? getAuthHeaders() : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || 'Request failed');
  }

  return payload.data as T;
}

export async function apiDelete<T>(url: string, authenticated = true): Promise<T> {
  const response = await fetch(url, {
    method: 'DELETE',
    headers: authenticated ? getAuthHeaders() : undefined,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || 'Request failed');
  }

  return payload.data as T;
}
