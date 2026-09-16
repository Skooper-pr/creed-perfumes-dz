'use client';

import React, { useState } from 'react';
import { Phone, Send, Instagram, MapPin, Clock, CheckCircle2, MessageSquare } from 'lucide-react';
import { siteConfig } from '@/config/site';

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
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <span className="text-[11px] font-semibold text-[#6E603F] tracking-[0.16em] uppercase">
          خدمة زبائن دار Creed Perfumes الجزائر
        </span>
        <h1 className="text-2xl sm:text-4xl font-bold text-[#151515]">
          تواصل مع دار Creed Perfumes
        </h1>
        <p className="text-xs sm:text-sm text-[#77736B] leading-relaxed">
          نسعد دائماً بالإجابة على استفساراتكم حول العطور المتوفرة، ومتابعة مسار الشحنات، أو تقديم استشارات لاختيار العطر الأنسب لذوقكم.
        </p>
      </div>

      {/* Grid: Direct Contact Channels (5 Cols) + Message Form (7 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* RIGHT COLUMN in RTL: Direct Communication Channels (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Phone Support Card */}
          <div className="bg-white rounded-2xl p-5 border border-[#E5E0D5] flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#FAF8F5] text-[#6E603F] border border-[#E5E0D5] flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4 stroke-[1.5]" />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="font-semibold text-sm text-[#151515]">خدمة العملاء هاتفياً</h3>
              <p className="text-xs text-[#77736B]">متاحة {siteConfig.contact.workingHours}</p>
              {siteConfig.contact.phone ? (
                <a
                  href={`tel:${siteConfig.contact.phoneFormatted}`}
                  className="inline-block pt-1 text-sm font-bold font-mono text-[#151515] hover:text-[#6E603F] transition-colors"
                  dir="ltr"
                >
                  {siteConfig.contact.phone}
                </a>
              ) : (
                <p className="text-xs text-[#77736B] pt-0.5">
                  يتم الاتصال الهاتفي بجميع الزبائن تلقائياً بعد إرسال الطلب لتأكيد الموعد والعنوان.
                </p>
              )}
            </div>
          </div>

          {/* WhatsApp Direct (if configured) */}
          {siteConfig.contact.whatsappLink && (
            <div className="bg-white rounded-2xl p-5 border border-[#E5E0D5] flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#FAF8F5] text-emerald-700 border border-[#E5E0D5] flex items-center justify-center shrink-0">
                <Send className="w-4 h-4 stroke-[1.5]" />
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="font-semibold text-sm text-[#151515]">محادثة واتساب المباشرة</h3>
                <p className="text-xs text-[#77736B]">للإجابة السريعة على الاستفسارات ومتابعة الطلبات</p>
                <a
                  href={siteConfig.contact.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 pt-1 text-xs font-semibold text-emerald-800 hover:underline"
                >
                  <span>بدء محادثة واتساب الآن</span>
                  <Send className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* Location & Coverage */}
          <div className="bg-white rounded-2xl p-5 border border-[#E5E0D5] space-y-3">
            <div className="flex items-start gap-3 text-xs text-[#151515]">
              <MapPin className="w-4 h-4 text-[#6E603F] shrink-0 mt-0.5" />
              <span>{siteConfig.contact.addressNote}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#77736B]">
              <Clock className="w-4 h-4 text-[#6E603F] shrink-0" />
              <span>توصيل سريع: 24 - 48 ساعة للشمال، و 3 - 5 أيام للجنوب</span>
            </div>
          </div>

          {/* Social Media Links if configured */}
          {siteConfig.social.instagram && (
            <div className="bg-white rounded-2xl p-5 border border-[#E5E0D5]">
              <a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-xs font-semibold text-[#151515] hover:text-[#6E603F]"
              >
                <Instagram className="w-4 h-4 text-[#6E603F]" />
                <span>متابعتنا عبر انستغرام</span>
              </a>
            </div>
          )}

        </div>

        {/* LEFT COLUMN in RTL: Message Form (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E0D5] space-y-5">
          <div className="border-b border-[#E5E0D5] pb-3">
            <h2 className="text-base font-bold text-[#151515]">أرسل لنا استفسارك</h2>
            <p className="text-xs text-[#77736B] mt-1">
              املأ النموذج أدناه وسيتواصل معك فريقنا في أقرب وقت.
            </p>
          </div>

          {submitted && (
            <div className="p-4 rounded-xl bg-[#FAF8F5] text-[#151515] text-xs sm:text-sm font-medium flex items-center gap-2 border border-[#E5E0D5]">
              <CheckCircle2 className="w-4 h-4 text-[#6E603F] shrink-0" />
              <span>تم استلام رسالتك بنجاح. سيتواصل معك أحد مسؤولينا قريباً.</span>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#151515] mb-1.5" htmlFor="name">
                الاسم الكريم <span className="text-[#6E603F]">*</span>
              </label>
              <input
                id="name"
                type="text"
                required
                placeholder="اسمك الكامل"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#FAF8F5] text-[#151515] text-sm px-4 py-2.5 rounded-xl border border-[#E5E0D5] outline-none focus:border-[#151515] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#151515] mb-1.5" htmlFor="phone">
                رقم الهاتف الجزائري <span className="text-[#6E603F]">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                dir="ltr"
                required
                placeholder="0550 12 34 56"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-right bg-[#FAF8F5] text-[#151515] text-sm px-4 py-2.5 rounded-xl border border-[#E5E0D5] outline-none focus:border-[#151515] transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#151515] mb-1.5" htmlFor="msg">
                نص الرسالة أو الاستفسار <span className="text-[#6E603F]">*</span>
              </label>
              <textarea
                id="msg"
                required
                rows={4}
                placeholder="اكتب استفسارك عن العطور، التوصيل، أو أي تفاصيل أخرى..."
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                className="w-full bg-[#FAF8F5] text-[#151515] text-sm px-4 py-2.5 rounded-xl border border-[#E5E0D5] outline-none focus:border-[#151515] transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              className="btn-luxury-primary w-full py-3.5 text-xs sm:text-sm font-semibold"
            >
              <span>إرسال الرسالة</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
