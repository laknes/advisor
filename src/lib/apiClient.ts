import { getAuthHeaders } from '@/lib/clientAuth';
import { notifyLoadingEnd, notifyLoadingStart } from '@/context/LoadingContext';

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  notifyLoadingStart();

  try {
    const response = await fetch(url, options);
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || 'Request failed');
    }

    return payload.data as T;
  } finally {
    notifyLoadingEnd();
  }
}

export function apiGet<T>(url: string, authenticated = false): Promise<T> {
  return request<T>(url, {
    headers: authenticated ? getAuthHeaders() : undefined,
    cache: 'no-store',
  });
}

export function apiPut<T>(url: string, body: unknown, authenticated = true): Promise<T> {
  return request<T>(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(authenticated ? getAuthHeaders() : {}),
    },
    body: JSON.stringify(body),
  });
}

export function apiPost<T>(url: string, body?: unknown, authenticated = true): Promise<T> {
  return request<T>(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authenticated ? getAuthHeaders() : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export function apiDelete<T>(url: string, authenticated = true): Promise<T> {
  return request<T>(url, {
    method: 'DELETE',
    headers: authenticated ? getAuthHeaders() : undefined,
  });
}
