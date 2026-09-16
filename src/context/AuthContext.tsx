'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface AuthContextType {
  isAdminLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
// This public identifier is not an email or credential; authorization is enforced again by Supabase RLS.
const ADMIN_USER_ID = '698fd6a7-930d-45f4-93e7-0462a296646a';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            if (session.user.id === ADMIN_USER_ID) {
              setIsAdminLoggedIn(true);
              setIsLoading(false);
              return;
            }
            await supabase.auth.signOut();
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

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: pass,
        });
        if (!error && data.session) {
          if (data.user?.id === ADMIN_USER_ID) {
            setIsAdminLoggedIn(true);
            setIsLoading(false);
            return { success: true };
          }
          await supabase.auth.signOut();
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
  };

  return (
    <AuthContext.Provider
      value={{
        isAdminLoggedIn,
        isLoading,
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
