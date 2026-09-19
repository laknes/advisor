import { getAuthHeaders } from '@/lib/clientAuth';
import { notifyLoadingEnd, notifyLoadingStart } from '@/context/LoadingContext';

type ApiRequestOptions = RequestInit & {
  showGlobalLoading?: boolean;
};

async function request<T>(url: string, options: ApiRequestOptions = {}): Promise<T> {
  const { showGlobalLoading = false, ...fetchOptions } = options;
  if (showGlobalLoading) notifyLoadingStart();

  try {
    const response = await fetch(url, fetchOptions);
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || 'Request failed');
    }

    return payload.data as T;
  } finally {
    if (showGlobalLoading) notifyLoadingEnd();
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
    showGlobalLoading: true,
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
    showGlobalLoading: true,
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
    showGlobalLoading: true,
    headers: authenticated ? getAuthHeaders() : undefined,
  });
}
