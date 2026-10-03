import { useState, useEffect } from 'react';
import { AuthUser, getCurrentUser } from '../lib/auth';

export interface AuthSession {
  user: AuthUser;
}

export interface AuthState {
  session: AuthSession | null;
  user: AuthUser | null;
  loading: boolean;
}

export function useAuth(): AuthState {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const sync = async () => {
      const current = await getCurrentUser().catch(() => null);
      if (!active) return;
      setUser(current);
      setSession(current ? { user: current } : null);
      setLoading(false);
    };

    void sync();
    window.addEventListener('webrising-auth-changed', sync);

    return () => {
      active = false;
      window.removeEventListener('webrising-auth-changed', sync);
    };
  }, []);

  return { session, user, loading };
}
