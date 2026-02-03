import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { auth as apiAuth, getToken, setToken, clearToken, ApiClientError, getTokenFromResponse } from '@/lib/api';
import type { LoginResponse } from '@/lib/api';

export interface User {
  name: string;
  email: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name?: string, phone?: string) => Promise<boolean>;
  logout: () => void;
}

const STORAGE_KEY = 'hfd_user';

function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as User;
    return parsed?.email ? parsed : null;
  } catch {
    return null;
  }
}

function setStoredUser(user: User | null) {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore
  }
}

const AuthContext = createContext<AuthContextValue | null>(null);

function makeUser(email: string, name?: string): User {
  return {
    name: name?.trim() || email.split('@')[0] || 'User',
    email: email.trim().toLowerCase(),
  };
}

function userFromResponse(data: LoginResponse | undefined, email: string, name?: string): User {
  const user = data?.user;
  if (user && typeof user === 'object' && user.email) {
    const userName = (user as { name?: string }).name || name || email.split('@')[0] || 'User';
    const userEmail = (user as { email?: string }).email || email.trim().toLowerCase();
    return { name: userName, email: userEmail };
  }
  return makeUser(email, name);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => (getToken() ? getStoredUser() : null));

  useEffect(() => {
    if (!getToken()) {
      setUser(null);
      setStoredUser(null);
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    if (!email.trim() || !password) return false;
    try {
      const data = await apiAuth.login(email, password);
      const token = getTokenFromResponse(data);
      if (!token) return false;
      setToken(token);
      const u = userFromResponse(data as LoginResponse, email);
      setUser(u);
      setStoredUser(u);
      return true;
    } catch (err) {
      if (err instanceof ApiClientError) throw err;
      return false;
    }
  }, []);

  const signup = useCallback(
    async (email: string, password: string, name?: string, phone?: string): Promise<boolean> => {
      if (!email.trim() || !password) return false;
      try {
        const data = await apiAuth.register({
          name: name?.trim() || email.split('@')[0] || 'User',
          email: email.trim().toLowerCase(),
          password,
          phone: phone?.trim(),
        });
        const token = getTokenFromResponse(data);
        if (!token) return false;
        setToken(token);
        const u = userFromResponse(data as LoginResponse, email, name);
        setUser(u);
        setStoredUser(u);
        return true;
      } catch (err) {
        if (err instanceof ApiClientError) throw err;
        return false;
      }
    },
    []
  );

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setStoredUser(null);
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
