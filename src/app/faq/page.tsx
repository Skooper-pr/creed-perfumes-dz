'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Truck, ShieldCheck, Banknote, HelpCircle, PhoneCall, ArrowLeft } from 'lucide-react';
import { ALGERIA_WILAYAS } from '@/data/wilayas';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: 'كيف يعمل نظام الدفع عند الاستلام (COD) في متجر Creed؟',
    answer: 'النظام بسيط ومريح جداً: تختار العطر الذي يعجبك، تملأ بياناتك وعنوانك في نموذج الطلب دون الحاجة لإدخال أي بطاقة بنكية. بعد إرسال الطلب، يتصل بك فريقنا هاتفياً لتأكيد العنوان، ويصلك مندوب التوصيل حتى باب بيتك، تفحص الطرد وتدفع المبلغ المتفق عليه نقداً بالدينار الجزائري (دج).'
  },
  {
    question: 'كم تستغرق مدة التوصيل إلى ولايتي؟',
    answer: 'مدة التوصيل تختلف حسب المنطقة:\n• الجزائر العاصمة وضواحيها (تيبازة، بومرداس، البليدة): من 24 إلى 48 ساعة.\n• الولايات الساحلية والمدن الكبرى (وهران، قسنطينة، عنابة، سطيف، تلمسان، بجاية): 24 إلى 48 ساعة.\n• ولايات الهضاب العليا والداخلية: 48 إلى 72 ساعة.\n• ولايات الجنوب والصحراء الكبرى (ورقلة، أدرار، بشار، تمنراست، إليزي): من 3 إلى 5 أيام عمل.'
  },
  {
    question: 'هل يمكنني فتح الطرد ومعاينته قبل دفع المبلغ للموزع؟',
    answer: 'نعم بالتأكيد! نحرص في Creed Perfumes على الشفافية التامة. يمكنك معاينة العلبة الخارجية والتأكد من سلامة الزجاجة وتطابقها مع طلبك قبل تسليم المبلغ نقداً لمندوب شركة التوصيل.'
  },
  {
    question: 'هل عطوركم أصلية ومضمونة؟',
    answer: 'جميع عطورنا أصلية 100%، مستوردة من الموزعين المعتمدين بتركيز Eau De Parfum الفاخر مع باركود وBatch Code موثق، وتأتي في علبها الملكية المختومة الخاصة بدار كريد العالمية.'
  },
  {
    question: 'ما هي سياسة الاستبدال أو الإرجاع في حال وجود عيب مصنعي؟',
    answer: 'في حال وجود أي كسر ناتج عن الشحن أو خلل في البخاخ (الأتوميزر)، نلتزم باستبدال الزجاجة فوراً مجاناً دون أن تتحمل أي مصاريف إضافية، شريطة التواصل معنا خلال 48 ساعة من تاريخ استلام الطرد.'
  },
  {
    question: 'هل يمكنني تعديل أو إلغاء الطلبية بعد إرسالها؟',
    answer: 'نعم، بإمكانك تعديل العطور أو العنوان أو إلغاء الطلبية عندما يتصل بك موظف خدمة العملاء لتأكيد الطلب، أو بمراسلتنا مباشرة عبر واتساب قبل خروج الشحنة مع الموزع.'
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
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-4 py-1 rounded-full text-xs font-bold">
          <HelpCircle className="w-3.5 h-3.5 text-secondary" />
          <span>الأسئلة المتكررة والتوصيل</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-on-surface">
          كل ما تحتاج معرفته حول الشحن والدفع
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant max-w-lg mx-auto leading-relaxed">
          إليك إجابات شاملة حول سياسة التوصيل لكافة الـ 58 ولاية جزائرية، ضمان الأصالة، والدفع نقداً عند الاستلام.
        </p>
      </div>

      {/* Accordion FAQ List */}
      <div className="space-y-4">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="card-stitch p-0 overflow-hidden border border-primary/10 transition-all duration-200"
            >
              <button
                onClick={() => toggle(idx)}
                className="w-full p-5 text-right font-bold text-sm sm:text-base text-on-surface flex items-center justify-between gap-4 hover:bg-surface-container-low/50 transition-colors"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-primary shrink-0 transition-transform duration-300 ${
                    isOpen ? 'rotate-180 text-secondary' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-on-surface-variant leading-relaxed border-t border-primary/5 whitespace-pre-line animate-in fade-in">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Wilayas Delivery Fee Reference Table */}
      <div className="card-stitch space-y-4">
        <div className="flex items-center gap-2 border-b border-primary/10 pb-3">
          <Truck className="w-5 h-5 text-primary" />
          <h2 className="text-base font-bold text-on-surface">
            دليل رسوم الشحن ومدة التوصيل لبعض الولايات الرئيسية
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-bold">
                <th className="p-3 rounded-r-xl">الولاية</th>
                <th className="p-3">مدة التوصيل</th>
                <th className="p-3 rounded-l-xl">سعر الشحن</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5 text-on-surface">
              {ALGERIA_WILAYAS.slice(0, 16).map((w) => (
                <tr key={w.code} className="hover:bg-surface-container-low/40">
                  <td className="p-3 font-semibold">{w.name_ar}</td>
                  <td className="p-3 text-on-surface-variant">{w.delivery_time}</td>
                  <td className="p-3 font-black text-primary">{w.delivery_fee} دج</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-outline text-center pt-2">
          * يتم حساب سعر الشحن تلقائياً لجميع الـ 58 ولاية في صفحة إتمام الطلب عند اختيار ولايتك.
        </p>
      </div>

      {/* Need more help banner */}
      <div className="bg-surface-container-low rounded-3xl p-6 sm:p-8 text-center space-y-4 border border-primary/5">
        <h3 className="text-lg font-bold text-on-surface">هل لديك أي استفسار آخر؟</h3>
        <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mx-auto">
          فريق خدمة العملاء جاهز للرد على اتصالاتكم ومحادثاتكم يومياً من الساعة 9 صباحاً حتى 8 مساءً.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/contact" className="btn-pill-primary text-xs flex items-center gap-2">
            <span>تواصل مع خدمة العملاء</span>
            <PhoneCall className="w-4 h-4" />
          </Link>
          <Link href="/products" className="btn-pill-outline text-xs flex items-center gap-2">
            <span>تصفح العطور</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>

    </div>
  );
}
