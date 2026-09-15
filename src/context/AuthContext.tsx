'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface AuthContextType {
  isAdminLoggedIn: boolean;
  isLoading: boolean;
  adminEmail: string | null;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'admin@creedperfumes.dz';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setIsAdminLoggedIn(true);
            setAdminEmail(session.user.email ?? null);
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Supabase auth check failed:', e);
        }
      }

      setIsLoading(false);
    }

    initAuth();
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    const normalizedEmail = email.toLowerCase().trim();

    if (isSupabaseConfigured() && supabase && normalizedEmail === ADMIN_EMAIL) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: pass,
        });
        if (!error && data.session) {
          setIsAdminLoggedIn(true);
          setAdminEmail(data.user.email ?? normalizedEmail);
          setIsLoading(false);
          return { success: true };
        }
      } catch (err: any) {
        console.warn('Supabase sign-in error:', err);
      }
    }

    setIsLoading(false);
    return {
      success: false,
      error: 'بيانات الدخول غير صحيحة. يرجى التأكد من البريد الإلكتروني وكلمة المرور.',
    };
  };

  const logout = async () => {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn(e);
      }
    }
    setIsAdminLoggedIn(false);
    setAdminEmail(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAdminLoggedIn,
        isLoading,
        adminEmail,
        login,
        logout,
      }}
    >
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
