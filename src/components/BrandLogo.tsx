import React, { useState, useEffect } from 'react';
import { DmlStore } from '../lib/store';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSlogan?: boolean;
  lightMode?: boolean;
  brandName?: string;
  slogan?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showSlogan = false,
  lightMode = false,
  brandName: propBrandName,
  slogan: propSlogan,
}) => {
  const [settings, setSettings] = useState(DmlStore.getSettings());

  useEffect(() => {
    const unsub = DmlStore.subscribe(() => {
      setSettings(DmlStore.getSettings());
    });
    return unsub;
  }, []);

  const displayName = propBrandName || settings?.brandName || 'Rumah Dessa Mentari';
  const displaySlogan = propSlogan || settings?.slogan || 'Inspirasi untuk Semua, Karya untuk Dunia.';

  const iconSizes = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const titleSizes = {
    sm: 'text-base font-bold tracking-tight',
    md: 'text-xl font-bold tracking-tight',
    lg: 'text-2xl lg:text-3xl font-extrabold tracking-tight',
  };

  return (
    <div className={`flex items-center gap-3.5 select-none ${className}`}>
      {/* Official Uploaded Logo Image */}
      <div className={`relative flex items-center justify-center rounded-xl overflow-hidden bg-white shadow-xs border border-amber-200/80 shrink-0 p-0.5 ${iconSizes[size]}`}>
        <img
          src="/assets/aistudio/Logo_Rumah_Mentari_dengan_Buku_Terbuka_4cb8855a.png"
          alt={`${displayName} Logo`}
          className="w-full h-full object-contain"
        />
      </div>

      <div className="flex flex-col">
        <span
          className={`font-serif-editorial leading-tight ${titleSizes[size]} ${
            lightMode ? 'text-white' : 'text-[#0F1E36]'
          }`}
        >
          {displayName}
        </span>
        {showSlogan && (
          <span
            className={`text-xs font-semibold tracking-wide ${
              lightMode ? 'text-amber-300' : 'text-amber-700'
            }`}
          >
            {displaySlogan}
          </span>
        )}
      </div>
    </div>
  );
};

