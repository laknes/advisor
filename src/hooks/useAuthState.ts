'use client';

import { useEffect, useState } from 'react';
import { clearStoredAuth, getStoredToken, getStoredUser, type StoredUser } from '@/lib/clientAuth';

function tokenIsExpired(token: string) {
  try {
    const encodedPayload = token.split('.')[1]?.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(encodedPayload)) as { exp?: number };
    return typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now();
  } catch {
    return false;
  }
}

export function useAuthState() {
  const [state, setState] = useState(() => ({
    token: '',
    user: null as StoredUser | null,
    isAuthenticated: false,
    revision: 0,
  }));

  useEffect(() => {
    const sync = () => {
      const token = getStoredToken();
      if (token && tokenIsExpired(token)) {
        clearStoredAuth();
        setState((current) => ({ ...current, token: '', user: null, isAuthenticated: false, revision: current.revision + 1 }));
        return;
      }

      const user = getStoredUser();
      setState((current) => {
        const changed = token !== current.token || JSON.stringify(user) !== JSON.stringify(current.user);

        return {
          token,
          user,
          isAuthenticated: Boolean(token),
          revision: changed ? current.revision + 1 : current.revision,
        };
      });
    };

    sync();
    const interval = window.setInterval(sync, 30000);
    window.addEventListener('auth-changed', sync);
    window.addEventListener('storage', sync);
    window.addEventListener('focus', sync);
    window.addEventListener('pageshow', sync);
    document.addEventListener('visibilitychange', sync);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('auth-changed', sync);
      window.removeEventListener('storage', sync);
      window.removeEventListener('focus', sync);
      window.removeEventListener('pageshow', sync);
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);

  return state;
}
