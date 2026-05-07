import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api } from '../lib/api';
import type { AuthResponse, User } from '../types';

interface AuthContextType {
  user: AuthResponse | null;
  profile: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (accessToken: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

interface RegisterData {
  name: string;
  dateOfBirth: string;
  address: string;
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshProfile() {
    try {
      const data = await api.get<User>('/auth/me');
      setProfile(data);
    } catch {
      setProfile(null);
    }
  }

  async function googleLogin(accessToken: string) {
    const data = await api.post<AuthResponse>('/auth/google', { accessToken });
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    await refreshProfile();
  }

  useEffect(() => {
    if (user) {
      refreshProfile().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function login(email: string, password: string) {
    const data = await api.post<AuthResponse>('/auth/login', { email, password });
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
  }

  async function register(data: RegisterData) {
    const res = await api.post<AuthResponse>('/auth/register', data);
    localStorage.setItem('user', JSON.stringify(res));
    setUser(res);
  }

  function logout() {
    localStorage.removeItem('user');
    setUser(null);
    setProfile(null);
  }

  return (
      <AuthContext.Provider value={{ user, profile, loading, login, googleLogin, register, logout, refreshProfile }}>
        {children}
      </AuthContext.Provider>
  );
}