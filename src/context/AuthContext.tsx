import { createContext, PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react';
import { login as loginRequest } from '@/apis/authApi';
import { storageService } from '@/services/storageService';
import { websocketService } from '@/services/websocketService';
import { AuthState, User } from '@/types/auth';

interface AuthContextValue extends AuthState {
  login: (email: string, password: string, referralCode?: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    let mounted = true;
    const hydrate = async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          storageService.getToken(),
          storageService.getUser(),
        ]);
        if (mounted && storedToken) {
          setToken(storedToken);
          setUser(storedUser ?? {
            id: 'usr-restored',
            name: 'Roshan Bhatia',
            email: 'roshan@falcon.local',
            role: 'operator',
            initials: 'RB',
          });
        }
      } finally {
        if (mounted) setIsHydrating(false);
      }
    };
    void hydrate();
    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string, referralCode?: string) => {
    const session = await loginRequest(email, password, referralCode);
    await storageService.saveSession(session.token, session.user);
    setToken(session.token);
    setUser(session.user);
  }, []);

  const logout = useCallback(async () => {
    websocketService.disconnect();
    await storageService.clearSession();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ token, user, isHydrating, isAuthenticated: Boolean(token), login, logout }),
    [isHydrating, login, logout, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
