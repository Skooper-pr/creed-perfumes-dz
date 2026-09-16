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
  text = 'جاري تجهيز الشحن والتحميل...',
  subtext,
  size = 1,
  royal = false,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center space-y-4 ${className}`}>
      <div
        className={`loader ${royal ? 'loader-royal' : ''}`}
        style={{ '--size': `${size}px` } as React.CSSProperties}
        role="status"
        aria-label="جاري التحميل"
      />
      {text && (
        <p className="text-sm font-bold text-on-surface animate-pulse">
          {text}
        </p>
      )}
      {subtext && (
        <p className="text-xs text-on-surface-variant max-w-xs leading-relaxed">
          {subtext}
        </p>
      )}
    </div>
  );
};

export default Loader;
