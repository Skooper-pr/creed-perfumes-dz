'use client';

import React, { useState } from 'react';
import { Phone, Send, Instagram, MapPin, Clock, CheckCircle2, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [msg, setMsg] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setName('');
    setPhone('');
    setMsg('');
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16 space-y-12">
      
      {/* Title Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold text-secondary uppercase tracking-widest">
          Creed Perfumes الجزائر • نحن هنا لمساعدتك
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-on-surface">
          تواصل مع دار Creed Perfumes
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
          نسعد دائماً بالإجابة على استفساراتكم حول العطور، ومتابعة الطلبيات، أو استشارات اختيار العطر المناسب لذوقكم.
        </p>
      </div>

      {/* Grid: Direct Contact Channels (5 Cols) + Message Form (7 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* RIGHT COLUMN in RTL: Direct Communication Channels (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Phone Call Card */}
          <div className="card-stitch p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="font-bold text-sm text-on-surface">الاتصال الهاتفي المباشر</h3>
              <p className="text-xs text-on-surface-variant">متاح يومياً من 9:00 صباحاً إلى 8:00 مساءً</p>
              <a
                href="tel:+213550123456"
                className="inline-block pt-1 text-base font-black text-primary hover:text-secondary transition-colors"
                dir="ltr"
              >
                +213 (0) 550 12 34 56
              </a>
            </div>
          </div>

          {/* WhatsApp Direct */}
          <div className="card-stitch p-6 flex items-start gap-4 border border-emerald-500/20 bg-emerald-50/20">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Send className="w-6 h-6" />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="font-bold text-sm text-on-surface">محادثة واتساب الفورية</h3>
              <p className="text-xs text-on-surface-variant">للرد السريع على استفسارات الطلبات وتأكيد الشحنات</p>
              <a
                href="https://wa.me/213550123456"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 pt-1 text-xs font-bold text-emerald-700 hover:underline"
              >
                <span>بدء محادثة واتساب الآن</span>
                <Send className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="card-stitch p-6 space-y-4">
            <h3 className="font-bold text-sm text-on-surface">تابعونا على مواقع التواصل</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors text-xs font-bold text-on-surface"
              >
                <div className="w-7 h-7 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center">
                  <Instagram className="w-4 h-4" />
                </div>
                <span>انستغرام</span>
              </a>

              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors text-xs font-bold text-on-surface"
              >
                <div className="w-7 h-7 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs">
                  TT
                </div>
                <span>تيك توك</span>
              </a>
            </div>
          </div>

          {/* Location & Working Hours */}
          <div className="card-stitch p-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-on-surface">
              <MapPin className="w-4 h-4 text-primary" />
              <span>المقر الرئيسي: الجزائر العاصمة، حي سيدي يحيى</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
              <Clock className="w-4 h-4 text-secondary" />
              <span>أيام العمل: من السبت إلى الخميس (خدمة التوصيل تغطي 58 ولاية)</span>
            </div>
          </div>

        </div>

        {/* LEFT COLUMN in RTL: Message Form (7 Cols) */}
        <div className="lg:col-span-7 card-stitch p-6 sm:p-8 space-y-6">
          <div className="border-b border-primary/10 pb-4">
            <h2 className="text-lg font-bold text-on-surface">أرسل لنا استفسارك أو طلبك الخاص</h2>
            <p className="text-xs text-on-surface-variant mt-1">
              سنقوم بالرد عليك عبر الهاتف أو رسالة نصية في أقرب وقت.
            </p>
          </div>

          {submitted && (
            <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2 border border-emerald-200 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>تم استلام رسالتك بنجاح! سيتواصل معك أحد مسؤولينا قريباً.</span>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1.5" htmlFor="contactName">
                الاسم الكريم <span className="text-secondary">*</span>
              </label>
              <input
                id="contactName"
                type="text"
                required
                placeholder="اسمك الكامل"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface-container-low text-on-surface text-sm px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1.5" htmlFor="contactPhone">
                رقم الهاتف (الجزائر) <span className="text-secondary">*</span>
              </label>
              <input
                id="contactPhone"
                type="tel"
                required
                placeholder="0550 00 00 00"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-surface-container-low text-on-surface text-sm px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all text-right font-mono"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1.5" htmlFor="contactMessage">
                رسالتك أو استفسارك <span className="text-secondary">*</span>
              </label>
              <textarea
                id="contactMessage"
                rows={4}
                required
                placeholder="اكتب استفسارك هنا بخصوص عطر معين أو موعد توصيل..."
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                className="w-full bg-surface-container-low text-on-surface text-sm px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              className="btn-pill-primary w-full py-3.5 text-sm font-bold shadow-stitch-glow flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>إرسال الاستفسار</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
