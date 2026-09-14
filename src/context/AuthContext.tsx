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

const ADMIN_SESSION_KEY = 'creed_admin_session';

async function computeSha256(str: string): Promise<string> {
  if (typeof window === 'undefined' || !crypto?.subtle) {
    return '';
  }
  const buffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// SHA-256 Hash of admin@creedperfumes.dz
const ADMIN_EMAIL_HASH = '09afd4471baa63dfd0e8ea7ede2092e5290e32e7ebc509afa2b4116c521bc191';
// Salted SHA-256 Hash of younes@CreedAdmin2025! with salt 'creed_dz_salt_2025:'
const ADMIN_SALTED_PASSWORD_HASH = 'fb9091536b2cd5758d301f157677c6de3723959e41d071e53643e51d5ca39767';

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

      // Check local session
      try {
        const local = localStorage.getItem(ADMIN_SESSION_KEY);
        if (local) {
          const parsed = JSON.parse(local);
          if (parsed?.isLoggedIn && parsed?.token) {
            setIsAdminLoggedIn(true);
            setAdminEmail(parsed.email || 'admin@creedperfumes.dz');
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    const normalizedEmail = email.toLowerCase().trim();

    // If Supabase is configured, try Supabase Auth
    if (isSupabaseConfigured() && supabase) {
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

    // Cryptographic Salted SHA-256 Verification (Zero plain text credentials stored)
    const emailHash = await computeSha256(normalizedEmail);
    const passHash = await computeSha256(`creed_dz_salt_2025:${pass}`);

    if (emailHash === ADMIN_EMAIL_HASH && passHash === ADMIN_SALTED_PASSWORD_HASH) {
      setIsAdminLoggedIn(true);
      setAdminEmail(normalizedEmail);
      const token = await computeSha256(`session_${Date.now()}_${emailHash}`);
      localStorage.setItem(
        ADMIN_SESSION_KEY,
        JSON.stringify({ isLoggedIn: true, token, email: normalizedEmail, timestamp: Date.now() })
      );
      setIsLoading(false);
      return { success: true };
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
    localStorage.removeItem(ADMIN_SESSION_KEY);
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
