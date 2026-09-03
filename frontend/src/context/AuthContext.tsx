import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  switchDemoRole: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('aegis_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const u = await api.getCurrentUser();
          setUser(u);
        } catch (e) {
          console.error('Failed to load user session:', e);
          localStorage.removeItem('aegis_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    const res: AuthResponse = await api.login(email, password);
    localStorage.setItem('aegis_token', res.access_token);
    setToken(res.access_token);
    setUser({
      id: res.user_id,
      email: res.email,
      full_name: res.full_name,
      role: res.role,
      department_id: res.department_id,
      department_name: res.department_name,
      employee_id: res.employee_id,
      is_active: true,
    });
  };

  const switchDemoRole = async (email: string, password: string) => {
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('aegis_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, switchDemoRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
