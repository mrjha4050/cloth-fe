import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export interface User {
  name: string;
  email: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  signup: (email: string, password: string) => boolean;
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

function makeUser(email: string): User {
  return {
    name: email.split('@')[0],
    email: email.trim().toLowerCase(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getStoredUser());

  const authenticate = useCallback((email: string, password: string): boolean => {
    if (!email.trim() || !password) return false;
    const u = makeUser(email);
    setUser(u);
    setStoredUser(u);
    return true;
  }, []);

  const login = useCallback((email: string, password: string): boolean => authenticate(email, password), [authenticate]);
  const signup = useCallback((email: string, password: string): boolean => authenticate(email, password), [authenticate]);

  const logout = useCallback(() => {
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
