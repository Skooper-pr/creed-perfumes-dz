import React from 'react';
import { Loader } from '@/components/Loader';

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader
        text="جاري تحميل أرقى عطور دار Creed الملكية..."
        subtext="خدمة التوصيل السريع متوفرة لكافة الـ 58 ولاية جزائرية"
        size={1}
      />
    </div>
  );
}
