export const AUTH_TOKEN_KEY = 'portfolio_advisor_token';
export const AUTH_USER_KEY = 'portfolio_advisor_user';

export interface StoredUser {
  id?: string;
  email?: string;
  name?: string | null;
}

export function getStoredToken() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(AUTH_TOKEN_KEY) || '';
}

export function getAuthHeaders(): Record<string, string> {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === 'undefined') return null;

  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function clearStoredAuth() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}
