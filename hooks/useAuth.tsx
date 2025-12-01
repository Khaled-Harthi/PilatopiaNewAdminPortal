'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Admin, getStoredAdmin, getStoredToken, setAuthData, clearAuthData } from '@/lib/auth';
import apiClient from '@/lib/axios';

interface AuthContextType {
  admin: Admin | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    // Check if user is already logged in
    const storedAdmin = getStoredAdmin();
    const token = getStoredToken();

    if (storedAdmin && token) {
      setAdmin(storedAdmin);
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post<{
        token: string;
        admin: Admin;
      }>('/admin/auth/login', {
        email,
        password,
      });

      const { token, admin: adminData } = response.data;

      setAuthData(token, adminData);
      setAdmin(adminData);

      // Role-based redirect
      if (adminData.role === 'instructor') {
        router.push(`/${locale}/instructor/schedule`);
      } else {
        router.push(`/${locale}`);
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    clearAuthData();
    setAdmin(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ admin, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
