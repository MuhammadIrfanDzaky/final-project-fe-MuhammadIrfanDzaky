'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '@/types';
import { mockApi } from '@/utils/mockApi';

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
    // Check for existing session
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const result = await mockApi.auth.login(email, password);
      if (result.success && result.user) {
        setUser(result.user);
        localStorage.setItem('user', JSON.stringify(result.user));
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

  const register = async (userData: Omit<User, 'id' | 'createdAt' | 'isActive'>): Promise<boolean> => {
    setLoading(true);
    try {
      const result = await mockApi.auth.register(userData);
      if (result.success && result.user) {
        setUser(result.user);
        localStorage.setItem('user', JSON.stringify(result.user));
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