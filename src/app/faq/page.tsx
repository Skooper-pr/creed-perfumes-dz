'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Truck, HelpCircle, PhoneCall, ArrowLeft } from 'lucide-react';
import { ALGERIA_WILAYAS } from '@/data/wilayas';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: 'كيف يعمل نظام الدفع عند الاستلام (COD) في متجر Creed Perfumes الجزائر؟',
    answer: 'النظام مريح ومباشر: تختار العطر المناسب، وتملأ بياناتك وعنوانك في نموذج الطلب دون الحاجة لأي بطاقة بنكية. بعد تسجيل طلبك، يتصل بك فريقنا هاتفياً لتأكيد العنوان وموعد التسليم. يصلك مندوب التوصيل حتى باب منزلك، تفحص طردك ثم تدفع المبلغ المتفق عليه نقداً بالدينار الجزائري (دج).'
  },
  {
    question: 'كم تستغرق مدة التوصيل إلى ولايتي؟',
    answer: 'مدة التوصيل تختلف باختلاف المنطقة الجغرافية:\n• الجزائر العاصمة وضواحيها (تيبازة، بومرداس، البليدة): من 24 إلى 48 ساعة.\n• الولايات الساحلية والمدن الكبرى (وهران، قسنطينة، عنابة، سطيف، تلمسان): من 24 إلى 48 ساعة.\n• ولايات الهضاب العليا والولايات الداخلية: من 48 إلى 72 ساعة.\n• ولايات الجنوب والصحراء الكبرى (ورقلة، أدرار، بشار، تمنراست، إليزي): من 3 إلى 5 أيام عمل.'
  },
  {
    question: 'هل يمكنني معاينة الطرد قبل دفع المبلغ لمندوب التوصيل؟',
    answer: 'نعم بالتأكيد. نحرص على الشفافية التامة وراحة زبائننا؛ يحق لك تفقد الطرد الخارجي وسلامة العلبة والزجاجة قبل تسليم المبلغ نقداً لمندوب شركة التوصيل.'
  },
  {
    question: 'ما هي جودة وتركيز العطور المتوفرة لديكم؟',
    answer: 'ننتقي في بوتيكنا تشكيلات عطور فاخرة بتركيز زيتي عالٍ (Eau De Parfum) يتميز بالثبات والفوحان المتزن الذي يدوم طويلاً، وتقدم العطور في علبها الرسمية الفاخرة مع الحفاظ على معايير التغليف الأنيق.'
  },
  {
    question: 'ما هي سياسة الاستبدال في حال وجود ضرر ناتج عن الشحن؟',
    answer: 'في حال حدوث أي ضرر أو كسر أثناء الشحن أو خلل مصنعي في البخاخ، نلتزم باستبدال الزجاجة مجاناً دون أي مصاريف إضافية، بشرط إبلاغنا خلال 48 ساعة من تاريخ استلام الطرد.'
  },
  {
    question: 'هل يمكنني تعديل بيانات الطلبية بعد إرسالها؟',
    answer: 'نعم، بإمكانك تعديل العطر أو العنوان أو موعد التسليم عندما يتصل بك موظف خدمة العملاء لتأكيد الطلب، أو بمراسلتنا مباشرة قبل خروج الشحنة للتوزيع.'
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-16 space-y-12">
      
      {/* Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <span className="text-[11px] font-semibold text-[#6E603F] tracking-[0.16em] uppercase">
          الأسئلة الشائعة وسياسة التوصيل
        </span>
        <h1 className="text-2xl sm:text-4xl font-bold text-[#151515]">
          كل ما تحتاج معرفته حول الشحن والدفع
        </h1>
        <p className="text-xs sm:text-sm text-[#77736B] leading-relaxed">
          إليك إجابات واضحة حول آلية التوصيل لكافة الـ 58 ولاية جزائرية، الدفع عند الاستلام، وضمانات المعاينة.
        </p>
      </div>

      {/* Accordion FAQ List */}
      <div className="space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-[#E5E0D5] overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => toggle(idx)}
                className="w-full p-4 sm:p-5 text-right font-semibold text-xs sm:text-sm text-[#151515] flex items-center justify-between gap-4 hover:bg-[#FAF8F5] transition-colors"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#6E603F] shrink-0 transition-transform duration-300 ${
                    isOpen ? 'rotate-180 text-[#151515]' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-[#77736B] leading-relaxed border-t border-[#E5E0D5]/60 whitespace-pre-line animate-in fade-in">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Wilayas Delivery Fee Reference Table */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E5E0D5] space-y-4">
        <div className="flex items-center gap-2 border-b border-[#E5E0D5] pb-3">
          <Truck className="w-4 h-4 text-[#6E603F]" />
          <h2 className="text-sm font-bold text-[#151515]">
            دليل رسوم الشحن ومدة التوصيل لأبرز الولايات
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead>
              <tr className="bg-[#FAF8F5] text-[#77736B] font-semibold">
                <th className="p-2.5 rounded-r-lg">الولاية</th>
                <th className="p-2.5">مدة التوصيل</th>
                <th className="p-2.5 rounded-l-lg">سعر الشحن</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D5]/60 text-[#151515]">
              {ALGERIA_WILAYAS.slice(0, 16).map((w) => (
                <tr key={w.code} className="hover:bg-[#FAF8F5]/50 transition-colors">
                  <td className="p-2.5 font-medium">{w.name_ar}</td>
                  <td className="p-2.5 text-[#77736B]">{w.delivery_time}</td>
                  <td className="p-2.5 font-bold">{w.delivery_fee} دج</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-[#77736B] text-center pt-1">
          * يتم احتساب سعر الشحن تلقائياً لكافة الـ 58 ولاية في صفحة إتمام الطلب عند اختيار ولايتك.
        </p>
      </div>

      {/* Need more help banner */}
      <div className="bg-[#FAF8F5] rounded-3xl p-6 sm:p-8 text-center space-y-4 border border-[#E5E0D5]">
        <h3 className="text-base font-bold text-[#151515]">هل لديك أي استفسار إضافي؟</h3>
        <p className="text-xs text-[#77736B] max-w-md mx-auto">
          فريق خدمة العملاء متواجد للإجابة على استفساراتكم ومرافقتكم في اختيار العطر المناسب.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/contact" className="btn-luxury-primary text-xs flex items-center gap-2">
            <span>تواصل مع خدمة العملاء</span>
            <PhoneCall className="w-3.5 h-3.5" />
          </Link>
          <Link href="/products" className="btn-luxury-outline text-xs flex items-center gap-2">
            <span>تصفح تشكيلة العطور</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

    </div>
  );
}
