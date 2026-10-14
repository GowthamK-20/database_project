import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password?: string) => Promise<void>;
  quickSwitchUser: (username: string) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('veyra_auth_token');
    if (savedToken) {
      api.setToken(savedToken);
      api.getMe()
        .then((res) => {
          setUser(res.user);
          setToken(savedToken);
        })
        .catch(() => {
          // Token expired or invalid, auto login as default analyst for demo convenience
          quickSwitchUser('rahul.sharma');
        })
        .finally(() => setIsLoading(false));
    } else {
      // Auto-initialize demo session as Rahul Sharma (Fraud Analyst)
      quickSwitchUser('rahul.sharma');
    }
  }, []);

  const login = async (username: string, password = 'VeyraRisk@2026') => {
    setIsLoading(true);
    try {
      const res = await api.login({ username, password });
      api.setToken(res.token);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const quickSwitchUser = async (username: string) => {
    setIsLoading(true);
    try {
      const res = await api.login({ username, password: 'VeyraRisk@2026' });
      api.setToken(res.token);
      setToken(res.token);
      setUser(res.user);
    } catch (err) {
      console.error('Quick switch failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    api.setToken(null);
    setToken(null);
    setUser(null);
  };

  const hasRole = (...roles: UserRole[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, quickSwitchUser, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
