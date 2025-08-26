'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '@/types';
import { api } from '@/utils/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export type AuthProviderProps = {
  children: React.ReactNode;
};

export function AuthProvider(props: AuthProviderProps) {
  const { children } = props;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session and refresh user from backend
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      // Fetch latest user data from backend
      api.getUserById(parsedUser.id)
        .then((freshUser) => {
          setUser(freshUser as User);
          localStorage.setItem('user', JSON.stringify(freshUser));
        })
        .catch(() => {/* ignore error, keep local user */})
        .finally(() => setLoading(false));
      return;
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const result = await api.login({ email, password }) as any;
      if (result && result.token && result.user) {
        // Fetch latest user data from backend after login
  const freshUser = await api.getUserById(result.user.id);
  setUser(freshUser as User);
  localStorage.setItem('user', JSON.stringify(freshUser));
        sessionStorage.setItem('token', result.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // const register = async (userData: Omit<User, 'id' | 'createdAt' | 'isActive'>): Promise<boolean> => {
  const register = async (userData: { email: string; password: string; name: string; role: string; phone: string; }): Promise<boolean> => {
    setLoading(true);
    try {
      const result = await api.register(userData) as any;
      if (result && result.token && result.user) {
        setUser(result.user);
        localStorage.setItem('user', JSON.stringify(result.user));
        sessionStorage.setItem('token', result.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}