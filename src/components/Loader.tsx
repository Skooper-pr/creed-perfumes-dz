'use client';

import React from 'react';

interface LoaderProps {
  text?: string;
  subtext?: string;
  size?: number;
  royal?: boolean;
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({
  text = 'جاري التحميل...',
  subtext,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center space-y-4 ${className}`} role="status">
      <div className="relative flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-[#E5E0D5] border-t-[#6E603F] animate-spin" />
        <span className="sr-only">جاري التحميل</span>
      </div>
      {text && (
        <p className="text-sm font-medium text-[#151515] tracking-wide">
          {text}
        </p>
      )}
      {subtext && (
        <p className="text-xs text-[#77736B] max-w-xs leading-relaxed">
          {subtext}
        </p>
      )}
    </div>
  );
};

export default Loader;
