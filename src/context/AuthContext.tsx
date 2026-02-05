import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';

import {
  auth as apiAuth,
  getToken,
  setToken,
  clearToken,
  ApiClientError,
  getTokenFromResponse,
} from '@/lib/api';

import type { LoginResponse } from '@/lib/api';

/* =======================
   Types
======================= */

export interface User {
  name: string;
  email: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (
    email: string,
    password: string,
    name?: string,
    phone?: string
  ) => Promise<boolean>;
  logout: () => void;
}

/* =======================
   Local storage helpers
======================= */

const USER_KEY = 'hfd_user';

function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
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
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  } catch {
    // ignore
  }
}

 

function makeUser(email: string, name?: string): User {
  return {
    name: name?.trim() || email.split('@')[0] || 'User',
    email: email.trim().toLowerCase(),
  };
}

function userFromResponse(
  data: LoginResponse | undefined,
  email: string,
  name?: string
): User {
  const user = data?.user;
  if (user && typeof user === 'object' && user.email) {
    return {
      name:
        (user as { name?: string }).name ||
        name ||
        email.split('@')[0] ||
        'User',
      email:
        (user as { email?: string }).email ||
        email.trim().toLowerCase(),
    };
  }
  return makeUser(email, name);
}

 
const AuthContext = createContext<AuthContextValue | null>(null);
 

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getStoredUser());

  /* Clear user if token disappears */
  useEffect(() => {
    if (!getToken()) {
      setUser(null);
      setStoredUser(null);
    }
  }, []);

  /* ---------- LOGIN ---------- */
  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      if (!email.trim() || !password) return false;

      try {
        const data = await apiAuth.login(
          email.trim().toLowerCase(),
          password
        );

        const token = getTokenFromResponse(data);
        if (!token) return false;

        setToken(token);

        const u = userFromResponse(data as LoginResponse, email);
        setUser(u);
        setStoredUser(u);

        return true;
      } catch (err) {
        if (err instanceof ApiClientError) throw err;
        throw err;
      }
    },
    []
  );

  /* ---------- SIGNUP ---------- */
  const signup = useCallback(
    async (
      email: string,
      password: string,
      name?: string,
      phone?: string
    ): Promise<boolean> => {
      if (!email.trim() || !password) return false;

      try {
        const registerData = await apiAuth.register({
          name: name?.trim() || email.split('@')[0] || 'User',
          email: email.trim().toLowerCase(),
          password,
          phone: phone?.trim(),
        });

        let token = getTokenFromResponse(registerData);
        let finalData: LoginResponse | undefined = registerData;

        /* Auto-login if register didn't return token */
        if (!token) {
          const loginData = await apiAuth.login(
            email.trim().toLowerCase(),
            password
          );
          token = getTokenFromResponse(loginData);
          finalData = loginData;
        }

        if (!token) {
          console.error('Signup failed: No token found in response', { registerData, finalData });
          return false;
        }

        setToken(token);

        const u = userFromResponse(finalData, email, name);
        setUser(u);
        setStoredUser(u);

        return true;
      } catch (err) {
        if (err instanceof ApiClientError) throw err;
        throw err;
      }
    },
    []
  );

  /* ---------- LOGOUT ---------- */
  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setStoredUser(null);
  }, []);

  /* ---------- VALUE ---------- */
  const value: AuthContextValue = {
    user,
    isAuthenticated: !!getToken(), // 🔑 token-driven auth
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
 

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
