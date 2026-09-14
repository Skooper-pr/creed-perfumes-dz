'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, Store } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isAdminLoggedIn, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isAdminLoggedIn && !isLoading) {
      router.push('/admin');
    }
  }, [isAdminLoggedIn, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await login(email.trim(), password);
      if (res.success) {
        router.push('/admin');
      } else {
        setErrorMsg(res.error || 'بيانات الدخول غير صحيحة.');
      }
    } catch {
      setErrorMsg('حدث خطأ أثناء الاتصال بالخادم.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 sm:p-6">
      
      <div className="w-full max-w-md space-y-6">
        
        {/* Logo and Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl mx-auto shadow-stitch-glow">
            CP
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface">
            بوابة إدارة Creed Perfumes
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            لوحة تحكم صاحب المتجر • إدارة العطور والطلبيات (الجزائر)
          </p>
        </div>

        {/* Login Card */}
        <div className="card-stitch p-6 sm:p-8 space-y-6 shadow-stitch">
          
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 text-red-700 text-xs font-bold border border-red-200 animate-in fade-in">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1.5" htmlFor="adminEmail">
                البريد الإلكتروني للإدارة
              </label>
              <div className="relative">
                <input
                  id="adminEmail"
                  type="email"
                  required
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@creedperfumes.dz"
                  className="w-full bg-surface-container-low text-on-surface text-sm pr-11 pl-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all text-right font-mono"
                />
                <Mail className="w-4 h-4 text-outline absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1.5" htmlFor="adminPassword">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  id="adminPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-surface-container-low text-on-surface text-sm pr-11 pl-11 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all text-right font-mono"
                />
                <Lock className="w-4 h-4 text-outline absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-1"
                  aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-pill-primary w-full py-3.5 text-sm font-bold shadow-stitch-glow flex items-center justify-center gap-2 mt-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>جاري الدخول...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>دخول لوحة التحكم</span>
                </>
              )}
            </button>
          </form>


        </div>

        {/* Back to store */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-on-surface-variant hover:text-primary transition-colors"
          >
            <Store className="w-3.5 h-3.5" />
            <span>العودة لمتجر الزبائن</span>
          </Link>
        </div>

      </div>

    </div>
  );
}
