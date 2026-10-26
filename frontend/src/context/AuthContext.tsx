import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Role } from '../types/index.js';
import { api } from '../api/client.js';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (correo: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  hasRole: (...roles: Role[]) => boolean;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const checkSession = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<{ user: User }>('/auth/me');
      setUser(res.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (correo: string, password: string) => {
    const res = await api.post<{ user: User }>('/auth/login', { correo, password });
    setUser(res.user);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
    }
  };

  const updateUser = (data: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : null));
  };

  const hasRole = (...roles: Role[]) => {
    if (!user) return false;
    return roles.includes(user.rol);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, hasRole, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}
